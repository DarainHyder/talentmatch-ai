export interface Candidate {
  id: string;
  name: string;
  email: string;
  resumeText: string;
  skills: string[];
  score?: number;
  matchPercentage?: number;
  status?: 'new' | 'processing' | 'evaluated' | 'archived';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CandidateUploadRequest {
  resumeText: string;
  targetJobId?: string;
  metadata?: {
    source?: string;
    experienceLevel?: 'entry' | 'mid' | 'senior';
    noticePeriod?: number;
  };
}

export interface CandidateScoringResult {
  candidateId: string;
  jobId: string;
  score: number;
  matchPercentage: number;
  skillMatches: string[];
  missingSkills: string[];
  recommendations: string[];
}
