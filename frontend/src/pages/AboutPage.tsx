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
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-purple-gradient opacity-20 blur-3xl animate-pulse" />
          <div className="relative glass-card p-4 rounded-[40px] border-white/10 group overflow-hidden">
            <svg viewBox="0 0 500 500" className="w-full h-full text-purple-400 transform group-hover:scale-105 transition-transform duration-700">
               <circle cx="250" cy="250" r="180" fill="currentColor" fillOpacity="0.1" />
               <rect x="200" y="150" width="100" height="150" rx="20" fill="currentColor" fillOpacity="0.8" />
               <circle cx="250" cy="180" r="25" fill="white" />
               <path d="M150 350 Q 250 450 350 350" stroke="currentColor" strokeWidth="15" fill="none" />
            </svg>
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
