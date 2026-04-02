# ===== FILE: ./backend/utils/question_generator.py =====

import random

def generate_mock_questions(job_description: str, job_skills: list, candidate_skills: list):
    """
    Generate mock interview questions when OpenAI is unavailable
    """
    base_questions = [
        "Tell us about your experience with {skill}.",
        "Describe a challenging project where you used {skill}.",
        "How do you stay updated with the latest trends in {skill}?",
        "What's your approach to debugging issues in {skill}?",
        "Can you explain a complex concept related to {skill}?",
        "How do you ensure code quality when working with {skill}?",
        "Describe your experience with testing in {skill}.",
        "What best practices do you follow when using {skill}?",
        "How do you handle performance optimization in {skill}?",
        "Describe your experience with version control in {skill} projects."
    ]
    
    # Combine job and candidate skills, prioritize overlapping skills
    all_skills = list(set(job_skills + candidate_skills))
    overlapping_skills = [skill for skill in candidate_skills if skill in job_skills]
    
    # Use overlapping skills first, then other skills
    skills_to_use = overlapping_skills + [s for s in all_skills if s not in overlapping_skills]
    
    questions = []
    used_questions = set()
    
    for skill in skills_to_use[:5]:  # Use top 5 skills
        for template in base_questions:
            if len(questions) >= 8:  # Limit to 8 questions
                break
                
            question = template.format(skill=skill.lower())
            if question not in used_questions:
                questions.append(question)
                used_questions.add(question)
    
    # Add some general questions
    general_questions = [
        "What interests you about this position?",
        "Describe your ideal work environment.",
        "How do you handle tight deadlines?",
        "What's your experience with agile development?",
        "How do you approach learning new technologies?"
    ]
    
    questions.extend(general_questions[:2])
    
    return questions

# Also update the questions route to use the mock generator: