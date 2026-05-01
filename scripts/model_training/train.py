# train.py
# Complete training script with:
#   - AdamW + linear warmup scheduler
#   - Mixed precision (fp16) for speed
#   - Gradient accumulation for large effective batch size
#   - Early stopping
#   - Checkpoint saving

import os
import json
import torch
import numpy as np
from torch.cuda.amp import GradScaler, autocast
from transformers import AutoTokenizer, get_linear_schedule_with_warmup
from torch.optim import AdamW
from seqeval.metrics import f1_score as ner_f1
from sklearn.metrics import accuracy_score
from tqdm import tqdm

from model import DeBERTaRecruitmentModel
from dataset_builder import (
    build_dataloaders,
    NER_ID2LABEL,
    MODEL_NAME,
)

# ── Hyperparameters ────────────────────────────────────
EPOCHS              = 10
LEARNING_RATE       = 5e-5      # safe for DeBERTa fine-tuning
WEIGHT_DECAY        = 0.01
WARMUP_RATIO        = 0.1       # 10% of steps for warmup
GRAD_ACCUM_STEPS    = 1         # effective batch = 8 * 4 = 32
MAX_GRAD_NORM       = 1.0
PATIENCE            = 2         # early stopping patience
OUTPUT_DIR          = "model_output"
CSV_PATH            = "../../dataset/resume_dataset/Resume/Resume.csv"

os.makedirs(OUTPUT_DIR, exist_ok=True)
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Training on: {DEVICE}")


def evaluate(model, loader, device):
    """
    Returns:
      - avg loss
      - NER F1 (seqeval, entity-level)
      - Classification accuracy
    """
    model.eval()
    total_loss  = 0.0
    all_ner_preds, all_ner_labels = [], []
    all_cls_preds, all_cls_labels = [], []

    with torch.no_grad():
        for batch in tqdm(loader, desc="Evaluating", leave=False):
            input_ids      = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            ner_labels     = batch["ner_labels"].to(device)
            class_label    = batch["class_label"].to(device)

            out  = model(input_ids, attention_mask,
                         ner_labels, class_label)
            loss = out["loss"]
            total_loss += loss.item()

            # ── NER predictions ───────────────────────────
            ner_pred_ids = out["ner_logits"].argmax(-1).cpu().numpy()
            ner_true_ids = ner_labels.cpu().numpy()

            for pred_row, true_row in zip(ner_pred_ids, ner_true_ids):
                pred_seq, true_seq = [], []
                for p, t in zip(pred_row, true_row):
                    if t == -100:        # skip special tokens
                        continue
                    pred_seq.append(NER_ID2LABEL[p])
                    true_seq.append(NER_ID2LABEL[t])
                all_ner_preds.append(pred_seq)
                all_ner_labels.append(true_seq)

            # ── Classification predictions ────────────────
            cls_preds = out["cls_logits"].argmax(-1).cpu().numpy()
            cls_true  = class_label.cpu().numpy()
            all_cls_preds.extend(cls_preds.tolist())
            all_cls_labels.extend(cls_true.tolist())

    avg_loss   = total_loss / len(loader)
    ner_score  = ner_f1(all_ner_labels, all_ner_preds)
    cls_acc    = accuracy_score(all_cls_labels, all_cls_preds)

    return avg_loss, ner_score, cls_acc


def train():
    # ── Tokenizer ─────────────────────────────────────
    print(f"Loading tokenizer: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    # ── Data ──────────────────────────────────────────
    train_loader, val_loader, num_classes, le = \
        build_dataloaders(CSV_PATH, tokenizer)

    # ── Model ─────────────────────────────────────────
    print(f"Initializing model with {num_classes} classes ...")
    model = DeBERTaRecruitmentModel(
        model_name=MODEL_NAME,
        num_classes=num_classes,
    ).to(DEVICE)

    # ── Optimizer ─────────────────────────────────────
    # Unified, reliable optimizer for the entire model
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY, eps=1e-6)

    # ── Scheduler ─────────────────────────────────────
    total_steps  = (len(train_loader) // GRAD_ACCUM_STEPS) * EPOCHS
    warmup_steps = int(total_steps * WARMUP_RATIO)
    scheduler    = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=warmup_steps,
        num_training_steps=total_steps,
    )

    # ── Removed GradScaler to bypass FP16 Gradient errors with DeBERTa ──
    best_ner_f1  = 0.0
    patience_ctr = 0
    history      = []

    print(f"Total steps: {total_steps} | Warmup: {warmup_steps}")
    print("=" * 60)

    for epoch in range(1, EPOCHS + 1):
        # ── Training loop ─────────────────────────────
        model.train()
        train_loss   = 0.0
        optimizer.zero_grad()

        for step, batch in enumerate(
            tqdm(train_loader, desc=f"Epoch {epoch}/{EPOCHS}")
        ):
            input_ids      = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            ner_labels     = batch["ner_labels"].to(DEVICE)
            class_label    = batch["class_label"].to(DEVICE)

            # Forward pass entirely in stable FP32
            out  = model(input_ids, attention_mask,
                         ner_labels, class_label)
            loss = out["loss"] / GRAD_ACCUM_STEPS

            loss.backward()
            train_loss += loss.item() * GRAD_ACCUM_STEPS

            if (step + 1) % GRAD_ACCUM_STEPS == 0:
                torch.nn.utils.clip_grad_norm_(
                    model.parameters(), MAX_GRAD_NORM
                )
                optimizer.step()
                scheduler.step()
                optimizer.zero_grad()

        avg_train_loss = train_loss / len(train_loader)

        # ── Validation ────────────────────────────────
        val_loss, ner_score, cls_acc = evaluate(
            model, val_loader, DEVICE
        )

        print(
            f"Epoch {epoch} | "
            f"Train Loss: {avg_train_loss:.4f} | "
            f"Val Loss: {val_loss:.4f} | "
            f"NER F1: {ner_score:.4f} | "
            f"CLS Acc: {cls_acc:.4f}"
        )

        history.append({
            "epoch": epoch,
            "train_loss": avg_train_loss,
            "val_loss": val_loss,
            "ner_f1": ner_score,
            "cls_acc": cls_acc,
        })

        # ── Save best checkpoint ───────────────────────
        if ner_score > best_ner_f1:
            best_ner_f1  = ner_score
            patience_ctr = 0
            ckpt_path    = os.path.join(OUTPUT_DIR, "best_model.pt")
            torch.save({
                "epoch":       epoch,
                "model_state": model.state_dict(),
                "ner_f1":      ner_score,
                "cls_acc":     cls_acc,
                "num_classes": num_classes,
            }, ckpt_path)
            tokenizer.save_pretrained(OUTPUT_DIR)
            print(f"  ✓ Saved best checkpoint (NER F1: {ner_score:.4f})")
        else:
            patience_ctr += 1
            print(f"  No improvement. Patience: {patience_ctr}/{PATIENCE}")
            if patience_ctr >= PATIENCE:
                print("Early stopping triggered.")
                break

    # Save training history
    with open(os.path.join(OUTPUT_DIR, "history.json"), "w") as f:
        json.dump(history, f, indent=2)
    print(f"\nTraining complete. Best NER F1: {best_ner_f1:.4f}")


if __name__ == "__main__":
    train()
