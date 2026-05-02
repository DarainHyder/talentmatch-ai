"""
database.py
-----------
SQLite-backed persistent store using Python's built-in sqlite3 module.
No extra packages required. Thread-safe via threading.local() connection pool.

DB file: ./data/talentmatch.db
Tables : candidates, transcripts, jobs
"""

import sqlite3
import threading
import os
import json
from datetime import datetime

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

_BASE_DIR = os.path.dirname(__file__)                       # backend/utils/
_DATA_DIR = os.path.abspath(os.path.join(_BASE_DIR, "..", "..", "data"))
_DB_PATH  = os.path.join(_DATA_DIR, "talentmatch.db")

# ensure ./data/ directory exists
os.makedirs(_DATA_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Thread-local connection pool
# ---------------------------------------------------------------------------

_local = threading.local()


def get_db() -> sqlite3.Connection:
    """
    Return a thread-local SQLite connection.
    Each thread gets its own connection — multiple concurrent requests
    never share a connection.
    """
    if not hasattr(_local, "conn") or _local.conn is None:
        _local.conn = sqlite3.connect(_DB_PATH, check_same_thread=False)
        _local.conn.row_factory = sqlite3.Row   # rows behave like dicts
        # PRAGMA journal_mode=WAL removed because PythonAnywhere NFS doesn't support WAL shared memory
        _local.conn.execute("PRAGMA foreign_keys=ON")
    return _local.conn


def close_db() -> None:
    """Close the thread-local connection if open."""
    conn = getattr(_local, "conn", None)
    if conn is not None:
        conn.close()
        _local.conn = None


# ---------------------------------------------------------------------------
# Schema creation
# ---------------------------------------------------------------------------

def init_db() -> None:
    """Create all tables if they don't already exist. Called on module import."""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS candidates (
            session_id      TEXT PRIMARY KEY,
            name            TEXT NOT NULL,
            email           TEXT NOT NULL,
            cv_text         TEXT,
            matched_skills  TEXT,
            missing_skills  TEXT,
            cv_score        REAL    DEFAULT 0,
            interview_score REAL    DEFAULT 0,
            final_score     REAL    DEFAULT 0,
            status          TEXT    DEFAULT 'interviewing',
            summary         TEXT,
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Safely attempt to add new columns if they do not exist
        BEGIN TRANSACTION;
        """)
    try:
        conn.execute("ALTER TABLE candidates ADD COLUMN phone TEXT;")
    except sqlite3.OperationalError:
        pass
    try:
        conn.execute("ALTER TABLE candidates ADD COLUMN cv_email TEXT;")
    except sqlite3.OperationalError:
        pass
    try:
        conn.execute("ALTER TABLE candidates ADD COLUMN extracted_skills TEXT;")
    except sqlite3.OperationalError:
        pass
    try:
        conn.execute("ALTER TABLE jobs ADD COLUMN is_visible INTEGER DEFAULT 1;")
    except sqlite3.OperationalError:
        pass
    conn.commit()

    conn.executescript("""
        CREATE TABLE IF NOT EXISTS transcripts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id  TEXT NOT NULL,
            role        TEXT NOT NULL,
            message     TEXT NOT NULL,
            timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES candidates(session_id)
        );

        CREATE TABLE IF NOT EXISTS jobs (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            title           TEXT NOT NULL,
            description     TEXT,
            required_skills TEXT,
            is_visible      INTEGER DEFAULT 1,
            updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS application_stats (
            id          INTEGER PRIMARY KEY CHECK (id = 1),  -- singleton row
            total_cvs_received      INTEGER DEFAULT 0,
            total_rejected          INTEGER DEFAULT 0,
            total_interviews_started INTEGER DEFAULT 0,
            total_completed         INTEGER DEFAULT 0,
            total_shortlisted       INTEGER DEFAULT 0
        );

        -- Ensure singleton row exists
        INSERT OR IGNORE INTO application_stats (id) VALUES (1);
    """)
    conn.commit()


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _row_to_dict(row) -> dict:
    """Convert a sqlite3.Row (or None) to a plain dict."""
    if row is None:
        return None
    return dict(row)


# ---------------------------------------------------------------------------
# Candidate functions
# ---------------------------------------------------------------------------

def insert_candidate(
    session_id: str,
    name: str,
    email: str,
    cv_text: str,
    matched_skills,          # list or comma-string
    missing_skills,          # list or comma-string
    cv_score: float,
    phone: str = "",
    cv_email: str = "",
    extracted_skills = None, # list or comma-string
) -> None:
    """
    INSERT a new candidate row with status = 'interviewing'.
    matched_skills / missing_skills are stored as comma-separated strings.
    """
    def _to_str(val):
        if isinstance(val, list):
            return ", ".join(val)
        return str(val) if val else ""

    conn = get_db()
    conn.execute(
        """
        INSERT OR REPLACE INTO candidates
            (session_id, name, email, cv_text,
             matched_skills, missing_skills, cv_score, status, phone, cv_email, extracted_skills)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'interviewing', ?, ?, ?)
        """,
        (
            session_id,
            name,
            email,
            cv_text,
            _to_str(matched_skills),
            _to_str(missing_skills),
            float(cv_score),
            phone,
            cv_email,
            _to_str(extracted_skills)
        ),
    )
    conn.commit()


def update_candidate_scores(
    session_id: str,
    interview_score: float,
    final_score: float,
    status: str,
    summary: str,
) -> None:
    """
    UPDATE interview_score, final_score, status and summary
    for an existing candidate after the interview completes.
    """
    conn = get_db()
    conn.execute(
        """
        UPDATE candidates
        SET interview_score = ?,
            final_score     = ?,
            status          = ?,
            summary         = ?
        WHERE session_id = ?
        """,
        (
            float(interview_score),
            float(final_score),
            status,
            summary,
            session_id,
        ),
    )
    conn.commit()


def get_all_candidates() -> list:
    """
    Return all candidate rows ordered by final_score DESC.
    Each row is a plain dict.
    """
    conn   = get_db()
    cursor = conn.execute(
        "SELECT * FROM candidates ORDER BY final_score DESC"
    )
    return [_row_to_dict(row) for row in cursor.fetchall()]


def get_candidate(session_id: str) -> dict:
    """
    Return a single candidate dict for session_id, or None if not found.
    """
    conn   = get_db()
    cursor = conn.execute(
        "SELECT * FROM candidates WHERE session_id = ?",
        (session_id,),
    )
    return _row_to_dict(cursor.fetchone())


def delete_candidate(session_id: str) -> None:
    """
    Delete a candidate and all associated transcript messages.
    """
    conn = get_db()
    conn.execute(
        "DELETE FROM transcripts WHERE session_id = ?",
        (session_id,),
    )
    conn.execute(
        "DELETE FROM candidates WHERE session_id = ?",
        (session_id,),
    )
    conn.commit()


# ---------------------------------------------------------------------------
# Transcript functions
# ---------------------------------------------------------------------------

def insert_transcript_message(
    session_id: str,
    role: str,
    message: str,
) -> None:
    """
    INSERT a single chat message (role = 'bot' | 'user') into the
    transcripts table. Call this after every message exchange.
    """
    conn = get_db()
    conn.execute(
        """
        INSERT INTO transcripts (session_id, role, message)
        VALUES (?, ?, ?)
        """,
        (session_id, role, message),
    )
    conn.commit()


def get_transcript(session_id: str) -> list:
    """
    Return all messages for a session ordered by timestamp ASC.
    Each item is {role, message, timestamp}.
    """
    conn   = get_db()
    cursor = conn.execute(
        """
        SELECT role, message, timestamp
        FROM   transcripts
        WHERE  session_id = ?
        ORDER  BY timestamp ASC
        """,
        (session_id,),
    )
    return [_row_to_dict(row) for row in cursor.fetchall()]


# ---------------------------------------------------------------------------
# Job functions
# ---------------------------------------------------------------------------

def get_current_job() -> dict:
    """
    Return the most recently updated job, or None if no jobs exist.
    """
    conn   = get_db()
    cursor = conn.execute(
        "SELECT * FROM jobs ORDER BY updated_at DESC LIMIT 1"
    )
    return _row_to_dict(cursor.fetchone())


def upsert_job(
    title: str,
    description: str,
    required_skills,    # list or comma-string
    is_visible: bool = True,
) -> dict:
    """
    If the jobs table is empty → INSERT a new job.
    Otherwise → UPDATE the existing single job record.
    Returns the resulting job dict.

    required_skills is stored as a comma-separated string.
    """
    def _to_str(val):
        if isinstance(val, list):
            return ", ".join(val)
        return str(val) if val else ""

    skills_str = _to_str(required_skills)
    conn       = get_db()

    existing = get_current_job()

    if existing is None:
        conn.execute(
            """
            INSERT INTO jobs (title, description, required_skills, is_visible)
            VALUES (?, ?, ?, ?)
            """,
            (title, description, skills_str, 1 if is_visible else 0),
        )
    else:
        conn.execute(
            """
            UPDATE jobs
            SET title           = ?,
                description     = ?,
                required_skills = ?,
                is_visible      = ?,
                updated_at      = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (title, description, skills_str, 1 if is_visible else 0, existing["id"]),
        )

    conn.commit()
    return get_current_job()


