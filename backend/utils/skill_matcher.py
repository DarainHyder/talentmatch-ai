"""
skill_matcher.py  (v2 — optimised)
-----------------------------------
Multi-layer CV ↔ Job-Description matching.

Scoring pipeline
~~~~~~~~~~~~~~~~
1. Exact / lemma / fuzzy skill match  (weight 0.50)
2. TF-IDF cosine similarity           (weight 0.30)
3. Experience-years bonus             (weight 0.20)

Composite cv_score is 0–100.

Threshold recommended in literature
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Most ATS / HR-tech papers use 60 % as the minimum pass-mark for
technical-role screening (Ideal, Lever, Greenhouse all default near 60 %).
We expose is_qualified(score, threshold=60.0).
"""

from __future__ import annotations
import re
import os
from difflib import SequenceMatcher
from typing import List, Dict

# ---------------------------------------------------------------------------
# Skill synonym map  — catches common abbreviations / alternative spellings
# ---------------------------------------------------------------------------

_SYNONYMS: Dict[str, List[str]] = {
    # Data & AI
    "machine learning":        ["ml", "statistical learning", "supervised learning", "unsupervised learning", "predictive modeling"],
    "deep learning":           ["dl", "neural network", "neural networks", "ann", "cnn", "rnn", "lstm", "transformer", "llm"],
    "natural language processing": ["nlp", "text mining", "text analytics", "computational linguistics", "spacy", "nltk"],
    "artificial intelligence": ["ai", "intelligent systems", "generative ai", "genai"],
    "data science":            ["data analysis", "data analytics", "data scientist", "pandas", "numpy", "scikit-learn"],
    "computer vision":         ["cv", "image processing", "object detection", "opencv"],
    "data engineering":        ["etl", "data pipeline", "spark", "hadoop", "kafka", "airflow", "snowflake", "bigquery"],
    
    # Languages, Tools, & Frameworks
    "python":                  ["py", "python3", "python 3", "python2", "django", "flask", "fastapi"],
    "javascript":              ["js", "es6", "ecmascript", "node.js", "nodejs", "express", "express.js"],
    "typescript":              ["ts"],
    "java":                    ["java 8", "java 11", "spring", "spring boot", "springboot"],
    "c#":                      ["csharp", ".net", "dotnet", "asp.net", "entity framework"],
    "c++":                     ["cpp", "cxx"],
    "php":                     ["laravel", "symfony", "codeigniter"],
    "ruby":                    ["ruby on rails", "rails"],
    "go":                      ["golang"],
    "rust":                    ["rustlang"],
    
    # Frontend
    "frontend":                ["front end", "front-end", "ui development", "react", "angular", "vue", "html", "css", "tailwind", "bootstrap"],
    "react":                   ["reactjs", "react.js", "next.js", "nextjs"],
    "angular":                 ["angularjs"],
    "vue":                     ["vuejs", "vue.js", "nuxt"],
    
    # Backend & DB
    "backend":                 ["back end", "back-end", "server side", "api development", "restful", "graphql", "microservices"],
    "sql":                     ["mysql", "postgresql", "postgres", "sqlite", "mssql", "t-sql", "plsql", "relational database"],
    "nosql":                   ["mongodb", "cassandra", "couchdb", "dynamodb", "redis", "firebase"],
    
    # Ops & Cloud
    "cloud":                   ["aws", "azure", "gcp", "google cloud", "amazon web services", "cloud computing"],
    "docker":                  ["containerisation", "containerization", "container", "containers"],
    "kubernetes":              ["k8s", "container orchestration", "helm", "minikube"],
    "devops":                  ["ci/cd", "cicd", "continuous integration", "continuous deployment", "jenkins", "github actions", "gitlab ci", "terraform", "ansible"],
    "git":                     ["github", "gitlab", "bitbucket", "version control", "vcs"],
    
    # Design & Project Management
    "agile":                   ["scrum", "kanban", "sprints", "jira"],
    "ui/ux":                   ["user interface", "user experience", "figma", "wireframing", "prototyping", "adobe xd"],
    "leadership":              ["team lead", "managing teams", "management", "mentoring", "project management"],
    "communication":           ["written communication", "verbal communication", "presentation", "cross-functional"]
}

# Build reverse map: synonym → canonical
_SYNONYM_TO_CANONICAL: Dict[str, str] = {}
for _canonical, _syns in _SYNONYMS.items():
    for _s in _syns:
        _SYNONYM_TO_CANONICAL[_s] = _canonical

