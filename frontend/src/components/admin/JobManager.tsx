import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { WithPermission } from '../auth/WithPermission';
import { Permission } from '../../types/rbac.types';

const JobManager: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await api.getJobs();
      setJobs(response.data?.jobs || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requirements = newJob.requirements.split(',').map(r => r.trim());
      await api.createJob({
        ...newJob,
        requirements,
      });
      setShowCreateForm(false);
      setNewJob({ title: '', company: '', location: '', description: '', requirements: '' });
      loadJobs();
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  if (loading) {
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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Job Management</h2>
          <WithPermission permission={Permission.CREATE_JOB}>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              + Create Job
            </button>
          </WithPermission>
        </div>
      </div>

      {showCreateForm && (
        <div className="p-6 border-b bg-gray-50">
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  value={newJob.company}
                  onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={newJob.location}
                  onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements (comma-separated)
                </label>
                <input
                  type="text"
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create Job
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicants
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-500">{job.location}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{job.company}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{job.applicantCount || 0}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    job.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <WithPermission permission={Permission.EDIT_JOB}>
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      Edit
                    </button>
                  </WithPermission>
                  <WithPermission permission={Permission.DELETE_JOB}>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </WithPermission>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobManager;