# ---------------------------------------------------------------------------
# Application Statistics (aggregate counts — no PII stored for rejections)
# ---------------------------------------------------------------------------

def increment_stat(field: str, amount: int = 1) -> None:
    """
    Atomically increment a counter in the application_stats singleton.

    Valid fields:
      total_cvs_received       — every CV uploaded (qualified OR not)
      total_rejected           — CVs that did not pass the threshold
      total_interviews_started — CVs that passed and entered interview
      total_completed          — interviews that finished all questions
      total_shortlisted        — candidates whose final_score >= 75
    """
    allowed = {
        "total_cvs_received",
        "total_rejected",
        "total_interviews_started",
        "total_completed",
        "total_shortlisted",
    }
    if field not in allowed:
        raise ValueError(f"Unknown stat field: {field}")
    conn = get_db()
    conn.execute(
        f"UPDATE application_stats SET {field} = {field} + ? WHERE id = 1",
        (amount,),
    )
    conn.commit()


def get_stats() -> dict:
    """
    Return the application_stats singleton as a plain dict.
    """
    conn   = get_db()
    cursor = conn.execute("SELECT * FROM application_stats WHERE id = 1")
    row    = cursor.fetchone()
    return _row_to_dict(row) if row else {}


# ---------------------------------------------------------------------------
# Bootstrap — create tables immediately on import
# ---------------------------------------------------------------------------

# init_db()  <-- REMOVED. Called explicitly in app.py now.
