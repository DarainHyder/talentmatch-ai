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
  phone?: string;
  cv_email?: string;
  extracted_skills?: string;
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
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-cyan-50/50 to-transparent">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/20">
                 {candidate.name[0].toUpperCase()}
               </div>
               <div>
                 <h2 className="text-xl font-black text-slate-900 tracking-tight italic">{candidate.name}</h2>
                 <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">{candidate.email}</p>
               </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-cyan-500 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scores - Light HUD */}
          <div className="px-8 py-6 grid grid-cols-3 gap-6 bg-slate-50/50">
             {[
               { label: 'CV Match', val: candidate.cv_score, color: 'text-slate-900' },
               { label: 'Interview', val: candidate.interview_score, color: 'text-cyan-500' },
               { label: 'Final Score', val: candidate.final_score, color: 'text-sky-600' }
             ].map((s, i) => (
                <div key={i} className="text-center">
                   <p className={`text-2xl font-black ${s.color} italic`}>{s.val.toFixed(0)}</p>
                   <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 mt-1">{s.label}</p>
                </div>
             ))}
          </div>

          {/* AI Summary Card */}
          {candidate.summary && (
            <div className="px-8 py-4 bg-cyan-50/30 border-b border-cyan-100">
               <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 bg-white border border-cyan-100 rounded-lg flex items-center justify-center text-cyan-500 shadow-sm">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed italic pr-4">"{candidate.summary}"</p>
               </div>
            </div>
          )}

          {/* Parsed Contact & Skills Intel */}
          <div className="px-8 py-5 border-b border-slate-100 bg-white">
             <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex gap-6">
                   {candidate.phone && (
                     <div>
                       <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1">Parsed Phone</p>
                       <p className="text-xs font-bold text-slate-700">{candidate.phone}</p>
                     </div>
                   )}
                   {candidate.cv_email && candidate.cv_email !== candidate.email && (
                     <div>
                       <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1">Parsed Email</p>
                       <p className="text-xs font-bold text-slate-700">{candidate.cv_email}</p>
                     </div>
                   )}
                </div>
                {candidate.extracted_skills && (
                  <div className="flex-1 max-w-sm">
                     <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-2">Parsed Skills</p>
                     <div className="flex flex-wrap gap-1.5">
                       {candidate.extracted_skills.split(',').map((skill, idx) => (
                         <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-600">
                           {skill.trim()}
                         </span>
                       ))}
                     </div>
                  </div>
                )}
             </div>
          </div>

          {/* Transcript List - Light/Cyan Theme */}
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 bg-gradient-to-b from-white to-slate-50/20">
             {transcript.length === 0 ? (
                <div className="py-20 text-center">
                   <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Neural Transcript...</p>
                </div>
             ) : (
                transcript.map((t, i) => (
                   <div key={i} className={`flex gap-4 ${t.role === 'user' || t.role === 'candidate' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black border transition-all ${
                        t.role === 'bot' 
                          ? 'bg-white text-slate-400 border-slate-100 shadow-sm' 
                          : 'bg-gradient-to-br from-cyan-500 to-sky-500 text-white border-transparent shadow-lg shadow-cyan-500/20'
                      }`}>
                         {t.role === 'bot' ? 'TM' : 'ID'}
                      </div>
                      <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                        t.role === 'bot' 
                          ? 'bg-white text-slate-700 rounded-tl-sm border border-slate-100' 
                          : 'bg-cyan-50 text-cyan-900 rounded-tr-sm border border-cyan-100'
                      }`}>
                         {t.message}
                      </div>
                   </div>
                ))
             )}
          </div>

          <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
             Verified Neural Log Partition — ID: {candidate.session_id.slice(0, 8)}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TranscriptModal;
