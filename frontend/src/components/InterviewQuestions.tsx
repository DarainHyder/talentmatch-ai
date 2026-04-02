import React, { useState } from 'react';

interface InterviewQuestionsProps {
  jobDescription?: string;
  candidateSkills?: string[];
  className?: string;
}

const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({
  jobDescription = '',
  candidateSkills = [],
  className = ''
}) => {
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuestions = async () => {
    if (!jobDescription.trim()) {
      alert('Please provide a job description first');
      return;
    }

    setIsGenerating(true);

    // Simulate AI question generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockQuestions = [
      'Explain how you would implement a scalable microservices architecture for a high-traffic application.',
      'Describe your experience with cloud platforms like AWS or Azure for deploying production applications.',
      'How do you ensure code quality and maintainability in a large TypeScript codebase?',
      'Walk us through your approach to designing a real-time data processing pipeline.',
      'What strategies do you use for optimizing React application performance?',
      'How do you handle data consistency in a distributed system?',
      'Describe a challenging technical problem you solved and your approach.',
      'How do you stay updated with emerging technologies and best practices?',
      'Explain your experience with containerization and orchestration tools.',
      'Describe your approach to mentoring junior developers on the team.'
    ];

    setGeneratedQuestions(mockQuestions);
    setIsGenerating(false);
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">AI-Generated Interview Questions</h3>
        <button
          onClick={generateQuestions}
          disabled={isGenerating || !jobDescription.trim()}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isGenerating ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Generating...
            </>
          ) : (
            'Generate Questions'
          )}
        </button>
      </div>

      {jobDescription ? (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-1">Job Context:</p>
          <p className="text-sm text-blue-700 line-clamp-2">{jobDescription.substring(0, 200)}...</p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">⚠️ Add a job description first to generate relevant questions</p>
        </div>
      )}

      {candidateSkills.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Candidate Skills Detected:</p>
          <div className="flex flex-wrap gap-2">
            {candidateSkills.slice(0, 8).map(skill => (
              <span key={skill} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                {skill}
              </span>
            ))}
            {candidateSkills.length > 8 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                +{candidateSkills.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {generatedQuestions.length > 0 ? (
        <div className="space-y-4">
          {generatedQuestions.map((question, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">{index + 1}</span>
                </div>
                <div>
                  <p className="text-gray-800 mb-2">{question}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-3">🎯 Technical</span>
                    <span>⏱️ 5-10 min</span>
                  </div>
                </div>
                <button className="ml-auto text-gray-400 hover:text-blue-600">
                  <span className="sr-only">Copy question</span>
                  📋
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-gray-600 mb-2">No questions generated yet</p>
          <p className="text-sm text-gray-500">Click "Generate Questions" to create AI-powered interview questions</p>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">🎯</div>
            <div className="text-gray-600">Technical Depth</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">🧠</div>
            <div className="text-gray-600">Problem Solving</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">🏢</div>
            <div className="text-gray-600">Cultural Fit</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">⚡</div>
            <div className="text-gray-600">Adaptability</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestions;
