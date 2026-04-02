from flask import Blueprint, request, jsonify, redirect, url_for, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
import requests
from urllib.parse import urlencode
import os
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # You can change these default credentials here or set them in your .env file
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@company.com')
    admin_pass  = os.getenv('ADMIN_PASSWORD', 'secureAdmin2026')
    
    if email != admin_email or password != admin_pass:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Create JWT token for this explicit admin
    access_token = create_access_token(
        identity=email,
        additional_claims={
            'userId': '1',
            'name': 'Admin User',
            'role': 'admin',
            'permissions': ['create:job', 'edit:job', 'delete:job', 'view:all_jobs', 
                           'view:all_candidates', 'edit:candidate', 'configure:ai', 'view:analytics']
        },
        expires_delta=timedelta(hours=24)
    )
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': '1',
            'email': email,
            'name': 'Admin User',
            'role': 'admin',
            'permissions': ['create:job', 'edit:job', 'delete:job', 'view:all_jobs', 
                           'view:all_candidates', 'edit:candidate', 'configure:ai', 'view:analytics']
        }
    })

@auth_bp.route('/api/auth/google')
def google_login():
    """Step 1: Redirect to Google OAuth"""
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    redirect_uri = os.getenv('GOOGLE_REDIRECT_URI')
    
    if not client_id or not redirect_uri:
        return jsonify({'error': 'OAuth not configured'}), 500
    
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return redirect(auth_url)

@auth_bp.route('/api/auth/google/callback')
def google_callback():
    """Step 2: Handle Google OAuth callback"""
    code = request.args.get('code')
    
    if not code:
        return jsonify({'error': 'No code provided'}), 400
    
    # In production: Exchange code for tokens, get user info, create user in DB
    # For demo, we'll just create a mock user
    
    # Mock Google user info
    mock_user_info = {
        'email': 'google-user@example.com',
        'name': 'Google User',
        'picture': 'https://via.placeholder.com/150'
    }
    
    # Create or get user
    user_email = mock_user_info['email']
    if user_email not in MOCK_USERS:
        MOCK_USERS[user_email] = {
            'id': str(len(MOCK_USERS) + 1),
            'name': mock_user_info['name'],
            'role': 'candidate',  # Default role for Google users
            'permissions': []
        }
    
    user = MOCK_USERS[user_email]
    
    # Create JWT token
    access_token = create_access_token(
        identity=user_email,
        additional_claims={
            'userId': user['id'],
            'name': user['name'],
            'role': user['role'],
            'permissions': user['permissions']
        },
        expires_delta=timedelta(hours=24)
    )
    
    # Redirect to frontend with token
    frontend_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/callback?token={access_token}"
    return redirect(frontend_url)

@auth_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info from JWT"""
    current_user = get_jwt_identity()
    user_data = get_jwt()
    
    return jsonify({
        'email': current_user,
        'id': user_data.get('userId'),
        'name': user_data.get('name'),
        'role': user_data.get('role'),
        'permissions': user_data.get('permissions', [])
    })

@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout - client side should remove token"""
    return jsonify({'message': 'Logged out successfully'})
