#!/bin/bash
set -e

# Ensure directories
mkdir -p src/pages src/components src/utils

# --- utils/api.js (mocked) ---
cat > src/utils/api.js <<'EOL'
/**
 * Mock API helpers for Dashboard demo.
 * Replace these with real API / LLM calls later.
 */

export async function analyzeJobDescription(jobText) {
  // simulate work
  await new Promise((r) => setTimeout(r, 700));
  const words = jobText.trim().split(/\s+/).filter(Boolean);
  return {
    title: words.slice(0,3).join(' ') || 'Untitled Role',
    skills: ['React', 'Node.js', 'TypeScript', 'Testing'].slice(0, Math.min(4, Math.max(1, Math.floor(words.length/10)))),
    summary: jobText.slice(0, 240) + (jobText.length > 240 ? '...' : ''),
    scoreHint: Math.min(100, Math.max(40, Math.floor(words.length * 2)))
  };
}

export async function uploadCandidateFiles(filesOrNames, parsedJD) {
  // filesOrNames: either File objects or array of strings (our placeholders)
  await new Promise((r) => setTimeout(r, 400));
  // Normalize to candidates array
  const items = filesOrNames.map((f, i) => {
    const name = typeof f === 'string' ? f : (f.name || `Candidate ${i+1}`);
    return {
      id: `${Date.now()}-${i}`,
      name,
      experience: `${1 + (i % 7)} years`,
      score: Math.floor(50 + Math.random() * 50) // mock score 50-99
    };
  });
  return items;
}

export async function generateInterviewQuestions(parsedJD, candidates) {
  await new Promise((r) => setTimeout(r, 500));
  // basic mock: return 3 questions per candidate + 2 role-level questions
  const base = [
    `Tell us about a project where you used ${parsedJD?.skills?.[0] ?? 'relevant tech'}.`,
    `How do you approach debugging and testing?`,
  ];
  const perCandidate = candidates.slice(0,5).flatMap((c, idx) => [
    `For ${c.name}: describe a challenge you solved in ${c.experience}.`,
  ]);
  return [...base, ...perCandidate];
}
EOL

# --- src/components/Sidebar.jsx ---
cat > src/components/Sidebar.jsx <<'EOL'
import React from "react";
import { motion } from "framer-motion";

