import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  user: any;
  logout: () => void;
  hidden: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, logout, hidden }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <img src="/sh-logo.png" alt="Smart Hire" className="h-16 object-contain" />
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
          <Link to="/chatbot" className="btn-primary text-base px-6 py-3 font-semibold">
            Try Demo
          </Link>
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
          <Link to="/chatbot" onClick={() => setMobileOpen(false)} className="btn-primary text-sm px-5 py-2.5 w-full justify-center">
            Try Demo
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
