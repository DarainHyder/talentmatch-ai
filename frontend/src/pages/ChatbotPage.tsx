import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';

const ChatbotPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20 overflow-hidden relative">
      {/* Ambient Background Glows - Light Cyan */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-100/50 blur-[150px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100/50 blur-[150px] -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center mb-20">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 mb-6 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Neural Network Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 italic">
            Experience <span className="text-glow">Agentic AI.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Begin your journey with the world's most advanced behavioral screening core. Interact naturally with our AI intelligence.
          </p>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative">
        {/* Dynamic Waveform Visualizer - Cyan/Sky */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 opacity-20 pointer-events-none overflow-hidden">
          <div className="flex items-center justify-center gap-1 h-full">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 10 }}
                animate={{ 
                  height: [10, 40 + Math.random() * 40, 10],
                  backgroundColor: ['#06b6d4', '#0ea5e9', '#06b6d4']
                }}
                transition={{ 
                  duration: 1 + Math.random(), 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-1 rounded-full bg-cyan-500"
              />
            ))}
          </div>
        </div>

        <ChatWidget inline={true} />

        {/* Cinematic Underlay for Chat */}
        <div className="mt-12 text-center text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] opacity-50">
           Secure Encrypted Node Transmission. Verified by TalentMatch Core™
        </div>
        
        {/* HUD Decorations */}
        <div className="hidden lg:block absolute -right-20 top-1/2 -translate-y-1/2 space-y-4">
           {[
             { label: "Sync", val: "Active" },
             { label: "Latency", val: "14ms" },
             { label: "Node", val: "tm-24" }
           ].map((item, i) => (
             <motion.div 
               key={i}
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 1 + i * 0.1 }}
               className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm backdrop-blur-md"
             >
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
                <div className="text-xs font-black text-cyan-500 italic mt-1">{item.val}</div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
