import React from 'react';
import { Award, CheckCircle2, TrendingUp, BookOpen, Star } from 'lucide-react';

export default function ProgressTrackingDemo() {
  return (
    <section className="py-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-[#008652] mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#008652]" /> Student Academic Performance Overview
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Real-time Academic Audit & Credit Unit Status
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Live breakdown of degree completion requirements, completed credit points, and verified units.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-800">
                GPA: <strong className="text-[#008652] font-mono text-sm">3.85 / 4.0</strong>
              </span>
            </div>
          </div>
        </div>

        {/* SPIL Clean Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Degree Credits */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#008652]" /> Total Credit Points
              </span>
              <span className="text-xs font-mono font-extrabold text-[#008652] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                36 / 72 CP
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-2">Bachelor of IT Degree Requirements</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">36 CP Completed • 36 CP Remaining</p>
          </div>

          {/* Card 2: Completed Units Overview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#008652]" /> Passed Units Summary
              </span>
              <span className="text-xs font-mono font-extrabold text-[#008652] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                12 Units Passed
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono font-bold mt-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">ICT100 (HD)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">ICT159 (D)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">ICT164 (CR)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">ICT111 (P)</span>
            </div>
          </div>

          {/* Card 3: Certificate Entitlement Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Certificate Eligibility
              </span>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">PT3 Solutions Official Clearance</p>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold">
              Verified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

