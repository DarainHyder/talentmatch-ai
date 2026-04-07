import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? '';

interface AdminJobSetupProps {
  user: any;
  isLoading: boolean;
  logout: () => void;
}

const AdminJobSetup: React.FC<AdminJobSetupProps> = ({ user, isLoading, logout }) => {
  const navigate = useNavigate();
  const [job, setJob] = useState<any>({ title: '', description: '', required_skills: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // V7 Stability: Internal Auth Guard (Prop Driven)
  useEffect(() => {
    if (!isLoading && !user) navigate('/login', { replace: true });
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/api/jobs`)
      .then(r => r.json())
      .then(d => { if (d.job) setJob(d.job); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const skills = job.required_skills.split(',').map((s: string) => s.trim()).filter(Boolean);
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

  const skillList = (job.required_skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-lg" />
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar onLogout={logout} />

      <main className="flex-1 lg:ml-64 p-8 pt-12">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
               className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl border ${
                 toast.type === 'success' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-red-50 border-red-400 text-white'
               }`}>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">Job <span className="text-cyan-500">Params.</span></h1>
          <p className="text-slate-500 font-bold tracking-wide uppercase text-[10px] opacity-70">Neural Recruitment Environment Parameters</p>
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
                    <input type="text" value={job.title} onChange={e => setJob((j: any) => ({ ...j, title: e.target.value }))}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:border-cyan-500/50 focus:bg-white outline-none transition-all" required />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3 ml-1">Target Skills (Comma Separated)</label>
                    <input type="text" value={job.required_skills} onChange={e => setJob((j: any) => ({ ...j, required_skills: e.target.value }))}
                      placeholder="Python, React, AWS, Docker..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:border-cyan-500/50 focus:bg-white outline-none transition-all" />
                    <div className="flex flex-wrap gap-2 mt-4">
                       {skillList.map((s: string) => (
                         <span key={s} className="px-3 py-1 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-lg text-[10px] font-black uppercase tracking-wider">{s}</span>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3 ml-1">Contextual Description</label>
                    <textarea rows={6} value={job.description} onChange={e => setJob((j: any) => ({ ...j, description: e.target.value }))}
                      placeholder="Paste the full job description here..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:border-cyan-500/50 focus:bg-white outline-none transition-all resize-none" />
                  </div>

                  <button type="submit" disabled={saving} className="w-full btn-primary py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                    {saving ? 'Syncing...' : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                        Commit Changes
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminJobSetup;
