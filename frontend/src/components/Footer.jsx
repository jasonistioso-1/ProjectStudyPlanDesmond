import React from 'react';
import { GraduationCap, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200 text-slate-600 text-xs font-sans py-8 border-t-2 border-t-red-600 no-print">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Brand Identity & Copyright */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-700 text-white font-bold flex items-center justify-center shadow-2xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">PT3 Solutions</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-600">Study Plan Repository (SPR)</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
              © 2026 PT3 Solutions. Handover Specification for ICT302 Academic Decision Support System.
            </p>
          </div>
        </div>

        {/* Middle: Governance & System Compliance Status */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>BR-01 & BR-02 Compliant</span>
          </div>
          <span className="text-slate-300">|</span>
          <span>Version: <strong>v1.1 Stable</strong></span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Role-Based Access</span>
          </span>
        </div>

        {/* Right: Murdoch University Partnership Notice */}
        <div className="text-right text-[11px] text-slate-400">
          <span>Official Academic Advisor Tool</span>
          <span className="block text-slate-600 font-semibold mt-0.5">Murdoch University Perth Main Campus</span>
        </div>

      </div>
    </footer>
  );
}
