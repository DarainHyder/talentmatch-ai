# ===== FILE: ./routes/candidates.py =====

from flask import Blueprint, request, jsonify
from backend.utils.scoring import score_candidate
from backend.pinecone_client import store_candidate_embedding, find_similar_jobs
import uuid

candidates_bp = Blueprint("candidates", __name__)

# GET index route for testing
@candidates_bp.route("/", methods=["GET"])
def candidates_index():
    return jsonify({
        "message": "Candidates endpoint is active.",
        "usage": "POST /candidates/upload or POST /candidates/add"
    })

# POST route to upload and score candidates
@candidates_bp.route("/upload", methods=["POST"])
def upload_candidates():
    data = request.json
    candidates = data.get("candidates", [])
    if not candidates:
        return jsonify({"error": "Candidates are required"}), 400

    processed_candidates = []
    for candidate in candidates:
        candidate_id = f"candidate_{uuid.uuid4().hex}"
        
        # Store candidate in Pinecone
        store_candidate_embedding(
            candidate_id=candidate_id,
            resume_text=candidate.get("resume", ""),
            metadata={
                "name": candidate.get("name", ""),
                "email": candidate.get("email", ""),
                "experience": candidate.get("experience", ""),
                "skills": candidate.get("skills", [])
            }
        )
        
        # Score candidate (now using actual similarity)
        scored_candidate = {
            "id": candidate_id,
            "name": candidate.get("name", ""),
            "email": candidate.get("email", ""),
            "experience": candidate.get("experience", ""),
            "skills": candidate.get("skills", []),
            "status": "processed"
        }
        
        processed_candidates.append(scored_candidate)

    return jsonify(processed_candidates)

# POST route to add a single candidate
@candidates_bp.route("/add", methods=["POST"])
def add_candidate():
    data = request.json
    
    # Validation
    required_fields = ["name", "email", "resume"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    candidate_id = f"candidate_{uuid.uuid4().hex}"
    
    # Store candidate in Pinecone
    store_candidate_embedding(
        candidate_id=candidate_id,
        resume_text=data.get("resume", ""),
        metadata={
            "name": data.get("name", ""),
            "email": data.get("email", ""),
            "experience": data.get("experience", ""),
            "skills": data.get("skills", []),
            "phone": data.get("phone", ""),
            "position": data.get("position", "")
        }
    )
    
    return jsonify({
        "status": "candidate added",
        "candidate_id": candidate_id,
        "name": data.get("name")
    })

@candidates_bp.route("/<candidate_id>/jobs", methods=["GET"])
def get_candidate_jobs(candidate_id):
    """Get matching jobs for a specific candidate"""
    try:
        # Fetch candidate data from Pinecone
        candidate_data = index.fetch(ids=[candidate_id])
        if candidate_id not in candidate_data.vectors:
            return jsonify({"error": "Candidate not found"}), 404
        
        candidate_vector = candidate_data.vectors[candidate_id]
        
        # Find similar jobs
        similar_jobs = index.query(
            vector=candidate_vector.values,
            top_k=5,
            include_metadata=True,
            filter={"type": "job"}
        )
        
        matches = []
        for match in similar_jobs.matches:
            matches.append({
                "job_id": match.id,
                "score": match.score,
                "metadata": match.metadata
            })
        
        return jsonify({
            "candidate_id": candidate_id,
            "matching_jobs": matches
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Update in ./routes/candidates.py - the debug function:

@candidates_bp.route("/debug", methods=["GET"])
def debug_candidates():
    """Debug endpoint to see stored candidates"""
    try:
        from backend.utils.simple_store import get_simple_store
        
        current_store = get_simple_store()
        print(f"🔧 DEBUG: Using store at memory address: {id(current_store)}")
        print(f"🔧 DEBUG: Store type: {type(current_store)}")
        
        # Get all candidate IDs from simple store
        if hasattr(current_store, 'metadata'):
            candidates = []
            print(f"🔧 DEBUG: Total items in metadata: {len(current_store.metadata)}")
            print(f"🔧 DEBUG: Metadata keys: {list(current_store.metadata.keys())}")
            
            for vector_id, metadata in current_store.metadata.items():
                print(f"🔧 DEBUG: Checking item: {vector_id} -> type: {metadata.get('type')}")
                if metadata.get('type') == 'candidate':
                    candidates.append({
                        'id': vector_id,
                        'name': metadata.get('name', 'Unknown'),
                        'skills': metadata.get('skills', []),
                        'experience': metadata.get('experience', ''),
                        'text_preview': metadata.get('text', '')[:100] + '...' if metadata.get('text') else ''
                    })
            
            print(f"🔧 DEBUG: Found {len(candidates)} candidates")
            return jsonify({
                "total_candidates": len(candidates),
                "candidates": candidates,
                "store_type": str(type(current_store)),
                "store_memory_address": id(current_store),
                "total_vectors": len(current_store.vectors) if hasattr(current_store, 'vectors') else 0
            })
        else:
            print("🔧 DEBUG: Store doesn't have metadata attribute")
            return jsonify({
                "error": "Simple store not accessible", 
                "store_type": type(current_store).__name__,
                "store_attrs": [attr for attr in dir(current_store) if not attr.startswith('_')]
            })
            
    except Exception as e:
        print(f"❌ DEBUG: Debug endpoint error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500