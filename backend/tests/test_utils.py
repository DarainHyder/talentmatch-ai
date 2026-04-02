# ===== FILE: ./tests/test_utils.py =====

import pytest
from backend.utils.parser import parse_job_description
from backend.utils.scoring import score_candidate

def test_parse_job_description():
    """Test job description parsing"""
    text = "We are looking for a Senior Python Developer with 5+ years of experience in Flask and Django."
    result = parse_job_description(text)
    
    assert "title" in result
    assert "skills" in result
    assert "summary" in result
    assert isinstance(result["skills"], list)

def test_score_candidate():
    """Test candidate scoring"""
    candidate_data = {
        "name": "Jane Smith",
        "resume": "Python developer with Flask experience",
        "experience": "3 years"
    }
    result = score_candidate(candidate_data)
    
    assert "name" in result
    assert "score" in result
    assert "experience" in result
    assert 0 <= result["score"] <= 100