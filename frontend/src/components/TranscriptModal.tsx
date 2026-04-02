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
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{   opacity: 0, scale: 0.93, y: 20  }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
          style={{ background: '#0f172a', border: '1px solid #334155' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-start justify-between p-5 border-b border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
              <p className="text-sm text-slate-400">{candidate.email}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Score breakdown ── */}
          <div className="grid grid-cols-3 gap-3 px-5 py-4 border-b border-slate-700">
            {[
              { label: 'CV Score',        value: candidate.cv_score,        color: 'text-sky-400'     },
              { label: 'Interview Score', value: candidate.interview_score,  color: 'text-indigo-400' },
              { label: 'Final Score',     value: candidate.final_score,      color: 'text-emerald-400'},
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{Number(value).toFixed(0)}<span className="text-base font-normal text-slate-400">/100</span></p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Summary ── */}
          {candidate.summary && (
            <div className="px-5 py-3 bg-indigo-600/10 border-b border-indigo-500/20">
              <p className="text-sm text-indigo-300 italic">{candidate.summary}</p>
            </div>
          )}

          {/* ── Transcript ── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {transcript.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No transcript available.</p>
            ) : (
              transcript.map((msg, i) => {
                const isBot = msg.role === 'bot';
                return (
                  <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                    {isBot && (
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                        🤖
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isBot
                          ? 'bg-slate-700/70 text-slate-100 border border-slate-600/40 rounded-bl-sm'
                          : 'bg-indigo-600 text-white rounded-br-sm'
                      }`}
                    >
                      {msg.message}
                      {msg.timestamp && (
                        <p className="text-xs opacity-50 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TranscriptModal;
