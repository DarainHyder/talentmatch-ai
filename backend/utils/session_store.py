"""
session_store.py
----------------
Hybrid session store: in-memory dict for speed during active interviews,
SQLite for persistence across restarts.

Architecture:
  - _active_sessions dict  → fast read/write during live chat
  - sessions SQLite table  → persistence, recovery after restart
  - threading.Lock()       → thread-safe for concurrent users
"""

import uuid
import json
import threading
from datetime import datetime

from backend.utils.database import (
    get_db,
    insert_candidate,
    insert_transcript_message,
    update_candidate_scores,
)

# ---------------------------------------------------------------------------
# In-memory store + lock
# ---------------------------------------------------------------------------

_active_sessions: dict = {}
_lock = threading.Lock()

# ---------------------------------------------------------------------------
# SQLite table bootstrap
# ---------------------------------------------------------------------------

def _init_sessions_table() -> None:
    """Create the sessions table if it doesn't exist (called on import)."""
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id              TEXT PRIMARY KEY,
            name                    TEXT,
            email                   TEXT,
            cv_text                 TEXT,
            matched_skills          TEXT,
            cv_score                REAL,
            question_list           TEXT,
            current_question_index  INTEGER  DEFAULT 0,
            transcript              TEXT     DEFAULT '[]',
            awaiting_followup       INTEGER  DEFAULT 0,
            status                  TEXT     DEFAULT 'interviewing',
            final_score             REAL     DEFAULT 0,
            interview_score         REAL     DEFAULT 0,
            summary                 TEXT,
            created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _serialize(session: dict) -> dict:
    """
    Return a copy of session safe for SQLite storage.
    Converts question_list and transcript lists → JSON strings.
    """
    s = dict(session)
    if isinstance(s.get("question_list"), list):
        s["question_list"] = json.dumps(s["question_list"])
    if isinstance(s.get("transcript"), list):
        s["transcript"] = json.dumps(s["transcript"])
    return s


def _deserialize(row: dict) -> dict:
    """
    Return a copy of a raw SQLite row with JSON strings parsed back.
    """
    if row is None:
        return None
    s = dict(row)
    # Parse JSON strings → Python objects
    if isinstance(s.get("question_list"), str):
        try:
            s["question_list"] = json.loads(s["question_list"])
        except (json.JSONDecodeError, TypeError):
            s["question_list"] = []
    if isinstance(s.get("transcript"), str):
        try:
            s["transcript"] = json.loads(s["transcript"])
        except (json.JSONDecodeError, TypeError):
            s["transcript"] = []
    # SQLite stores bool as integer; normalise
    s["awaiting_followup"] = bool(s.get("awaiting_followup", 0))
    return s


def _write_to_sqlite(session: dict) -> None:
    """Persist (upsert) a session dict into the SQLite sessions table."""
    s    = _serialize(session)
    conn = get_db()
    conn.execute(
        """
        INSERT INTO sessions
            (session_id, name, email, cv_text, matched_skills,
             cv_score, question_list, current_question_index,
             transcript, awaiting_followup, status,
             final_score, interview_score, summary)
        VALUES
            (:session_id, :name, :email, :cv_text, :matched_skills,
             :cv_score, :question_list, :current_question_index,
             :transcript, :awaiting_followup, :status,
             :final_score, :interview_score, :summary)
        ON CONFLICT(session_id) DO UPDATE SET
            name                   = excluded.name,
            email                  = excluded.email,
            cv_text                = excluded.cv_text,
            matched_skills         = excluded.matched_skills,
            cv_score               = excluded.cv_score,
            question_list          = excluded.question_list,
            current_question_index = excluded.current_question_index,
            transcript             = excluded.transcript,
            awaiting_followup      = excluded.awaiting_followup,
            status                 = excluded.status,
            final_score            = excluded.final_score,
            interview_score        = excluded.interview_score,
            summary                = excluded.summary
        """,
        {
            "session_id":             s.get("session_id", ""),
            "name":                   s.get("name", ""),
            "email":                  s.get("email", ""),
            "cv_text":                s.get("cv_text", ""),
            "matched_skills":         s.get("matched_skills", ""),
            "cv_score":               s.get("cv_score", 0.0),
            "question_list":          s.get("question_list", "[]"),
            "current_question_index": s.get("current_question_index", 0),
            "transcript":             s.get("transcript", "[]"),
            "awaiting_followup":      1 if s.get("awaiting_followup") else 0,
            "status":                 s.get("status", "interviewing"),
            "final_score":            s.get("final_score", 0.0),
            "interview_score":        s.get("interview_score", 0.0),
            "summary":                s.get("summary", ""),
        },
    )
    conn.commit()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def create_session(
    name: str,
    email: str,
    cv_text: str,
    matched_skills,   # list or comma-string
    cv_score: float,
    question_list: list,
) -> str:
    """
    Create a new interview session.

    Saves to both _active_sessions (fast) and SQLite (persistent).

    Returns
    -------
    session_id : str  (UUID4 hex string)
    """
    session_id = uuid.uuid4().hex

    if isinstance(matched_skills, list):
        matched_skills_str = ", ".join(matched_skills)
    else:
        matched_skills_str = str(matched_skills) if matched_skills else ""

    session = {
        "session_id":             session_id,
        "name":                   name,
        "email":                  email,
        "cv_text":                cv_text,
        "matched_skills":         matched_skills_str,
        "cv_score":               float(cv_score),
        "question_list":          question_list,
        "current_question_index": 0,
        "transcript":             [],
        "awaiting_followup":      False,
        "status":                 "interviewing",
        "final_score":            0.0,
        "interview_score":        0.0,
        "summary":                "",
        "created_at":             datetime.utcnow().isoformat(),
    }

    with _lock:
        _active_sessions[session_id] = session

    _write_to_sqlite(session)

    # Insert a candidate row so the transcripts FK constraint is satisfied.
    # missing_skills is unknown at this stage; it will be filled in later.
    insert_candidate(
        session_id=session_id,
        name=name,
        email=email,
        cv_text=cv_text,
        matched_skills=matched_skills,
        missing_skills=[],
        cv_score=float(cv_score),
    )

    return session_id


