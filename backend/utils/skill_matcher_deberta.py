"""
skill_matcher_deberta.py
------------------------
Production inference module for the trained DeBERTa-v3 NER model.
Extracts skill entities from raw CV text.

Model lives at:  scripts/model_training/model_output/best_model.pt
                 scripts/model_training/model_output/tokenizer.json
                 scripts/model_training/model_output/label_classes.json

NER F1: 0.6276  |  Precision: 0.4883  |  Recall: 0.8782

Design:
  - Lazy-loaded singleton — model loads ONCE on first call, stays in memory
  - Graceful fallback — if model files or torch are missing, returns empty list
  - CPU inference only — safe for PythonAnywhere / any server without GPU
"""

import os
import re
import logging

logger = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────────────────────
# This file:  backend/utils/skill_matcher_deberta.py
# Model:      scripts/model_training/model_output/
_THIS_DIR  = os.path.dirname(os.path.abspath(__file__))
_MODEL_DIR = os.path.normpath(
    os.path.join(_THIS_DIR, "..", "..", "scripts", "model_training", "model_output")
)
_CKPT_PATH = os.path.join(_MODEL_DIR, "best_model.pt")

# NER label mapping (must match training exactly)
_NER_ID2LABEL = {0: "O", 1: "B-SKILL", 2: "I-SKILL"}

MAX_LENGTH = 512
STRIDE     = 128

# ── Singletons ─────────────────────────────────────────────────────────────────
_model     = None
_tokenizer = None
_DEVICE    = None
_AVAILABLE = None   # None = unchecked, True/False after first check


def _check_available() -> bool:
    """Returns True if model files + torch + transformers are present."""
    global _AVAILABLE
    if _AVAILABLE is not None:
        return _AVAILABLE

    if not os.path.exists(_CKPT_PATH):
        logger.warning(f"[DeBERTa] Model not found at {_CKPT_PATH}. Skill extraction disabled.")
        _AVAILABLE = False
        return False
    try:
        import torch          # noqa
        import torch.nn       # noqa
        from transformers import AutoTokenizer, DebertaV2Config, DebertaV2Model  # noqa
        _AVAILABLE = True
    except ImportError as e:
        logger.warning(f"[DeBERTa] torch/transformers not installed ({e}). Skill extraction disabled.")
        _AVAILABLE = False
    return _AVAILABLE


# ── Model definition (must match training architecture exactly) ─────────────────
def _build_model():
    """Build model architecture without downloading backbone weights."""
    import torch.nn as nn
    from transformers import DebertaV2Config, DebertaV2Model

    class _DeBERTaNERModel(nn.Module):
        def __init__(self, config):
            super().__init__()
            # Random-init backbone — weights loaded from checkpoint below
            self.deberta        = DebertaV2Model(config)
            self.ner_dropout    = nn.Dropout(0.1)
            self.ner_classifier = nn.Linear(config.hidden_size, 3)

        def forward(self, input_ids, attention_mask):
            out    = self.deberta(input_ids=input_ids, attention_mask=attention_mask)
            seq    = out.last_hidden_state.float()  # FP32 — safe on CPU
            return self.ner_classifier(self.ner_dropout(seq))

    # DeBERTa-v3-base config — downloaded once (~2 KB), no model weights downloaded
    try:
        config = DebertaV2Config.from_pretrained("microsoft/deberta-v3-base")
    except Exception:
        # Offline fallback: hardcoded deberta-v3-base config
        config = DebertaV2Config(
            hidden_size=768, num_hidden_layers=12, num_attention_heads=12,
            intermediate_size=3072, hidden_act="gelu", hidden_dropout_prob=0.1,
            attention_probs_dropout_prob=0.1, max_position_embeddings=512,
            type_vocab_size=0, relative_attention=True, max_relative_positions=-1,
            pad_token_id=0, position_biased_input=False,
            pos_att_type=["p2c", "c2p"], vocab_size=128100,
        )
    return _DeBERTaNERModel(config)


def _load() -> bool:
    """Lazy-load tokenizer + model weights. Returns True on success."""
    global _model, _tokenizer, _DEVICE

    if _model is not None:
        return True
    if not _check_available():
        return False

    try:
        import torch
        from transformers import AutoTokenizer

        _DEVICE    = torch.device("cpu")   # CPU only — no GPU assumed in production
        _tokenizer = AutoTokenizer.from_pretrained(_MODEL_DIR)

        ckpt   = torch.load(_CKPT_PATH, map_location="cpu")
        _model = _build_model()
        _model.load_state_dict(ckpt["model_state"])
        _model.eval()
        logger.info(f"[DeBERTa] NER model loaded from {_MODEL_DIR}  (F1=0.6276)")
        return True

    except Exception as e:
        logger.error(f"[DeBERTa] Failed to load model: {e}")
        return False


# ── Text cleaning (must match training preprocessing) ─────────────────────────
def _clean(text: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'http\S+|www\S+', ' ', text)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text.lower()


# ── Span decoder ───────────────────────────────────────────────────────────────
def _decode_spans(text: str, logits, offsets) -> list:
    """Convert per-token NER logits → skill string list."""
    import torch   # already imported by caller
    preds   = logits.argmax(-1).squeeze(0).tolist()
    offsets = offsets.squeeze(0).tolist()

    skills, current = [], ""
    for pred, (cs, ce) in zip(preds, offsets):
        if cs == 0 and ce == 0:         # special token
            if current.strip():
                skills.append(current.strip())
            current = ""
            continue
        label = _NER_ID2LABEL[pred]
        span  = text[cs:ce]
        if label == "B-SKILL":
            if current.strip():
                skills.append(current.strip())
            current = span
        elif label == "I-SKILL" and current:
            current += span
        else:
            if current.strip():
                skills.append(current.strip())
            current = ""
    if current.strip():
        skills.append(current.strip())

    # Deduplicate + filter noise
    seen, out = set(), []
    for s in skills:
        s = s.strip().lower()
        if len(s) > 2 and s not in seen:
            seen.add(s)
            out.append(s)
    return out


# ── Public API ─────────────────────────────────────────────────────────────────
def extract_skills(cv_text: str) -> list:
    """
    Run DeBERTa NER on a CV and return a deduplicated list of skill strings.

    Returns:
        list[str] — e.g. ["python", "machine learning", "patient care"]
        Empty list if model is unavailable or inference fails.
    """
    if not _load():
        return []

    try:
        import torch
        text = _clean(cv_text)

        enc = _tokenizer(
            text,
            max_length=MAX_LENGTH,
            truncation=True,
            stride=STRIDE,
            return_overflowing_tokens=True,
            return_offsets_mapping=True,
            padding="max_length",
            return_tensors="pt",
        )

        all_skills = []
        n_chunks   = enc["input_ids"].shape[0]

        with torch.no_grad():
            for i in range(n_chunks):
                ids    = enc["input_ids"][i].unsqueeze(0)
                mask   = enc["attention_mask"][i].unsqueeze(0)
                offsets = enc["offset_mapping"][i].unsqueeze(0)
                logits = _model(ids, mask)   # (1, seq_len, 3)
                all_skills.extend(_decode_spans(text, logits, offsets))

        # Final cross-chunk dedup
        seen, final = set(), []
        for s in all_skills:
            if s not in seen:
                seen.add(s)
                final.append(s)

        return final

    except Exception as e:
        logger.error(f"[DeBERTa] Inference error: {e}")
        return []


def is_available() -> bool:
    """Check whether the DeBERTa model is loaded and ready."""
    return _check_available()
