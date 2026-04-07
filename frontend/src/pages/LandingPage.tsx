import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen overflow-hidden">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[100vh] flex items-center pt-20">
        {/* Background glow effects - Light Cyan */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-100 blur-[120px] -z-10 rounded-full opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-sky-100 blur-[120px] -z-10 rounded-full opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 mb-8 shadow-sm"
            >
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">New Demo Available</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tighter">
              Smarter Hiring <br/>
              <span className="text-glow">Starts Here.</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mb-12">
              An AI-powered recruitment assistant that screens resumes, chats with candidates, and delivers instant, unbiased evaluations.
            </p>

            <div className="flex flex-wrap gap-6 items-center">
              <Link
                to="/chatbot" 
                className="btn-primary py-5 px-10 text-lg font-black group transition-all"
              >
                Try Demo Now
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </motion.div>

          <div className="relative h-[650px] w-full flex items-center justify-center lg:block">
            {/* Cinematic Ambient Glows - Cyan/Sky */}
            <div className="bg-glow w-[400px] h-[400px] top-0 -right-20 opacity-30" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
            <div className="bg-glow w-[300px] h-[300px] bottom-0 -left-10 opacity-20" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />

            {/* Main AI Core Card (Referencing Smart Hire's 30px rounding) */}
            <motion.div 
               initial={{ y: 40, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="relative z-10 glass-card p-1 items-center justify-center max-w-[550px] mx-auto lg:ml-auto shadow-[0_30px_100px_-20px_rgba(6,182,212,0.2)]"
            >
               <div className="bg-white rounded-[30px] p-10 overflow-hidden relative group aspect-square flex items-center justify-center">
                  {/* Active AI Scanning Field - Cyan */}
                  <motion.div 
                     animate={{ top: ['-10%', '110%', '-10%'] }}
                     transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent z-20 pointer-events-none"
                  />

                  <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 filter drop-shadow(0 0 20px rgba(6,182,212,0.2))">
                     <defs>
                       <filter id="glow-light">
                         <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                         <feMerge>
                           <feMergeNode in="coloredBlur"/>
                           <feMergeNode in="SourceGraphic"/>
                         </feMerge>
                       </filter>
                     </defs>

                     {/* Kinetic Node Network - Cyan/Sky */}
                     {[...Array(6)].map((_, i) => (
                       <motion.g 
                         key={i}
                         animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                         transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                         style={{ originX: '100px', originY: '100px' }}
                       >
                         <circle 
                           cx="100" cy="100" 
                           r={40 + i * 15} 
                           stroke={i % 2 === 0 ? "#06b6d4" : "#0ea5e9"} 
                           strokeWidth="0.5" 
                           fill="none" 
                           strokeDasharray={i % 3 === 0 ? "5 10" : "20 5"} 
                           opacity={0.1 + (i * 0.05)} 
                         />
                         {/* Floating Nodes on Rings */}
                         {[...Array(3)].map((__, j) => (
                            <motion.circle
                              key={j}
                              cx={100 + (40 + i * 15) * Math.cos(j * (2 * Math.PI / 3))}
                              cy={100 + (40 + i * 15) * Math.sin(j * (2 * Math.PI / 3))}
                              r="1.5"
                              fill={i % 2 === 0 ? "#06b6d4" : "#0ea5e9"}
                              filter="url(#glow-light)"
                            >
                              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin={`${j * 0.5}s`} />
                            </motion.circle>
                         ))}
                       </motion.g>
                     ))}

                     {/* Center Core */}
                     <motion.circle 
                        cx="100" cy="100" r="22" 
                        fill="url(#coreGradient)" 
                        animate={{ scale: [1, 1.1, 1] }} 
                        transition={{ duration: 4, repeat: Infinity }}
                     />
                     <defs>
                        <radialGradient id="coreGradient">
                           <stop offset="0%" stopColor="#22d3ee" />
                           <stop offset="100%" stopColor="#06b6d4" />
                        </radialGradient>
                     </defs>
                  </svg>

                  {/* Content Overlay */}
                  <div className="absolute bottom-8 left-0 right-0 z-30 px-8 flex justify-center gap-3">
                     {['SCANNED', 'ANALYZED', 'MATCHED'].map((tag, i) => (
                        <div key={tag} className="px-3 py-1 bg-slate-100/80 border border-slate-200 rounded-lg text-[8px] font-black tracking-widest text-slate-500 backdrop-blur-md">
                           {tag}
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Features Brief ──────────────────────────────────────────────── */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Agentic Screening", desc: "Autonomous AI agents that deep-scan CVs for true project competence.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.147L2.207 12.016a11.94 11.94 0 001.205 10.983c.951.555 2.005.959 3.127 1.184" },
            { title: "Behavioral Intel", desc: "Real-time interviewing that adapts to candidate responses instantly.", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" },
            { title: "Bias-Free Matrix", desc: "Fair scoring based on data-driven matching nodes.", icon: "M9 19V5l12-3v14l-12 3z" }
          ].map((f, i) => (
            <motion.div 
               key={i}
               initial={{ y: 20, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               viewport={{ once: true }}
               className="p-10 rounded-[30px] bg-slate-50 border border-slate-100 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all group"
            >
              <div className="w-14 h-14 bg-white rounded-2x flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
