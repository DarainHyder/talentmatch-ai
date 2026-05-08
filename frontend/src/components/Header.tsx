import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const API_BASE = (() => {
  const raw = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL || '';
  const trimmed = raw.replace(/\/$/, '');
  if (import.meta.env.PROD && !trimmed) {
    console.warn('No backend API URL configured. Set VITE_API_URL or VITE_API_BASE_URL in the production environment.');
  }
  return trimmed;
})();

interface HeaderProps {
  user: any;
  logout: () => void;
  hidden: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, logout, hidden }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jobNotice, setJobNotice] = useState<any>(null);
  const [jobVisible, setJobVisible] = useState<boolean>(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    ...(jobVisible ? [{ name: 'Chatbot', path: '/chatbot' }] : []),
    { name: 'Dashboard', path: '/dashboard' },
  ];

  useEffect(() => {
    const loadJobNotice = () => {
      const abortController = new AbortController();
      fetch(`${API_BASE}/api/jobs`, { signal: abortController.signal })
        .then(async (res) => {
          if (!res.ok) {
            setJobVisible(false);
            setJobNotice(null);
            return;
          }
          const data = await res.json();
          if (data?.job) {
            setJobNotice(data.job);
            setJobVisible(Boolean(data.job.is_visible ?? true));
          } else {
            setJobNotice(null);
            setJobVisible(false);
          }
        })
        .catch(() => {
          setJobNotice(null);
          setJobVisible(false);
        });
      return () => abortController.abort();
    };

    const cleanup = loadJobNotice();
    const onJobUpdated = () => loadJobNotice();
    window.addEventListener('job-updated', onJobUpdated);

    return () => {
      cleanup?.();
      window.removeEventListener('job-updated', onJobUpdated);
    };
  }, []);

  if (hidden) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img src="/sh-logo.png" alt="Smart Hire" className="h-14 object-contain" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-base font-bold transition-colors shadow-sm-hover"
              style={{
                color: location.pathname === link.path ? '#26E4E4' : '#374151',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#26E4E4')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  location.pathname === link.path ? '#26E4E4' : '#374151')
              }
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <Link to="/login" className="btn-primary text-base px-6 py-3 font-semibold">
              Admin Login
            </Link>
          ) : (
            <button
              onClick={logout}
              className="text-base font-bold text-red-500 hover:text-red-600 transition-colors"
            >
              Sign Out
            </button>
          )}
          {jobVisible && (
            <Link to="/chatbot" className="btn-primary text-base px-6 py-3 font-semibold">
              Try Demo
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {jobVisible && (
        <div className="w-full text-sm text-white bg-cyan-500 border-t border-cyan-600">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
            {jobNotice && (
              <>
                <div className="text-sm font-semibold">
                  Open role: <span className="font-black">{jobNotice.title}</span> · {jobNotice.required_skills || 'No skills listed'}
                </div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/90">
                  {jobNotice.description ? `${jobNotice.description.slice(0, 120)}${jobNotice.description.length > 120 ? '...' : ''}` : 'Apply to the latest opening today.'}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-semibold text-gray-700 hover:text-teal-500 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          {jobVisible && (
            <Link to="/chatbot" onClick={() => setMobileOpen(false)} className="btn-primary text-sm px-5 py-2.5 w-full justify-center">
              Try Demo
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
