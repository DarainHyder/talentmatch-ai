import React from 'react';
import { Candidate } from '../types/candidate';
import { JobDescription } from '../types/job';

interface CandidateRankingProps {
  candidates: Candidate[];
  job?: JobDescription;
  onSelectCandidate?: (candidate: Candidate) => void;
  isLoading?: boolean;
}

const CandidateRanking: React.FC<CandidateRankingProps> = ({
  candidates,
  job,
  onSelectCandidate,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Candidate Ranking</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">No candidates to rank yet.</p>
          <p className="text-sm text-gray-500 mt-2">Upload candidate resumes to see AI-powered rankings.</p>
        </div>
      </div>
    );
  }

  const sortedCandidates = [...candidates].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">AI-Powered Candidate Ranking</h3>
        {job && (
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Matching against: {job.title}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills Match
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCandidates.map((candidate, index) => (
              <tr
                key={candidate.id}
                onClick={() => onSelectCandidate?.(candidate)}
                className="hover:bg-gray-50 cursor-pointer transition"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      <span className="font-bold">#{index + 1}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">{candidate.name}</div>
                    <div className="text-sm text-gray-500">{candidate.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-3">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${candidate.matchPercentage || 0}%` }}
                      />
                    </div>
                    <span className="font-semibold">{candidate.matchPercentage || 0}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    candidate.status === 'evaluated'
                      ? 'bg-green-100 text-green-800'
                      : candidate.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {candidate.status || 'new'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{sortedCandidates.length}</div>
            <div className="text-sm text-gray-600">Total Candidates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(sortedCandidates.reduce((acc, c) => acc + (c.matchPercentage || 0), 0) / sortedCandidates.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Match</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {sortedCandidates.filter(c => (c.matchPercentage || 0) >= 70).length}
            </div>
            <div className="text-sm text-gray-600">Strong Matches (70%+)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateRanking;
