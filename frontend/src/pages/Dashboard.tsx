import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TranscriptModal from '../components/TranscriptModal';

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? '';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Candidate {
  session_id: string; name: string; email: string;
  cv_score: number; interview_score: number; final_score: number;
  status: string; summary?: string; matched_skills?: string; created_at?: string;
}
interface TranscriptEntry { role: string; message: string; timestamp?: string; }

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  grid: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
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
  trending: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/>
    </svg>
  ),
  star: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  doc: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
    </svg>
  ),
};

// ── Components ────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const base = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border";
  if (s === 'shortlisted' || s === 'qualified')  
    return <span className={`${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`}>Qualified</span>;
  if (s === 'under review') 
    return <span className={`${base} bg-amber-500/10 text-amber-400 border-amber-500/20`}>Reviewing</span>;
  if (s === 'rejected' || s === 'not_qualified')     
    return <span className={`${base} bg-red-500/10 text-red-400 border-red-500/20`}>Rejected</span>;
  return <span className={`${base} bg-slate-500/10 text-slate-400 border-slate-500/20`}>{status}</span>;
}

function ProgressRing({ value, size = 48 }: { value: number; size?: number }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#purpleGrad)" strokeWidth="4"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" className="transition-all duration-1000" />
        <defs>
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[10px] font-black text-white">{pct}</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-navy-800 rounded-full overflow-hidden border border-white/5">
        <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${pct}%` }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="h-full bg-purple-gradient rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)]"
        />
      </div>
      <span className="text-[11px] font-bold text-slate-400 w-6 text-right tabular-nums">{pct}</span>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const loc = useLocation();
  const navItems = [
    { to: '/dashboard', icon: <Icons.grid />, label: 'Dashboard' },
    { to: '/admin/job-setup', icon: <Icons.briefcase />, label: 'Job Setup' },
    { to: '/', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>, label: 'Go to Site' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-navy-900 border-r border-white/5 z-50 flex flex-col hidden lg:flex">
      <div className="p-8 pb-12 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-gradient rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
           <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <span className="text-xl font-black text-white tracking-tighter">Admin.</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const active = loc.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                active ? 'bg-purple-gradient text-white shadow-lg shadow-purple-500/20 scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'
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

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'qualified' | 'rejected'>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_BASE}/api/chat/sessions`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) { logout(); return; }
        const data = await res.json();
        setCandidates(data.candidates || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, [logout]);

  const openTranscript = async (c: Candidate) => {
    setSelected(c); setModalLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const data = await fetch(`${API_BASE}/api/chat/sessions/${c.session_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      setTranscript(data.transcript || []);
    } catch { setTranscript([]); } finally { setModalLoading(false); }
  };

  const filtered = candidates.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'qualified') return c.status === 'qualified' || c.status === 'shortlisted';
    return c.status === 'rejected' || c.status === 'not_qualified';
  });

  return (
    <div className="flex bg-navy-900 min-h-screen text-slate-300">
      <Sidebar onLogout={logout} />

      <main className="flex-1 lg:ml-64 p-8 pt-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Talent Pipeline</h1>
            <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px]">Candidate Overview & Performance</p>
          </div>
          <div className="flex items-center gap-4 bg-navy-800 p-1 rounded-2xl border border-white/5 shadow-xl">
             {(['all', 'qualified', 'rejected'] as const).map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)}
                 className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   activeTab === tab ? 'bg-purple-gradient text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                 }`}>
                 {tab}
               </button>
             ))}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Applicants', val: candidates.length, icon: <Icons.users />, color: 'text-purple-400' },
            { label: 'Avg Final Score', val: candidates.length ? (candidates.reduce((a,b) => a+b.final_score, 0)/candidates.length).toFixed(1) : '0', icon: <Icons.trending />, color: 'text-emerald-400' },
            { label: 'Top Potential', val: candidates.filter(c => c.final_score > 70).length, icon: <Icons.star />, color: 'text-amber-400' },
            { label: 'Completion Rate', val: candidates.length ? `${((candidates.filter(c => c.interview_score > 0).length/candidates.length)*100).toFixed(0)}%` : '0%', icon: <Icons.grid />, color: 'text-blue-400' }
          ].map((s, i) => (
            <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="glass-card p-8 border-white/5 flex items-center justify-between group"
            >
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-2">{s.label}</p>
                <h3 className="text-3xl font-black text-white">{s.val}</h3>
              </div>
              <div className={`${s.color} bg-white/5 w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Candidates Table */}
        <div className="glass-card border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy-800 border-b border-white/5">
                  {['Applicant', 'CV Scan', 'Interview', 'Final Score', 'Outcome', ''].map(h => (
                    <th key={h} className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-10 bg-white/5" />
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-32 text-center text-slate-500 font-bold italic">No candidates found in this category.</td></tr>
                ) : (
                  filtered.map((c, i) => (
                    <motion.tr 
                       key={c.session_id} 
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }}
                       transition={{ delay: i * 0.05 }}
                       className="group hover:bg-white/5 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-gradient rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/10">
                            {c.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white tracking-tight">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 w-48"><ProgressBar value={c.cv_score} /></td>
                      <td className="px-8 py-6 w-48"><ProgressBar value={c.interview_score} /></td>
                      <td className="px-8 py-6">
                        <ProgressRing value={c.final_score} />
                      </td>
                      <td className="px-8 py-6"><StatusBadge status={c.status} /></td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => openTranscript(c)}
                          className="px-4 py-2 bg-navy-800 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-400 hover:border-purple-500/50 transition-all flex items-center gap-2 ml-auto"
                        >
                          <Icons.doc /> View Details
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selected && (
        <TranscriptModal 
          candidate={selected} 
          transcript={modalLoading ? [] : transcript}
          onClose={() => { setSelected(null); setTranscript([]); }} 
        />
      )}
    </div>
  );
};

export default Dashboard;
