"""
jobs.py — Flask blueprint for Job Description management.

Routes:
  GET  /api/jobs        → public, returns current JD
  POST /api/jobs        → JWT protected, updates JD
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.utils.job_store import get_jd, set_jd

jobs_bp = Blueprint("jobs", __name__)


@jobs_bp.route("/api/jobs", methods=["GET"])
def get_job():
    """
    Public endpoint — returns the current active Job Description.
    Used by the chat widget to show candidates what role they are applying for.
    """
    try:
        job = get_jd()
        if not job:
            return jsonify({"error": "No job description configured yet."}), 404
        return jsonify({"job": job}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@jobs_bp.route("/api/jobs", methods=["POST"])
@jwt_required()
def update_job():
    """
    JWT-protected endpoint — creates or updates the Job Description.

    Expected JSON body:
    {
        "title"           : "AI Engineer",
        "description"     : "We need ...",
        "required_skills" : ["Python", "NLP", "Machine Learning"]
                            OR "Python, NLP, Machine Learning"
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "JSON body required."}), 400

    title       = data.get("title", "").strip()
    description = data.get("description", "").strip()
    skills      = data.get("required_skills", [])
    is_visible  = bool(data.get("is_visible", True))

    if not title:
        return jsonify({"error": "'title' is required."}), 422

    try:
        updated_job = set_jd(title, description, skills, is_visible)
        return jsonify({"message": "Job description updated.", "job": updated_job}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500