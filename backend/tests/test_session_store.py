import pytest
from datetime import datetime, timedelta
from backend.utils import session_store


def test_session_expires_after_inactivity():
    session_id = session_store.create_session(
        name="Test User",
        email="test@example.com",
        cv_text="Experienced Python developer.",
        matched_skills=["Python", "Flask"],
        cv_score=95.0,
        question_list=["Question 1"]
    )

    stale_timestamp = (datetime.utcnow() - timedelta(seconds=session_store._SESSION_TIMEOUT_SECONDS + 10)).timestamp()
    session_store.update_session(session_id, last_activity=stale_timestamp)

    expired_session = session_store.get_session(session_id)
    assert expired_session is not None
    assert expired_session["status"] == "expired"
    assert not session_store._is_session_expired(expired_session)
