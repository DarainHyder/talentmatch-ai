export interface JobDescription {
  id: string;
  title: string;
  description: string;
  company?: string;
  location?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'draft' | 'active' | 'closed';
}

export interface JobAnalysisRequest {
  jobText: string;
  parseSkills?: boolean;
  generateQuestions?: boolean;
}

export interface JobAnalysisResult {
  jobId: string;
  parsedSkills: {
    required: string[];
    preferred: string[];
  };
  suggestedInterviewQuestions: string[];
  marketAlignmentScore?: number;
}
