# dataset_builder.py
# Prepares Resume.csv into a structured PyTorch dataset
# for two tasks:
#   Task A: Category Classification (24 job domains)
#   Task B: Skill Extraction (token-level NER)

import os
import re
import json
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import numpy as np

# ── Constants ──────────────────────────────────────────
MODEL_NAME    = "microsoft/deberta-v3-base"
MAX_LENGTH    = 512        # DeBERTa max; use sliding window for longer
STRIDE        = 128        # overlap for sliding window chunks
BATCH_SIZE    = 8
RANDOM_SEED   = 42

# ── Skill vocabulary ───────────────────────────────────
# Expanded vocabulary to cover all 24 job domains in the dataset.
SKILL_VOCAB = [
    # ── Information Technology & Engineering ──
    "python", "java", "javascript", "typescript", "c++", "c#", "r", "sql", "nosql", "aws", "azure", 
    "docker", "kubernetes", "react", "angular", "node.js", "machine learning", "data science", 
    "cybersecurity", "linux", "cad", "autocad", "solidworks", "matlab", "embedded systems", "qa",
    
    # ── Finance, Banking & Accounting ──
    "accounting", "tax preparation", "financial analysis", "auditing", "bookkeeping", "payroll", 
    "quickbooks", "excel", "risk management", "investment banking", "portfolio management", 
    "reconciliation", "financial reporting", "anti-money laundering", "aml", "kyc",
    
    # ── HR, Sales & Business Development ──
    "recruitment", "talent acquisition", "employee relations", "onboarding", "performance management", 
    "salesforce", "b2b sales", "b2c sales", "lead generation", "negotiation", "crm", "cold calling",
    "market research", "strategic planning", "vendor management", "key account management",
    
    # ── Healthcare & Fitness ──
    "patient care", "cpr", "bls", "acls", "nursing", "medical terminology", "vital signs", 
    "emr", "ehr", "clinical research", "phlebotomy", "personal training", "nutrition", 
    "kinesiology", "physical therapy", "rehabilitation",
    
    # ── Arts, Designer & Digital Media ──
    "graphic design", "ui/ux design", "adobe creative suite", "photoshop", "illustrator", "indesign", 
    "figma", "video editing", "premiere pro", "animation", "copywriting", "seo", "social media marketing", 
    "content creation", "typography", "branding", "web design",
    
    # ── Aviation & Automobile ──
    "aircraft maintenance", "flight safety", "aviation security", "piloting", "aerodynamics", 
    "automotive repair", "engine diagnostics", "mechanic", "fleet management", "supply chain",
    
    # ── Education, Teacher & Advocate ──
    "curriculum development", "lesson planning", "special education", "classroom management", 
    "tutoring", "instructional design", "legal research", "litigation", "contract drafting", 
    "corporate law", "mediation", "legal compliance", "case management",
    
    # ── Construction, Chef & Agriculture ──
    "project management", "osha compliance", "blueprints", "carpentry", "plumbing", "electrical wiring",
    "culinary arts", "food safety", "menu planning", "inventory management", "catering", 
    "agronomy", "crop management", "pest control", "agricultural economics", "sustainability",
    
    # ── BPO, PR & Consultant ──
    "customer service", "call center operations", "troubleshooting", "data entry", "inbound routing",
    "public relations", "press releases", "media relations", "event planning", "crisis management",
    "management consulting", "business strategy", "process improvement", "six sigma", "agile", "scrum"
]

# NER label scheme: BIO tagging
# B-SKILL = beginning of skill mention
# I-SKILL = inside skill mention
# O       = not a skill
NER_LABELS     = ["O", "B-SKILL", "I-SKILL"]
NER_LABEL2ID   = {l: i for i, l in enumerate(NER_LABELS)}
NER_ID2LABEL   = {i: l for l, i in NER_LABEL2ID.items()}


def clean_text(text: str) -> str:
    """Remove HTML, excessive whitespace, non-ASCII garbage."""
    text = re.sub(r'<[^>]+>', ' ', text)          # strip HTML tags
    text = re.sub(r'http\S+|www\S+', ' ', text)   # remove URLs
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)    # remove non-ASCII
    text = re.sub(r'\s+', ' ', text).strip()       # collapse whitespace
    return text.lower()


def bio_tag_text(text: str, tokenizer, skill_vocab: list) -> dict:
    """
    Given cleaned resume text and a tokenizer, produce:
      - input_ids, attention_mask
      - ner_labels aligned to subword tokens
    Uses sliding window chunking for texts > MAX_LENGTH.
    """
    # Tokenize with offset mapping so we can align labels to chars
    encoding = tokenizer(
        text,
        max_length=MAX_LENGTH,
        truncation=True,
        stride=STRIDE,
        return_overflowing_tokens=True,
        return_offsets_mapping=True,
        padding="max_length",
        return_tensors="pt",
    )

    all_input_ids      = encoding["input_ids"]           # (chunks, seq_len)
    all_attention_mask = encoding["attention_mask"]
    all_offset_mapping = encoding["offset_mapping"]      # char spans per token

    # Build character-level label array from skill_vocab matches
    char_labels = np.zeros(len(text), dtype=np.int8)     # default O=0
    for skill in skill_vocab:
        for match in re.finditer(re.escape(skill), text):
            start, end = match.start(), match.end()
            char_labels[start]       = NER_LABEL2ID["B-SKILL"]
            char_labels[start+1:end] = NER_LABEL2ID["I-SKILL"]

    # Align char-level labels to subword tokens per chunk
    all_ner_labels = []
    for offset_map in all_offset_mapping:
        chunk_labels = []
        for (char_start, char_end) in offset_map.tolist():
            if char_start == 0 and char_end == 0:
                # Special token ([CLS], [SEP], [PAD])
                chunk_labels.append(-100)  # ignored in loss
            else:
                chunk_labels.append(int(char_labels[char_start]))
        all_ner_labels.append(chunk_labels)

    return {
        "input_ids":       all_input_ids,
        "attention_mask":  all_attention_mask,
        "ner_labels":      torch.tensor(all_ner_labels, dtype=torch.long),
    }


class ResumeDataset(Dataset):
    """
    PyTorch Dataset for Resume.csv.
    Handles both:
      - Classification head  (Resume Category → 24 classes)
      - NER head             (Token-level skill tagging)
    """

    def __init__(
        self,
        dataframe: pd.DataFrame,
        tokenizer,
        label_encoder: LabelEncoder,
        skill_vocab: list = SKILL_VOCAB,
        max_length: int   = MAX_LENGTH,
    ):
        self.df            = dataframe.reset_index(drop=True)
        self.tokenizer     = tokenizer
        self.label_encoder = label_encoder
        self.skill_vocab   = skill_vocab
        self.max_length    = max_length

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row  = self.df.iloc[idx]
        text = clean_text(str(row["Resume_str"]))

        # ── Classification label ──────────────────────────
        category    = str(row["Category"]).strip().upper()
        class_label = int(self.label_encoder.transform([category])[0])

        # ── Tokenize (take only first chunk for training) ─
        encoding = self.tokenizer(
            text,
            max_length=self.max_length,
            truncation=True,
            padding="max_length",
            return_offsets_mapping=True,
            return_tensors="pt",
        )

        input_ids      = encoding["input_ids"].squeeze(0)
        attention_mask = encoding["attention_mask"].squeeze(0)
        offset_mapping = encoding["offset_mapping"].squeeze(0)

        # ── NER labels aligned to tokens ─────────────────
        char_labels = np.zeros(len(text), dtype=np.int8)
        for skill in self.skill_vocab:
            for match in re.finditer(re.escape(skill), text):
                s, e = match.start(), match.end()
                char_labels[s]     = NER_LABEL2ID["B-SKILL"]
                char_labels[s+1:e] = NER_LABEL2ID["I-SKILL"]

        ner_labels = []
        for (cs, ce) in offset_mapping.tolist():
            if cs == 0 and ce == 0:
                ner_labels.append(-100)
            else:
                # Bulletproof character-to-token alignment for SentencePiece
                token_labels = char_labels[cs:ce]
                if NER_LABEL2ID["B-SKILL"] in token_labels:
                    ner_labels.append(NER_LABEL2ID["B-SKILL"])
                elif NER_LABEL2ID["I-SKILL"] in token_labels:
                    ner_labels.append(NER_LABEL2ID["I-SKILL"])
                else:
                    ner_labels.append(NER_LABEL2ID["O"])

        return {
            "input_ids":       input_ids,
            "attention_mask":  attention_mask,
            "ner_labels":      torch.tensor(ner_labels, dtype=torch.long),
            "class_label":     torch.tensor(class_label, dtype=torch.long),
        }


def build_dataloaders(csv_path: str, tokenizer):
    """
    Load Resume.csv, encode labels, split train/val,
    return DataLoaders ready for training.
    """
    print(f"Loading dataset from {csv_path} ...")
    df = pd.read_csv(csv_path)

    # Validate required columns
    required = {"Resume_str", "Category"}
    assert required.issubset(df.columns), \
        f"CSV missing columns: {required - set(df.columns)}"

    # Drop rows with missing text or category
    df = df.dropna(subset=["Resume_str", "Category"])
    df["Category"] = df["Category"].str.strip().str.upper()

    print(f"Total samples: {len(df)}")
    print(f"Categories ({df['Category'].nunique()}): "
          f"{sorted(df['Category'].unique())}")

    # Encode category labels
    le = LabelEncoder()
    le.fit(df["Category"])
    num_classes = len(le.classes_)
    print(f"Num classification classes: {num_classes}")

    # Save label encoder classes for inference
    os.makedirs("model_output", exist_ok=True)
    with open("model_output/label_classes.json", "w") as f:
        json.dump(le.classes_.tolist(), f)

    # Train / validation split (80/20, stratified)
    train_df, val_df = train_test_split(
        df,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=df["Category"],
    )
    print(f"Train: {len(train_df)} | Val: {len(val_df)}")

    train_ds = ResumeDataset(train_df, tokenizer, le)
    val_ds   = ResumeDataset(val_df,   tokenizer, le)

    train_loader = DataLoader(
        train_ds,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=2,
        pin_memory=True,
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=2,
        pin_memory=True,
    )

    return train_loader, val_loader, num_classes, le
