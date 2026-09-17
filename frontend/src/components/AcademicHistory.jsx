import React from 'react';
import { History, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

export default function AcademicHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Academic History
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">No prior academic history recorded for this student.</p>
      </div>
    );
  }

  const completed = history.filter(h => h.status === 'completed');
  const current = history.filter(h => h.status === 'current');
  const attempted = history.filter(h => h.status === 'attempted');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Student Academic History Breakdown
        </h2>
        <div className="flex gap-2 text-xs font-mono font-bold">
          <span className="px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Passed: {completed.length}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Enrolled: {current.length}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            Failed: {attempted.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completed Units */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-3">
          <h3 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Passed / Completed Units
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {completed.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">None completed</p>
            ) : (
              completed.map(item => (
                <div key={item.history_id} className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/80 p-2.5 rounded shadow-sm text-xs flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white">{item.unit_code}</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[150px] font-medium">{item.unit_title}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{item.grade || 'P'}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">{item.year_taken} {item.period_code}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Current Enrolled Units */}
        <div className="bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3">
          <h3 className="text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Currently Enrolled
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {current.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">None currently enrolled</p>
            ) : (
              current.map(item => (
                <div key={item.history_id} className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/80 p-2.5 rounded shadow-sm text-xs flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white">{item.unit_code}</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[150px] font-medium">{item.unit_title}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono font-bold border border-amber-300 dark:border-amber-800">
                    {item.period_code} {item.year_taken}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attempted / Failed Units */}
        <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg p-3">
          <h3 className="text-xs font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Unsuccessful / Failed Units
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {attempted.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No failed units recorded</p>
            ) : (
              attempted.map(item => (
                <div key={item.history_id} className="bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800/80 p-2.5 rounded shadow-sm text-xs flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-slate-900 dark:text-white">{item.unit_code}</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[150px] font-medium">{item.unit_title}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-rose-700 dark:text-rose-400 font-extrabold">{item.grade || 'F'} ({item.mark || 0}%)</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">{item.year_taken} {item.period_code}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
