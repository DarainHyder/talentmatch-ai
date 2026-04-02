import { ApiResponse } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
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
