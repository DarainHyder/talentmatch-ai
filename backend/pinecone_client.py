# ===== FILE: ./backend/pinecone_client.py =====

import os
from dotenv import load_dotenv
from backend.utils.embeddings import get_embedding

load_dotenv()

# Initialize without Pinecone first
index = None
USE_PINECONE = False

print("🔧 Initializing storage system...")

try:
    from pinecone import Pinecone, ServerlessSpec
    
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    
    if PINECONE_API_KEY:
        print("🔧 Pinecone credentials found, attempting to connect...")
        # Initialize Pinecone with new SDK
        pc = Pinecone(api_key=PINECONE_API_KEY)
        
        # Connect to index
        index_name = "talentmatch"
        if index_name in pc.list_indexes().names():
            index = pc.Index(index_name)
            USE_PINECONE = True
            print("✅ Using Pinecone for vector storage")
        else:
            print(f"⚠️  Pinecone index '{index_name}' not found. Using simple store.")
            print("💡 To create the index, run:")
            print(f"   pc.create_index(name='{index_name}', dimension=1536, metric='cosine')")
            raise ImportError("Pinecone index not configured")
    else:
        print("⚠️  Pinecone credentials not found in environment variables")
        raise ImportError("Pinecone credentials missing")
        
except ImportError as e:
    print(f"⚠️  Pinecone import failed: {e}")
except Exception as e:
    print(f"⚠️  Pinecone setup failed: {e}")

# Fallback to simple store if Pinecone not available
if not USE_PINECONE:
    print("🔄 Using simple in-memory vector store")
    from backend.utils.simple_store import get_simple_store
    index = get_simple_store()
    print(f"✅ Simple store initialized. Type: {type(index)}")
    print(f"✅ Simple store memory address: {id(index)}")

def store_job_embedding(job_id: str, job_text: str, metadata: dict = None):
    """Store job description embedding"""
    print(f"📥 STORE_JOB: Attempting to store job: {job_id}")
    try:
        embedding = get_embedding(job_text)
        print(f"🔧 STORE_JOB: Generated embedding of length: {len(embedding)}")
        
        if metadata is None:
            metadata = {}
        
        metadata.update({"text": job_text[:1000], "type": "job"})
        print(f"🔧 STORE_JOB: Final metadata keys: {list(metadata.keys())}")
        
        # Ensure we're using the same store instance
        from backend.utils.simple_store import get_simple_store
        current_store = get_simple_store()
        print(f"🔧 STORE_JOB: Using store at memory address: {id(current_store)}")
        
        current_store.upsert([(job_id, embedding, metadata)])
        print(f"✅ STORE_JOB: Successfully stored job: {job_id}")
        return True
    except Exception as e:
        print(f"❌ STORE_JOB: Failed to store job embedding: {e}")
        import traceback
        traceback.print_exc()
        return False

def store_candidate_embedding(candidate_id: str, resume_text: str, metadata: dict = None):
    """Store candidate resume embedding"""
    print(f"📥 STORE_CANDIDATE: Attempting to store candidate: {candidate_id}")
    print(f"🔧 STORE_CANDIDATE: Candidate name: {metadata.get('name', 'Unknown') if metadata else 'No metadata'}")
    try:
        embedding = get_embedding(resume_text)
        print(f"🔧 STORE_CANDIDATE: Generated embedding of length: {len(embedding)}")
        
        if metadata is None:
            metadata = {}
        
        metadata.update({"text": resume_text[:1000], "type": "candidate"})
        print(f"🔧 STORE_CANDIDATE: Final metadata keys: {list(metadata.keys())}")
        
        # Ensure we're using the same store instance
        from backend.utils.simple_store import get_simple_store
        current_store = get_simple_store()
        print(f"🔧 STORE_CANDIDATE: Using store at memory address: {id(current_store)}")
        
        current_store.upsert([(candidate_id, embedding, metadata)])
        print(f"✅ STORE_CANDIDATE: Successfully stored candidate: {candidate_id}")
        return True
    except Exception as e:
        print(f"❌ STORE_CANDIDATE: Failed to store candidate embedding: {e}")
        import traceback
        traceback.print_exc()
        return False

def find_similar_candidates(job_text: str, top_k: int = 10):
    """Find similar candidates for a job"""
    print(f"🔍 FIND_CANDIDATES: Finding candidates for job text: {job_text[:50]}...")
    try:
        job_embedding = get_embedding(job_text)
        print(f"🔧 FIND_CANDIDATES: Generated job embedding of length: {len(job_embedding)}")
        
        # Ensure we're using the same store instance
        from backend.utils.simple_store import get_simple_store
        current_store = get_simple_store()
        print(f"🔧 FIND_CANDIDATES: Using store at memory address: {id(current_store)}")
        
        if USE_PINECONE:
            results = index.query(
                vector=job_embedding,
                top_k=top_k,
                include_metadata=True,
                filter={"type": "candidate"}
            )
        else:
            # Use simple store
            results = current_store.query(job_embedding, top_k=top_k, filter={"type": "candidate"})
        
        print(f"✅ FIND_CANDIDATES: Search completed")
        return results
    except Exception as e:
        print(f"❌ FIND_CANDIDATES: Failed to find similar candidates: {e}")
        import traceback
        traceback.print_exc()
        # Return empty results
        return type('MockResults', (), {'matches': []})

def find_similar_jobs(candidate_text: str, top_k: int = 5):
    """Find similar jobs for a candidate"""
    print(f"🔍 FIND_JOBS: Finding jobs for candidate text: {candidate_text[:50]}...")
    try:
        candidate_embedding = get_embedding(candidate_text)
        print(f"🔧 FIND_JOBS: Generated candidate embedding of length: {len(candidate_embedding)}")
        
        # Ensure we're using the same store instance
        from backend.utils.simple_store import get_simple_store
        current_store = get_simple_store()
        print(f"🔧 FIND_JOBS: Using store at memory address: {id(current_store)}")
        
        if USE_PINECONE:
            results = index.query(
                vector=candidate_embedding,
                top_k=top_k,
                include_metadata=True,
                filter={"type": "job"}
            )
        else:
            # Use simple store
            results = current_store.query(candidate_embedding, top_k=top_k, filter={"type": "job"})
        
        print(f"✅ FIND_JOBS: Search completed")
        return results
    except Exception as e:
        print(f"❌ FIND_JOBS: Failed to find similar jobs: {e}")
        import traceback
        traceback.print_exc()
        # Return empty results
        return type('MockResults', (), {'matches': []})