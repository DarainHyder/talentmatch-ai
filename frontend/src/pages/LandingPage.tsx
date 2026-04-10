import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ─── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16" style={{ background: '#f0fafa' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-20">
          {/* Left: Text */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h1
              className="text-5xl md:text-6xl font-black leading-tight mb-6"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}
            >
              Smarter Hiring{' '}
              <span style={{ color: '#26E4E4' }}>Starts Here...</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg">
              An AI powered assistant that screens resumes chats with candidates and delivers instant evaluations.
            </p>

            <Link
              to="/chatbot"
              className="inline-flex items-center gap-2 text-white font-bold text-base px-8 py-4 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #006a6a 0%, #26E4E4 100%)', boxShadow: '0 4px 20px rgba(38,228,228,0.35)' }}
            >
              Try Demo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>

          {/* Right: Real Waving Robot */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <motion.img
              src="/hero-robot.png"
              alt="Smart Hire AI Robot"
              className="w-full max-w-[480px] object-contain drop-shadow-2xl"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </section>

      {/* ─── THE FUTURE OF RECRUITMENT ─────────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#f2f3ff' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
              The Future of Recruitment
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Our platform transforms how companies find and hire top talent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Save Time',
                desc: 'Stop spending hours on resumes. Our AI scans and shortlists candidates instantly, giving your team more time for strategic decisions.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="#26E4E4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Stress-Free Interviews',
                desc: 'Chat-based interviews let candidates showcase their skills comfortably, creating a fairer, more relaxed experience.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="#26E4E4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                  </svg>
                ),
              },
              {
                title: 'Fast, Fair Decisions',
                desc: 'AI analyzes candidate responses objectively, helping your team make faster, more accurate, and unbiased hiring decisions.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="#26E4E4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ y: 24, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: '0 4px 20px rgba(19,27,46,0.05)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(38,228,228,0.12)' }}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-black mb-3" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
                  {card.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REVOLUTIONIZE — WAVY STEPS SECTION ────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
              Revolutionize Your Hiring Process
            </h2>
          </div>

          {/* Wavy Path Steps — exact layout from reference site */}
          <div className="relative" style={{ minHeight: '380px' }}>
            {/* SVG wavy connecting path */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1100 360"
              preserveAspectRatio="none"
              style={{ zIndex: 0 }}
            >
              <defs>
                <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#26E4E4" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#006a6a" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              {/* Wavy path: starts at step 1 badge (left-low), curves up to step 2 (center-high), curves down to step 3 (right-mid) */}
              <path
                d="M 180 260 C 300 260 360 100 550 100 C 740 100 800 200 920 200"
                fill="none"
                stroke="url(#pathGrad)"
                strokeWidth="3"
                strokeDasharray="none"
                opacity="0.7"
              />
            </svg>

            {/* Large watermark step numbers */}
            <span className="absolute left-12 top-8 text-[120px] font-black select-none pointer-events-none"
              style={{ color: 'rgba(38,228,228,0.12)', fontFamily: 'Manrope, sans-serif', lineHeight: 1, zIndex: 0 }}>1</span>
            <span className="absolute left-1/2 -translate-x-1/2 top-4 text-[120px] font-black select-none pointer-events-none"
              style={{ color: 'rgba(38,228,228,0.12)', fontFamily: 'Manrope, sans-serif', lineHeight: 1, zIndex: 0 }}>2</span>
            <span className="absolute right-12 top-16 text-[120px] font-black select-none pointer-events-none"
              style={{ color: 'rgba(38,228,228,0.12)', fontFamily: 'Manrope, sans-serif', lineHeight: 1, zIndex: 0 }}>3</span>

            {/* Step 1 — LEFT, LOWER */}
            <div className="absolute" style={{ left: '4%', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
              {/* Title above */}
              <div className="mb-4 max-w-[220px]">
                <h3 className="text-xl font-black mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>Resume Scan</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Upload a CV and the system instantly extracts skills experience and key strengths.</p>
              </div>
              {/* Shield badge */}
              <div className="w-16 h-18 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #e8fafa, #cdfafa)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  width: '64px', height: '72px',
                  boxShadow: '0 4px 20px rgba(38,228,228,0.2)',
                }}>
                <svg className="w-7 h-7" fill="none" stroke="#26E4E4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            {/* Step 2 — CENTER, HIGHER */}
            <div className="absolute" style={{ left: '50%', transform: 'translateX(-50%)', top: '3%', zIndex: 10 }}>
              {/* Shield badge */}
              <div className="mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #e8fafa, #cdfafa)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  width: '64px', height: '72px',
                  boxShadow: '0 4px 20px rgba(38,228,228,0.2)',
                }}>
                <img src="/screenify-bot.svg" alt="AI" className="w-8 h-8" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
                {/* Fallback icon */}
                <svg className="w-7 h-7 absolute" fill="none" stroke="#26E4E4" viewBox="0 0 24 24" style={{ display: 'none' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                </svg>
              </div>
              <div className="text-center max-w-[220px]">
                <h3 className="text-xl font-black mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>AI Chat Interview</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Candidates answer personalized questions through a smart chat interface.</p>
              </div>
            </div>

            {/* Step 3 — RIGHT, MIDDLE */}
            <div className="absolute" style={{ right: '4%', top: '35%', transform: 'translateY(-50%)', zIndex: 10 }}>
              {/* Shield badge */}
              <div className="mb-4 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #e8fafa, #cdfafa)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  width: '64px', height: '72px',
                  boxShadow: '0 4px 20px rgba(38,228,228,0.2)',
                }}>
                <svg className="w-7 h-7" fill="none" stroke="#26E4E4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="max-w-[220px]">
                <h3 className="text-xl font-black mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>Instant Ranking</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Performance is analyzed and candidates are ranked for quick decision making.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MEET YOUR SMART HIRING ASSISTANT ──────────────────────────────────── */}
      <section className="py-24" style={{ background: '#edfdfb' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif', color: '#0F172A' }}>
              Meet Your Smart{' '}
              <span style={{ color: '#26E4E4' }}>Hiring Assistant</span>
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Experience how the assistant chats with candidates listens understands and responds instantly.
              Each message is personalized and clear so the conversation feels natural and guided from start
              to finish. Candidates answer comfortably and HR receives structured insights without any extra effort.
            </p>

            {/* Walking robot below text */}
            <motion.img
              src="/chat-robot.png"
              alt="AI Assistant"
              className="w-48 mt-8 object-contain"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </motion.div>

          {/* Right: Chat UI Card */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(38,228,228,0.15)' }}>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ background: '#26E4E4' }}>
                <img
                  src="/screenify-bot.svg"
                  alt="Screenify"
                  className="w-9 h-9 rounded-full bg-white/20 p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/screenify-bot.png';
                  }}
                />
                <span className="font-bold text-white text-lg">Screenify</span>
              </div>

              {/* Messages */}
              <div className="p-5 flex flex-col gap-4 bg-white min-h-[220px]">
                {/* Bot message 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-gray-100">
                    <img src="/screenify-bot.svg" alt="bot" className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/screenify-bot.png'; }} />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[75%]">
                    <p className="text-gray-700 text-sm">Hi.... I am your hiring assistant. I will ask a few quick questions. Ready to start?</p>
                  </div>
                </div>

                {/* User message */}
                <div className="flex items-center justify-end gap-2">
                  <div className="px-4 py-3 rounded-2xl rounded-tr-none text-sm text-gray-700 bg-gray-100 max-w-[60%]">
                    Yes let's start.
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">You</span>
                </div>

                {/* Bot message 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-gray-100">
                    <img src="/screenify-bot.svg" alt="bot" className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/screenify-bot.png'; }} />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-[75%]">
                    <p className="text-gray-700 text-sm">Great. Tell me about your most recent role and what you were responsible for.</p>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50">
                  <input
                    type="text"
                    placeholder="Enter your Message.."
                    className="flex-1 bg-transparent text-sm text-gray-500 outline-none"
                    readOnly
                  />
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: '#26E4E4' }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