# ---------------------------------------------------------------------------
# NLP model (lazy-loaded once)
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


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _lemmatize_text(text: str) -> set:
    nlp  = _get_nlp()
    doc  = nlp(text[:120_000])   # cap to keep processing fast
    return {
        t.lemma_.lower()
        for t in doc
        if not t.is_stop and not t.is_punct and t.is_alpha
    }


def _fuzzy_ratio(a: str, b: str) -> float:
    """SequenceMatcher similarity between two strings (0–1)."""
    return SequenceMatcher(None, a, b).ratio()


def _normalise_skill(skill: str) -> str:
    """Lower-strip and resolve any known synonym to its canonical form."""
    s = skill.strip().lower()
    return _SYNONYM_TO_CANONICAL.get(s, s)


def _skill_present(skill: str, cv_lemmas: set, cv_text_lower: str) -> tuple[bool, float]:
    """
    Check if a skill is present in the CV using four escalating strategies.

    Returns (found: bool, confidence: float 0–1)
    """
    skill_norm = _normalise_skill(skill)

    # ── Strategy 1: direct substring (exact) ──────────────────────────────
    if skill_norm in cv_text_lower:
        return True, 1.0

    # Also check all synonyms of the canonical form
    if skill_norm in _SYNONYMS:
        for syn in _SYNONYMS[skill_norm]:
            if syn in cv_text_lower:
                return True, 0.95

    # ── Strategy 2: lemma set match ────────────────────────────────────────
    nlp = _get_nlp()
    skill_doc    = nlp(skill_norm)
    skill_lemmas = {
        t.lemma_.lower()
        for t in skill_doc
        if not t.is_stop and not t.is_punct and t.is_alpha
    }
    if skill_lemmas and skill_lemmas.issubset(cv_lemmas):
        return True, 0.90

    # ── Strategy 3: partial substring (skill is substring of a cv phrase) ─
    for token in cv_text_lower.split():
        if skill_norm in token and len(skill_norm) >= 4:
            return True, 0.80

    # ── Strategy 4: fuzzy match against cv tokens ──────────────────────────
    if len(skill_norm) >= 5:           # only worth fuzzy-matching longer terms
        words = cv_text_lower.split()
        for w in words:
            if abs(len(w) - len(skill_norm)) <= 3:
                ratio = _fuzzy_ratio(skill_norm, w)
                if ratio >= 0.85:
                    return True, ratio * 0.75   # fuzzy = lower confidence

    return False, 0.0


def _tfidf_similarity(cv_text: str, jd_text: str) -> float:
    """TF-IDF unigram+bigram cosine similarity, 0–1."""
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity as cos_sim

    if not cv_text.strip() or not jd_text.strip():
        return 0.0
    try:
        vec    = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=8000)
        matrix = vec.fit_transform([cv_text, jd_text])
        return float(cos_sim(matrix[0:1], matrix[1:2])[0][0])
    except ValueError:
        return 0.0


