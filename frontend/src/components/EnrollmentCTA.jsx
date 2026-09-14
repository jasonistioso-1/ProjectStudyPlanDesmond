import React from 'react';
import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

export default function EnrollmentCTA({ onStartBuilder }) {
  return (
    <section className="py-8">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Background Decorative Accents */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 top-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-bold font-mono px-3.5 py-1 bg-amber-400 text-slate-900 rounded-full inline-flex items-center gap-1.5 mb-3 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" /> PT3 Solutions Official Academic Tool
          </span>

          <h2 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-white leading-tight">
            Ready to Build or Revise Your Study Plan?
          </h2>

          <p className="text-xs md:text-sm text-slate-300 mt-2 font-medium leading-relaxed max-w-2xl">
            Select a student profile below, drag and drop units between semesters, run real-time prerequisite validation checks, and generate your official Certificate of Entitlement.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button
              onClick={onStartBuilder}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-xs rounded-full shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" /> Launch Study Plan Builder <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
