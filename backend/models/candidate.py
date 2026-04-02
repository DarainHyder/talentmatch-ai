# ===== FILE: ./models/candidate.py =====

from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Candidate:
    id: str
    name: str
    email: str
    resume_text: str
    experience: Optional[str] = None
    skills: List[str] = None
    phone: Optional[str] = None
    
    def __post_init__(self):
        if self.skills is None:
            self.skills = []