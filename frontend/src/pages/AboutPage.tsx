import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <header className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 mb-6"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">Cognitive Layer V4</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 italic">
            Agentic <span className="text-glow">Intelligence.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            TalentMatch AI isn't just a bot—it's a multi-agent orchestration layer that understands professional context at a neural level.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          {/* Animated SVG Illustration - Human-AI Silhouette (Light Cyan) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass-card p-10 bg-white shadow-2xl shadow-cyan-500/10"
          >
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-200 blur-[80px] opacity-30" />
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-200 blur-[80px] opacity-30" />
             
             <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 filter drop-shadow(0 0 15px rgba(6,182,212,0.1))">
                {/* Human/AI Silhouette nodes */}
                <motion.path
                  d="M50 20 C60 20 70 30 70 45 C70 60 60 75 50 85 C40 75 30 60 30 45 C30 30 40 20 50 20"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Cognitive Nodes */}
                {[...Array(8)].map((_, i) => (
                  <motion.circle
                    key={i}
                    cx={50 + 20 * Math.cos(i * (Math.PI / 4))}
                    cy={50 + 30 * Math.sin(i * (Math.PI / 4))}
                    r="1.5"
                    fill="#0ea5e9"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  />
                ))}

                {/* Internal Synapse paths */}
                <motion.path
                  d="M30 45 Q50 50 70 45"
                  stroke="#06b6d4"
                  strokeWidth="0.2"
                  fill="none"
                  animate={{ opacity: [0.1, 0.5, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
             </svg>
             
             {/* Dynamic Status HUD */}
             <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-3xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cognitive Sync: 99.8%</span>
                </div>
                <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                   <motion.div animate={{ x: [-40, 40] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-10 h-full bg-cyan-500" />
                </div>
             </div>
          </motion.div>

          {/* Text Content */}
          <div className="space-y-12">
            {[
              { id: "01", title: "Neural Logic Match", desc: "Our AI goes beyond keywords, analyzing project relevance through deep semantic understanding." },
              { id: "02", title: "Dynamic Adaptive Chat", desc: "Interviews that evolve based on the candidate's technical depth, ensuring high-fidelity signal." },
              { id: "03", title: "Global Intelligence", desc: "Access the best talent pool with cross-region skill assessment and cultural alignment chips." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ x: 40, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-black text-slate-200 group-hover:text-cyan-500 transition-colors uppercase italic">{item.id}</span>
                  <div className="h-[1px] flex-1 bg-slate-200 group-hover:bg-cyan-200 transition-all" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
            
            <Link to="/chatbot" className="btn-primary inline-flex mt-8 shadow-xl">
              Launch Agentic Core
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-20 border-t border-slate-200">
           {[
             { label: "Accuracy", val: "99%" },
             { label: "Candidates", val: "12k+" },
             { label: "Response", val: "0.2s" },
             { label: "Accuracy", val: "99%" }
           ].map((s, i) => (
             <div key={i} className="text-center">
                <p className="text-4xl font-black text-slate-800 mb-2 italic">{s.val}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
