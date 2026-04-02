// src/components/ExportResults.jsx
import React from 'react';

export default function ExportResults({ candidates, questions }) {
  return (
    <div className="p-6 border rounded-lg bg-white shadow-md space-y-2">
      <h2 className="text-xl font-semibold">Export Results</h2>
      <p><strong>Candidates:</strong> {candidates.join(', ')}</p>
      <p><strong>Questions:</strong> {questions.join('; ')}</p>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        Export (placeholder)
      </button>
    </div>
  );
}
