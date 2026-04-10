import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pt-16" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* ─── HEADER SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative text-center pt-24 pb-20 overflow-hidden" style={{ background: '#f8fdfd' }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #26E4E4 0%, transparent 70%)', filter: 'blur(80px)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #26E4E4 0%, transparent 70%)', filter: 'blur(80px)', transform: 'translate(-30%, 30%)' }} />

        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <motion.img 
            src="/about-hero-bot.svg" 
            alt="AI Bot" 
            className="h-32 mb-8 object-contain"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black mb-6 leading-tight"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}
          >
            Building a Smarter, Fairer<br/>Future of <span style={{ color: '#26E4E4' }}>Hiring</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Our AI-powered hiring assistant is designed to simplify recruitment, reduce manual workload, and give every candidate a fair chance with transparent, data-driven evaluation.
          </motion.p>
        </div>
      </section>

      {/* ─── ABOUT OUR PERSONALIZED AI RECRUITER ───────────────────────────────── */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
              About Our Personalized AI <br />
              <span style={{ color: '#26E4E4' }}>Recruiter</span>
            </h2>
            <p className="text-gray-600 text-lg leading-loose font-medium">
              We are an AI-driven recruitment assistant built to transform the way companies hire. Our system screens resumes, conducts chat-based interviews, evaluates candidate responses, and generates instant ranked reports—helping teams hire faster and smarter.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <img 
              src="/about-recruiter-bot.svg" 
              alt="Personalized AI Recruiter" 
              className="w-full max-w-md object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* ─── WHY WE BUILT SMART HIRE ───────────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
              Why We Built Smart Hire
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Slow Manual Screening',
                desc: 'Recruiters often spend hours sorting through large stacks of resumes, making the first stage of hiring slow and inefficient.',
                img: '/problem-1.png'
              },
              {
                title: 'HR Overload',
                desc: 'HR teams juggle multiple roles—shortlisting candidates, scheduling interviews. This workload leads to delays and burnout.',
                img: '/problem-2.png'
              },
              {
                title: 'Bias & Inconsistency',
                desc: 'Human evaluations can be influenced by unconscious bias. Even experienced recruiters may unintentionally favor certain profiles.',
                img: '/problem-3.png'
              },
              {
                title: 'Stress for Candidates',
                desc: 'Traditional interviews can make candidates nervous, affecting performance and preventing them from showcasing their true skills.',
                img: '/problem-4.png'
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 shadow-sm border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="w-32 h-32 mb-6 flex items-center justify-center bg-teal-50 rounded-full">
                  <img src={item.img} alt={item.title} className="w-20 object-contain" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECHNOLOGY BEHIND SMART HIRE ──────────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-8" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
              Technology Behind the Smart Hire
            </h2>
            <p className="text-gray-600 text-lg max-w-4xl mx-auto leading-loose mb-20 font-medium">
              Our platform uses multiple AI layers—machine learning, natural language processing, and data-driven scoring—to evaluate candidates with accuracy. It reads resumes, understands responses in chat interviews, identifies key skills, and measures performance against role requirements.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { title: 'Resume Parsing', icon: '/about-tech-1.svg' },
              { title: 'AI Chat Interviews', icon: '/about-tech-2.svg' },
              { title: 'Response Evaluation', icon: '/about-tech-3.svg' },
              { title: 'Candidate Ranking', icon: '/about-tech-4.svg' }
            ].map((tech, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-28 h-28 mb-6 rounded-3xl bg-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-[0_10px_40px_rgba(38,228,228,0.15)] opacity-90 border-[0.5px] border-cyan-100">
                  <img src={tech.icon} alt={tech.title} className="w-12 h-12" />
                </div>
                <h4 className="text-lg font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
                  {tech.title}
                </h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HIRE SMARTER. FASTER. FAIRER. ─────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden" style={{ background: '#f0fafa' }}>
        <img 
          src="/about-circuit-lines.png" 
          alt="Circuit Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" 
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
              Hire Smarter. Faster. <span style={{ color: '#26E4E4' }}>Fairer.</span>
            </h2>
            <p className="text-gray-600 text-lg leading-loose mb-10 font-medium">
              Experience how AI can transform the way you screen, interview, and evaluate candidates. Let your team focus on decisions—while our assistant handles the rest.
            </p>
            <button 
              className="px-10 py-4 text-white font-bold rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(38,228,228,0.35)]"
              style={{ background: 'linear-gradient(135deg, #006a6a 0%, #26E4E4 100%)' }}
            >
              Get Started Free
            </button>
          </motion.div>
        </div>
        <img 
          src="/footer-wave.svg" 
          alt="" 
          className="absolute bottom-0 left-0 w-full object-cover h-16 pointer-events-none" 
        />
      </section>

    </div>
  );
};

export default AboutPage;
