import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TranscriptEntry, Candidate } from '../types/dashboard.types';
import Sidebar from '../components/Sidebar';
import TranscriptModal from '../components/TranscriptModal';

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? '';

const Icons = {
  trending: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>),
  users:    () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  verified: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
};

function StatusBadge({ status }: { status: string }) {
  const isQualified = status.toLowerCase().includes('qualified');
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isQualified ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-500'}`}>
      {status}
    </span>
  );
}

function ProgressRing({ value, size = 48 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90"><circle className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} />
        <circle className="text-cyan-500" strokeWidth="4" strokeDasharray={circ} strokeDashoffset={offset} stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} />
      </svg>
      <span className="absolute text-[10px] font-black text-slate-800">{Math.round(value)}</span>
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'qualified' | 'rejected'>('all');

  // V6 Stability: Internal Auth Guard
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res   = await fetch(`${API_BASE}/api/candidates`, { headers: { Authorization: `Bearer ${token}` } });
        const data  = await res.json();
        if (Array.isArray(data)) setCandidates(data);
      } catch (e) { console.error('Data sync failed', e); }
      finally { setLoading(false); }
    };
    fetchCandidates();
  }, [user]);

  const viewTranscript = async (candidate: Candidate) => {
    setSelected(candidate);
    setModalLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res   = await fetch(`${API_BASE}/api/candidates/${candidate.session_id}/transcript`, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      if (data.transcript) setTranscript(data.transcript);
    } catch (e) { setTranscript([]); }
    finally { setModalLoading(false); }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-lg" />
      </div>
    );
  }

  const filtered = candidates.filter(c => {
    if (activeTab === 'qualified') return c.status.toLowerCase().includes('qualified');
    if (activeTab === 'rejected') return c.status.toLowerCase().includes('rejected');
    return true;
  });

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar onLogout={logout} />

      <main className="flex-1 lg:ml-64 p-8 pt-12 overflow-x-hidden">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">Evaluation <span className="text-cyan-500">Core.</span></h1>
            <p className="text-slate-500 font-bold tracking-wide uppercase text-[10px] opacity-70">Neural Assessment Pipeline Dashboard</p>
          </div>
          
          <div className="flex bg-white/50 p-1.5 rounded-2xl border border-slate-100 shadow-sm backdrop-blur-sm">
            {(['all', 'qualified', 'rejected'] as const).map(tab => (
              <button key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-cyan-600 shadow-sm border border-slate-100 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Total Applicants', val: candidates.length, icon: <Icons.users />, color: 'text-cyan-500' },
            { label: 'Qualified Pipeline', val: candidates.filter(c => c.status.toLowerCase().includes('qualified')).length, icon: <Icons.verified />, color: 'text-emerald-500' },
            { label: 'Engagement Rate', val: '94%', icon: <Icons.trending />, color: 'text-sky-500' },
          ].map((s, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="glass-card bg-white p-8 border-slate-100 shadow-sm group hover:scale-[1.02] transition-transform">
               <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-slate-50 ${s.color} group-hover:scale-110 transition-transform`}>
                    {s.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-900 italic">{s.val}</span>
               </div>
               <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card bg-white border-slate-100 shadow-sm overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Candidate Matrix</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">AI Scoring</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Evaluation State</th>
                  <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6 h-20 bg-slate-50/10"></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic">No candidates matching the current neural criteria.</td></tr>
                ) : (
                  filtered.map((c, i) => (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={c.session_id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs border border-slate-100 group-hover:border-cyan-200 transition-colors">
                              {c.name[0].toUpperCase()}
                           </div>
                           <div>
                             <p className="text-sm font-black text-slate-800 tracking-tight">{c.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 lowercase">{c.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1">CV Base</p>
                            <span className="text-sm font-black text-slate-800">{c.cv_score.toFixed(0)}</span>
                          </div>
                          <div className="h-4 w-[1px] bg-slate-100" />
                          <div>
                            <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1">Final Index</p>
                            <span className="text-sm font-black text-cyan-500 italic">{c.final_score.toFixed(0)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => viewTranscript(c)} className="btn-primary !px-5 !py-2.5 rounded-xl !text-[9px] scale-90 group-hover:scale-100 transition-transform">
                          View Intel
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

      <AnimatePresence>
        {selected && (
          <TranscriptModal 
            candidate={selected} 
            transcript={modalLoading ? [] : transcript}
            onClose={() => { setSelected(null); setTranscript([]); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
