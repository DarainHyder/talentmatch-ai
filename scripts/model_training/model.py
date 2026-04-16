# model.py — NER-only DeBERTa-v3 skill extractor
# Classification is handled by Gemini — no CLS head here.

import torch
import torch.nn as nn
from transformers import DebertaV2Model


class DeBERTaNERModel(nn.Module):
    """
    DeBERTa-v3 with a single NER head for skill extraction.

    Design decisions:
        - .float() cast on backbone output prevents FP16/FP32 clash on T4 GPU
        - Class weights [1.0, 10.0, 5.0] counteract ~98% O token imbalance
        - Label smoothing 0.05 prevents overconfident NER labels
        - No CLS head — gradient interference caused CLS to never converge
          on 2484-sample dataset. Category prediction delegated to Gemini.
    """

    def __init__(self, model_name: str, num_ner_labels: int = 3, dropout: float = 0.1):
        super().__init__()
        self.deberta        = DebertaV2Model.from_pretrained(model_name)
        hidden_size         = self.deberta.config.hidden_size   # 768
        self.ner_dropout    = nn.Dropout(dropout)
        self.ner_classifier = nn.Linear(hidden_size, num_ner_labels)

    def forward(
        self,
        input_ids:      torch.Tensor,          # (B, seq_len)
        attention_mask: torch.Tensor,          # (B, seq_len)
        ner_labels:     torch.Tensor = None,   # (B, seq_len)
    ) -> dict:
        out     = self.deberta(input_ids=input_ids, attention_mask=attention_mask)
        seq_out = out.last_hidden_state.float()   # FP32 cast — critical on T4

        ner_logits = self.ner_classifier(self.ner_dropout(seq_out))

        loss = None
        if ner_labels is not None:
            # Balanced weights — high weights cause degenerate "predict everything as skill"
            # strategy (Recall→1.0, Precision→0.29, F1 stuck at 0.45)
            ner_w = torch.tensor([1.0, 2.0, 1.5], device=ner_logits.device)
            loss  = nn.CrossEntropyLoss(
                weight=ner_w, ignore_index=-100, label_smoothing=0.05
            )(ner_logits.view(-1, ner_logits.shape[-1]), ner_labels.view(-1))

        return {"loss": loss, "ner_logits": ner_logits}
