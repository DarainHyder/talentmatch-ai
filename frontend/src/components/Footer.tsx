import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  hidden: boolean;
}

const Footer: React.FC<FooterProps> = ({ hidden }) => {
  if (hidden) return null;

  return (
    <footer style={{ background: '#0F172A', color: 'white' }} className="pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center mb-5 group">
              <img src="/sh-logo-footer.png" alt="Smart Hire" className="h-10 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/sh-logo.png'; }} />
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-sm text-sm">
              Unlock performance with data-driven campaigns, creative storytelling, and impactful branding.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-widest" style={{ color: '#26E4E4' }}>
              Navigation
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'About', path: '/about' },
                { name: 'Chatbot', path: '/chatbot' },
                { name: 'Dashboard', path: '/dashboard' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-400 text-sm font-medium transition-colors hover:text-teal-400"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-widest" style={{ color: '#26E4E4' }}>
              Contact
            </h4>
            <div className="flex flex-col gap-3">
              <a href="mailto:info@smarthire.ai" className="text-gray-400 text-sm font-medium hover:text-teal-400 transition-colors">
                info@smarthire.ai
              </a>
              <a href="#" className="text-gray-400 text-sm font-medium hover:text-teal-400 transition-colors">
                Support
              </a>
              <a href="#" className="text-gray-400 text-sm font-medium hover:text-teal-400 transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © Smart Hire Inc. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social icons */}
            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-teal-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-teal-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
