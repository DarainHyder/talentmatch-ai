import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface HeaderProps {
  user: any;
  logout: () => void;
  hidden: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, logout, hidden }) => {
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

  // Nuclear Stability: Components NEVER unmount. We use CSS and motion to hide.
  return (
    <motion.header 
      initial={false}
      animate={{ 
        y: hidden ? -130 : 0,
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto'
      }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-500`}
    >
      <div className={`max-w-7xl mx-auto glass-card px-8 h-20 flex items-center justify-between border-slate-100 shadow-[0_20px_50px_-20px_rgba(6,182,212,0.15)] transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-2xl' : 'bg-white/40'}`}>
        {/* Logo */}
        <Link to="/" className="flex items-center group pointer-events-auto">
          <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-[14px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-4">
            <span className="text-xl font-black text-slate-900 tracking-tighter italic">TalentMatch<span className="text-cyan-500">.</span></span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 pointer-events-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-cyan-600 relative group ${
                location.pathname === link.path ? 'text-cyan-600' : 'text-slate-400'
              }`}
            >
              {link.name}
              <motion.span 
                initial={false}
                animate={{ width: location.pathname === link.path ? '100%' : '0%' }}
                className="absolute -bottom-2 left-0 h-0.5 bg-cyan-500" 
              />
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-cyan-500 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
          
          <div className="h-6 w-[1px] bg-slate-200 mx-2" />

          {!user ? (
            <Link to="/login" className="btn-primary scale-90 !py-3">
              Admin Login
            </Link>
          ) : (
            <button 
              onClick={logout}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-600 transition-colors"
            >
              Sign Out
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <Link to="/chatbot" className="md:hidden btn-primary scale-75 pointer-events-auto">
          Demo
        </Link>
      </div>
    </motion.header>
  );
};

export default Header;
