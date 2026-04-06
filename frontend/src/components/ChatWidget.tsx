import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? '';

// ---------------------------------------------------------------------------
// Inline SVG Icons
// ---------------------------------------------------------------------------

const IconChat = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

const IconPaperclip = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

// ---------------------------------------------------------------------------
// ChatWidget
// ---------------------------------------------------------------------------

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen]       = useState(false);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = useCallback((role: 'bot' | 'user', text: string) => {
    setMessages((prev: Message[]) => [...prev, { role, text }]);
  }, []);

  // ── Name/Email submit ──────────────────────────────────────────────────────
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEmail.name.trim() || !nameEmail.email.trim()) return;
    setShowNameForm(false);
    addMessage('bot', `Thank you, ${nameEmail.name}. Please upload your CV using the attachment button below to proceed.`);
  };

  // ── CV Upload ──────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      addMessage('bot', 'Only PDF and DOCX files are supported. Please submit a compatible document.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addMessage('bot', 'The file exceeds the 5 MB limit. Please reduce the file size and try again.');
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
        addMessage('bot', `An error occurred: ${data.error ?? 'Please try again.'}`);
        setStatus('idle');
        return;
      }

      if (!data.qualified) {
        addMessage('bot', data.message);
        setStatus('not_qualified');
        return;
      }

      setSessionId(data.session_id);
      addMessage('bot',
        `Your CV has been reviewed. Skills matched: ${data.matched_skills?.join(', ')}. CV Score: ${data.cv_score}/100.\n\nWe will now begin the interview. Please answer each question as thoroughly as possible.`
      );
      addMessage('bot', data.first_question);
      setStatus('interviewing');
      setTimeout(() => inputRef.current?.focus(), 100);

    } catch {
      setIsTyping(false);
      addMessage('bot', 'Unable to connect to the server. Please ensure the service is running.');
      setStatus('idle');
    }

    e.target.value = '';
  };

  // ── Send message ───────────────────────────────────────────────────────────
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

      if (!res.ok) {
        addMessage('bot', `Error: ${data.error ?? 'Something went wrong.'}`);
        return;
      }

      if (data.done) {
        addMessage('bot', data.message);
        addMessage('bot', `Interview complete. Final score: ${data.final_score}/100 — Status: ${data.status}`);
        setStatus('completed');
      } else {
        addMessage('bot', data.question);
      }
    } catch {
      setIsTyping(false);
      addMessage('bot', 'Connection lost. Please check your network and try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Computed flags ─────────────────────────────────────────────────────────
  const inputDisabled =
    showNameForm || status === 'idle' || status === 'uploading' ||
    status === 'not_qualified' || status === 'completed';

  const uploadDisabled =
    showNameForm || ['uploading', 'interviewing', 'completed', 'not_qualified'].includes(status);

  const placeholder =
    showNameForm        ? 'Complete the form above…' :
    status === 'idle'   ? 'Upload your CV to begin…' :
    status === 'uploading' ? 'Reviewing your document…' :
    status === 'completed' ? 'Session completed.' :
    status === 'not_qualified' ? 'Application received.' :
    'Type your response…';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">

      {/* ─── Chat Panel ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="w-[calc(100vw-2rem)] sm:w-[388px] h-[calc(100vh-6rem)] sm:h-[560px] max-h-[85vh] flex flex-col rounded-2xl overflow-hidden border border-white/8 shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >

            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-white/6"
              style={{ background: 'rgba(99,102,241,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white leading-none">TalentMatch AI</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {status === 'interviewing' ? 'Interview in progress' :
                     status === 'completed'    ? 'Session completed'    :
                     status === 'not_qualified' ? 'Application received' : 'Recruitment Assistant'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-all"
                aria-label="Close panel"
              >
                <IconClose />
              </button>
            </div>

            {/* ── Name/Email form ── */}
            <AnimatePresence>
              {showNameForm && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{   opacity: 0, height: 0 }}
                  onSubmit={handleNameSubmit}
                  className="px-5 pt-4 pb-3 border-b border-white/5 overflow-hidden"
                  style={{ background: 'rgba(15,23,42,0.8)' }}
                >
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-3">Applicant Details</p>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={nameEmail.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameEmail((n: typeof nameEmail) => ({ ...n, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-white/8 rounded-lg text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={nameEmail.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameEmail((n: typeof nameEmail) => ({ ...n, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-white/8 rounded-lg text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold rounded-lg transition-colors duration-150"
                    >
                      Continue
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* ── Message Thread ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {/* Bot avatar */}
                  {msg.role === 'bot' && (
                    <div className="w-6 h-6 rounded-md bg-indigo-600/80 flex items-center justify-center flex-shrink-0 mb-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3C7.86 3 4.5 6.36 4.5 10.5c0 2.1.81 4.01 2.14 5.45L5 21l5.18-1.8A8.0 8.0 0 0012 19.5c4.14 0 7.5-3.36 7.5-7.5S16.14 3 12 3z"/>
                      </svg>
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-slate-800/80 text-slate-200 border border-white/6 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* User avatar */}
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center flex-shrink-0 mb-0.5 text-slate-400">
                      <IconUser />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start items-end gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-600/80 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3C7.86 3 4.5 6.36 4.5 10.5c0 2.1.81 4.01 2.14 5.45L5 21l5.18-1.8A8.0 8.0 0 0012 19.5c4.14 0 7.5-3.36 7.5-7.5S16.14 3 12 3z"/>
                    </svg>
                  </div>
                  <div className="bg-slate-800/80 border border-white/6 rounded-2xl rounded-bl-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Bar ── */}
            <div className="px-4 py-3 border-t border-white/6 bg-[#0a0f1e] flex items-center gap-2">
              {/* Attachment */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadDisabled}
                title="Attach CV (PDF or DOCX)"
                className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                  uploadDisabled
                    ? 'text-slate-700 cursor-not-allowed'
                    : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                <IconPaperclip />
              </button>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />

              {/* Text input */}
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={inputText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={inputDisabled}
                className={`flex-1 bg-slate-800/60 border rounded-lg px-3.5 py-2 text-[13px] text-white placeholder-slate-600 focus:outline-none transition-colors ${
                  inputDisabled
                    ? 'border-white/4 cursor-not-allowed opacity-40'
                    : 'border-white/8 focus:border-indigo-500/50'
                }`}
              />

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={inputDisabled || !inputText.trim()}
                className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                  inputDisabled || !inputText.trim()
                    ? 'text-slate-700 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                }`}
              >
                <IconSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Floating Button ────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{  scale: 0.92 }}
        aria-label="Open chat"
        className="relative w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 group"
        style={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
          boxShadow: '0 12px 40px rgba(124,58,237,0.4), inset 0 2px 4px rgba(255,255,255,0.2)' 
        }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <IconClose />
            </motion.div>
          ) : (
            <motion.div key="c"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <IconChat />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Online indicator */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-[3px] border-[#08080f] shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
        )}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
