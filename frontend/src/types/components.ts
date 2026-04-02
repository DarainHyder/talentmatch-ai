import { Candidate } from './candidate';
import { JobDescription } from './job';

export interface JobDescriptionInputProps {
  onJobAnalyzed: (job: JobDescription) => void;
  initialValue?: string;
  disabled?: boolean;
  className?: string;
}

export interface CandidateUploadProps {
  onUploadComplete: (candidates: Candidate[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  jobId?: string;
}

export interface RankingTableProps {
  candidates: Candidate[];
  job: JobDescription;
  onSelectCandidate?: (candidate: Candidate) => void;
  isLoading?: boolean;
}

export interface DashboardProps {
  activeView: 'overview' | 'candidates' | 'jobs' | 'analytics';
  userId?: string;
}
