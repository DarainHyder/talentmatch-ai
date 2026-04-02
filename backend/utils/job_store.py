"""
job_store.py
------------
In-memory cache for the active Job Description (JD).
Backed by SQLite via database.upsert_job() / get_current_job().

On startup:
  1. Try to load JD from SQLite.
  2. If DB is empty, seed from .env defaults and insert into DB.

Public API:
  get_jd()  → current job dict
  set_jd()  → update cache + SQLite
"""

import os
from backend.utils.database import get_current_job, upsert_job

# ---------------------------------------------------------------------------
# In-memory cache
# ---------------------------------------------------------------------------

_cached_job: dict = {}


def _load_or_seed() -> None:
    """
    Called once on import.
    Loads JD from SQLite.  If empty, seeds from .env variables.
    """
    global _cached_job

    job = get_current_job()

    if job is None:
        # Seed from environment / .env defaults
        title       = os.getenv("JD_TITLE",           "AI Engineer")
        description = os.getenv("JD_DESCRIPTION",
                                "We are hiring an AI engineer with experience in ML and NLP.")
        skills_str  = os.getenv("JD_REQUIRED_SKILLS", "Python,Machine Learning,NLP")
        job = upsert_job(title, description, skills_str)
        print(f"[job_store] Seeded JD from .env: '{title}'")
    else:
        print(f"[job_store] Loaded JD from DB: '{job['title']}'")

    _cached_job = dict(job)


def get_jd() -> dict:
    """
    Return the current Job Description dict.
    Keys: id, title, description, required_skills, updated_at
    required_skills is a comma-separated string — split before use.
    """
    global _cached_job
    if not _cached_job:
        _load_or_seed()
    return dict(_cached_job)


def set_jd(title: str, description: str, required_skills) -> dict:
    """
    Update the JD in both SQLite and the in-memory cache.

    Parameters
    ----------
    title            : job title string
    description      : full job description text
    required_skills  : list of strings OR comma-separated string

    Returns
    -------
    Updated job dict
    """
    global _cached_job

    updated = upsert_job(title, description, required_skills)
    _cached_job = dict(updated)
    return _cached_job


# ---------------------------------------------------------------------------
# Bootstrap
# ---------------------------------------------------------------------------

_load_or_seed()
