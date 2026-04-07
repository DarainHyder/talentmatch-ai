import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { 
      await login(email, password); 
      navigate('/dashboard', { replace: true }); 
    } catch { 
      setError('Invalid credentials. Please try again.'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background patterns - Light Cyan */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-100/40 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100/40 blur-[150px] rounded-full pointer-events-none" />

      {/* Back to Home */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-cyan-600 transition-colors font-bold text-sm">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">TalentMatch <span className="text-cyan-500">Portal.</span></h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-2 opacity-70">Admin & Recruiter Access</p>
        </div>

        {/* Login Card */}
        <div className="glass-card bg-white p-10 border-slate-100 shadow-[0_30px_100px_-20px_rgba(6,182,212,0.1)]">
          <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight italic">Welcome <span className="text-cyan-500">Back.</span></h1>
          <p className="text-sm text-slate-400 mb-8 font-medium">Please enter your credentials to initialize session.</p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-500"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={doLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="admin@talentmatch.ai"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-cyan-500/50 focus:bg-white outline-none transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-cyan-500/50 focus:bg-white outline-none transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-5 rounded-2xl font-black text-sm uppercase tracking-widest mt-4 shadow-xl shadow-cyan-500/10 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In Now'}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">
          Identity Verified by <Link to="/chatbot" className="text-cyan-500 hover:text-cyan-600 transition-colors">TalentMatch Core™</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
