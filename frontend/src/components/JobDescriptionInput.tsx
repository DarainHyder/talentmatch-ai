import React, { useState } from 'react';
import { JobDescriptionInputProps } from '../types/components';

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  onJobAnalyzed,
  initialValue = '',
  disabled = false,
  className = ''
}) => {
  const [jobText, setJobText] = useState(initialValue);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobText.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate API call - in production, connect to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock job analysis result
      const mockJob = {
        id: `job-${Date.now()}`,
        title: 'Senior Software Engineer',
        description: jobText,
        requiredSkills: ['TypeScript', 'React', 'Node.js', 'AWS'],
        preferredSkills: ['GraphQL', 'Docker', 'Kubernetes'],
        experienceLevel: 'senior' as const,
        status: 'active' as const
      };

      onJobAnalyzed(mockJob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job description');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Analyze Job Description</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste Job Description
        </label>
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          disabled={disabled || isAnalyzing}
          placeholder="Paste the job description here. Our AI will analyze required skills, experience level, and generate interview questions..."
          className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {jobText.length > 0 ? `${jobText.length} characters` : 'Enter job description'}
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={disabled || isAnalyzing || !jobText.trim()}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isAnalyzing ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Analyzing...
            </>
          ) : (
            'Analyze with AI'
          )}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>✨ AI-powered analysis will identify:</p>
        <ul className="list-disc list-inside ml-2 mt-1">
          <li>Required and preferred skills</li>
          <li>Experience level (Entry/Mid/Senior)</li>
          <li>Key responsibilities and qualifications</li>
        </ul>
      </div>
    </div>
  );
};

export default JobDescriptionInput;
