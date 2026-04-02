import React from 'react';

interface SidebarProps {
  activeView: 'overview' | 'candidates' | 'jobs' | 'analytics';
  onViewChange: (view: 'overview' | 'candidates' | 'jobs' | 'analytics') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'candidates', label: 'Candidates', icon: '👥' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ] as const;

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">TalentMatch</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition ${
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Need help?</p>
            <a 
              href="mailto:support@talentmatch.com" 
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
