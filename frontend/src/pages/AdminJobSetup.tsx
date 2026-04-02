import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? '';

interface Job { id?: number; title: string; description: string; required_skills: string; updated_at?: string; }

// ── Shared sidebar (same as Dashboard) ───────────────────────────────────────
const SidebarLink: React.FC<{ to: string; children: React.ReactNode; icon: React.ReactNode }> = ({ to, children, icon }) => {
  const loc    = useLocation();
  const active = loc.pathname === to;
  return (
    <Link to={to} className={`nav-item ${active ? 'active' : ''}`}>
      <span className={active ? 'text-violet-400' : ''}>{icon}</span>
      {children}
    </Link>
  );
};

const Icon = {
  grid: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>),
  brief:() => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>),
  home: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>),
  logout:()=> (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
  save: () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>),
};

const AdminJobSetup: React.FC = () => {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const [job, setJob]     = useState<Job>({ title: '', description: '', required_skills: '' });
  const [loading, setLoading]  = useState(true);
  const [saving, setSaving]    = useState(false);
  const [toast, setToast]      = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs`)
      .then(r => r.json()).then(d => { if (d.job) setJob(d.job); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job.title.trim()) { showToast('error', 'Job title is required.'); return; }
    setSaving(true);
    try {
      const token  = localStorage.getItem('auth_token');
      const skills = job.required_skills.split(',').map(s => s.trim()).filter(Boolean);
      const res    = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: job.title, description: job.description, required_skills: skills }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      showToast('success', 'Job configuration saved successfully.');
      if (data.job) setJob(data.job);
    } catch (err: any) { showToast('error', err.message); }
    finally { setSaving(false); }
  };

  const skillList = job.required_skills.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 z-30 flex flex-col border-r"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5 px-5 h-14 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">TalentMatch</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#7c3aed' }}>Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-[10px] font-semibold tracking-widest uppercase px-3 mb-3" style={{ color: 'var(--muted)' }}>Navigation</p>
          <SidebarLink to="/dashboard"       icon={<Icon.grid />}>Dashboard</SidebarLink>
          <SidebarLink to="/admin/job-setup" icon={<Icon.brief />}>Job Setup</SidebarLink>
          <SidebarLink to="/"               icon={<Icon.home />}>Home Page</SidebarLink>
        </nav>
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={logout} className="nav-item w-full text-left hover:text-red-400 hover:bg-red-500/8">
            <Icon.logout />Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-56 flex flex-col overflow-hidden">
        <div className="h-14 border-b px-8 flex items-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div>
            <h1 className="text-sm font-semibold text-white">Job Setup</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Manage the active job description</p>
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div key="toast" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-2xl"
              style={{ background: toast.type === 'success' ? '#059669' : '#dc2626', color: '#fff' }}>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="max-w-xl">
            <div className="card p-7">
              {loading ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-dim)' }}>Loading configuration…</p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Title */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                      Job Title <span className="text-red-400 normal-case tracking-normal font-normal">*</span>
                    </label>
                    <input type="text" value={job.title} onChange={e => setJob(j => ({ ...j, title: e.target.value }))}
                      placeholder="e.g. Senior AI Engineer"
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      onFocus={e => (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'}
                      onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border)'}
                      required />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                      Required Skills <span className="normal-case tracking-normal font-normal text-zinc-600">(comma-separated)</span>
                    </label>
                    <input type="text" value={job.required_skills} onChange={e => setJob(j => ({ ...j, required_skills: e.target.value }))}
                      placeholder="Python, Machine Learning, NLP, Docker"
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      onFocus={e => (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'}
                      onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border)'} />
                    {skillList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {skillList.map(s => (
                          <span key={s} className="badge-violet text-[11px]">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-dim)' }}>
                      Job Description
                    </label>
                    <textarea rows={6} value={job.description} onChange={e => setJob(j => ({ ...j, description: e.target.value }))}
                      placeholder="Describe the role, responsibilities, and what an ideal candidate looks like…"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors resize-none leading-relaxed"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      onFocus={e => (e.target as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'}
                      onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border)'} />
                  </div>

                  {job.updated_at && (
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Last saved: {new Date(job.updated_at).toLocaleString()}</p>
                  )}

                  <button type="submit" disabled={saving} className="btn-violet w-full disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? (<><span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />Saving…</>) : (<><Icon.save /> Save Configuration</>)}
                  </button>
                </form>
              )}
            </div>
            <p className="mt-3 text-xs text-center" style={{ color: 'var(--muted)' }}>
              Changes apply to new applications only. Existing sessions are unaffected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobSetup;
