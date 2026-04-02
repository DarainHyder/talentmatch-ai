# ===== FILE: ./config.py =====

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    DEBUG = os.getenv('DEBUG', False)
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
    PINECONE_INDEX = os.getenv("PINECONE_INDEX", "talentmatch")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # Embedding model settings
    EMBEDDING_MODEL = "text-embedding-ada-002"
    EMBEDDING_DIMENSIONS = 1536