import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  hidden: boolean;
}

const Footer: React.FC<FooterProps> = ({ hidden }) => {
  // Nuclear Stability: Components NEVER unmount. 
  return (
    <footer className={`relative bg-white pt-32 pb-16 overflow-hidden border-t border-slate-100 ${hidden ? 'hidden' : 'block'}`}>
      <div className="bg-glow w-[500px] h-[500px] -bottom-40 left-1/2 -translate-x-1/2 opacity-5" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-[15px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tighter italic">TalentMatch<span className="text-cyan-500">.</span></span>
            </Link>
            <p className="text-slate-500 text-lg max-w-sm leading-relaxed mb-8 font-medium">
              Revolutionizing the recruitment ecosystem with agentic intelligence and unbiased evaluation stacks.
            </p>
          </div>
          
          <div>
            <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[11px] mb-8 opacity-50">Navigation</h4>
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-slate-500 hover:text-cyan-600 transition-colors font-bold text-sm tracking-wide">Home</Link>
              <Link to="/about" className="text-slate-500 hover:text-cyan-600 transition-colors font-bold text-sm tracking-wide">About</Link>
              <Link to="/chatbot" className="text-slate-500 hover:text-cyan-600 transition-colors font-bold text-sm tracking-wide">Chatbot</Link>
              <Link to="/dashboard" className="text-slate-500 hover:text-cyan-600 transition-colors font-bold text-sm tracking-wide">Dashboard</Link>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 font-black uppercase tracking-[0.2em] text-[11px] mb-8 opacity-50">Social</h4>
            <div className="flex gap-6">
               <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-cyan-500 hover:border-cyan-500/50 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
               </a>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-sm font-bold tracking-wide">&copy; 2026 TalentMatch AI. Nuclear Stability V7.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
