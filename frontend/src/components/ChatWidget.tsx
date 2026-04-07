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
    ? "w-full max-w-[600px] h-[600px] shadow-2xl rounded-3xl"
    : "w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-8rem)] sm:h-[600px] shadow-2xl rounded-3xl";

  const containerClasses = inline
    ? "mx-auto relative mb-20"
    : "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4";

  return (
    <div className={containerClasses}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={inline ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`${panelStyles} flex flex-col bg-navy-900 border border-white/5 overflow-hidden shadow-purple-500/10`}
          >
            {/* Header */}
            <div className="px-6 py-5 bg-navy-800 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-gradient rounded-xl flex items-center justify-center">
                  <IconChat />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-tight">TalentMatch AI</h3>
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">
                    {status === 'interviewing' ? 'Live Session' : 'AI Recruiter'}
                  </p>
                </div>
              </div>
              {!inline && (
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
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
                  className="px-6 py-5 bg-navy-800/50 border-b border-white/5"
                >
                  <form onSubmit={handleNameSubmit} className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      required 
                      className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none"
                      value={nameEmail.name}
                      onChange={e => setNameEmail(p => ({ ...p, name: e.target.value }))}
                    />
                    <input 
                      type="email" 
                      placeholder="Your Email" 
                      required 
                      className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none"
                      value={nameEmail.email}
                      onChange={e => setNameEmail(p => ({ ...p, email: e.target.value }))}
                    />
                    <button type="submit" className="w-full btn-primary py-2.5 rounded-xl text-sm font-bold">
                      Start Screening
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-purple-gradient text-white rounded-br-sm shadow-lg shadow-purple-500/10' 
                      : 'bg-navy-800 text-slate-200 border border-white/5 rounded-bl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="bg-navy-800 w-fit px-4 py-2 rounded-2xl rounded-bl-sm border border-white/5"><TypingIndicator /></div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-navy-900 border-t border-white/5 flex items-center gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={status !== 'idle' || showNameForm}
                className="p-2.5 bg-navy-800 rounded-xl text-slate-400 hover:text-purple-400 transition-colors disabled:opacity-30"
              >
                <IconPaperclip />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Type your message..."
                disabled={status !== 'interviewing'}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-navy-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 disabled:opacity-30"
              />
              
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2.5 bg-purple-gradient rounded-xl text-white shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
              >
                <IconSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!inline && (
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-purple-gradient rounded-3xl shadow-2xl flex items-center justify-center text-white"
        >
          {isOpen ? <IconClose /> : <IconChat />}
        </motion.button>
      )}
    </div>
  );
};

export default ChatWidget;
