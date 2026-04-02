def parse_job_description(text: str):
    words = text.strip().split()
    return {
        "title": " ".join(words[:3]) or "Untitled Role",
        "skills": ["Python", "React", "Flask"],  # placeholder skills
        "summary": text[:240] + ("..." if len(text) > 240 else ""),
        "scoreHint": min(100, max(40, len(words) * 2)),
    }