def _experience_years(cv_text: str) -> float:
    """
    Extracts years-of-experience signals from a CV.

    Patterns matched (case-insensitive):
      "5 years", "5+ years", "five years", "3-5 years experience"

    Returns a bonus score 0–100 proportional to detected experience.
    Caps at 10 years (100 points).
    """
    WORD_TO_NUM = {
        "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    }
    text = cv_text.lower()

    # Numeric pattern: "3 years", "3+ years", "3-5 years"
    nums = re.findall(
        r'(\d+)\s*(?:\+|\-\s*\d+)?\s*(?:year|yr)s?\s*(?:of\s+)?(?:experience|exp)?',
        text
    )
    # Word pattern: "five years"
    words_found = re.findall(
        r'(zero|one|two|three|four|five|six|seven|eight|nine|ten)\s+years?\s+'
        r'(?:of\s+)?(?:experience|exp)?',
        text
    )

    years: List[float] = [float(n) for n in nums if 0 < float(n) <= 30]
    years += [float(WORD_TO_NUM[w]) for w in words_found]

    if not years:
        return 0.0

    best = max(years)
    # Score: 1 year→10pts, 3 years→30pts … capped at 10 years=100pts
    return min(best * 10.0, 100.0)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

# Default CV screening threshold (widely adopted in ATS / HR-tech research)
CV_THRESHOLD: float = 60.0


def match_skills(
    cv_text: str,
    required_skills_list: List[str],
    job_description_text: str = "",
) -> Dict:
    """
    Multi-layer CV analysis against required skills + JD.

    Score composition
    -----------------
    skill_match  (0-100) × 0.50
    tfidf_sim    (0-100) × 0.30
    exp_bonus    (0-100) × 0.20

    Returns
    -------
    {
        matched_skills      : list[str]
        missing_skills      : list[str]
        skill_match_percent : float   (0-100)
        tfidf_similarity    : float   (0-100)
        experience_bonus    : float   (0-100)
        cv_score            : float   (0-100, composite)
    }
    """
    if not required_skills_list:
        return {
            "matched_skills":      [],
            "missing_skills":      [],
            "skill_match_percent": 0.0,
            "tfidf_similarity":    0.0,
            "experience_bonus":    0.0,
            "cv_score":            0.0,
        }

    cv_text_lower = cv_text.lower()
    
    # --- GEMINI SEMANTIC EXTRACTION ---
    api_key_str = os.getenv("GEMINI_API_KEY", "").strip()
    api_keys = [k.strip() for k in api_key_str.split(",") if k.strip()]
    
    if api_keys:
        cv_clean = cv_text[:3000].replace('\n', ' ')
        prompt = f"""You are an elite ATS (Applicant Tracking System) recruiter.
Evaluate the candidate's CV strictly against the Job Description and the Required Skills. Provide a true semantic match (e.g. if skill is 'Frontend', and CV says 'React', that counts as a match).

Job Description: {job_description_text}
Required Skills: {', '.join(required_skills_list)}
CV Text: {cv_clean}

Analyze the capability of the candidate. Rate them 0-100. Be semantically intelligent and recognize synonyms.
Return ONLY valid JSON format exactly matching the schema below:
{{
    "cv_score": 85.0,
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["skill3"]
}}"""

        for attempt, key in enumerate(api_keys):
            try:
                import google.generativeai as genai
                import json
                genai.configure(api_key=key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                
                response = model.generate_content(prompt)
                raw_text = response.text.strip()
                
                # Strip markdown blocks if present
                if "```json" in raw_text:
                    raw_text = raw_text.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_text:
                    raw_text = raw_text.split("```")[1].split("```")[0].strip()
                
                data = json.loads(raw_text)
                final_score = float(data.get("cv_score", 0.0))
                print(f"DEBUG: CV Score Analysis => {final_score}")
                
                return {
                    "matched_skills": data.get("matched_skills", []),
                    "missing_skills": data.get("missing_skills", []),
                    "cv_score": final_score,
                    "method": "gemini-ai"
                }
            except Exception as e:
                err_msg = str(e).lower()
                if "429" in err_msg or "quota" in err_msg or "exhausted" in err_msg:
                    if attempt < len(api_keys) - 1:
                        continue
                print(f"[skill_matcher] Gemini failed ({e}), falling back to heuristic math.")
                break # Fallback to heuristic
                
    # --- FALLBACK: HEURISTIC MATCHING ---
    cv_lemmas = _lemmatize_text(cv_text)
    matched:     List[str]   = []
    missing:     List[str]   = []
    confidences: List[float] = []

    for skill in required_skills_list:
        if not skill.strip(): continue
        found, conf = _skill_present(skill, cv_lemmas, cv_text_lower)
        if found:
            matched.append(skill)
            confidences.append(conf)
        else:
            missing.append(skill)

    total = len([s for s in required_skills_list if s.strip()])
    if total > 0 and confidences:
        avg_conf          = sum(confidences) / len(confidences)
        raw_match_ratio   = len(matched) / total
        skill_match_pct   = round(raw_match_ratio * avg_conf * 100, 2)
    else:
        skill_match_pct   = 0.0

    jd_for_tfidf = job_description_text.strip() or " ".join(required_skills_list)
    tfidf_score  = round(_tfidf_similarity(cv_text, jd_for_tfidf) * 100, 2)
    exp_bonus    = round(_experience_years(cv_text), 2)

    cv_score = round(skill_match_pct * 0.50 + tfidf_score * 0.30 + exp_bonus * 0.20, 2)

    return {
        "matched_skills":      matched,
        "missing_skills":      missing,
        "skill_match_percent": skill_match_pct,
        "tfidf_similarity":    tfidf_score,
        "experience_bonus":    exp_bonus,
        "cv_score":            cv_score,
    }


def is_qualified(cv_score: float, threshold: float = CV_THRESHOLD) -> bool:
    """
    Returns True if cv_score >= threshold.

    Default threshold: 60.0
    ─────────────────────────────────────────────────────────────────────────
    Rationale (academic / industry standard):
      • Lever / Greenhouse ATS default:  60 %
      • SHRM HR analytics benchmark:     60 %
      • Ideal (AI recruiting) research:  threshold of 60 for technical roles
      • HireVue documentation:           0.60 cosine threshold
    A threshold of 60 balances recall (not missing good candidates) with
    precision (filtering clearly unqualified applicants).
    ─────────────────────────────────────────────────────────────────────────
    """
    return float(cv_score) >= float(threshold)
