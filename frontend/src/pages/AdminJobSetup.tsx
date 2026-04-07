import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? '';

interface Job { id?: number; title: string; description: string; required_skills: string; updated_at?: string; }

const Icons = {
  save: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>),
  info: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>),
};

const AdminJobSetup: React.FC = () => {
  const { logout } = useAuth();
  const [job, setJob] = useState<Job>({ title: '', description: '', required_skills: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs`)
      .then(r => r.json())
      .then(d => { if (d.job) setJob(d.job); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const skills = job.required_skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: job.title, description: job.description, required_skills: skills }),
      });
      if (!res.ok) throw new Error('Save failed.');
      showToast('success', 'Configuration updated successfully.');
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const skillList = (job.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar onLogout={logout} />

      <main className="flex-1 lg:ml-64 p-8 pt-12">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div 
               initial={{ opacity: 0, y: -20 }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0, y: -20 }}
               className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl border ${
                 toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-500 border-red-400 text-white'
               }`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">Job <span className="text-cyan-500">Params.</span></h1>
          <p className="text-slate-500 font-bold tracking-wide uppercase text-[10px] opacity-70">Active Recruitment Environment</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="glass-card bg-white p-10 border-slate-100 shadow-sm space-y-8">
              {loading ? (
                <div className="py-20 text-center text-slate-400 font-bold italic">Loading environment variables...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3 ml-1">Official Job Title</label>
                    <input 
                      type="text" 
                      value={job.title} 
                      onChange={e => setJob(j => ({ ...j, title: e.target.value }))}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:border-cyan-500/50 focus:bg-white outline-none transition-all"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3 ml-1">Target Skills (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={job.required_skills} 
                      onChange={e => setJob(j => ({ ...j, required_skills: e.target.value }))}
                      placeholder="Python, React, AWS, Docker..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:border-cyan-500/50 focus:bg-white outline-none transition-all"
                    />
                    <div className="flex flex-wrap gap-2 mt-4">
                       {skillList.map(s => (
                         <span key={s} className="px-3 py-1 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-lg text-[10px] font-black uppercase tracking-wider">{s}</span>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3 ml-1">Contextual Description</label>
                    <textarea 
                      rows={6} 
                      value={job.description} 
                      onChange={e => setJob(j => ({ ...j, description: e.target.value }))}
                      placeholder="Paste the full job description here..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:border-cyan-500/50 focus:bg-white outline-none transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="w-full btn-primary py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {saving ? 'Syncing...' : <><Icons.save /> Commit Changes</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 border-slate-100 bg-cyan-50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                 <div className="text-cyan-600"><Icons.info /></div>
                 <h4 className="text-cyan-800 font-black uppercase tracking-widest text-xs">Optimization Hint</h4>
              </div>
              <p className="text-sm leading-relaxed text-cyan-700 font-medium italic">
                "Our AI uses Semantic Matching. You don't need every keyword—just provide the core responsibilities and the engine will handle the rest."
              </p>
            </div>
            
            <div className="glass-card bg-white p-8 border-slate-100 shadow-sm">
              <h4 className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-4">Last Synced</h4>
              <p className="text-sm text-slate-900 font-black italic">
                {job.updated_at ? new Date(job.updated_at).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminJobSetup;
