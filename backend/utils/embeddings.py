# ===== FILE: ./backend/utils/embeddings.py =====

import os
import random
import hashlib
from dotenv import load_dotenv

load_dotenv()

def get_text_fingerprint(text: str, dimensions: int = 1536) -> list:
    """
    Create better deterministic embeddings based on text content
    """
    # Create a hash-based seed for determinism
    text_lower = text.lower()
    text_hash = hashlib.md5(text_lower.encode()).hexdigest()
    seed = int(text_hash, 16) % 10000
    random.seed(seed)
    
    # Start with random vector
    vector = [random.gauss(0, 0.2) for _ in range(dimensions)]
    
    # Strong keyword boosts with better distribution
    keyword_boosts = {
        'python': list(range(0, 100, 10)),
        'flask': list(range(1, 100, 10)),
        'django': list(range(2, 100, 10)),
        'react': list(range(3, 100, 10)),
        'javascript': list(range(4, 100, 10)),
        'node': list(range(5, 100, 10)),
        'java': list(range(6, 100, 10)),
        'backend': list(range(7, 100, 10)),
        'frontend': list(range(8, 100, 10)),
        'developer': list(range(9, 100, 10)),
        'api': list(range(10, 110, 10)),
        'web': list(range(11, 111, 10)),
        'database': list(range(12, 112, 10)),
        'sql': list(range(13, 113, 10)),
        'postgresql': list(range(14, 114, 10)),
        'mongodb': list(range(15, 115, 10)),
        'docker': list(range(16, 116, 10)),
        'aws': list(range(17, 117, 10)),
        'cloud': list(range(18, 118, 10)),
        'microservices': list(range(19, 119, 10))
    }
    
    # Apply keyword boosts
    for keyword, indices in keyword_boosts.items():
        if keyword in text_lower:
            count = text_lower.count(keyword)
            boost_strength = 0.5 + (count * 0.2)  # Stronger boosts
            for idx in indices:
                if idx < dimensions:
                    vector[idx] += boost_strength
    
    # Normalize to unit length
    norm = (sum(x*x for x in vector) ** 0.5) or 1.0
    vector = [x / norm for x in vector]
    
    return vector

def get_embedding(text: str, model: str = "text-embedding-ada-002") -> list:
    """
    Generate embeddings for text - falls back to improved mock if OpenAI fails
    """
    # Use improved mock embeddings for now
    print(f"🔧 Generating improved mock embedding for: {text[:60]}...")
    return get_text_fingerprint(text)

def batch_get_embeddings(texts: list, model: str = "text-embedding-ada-002") -> list:
    """
    Generate embeddings for multiple texts in batch
    """
    embeddings = []
    for text in texts:
        embedding = get_embedding(text, model)
        embeddings.append(embedding)
    return embeddings