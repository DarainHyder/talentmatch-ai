"""
app.py — Flask application factory for TalentMatch AI Recruitment Chatbot.

Backend: Python / Flask
Frontend: React (Vite, served separately in dev)
Database: SQLite via backend/utils/database.py
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Load environment variables from .env (if present)
# ---------------------------------------------------------------------------
load_dotenv()

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

def create_app() -> Flask:
    app = Flask(__name__)

    # --- Configuration ---
    app.config["SECRET_KEY"]             = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
    app.config["JWT_SECRET_KEY"]         = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-prod")
    app.config["MAX_CONTENT_LENGTH"]     = 5 * 1024 * 1024   # 5 MB file upload limit
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False            # tokens don't expire in dev

    # --- CORS ---
    # Allow React dev server and production origins
    allowed_origins = [
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # CRA / other
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://talentmatch-ai-eta.vercel.app",       # Vercel production
        "https://darainhyder-talentmatch-backend.hf.space",  # HuggingFace Space
    ]
    custom_origin = os.getenv("FRONTEND_URL", "").strip()
    if custom_origin:
        # Auto-fix common typos in WSGI configuration
        if custom_origin.endswith("/"):
            custom_origin = custom_origin[:-1]
        if not custom_origin.startswith("http"):
            custom_origin = f"https://{custom_origin}"
            
        allowed_origins.append(custom_origin)

    # Simplified CORS for production stability
    CORS(app, resources={r"/api/*": {
        "origins": allowed_origins + ["*"] if not os.getenv("FRONTEND_URL") else allowed_origins,
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }}, supports_credentials=True)

    # --- JWT ---
    JWTManager(app)

    # --- Database bootstrap ---
    from backend.utils.database import init_db
    from backend.utils.session_store import _init_sessions_table
    try:
        init_db()
        _init_sessions_table()
    except Exception as e:
        print(f"❌ DATABASE BOOTSTRAP FAILED: {e}")

    # --- Register blueprints ---
    from backend.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from backend.routes.chat import chat_bp
    app.register_blueprint(chat_bp)

    from backend.routes.jobs import jobs_bp
    app.register_blueprint(jobs_bp)

    # Legacy Blueprint (Disabled to prevent Pinecone import crashes)
    # from backend.routes.candidates import candidates_bp
    # app.register_blueprint(candidates_bp)

    # --- Health check ---
    @app.route("/health")
    def health():
        return jsonify({"status": "healthy", "service": "TalentMatch AI API"}), 200

    # --- 413 handler (file too large) ---
    @app.errorhandler(413)
    def request_entity_too_large(e):
        return jsonify({"error": "File too large. Maximum allowed size is 5 MB."}), 413

    return app


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))   # HF Spaces uses 7860, local uses 5000
    print("🚀 TalentMatch AI backend starting...")
    print(f"   GEMINI_API_KEY: {'SET ✅' if os.getenv('GEMINI_API_KEY') else 'NOT SET ⚠️ (using default questions)'}")
    print(f"   PORT: {port}")
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False,      # Never debug=True in production
        threaded=True,    # handle concurrent users safely
    )
