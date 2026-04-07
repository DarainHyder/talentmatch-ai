import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-navy-900 min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center mb-32">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-purple-gradient rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-purple-500/20"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight"
        >
          Building a Smarter, <br/><span className="text-purple-400">Fairer Future</span> of Hiring
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          TalentMatch AI was born from a simple mission: to bridge the gap between brilliant candidates and innovative companies using objective, data-driven intelligence.
        </motion.p>
      </section>

      {/* Intro Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
        <motion.div 
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl font-bold text-white tracking-tight">About Our Personalized AI Recruiter</h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Unlike traditional automated systems that rely on static keyword matching, our AI assistant uses semantic understanding to evaluate depth of experience, potential, and cultural alignment.
          </p>
          <div className="space-y-4">
            {['Objective scoring based on actual performance', 'Natural conversational interview style', 'Deep semantic resume analysis'].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                  <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-300 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
             animate={{ opacity: 1, scale: 1, rotate: 0 }}
             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
             className="relative"
           >
             <div className="bg-glow w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
             
             <div className="relative glass-card p-1 items-center justify-center aspect-square overflow-hidden group shadow-[0_40px_120px_-30px_rgba(139,92,246,0.4)]">
                <div className="absolute inset-0 bg-navy-900/40 rounded-[30px]" />
                
                {/* Advanced Human-AI Nexus Silhouette */}
                <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 p-12">
                   <defs>
                      <linearGradient id="nexusGradV3" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="#8b5cf6" />
                         <stop offset="100%" stopColor="#d946ef" />
                      </linearGradient>
                   </defs>

                   {/* Orbital Rings */}
                   <motion.circle 
                     cx="100" cy="100" r="90" 
                     stroke="url(#nexusGradV3)" strokeWidth="0.5" fill="none" opacity="0.1"
                     animate={{ rotate: 360 }}
                     transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                   />

                   {/* Silhouette composed of Nodes */}
                   <g className="filter drop-shadow(0 0 8px rgba(139,92,246,0.3))">
                      {/* Abstract Silhouette Path Dots */}
                      {[
                        {x: 100, y: 40}, {x: 120, y: 45}, {x: 140, y: 60}, {x: 150, y: 85}, {x: 145, y: 110}, 
                        {x: 125, y: 135}, {x: 100, y: 150}, {x: 75, y: 135}, {x: 55, y: 110}, {x: 50, y: 85},
                        {x: 60, y: 60}, {x: 80, y: 45},
                        {x: 100, y: 100}, {x: 115, y: 85}, {x: 85, y: 85}, {x: 100, y: 130}
                      ].map((p, i) => (
                        <motion.circle 
                          key={i}
                          cx={p.x} cy={p.y} r="2" 
                          fill="#8b5cf6"
                          animate={{ 
                            opacity: [0.2, 1, 0.2],
                            scale: [1, 1.5, 1]
                          }}
                          transition={{ 
                            duration: 2 + Math.random(), 
                            repeat: Infinity, 
                            delay: i * 0.1 
                          }}
                        />
                      ))}

                      {/* Connecting Data Lattice */}
                      <motion.path 
                        d="M100 40 L120 45 L140 60 L150 85 L145 110 L125 135 L100 150 L75 135 L55 110 L50 85 L60 60 L80 45 Z" 
                        stroke="url(#nexusGradV3)" strokeWidth="0.5" fill="none" opacity="0.2"
                        strokeDasharray="4 4"
                      />
                      
                      <motion.path 
                        d="M100 40 L100 150 M50 85 L150 85 M100 100 L150 85 M100 100 L50 85 M100 100 L120 45 M100 100 L80 45" 
                        stroke="#8b5cf6" strokeWidth="0.5" opacity="0.1"
                      />
                   </g>

                   {/* Pulse Pulse Core */}
                   <motion.circle 
                     cx="100" cy="100" r="10" 
                     fill="url(#nexusGradV3)"
                     animate={{ 
                       scale: [1, 1.2, 1],
                       opacity: [0.6, 1, 0.6]
                     }}
                     transition={{ duration: 2, repeat: Infinity }}
                   />
                </svg>

                {/* HUD Overlay */}
                <div className="absolute bottom-10 right-10 flex items-center gap-3 glass-card px-5 py-2.5 rounded-2xl border-white/10 bg-navy-900/60 shadow-xl">
                   <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Cognitive sync: 98%</span>
                </div>
             </div>
           </motion.div>
      </section>

      {/* Why We Built This */}
      <section className="bg-navy-800 py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 blur-[120px]" />
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Why We Built TalentMatch AI</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              The recruitment process is broken. We're fixing it by removing the friction and bias that blocks talent from growth.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              { title: 'Slow Manual Screening', desc: 'Recruiters spend hours sorting resumes, making hiring slow and inefficient.', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: 'HR Overload', desc: 'HR teams juggle multiple roles leading to delays, burnout, and inconsistent follow-ups.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { title: 'Bias & Inconsistency', desc: 'Evaluations can be influenced by unconscious bias or varying human judgment.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { title: 'Stress for Candidates', desc: 'Traditional interviews often make candidates nervous, affecting their performance.', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
            ].map((card, i) => (
              <motion.div key={i} variants={itemVariants} className="glass-card p-10 flex gap-6">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{card.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-40">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-6">Built with Purpose</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-16">
            We use a multi-layered evaluation stack that combines NLP and semantic AI to provide a holistic view of every applicant.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Resume Parsing', 'AI Chat Interviews', 'Response Evaluation', 'Candidate Ranking'].map((tech, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 border-white/5 hover:border-purple-500/30 text-center"
              >
                <div className="w-12 h-12 bg-purple-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
                   <span className="text-white font-bold">{i + 1}</span>
                </div>
                <h4 className="text-white font-bold tracking-tight">{tech}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-40">
        <div className="bg-purple-gradient rounded-[40px] px-8 py-20 text-center shadow-2xl shadow-purple-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 relative z-10">Hire Smarter. Faster. Fairer.</h2>
          <Link to="/chatbot" className="relative z-10 inline-flex items-center gap-2 bg-white text-purple-700 px-10 py-5 rounded-2xl font-black text-lg hover:scale-110 active:scale-95 transition-all shadow-xl">
            Try Demo Now
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
