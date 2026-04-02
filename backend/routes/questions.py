# ===== FILE: ./backend/routes/questions.py =====

from flask import Blueprint, request, jsonify
from backend.utils.question_generator import generate_mock_questions
import openai
import os

questions_bp = Blueprint("questions", __name__)

# POST route to generate questions
@questions_bp.route("/generate", methods=["POST"])
def generate_questions():
    data = request.json
    job_description = data.get("job_description", "")
    candidate_skills = data.get("candidate_skills", [])
    job_skills = data.get("job_skills", [])
    
    if not job_description:
        return jsonify({"error": "Job description is required"}), 400

    try:
        # First try OpenAI
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            # Use OpenAI to generate relevant interview questions
            prompt = f"""
            Generate 5-7 technical interview questions for a candidate applying to this role:
            
            Job Description: {job_description}
            
            Required Skills: {', '.join(job_skills)}
            Candidate Skills: {', '.join(candidate_skills)}
            
            Generate relevant technical questions that assess:
            1. Technical proficiency in required skills
            2. Problem-solving abilities  
            3. Relevant experience
            4. Cultural fit for technical roles
            
            Return only the questions as a numbered list.
            """
            
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a technical hiring manager creating interview questions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            questions_text = response.choices[0].message.content.strip()
            questions = [q.strip() for q in questions_text.split('\n') if q.strip() and (q[0].isdigit() or q.startswith('-'))]
            
            # Clean up question formatting
            cleaned_questions = []
            for q in questions:
                # Remove numbers and bullets
                clean_q = q.split('.', 1)[-1].strip() if '.' in q else q
                clean_q = clean_q.replace('-', '').strip()
                if clean_q:
                    cleaned_questions.append(clean_q)
            
            return jsonify({
                "questions": cleaned_questions,
                "count": len(cleaned_questions),
                "source": "openai"
            })
        else:
            raise Exception("No OpenAI API key")
            
    except Exception as e:
        print(f"⚠️  OpenAI question generation failed: {e}, using mock questions")
        # Fallback to mock questions
        questions = generate_mock_questions(job_description, job_skills, candidate_skills)
        
        return jsonify({
            "questions": questions,
            "count": len(questions),
            "source": "mock",
            "note": "Using mock questions due to OpenAI quota limits"
        })


# POST route to submit a question and get evaluation
@questions_bp.route("/submit", methods=["POST"])
def submit_question():
    data = request.json
    question = data.get("question", "")
    answer = data.get("answer", "")
    context = data.get("context", "")  # Job description or relevant context
    
    if not question or not answer:
        return jsonify({"error": "Question and answer are required"}), 400

    try:
        # Use OpenAI to evaluate the answer
        prompt = f"""
        Evaluate this interview answer:
        
        Question: {question}
        Answer: {answer}
        Context: {context}
        
        Provide:
        1. A score from 1-10
        2. Brief feedback on the answer quality
        3. Suggestions for improvement
        
        Format as JSON: {{"score": number, "feedback": "text", "improvements": "text"}}
        """
        
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an experienced technical interviewer evaluating candidate responses."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.3
        )
        
        evaluation_text = response.choices[0].message.content.strip()
        
        # Simple parsing (in production, you'd want more robust JSON parsing)
        import json
        try:
            evaluation = json.loads(evaluation_text)
        except:
            evaluation = {
                "score": 7,
                "feedback": "Answer was evaluated but parsing failed",
                "improvements": "Provide more specific examples and details"
            }
        
        return jsonify({
            "status": "evaluated",
            "evaluation": evaluation
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to evaluate answer: {str(e)}"}), 500