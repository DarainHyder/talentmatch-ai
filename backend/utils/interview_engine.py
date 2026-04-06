"""
interview_engine.py
-------------------
Handles question generation (Gemini API) and answer scoring (local NLP).

Gemini is used ONLY for generating interview questions.
All scoring/evaluation uses spaCy + pure Python algorithms — no API key needed.
"""

import os
import json
import random
from typing import List, Dict

# ---------------------------------------------------------------------------
# Fallback question bank — used when Gemini is unavailable
# ---------------------------------------------------------------------------

_DEFAULT_QUESTIONS = [
    "Tell me about yourself and your professional background.",
    "What motivated you to apply for this role?",
    "Describe a challenging technical problem you solved recently.",
    "How do you approach learning new technologies or frameworks?",
    "Give an example of a project where you worked in a team. What was your role?",
    "What is your greatest professional achievement so far?",
    "How do you handle tight deadlines and competing priorities?",
    "Where do you see yourself professionally in the next 3–5 years?",
]

# ---------------------------------------------------------------------------
# Follow-up pool — returned randomly, no API needed
# ---------------------------------------------------------------------------

_FOLLOWUP_POOL = [
    "Could you elaborate more on that?",
    "Can you give a specific example from your experience?",
    "What was the outcome of that situation?",
    "How did that experience shape your approach?",
]

# ---------------------------------------------------------------------------
# Keyword list for answer scoring
# ---------------------------------------------------------------------------

_POSITIVE_KEYWORDS = {
    "led", "built", "improved", "achieved", "managed", "developed",
    "solved", "designed", "implemented", "optimized", "delivered",
    "collaborated", "analyzed", "created", "increased", "reduced",
}

# ---------------------------------------------------------------------------
# Lazy spaCy loader
# ---------------------------------------------------------------------------

_nlp = None


def _get_nlp():
    global _nlp
    if _nlp is None:
        import spacy
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise RuntimeError(
                "spaCy model not found. Run: python -m spacy download en_core_web_sm"
            )
    return _nlp


# ===========================================================================
# AI DETECTION & SMART FOLLOW-UPS
# ===========================================================================

def detect_ai_content(text: str) -> bool:
    """
    Highly efficient Python heuristic to detect ChatGPT-style generated text.
    Relies on identifying transition phrases and "fluff" vocabulary dense in LLMs.
    """
    text_lower = text.lower()
    
    # 1. Hard markers (instant fail)
    hard_markers = ["as an ai", "i am an ai", "language model", "as a large"]
    if any(m in text_lower for m in hard_markers):
        return True
        
    # 2. Soft markers (density check)
    soft_markers = [
        "delve into", "multifaceted", "plethora", "testament to", 
        "underscore the importance", "in conclusion,", "ultimately,",
        "it is important to note", "worth noting", "seamless integration", 
        "aligns perfectly", "fostering", "vital role", "by streamlining",
        "comprehensive", "robust", "realm of", "intricate"
    ]
    
    hits = sum(1 for m in soft_markers if m in text_lower)
    word_count = len(text_lower.split())
    
    if word_count > 0:
        # If there are multiple known LLM buzzwords concentrated in a short text
        if hits >= 3 or (hits >= 2 and (hits / word_count) > 0.04):
            return True
            
    return False


# ===========================================================================
# QUESTION GENERATION  (Gemini API)
# ===========================================================================

