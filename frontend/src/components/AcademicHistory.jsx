import React from 'react';
import { History, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

export default function AcademicHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" /> Academic History
        </h2>
        <p className="text-xs text-slate-500">No prior academic history recorded for this student.</p>
      </div>
    );
  }

  const completed = history.filter(h => h.status === 'completed');
  const current = history.filter(h => h.status === 'current');
  const attempted = history.filter(h => h.status === 'attempted');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" /> Student Academic History Breakdown
        </h2>
        <div className="flex gap-2 text-xs font-mono font-bold">
          <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            Passed: {completed.length}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
            Enrolled: {current.length}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
            Failed: {attempted.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completed Units */}
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-3">
          <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Passed / Completed Units
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {completed.length === 0 ? (
              <p className="text-xs text-slate-400 italic">None completed</p>
            ) : (
              completed.map(item => (
                <div key={item.history_id} className="bg-white border border-emerald-200 p-2.5 rounded shadow-sm text-xs flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-900">{item.unit_code}</span>
                    <p className="text-[11px] text-slate-600 truncate max-w-[150px] font-medium">{item.unit_title}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-700 font-extrabold">{item.grade || 'P'}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">{item.year_taken} {item.period_code}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Current Enrolled Units */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3">
          <h3 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" /> Currently Enrolled
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {current.length === 0 ? (
              <p className="text-xs text-slate-400 italic">None currently enrolled</p>
            ) : (
              current.map(item => (
                <div key={item.history_id} className="bg-white border border-amber-200 p-2.5 rounded shadow-sm text-xs flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-900">{item.unit_code}</span>
                    <p className="text-[11px] text-slate-600 truncate max-w-[150px] font-medium">{item.unit_title}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold border border-amber-300">
                    {item.period_code} {item.year_taken}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attempted / Failed Units */}
        <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-3">
          <h3 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600" /> Unsuccessful / Failed Units
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {attempted.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No failed units recorded</p>
            ) : (
              attempted.map(item => (
                <div key={item.history_id} className="bg-white border border-rose-300 p-2.5 rounded shadow-sm text-xs flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-slate-900">{item.unit_code}</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <p className="text-[11px] text-slate-600 truncate max-w-[150px] font-medium">{item.unit_title}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-rose-700 font-extrabold">{item.grade || 'F'} ({item.mark || 0}%)</span>
                    <span className="text-[10px] text-slate-500 block font-mono">{item.year_taken} {item.period_code}</span>
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
