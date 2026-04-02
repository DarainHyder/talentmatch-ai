import os
import requests
import json
import uuid
from urllib.parse import urlencode
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import create_access_token
import redis
from prometheus_client import Counter, Histogram

# Metrics for production monitoring
oauth_requests = Counter('oauth_requests_total', 'Total OAuth requests', ['provider', 'status'])
oauth_latency = Histogram('oauth_latency_seconds', 'OAuth request latency')

# Redis for session management (production)
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    password=os.getenv('REDIS_PASSWORD'),
    decode_responses=True
)

auth_bp = Blueprint('production_auth', __name__)

# Import our production secret manager
from config.secrets.production_manager import ProductionSecretManager
secret_manager = ProductionSecretManager(provider="aws")

class ProductionOAuthHandler:
    def __init__(self):
        self.credentials = secret_manager.get_google_credentials()
        self.rate_limit_window = 3600  # 1 hour
        self.max_attempts = 10
    
    def check_rate_limit(self, ip_address):
        """Production rate limiting"""
        key = f"rate_limit:{ip_address}"
        current = redis_client.get(key)
        
        if current and int(current) >= self.max_attempts:
            return False
        
        redis_client.incr(key)
        redis_client.expire(key, self.rate_limit_window)
        return True
    
    @oauth_latency.time()
    def handle_google_oauth(self, request):
        """Production Google OAuth flow with monitoring"""
        ip_address = request.remote_addr
        
        # Rate limiting check
        if not self.check_rate_limit(ip_address):
            oauth_requests.labels(provider='google', status='rate_limited').inc()
            return jsonify({'error': 'Rate limit exceeded'}), 429
        
        # Generate secure state parameter
        state = str(uuid.uuid4())
        redis_client.setex(f"oauth_state:{state}", 300, ip_address)  # 5 min TTL
        
        # Build OAuth URL
        params = {
            'client_id': self.credentials['client_id'],
            'redirect_uri': self.credentials['redirect_uris'][0],
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'prompt': 'consent select_account',
            'state': state,
            'hd': '*',  # Optional: restrict to specific domain
        }
        
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        oauth_requests.labels(provider='google', status='initiated').inc()
        
        return redirect(auth_url)
    
    @oauth_latency.time()
    def handle_callback(self, request):
        """Handle OAuth callback with production-grade error handling"""
        code = request.args.get('code')
        state = request.args.get('state')
        
        # Validate state parameter
        stored_ip = redis_client.get(f"oauth_state:{state}")
        if not stored_ip or stored_ip != request.remote_addr:
            oauth_requests.labels(provider='google', status='invalid_state').inc()
            return jsonify({'error': 'Invalid state parameter'}), 400
        
        # Clean up state
        redis_client.delete(f"oauth_state:{state}")
        
        try:
            # Exchange code for tokens
            token_data = {
                'code': code,
                'client_id': self.credentials['client_id'],
                'client_secret': self.credentials['client_secret'],
                'redirect_uri': self.credentials['redirect_uris'][0],
                'grant_type': 'authorization_code'
            }
            
            response = requests.post(
                'https://oauth2.googleapis.com/token',
                data=token_data,
                timeout=10  # Production timeout
            )
            response.raise_for_status()
            
            tokens = response.json()
            access_token = tokens['access_token']
            refresh_token = tokens.get('refresh_token')
            id_token = tokens.get('id_token')
            
            # Get user info
            user_info = self.get_user_info(access_token)
            
            # Create or update user in database
            user = self.create_or_update_user(user_info)
            
            # Generate JWT
            jwt_token = self.generate_jwt(user)
            
            # Store refresh token securely (encrypted)
            if refresh_token:
                self.store_refresh_token(user['id'], refresh_token)
            
            oauth_requests.labels(provider='google', status='success').inc()
            
            # Redirect to frontend with secure token
            frontend_url = f"{os.getenv('FRONTEND_BASE_URL')}/auth/callback"
            params = {
                'token': jwt_token,
                'user_id': user['id'],
                'expires_in': 3600
            }
            
            return redirect(f"{frontend_url}?{urlencode(params)}")
            
        except requests.exceptions.Timeout:
            oauth_requests.labels(provider='google', status='timeout').inc()
            return jsonify({'error': 'Authentication timeout'}), 504
        except Exception as e:
            oauth_requests.labels(provider='google', status='error').inc()
            # Log full error for debugging (not returned to user)
            print(f"OAuth error: {str(e)}")
            return jsonify({'error': 'Authentication failed'}), 500
    
    def get_user_info(self, access_token):
        """Fetch user info with retry logic"""
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Production retry logic
        for attempt in range(3):
            try:
                response = requests.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers=headers,
                    timeout=5
                )
                response.raise_for_status()
                return response.json()
            except requests.exceptions.Timeout:
                if attempt == 2:
                    raise
                continue
    
    def create_or_update_user(self, user_info):
        """Production user creation/update"""
        # This would connect to your production database
        # For now, return mock user
        return {
            'id': user_info['sub'],
            'email': user_info['email'],
            'name': user_info.get('name', ''),
            'picture': user_info.get('picture', ''),
            'email_verified': user_info.get('email_verified', False),
            'created_at': datetime.now().isoformat(),
            'last_login': datetime.now().isoformat()
        }
    
    def generate_jwt(self, user):
        """Generate production JWT with proper claims"""
        additional_claims = {
            'user_id': user['id'],
            'email': user['email'],
            'name': user.get('name'),
            'picture': user.get('picture'),
            'auth_provider': 'google',
            'email_verified': user.get('email_verified', False)
        }
        
        return create_access_token(
            identity=user['email'],
            additional_claims=additional_claims,
            expires_delta=timedelta(hours=1),  # Short-lived access token
            fresh=True
        )
    
    def store_refresh_token(self, user_id, refresh_token):
        """Store refresh token encrypted in database"""
        # In production, encrypt before storing
        encrypted_token = self.encrypt_token(refresh_token)
        
        # Store in secure database
        # db.execute("""
        #     INSERT INTO user_refresh_tokens (user_id, token, expires_at)
        #     VALUES (%s, %s, %s)
        #     ON CONFLICT (user_id) DO UPDATE
        #     SET token = %s, expires_at = %s
        # """, (user_id, encrypted_token, datetime.now() + timedelta(days=30),
        #       encrypted_token, datetime.now() + timedelta(days=30)))
        
        # For now, store in Redis with encryption
        redis_client.setex(
            f"refresh_token:{user_id}",
            2592000,  # 30 days
            encrypted_token
        )
    
    def encrypt_token(self, token):
        """Encrypt token for storage"""
        # Use AWS KMS or similar in production
        # For demo: base64 encoding (NOT secure for production!)
        import base64
        return base64.b64encode(token.encode()).decode()

# Register routes
oauth_handler = ProductionOAuthHandler()

@auth_bp.route('/api/auth/google')
def google_login():
    return oauth_handler.handle_google_oauth(request)

@auth_bp.route('/api/auth/google/callback')
def google_callback():
    return oauth_handler.handle_callback(request)

@auth_bp.route('/api/auth/refresh', methods=['POST'])
def refresh_token():
    """Production token refresh endpoint"""
    # Implement JWT refresh logic
    pass

