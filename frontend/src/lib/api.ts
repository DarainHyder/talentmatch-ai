import { ApiResponse } from '../types/api';

const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
const API_URL = (rawApiUrl || 'http://localhost:5000').replace(/\/$/, '');
if (import.meta.env.PROD && !rawApiUrl) {
  console.warn('Production build missing backend API URL. Set VITE_API_URL or VITE_API_BASE_URL in the environment.');
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Jobs
  async getJobs(): Promise<ApiResponse> {
    return this.request('/api/jobs');
  }
  
  async createJob(jobData: any): Promise<ApiResponse> {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }
  
  // Candidates
  async getCandidates(): Promise<ApiResponse> {
    return this.request('/api/candidates');
  }
  
  // AI Matching
  async matchCandidate(jobId: string, candidateId: string): Promise<ApiResponse> {
    return this.request('/api/ai/match', {
      method: 'POST',
      body: JSON.stringify({ jobId, candidateId }),
    });
  }
  
  // Analytics
  async getAnalytics(): Promise<ApiResponse> {
    return this.request('/api/analytics/overview');
  }
  
  // Auth
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
  
  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/api/auth/me');
  }
}

export const api = new ApiService();
