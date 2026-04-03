import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const doLogin = async (em: string, pw: string) => {
    setError(''); setLoading(true);
    try { await login(em, pw); navigate('/dashboard', { replace: true }); }
    catch { setError('Invalid credentials or server unreachable. Ensure Flask is running on port 5000.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Background glow */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Back link */}
      <Link to="/" className="absolute top-6 left-8 inline-flex items-center gap-1.5 text-xs transition-colors"
        style={{ color: 'var(--text-dim)' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
        </svg>
        Back to Home
      </Link>

      <div className="w-full max-w-[360px] relative z-10">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-white leading-none">TalentMatch AI</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>Recruiter Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="card p-7">
          <h1 className="text-lg font-bold text-white mb-1">Sign in</h1>
          <p className="text-xs mb-6" style={{ color: 'var(--text-dim)' }}>Access your recruitment dashboard</p>

          {error && (
            <div className="mb-4 px-3.5 py-2.5 rounded-xl text-xs text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); doLogin(email, password); }} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-dim)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                required />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-dim)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)'}
                onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                required />
            </div>
            <button type="submit" disabled={loading} className="btn-violet w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <><span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
              ) : 'Sign In'}
            </button>
          </form>

        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--muted)' }}>
          Applicant?{' '}
          <Link to="/" className="text-violet-400 hover:text-violet-300 transition-colors">Apply on the main page</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
