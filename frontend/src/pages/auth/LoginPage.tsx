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
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Back to Home */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-gradient rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-2xl shadow-purple-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">TalentMatch <span className="text-purple-400">Portal</span></h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Admin & Recruiter Access</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-10 border-white/5 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-slate-400 mb-8 font-medium">Please enter your details to sign in.</p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={doLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="admin@talentmatch.ai"
                required
                className="w-full bg-navy-800 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-purple-500 outline-none transition-all placeholder-slate-600"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                required
                className="w-full bg-navy-800 border border-white/10 rounded-xl px-5 py-3.5 text-sm font-medium focus:border-purple-500 outline-none transition-all placeholder-slate-600"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-4 rounded-xl font-black text-sm uppercase tracking-widest mt-4 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In Now'}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          Interested in joining? {' '}
          <Link to="/chatbot" className="text-purple-400 hover:text-purple-300 transition-colors font-bold whitespace-nowrap">Try the Demo instead</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
