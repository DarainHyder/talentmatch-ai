"""
vector_store.py
---------------
ChromaDB-backed persistent store for candidate profiles and interview transcripts.
Data is saved to ./chroma_data and survives server restarts.
"""

import chromadb
import json
import os
from datetime import datetime

# ---------------------------------------------------------------------------
# Initialise ChromaDB client (local persistent mode - no server required)
# ---------------------------------------------------------------------------

_CHROMA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_data")
_CHROMA_DIR = os.path.abspath(_CHROMA_DIR)

_client = chromadb.PersistentClient(path=_CHROMA_DIR)

# Two collections
_candidates_col = _client.get_or_create_collection(
    name="candidates",
    metadata={"hnsw:space": "cosine"},   # cosine similarity for CV matching
)

_transcripts_col = _client.get_or_create_collection(
    name="transcripts",
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _skills_to_str(skills) -> str:
    """Accept list or comma-string, always return comma-string."""
    if isinstance(skills, list):
        return ", ".join(skills)
    return str(skills) if skills else ""


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def store_candidate(
    session_id: str,
    name: str,
    email: str,
    cv_text: str,
    matched_skills,
    cv_score: float,
    status: str = "screened",
) -> None:
    """
    Store a candidate profile + CV text into the 'candidates' collection.

    ChromaDB will automatically generate an embedding for cv_text which
    enables similarity search later.

    Parameters
    ----------
    session_id     : unique identifier for this candidate session
    name           : candidate full name
    email          : candidate email address
    cv_text        : raw extracted text from the uploaded CV
    matched_skills : list of skill strings OR comma-separated string
    cv_score       : 0–100 float representing CV skill-match score
    status         : "screened" | "interviewed" | "shortlisted" | "rejected"
    """
    metadata = {
        "name": name,
        "email": email,
        "matched_skills": _skills_to_str(matched_skills),
        "cv_score": float(cv_score),
        "final_score": 0.0,
        "interview_score": 0.0,
        "summary": "",
        "status": status,
        "timestamp": datetime.utcnow().isoformat(),
    }

    # Upsert so re-uploads don't create duplicates
    _candidates_col.upsert(
        ids=[session_id],
        documents=[cv_text],      # ChromaDB embeds this automatically
        metadatas=[metadata],
    )


def update_candidate_score(
    session_id: str,
    final_score: float,
    interview_score: float,
    summary: str,
    status: str = "interviewed",
) -> None:
    """
    Update an existing candidate record with final scores after interview.

    Parameters
    ----------
    session_id      : must match the id used in store_candidate()
    final_score     : composite score (0–100), e.g. 0.6*cv + 0.4*interview
    interview_score : score calculated from interview answers alone (0–100)
    summary         : short AI-generated summary of the candidate's performance
    status          : "interviewed" | "shortlisted" | "rejected"
    """
    # Fetch current record so we don't lose existing metadata fields
    result = _candidates_col.get(ids=[session_id], include=["metadatas", "documents"])

    if not result["ids"]:
        raise ValueError(f"Candidate with session_id='{session_id}' not found.")

    existing_meta = result["metadatas"][0]
    existing_doc  = result["documents"][0]

    updated_meta = {
        **existing_meta,
        "final_score":     float(final_score),
        "interview_score": float(interview_score),
        "summary":         summary,
        "status":          status,
    }

    _candidates_col.upsert(
        ids=[session_id],
        documents=[existing_doc],
        metadatas=[updated_meta],
    )


def store_transcript(session_id: str, transcript: list) -> None:
    """
    Persist the full Q&A transcript for a session.

    Parameters
    ----------
    session_id : matches the candidate session_id
    transcript : list of dicts with keys 'role' and 'message'
                 e.g. [{"role": "bot", "message": "..."}, ...]
    """
    transcript_str = json.dumps(transcript, ensure_ascii=False)

    _transcripts_col.upsert(
        ids=[session_id],
        documents=[transcript_str],
        metadatas=[{"session_id": session_id,
                    "timestamp": datetime.utcnow().isoformat()}],
    )


def get_all_candidates() -> list:
    """
    Return all candidate records for the admin dashboard.

    Returns
    -------
    list of dicts, each containing:
        session_id, name, email, matched_skills, cv_score,
        final_score, interview_score, summary, status, timestamp
    """
    result = _candidates_col.get(include=["metadatas"])

    candidates = []
    for idx, session_id in enumerate(result["ids"]):
        meta = result["metadatas"][idx]
        candidates.append({
            "session_id":      session_id,
            "name":            meta.get("name", ""),
            "email":           meta.get("email", ""),
            "matched_skills":  meta.get("matched_skills", ""),
            "cv_score":        meta.get("cv_score", 0.0),
            "final_score":     meta.get("final_score", 0.0),
            "interview_score": meta.get("interview_score", 0.0),
            "summary":         meta.get("summary", ""),
            "status":          meta.get("status", ""),
            "timestamp":       meta.get("timestamp", ""),
        })

    # Sort newest-first
    candidates.sort(key=lambda c: c["timestamp"], reverse=True)
    return candidates


def get_candidate(session_id: str) -> dict:
    """
    Return a single candidate's metadata + cv_text.

    Returns
    -------
    dict with keys: session_id, cv_text, + all metadata fields
    Raises ValueError if not found.
    """
    result = _candidates_col.get(
        ids=[session_id],
        include=["metadatas", "documents"],
    )

    if not result["ids"]:
        raise ValueError(f"Candidate with session_id='{session_id}' not found.")

    meta = result["metadatas"][0]
    return {
        "session_id": session_id,
        "cv_text":    result["documents"][0],
        **meta,
    }


def get_transcript(session_id: str) -> list:
    """
    Return the parsed transcript list for a given session_id.

    Returns
    -------
    list of { role, message } dicts
    Returns [] if no transcript found.
    """
    result = _transcripts_col.get(
        ids=[session_id],
        include=["documents"],
    )

    if not result["ids"]:
        return []

    try:
        return json.loads(result["documents"][0])
    except json.JSONDecodeError:
        return []


def search_similar_candidates(cv_text: str, top_k: int = 5) -> list:
    """
    Find the top_k most similar candidates by CV content using
    ChromaDB's built-in cosine similarity on embeddings.

    Useful for the 'Top Picks' section — shows the highest-scoring
    candidates from a pool with similar profiles.

    Parameters
    ----------
    cv_text : query text to compare against stored CVs
    top_k   : number of similar candidates to return

    Returns
    -------
    list of dicts with keys: session_id, similarity_score, + metadata fields
    """
    total = _candidates_col.count()
    if total == 0:
        return []

    k = min(top_k, total)   # can't query more than what's stored

    result = _candidates_col.query(
        query_texts=[cv_text],
        n_results=k,
        include=["metadatas", "distances"],
    )

    similar = []
    for idx, session_id in enumerate(result["ids"][0]):
        meta = result["metadatas"][0][idx]
        # ChromaDB cosine distance: 0 = identical, 2 = opposite
        # Convert to a 0–1 similarity score
        distance   = result["distances"][0][idx]
        similarity = round(1 - (distance / 2), 4)

        similar.append({
            "session_id":      session_id,
            "similarity_score": similarity,
            "name":            meta.get("name", ""),
            "email":           meta.get("email", ""),
            "matched_skills":  meta.get("matched_skills", ""),
            "cv_score":        meta.get("cv_score", 0.0),
            "final_score":     meta.get("final_score", 0.0),
            "status":          meta.get("status", ""),
        })

    return similar
