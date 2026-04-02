// ===== FILE: ./src/components/QuestionsPanel.jsx =====

import React from "react";

export default function QuestionsPanel({ questions = [], onGenerate = () => {}, generating = false }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Interview questions</h3>
        <button 
          onClick={onGenerate} 
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:bg-gray-400"
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate"}
        </button>
      </div>

      {generating ? (
        <div className="text-sm text-slate-500">Generating questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-sm text-slate-500">No questions yet — generate to see suggestions.</div>
      ) : (
        <div className="space-y-3 mt-3">
          {questions.map((q, i) => (
            <div key={i} className="p-3 border rounded-md bg-slate-50">
              <div className="font-medium">Q{i+1}</div>
              <div className="text-sm mt-1">{q}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}