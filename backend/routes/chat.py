"""
chat.py — Flask blueprint for the AI interview chatbot API.

Routes:
  POST /api/chat/start            → upload CV, start session
  POST /api/chat/message          → send answer, get next question
  GET  /api/chat/sessions         → admin: all candidates (JWT)
  GET  /api/chat/sessions/<id>    → admin: single candidate + transcript (JWT)
"""

import os
import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from backend.utils.cv_parser import parse_cv
from backend.utils.skill_matcher import match_skills, is_qualified, CV_THRESHOLD
from backend.utils.interview_engine import (
    generate_questions,
    needs_followup,
    get_followup,
    evaluate_interview,
)
from backend.utils import session_store
from backend.utils import database
from backend.utils.scoring import rank_candidates, get_top_picks, assign_status
from backend.utils.job_store import get_jd

chat_bp = Blueprint("chat", __name__)

_MAX_FILE_SIZE = 5 * 1024 * 1024   # 5 MB
_ALLOWED_EXTENSIONS = {".pdf", ".docx"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _allowed_file(filename: str) -> bool:
    ext = os.path.splitext(filename.lower())[1]
    return ext in _ALLOWED_EXTENSIONS


def _file_too_large(file) -> bool:
    file.seek(0, 2)            # seek to end
    size = file.tell()
    file.seek(0)               # rewind for parsing
    return size > _MAX_FILE_SIZE


# ---------------------------------------------------------------------------
# POST /api/chat/start
# ---------------------------------------------------------------------------

@chat_bp.route("/api/chat/start", methods=["POST"])
def chat_start():
    """
    Start an interview session.

    multipart/form-data fields:
      name     : str
      email    : str
      cv_file  : file (PDF or DOCX, max 5 MB)

    Returns:
      { qualified: false, message: str }
      { qualified: true, session_id: str, first_question: str,
        job_title: str, matched_skills: list, cv_score: float }
    """
    # --- Validate form fields ---
    name  = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip()

    if not name or not email:
        return jsonify({"error": "Name and email are required."}), 400

    if "cv_file" not in request.files:
        return jsonify({"error": "cv_file is required."}), 400

    cv_file = request.files["cv_file"]

    if not cv_file.filename:
        return jsonify({"error": "No file selected."}), 400

    if not _allowed_file(cv_file.filename):
        return jsonify({"error": "Only PDF and DOCX files are accepted."}), 415

    if _file_too_large(cv_file):
        return jsonify({"error": "File exceeds the 5 MB limit."}), 413

    # --- Parse CV ---
    try:
        cv_text = parse_cv(cv_file)
    except Exception as e:
        return jsonify({"error": f"CV parsing failed: {str(e)}"}), 422

    if not cv_text.strip():
        return jsonify({"error": "CV appears to be empty or unreadable."}), 422

    # --- Load current Job Description ---
    job = get_jd()
    if not job:
        return jsonify({"error": "No job description configured. Contact admin."}), 503

    job_title       = job.get("title", "")
    job_description = job.get("description", "")
    skills_raw      = job.get("required_skills", "")
    required_skills = [s.strip() for s in skills_raw.split(",") if s.strip()]

    # --- Match skills ---
    match_result = match_skills(cv_text, required_skills, job_description)
    cv_score         = match_result["cv_score"]
    matched_skills   = match_result["matched_skills"]
    missing_skills   = match_result["missing_skills"]

    # --- Count every CV received (regardless of outcome) ---
    try:
        database.increment_stat("total_cvs_received")
    except Exception:
        pass

    # --- Qualification gate (threshold = 60 %) ---
    if not is_qualified(cv_score):
        # Count rejection — do NOT store candidate PII
        try:
            database.increment_stat("total_rejected")
        except Exception:
            pass

        return jsonify({
            "qualified": False,
            "message":   (
                "Thank you for applying to this position. After reviewing your CV, "
                "we found that your current profile does not meet the minimum "
                f"requirements ({CV_THRESHOLD:.0f}% match needed). "
                "We encourage you to apply again when you have gained more "
                "of the required skills."
            ),
            "cv_score":       round(cv_score, 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
        }), 200

    # --- Generate interview questions ---
    try:
        question_list = generate_questions(
            cv_text=cv_text,
            job_title=job_title,
            job_description=job_description,
            matched_skills=matched_skills,
        )
    except Exception as e:
        return jsonify({"error": f"Question generation failed: {str(e)}"}), 500

    # Ensure exactly 5 questions
    question_list = question_list[:5]

    # --- Create session (also inserts candidate to DB) ---
    try:
        sid = session_store.create_session(
            name=name,
            email=email,
            cv_text=cv_text,
            matched_skills=matched_skills,
            cv_score=cv_score,
            question_list=question_list,
        )
    except Exception as e:
        return jsonify({"error": f"Session creation failed: {str(e)}"}), 500

    # Count interview started
    try:
        database.increment_stat("total_interviews_started")
    except Exception:
        pass

    # Log the first bot question in transcript
    session_store.append_to_transcript(sid, "bot", question_list[0])

    return jsonify({
        "qualified":       True,
        "session_id":      sid,
        "first_question":  question_list[0],
        "job_title":       job_title,
        "matched_skills":  matched_skills,
        "missing_skills":  missing_skills,
        "cv_score":        round(cv_score, 1),
    }), 200


# ---------------------------------------------------------------------------
# POST /api/chat/message
# ---------------------------------------------------------------------------

@chat_bp.route("/api/chat/message", methods=["POST"])
def chat_message():
    """
    Send a candidate answer; receive next question or final result.

    JSON body:
      { session_id: str, message: str }

    Returns:
      { done: false, question: str }
      { done: true,  final_score: float, message: str }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "JSON body required."}), 400

    session_id = data.get("session_id", "").strip()
    message    = data.get("message",    "").strip()

    if not session_id or not message:
        return jsonify({"error": "session_id and message are required."}), 400

    # --- Load session ---
    sess = session_store.get_session(session_id)
    if not sess:
        return jsonify({"error": "Session not found. Please restart the interview."}), 404

    if sess.get("status") != "interviewing":
        return jsonify({"error": "This interview session is already completed."}), 409

    # --- Save candidate answer ---
    session_store.append_to_transcript(session_id, "candidate", message)

    question_list = sess.get("question_list", [])
    current_idx   = sess.get("current_question_index", 0)

    # --- Follow-up logic ---
    awaiting = sess.get("awaiting_followup", False)
    
    if not awaiting and needs_followup(message):
        # Trigger a follow-up: stay on the SAME main question index
        session_store.update_session(session_id, awaiting_followup=True)
        followup = get_followup(message)
        session_store.append_to_transcript(session_id, "bot", followup)
        return jsonify({"done": False, "question": followup}), 200

    # Advance to the next real question from question_list
    next_idx = current_idx + 1
    session_store.update_session(
        session_id,
        awaiting_followup=False,
        current_question_index=next_idx,
    )

    # --- Check if interview is complete (exactly 5 questions) ---
    if next_idx >= 5 or next_idx >= len(question_list):
        transcript = session_store.get_transcript(session_id)
        cv_score   = sess.get("cv_score", 0.0)

        eval_result = evaluate_interview(transcript, cv_score)
        status_label = assign_status(eval_result["final_score"])

        session_store.complete_session(
            session_id=session_id,
            final_score=eval_result["final_score"],
            interview_score=eval_result["interview_score"],
            summary=eval_result["summary"],
        )

        closing = (
            "Thank you for your time. We will review your application "
            "and be in touch shortly. Good luck."
        )
        session_store.append_to_transcript(session_id, "bot", closing)

        # Update aggregate stats
        try:
            database.increment_stat("total_completed")
            if status_label == "Shortlisted":
                database.increment_stat("total_shortlisted")
        except Exception:
            pass

        return jsonify({
            "done":            True,
            "final_score":     round(eval_result["final_score"], 1),
            "interview_score": round(eval_result["interview_score"], 1),
            "cv_score":        round(cv_score, 1),
            "status":          status_label,
            "summary":         eval_result["summary"],
            "message":         closing,
        }), 200

    # --- Next question ---
    next_q = question_list[next_idx]
    session_store.append_to_transcript(session_id, "bot", next_q)

    return jsonify({
        "done":               False,
        "question":           next_q,
        "question_number":    next_idx + 1,
        "total_questions":    len(question_list),
    }), 200


# ---------------------------------------------------------------------------
# GET /api/chat/sessions  (JWT protected)
# ---------------------------------------------------------------------------

@chat_bp.route("/api/chat/sessions", methods=["GET"])
@jwt_required()
def get_sessions():
    """
    Admin endpoint — returns all candidates ranked by score, plus top picks.
    """
    try:
        candidates = database.get_all_candidates()
        ranked     = rank_candidates(candidates)
        top_picks  = get_top_picks(ranked, n=3)

        stats    = database.get_stats()
        return jsonify({
            "candidates": ranked,
            "top_picks":  top_picks,
            "total":      len(ranked),
            "stats":      stats,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /api/chat/sessions/<session_id>  (JWT protected)
# ---------------------------------------------------------------------------

@chat_bp.route("/api/chat/sessions/<string:session_id>", methods=["GET"])
@jwt_required()
def get_session_detail(session_id: str):
    """
    Admin endpoint — returns a single candidate profile + full interview transcript.
    """
    try:
        candidate  = database.get_candidate(session_id)
        if not candidate:
            return jsonify({"error": "Candidate not found."}), 404

        transcript = database.get_transcript(session_id)

        return jsonify({
            "candidate":  candidate,
            "transcript": transcript,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /api/chat/stats  (public — aggregate counts only, no PII)
# ---------------------------------------------------------------------------

@chat_bp.route("/api/chat/stats", methods=["GET"])
def get_app_stats():
    """
    Returns aggregate application funnel metrics.
    No authentication required — no PII is exposed.

    Example response:
    {
      "total_cvs_received":       42,
      "total_rejected":           18,
      "total_interviews_started": 24,
      "total_completed":          20,
      "total_shortlisted":        8
    }
    """
    try:
        stats = database.get_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
