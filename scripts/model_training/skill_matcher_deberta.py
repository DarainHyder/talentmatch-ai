# skill_matcher_deberta.py
# Production inference — drop-in replacement for skill_matcher.py
# Uses the trained DeBERTa NER model to extract skills from resumes.
# Category prediction is kept as Gemini's responsibility (it's more accurate).
#
# SETUP: After Kaggle training, download model_output/ folder and place at:
#        talentmatch-main/model_output/
#        (contains: best_model.pt, tokenizer files, label_classes.json)

import os
import re
import json
import torch

try:
    from transformers import AutoTokenizer, DebertaV2Model
    import torch.nn as nn
    _DEPS_OK = True
except ImportError:
    _DEPS_OK = False

MODEL_NAME = "microsoft/deberta-v3-base"
MAX_LENGTH = 512
STRIDE     = 128
MODEL_DIR  = os.path.join(os.path.dirname(__file__), "..", "..", "model_output")

NER_LABELS   = ["O", "B-SKILL", "I-SKILL"]
NER_LABEL2ID = {l: i for i, l in enumerate(NER_LABELS)}
NER_ID2LABEL = {i: l for l, i in NER_LABEL2ID.items()}

# ── Singleton — loaded once on first call ─────────────────────────────────────
_model     = None
_tokenizer = None


def _is_available() -> bool:
    return _DEPS_OK and os.path.exists(os.path.join(MODEL_DIR, "best_model.pt"))


class _DeBERTaNERModel(nn.Module):
    def __init__(self, model_name, dropout=0.1):
        super().__init__()
        self.deberta        = DebertaV2Model.from_pretrained(model_name)
        h                   = self.deberta.config.hidden_size
        self.ner_dropout    = nn.Dropout(dropout)
        self.ner_classifier = nn.Linear(h, 3)

    def forward(self, input_ids, attention_mask):
        out = self.deberta(input_ids=input_ids, attention_mask=attention_mask)
        return self.ner_classifier(self.ner_dropout(out.last_hidden_state.float()))


def _load():
    global _model, _tokenizer
    if _model is not None:
        return True
    if not _is_available():
        return False

    _tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    ckpt       = torch.load(os.path.join(MODEL_DIR, "best_model.pt"), map_location="cpu")
    _model     = _DeBERTaNERModel(MODEL_NAME)
    _model.load_state_dict(ckpt["model_state"])
    _model.eval()
    print("[DeBERTa] NER model loaded.")
    return True


def clean_text(text: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'http\S+|www\S+', ' ', text)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text.lower()


def _decode_ner(text: str, logits: torch.Tensor, offsets) -> list:
    """Convert per-token NER logits back to skill strings."""
    preds    = logits.argmax(-1).squeeze(0).tolist()
    offsets  = offsets.squeeze(0).tolist()
    skills, current = [], ""

    for pred, (cs, ce) in zip(preds, offsets):
        if cs == 0 and ce == 0:
            if current.strip():
                skills.append(current.strip())
            current = ""
            continue
        label = NER_ID2LABEL[pred]
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

    # Deduplicate and filter noise
    seen, out = set(), []
    for s in skills:
        s = s.strip().lower()
        if len(s) > 2 and s not in seen:
            seen.add(s)
            out.append(s)
    return out


def extract_skills_deberta(cv_text: str) -> list:
    """
    Run DeBERTa NER on a resume and return a list of extracted skill strings.
    Returns empty list if model is not loaded / not available.
    """
    if not _load():
        return []

    text     = clean_text(cv_text)
    encoding = _tokenizer(
        text, max_length=MAX_LENGTH, truncation=True,
        stride=STRIDE, return_overflowing_tokens=True,
        return_offsets_mapping=True, padding="max_length", return_tensors="pt"
    )

    all_skills = []
    with torch.no_grad():
        for i in range(encoding["input_ids"].shape[0]):
            ids   = encoding["input_ids"][i].unsqueeze(0)
            mask  = encoding["attention_mask"][i].unsqueeze(0)
            off   = encoding["offset_mapping"][i].unsqueeze(0)
            logits = _model(ids, mask)
            all_skills.extend(_decode_ner(text, logits, off))

    # Final dedup across chunks
    seen, final = set(), []
    for s in all_skills:
        if s not in seen:
            seen.add(s)
            final.append(s)
    return final


def match_skills(cv_text: str, required_skills: list, job_description: str = "") -> dict:
    """
    Drop-in replacement for skill_matcher.match_skills().
    Returns same dict structure so the rest of the app works unchanged.
    """
    all_skills = extract_skills_deberta(cv_text)

    if not all_skills:
        # Graceful fallback if model not loaded
        return {
            "matched_skills":       [],
            "missing_skills":       required_skills,
            "all_extracted_skills": [],
            "skill_match_percent":  0.0,
            "cv_score":             0.0,
            "predicted_category":   "UNKNOWN",
        }

    req_lower = [s.strip().lower() for s in required_skills]
    matched   = [s for s in all_skills if any(r in s or s in r for r in req_lower)]
    missing   = [r for r in req_lower  if not any(r in s or s in r for s in all_skills)]
    match_pct = (len(matched) / len(req_lower) * 100) if req_lower else 50.0
    cv_score  = min(match_pct * 0.9, 100.0)

    return {
        "matched_skills":       matched,
        "missing_skills":       missing,
        "all_extracted_skills": all_skills,
        "skill_match_percent":  round(match_pct, 2),
        "cv_score":             round(cv_score, 2),
        "predicted_category":   "SEE_GEMINI",   # Gemini handles category prediction
    }


def is_qualified(cv_score: float, threshold: float = 30.0) -> bool:
    return cv_score >= threshold
