# ===== FILE: ./utils/simple_store.py =====

"""
Simple in-memory store for testing without Pinecone
"""

class SimpleVectorStore:
    def __init__(self):
        self.vectors = {}
        self.metadata = {}
        print("🔄 SimpleVectorStore initialized - NEW VERSION")
        print(f"   Memory address: {id(self)}")
    
    def upsert(self, items):
        """Store vectors with metadata"""
        print(f"📥 SIMPLE STORE: Storing {len(items)} items")
        try:
            for i, item in enumerate(items):
                if len(item) >= 3:
                    vector_id, vector, metadata = item
                    self.vectors[vector_id] = vector
                    self.metadata[vector_id] = metadata
                    print(f"   ✅ Stored: {vector_id} - {metadata.get('name', 'No name')}")
                    print(f"   📊 Vector length: {len(vector)}")
                else:
                    print(f"⚠️  Invalid item format: {item}")
            print(f"📊 SIMPLE STORE: Total vectors stored: {len(self.vectors)}")
            print(f"📊 SIMPLE STORE: Total metadata entries: {len(self.metadata)}")
        except Exception as e:
            print(f"❌ SIMPLE STORE Error in upsert: {e}")
            import traceback
            traceback.print_exc()
    
    def query(self, vector, top_k=10, filter=None):
        """Simple cosine similarity search"""
        try:
            import numpy as np
            from sklearn.metrics.pairwise import cosine_similarity
            
            print(f"🔍 SIMPLE STORE: Querying with filter: {filter}")
            print(f"📊 SIMPLE STORE: Total vectors: {len(self.vectors)}")
            
            results = []
            for vector_id, stored_vector in self.vectors.items():
                # Apply filter
                current_type = self.metadata[vector_id].get('type')
                if filter and current_type != filter.get('type'):
                    continue
                
                # Calculate cosine similarity
                similarity = cosine_similarity([vector], [stored_vector])[0][0]
                results.append({
                    'id': vector_id,
                    'score': similarity,
                    'metadata': self.metadata[vector_id]
                })
            
            # Sort by score and return top_k
            results.sort(key=lambda x: x['score'], reverse=True)
            print(f"✅ SIMPLE STORE: Found {len(results)} matches, returning top {top_k}")
            return type('MockResults', (), {'matches': results[:top_k]})
        except Exception as e:
            print(f"❌ SIMPLE STORE Error in query: {e}")
            import traceback
            traceback.print_exc()
            return type('MockResults', (), {'matches': []})
    
    def fetch(self, ids):
        """Fetch vectors by IDs"""
        try:
            vectors = {}
            for vector_id in ids:
                if vector_id in self.vectors:
                    vectors[vector_id] = type('MockVector', (), {
                        'values': self.vectors[vector_id],
                        'metadata': self.metadata[vector_id]
                    })
            return type('MockFetchResponse', (), {'vectors': vectors})
        except Exception as e:
            print(f"❌ SIMPLE STORE Error in fetch: {e}")
            return type('MockFetchResponse', (), {'vectors': {}})

# Create a global instance
_simple_store_instance = None

def get_simple_store():
    """Get or create the simple store instance"""
    global _simple_store_instance
    if _simple_store_instance is None:
        _simple_store_instance = SimpleVectorStore()
    return _simple_store_instance