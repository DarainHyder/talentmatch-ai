import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-navy-900 min-h-screen overflow-hidden">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[100vh] flex items-center pt-20">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] -z-10 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-600/5 blur-[120px] -z-10 rounded-full" />

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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-800 border border-white/10 mb-8"
            >
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_#7c3aed]" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-none">New Demo Available</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
              Smarter Hiring <br/>
              <span className="text-glow text-purple-400">Starts Here.</span>
            </h1>
            
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-12">
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

             <div className="relative h-[600px] w-full flex items-center justify-center lg:block">
                {/* Orbital Background */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-20"
                >
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-purple-500/30 rounded-full" />
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-purple-500/20 rounded-full" />
                   <div className="absolute top-[10%] left-1/2 w-4 h-4 bg-purple-500 rounded-full blur-sm" />
                </motion.div>

                {/* Main AI Core Card */}
                <motion.div 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   className="relative z-10 glass-card p-1 items-center justify-center max-w-[500px] mx-auto lg:ml-auto"
                >
                   <div className="bg-navy-900/40 rounded-[48px] p-8 overflow-hidden relative group">
                      {/* Scanning Line */}
                      <motion.div 
                         animate={{ top: ['0%', '100%', '0%'] }}
                         transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                         className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent z-20 opacity-50"
                      />

                      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 drop-shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                         <defs>
                           <radialGradient id="ringGrad">
                              <stop offset="0%" stopColor="#7c3aed" />
                              <stop offset="100%" stopColor="transparent" />
                           </radialGradient>
                         </defs>

                         {/* Core Nodes */}
                         <motion.g animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ originX: '100px', originY: '100px' }}>
                            <circle cx="100" cy="100" r="40" stroke="#7c3aed" strokeWidth="0.5" fill="none" strokeDasharray="5 5" opacity="0.3" />
                            <circle cx="100" cy="60" r="4" fill="#8b5cf6" />
                            <circle cx="100" cy="140" r="4" fill="#8b5cf6" />
                            <circle cx="60" cy="100" r="4" fill="#8b5cf6" />
                            <circle cx="140" cy="100" r="4" fill="#8b5cf6" />
                         </motion.g>

                         {/* Inner Core Pulse */}
                         <motion.circle 
                           cx="100" cy="100" r="15" 
                           fill="#7c3aed"
                           animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                           transition={{ duration: 2, repeat: Infinity }}
                         />
                         <circle cx="100" cy="100" r="25" stroke="#7c3aed" strokeWidth="1" fill="none" opacity="0.5" />
                         
                         {/* Dynamic Data Lines */}
                         <motion.path 
                           d="M100 100 L160 40 M100 100 L40 160 M100 100 L160 160 M100 100 L40 40" 
                           stroke="#7c3aed" strokeWidth="0.5" 
                           strokeDasharray="100"
                           animate={{ strokeDashoffset: [200, 0] }}
                           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                           opacity="0.2"
                         />
                      </svg>

                      {/* Status HUD */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                         {['Scanned', 'Analyzed', 'Matched'].map((tag, i) => (
                           <motion.div 
                             key={tag}
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ delay: 1 + i*0.2 }}
                             className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[8px] font-black uppercase tracking-tighter text-purple-400"
                           >
                             {tag}
                           </motion.div>
                         ))}
                      </div>
                   </div>
                </motion.div>
             </div>
        </div>
      </section>

      {/* ─── Section 2: Features ─────────────────────────────────────────── */}
      <section className="bg-navy-800 py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="section-title">The Future of Recruitment</h2>
            <div className="w-24 h-1.5 bg-purple-gradient mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Save Time', desc: 'Stop spending hours on resumes. Our AI scans and shortlists candidates instantly with high precision.' },
              { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', title: 'Stress-Free Interviews', desc: 'Friendly AI chat-based interviews let candidates showcase their technical skills comfortably.' },
              { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Fast, Fair Decisions', desc: 'AI analyzes responses objectively based on merit, ensuring faster and unbiased hiring decisions.' }
            ].map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass-card p-10 border-white/5 group hover:border-purple-500/30"
              >
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/20 text-purple-400 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{card.title}</h3>
                <p className="text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 3: Vertical Process ─────────────────────────────────── */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black text-white mb-8 tracking-tighter">Revolutionize Your <br/>Hiring Process.</h2>
            <p className="text-xl text-slate-400 leading-relaxed mb-12">
              Our end-to-end automation handles everything from resume extraction to deep candidate ranking, allowing you to focus on the top 1% of talent.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-all">
              Learn about our technology
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>

          <div className="space-y-10 relative">
            {/* Step 1 */}
            <motion.div 
               whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 40 }}
               className="flex gap-8 items-start group"
            >
               <div className="w-12 h-12 rounded-full bg-navy-800 border-2 border-purple-500 flex items-center justify-center text-purple-400 font-black shrink-0 shadow-[0_0_20px_rgba(124,58,237,0.3)]">1</div>
               <div>
                 <h4 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-400 transition-colors">Resume Scan</h4>
                 <p className="text-slate-400">Upload a CV and the system instantly extracts skills, experience, and key strengths using NLP.</p>
               </div>
            </motion.div>
            {/* Step 2 */}
            <motion.div 
               whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 40 }} transition={{ delay: 0.1 }}
               className="flex gap-8 items-start group"
            >
               <div className="w-12 h-12 rounded-full bg-navy-800 border-2 border-purple-500 flex items-center justify-center text-purple-400 font-black shrink-0 shadow-[0_0_20px_rgba(124,58,237,0.3)]">2</div>
               <div>
                 <h4 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-400 transition-colors">AI Chat Interview</h4>
                 <p className="text-slate-400">Candidates answer personalized, relevant questions through a smart and friendly chat interface.</p>
               </div>
            </motion.div>
            {/* Step 3 */}
            <motion.div 
               whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 40 }} transition={{ delay: 0.2 }}
               className="flex gap-8 items-start group"
            >
               <div className="w-12 h-12 rounded-full bg-navy-800 border-2 border-purple-500 flex items-center justify-center text-purple-400 font-black shrink-0 shadow-[0_0_20px_rgba(124,58,237,0.3)]">3</div>
               <div>
                 <h4 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-400 transition-colors">Instant Ranking</h4>
                 <p className="text-slate-400">Performance is automatically analyzed and candidates are ranked for immediate hiring decisions.</p>
               </div>
            </motion.div>
            
            {/* Connector Line */}
            <div className="absolute top-12 left-6 w-0.5 h-[80%] bg-white/5 -z-10" />
          </div>
        </div>
      </section>

      {/* ─── Section 4: Chat Mockups ─────────────────────────────────────── */}
      <section className="bg-navy-800/50 py-32">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 whitespace-normal">
            <h2 className="section-title">Meet Your Smart Hiring Assistant</h2>
            <p className="section-subtitle">A natural, AI-driven conversational experience that gets to the heart of every candidate's expertise.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto mt-20">
               <motion.div whileInView={{ scale: 1, opacity: 1 }} initial={{ scale: 0.9, opacity: 0 }} className="glass-card p-8 text-left border-white/5 space-y-4">
                  <div className="flex gap-4 items-start">
                     <div className="w-10 h-10 bg-purple-500/20 rounded-lg shrink-0 flex items-center justify-center text-purple-400 font-bold">B</div>
                     <div className="bg-navy-800 p-4 rounded-2xl rounded-bl-sm text-sm text-slate-300 border border-white/5">How many years of experience do you have with Python backend development?</div>
                  </div>
                  <div className="flex gap-4 items-start flex-row-reverse text-right">
                     <div className="w-10 h-10 bg-purple-gradient rounded-lg shrink-0 flex items-center justify-center text-white font-bold">C</div>
                     <div className="bg-purple-gradient p-4 rounded-2xl rounded-br-sm text-sm text-white shadow-lg">I've worked on high-scale Django apps for over 5 years.</div>
                  </div>
               </motion.div>
               <motion.div whileInView={{ scale: 1, opacity: 1 }} initial={{ scale: 0.9, opacity: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 text-left border-white/5 space-y-4">
                  <div className="flex gap-4 items-start">
                     <div className="w-10 h-10 bg-purple-500/20 rounded-lg shrink-0 flex items-center justify-center text-purple-400 font-bold">B</div>
                     <div className="bg-navy-800 p-4 rounded-2xl rounded-bl-sm text-sm text-slate-300 border border-white/5">Excellent. Can you describe a complex system architecture you designed?</div>
                  </div>
                  <div className="bg-navy-800 p-2 rounded-2xl rounded-bl-sm w-12 flex justify-center gap-1 border border-white/5">
                     <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
                     <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.1s]" />
                     <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-40">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
               whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 40 }}
               className="bg-purple-gradient rounded-[48px] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-purple-500/20"
            >
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
               <h2 className="text-5xl md:text-7xl font-black text-white mb-10 leading-tight relative z-10 tracking-tight">Ready to Upgrade <br/>Your Hiring?</h2>
               <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto mb-16 relative z-10 leading-relaxed">Join innovative companies using TalentMatch AI to identify high-potential candidates in minutes, not weeks.</p>
               <Link to="/chatbot" className="relative z-10 inline-flex items-center gap-3 bg-white text-purple-700 px-12 py-6 rounded-2xl font-black text-xl hover:scale-110 active:scale-95 transition-all shadow-xl">
                  Try Demo Account
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
               </Link>
            </motion.div>
         </div>
      </section>
    </div>
  );
};

export default LandingPage;
