import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';

// ── Scroll reveal hook ────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left');
    const io  = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Ico = {
  arrow: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
    </svg>
  ),
  cv: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  brain: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7v0A2.5 2.5 0 017 9.5v5A2.5 2.5 0 019.5 17v0a2.5 2.5 0 002.5 2.5h0A2.5 2.5 0 0014.5 17v-5A2.5 2.5 0 0017 9.5v0A2.5 2.5 0 0019.5 7v0A2.5 2.5 0 0017 4.5v0A2.5 2.5 0 0014.5 2H9.5z"/>
    </svg>
  ),
  chart: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  shield: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

// ── Data ──────────────────────────────────────────────────────────────────────
const features = [
  { icon: <Ico.cv />,     title: 'Smart CV Parsing',     desc: 'Extracts and normalises technical skills from PDF and DOCX documents using production NLP.' },
  { icon: <Ico.brain />,  title: 'Adaptive Interviews',  desc: 'Tailored, context-aware questions generated per candidate by Gemini 1.5 Flash.' },
  { icon: <Ico.chart />,  title: 'Objective Ranking',    desc: 'TF-IDF skill matching combined with structured response scoring for bias-free ranking.' },
  { icon: <Ico.shield />, title: 'Consistent Criteria',  desc: 'Identical evaluation framework applied to every applicant — fair by design.' },
];

const steps = [
  { num: '01', title: 'Upload CV',            desc: 'Submit your PDF or DOCX via the chat window.' },
  { num: '02', title: 'Automated Analysis',   desc: 'NLP extracts and scores skills against job requirements.' },
  { num: '03', title: 'AI-Led Interview',     desc: 'Answer tailored questions at your own pace.' },
  { num: '04', title: 'Instant Evaluation',   desc: 'Score calculated and delivered to the hiring team.' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  useReveal();

  const { scrollY } = useScroll();
  const textY  = useTransform(scrollY, [0, 400], [0, -50]);
  const textOp = useTransform(scrollY, [0, 350], [1, 0]);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: 'var(--bg)' }}>

      {/* ══ HEADER ════════════════════════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: 'rgba(8,8,15,0.85)', backdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">TalentMatch</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5">Sign In</Link>
            <Link to="/dashboard" className="btn-violet !px-4 !py-2 !text-xs">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* ══ HERO (STATIC BG, ANIMATED TEXT) ════════════════════════════════════ */}
      <section className="relative h-screen min-h-[660px] flex items-center overflow-hidden">

        {/* Wallpaper — completely static */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/hero-bg.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,8,15,0.85) 0%, rgba(8,8,15,0.65) 50%, rgba(8,8,15,0.80) 100%)' }} />
          {/* Bottom fade into page */}
          <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: 'linear-gradient(to bottom,transparent,var(--bg))' }} />
        </div>

        {/* Hero content — mapped to scroll (parallax text) */}
        <motion.div
          style={{ y: textY, opacity: textOp }}
          className="relative z-10 max-w-7xl mx-auto px-8 w-full pt-14"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
          >
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase mb-8"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" style={{ animation: 'pulse-ring 2s ease-out infinite', boxShadow: '0 0 0 0 rgba(167,139,250,0.6)' }} />
              AI Recruitment Platform
            </div>

            <h1 className="text-5xl md:text-[70px] font-bold leading-[1.05] tracking-tight mb-6 max-w-3xl">
              <span className="text-white block">Hire with</span>
              <span className="shimmer-text block">precision.</span>
            </h1>
            <p className="text-base text-zinc-400 leading-relaxed mb-10 max-w-xl">
              End-to-end AI screening — automated CV analysis, structured interviews,
              and ranked shortlists delivered to your team in minutes.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Open chat"]')?.click()}
                className="btn-violet"
              >
                Begin Application <Ico.arrow />
              </button>
              <Link to="/login" className="btn-ghost">Recruiter Access</Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator — floating */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-zinc-600 tracking-widest uppercase">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </motion.div>
      </section>

      {/* ══ METRICS ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 px-8 border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {[
            { value: '< 30s', label: 'CV Analysis'      },
            { value: '6',     label: 'Interview Questions'},
            { value: '100%',  label: 'Automated Process' },
            { value: '24/7',  label: 'Always Available'  },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className={`reveal reveal-delay-${i + 1} text-center px-8 py-8`}
              style={{ background: 'var(--surface)' }}
            >
              <p className="text-2xl font-bold text-white mb-1">{value}</p>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PROCESS ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="reveal mb-16">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#7c3aed' }}>How it works</p>
            <h2 className="text-3xl font-bold text-white">Four steps to the right hire</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Timeline bar */}
            <div className="hidden md:block absolute top-[52px] left-12 right-12 h-px" style={{ background: 'var(--border)' }}>
              <div className="reveal h-full" style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', transformOrigin: 'left', transform: 'scaleX(0)', transition: 'transform 1.5s cubic-bezier(0.16,1,0.3,1) 0.3s' }}
                ref={(el) => {
                  if (!el) return;
                  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.style.transform = 'scaleX(1)'; io.disconnect(); } }, { threshold: 0.5 });
                  io.observe(el);
                }}
              />
            </div>

            {steps.map((step, i) => (
              <div key={step.num} className={`reveal reveal-delay-${i + 1}`}>
                {/* Circle */}
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center mb-5 relative"
                  style={{ background: i === 0 ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'var(--surface-2)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <span className="text-xs font-bold font-mono" style={{ color: i === 0 ? '#fff' : '#7c3aed' }}>{step.num}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-8 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="reveal mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#06b6d4' }}>Platform capabilities</p>
            <h2 className="text-3xl font-bold text-white">Built for modern hiring teams</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`reveal reveal-delay-${i + 1} card p-6 group hover:border-violet-500/30 transition-all duration-300`}
                style={{ cursor: 'default' }}
              >
                <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center text-violet-400 transition-colors group-hover:text-cyan-400"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ════════════════════════════════════════════════════════ */}
      <section className="py-24 px-8 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto text-center reveal">
          <div className="card p-12 relative overflow-hidden">
            {/* BG gradient glow */}
            <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(124,58,237,0.35) 0%, transparent 70%)' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px" style={{ background: 'linear-gradient(90deg,transparent,#7c3aed,transparent)' }} />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-3">Ready to apply?</h2>
              <p className="text-sm mb-8" style={{ color: 'var(--text-dim)' }}>
                Open the chat in the corner, submit your CV, and complete the AI interview in ~10 minutes.
              </p>
              <button
                onClick={() => document.querySelector<HTMLButtonElement>('[aria-label="Open chat"]')?.click()}
                className="btn-violet"
              >
                Start Application <Ico.arrow />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t px-8 py-5" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>TalentMatch AI — FYP 2026</span>
          <Link to="/login" className="text-xs transition-colors hover:text-white" style={{ color: 'var(--muted)' }}>Recruiter Login</Link>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
};

export default LandingPage;