export default function Sidebar({ className }) {
  return (
    <aside className={\`w-64 p-4 bg-white/60 backdrop-blur rounded-r-2xl shadow-sm hidden md:block \${className || ""}\`}>
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center text-white font-bold">TM</div>
        <div>
          <div className="font-semibold">TalentMatch</div>
          <div className="text-xs text-slate-500">AI Hiring</div>
        </div>
      </div>

      <nav className="space-y-2 text-sm">
        <NavItem label="Dashboard" />
        <NavItem label="Candidates" />
        <NavItem label="Job Description" />
        <NavItem label="Interview" />
        <NavItem label="Exports" />
      </nav>
    </aside>
  );
}

function NavItem({ label }) {
  return (
    <motion.div
      whileHover={{ x: 6 }}
      className="px-3 py-2 rounded-md hover:bg-slate-100 cursor-pointer"
    >
      {label}
    </motion.div>
  );
}
EOL

# --- src/components/JobEditor.jsx ---
cat > src/components/JobEditor.jsx <<'EOL'
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function JobEditor({ onAnalyze, analyzing, parsed }) {
  const [text, setText] = useState("");

  const handleAnalyze = () => {
    onAnalyze(text);
  };

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white rounded-2xl shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Job description</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="w-full border rounded-md p-3 focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste or type the job description here..."
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-slate-500">{text.trim().split(/\s+/).filter(Boolean).length} words</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAnalyze}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Analyze
                </button>
                <button
                  onClick={() => { setText(""); }}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* parsed result card */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: parsed ? 1 : 0.9, y: parsed ? 0 : 6 }}
        className="p-4"
      >
        {analyzing && (
          <div className="p-4 bg-white rounded-md shadow flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">⏳</div>
            <div>
              <div className="font-medium">Analyzing...</div>
              <div className="text-sm text-slate-500">This usually takes a second.</div>
            </div>
          </div>
        )}

        {parsed && (
          <div className="p-4 bg-white rounded-xl shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">{parsed.title}</div>
                <div className="text-sm text-slate-500 mt-1">{parsed.summary}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {parsed.skills?.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{parsed.scoreHint}%</div>
                <div className="text-xs text-slate-500">JD completeness</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
EOL

# --- src/components/UploadDropzone.jsx ---
cat > src/components/UploadDropzone.jsx <<'EOL'
import React, { useRef, useState } from "react";

export default function UploadDropzone({ onUpload }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState([]);

  const handleFiles = (files) => {
    // Accept either file objects or array of names
    const arr = Array.from(files).map(f => (f.name ? f.name : String(f)));
    setPreview(arr);
    if (onUpload) onUpload(arr);
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="p-6 bg-white rounded-2xl shadow border-dashed border-2 border-transparent hover:border-slate-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Upload resumes (drag & drop or paste names)</div>
          <div className="text-sm text-slate-500">Supports multiple files. For demo, you can paste names below and hit Upload.</div>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <button onClick={() => inputRef.current.click()} className="px-3 py-2 bg-indigo-600 text-white rounded-md">
            Select files
          </button>
        </div>
      </div>

      {preview.length > 0 && (
        <ul className="mt-4 list-disc pl-5 space-y-1">
          {preview.map((p, i) => <li key={i} className="text-sm">{p}</li>)}
        </ul>
      )}
    </div>
  );
}
EOL

# --- src/components/RankingTable.jsx ---
cat > src/components/RankingTable.jsx <<'EOL'
import React from "react";

export default function RankingTable({ candidates, onSort }) {
  const sorted = candidates.slice().sort((a,b) => (b.score ?? 0) - (a.score ?? 0));
  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Candidate ranking</h3>
        <button onClick={onSort} className="text-sm px-3 py-1 border rounded">Sort</button>
      </div>

      <div className="space-y-3">
        {sorted.map((c, idx) => (
          <div key={c.id ?? idx} className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-slate-500">{c.experience}</div>
            </div>
            <div className="w-56">
              <div className="text-sm text-slate-500 mb-1">{c.score ?? 0}% match</div>
              <div className="h-2 bg-slate-100 rounded overflow-hidden">
                <div style={{width: (c.score ?? 0) + '%'}} className="h-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOL

# --- src/components/QuestionsPanel.jsx ---
cat > src/components/QuestionsPanel.jsx <<'EOL'
import React from "react";

export default function QuestionsPanel({ questions, onGenerate }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Interview questions</h3>
        <button onClick={onGenerate} className="px-3 py-1 bg-indigo-600 text-white rounded">Generate</button>
      </div>

      {questions.length === 0 && (
        <div className="text-sm text-slate-500">No questions yet — generate to see suggestions.</div>
      )}

      <div className="space-y-3 mt-3">
        {questions.map((q, i) => (
          <div key={i} className="p-3 border rounded-md bg-slate-50">
            <div className="font-medium">Q{i+1}</div>
            <div className="text-sm mt-1">{q}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOL

# --- src/components/ExportPanel.jsx ---
cat > src/components/ExportPanel.jsx <<'EOL'
import React from "react";

export default function ExportPanel({ candidates, questions }) {
  const handleDownload = () => {
    const payload = { candidates, questions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'talentmatch-results.json';
    a.click();
  };

  const handleCopy = async () => {
    const payload = { candidates, questions };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert('Summary copied to clipboard');
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow space-y-3">
      <h3 className="text-lg font-semibold">Export</h3>
      <div className="text-sm text-slate-500">Download or copy a summary of results.</div>
      <div className="flex items-center gap-3">
        <button onClick={handleDownload} className="px-4 py-2 bg-green-600 text-white rounded">Download JSON</button>
        <button onClick={handleCopy} className="px-4 py-2 border rounded">Copy summary</button>
      </div>
    </div>
  );
}



