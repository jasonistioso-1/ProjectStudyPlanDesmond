import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-sans py-8 border-t-2 border-t-red-600 no-print transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Brand Identity & Copyright */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-700 text-white font-bold flex items-center justify-center shadow-2xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">PT3 Solutions</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Study Plan Repository (SPR)</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
              © 2026 PT3 Solutions Singapore. Academic Decision Support System.
            </p>
          </div>
        </div>

        {/* Right: Singapore Campus Partnership Notice */}
        <div className="text-right text-[11px] text-slate-400 dark:text-slate-500">
          <span>Official Academic Advisor Tool</span>
          <span className="block text-slate-600 dark:text-slate-300 font-semibold mt-0.5">PT3 Solutions Singapore Campus</span>
        </div>

      </div>
    </footer>
  );
}
