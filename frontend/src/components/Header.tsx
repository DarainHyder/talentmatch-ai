import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/rbac.types';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'bg-red-100 text-red-800',
      [UserRole.RECRUITER]: 'bg-blue-100 text-blue-800',
      [UserRole.HIRING_MANAGER]: 'bg-green-100 text-green-800',
      [UserRole.INTERVIEWER]: 'bg-yellow-100 text-yellow-800',
      [UserRole.CANDIDATE]: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">TM</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">TalentMatch</span>
            </Link>
            
            {user && (
              <nav className="ml-10 flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/jobs"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Jobs
                </Link>
                <Link
                  to="/dashboard/candidates"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Candidates
                </Link>
                <Link
                  to="/dashboard/analytics"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Analytics
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-800 font-medium">
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3 text-left">
                      <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm text-gray-900">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Your Profile
                      </Link>
                      
                      <Link
                        to="/dashboard/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Settings
                      </Link>
                      
                      {user.role === UserRole.ADMIN && (
                        <Link
                          to="/admin/users"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          User Management
                        </Link>
                      )}
                      
                      <div className="border-t">
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/login"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
