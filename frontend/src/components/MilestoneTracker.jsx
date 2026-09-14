import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Flag } from 'lucide-react';

export default function MilestoneTracker() {
  const milestones = [
    { id: 'M1', name: 'M1: Technical Setup & Database Schema', status: 'completed' },
    { id: 'M2', name: 'M2: Student Academic History & Search Views', status: 'completed' },
    { id: 'M3', name: 'M3: Study Plan Builder & Validation Engine', status: 'active' },
    { id: 'M4', name: 'M4: Workflow Governance & Student Agreement', status: 'pending' },
    { id: 'M5', name: 'M5: Data Import & Version Audit Trail', status: 'pending' },
    { id: 'M6', name: 'M6: Final Acceptance Testing & Handover', status: 'pending' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-md text-slate-800">
      <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-200 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-blue-700" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
            SPR Application Development Progress — PT3 Solutions (PT03 Handover Spec)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            Current Phase: Milestone 3 (In Progress)
          </span>
          <span className="text-xs font-mono font-bold text-slate-600">
            45% Total Scope Completed
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden border border-slate-200">
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: '45%' }}></div>
      </div>

      {/* Milestones Horizontal Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-[11px]">
        {milestones.map((m) => (
          <div
            key={m.id}
            className={`p-2.5 rounded-xl border text-center flex flex-col justify-center items-center gap-1 transition-all ${
              m.status === 'completed'
                ? 'bg-blue-50/70 border-blue-200 text-blue-950 font-bold'
                : m.status === 'active'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30 font-black text-amber-950 shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
            }`}
          >
            {m.status === 'completed' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            ) : m.status === 'active' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="leading-tight text-[10px]">{m.name}</span>
          </div>
        ))}
      </div>

      {/* Active Features Checklist */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
        <span className="font-bold text-slate-500 uppercase tracking-wider mr-1">Implemented Features:</span>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold">✓ FR-01 (Student Search)</span>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold">✓ FR-02 (Academic History)</span>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold">✓ FR-03 (Plan Builder)</span>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold">✓ BR-01 (Offering Check)</span>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold">✓ BR-02 (Prerequisite Engine)</span>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-mono font-bold">⏳ M4-M6 (Upcoming Phases)</span>
      </div>
    </div>
  );
}
