import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWidgetProps {
  user: any;
  hidden: boolean;
  inline?: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ user, hidden, inline = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'bot', content: "Neural link established. I am your TalentMatch AI co-pilot. How can I assist with your recruitment pipeline today?" }
  ]);
  const [input, setInput] = useState('');

  // V7 Nuclear Stability: Strictly no conditional unmounts.
  // We use CSS 'hidden' logic via props.

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(m => [...m, { role: 'bot', content: "Neural matching algorithm initializing... The interview analysis is 94% complete based on the current CV indices." }]);
    }, 1000);
  };

  if (hidden && !inline) return null; // We return null only if it's the global one in a hidden route

  return (
    <div className={`${inline ? 'w-full' : 'fixed bottom-8 right-8 z-[100]'}`}>
      <AnimatePresence>
        {(isOpen || inline) && (
          <motion.div initial={inline ? {} : { opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`flex flex-col border border-slate-100 shadow-[0_30px_100px_-20px_rgba(6,182,212,0.15)] bg-white/80 backdrop-blur-2xl overflow-hidden ${
              inline ? 'w-full h-[600px] rounded-[32px]' : 'w-96 h-[500px] rounded-[30px] mb-6'
            }`}>
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-cyan-500/5 to-transparent flex items-center justify-between border-b border-slate-50">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">TM AI Pilot</h3>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Neural Sync Active</p>
                  </div>
               </div>
               {!inline && <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
               {messages.map((m, i) => (
                 <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black ${
                      m.role === 'bot' ? 'bg-slate-50 text-slate-400 border border-slate-100' : 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                    }`}>
                       {m.role === 'bot' ? 'TM' : 'ID'}
                    </div>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm border ${
                      m.role === 'bot' ? 'bg-white text-slate-600 border-slate-50 rounded-tl-sm' : 'bg-cyan-50 text-cyan-800 border-cyan-100 rounded-tr-sm'
                    }`}>
                       {m.content}
                    </div>
                 </div>
               ))}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-slate-50 bg-white/50">
               <div className="relative">
                  <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Neural input signal..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:border-cyan-500/50 outline-none transition-all pr-12" />
                  <button type="submit" className="absolute right-2 top-1.5 p-2 text-cyan-500 hover:text-cyan-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!inline && !isOpen && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-cyan-500/30 hover:scale-110 transition-transform relative group">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </motion.button>
      )}
    </div>
  );
};

export default ChatWidget;
