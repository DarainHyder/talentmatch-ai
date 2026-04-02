import React, { useState } from "react";
import { motion } from "framer-motion";

export default function JobEditor({ onAnalyze = () => {}, analyzing = false, parsed = null }) {
  const [text, setText] = useState("");

  const handleAnalyze = () => {
    if (text.trim()) onAnalyze(text);
  };

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white rounded-2xl shadow">
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
              onClick={() => setText("")}
              className="px-3 py-2 border rounded-md text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

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
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white rounded-xl shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">{parsed.title || "Untitled Role"}</div>
              <div className="text-sm text-slate-500 mt-1">{parsed.summary || ""}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {parsed.skills?.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded">{s}</span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{parsed.scoreHint ?? 0}%</div>
              <div className="text-xs text-slate-500">JD completeness</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
