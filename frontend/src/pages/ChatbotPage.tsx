import React from 'react';
import { motion } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';

const API_BASE = (() => {
  const raw = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL || '';
  const trimmed = raw.replace(/\/$/, '');
  return trimmed;
})();

const ChatbotPage: React.FC = () => {
  const [jobAvailable, setJobAvailable] = React.useState(true);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/jobs`)
      .then(res => res.json())
      .then(data => {
        setJobAvailable(Boolean(data?.job?.is_visible ?? true));
      })
      .catch(() => setJobAvailable(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (!jobAvailable) {
    return (
      <div className="bg-white min-h-screen pt-32 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <img src="/chatbot-hero-bot-transparent.png" alt="Paused" className="w-48 mx-auto mb-8 opacity-50" />
          <h1 className="text-4xl font-black mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>Hiring is Currently Paused</h1>
          <p className="text-gray-600 max-w-lg mx-auto text-lg font-medium">
            We don't have any active job openings at the moment. Please check back later or follow our updates for new opportunities!
          </p>
          <a href="/" className="inline-block mt-10 text-cyan-500 font-bold hover:underline">Back to Home</a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-16" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
              Your Smart Chat<br/>
              <span style={{ color: '#26E4E4' }}>Interview</span> Starts Here
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-lg leading-relaxed font-medium">
              A modern AI-driven chat interview experience that screens candidates, evaluates responses, and delivers instant insights — all in a friendly conversation format.
            </p>
            <a 
              href="#demo-sec"
              className="inline-flex items-center justify-center px-10 py-4 text-white font-bold text-lg rounded-2xl transition-all shadow-[0_4px_20px_rgba(38,228,228,0.35)] hover:scale-105"
              style={{ background: '#26E4E4' }}
            >
              Try Demo
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex justify-center lg:justify-end">
            <img src="/chatbot-hero-bot-transparent.png" alt="Smart Chat Interview" className="w-full max-w-[500px] object-contain drop-shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#f8fdfd' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-black mb-20" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
              How It Works — Interactive<br/>
              <span style={{ color: '#26E4E4' }}>Process</span> Flow
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-start justify-center gap-4 relative">
            {/* Steps Configuration */}
            {[
              {
                num: '01',
                title: 'Upload Resume',
                desc: 'The assistant instantly scans the resume, extracts skills, education, experience, and matches them to the job role.',
                icon: '/process-01.png'
              },
              {
                num: '02',
                title: 'AI Interview',
                desc: 'Candidates answer adaptive AI-generated questions that feel natural, supportive, and fully stress-free.',
                icon: '/process-02.png'
              },
              {
                num: '03',
                title: 'Evaluation',
                desc: 'The system analyzes clarity, relevance, communication skill, and technical accuracy in real time.',
                icon: '/process-03.png'
              },
              {
                num: '04',
                title: 'Scoring',
                desc: 'A structured report is generated with skill scores, performance graphs, and recommended ranking.',
                icon: '/process-04.png'
              }
            ].map((step, idx) => (
              <React.Fragment key={idx}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: idx * 0.1 }}
                  className="flex-1 flex flex-col items-center text-center px-4"
                >
                  <div className="w-20 h-20 bg-[#26E4E4] rounded-full flex items-center justify-center mb-6 text-white text-2xl font-black shadow-lg shadow-cyan-200" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {step.num}
                  </div>
                  <h3 className="text-xl font-black mb-3" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-[200px]">
                    {step.desc}
                  </p>
                </motion.div>

                {/* Arrow Divider (Hide on last element and on mobile) */}
                {idx < 3 && (
                  <div className="hidden md:flex flex-shrink-0 pt-6">
                    <img src="/process-arrow.png" alt="→" className="w-16 object-contain" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ACTUAL CHATBOX DEMO (A CHAT INTERVIEW THAT FEELS NATURAL) ─────────── */}
      <section id="demo-sec" className="py-24 bg-white scroll-mt-20">
         <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
                A <span style={{ color: '#26E4E4' }}>Chat Interview</span> That Feels<br/>Natural, Not Robotic
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-20 max-w-3xl mx-auto font-medium">
                Our AI interviewer feels truly human — friendly, adaptive, and professional, giving every candidate a fair chance to present their strengths with confidence.
              </p>
            </motion.div>

            {/* Live Chat Widget UI wrapped securely */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               whileInView={{ opacity: 1, scale: 1 }} 
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className="relative mx-auto max-w-2xl"
            >
               {/* Cute floating bot image from reference site */}
               <img src="/chat-box-bot.png" alt="Smart Hire Bot" className="absolute -top-[70px] left-[45%] -translate-x-[45%] w-32 z-20 drop-shadow-lg" />
               
               <div className="relative z-10 pt-[55px] rounded-[32px] overflow-hidden shadow-[0_30px_100px_-20px_rgba(38,228,228,0.25)] bg-[#26E4E4]">
                  {/* Inline functional ChatWidget fills the box seamlessly */}
                  <div className="-mt-[55px]">
                     <ChatWidget inline={true} />
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* ─── WHY CANDIDATES LOVE SMART HIRE? ───────────────────────────────────── */}
      <section className="py-24" style={{ background: '#f8fdfd' }}>
         <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
                Why Candidates Love <span style={{ color: '#26E4E4' }}>Smart Hire?</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-16 max-w-3xl mx-auto font-medium">
                Smart Hire makes interviews easy, flexible, and stress-free. Candidates enjoy a natural chat experience and receive helpful insights that clearly highlight their strengths and readiness for the next step.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { img: '/cand-one.svg', text: 'No Pressure, No Scheduling' },
                { img: '/cand-two.svg', text: 'Clear, Friendly Questions' },
                { img: '/cand-three.svg', text: 'Instant Evaluation and Insights' },
                { img: '/cand-four.svg', text: 'Fair for Everyone' }
              ].map((card, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.05)] hover:-translate-y-2 transition-transform duration-300 flex flex-col items-center justify-center border-[0.5px] border-slate-100"
                >
                  <img src={card.img} alt={card.text} className="w-16 h-16 mb-4 object-contain" />
                  <h4 className="text-[17px] font-black text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {card.text}
                  </h4>
                </motion.div>
              ))}
            </div>
         </div>
      </section>

      {/* ─── WHAT MAKES OUR AI CHATBOT DIFFERENT? ──────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-black mb-10 leading-tight" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
                What Makes Our AI<br/>Chatbot <span style={{ color: '#26E4E4' }}>Different?</span>
              </h2>
              <ul className="space-y-6">
                {[
                  'Adaptive questioning (follows your responses).',
                  'Understands skills from both resume + answers.',
                  'Human-like conversational tone',
                  'Instant scoring and feedback',
                  'Consistent, unbiased evaluations'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <img src="/check-circle.svg" alt="Check" className="w-6 h-6 shrink-0 mt-0.5" />
                    <span className="text-xl text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex justify-center lg:justify-end">
               <img src="/chatbot-footer-bot-transparent.png" alt="Different Bot" className="w-full max-w-[450px] object-contain drop-shadow-2xl" />
            </motion.div>
         </div>
      </section>

    </div>
  );
};

export default ChatbotPage;