def generate_questions(
    cv_text: str,
    job_title: str,
    job_description: str,
    matched_skills: List[str],
) -> List[str]:
    """
    Generate 6 personalised interview questions via Gemini API.

    Falls back to _DEFAULT_QUESTIONS if:
    - GEMINI_API_KEY is not set
    - API quota is exceeded
    - Any other Gemini error occurs

    Returns
    -------
    list of 6 question strings
    """
    api_key_str = os.getenv("GEMINI_API_KEY", "").strip()
    api_keys = [k.strip() for k in api_key_str.split(",") if k.strip()]

    if not api_keys:
        print("[interview_engine] GEMINI_API_KEY not set — using default questions.")
        return _DEFAULT_QUESTIONS[:6]

    skills_str = ", ".join(matched_skills) if matched_skills else "general skills"
    cv_snippet = cv_text[:500].replace("\n", " ")

    prompt = f"""You are a technical recruiter. Given this candidate's CV and job description, generate exactly 6 interview questions.

Job Title: {job_title}
Job Description: {job_description}
Candidate's matched skills: {skills_str}
CV Summary: {cv_snippet}

Rules:
- Questions must be specific to this candidate's background
- Mix technical and behavioral questions
- Return ONLY a JSON array of 6 question strings, nothing else
- Example format: ["Question 1?", "Question 2?", ...]"""

    for attempt, key in enumerate(api_keys):
        try:
            from google import genai
            import json
            
            client = genai.Client(api_key=key)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            
            raw_text = response.text.strip()
            # Strip markdown blocks if present
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_text:
                raw_text = raw_text.split("```")[1].split("```")[0].strip()
            
            questions = json.loads(raw_text)
            if isinstance(questions, list) and len(questions) > 0:
                print(f"[interview_engine] Generated {len(questions)} questions using Gemini-2.0.")
                
                # Normalise: ensure we always have exactly 6
                questions = [str(q) for q in questions if str(q).strip()]
                if len(questions) < 6:
                    questions += _DEFAULT_QUESTIONS[: 6 - len(questions)]
                return questions[:6]
        except Exception as e:
            err_msg = str(e).lower()
            if "429" in err_msg or "quota" in err_msg or "exhausted" in err_msg:
                if attempt < len(api_keys) - 1:
                    print(f"[interview_engine] Key {attempt+1} exhausted. Trying next key...")
                    continue
                else:
                    print("[interview_engine] All Gemini keys exhausted! Falling back to default questions.")
                    return _DEFAULT_QUESTIONS[:6]
            else:
                print(f"[interview_engine] Gemini error: {e} — falling back to default questions.")
                return _DEFAULT_QUESTIONS[:6]
                
    return _DEFAULT_QUESTIONS[:6]


def needs_followup(answer_text: str) -> bool:
    """
    Returns True if the candidate's answer is too short (< 20 words) 
    OR if it's vague "fluff" (moderate length but zero technical keywords).
    """
    word_count = len(answer_text.strip().split())
    if word_count < 20:
        return True
        
    # Check for "vague fluff" — text the user typed out but contains zero actual data
    nlp = _get_nlp()
    doc = nlp(answer_text.strip().lower())
    tokens_lower = {t.lemma_ for t in doc if t.is_alpha}
    keyword_hits = len(tokens_lower & _POSITIVE_KEYWORDS)
    
    # If it's less than 50 words and contains absolutely NO action/technical keywords, they are being vague
    if word_count < 50 and keyword_hits == 0:
        return True
        
    return False


def get_followup(answer_text: str = "") -> str:
    """
    Return a contextual follow-up prompt based on WHY they failed the check.
    """
    word_count = len(answer_text.strip().split())
    
    if word_count < 20:
        return random.choice([
            "Could you expand on that with a bit more detail?",
            "That's a bit brief—could you provide a more structured example?",
            "Can you elaborate further? I'd love to hear more depth in your answer.",
        ])
        
    return random.choice([
        "I see your point, but could you specify the exact technical tools or methodologies you used?",
        "Could you walk me through the specific technical steps you took to achieve that?",
        "That sounds interesting. What specific metrics, frameworks, or actions were involved?"
    ])


# ===========================================================================
# ANSWER SCORING  (pure NLP — no API)
# ===========================================================================

