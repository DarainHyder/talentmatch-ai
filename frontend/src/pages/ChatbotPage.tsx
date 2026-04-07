import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';

const ChatbotPage: React.FC = () => {
  useEffect(() => {
    // Handle scrolling to demo section if URL has hash
    if (window.location.hash === '#demo-sec') {
      const el = document.getElementById('demo-sec');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-navy-900 min-h-screen pt-32 pb-20">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center mb-32">
        <motion.div
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-black uppercase tracking-widest inline-block mb-6 shadow-glow"
        >
          AI-Powered Assistant
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight tracking-tight max-w-4xl mx-auto"
        >
          Meet Your Smart <br/><span className="text-purple-400">Hiring Assistant</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12"
        >
          A modern AI-driven chat interview experience that screens candidates, evaluates responses, and delivers instant insights — all in a friendly conversation format.
        </motion.p>
        
        <motion.button 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => document.getElementById('demo-sec')?.scrollIntoView({ behavior: 'smooth' })}
          className="btn-primary px-10 py-5 rounded-2xl font-black text-lg"
        >
          Try Demo Now
        </motion.button>
      </section>

      {/* Process Flow */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-40">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <div className="w-20 h-1.5 bg-purple-gradient mx-auto rounded-full" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          {[
            { step: '01', title: 'Upload Resume', desc: 'Securely upload your CV for instant AI parsing.' },
            { step: '02', title: 'AI Interview', desc: 'Answer specialized questions generated for your role.' },
            { step: '03', title: 'Evaluation', desc: 'Our engine analyzes technical and soft skills.' },
            { step: '04', title: 'Scoring', desc: 'Get a comprehensive score and direct feedback.' }
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants} className="text-center group">
              <div className="w-16 h-16 bg-navy-800 rounded-3xl border border-white/5 mx-auto mb-6 flex items-center justify-center text-2xl font-black text-purple-400 group-hover:scale-110 transition-transform shadow-2xl">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Mockup Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">A Chat Interview That <br/>Feels Natural</h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              Forget stressful phone screenings. Our AI bot engages candidates in a human-like dialogue that adapts to their unique professional story.
            </p>
            <div className="space-y-6">
               {[
                 { title: 'No Pressure, No Scheduling', desc: 'Interview whenever you are ready, day or night.' },
                 { title: 'Instant Evaluation', desc: 'Receive immediate insights on your role compatibility.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-5">
                   <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400 flex-shrink-0">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={i === 0 ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                     </svg>
                   </div>
                   <div>
                     <h4 className="text-white font-bold mb-1 tracking-tight">{item.title}</h4>
                     <p className="text-slate-400 text-sm">{item.desc}</p>
                   </div>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Visual Mockup */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-[32px] border-white/10"
          >
            <div className="space-y-4 mb-4">
              <div className="bg-navy-800 p-4 rounded-2xl rounded-bl-sm max-w-[80%] border border-white/5">
                <p className="text-sm text-slate-300">That's impressive. How would you handle a production server crash at 2 AM?</p>
              </div>
              <div className="bg-purple-gradient p-4 rounded-2xl rounded-br-sm max-w-[80%] ml-auto text-white shadow-lg">
                <p className="text-sm">First, I'd check the logs to identify the root cause, then check health monitors and rotate back to the latest stable build...</p>
              </div>
              <div className="bg-navy-800 p-3 rounded-2xl rounded-bl-sm max-w-[40%] flex items-center gap-2 border border-white/5">
                 <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Difference Section */}
      <section className="bg-navy-800 py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 blur-[120px]" />
        
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-white tracking-tight">What Makes Our AI <br/>Chatbot Different</h2>
            <div className="space-y-6">
              {[
                'Adaptive questioning (follows your responses)',
                'Understands skills from both resume + answers',
                'Human-like conversational tone',
                'Instant scoring and feedback',
                'Consistent, unbiased evaluations'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300 font-semibold">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1 }}
             className="relative lg:w-1/2 flex items-center justify-center"
           >
             <div className="absolute inset-0 bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
             <div className="relative glass-card p-16 rounded-[48px] border-white/5 flex items-center justify-center overflow-hidden min-h-[350px] w-full">
                {/* Dynamic Waveform / Voice Interface */}
                <div className="flex items-center gap-1.5 h-24">
                   {[...Array(24)].map((_, i) => (
                     <motion.div 
                       key={i}
                       className="w-1.5 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full"
                       animate={{ 
                         height: [20, Math.random() * 80 + 20, 20],
                         opacity: [0.3, 1, 0.3]
                       }}
                       transition={{ 
                         duration: 0.8 + Math.random() * 0.5, 
                         repeat: Infinity, 
                         delay: i * 0.05,
                         ease: "easeInOut"
                       }}
                     />
                   ))}
                </div>

                {/* Floating Status HUD */}
                <div className="absolute top-10 right-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900/50 border border-white/10 backdrop-blur-md">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Processing Intent</span>
                </div>
             </div>
           </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo-sec" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-white mb-6">Start Your Interview Now</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Ready to show your expertise? Upload your resume and start the AI session below.
          </p>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
        >
          <ChatWidget inline={true} />
        </motion.div>
      </section>
    </div>
  );
};

export default ChatbotPage;
