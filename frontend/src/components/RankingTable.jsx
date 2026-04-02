import React from "react";

export default function RankingTable({ candidates = [], onSort = () => {} }) {
  const sorted = candidates.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

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
              <div className="font-medium">{c.name || `Candidate ${idx+1}`}</div>
              <div className="text-xs text-slate-500">{c.experience || ""}</div>
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
