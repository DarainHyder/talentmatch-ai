import os
from typing import Dict, Any
import boto3
from botocore.exceptions import ClientError
import json

class ProductionOAuthConfig:
    """Production OAuth configuration manager"""
    
    def __init__(self, environment: str = "production"):
        self.environment = environment
        self.secrets_client = boto3.client(
            'secretsmanager',
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        
    def get_google_config(self) -> Dict[str, Any]:
        """Fetch Google OAuth config from AWS Secrets Manager"""
        try:
            secret_name = f"talentmatch/{self.environment}/google-oauth"
            response = self.secrets_client.get_secret_value(SecretId=secret_name)
            secret = json.loads(response['SecretString'])
            
            return {
                'client_id': secret['client_id'],
                'client_secret': secret['client_secret'],
                'redirect_uris': secret['redirect_uris'],
                'auth_uri': 'https://accounts.google.com/o/oauth2/v2/auth',
                'token_uri': 'https://oauth2.googleapis.com/token',
                'userinfo_uri': 'https://www.googleapis.com/oauth2/v3/userinfo',
                'scopes': ['openid', 'email', 'profile']
            }
        except ClientError as e:
            # Log error and use fallback (for emergency only)
            print(f"Error fetching OAuth config: {e}")
            return self._get_fallback_config()
    
    def _get_fallback_config(self) -> Dict[str, Any]:
        """Emergency fallback config (should never be used in production)"""
        return {
            'client_id': os.getenv('EMERGENCY_GOOGLE_CLIENT_ID', ''),
            'client_secret': os.getenv('EMERGENCY_GOOGLE_CLIENT_SECRET', ''),
            'redirect_uris': [os.getenv('EMERGENCY_REDIRECT_URI', '')],
            'auth_uri': 'https://accounts.google.com/o/oauth2/v2/auth',
            'token_uri': 'https://oauth2.googleapis.com/token',
            'userinfo_uri': 'https://www.googleapis.com/oauth2/v3/userinfo',
            'scopes': ['openid', 'email', 'profile']
        }
    
    def validate_config(self) -> bool:
        """Validate OAuth configuration"""
        config = self.get_google_config()
        
        validations = [
            config['client_id'] and len(config['client_id']) > 10,
            config['client_secret'] and len(config['client_secret']) > 10,
            len(config['redirect_uris']) > 0,
            all(uri.startswith('https://') for uri in config['redirect_uris'])
        ]
        
        return all(validations)
    
    def rotate_secrets(self) -> bool:
        """Initiate secret rotation"""
        try:
            secret_name = f"talentmatch/{self.environment}/google-oauth"
            self.secrets_client.rotate_secret(SecretId=secret_name)
            return True
        except ClientError as e:
            print(f"Secret rotation failed: {e}")
            return False

# Production-ready OAuth client
class ProductionOAuthClient:
    def __init__(self, config: ProductionOAuthConfig):
        self.config = config
        self.google_config = config.get_google_config()
        
    def get_authorization_url(self, state: str, nonce: str = None) -> str:
        """Generate Google OAuth authorization URL"""
        from urllib.parse import urlencode
        
        params = {
            'client_id': self.google_config['client_id'],
            'redirect_uri': self.google_config['redirect_uris'][0],
            'response_type': 'code',
            'scope': ' '.join(self.google_config['scopes']),
            'access_type': 'offline',
            'prompt': 'consent',
            'state': state,
            'include_granted_scopes': 'true'
        }
        
        if nonce:
            params['nonce'] = nonce
        
        return f"{self.google_config['auth_uri']}?{urlencode(params)}"
    
    def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for tokens"""
        import requests
        
        data = {
            'code': code,
            'client_id': self.google_config['client_id'],
            'client_secret': self.google_config['client_secret'],
            'redirect_uri': self.google_config['redirect_uris'][0],
            'grant_type': 'authorization_code'
        }
        
        response = requests.post(
            self.google_config['token_uri'],
            data=data,
            timeout=10
        )
        response.raise_for_status()
        
        return response.json()
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user info from Google"""
        import requests
        
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(
            self.google_config['userinfo_uri'],
            headers=headers,
            timeout=5
        )
        response.raise_for_status()
        
        return response.json()