def score_answer(answer_text: str) -> dict:
    """
    Score a single interview answer using three heuristics via spaCy.

    Components (max 100 points total):
    ┌────────────────────┬───────────────────────────────────────────┬────────┐
    │ Component          │ Formula                                   │ Max pts│
    ├────────────────────┼───────────────────────────────────────────┼────────┤
    │ Word count         │ min(word_count / 50, 1.0) × 30           │   30   │
    │ Keyword richness   │ min(keyword_hits / 3, 1.0) × 40          │   40   │
    │ Sentence structure │ min(sentence_count / 3, 1.0) × 30        │   30   │
    └────────────────────┴───────────────────────────────────────────┴────────┘

    Returns: { "score": float, "is_ai": bool }
    """
    if not answer_text or not answer_text.strip():
        return { "score": 0.0, "is_ai": False }

    is_ai = detect_ai_content(answer_text)

    nlp = _get_nlp()
    doc = nlp(answer_text.strip())

    # --- Component 1: word count ---
    word_count        = len([t for t in doc if not t.is_punct and not t.is_space])
    word_count_score  = min(word_count / 50, 1.0) * 30

    # --- Component 2: positive keyword hits ---
    tokens_lower      = {t.lemma_.lower() for t in doc if t.is_alpha}
    keyword_hits      = len(tokens_lower & _POSITIVE_KEYWORDS)
    keyword_score     = min(keyword_hits / 3, 1.0) * 40

    # --- Component 3: sentence structure ---
    sentence_count    = len(list(doc.sents))
    sentence_score    = min(sentence_count / 3, 1.0) * 30

    final = word_count_score + keyword_score + sentence_score
    
    # Harsh penalty for single AI-detected answers to drop their final average
    if is_ai:
        final = final * 0.2  # Max 20 points if AI detected
        
    return { "score": round(min(final, 100.0), 2), "is_ai": is_ai }


# ===========================================================================
# INTERVIEW EVALUATION  (no API)
# ===========================================================================

def evaluate_interview(transcript: List[Dict], cv_score: float) -> Dict:
    """
    Score the complete interview and produce a composite result.

    Parameters
    ----------
    transcript : list of {role, message} dicts
                 role is "bot" or "candidate"
    cv_score   : float 0–100 from skill matching stage

    Algorithm
    ---------
    1. Extract all candidate answers (role == "candidate")
    2. Score each with score_answer()
    3. interview_score = mean of individual scores
    4. final_score = (cv_score × 0.4) + (interview_score × 0.6)
    5. Generate a human-readable summary

    Returns
    -------
    {
        interview_score : float,
        final_score     : float,
        cv_score        : float,
        summary         : str,
    }
    """
    # Extract candidate answers only
    candidate_answers = [
        msg["message"]
        for msg in transcript
        if msg.get("role") in ("candidate", "user")
        and msg.get("message", "").strip()
    ]

    if not candidate_answers:
        interview_score = 0.0
        ai_flags = 0
    else:
        scores_data     = [score_answer(ans) for ans in candidate_answers]
        interview_score = round(sum(s["score"] for s in scores_data) / len(scores_data), 2)
        ai_flags        = sum(1 for s in scores_data if s["is_ai"])

    final_score = round((float(cv_score) * 0.4) + (interview_score * 0.6), 2)

    # Human-readable performance label
    if ai_flags > 0:
        performance = "disqualified (AI-assisted)"
        # Severe absolute penalty if any answer was AI generated
        final_score = min(final_score, 30.0) 
        interview_score = min(interview_score, 20.0)
    elif interview_score >= 70:
        performance = "strong"
    elif interview_score >= 45:
        performance = "moderate"
    else:
        performance = "weak"

    summary = (
        f"Candidate demonstrated {performance} technical knowledge "
        f"with an interview score of {interview_score:.0f}/100 "
        f"and CV match of {cv_score:.0f}/100."
    )
    
    if ai_flags > 0:
        summary += f"\n\n[⚠️ SYSTEM FLAG: Detected {ai_flags} AI-generated response(s). Candidate heavily penalized for lack of authenticity.]"

    return {
        "interview_score": interview_score,
        "final_score":     final_score,
        "cv_score":        float(cv_score),
        "summary":         summary,
    }

