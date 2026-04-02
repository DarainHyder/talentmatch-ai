export enum UserRole {
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
  HIRING_MANAGER = 'hiring_manager',
  INTERVIEWER = 'interviewer',
  CANDIDATE = 'candidate'
}

export enum Permission {
  // Job-related
  CREATE_JOB = 'create:job',
  EDIT_JOB = 'edit:job',
  DELETE_JOB = 'delete:job',
  VIEW_ALL_JOBS = 'view:all_jobs',
  
  // Candidate-related
  VIEW_ALL_CANDIDATES = 'view:all_candidates',
  EDIT_CANDIDATE = 'edit:candidate',
  SCORE_CANDIDATE = 'score:candidate',
  
  // AI/System
  CONFIGURE_AI = 'configure:ai',
  VIEW_ANALYTICS = 'view:analytics'
}

export interface UserSession {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  tenantId?: string;
  accessToken?: string;
}

export interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}
