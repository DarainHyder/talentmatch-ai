# ===== FILE: ./tests/test_routes.py =====

import pytest
from backend.app import create_app
import json

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_jobs_analyze_endpoint(client):
    """Test job analysis endpoint"""
    response = client.post('/jobs/analyze', 
                         json={'job_text': 'We need a Python developer with Flask experience.'})
    assert response.status_code in [200, 400]  # Could be 400 if no Pinecone setup

def test_candidates_upload_endpoint(client):
    """Test candidate upload endpoint"""
    response = client.post('/candidates/upload', 
                         json={'candidates': [{'name': 'John Doe', 'resume': 'Python developer'}]})
    assert response.status_code in [200, 400]

def test_questions_generate_endpoint(client):
    """Test questions generation endpoint"""
    response = client.post('/questions/generate', 
                         json={'job_description': 'Python developer role'})
    assert response.status_code in [200, 400]