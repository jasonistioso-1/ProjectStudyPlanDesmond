import React from 'react';
import { AlertTriangle, CheckCircle, Info, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function ValidationPanel({ validationResult }) {
  if (!validationResult) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400" /> Real-time Validation Engine
        </h3>
        <p className="text-xs text-slate-500 mt-1">Make changes to the study plan to run automatic validation checks.</p>
      </div>
    );
  }

  const { isValid, warnings, info } = validationResult;
  const errorWarnings = (warnings || []).filter(w => w.severity === 'error');
  const nonErrorWarnings = (warnings || []).filter(w => w.severity !== 'error');

  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-all ${
      isValid
        ? 'bg-white border-emerald-300'
        : 'bg-white border-rose-400'
    }`}>
      {/* Header Status Badge */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          {isValid ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Validation Status: <span className="text-emerald-700 font-extrabold">PASSED</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-bounce" /> Validation Status: <span className="text-rose-600 font-extrabold">VIOLATIONS DETECTED</span>
            </>
          )}
        </h3>

        <div className="flex gap-2 text-[11px] font-mono font-bold">
          <span className={`px-2.5 py-0.5 rounded border ${
            errorWarnings.length > 0
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}>
            Errors: {errorWarnings.length}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
            Warnings: {nonErrorWarnings.length}
          </span>
        </div>
      </div>

      {/* Errors & Warnings List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
        {isValid && (warnings || []).length === 0 && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-900 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All PT3 Solutions prerequisite, unit offering, and 12 CP credit load rules satisfied!</span>
          </div>
        )}

        {/* Error Items */}
        {errorWarnings.map((w, index) => (
          <div key={index} className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-2 text-rose-900 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold font-mono text-rose-700 mr-1.5">[{w.type}]</span>
              <span>{w.message}</span>
            </div>
          </div>
        ))}

        {/* Non-Error Warnings */}
        {nonErrorWarnings.map((w, index) => (
          <div key={index} className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2 text-amber-900 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold font-mono text-amber-700 mr-1.5">[{w.type}]</span>
              <span>{w.message}</span>
            </div>
          </div>
        ))}

        {/* Info Items */}
        {(info || []).map((i, index) => (
          <div key={index} className="p-2 bg-slate-50 border border-slate-200 rounded flex items-center gap-2 text-slate-700 text-[11px] font-medium">
            <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{i.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
