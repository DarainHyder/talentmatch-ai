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
    # Allow React dev server and production origin
    allowed_origins = [
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # CRA / other
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    custom_origin = os.getenv("FRONTEND_URL", "").strip()
    if custom_origin:
        allowed_origins.append(custom_origin)

    CORS(app, resources={r"/api/*": {"origins": allowed_origins}},
         supports_credentials=True)

    # --- JWT ---
    JWTManager(app)

    # --- Database bootstrap ---
    from backend.utils.database import init_db
    init_db()

    # --- Register blueprints ---
    from backend.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from backend.routes.chat import chat_bp
    app.register_blueprint(chat_bp)

    from backend.routes.jobs import jobs_bp
    app.register_blueprint(jobs_bp)

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
    print("🚀 TalentMatch AI backend starting...")
    print(f"   GEMINI_API_KEY: {'SET ✅' if os.getenv('GEMINI_API_KEY') else 'NOT SET ⚠️ (using default questions)'}")
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        threaded=True,   # handle concurrent users safely
    )
