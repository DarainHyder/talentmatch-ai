import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import TypingIndicator from './TypingIndicator';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChatStatus =
  | 'idle'
  | 'uploading'
  | 'qualified'
  | 'not_qualified'
  | 'interviewing'
  | 'completed';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

interface ChatWidgetProps {
  inline?: boolean;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? '';

// ---------------------------------------------------------------------------
// Inline SVG Icons
// ---------------------------------------------------------------------------

const IconChat = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

const IconPaperclip = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

// ---------------------------------------------------------------------------
// ChatWidget Component
// ---------------------------------------------------------------------------

const ChatWidget: React.FC<ChatWidgetProps> = ({ inline = false }) => {
  const location = useLocation();
  const [isOpen, setIsOpen]       = useState(inline);
  const [status, setStatus]       = useState<ChatStatus>('idle');
  const [messages, setMessages]   = useState<Message[]>([
    {
      role: 'bot',
      text: 'Welcome to TalentMatch AI. To begin your screening, please enter your details and upload your CV.',
    },
  ]);
  const [sessionId, setSessionId]     = useState<string | null>(null);
  const [inputText, setInputText]     = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [nameEmail, setNameEmail]     = useState({ name: '', email: '' });
  const [showNameForm, setShowNameForm] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Hide floating widget on specific routes
  const isHiddenRoute = ['/dashboard', '/admin/job-setup'].some(r => location.pathname.startsWith(r));
  if (!inline && isHiddenRoute) return null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = useCallback((role: 'bot' | 'user', text: string) => {
    setMessages((prev: Message[]) => [...prev, { role, text }]);
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEmail.name.trim() || !nameEmail.email.trim()) return;
    setShowNameForm(false);
    addMessage('bot', `Thank you, ${nameEmail.name}. Please upload your CV using the attachment button below to proceed.`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addMessage('bot', 'File size limit is 5MB.');
      return;
    }

    addMessage('user', `Document submitted: ${file.name}`);
    setStatus('uploading');
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('name',    nameEmail.name);
      formData.append('email',   nameEmail.email);
      formData.append('cv_file', file);

      const res  = await fetch(`${API_BASE}/api/chat/start`, { method: 'POST', body: formData });
      const data = await res.json();
      setIsTyping(false);

      if (!res.ok) {
        addMessage('bot', `Error: ${data.error ?? 'Please try again.'}`);
        setStatus('idle');
        return;
      }

      if (!data.qualified) {
        addMessage('bot', data.message);
        setStatus('not_qualified');
        return;
      }

      setSessionId(data.session_id);
      addMessage('bot', `CV Scored: ${data.cv_score}/100. Let's begin the interview.`);
      addMessage('bot', data.first_question);
      setStatus('interviewing');
    } catch {
      setIsTyping(false);
      addMessage('bot', 'Connection error.');
      setStatus('idle');
    }
    e.target.value = '';
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !sessionId || status !== 'interviewing') return;

    addMessage('user', text);
    setInputText('');
    setIsTyping(true);

    try {
      const res  = await fetch(`${API_BASE}/api/chat/message`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ session_id: sessionId, message: text }),
      });
      const data = await res.json();
      setIsTyping(false);

      if (data.done) {
        addMessage('bot', data.message);
        addMessage('bot', `Interview complete. Result: ${data.status}`);
        setStatus('completed');
      } else {
        addMessage('bot', data.question);
      }
    } catch {
      setIsTyping(false);
      addMessage('bot', 'Connection lost.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const panelStyles = inline 
    ? "w-full max-w-[700px] h-[700px] rounded-[40px]"
    : "w-[calc(100vw-2rem)] sm:w-[450px] h-[calc(100vh-8rem)] sm:h-[650px] rounded-[40px]";

  const containerClasses = inline
    ? "mx-auto relative mb-20"
    : "fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-6";

  return (
    <div className={containerClasses}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={inline ? { opacity: 1 } : { opacity: 0, y: 40, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 40, scale: 0.9, rotate: -2 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className={`${panelStyles} flex flex-col bg-navy-900 border border-white/5 overflow-hidden shadow-[0_40px_100px_-20px_rgba(139,92,246,0.4)] backdrop-blur-3xl`}
          >
            {/* Header */}
            <div className="px-8 py-7 bg-navy-800/40 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-[18px] flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                  <IconChat />
                </div>
                <div>
                  <h3 className="text-white text-lg font-black tracking-tight italic">TalentMatch<span className="text-fuchsia-500">.</span></h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-[9px] text-purple-400 font-black uppercase tracking-[0.2em] opacity-80">
                      {status === 'interviewing' ? 'Live Synapse' : 'AI Agent Online'}
                    </p>
                  </div>
                </div>
              </div>
              {!inline && (
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                  <IconClose />
                </button>
              )}
            </div>

            {/* Name/Email Form */}
            <AnimatePresence>
              {showNameForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-8 py-6 bg-navy-800/20 border-b border-white/5"
                >
                  <form onSubmit={handleNameSubmit} className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Enter Full Name" 
                      required 
                      className="w-full bg-navy-900/60 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:bg-navy-900 outline-none transition-all"
                      value={nameEmail.name}
                      onChange={e => setNameEmail(p => ({ ...p, name: e.target.value }))}
                    />
                    <input 
                      type="email" 
                      placeholder="Enter Corporate Email" 
                      required 
                      className="w-full bg-navy-900/60 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:bg-navy-900 outline-none transition-all"
                      value={nameEmail.email}
                      onChange={e => setNameEmail(p => ({ ...p, email: e.target.value }))}
                    />
                    <button type="submit" className="w-full btn-primary !rounded-2xl !py-4 shadow-xl">
                      Initialize Link
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 scrollbar-hide">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-5 py-4 rounded-[26px] text-[15px] leading-relaxed font-medium shadow-xl ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-br-sm shadow-purple-500/20' 
                      : 'bg-navy-800 border border-white/5 text-slate-100 rounded-bl-sm shadow-black/20'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-navy-800/50 w-fit px-5 py-3 rounded-[20px] rounded-bl-sm border border-white/5">
                  <TypingIndicator />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Console */}
            <div className="px-8 py-6 bg-navy-900/80 border-t border-white/5 flex items-center gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={status !== 'idle' || showNameForm}
                className="w-12 h-12 bg-navy-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-20"
              >
                <IconPaperclip />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              
              <div className="flex-1 relative">
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Type message..."
                  disabled={status !== 'interviewing'}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-navy-800/50 border border-white/10 rounded-[24px] px-6 py-4 text-[15px] font-medium text-white outline-none focus:border-purple-500/50 focus:bg-navy-800 transition-all disabled:opacity-20 pr-16"
                />
                
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-0"
                >
                  <IconSend />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!inline && (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-[28px] shadow-[0_20px_60px_-10px_rgba(139,92,246,0.6)] flex items-center justify-center text-white ring-4 ring-purple-500/20"
        >
          {isOpen ? <IconClose /> : <IconChat />}
        </motion.button>
      )}
    </div>
  );
};

export default ChatWidget;
