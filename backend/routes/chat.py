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
import re
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
    Start an interview session. (Level 2 Global Safety Net)
    """
    try:
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

        # --- Enforce per-email CV upload attempt limits (server-side) ---
        try:
            conn = database.get_db()
            cursor = conn.execute("SELECT COALESCE(SUM(cv_upload_attempts),0) as used FROM sessions WHERE email = ?", (email,))
            row = cursor.fetchone()
            used_attempts = int(row["used"] or 0)
            if used_attempts >= 3:
                return jsonify({"error": "You have used the maximum number of resume upload attempts (3). Please contact support."}), 403
        except Exception:
            # Do not block on DB errors — fall back to allowing upload
            pass

        # --- Parse CV ---
        try:
            cv_text = parse_cv(cv_file)
        except Exception as e:
            return jsonify({"error": f"CV parsing failed: {str(e)}"}), 422

        if not cv_text.strip():
            return jsonify({"error": "CV appears to be empty or unreadable."}), 422

        # --- Extract Phone and Email from CV via Regex ---
        phone_match = re.search(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', cv_text)
        cv_phone = phone_match.group(0) if phone_match else ""
        
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', cv_text)
        cv_email = email_match.group(0) if email_match else ""

        # --- Load current Job Description ---
        job = get_jd()
        if not job:
            return jsonify({"error": "No job description configured. Contact admin."}), 503

        job_title       = job.get("title", "")
        job_description = job.get("description", "")
        skills_raw      = job.get("required_skills", "")
        required_skills = [s.strip() for s in skills_raw.split(",") if s.strip()]
        job_visible     = bool(job.get("is_visible", True))

        if not job_visible:
            return jsonify({"error": "The chatbot is temporarily disabled because no job opportunity is currently active."}), 503

        # --- Match skills ---
        try:
            match_result = match_skills(cv_text, required_skills, job_description)
        except Exception as e:
            print(f"[chat] match_skills failed: {e}")
            match_result = {
                "cv_score": 10.0,
                "matched_skills": [],
                "missing_skills": required_skills
            }
        
        cv_score         = match_result.get("cv_score", 0.0)
        matched_skills   = match_result.get("matched_skills", [])
        missing_skills   = match_result.get("missing_skills", [])
        extracted_skills = match_result.get("extracted_skills", [])

        # --- Count every CV received ---
        try:
            database.increment_stat("total_cvs_received")
        except Exception:
            pass

        # --- Qualification gate ---
        if not is_qualified(cv_score):
            try:
                database.increment_stat("total_rejected")
            except Exception:
                pass

            return jsonify({
                "qualified": False,
                "message":   (
                    "Thank you for applying. After reviewing your CV, "
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
            print(f"[chat] generate_questions failed: {e}")
            return jsonify({"error": f"AI Engine failed to generate questions: {str(e)}"}), 500

        question_list = question_list[:5]

        # --- Create session ---
        try:
            sid = session_store.create_session(
                name=name,
                email=email,
                cv_text=cv_text,
                matched_skills=matched_skills,
                cv_score=cv_score,
                question_list=question_list,
                phone=cv_phone,
                cv_email=cv_email,
                extracted_skills=extracted_skills,
            )
        except Exception as e:
            print(f"[chat] create_session failed: {e}")
            return jsonify({"error": f"Session creation failed: {str(e)}"}), 500

        # --- Final cleanup and logging ---
        try:
            database.increment_stat("total_interviews_started")
            # Record this upload attempt on the session
            try:
                session_store.increment_cv_attempts(sid)
            except Exception:
                pass
            session_store.append_to_transcript(sid, "bot", question_list[0])
        except Exception as e:
            print(f"[chat] Final logging failed (continuing session): {e}")

        return jsonify({
            "qualified":       True,
            "session_id":      sid,
            "first_question":  question_list[0],
            "job_title":       job_title,
            "matched_skills":  matched_skills,
            "missing_skills":  missing_skills,
            "cv_score":        round(cv_score, 1),
        }), 200

    except Exception as e:
        print(f"[chat] CRITICAL ROUTE CRASH: {e}")
        return jsonify({
            "error": "The recruitment engine encountered an unexpected error during initialization.",
            "details": str(e)
        }), 500


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

    if sess.get("status") == "expired":
        return jsonify({"error": "This interview session has expired due to inactivity. Please restart the interview."}), 410

    if sess.get("status") != "interviewing":
        return jsonify({"error": "This interview session is already completed."}), 409

    question_list = sess.get("question_list", []) or []
    current_idx   = int(sess.get("current_question_index", 0) or 0)

    if current_idx >= len(question_list):
        # If the session somehow advanced beyond the available questions,
        # finalize the interview gracefully instead of crashing.
        cv_score   = sess.get("cv_score", 0.0)
        eval_result = evaluate_interview(session_store.get_transcript(session_id), cv_score)
        status_label = assign_status(eval_result["final_score"])
        session_store.complete_session(
            session_id=session_id,
            final_score=eval_result["final_score"],
            interview_score=eval_result["interview_score"],
            summary=eval_result["summary"],
        )
        closing = (
            "Thank you for completing the interview. We are finishing your evaluation and will be in touch soon."
        )
        session_store.append_to_transcript(session_id, "bot", closing)
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

    # --- Save candidate answer ---
    session_store.append_to_transcript(session_id, "candidate", message)
    
    # Mark first question as answered to lock CV uploads after first answer
    if current_idx == 0:
        session_store.mark_first_question_answered(session_id)

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


@chat_bp.route("/api/chat/session/<string:session_id>", methods=["GET"])
def get_public_session(session_id: str):
    """
    Public endpoint for candidates to restore an active chat session.
    """
    try:
        session = session_store.get_session(session_id)
        if not session:
            return jsonify({"error": "Session not found."}), 404

        if session.get("status") == "interviewing":
            session_store.touch_session(session_id)

        return jsonify({
            "session_id": session_id,
            "status": session.get("status", "interviewing"),
            "awaiting_followup": session.get("awaiting_followup", False),
            "current_question_index": session.get("current_question_index", 0),
            "transcript": session.get("transcript", []),
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/api/chat/sessions/<string:session_id>", methods=["DELETE"])
@jwt_required()
def delete_session(session_id: str):
    """
    Admin endpoint — delete a candidate record and its transcript.
    """
    try:
        if not session_id or not isinstance(session_id, str) or len(session_id.strip()) == 0:
            return jsonify({"error": "Invalid session_id."}), 400

        candidate = database.get_candidate(session_id)
        if not candidate:
            return jsonify({"error": "Candidate not found."}), 404

        database.delete_candidate(session_id)
        
        # Evict from memory if exists
        try:
            session_store.get_session(session_id)  # attempt load
            with session_store._lock:
                session_store._active_sessions.pop(session_id, None)
        except:
            pass
            
        return jsonify({"deleted": True, "message": "Candidate deleted successfully."}), 200
    except Exception as e:
        print(f"[chat] Delete session error: {e}")
        return jsonify({"error": f"Failed to delete candidate: {str(e)}"}), 500


@chat_bp.route("/api/chat/terminate", methods=["POST"])
def terminate_session():
    """Public endpoint for candidates to explicitly terminate their session.

    Body: { session_id: str }
    Marks the session status as 'expired' and evicts it from memory so the
    candidate will be treated as a new user on next visit.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "JSON body required."}), 400

    session_id = data.get("session_id", "").strip()
    if not session_id:
        return jsonify({"error": "session_id is required."}), 400

    try:
        sess = session_store.get_session(session_id)
        if not sess:
            return jsonify({"error": "Session not found."}), 404

        # Mark expired and evict from memory
        session_store.update_session(session_id, status="expired")
        try:
            with session_store._lock:
                session_store._active_sessions.pop(session_id, None)
        except Exception:
            pass

        return jsonify({"terminated": True}), 200
    except Exception as e:
        print(f"[chat] Terminate session error: {e}")
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
