from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime
import uuid

api_bp = Blueprint('api', __name__)

# Mock database for demo
MOCK_JOBS = [
    {
        'id': '1',
        'title': 'Senior Full Stack Developer',
        'company': 'TechCorp',
        'location': 'Remote',
        'description': 'Looking for experienced developer...',
        'requirements': ['React', 'TypeScript', 'Node.js', 'AWS'],
        'status': 'open',
        'createdAt': '2024-01-15',
        'applicantCount': 42
    },
    {
        'id': '2', 
        'title': 'AI/ML Engineer',
        'company': 'InnovateAI',
        'location': 'San Francisco, CA',
        'description': 'Join our AI research team...',
        'requirements': ['Python', 'PyTorch', 'TensorFlow', 'MLOps'],
        'status': 'open',
        'createdAt': '2024-01-10',
        'applicantCount': 28
    }
]

MOCK_CANDIDATES = [
    {
        'id': '1',
        'name': 'Alex Johnson',
        'email': 'alex@example.com',
        'resumeText': 'Senior developer with 8 years experience...',
        'skills': ['React', 'TypeScript', 'Node.js', 'AWS', 'Python'],
        'score': 92,
        'matchPercentage': 95,
        'status': 'shortlisted',
        'appliedTo': ['1'],
        'lastUpdated': '2024-01-20'
    }
]

@api_bp.route('/api/jobs', methods=['GET'])
@jwt_required()
def get_jobs():
    claims = get_jwt()
    user_role = claims.get('role', 'candidate')
    
    # Role-based filtering
    if user_role == 'candidate':
        # Candidates see only open jobs
        open_jobs = [job for job in MOCK_JOBS if job['status'] == 'open']
        return jsonify({'jobs': open_jobs})
    else:
        # Recruiters/admins see all jobs
        return jsonify({'jobs': MOCK_JOBS})

@api_bp.route('/api/jobs', methods=['POST'])
@jwt_required()
def create_job():
    claims = get_jwt()
    user_role = claims.get('role', 'candidate')
    
    # RBAC check
    if user_role not in ['admin', 'recruiter']:
        return jsonify({'error': 'Insufficient permissions'}), 403
    
    data = request.json
    new_job = {
        'id': str(uuid.uuid4()),
        'title': data.get('title'),
        'company': data.get('company', 'Your Company'),
        'location': data.get('location', 'Remote'),
        'description': data.get('description', ''),
        'requirements': data.get('requirements', []),
        'status': 'open',
        'createdAt': datetime.now().isoformat(),
        'applicantCount': 0
    }
    
    MOCK_JOBS.append(new_job)
    return jsonify({'job': new_job}), 201

@api_bp.route('/api/candidates', methods=['GET'])
@jwt_required()
def get_candidates():
    claims = get_jwt()
    user_role = claims.get('role', 'candidate')
    
    # RBAC filtering
    if user_role == 'candidate':
        # Candidates only see themselves
        user_email = claims.get('sub')
        user_candidates = [c for c in MOCK_CANDIDATES if c['email'] == user_email]
        return jsonify({'candidates': user_candidates})
    else:
        # Recruiters/admins see all candidates
        return jsonify({'candidates': MOCK_CANDIDATES})

@api_bp.route('/api/ai/match', methods=['POST'])
@jwt_required()
def ai_match():
    """AI-powered candidate-job matching"""
    data = request.json
    job_id = data.get('jobId')
    candidate_id = data.get('candidateId')
    
    # Mock AI matching logic
    # In production, this would call OpenAI embeddings + Pinecone
    match_result = {
        'score': 92,
        'breakdown': {
            'skillsMatch': 95,
            'experienceMatch': 88,
            'cultureFit': 85
        },
        'strengths': ['React expertise', 'TypeScript proficiency', 'AWS experience'],
        'weaknesses': ['Limited Python experience', 'No ML background'],
        'interviewQuestions': [
            'How do you optimize React application performance?',
            'Describe your experience with TypeScript generics',
            'How would you design a scalable backend architecture?'
        ]
    }
    
    return jsonify(match_result)

@api_bp.route('/api/analytics/overview', methods=['GET'])
@jwt_required()
def analytics_overview():
    claims = get_jwt()
    user_role = claims.get('role', 'candidate')
    
    # RBAC: Only admins and hiring managers get analytics
    if user_role not in ['admin', 'recruiter', 'hiring_manager']:
        return jsonify({'error': 'Insufficient permissions'}), 403
    
    analytics = {
        'totalCandidates': len(MOCK_CANDIDATES),
        'totalJobs': len(MOCK_JOBS),
        'averageMatchScore': 78,
        'hiringVelocity': '32 days',
        'topSkills': ['React', 'Python', 'TypeScript', 'AWS', 'Node.js'],
        'candidatePipeline': {
            'sourced': 150,
            'screening': 42,
            'interview': 15,
            'offer': 3,
            'hired': 1
        }
    }
    
    return jsonify(analytics)
