// ===== FILE: ./src/utils/api.js =====

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Helper function to handle API calls with production fallback
async function makeApiCall(endpoint, options = {}) {
  // If we're in production and no API URL is set, use mock data
  if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
    console.warn('No backend API configured in production. Using mock data.');
    return getMockData(endpoint, options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed to ${endpoint}:`, error);
    
    // In production without backend, return mock data
    if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
      console.log('Falling back to mock data');
      return getMockData(endpoint, options.body);
    }
    
    throw error;
  }
}

// Mock data generator for production without backend
function getMockData(endpoint, body) {
  const bodyData = body ? JSON.parse(body) : {};
  
  switch (endpoint) {
    case '/jobs/analyze':
      const jobText = bodyData.job_text || '';
      const words = jobText.trim().split(/\s+/).filter(Boolean);
      return {
        title: words.slice(0, 3).join(' ') || 'Untitled Role',
        skills: ['Python', 'React', 'JavaScript', 'Node.js'].slice(0, Math.min(4, Math.max(1, Math.floor(words.length / 10)))),
        summary: jobText.slice(0, 240) + (jobText.length > 240 ? '...' : ''),
        scoreHint: Math.min(100, Math.max(40, Math.floor(words.length * 2))),
        job_id: `mock_job_${Date.now()}`,
        candidate_count: 0,
        matching_candidates: [],
        storage_status: 'mock'
      };

    case '/candidates/upload':
      const candidates = bodyData.candidates || [];
      return candidates.map((candidate, index) => ({
        id: `mock_candidate_${Date.now()}_${index}`,
        name: candidate.name || `Candidate ${index + 1}`,
        email: candidate.email || `${candidate.name?.toLowerCase().replace(/\s+/g, '.')}@example.com` || `candidate${index + 1}@example.com`,
        experience: candidate.experience || `${2 + (index % 5)} years`,
        skills: candidate.skills || ['General Skills'],
        score: Math.floor(60 + Math.random() * 40), // Mock score 60-99
        status: 'processed'
      }));

    case '/questions/generate':
      const jobSkills = bodyData.job_skills || [];
      const candidateSkills = bodyData.candidate_skills || [];
      const baseQuestions = [
        "Tell us about your experience with relevant technologies.",
        "Describe a challenging project you worked on.",
        "How do you approach problem-solving?",
        "What's your experience with team collaboration?",
        "How do you stay updated with industry trends?"
      ];
      
      const skillQuestions = [...jobSkills, ...candidateSkills]
        .slice(0, 3)
        .map(skill => `What's your experience with ${skill}?`);
      
      return {
        questions: [...skillQuestions, ...baseQuestions].slice(0, 8),
        count: 8,
        source: 'mock'
      };

    case '/candidates/debug':
      return {
        candidates: [],
        total_candidates: 0,
        store_type: 'mock'
      };

    case '/candidates/add':
      return {
        candidate_id: `mock_candidate_${Date.now()}`,
        name: bodyData.name || 'Unknown Candidate',
        status: 'candidate added (mock)'
      };

    default:
      return { message: 'Mock data for ' + endpoint, status: 'mock' };
  }
}

// Analyze job description
export async function analyzeJobDescription(jobText) {
  const data = await makeApiCall('/jobs/analyze', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_text: jobText })
  });
  console.log("Job analysis response:", data);
  return data;
}

// Upload candidates
export async function uploadCandidateFiles(filesOrNames, parsedJD = {}) {
  // Convert file names or File objects to candidate objects
  const candidates = filesOrNames.map((item, index) => {
    if (typeof item === 'string') {
      return {
        name: item,
        email: `${item.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        resume: `Experienced ${item} with relevant skills.`,
        experience: `${2 + (index % 5)} years`,
        skills: parsedJD.skills ? parsedJD.skills.slice(0, 3) : ["General Skills"]
      };
    } else {
      return {
        name: item.name.replace(/\.[^/.]+$/, ""),
        email: `${item.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/\s+/g, '.')}@example.com`,
        resume: `Resume content for ${item.name}`,
        experience: `${2 + (index % 5)} years`,
        skills: parsedJD.skills ? parsedJD.skills.slice(0, 3) : ["General Skills"]
      };
    }
  });

  const data = await makeApiCall('/candidates/upload', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidates })
  });
  
  console.log("Candidate upload response:", data);
  
  // Format the response to match frontend expectations
  return data.map(candidate => ({
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    experience: candidate.experience,
    skills: candidate.skills,
    score: candidate.score || Math.floor(50 + Math.random() * 50)
  }));
}

// Generate interview questions
export async function generateInterviewQuestions(parsedJD = {}, candidates = []) {
  const data = await makeApiCall('/questions/generate', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job_description: parsedJD.summary || "Technical role",
      job_skills: parsedJD.skills || [],
      candidate_skills: candidates.flatMap(c => c.skills || []).slice(0, 5)
    })
  });
  
  console.log("Questions response:", data);
  return data.questions || [];
}

// Add single candidate
export async function addCandidate(candidateData) {
  const data = await makeApiCall('/candidates/add', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidateData)
  });
  return data;
}

// Debug endpoint to see stored candidates
export async function getStoredCandidates() {
  const data = await makeApiCall('/candidates/debug');
  console.log("Stored candidates:", data);
  return data;
}