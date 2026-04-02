import React from "react";

export default function PricingCard({ tier, price, features, highlight }) {
  return (
    <div className={`p-8 rounded-2xl border ${highlight ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white text-slate-900'}`}>
      <h4 className="text-2xl font-semibold mb-2">{tier}</h4>
      <div className="text-4xl font-bold mb-6">{price}</div>
      <ul className="space-y-2 mb-8 text-sm">
        {features.map((f, i) => (
          <li key={i} className="flex items-center justify-center gap-2">
            <span>{highlight ? '✅' : '✔️'}</span> {f}
          </li>
        ))}
      </ul>
      <button className={`px-6 py-3 rounded-xl font-medium ${highlight ? 'bg-white text-indigo-700 hover:bg-slate-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
        Get started
      </button>
    </div>
  );
}
