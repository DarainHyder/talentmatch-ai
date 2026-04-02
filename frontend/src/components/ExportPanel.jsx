import React from "react";

export default function ExportPanel({ candidates = [], questions = [] }) {
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
