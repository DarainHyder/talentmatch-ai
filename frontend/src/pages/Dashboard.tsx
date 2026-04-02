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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  briefcase: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  ),
  logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  trending: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/>
    </svg>
  ),
  star: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  doc: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
    </svg>
  ),
  home: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
};

// ── Status helpers ─────────────────────────────────────────────────────────────
function badge(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'shortlisted')  return <span className="badge-green">Shortlisted</span>;
  if (s === 'under review') return <span className="badge-amber">Under Review</span>;
  if (s === 'rejected')     return <span className="badge-red">Rejected</span>;
  if (s === 'interviewing') return <span className="badge-violet">Interviewing</span>;
  return <span className="badge-zinc">{status || 'Pending'}</span>;
}

function ScoreRing({ value, size = 44 }: { value: number; size?: number }) {
  const pct  = Math.min(Math.max(Number(value) || 0, 0), 100);
  const r    = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const col  = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color: col }}>{pct}</span>
    </div>
  );
}

function MiniBar({ value }: { value: number }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const col = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: col }} />
      </div>
      <span className="text-xs tabular-nums w-6 text-right" style={{ color: 'var(--text-dim)' }}>{pct}</span>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const loc = useLocation();
  const navItems = [
    { to: '/dashboard',        icon: <Icons.grid />,      label: 'Dashboard'  },
    { to: '/admin/job-setup',  icon: <Icons.briefcase />, label: 'Job Setup'  },
    { to: '/',                 icon: <Icons.home />,      label: 'Home Page'  },
  ];
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 z-30 flex flex-col border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Logo */}
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

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[10px] font-semibold tracking-widest uppercase px-3 mb-3" style={{ color: 'var(--muted)' }}>Navigation</p>
        {navItems.map((item) => {
          const active = loc.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} className={`nav-item ${active ? 'active' : ''}`}>
              <span className={active ? 'text-violet-400' : ''}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={onLogout} className="nav-item w-full text-left hover:text-red-400 hover:bg-red-500/8">
          <Icons.logout />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const [candidates, setCandidates]     = useState<Candidate[]>([]);
  const [topPicks, setTopPicks]         = useState<Candidate[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [selected, setSelected]         = useState<Candidate | null>(null);
  const [transcript, setTranscript]     = useState<TranscriptEntry[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeTab, setActiveTab]       = useState<'all' | 'shortlisted' | 'rejected'>('all');

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const token = localStorage.getItem('auth_token');
        const res   = await fetch(`${API_BASE}/api/chat/sessions`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) { logout(); return; }
        const data  = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setCandidates(data.candidates || []);
        setTopPicks(data.top_picks || []);
      } catch (e: any) { setError(e.message); } finally { setLoading(false); }
    };
    load();
  }, [logout]);

  const openTranscript = async (c: Candidate) => {
    setSelected(c); setModalLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const data  = await fetch(`${API_BASE}/api/chat/sessions/${c.session_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      setTranscript(data.transcript || []);
    } catch { setTranscript([]); } finally { setModalLoading(false); }
  };

  const avgScore = candidates.length
    ? (candidates.reduce((s, c) => s + (Number(c.final_score) || 0), 0) / candidates.length).toFixed(1)
    : '—';

  const filtered = activeTab === 'all' ? candidates
    : candidates.filter(c => c.status.toLowerCase() === activeTab);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar onLogout={logout} />

      {/* Main content */}
      <div className="flex-1 ml-56 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="h-14 border-b px-8 flex items-center justify-between shrink-0"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div>
            <h1 className="text-sm font-semibold text-white">Dashboard</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Candidate pipeline overview</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{user?.email}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-7 space-y-7">

          {/* Error */}
          {error && (
            <div className="card-2 px-4 py-3 text-xs text-red-400" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>{error}</div>
          )}

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: 'Total Candidates', val: candidates.length,       icon: <Icons.users />,   color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.2)'   },
              { label: 'Avg Final Score',  val: avgScore,                icon: <Icons.trending />,color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.2)'  },
              { label: 'Top Picks',        val: topPicks.length,         icon: <Icons.star />,    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
            ].map(({ label, val, icon, color, bg, border }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="card p-5 flex items-center gap-4" style={{ borderColor: border }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ background: bg, color, border: `1px solid ${border}` }}>
                  {icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-white leading-none mb-1">{val}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Top Picks ── */}
          {topPicks.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400"><Icons.star /></span>
                  <h2 className="text-sm font-semibold text-white">Top Candidates</h2>
                </div>
                <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Top {topPicks.length} by composite score</span>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {topPicks.map((c, i) => (
                  <motion.div
                    key={c.session_id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => openTranscript(c)}
                    className="card p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                    style={{ ':hover': { borderColor: 'rgba(124,58,237,0.4)' } }}
                  >
                    {/* Rank + avatar row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold font-mono" style={{ color: i === 0 ? '#f59e0b' : 'var(--text-dim)' }}>#{i + 1}</span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                        {c.name[0].toUpperCase()}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                    <p className="text-[11px] truncate mb-3" style={{ color: 'var(--text-dim)' }}>{c.email}</p>
                    <ScoreRing value={c.final_score} size={40} />
                    <div className="mt-2">{badge(c.status)}</div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* ── Candidates Table ── */}
          <section>
            {/* Table header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-white">Candidates</h2>
                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  {(['all', 'shortlisted', 'rejected'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className="px-3 py-1 rounded-md text-xs font-medium transition-all capitalize"
                      style={activeTab === tab
                        ? { background: 'rgba(124,58,237,0.25)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.35)' }
                        : { color: 'var(--text-dim)' }}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{filtered.length} records</span>
            </div>

            {loading ? (
              <div className="card p-16 text-center text-xs" style={{ color: 'var(--text-dim)' }}>Loading candidate records…</div>
            ) : filtered.length === 0 ? (
              <div className="card p-16 text-center">
                <p className="text-sm text-white mb-1">No candidates yet</p>
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Share the landing page for applicants to begin.</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-[11px] font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text-dim)', background: 'var(--surface-2)' }}>
                      {['Candidate','CV Score','Interview','Final Score','Status',''].map((h) => (
                        <th key={h} className="text-left px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filtered.map((c, i) => (
                        <motion.tr key={c.session_id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b transition-colors"
                          style={{ borderColor: 'var(--border)', background: i % 2 ? 'var(--surface)' : 'transparent' }}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                                {c.name[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{c.name}</p>
                                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 w-36"><MiniBar value={c.cv_score} /></td>
                          <td className="px-5 py-3.5 w-36"><MiniBar value={c.interview_score} /></td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-bold tabular-nums" style={{ color: '#a78bfa' }}>
                              {Number(c.final_score).toFixed(1)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">{badge(c.status)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button onClick={() => openTranscript(c)} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                              style={{ border: '1px solid var(--border)', color: 'var(--text-dim)' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.4)'; (e.currentTarget as HTMLElement).style.color = '#c4b5fd'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'; }}>
                              <Icons.doc /> Transcript
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <TranscriptModal candidate={selected} transcript={modalLoading ? [] : transcript}
          onClose={() => { setSelected(null); setTranscript([]); }} />
      )}
    </div>
  );
};

export default Dashboard;
