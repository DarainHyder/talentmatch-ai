import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { WithPermission } from '../auth/WithPermission';
import { Permission } from '../../types/rbac.types';

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await api.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">No analytics data available.</p>
      </div>
    );
  }

  return (
    <WithPermission permission={Permission.VIEW_ANALYTICS}>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Key hiring metrics and insights</p>
        </div>

        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-600 font-medium">Total Candidates</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.totalCandidates || 0}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-green-600 font-medium">Active Jobs</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.totalJobs || 0}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-sm text-purple-600 font-medium">Avg Match Score</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.averageMatchScore || 0}%
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <div className="text-sm text-orange-600 font-medium">Hiring Velocity</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.hiringVelocity || 'N/A'}
              </div>
            </div>
          </div>

          {/* Candidate Pipeline */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Pipeline</h3>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(analytics.candidatePipeline || {}).map(([stage, count]) => (
                <div key={stage} className="text-center">
                  <div className="bg-indigo-100 text-indigo-800 rounded-lg p-4">
                    <div className="text-2xl font-bold">{count as number}</div>
                    <div className="text-sm font-medium capitalize mt-1">{stage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills in Pipeline</h3>
            <div className="flex flex-wrap gap-2">
              {analytics.topSkills?.map((skill: string, index: number) => (
                <span
                  key={skill}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    index < 3 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WithPermission>
  );
};

export default AnalyticsDashboard;
