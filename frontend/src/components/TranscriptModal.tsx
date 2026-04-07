import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranscriptEntry {
  role: string;
  message: string;
  timestamp?: string;
}

interface Candidate {
  session_id: string;
  name: string;
  email: string;
  cv_score: number;
  interview_score: number;
  final_score: number;
  status: string;
  summary?: string;
}

interface TranscriptModalProps {
  candidate: Candidate;
  transcript: TranscriptEntry[];
  onClose: () => void;
}

const TranscriptModal: React.FC<TranscriptModalProps> = ({ candidate, transcript, onClose }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy-900/90 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-navy-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-purple-gradient rounded-2xl flex items-center justify-center text-white font-black text-lg">
                 {candidate.name[0].toUpperCase()}
               </div>
               <div>
                 <h2 className="text-xl font-black text-white tracking-tight">{candidate.name}</h2>
                 <p className="text-sm text-slate-500 font-medium">{candidate.email}</p>
               </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scores */}
          <div className="px-8 py-6 grid grid-cols-3 gap-6 bg-navy-800/50">
             {[
               { label: 'CV Score', val: candidate.cv_score, color: 'text-purple-400' },
               { label: 'Interview', val: candidate.interview_score, color: 'text-emerald-400' },
               { label: 'Final Result', val: candidate.final_score, color: 'text-white' }
             ].map((s, i) => (
                <div key={i} className="text-center">
                   <p className={`text-2xl font-black ${s.color}`}>{s.val.toFixed(0)}</p>
                   <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">{s.label}</p>
                </div>
             ))}
          </div>

          {/* Summary */}
          {candidate.summary && (
            <div className="px-8 py-4 bg-purple-gradient/10 border-b border-purple-500/20">
               <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-xs font-bold text-slate-300 leading-relaxed italic pr-4">"{candidate.summary}"</p>
               </div>
            </div>
          )}

          {/* Transcript List */}
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
             {transcript.length === 0 ? (
                <div className="py-20 text-center text-slate-600 font-bold italic">Establishing neural connection... Transcript processing.</div>
             ) : (
                transcript.map((t, i) => (
                   <div key={i} className={`flex gap-4 ${t.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black ${
                        t.role === 'bot' ? 'bg-purple-gradient text-white' : 'bg-navy-800 text-slate-400 border border-white/10'
                      }`}>
                         {t.role === 'bot' ? 'AI' : 'YOU'}
                      </div>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        t.role === 'bot' ? 'bg-navy-800 text-slate-300 rounded-tl-sm border border-white/5' : 'bg-purple-gradient text-white rounded-tr-sm shadow-xl shadow-purple-500/10'
                      }`}>
                         {t.message}
                      </div>
                   </div>
                ))
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TranscriptModal;
