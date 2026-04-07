import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import TranscriptModal from '../components/TranscriptModal';
import Sidebar from '../components/Sidebar';

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? '';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Candidate {
  session_id: string; name: string; email: string;
  cv_score: number; interview_score: number; final_score: number;
  status: string; summary?: string; matched_skills?: string; created_at?: string;
}
interface TranscriptEntry { role: string; message: string; timestamp?: string; }

// ── SVG Icons (Table-Specific) ────────────────────────────────────────────────
const Icons = {
  trending: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/>
    </svg>
  ),
  users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
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

// ── Sub-Components ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const base = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border";
  if (s === 'shortlisted' || s === 'qualified')  
    return <span className={`${base} bg-emerald-50 text-emerald-600 border-emerald-100`}>Qualified</span>;
  if (s === 'under review') 
    return <span className={`${base} bg-amber-50 text-amber-600 border-amber-100`}>Reviewing</span>;
  if (s === 'rejected' || s === 'not_qualified')     
    return <span className={`${base} bg-red-50 text-red-600 border-red-100`}>Rejected</span>;
  return <span className={`${base} bg-slate-50 text-slate-500 border-slate-100`}>{status}</span>;
}

function ProgressRing({ value, size = 48 }: { value: number; size?: number }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#cyanGrad)" strokeWidth="4"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" className="transition-all duration-1000" />
        <defs>
          <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[10px] font-black text-slate-900">{pct}</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${pct}%` }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.2)]"
        />
      </div>
      <span className="text-[11px] font-bold text-slate-500 w-6 text-right tabular-nums">{pct}</span>
    </div>
  );
}

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
    <div className="flex bg-slate-50 min-h-screen text-slate-600">
      <Sidebar onLogout={logout} />

      <main className="flex-1 lg:ml-64 p-8 pt-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">Talent <span className="text-cyan-500">Pipeline.</span></h1>
            <p className="text-slate-500 font-bold tracking-wide uppercase text-[10px] opacity-70">Cognitive Screening Dashboard</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
             {(['all', 'qualified', 'rejected'] as const).map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)}
                 className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   activeTab === tab 
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg shadow-cyan-500/20' 
                    : 'text-slate-400 hover:text-slate-600'
                 }`}>
                 {tab}
               </button>
             ))}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Total Applicants', val: candidates.length, icon: <Icons.users />, color: 'text-cyan-500' },
            { label: 'Avg Final Score', val: candidates.length ? (candidates.reduce((a,b) => a+b.final_score, 0)/candidates.length).toFixed(1) : '0', icon: <Icons.trending />, color: 'text-emerald-500' },
            { label: 'Top Potential', val: candidates.filter(c => c.final_score > 70).length, icon: <Icons.star />, color: 'text-sky-500' },
            { label: 'Active Pipeline', val: candidates.filter(c => c.interview_score > 0).length, icon: <Icons.doc />, color: 'text-blue-500' }
          ].map((s, i) => (
            <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
               className="glass-card bg-white p-10 border-slate-100 flex items-center justify-between group shadow-sm hover:shadow-xl transition-all"
            >
              <div>
                <p className="text-slate-400 text-[11px] uppercase font-black tracking-[0.2em] mb-3">{s.label}</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{s.val}</h3>
              </div>
              <div className={`${s.color} bg-slate-50 w-16 h-16 rounded-[24px] flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-all group-hover:bg-white group-hover:shadow-lg`}>
                {s.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table Container */}
        <div className="glass-card bg-white border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {['Applicant', 'CV Scan', 'Interview', 'Final Score', 'Outcome', ''].map(h => (
                    <th key={h} className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-10 bg-slate-50/10" />
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-32 text-center text-slate-400 font-bold italic">No candidates found in this category.</td></tr>
                ) : (
                  filtered.map((c, i) => (
                    <motion.tr 
                       key={c.session_id} 
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }}
                       transition={{ delay: i * 0.05 }}
                       className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-xl flex items-center justify-center font-black text-white shadow-md shrink-0">
                            {(c.name?.[0] || 'A').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 tracking-tight truncate">{c.name || 'Anonymous Applicant'}</p>
                            <p className="text-xs text-slate-500 truncate">{c.email || 'No email provided'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 w-48"><ProgressBar value={c.cv_score || 0} /></td>
                      <td className="px-8 py-6 w-48"><ProgressBar value={c.interview_score || 0} /></td>
                      <td className="px-8 py-6"><ProgressRing value={c.final_score || 0} /></td>
                      <td className="px-8 py-6"><StatusBadge status={c.status || 'Under Review'} /></td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => openTranscript(c)}
                          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-600 hover:border-cyan-500/50 transition-all flex items-center gap-2 ml-auto"
                        >
                          <Icons.doc /> Details
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
