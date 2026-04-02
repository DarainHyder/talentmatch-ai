#!/bin/bash

echo "🔐 SETTING UP PRODUCTION GOOGLE OAUTH"
echo "===================================="

echo ""
echo "Step 1: Go to Google Cloud Console"
echo "  URL: https://console.cloud.google.com/"
echo ""
echo "Step 2: Create a NEW project for production"
echo "  Project Name: TalentMatch-Production"
echo "  Project ID: talentmatch-production-$(date +%s)"
echo ""
echo "Step 3: Enable APIs"
echo "  - Google OAuth 2.0 API"
echo "  - Google People API (optional, for profile data)"
echo ""
echo "Step 4: Configure OAuth Consent Screen"
echo "  User Type: External"
echo "  App Name: TalentMatch"
echo "  User Support Email: your-email@gmail.com"
echo "  Developer Contact Email: your-email@gmail.com"
echo "  Scopes to add:"
echo "    - ../auth/userinfo.email"
echo "    - ../auth/userinfo.profile"
echo "    - openid"
echo ""
echo "Step 5: Add Test Users (initially)"
echo "  Add: your-email@gmail.com"
echo "  Add: admin@talentmatch.com"
echo ""
echo "Step 6: Create OAuth 2.0 Client ID"
echo "  Application Type: Web application"
echo "  Name: TalentMatch Production"
echo "  Authorized JavaScript origins:"
echo "    - https://talentmatch.com"
echo "    - https://www.talentmatch.com"
echo "  Authorized redirect URIs:"
echo "    - https://api.talentmatch.com/auth/google/callback"
echo "    - https://api.talentmatch.com/api/auth/google/callback"
echo ""
echo "Step 7: Copy Credentials"
echo "  Client ID: Copy this value"
echo "  Client Secret: Copy this value"
echo ""
echo "Step 8: Store in AWS Secrets Manager"
cat << 'INSTRUCTIONS'
Run these AWS CLI commands:

# Create the secret
aws secretsmanager create-secret \
    --name talentmatch/production/google-oauth \
    --secret-string '{
        "client_id": "YOUR_CLIENT_ID_HERE",
        "client_secret": "YOUR_CLIENT_SECRET_HERE",
        "redirect_uris": [
            "https://api.talentmatch.com/auth/google/callback",
            "https://api.talentmatch.com/api/auth/google/callback"
        ]
    }'

# Verify the secret
aws secretsmanager get-secret-value \
    --secret-id talentmatch/production/google-oauth
INSTRUCTIONS

echo ""
echo "Step 9: Configure Production Environment"
echo "  Update your backend code to use AWS Secrets Manager"
echo "  Deploy with the new configuration"
echo ""
echo "✅ Production Google OAuth setup complete!"
