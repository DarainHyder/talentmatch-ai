import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Icons = {
  grid: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  briefcase: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  ),
  logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const loc = useLocation();
  const navItems = [
    { to: '/dashboard', icon: <Icons.grid />, label: 'Dashboard' },
    { to: '/admin/job-setup', icon: <Icons.briefcase />, label: 'Job Setup' },
    { to: '/', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>, label: 'Go to Site' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 z-50 flex flex-col hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-8 pb-12 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <span className="text-xl font-black text-slate-800 tracking-tighter">Admin.</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const active = loc.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                active 
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/20 scale-[1.02]' 
                  : 'text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all'
              }`}>
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <button onClick={onLogout} className="flex items-center gap-4 px-5 py-3.5 rounded-2xl w-full font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all">
          <Icons.logout />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