def get_session(session_id: str) -> dict:
    """
    Retrieve a session.

    Fast path  → check _active_sessions in-memory dict.
    Recovery   → fall back to SQLite if not in memory
                 (e.g. after server restart).

    Returns a parsed dict (question_list and transcript as Python lists),
    or None if not found anywhere.
    """
    # Fast path
    with _lock:
        session = _active_sessions.get(session_id)
        if session is not None:
            return dict(session)   # return a copy to avoid accidental mutation

    # Recovery path — load from SQLite
    conn   = get_db()
    cursor = conn.execute(
        "SELECT * FROM sessions WHERE session_id = ?", (session_id,)
    )
    row = cursor.fetchone()
    if row is None:
        return None

    session = _deserialize(dict(row))

    # Re-populate memory cache so next call is fast
    with _lock:
        _active_sessions[session_id] = session

    return dict(session)


def update_session(session_id: str, **kwargs) -> None:
    """
    Update one or more fields in a session.

    Usage example:
        update_session(session_id, current_question_index=2, awaiting_followup=True)

    List fields (question_list, transcript) are accepted as Python lists —
    serialisation to JSON for SQLite is handled internally.
    """
    with _lock:
        session = _active_sessions.get(session_id)
        if session is None:
            # Load from SQLite first if not in memory
            conn   = get_db()
            cursor = conn.execute(
                "SELECT * FROM sessions WHERE session_id = ?", (session_id,)
            )
            row = cursor.fetchone()
            if row is None:
                raise ValueError(f"Session '{session_id}' not found.")
            session = _deserialize(dict(row))

        session.update(kwargs)
        _active_sessions[session_id] = session

    _write_to_sqlite(session)


def append_to_transcript(session_id: str, role: str, message: str) -> None:
    """
    Append a single { role, message } entry to the session transcript.

    Also writes to the `transcripts` table via database.insert_transcript_message()
    so the admin dashboard can read per-message history.

    role should be 'bot' or 'user'.
    """
    session = get_session(session_id)
    if session is None:
        raise ValueError(f"Session '{session_id}' not found.")

    transcript = session.get("transcript", [])
    transcript.append({"role": role, "message": message})

    update_session(session_id, transcript=transcript)

    # Also persist individual message to the transcripts table
    insert_transcript_message(session_id, role, message)


def get_transcript(session_id: str) -> list:
    """
    Return the full parsed transcript list for a session.
    Returns [] if session doesn't exist.
    """
    session = get_session(session_id)
    if session is None:
        return []
    return session.get("transcript", [])


def complete_session(
    session_id: str,
    final_score: float,
    interview_score: float,
    summary: str,
) -> None:
    """
    Mark the session as completed.

    1. Updates session status → 'completed', saves scores.
    2. Calls database.update_candidate_scores() to update candidates table.
    3. Evicts session from in-memory dict (no longer needed in memory).
    """
    update_session(
        session_id,
        status="completed",
        final_score=float(final_score),
        interview_score=float(interview_score),
        summary=summary,
    )

    # Mirror scores to the candidates table
    status_label = "shortlisted" if final_score >= 60 else "rejected"
    update_candidate_scores(
        session_id=session_id,
        interview_score=float(interview_score),
        final_score=float(final_score),
        status=status_label,
        summary=summary,
    )

    # Evict from memory — interview is done
    with _lock:
        _active_sessions.pop(session_id, None)


# ---------------------------------------------------------------------------
# Bootstrap — create sessions table on import
# ---------------------------------------------------------------------------

# _init_sessions_table() <-- REMOVED. Called explicitly in app.py now.
