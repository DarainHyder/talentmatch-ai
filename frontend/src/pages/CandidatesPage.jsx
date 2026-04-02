// ===== FILE: ./src/pages/CandidatesPage.jsx =====
import React from "react";
import Sidebar from "../components/Sidebar";

export default function CandidatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
        <div className="md:col-span-3 hidden md:block">
          <Sidebar />
        </div>
        <div className="md:col-span-9">
          <h1 className="text-2xl font-bold mb-6">Candidates Management</h1>
          <div className="p-8 bg-white rounded-2xl shadow text-center">
            <p className="text-slate-600">Candidates management feature coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
}