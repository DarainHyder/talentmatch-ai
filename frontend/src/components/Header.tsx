import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Chatbot', path: '/chatbot' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 pointer-events-none"
    >
      <div className={`max-w-7xl mx-auto glass-card px-8 h-20 flex items-center justify-between border-white/10 shadow-[0_20px_50px_-20px_rgba(139,92,246,0.3)] pointer-events-auto transition-all duration-500 ${isScrolled ? 'bg-navy-900/90 backdrop-blur-2xl' : 'bg-navy-900/40'}`}>
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-[14px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-4">
            <span className="text-xl font-black text-white tracking-tighter italic">TalentMatch<span className="text-fuchsia-500">.</span></span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-white relative group ${
                location.pathname === link.path ? 'text-white' : 'text-slate-400'
              }`}
            >
              {link.name}
              <motion.span 
                initial={false}
                animate={{ width: location.pathname === link.path ? '100%' : '0%' }}
                className="absolute -bottom-2 left-0 h-0.5 bg-purple-500" 
              />
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
          
          <div className="h-6 w-[1px] bg-white/10 mx-2" />

          {!user ? (
            <Link to="/login" className="btn-primary scale-90 !py-3">
              Admin Login
            </Link>
          ) : (
            <button 
              onClick={logout}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 hover:text-red-300 transition-colors"
            >
              Sign Out
            </button>
          )}
        </nav>

        {/* Mobile menu button (Simplified for V3) */}
        <Link to="/chatbot" className="md:hidden btn-primary scale-75">
          Demo
        </Link>
      </div>
    </motion.header>
  );
};

export default Header;
