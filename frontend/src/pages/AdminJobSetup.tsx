import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? '';

interface Job { id?: number; title: string; description: string; required_skills: string; updated_at?: string; }

// ── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  grid: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>),
  brief:() => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>),
  logout:()=> (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
  save: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>),
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const loc = useLocation();
  const navItems = [
    { to: '/dashboard', icon: <Icons.grid />, label: 'Dashboard' },
    { to: '/admin/job-setup', icon: <Icons.brief />, label: 'Job Setup' },
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

// ── Main Page ────────────────────────────────────────────────────────────────
const AdminJobSetup: React.FC = () => {
  const { logout } = useAuth();
  const [job, setJob] = useState<Job>({ title: '', description: '', required_skills: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs`)
      .then(r => r.json()).then(d => { if (d.job) setJob(d.job); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const skills = job.required_skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: job.title, description: job.description, required_skills: skills }),
      });
      if (!res.ok) throw new Error('Save failed.');
      showToast('success', 'Configuration updated successfully.');
    } catch (err: any) { showToast('error', err.message); }
    finally { setSaving(false); }
  };

  const skillList = job.required_skills.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="flex bg-navy-900 min-h-screen text-slate-300">
      <Sidebar onLogout={logout} />

      <main className="flex-1 lg:ml-64 p-8 pt-12">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl border ${
                toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
              }`}>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <header className="mb-12">
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Job Configuration</h1>
          <p className="text-slate-500 font-medium tracking-wide uppercase text-[10px]">Active Recruitment Parameters</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="glass-card p-10 border-white/5 space-y-8">
              {loading ? (
                <div className="py-20 text-center text-slate-500 font-bold italic">Loading environment variables...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-3 ml-1">Official Job Title</label>
                    <input 
                      type="text" 
                      value={job.title} 
                      onChange={e => setJob(j => ({ ...j, title: e.target.value }))}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full bg-navy-800 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-purple-500 outline-none transition-all"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-3 ml-1">Target Skills (Comma Separated)</label>
                    <input 
                      type="text" 
                      value={job.required_skills} 
                      onChange={e => setJob(j => ({ ...j, required_skills: e.target.value }))}
                      placeholder="Python, React, AWS, Docker..."
                      className="w-full bg-navy-800 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-purple-500 outline-none transition-all"
                    />
                    <div className="flex flex-wrap gap-2 mt-4">
                       {skillList.map(s => (
                         <span key={s} className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider">{s}</span>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-3 ml-1">Contextual Description</label>
                    <textarea 
                      rows={6} 
                      value={job.description} 
                      onChange={e => setJob(j => ({ ...j, description: e.target.value }))}
                      placeholder="Paste the full job description here..."
                      className="w-full bg-navy-800 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-purple-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="w-full btn-primary py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {saving ? 'Syncing...' : <><Icons.save /> Commit Changes</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 border-white/5 bg-purple-500/5">
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">Pro Tip</h4>
              <p className="text-sm leading-relaxed text-slate-400 font-medium">
                Our AI uses <span className="text-purple-400">Semantic Matching</span>. You don't need every keyword—just provide the core responsibilities and the engine will handle the rest.
              </p>
            </div>
            <div className="glass-card p-8 border-white/5">
              <h4 className="text-white font-black uppercase tracking-widest text-xs mb-4">Last Synced</h4>
              <p className="text-sm text-slate-500 font-bold">
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
