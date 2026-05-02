import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ?? '';

interface ChatWidgetProps {
  user: any;
  hidden: boolean;
  inline?: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ user, hidden, inline = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'bot', content: "Hello! I am your Smart Hire AI co-pilot. Please enter your name and email, then upload your CV to initialize the screening protocol." }
  ]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [jobAvailable, setJobAvailable] = useState(true);
  const [jobInfo, setJobInfo] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [restoreCompleted, setRestoreCompleted] = useState(false);
  const [cvAttempts, setCvAttempts] = useState(0);
  const [maxCvAttempts] = useState(3);
  const [firstQuestionAnswered, setFirstQuestionAnswered] = useState(false);
  const STORAGE_KEY = 'smart_hire_chat_state';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchJobAvailability = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs`);
      if (!res.ok) {
        setJobAvailable(false);
        setJobInfo(null);
        return;
      }
      const data = await res.json();
      if (data?.job) {
        setJobInfo(data.job);
        setJobAvailable(Boolean(data.job.is_visible ?? true));
      } else {
        setJobAvailable(false);
        setJobInfo(null);
      }
    } catch {
      setJobAvailable(false);
      setJobInfo(null);
    }
  };
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore session state after page refresh
  useEffect(() => {
    if (restoreCompleted) return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.sessionId) {
          setSessionId(parsed.sessionId);
          setIsUploaded(parsed.isUploaded || false);
          setCvAttempts(parsed.cvAttempts || 0);
          setFirstQuestionAnswered(parsed.firstQuestionAnswered || false);
          setMessages(Array.isArray(parsed.messages) && parsed.messages.length > 0 ? parsed.messages : messages);
          setUserName(parsed.userName || '');
          setUserEmail(parsed.userEmail || '');
        }
      }
    } catch (error) {
      console.warn('Failed to restore chat session:', error);
    } finally {
      setRestoreCompleted(true);
    }
  }, [restoreCompleted, messages]);

  useEffect(() => {
    if (!restoreCompleted) return;
    const payload = {
      sessionId,
      isUploaded,
      userName,
      userEmail,
      messages,
      cvAttempts,
      firstQuestionAnswered,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('Unable to persist chat state:', error);
    }
  }, [sessionId, isUploaded, userName, userEmail, messages, restoreCompleted, cvAttempts, firstQuestionAnswered]);

  useEffect(() => {
    fetchJobAvailability();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 1): Promise<any> => {
    try {
      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.error || data.message || res.statusText || 'Unknown server error';
        throw new Error(message);
      }

      return data;
    } catch (error: any) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 700));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!jobAvailable) {
      setMessages(prev => [
        ...prev,
        { role: 'bot', content: 'No active job posting is available at the moment. The chatbot is paused until a new opportunity is published.' }
      ]);
      return;
    }

    // Check if CV uploads are still allowed
    if (firstQuestionAnswered) {
      setMessages(prev => [
        ...prev,
        { role: 'bot', content: 'Resume upload has been locked. Your interview is in progress. You must complete this interview to participate again.' }
      ]);
      return;
    }

    if (cvAttempts >= maxCvAttempts) {
      setMessages(prev => [
        ...prev,
        { role: 'bot', content: `You have used all ${maxCvAttempts} resume upload attempts. Please proceed with your current upload or contact support.` }
      ]);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('cv_file', file);
    formData.append('name', userName || 'Candidate');
    formData.append('email', userEmail || 'candidate@smarthire.ai');

    try {
      const data = await fetchWithRetry(`${API_BASE}/api/chat/start`, {
        method: 'POST',
        body: formData,
      }, 2);

      const newAttempts = cvAttempts + 1;
      setCvAttempts(newAttempts);

      if (data.session_id && data.qualified) {
        setSessionId(data.session_id);
        setIsUploaded(true);
        setMessages(prev => [
          ...prev,
          { role: 'user', content: `Attached CV: ${file.name}` },
          { role: 'bot', content: `CV Analyzed. Integrity Check: 100%. Welcome ${data.name || 'Candidate'}. Neural Indexing Completed (${data.cv_score}% match).` },
          { role: 'bot', content: data.first_question },
          { role: 'bot', content: `📝 Resume Upload Status: ${newAttempts}/${maxCvAttempts} attempts used. Once you answer the first question below, you won't be able to upload a new resume.` }
        ]);
      } else if (data.qualified === false) {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: `Attached CV: ${file.name}` },
          { role: 'bot', content: data.message || 'Your CV was processed but did not meet the minimum requirements.' },
          { role: 'bot', content: `📝 Resume Upload Status: ${newAttempts}/${maxCvAttempts} attempts used. ${maxCvAttempts - newAttempts} attempts remaining.` }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'bot', content: data.error || 'Unexpected response from the interview engine.' }
        ]);
      }
    } catch (err: any) {
      const newAttempts = cvAttempts + 1;
      setCvAttempts(newAttempts);
      setMessages(prev => [
        ...prev,
        { role: 'bot', content: err?.message || 'Neural link interrupted. Please ensure the CV is a valid PDF/Word document.' },
        { role: 'bot', content: `📝 Resume Upload Status: ${newAttempts}/${maxCvAttempts} attempts used. ${maxCvAttempts - newAttempts} attempts remaining.` }
      ]);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || isTyping) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const data = await fetchWithRetry(`${API_BASE}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: userMsg }),
      }, 2);

      if (data.done) {
        setMessages(prev => [...prev, { role: 'bot', content: `${data.message}\n\nFinal Score: ${data.final_score}%` }]);
      } else {
        // Track that first question has been answered (lock CV uploads after first answer)
        if (!firstQuestionAnswered) {
          setFirstQuestionAnswered(true);
        }
        setMessages(prev => [...prev, { role: 'bot', content: data.question || data.error || 'Unable to fetch the next question.' }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'bot', content: err?.message || 'Neural lag detected. Attempting to reconnect to core...' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (hidden && !inline) return null;

  return (
    <div className={`${inline ? 'w-full' : 'fixed bottom-8 right-8 z-[100]'}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".pdf,.doc,.docx" 
      />
      
      <AnimatePresence>
        {(isOpen || inline) && (
          <motion.div 
            initial={inline ? {} : { opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`flex flex-col border border-slate-100 shadow-[0_30px_100px_-20px_rgba(6,182,212,0.15)] bg-white/90 backdrop-blur-2xl overflow-hidden ${
              inline ? 'w-full h-[650px] rounded-[32px]' : 'w-96 h-[550px] rounded-[30px] mb-6'
            }`}
          >
            {/* Header */}
            <div className="px-6 py-4 flex flex-col gap-3 border-b border-white/20" style={{ background: '#26E4E4' }}>
               <div className="flex items-center gap-3 justify-between">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white shadow-sm p-1">
                    <img src="/screenify-bot.svg" alt="Bot" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: 'Manrope, sans-serif' }}>Smart Hire</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className={`w-1.5 h-1.5 rounded-full animate-pulse bg-white`} />
                       <p className="text-[10px] text-white/90 font-medium uppercase tracking-widest">
                         {isUploaded ? 'Linked: Evaluation Mode' : 'Awaiting CV Upload'}
                       </p>
                    </div>
                  </div>
               </div>
               <div className={`rounded-2xl px-4 py-2 text-xs font-semibold ${jobAvailable ? 'bg-white/15 text-white' : 'bg-white/20 text-slate-800'}`}>
                 {jobAvailable ? (
                   jobInfo ? `Now hiring: ${jobInfo.title} · ${jobInfo.required_skills || 'Skills not listed yet'}` : 'Loading current job opportunity...'
                 ) : (
                   'No active job opportunity at this time. Chatbot screening is paused until a role is published.'
                 )}
               </div>
               {!inline && (
                 <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               )}
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-white to-slate-50/30"
            >
               {messages.map((m, i) => (
                 <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${
                      m.role === 'bot' 
                        ? 'bg-transparent' 
                        : 'bg-gradient-to-br from-cyan-500 to-sky-500 text-white shadow-lg'
                    }`}>
                       {m.role === 'bot' ? (
                          <img src="/screenify-bot.svg" alt="bot" className="w-full h-full object-contain p-0.5 rounded-full bg-slate-100" />
                       ) : 'YOU'}
                    </div>
                    <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed relative ${
                      m.role === 'bot' 
                        ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-sm' 
                        : 'bg-cyan-50 text-cyan-900 border border-cyan-100 rounded-tr-sm'
                    }`}>
                       {m.content}
                       {m.role === 'bot' && i === messages.length - 1 && isTyping && (
                         <div className="absolute -bottom-4 left-2 flex gap-1">
                           <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" />
                           <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce delay-75" />
                           <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce delay-150" />
                         </div>
                       )}
                    </div>
                 </div>
               ))}
               {uploading && (
                 <div className="flex gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 animate-spin">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </div>
                    <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-100 text-[13px] font-bold text-slate-400 italic">
                      Neural Indexing in Progress...
                    </div>
                 </div>
               )}
            </div>

            {/* Footer / Input */}
            <form onSubmit={sendMessage} className="p-6 border-t border-slate-100 bg-white shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.02)]">
               <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${
                      isUploaded 
                        ? 'bg-emerald-50 text-emerald-500 border-emerald-100' 
                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-cyan-500/30 hover:text-cyan-500'
                    }`}
                  >
                    {isUploaded ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    )}
                  </button>

                  <div className="flex-1 flex flex-col gap-2">
                    {!isUploaded && (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Name"
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800"
                          value={userName}
                          onChange={e => setUserName(e.target.value)}
                        />
                        <input 
                          type="email" 
                          placeholder="Email"
                          className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800"
                          value={userEmail}
                          onChange={e => setUserEmail(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="relative">
                      <input 
                        type="text" 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder={isUploaded ? "Enter neural signal..." : "Enter info & upload CV..."}
                        disabled={!isUploaded || isTyping}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:border-cyan-500/50 focus:bg-white outline-none transition-all pr-14 disabled:opacity-50" 
                      />
                      <button 
                        type="submit" 
                        disabled={!isUploaded || isTyping}
                        className="absolute right-2 top-2 w-10 h-10 bg-cyan-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform disabled:opacity-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
                      </button>
                    </div>
                  </div>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!inline && !isOpen && (
        <motion.button 
          initial={{ scale: 0, rotate: -20 }} 
          animate={{ scale: 1, rotate: 0 }} 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all relative group"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
        </motion.button>
      )}
    </div>
  );
};

export default ChatWidget;
