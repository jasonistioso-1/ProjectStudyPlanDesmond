import React, { useState } from 'react';
import { History, CheckCircle2, Clock, XCircle, AlertTriangle, GraduationCap, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function AcademicHistory({ history, student }) {
  const [expandedSections, setExpandedSections] = useState({
    completed: false,
    current: false,
    attempted: false
  });

  const toggleSection = (sec) => {
    setExpandedSections(prev => ({
      ...prev,
      [sec]: !prev[sec]
    }));
  };

  if (student && (student.account_category === 'admin' || student.student_id === 0)) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-xs text-center max-w-xl mx-auto space-y-3 my-6 font-sans">
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center mx-auto">
          <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md">
            Academic Chair Profile
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-heading pt-1">
            Staff Account — No Student History
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
            Academic history records are reserved exclusively for enrolled student profiles.
          </p>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-xs text-center max-w-xl mx-auto space-y-3 my-6 font-sans">
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center mx-auto">
          <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md">
            First Trimester Enrolment
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-heading pt-1">
            No Prior Academic History Recorded
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
            This student is commencing their degree with <strong>0 CP completed</strong>. There are no prior passed or failed unit records.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
          Ready to construct a 72 CP trimester degree plan starting from <strong>Year 1 Trimester 1</strong>.
        </div>
      </div>
    );
  }

  const completed = history.filter(h => h && h.status === 'completed');
  const current = history.filter(h => h && (h.status === 'enrolled' || h.status === 'current'));
  const attempted = history.filter(h => h && h.status === 'attempted');

  const visibleCompleted = expandedSections.completed ? completed : completed.slice(0, 4);
  const hiddenCompletedCount = completed.length - 4;

  const visibleCurrent = expandedSections.current ? current : current.slice(0, 4);
  const hiddenCurrentCount = current.length - 4;

  const visibleAttempted = expandedSections.attempted ? attempted : attempted.slice(0, 4);
  const hiddenAttemptedCount = attempted.length - 4;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors font-sans max-w-[1440px] mx-auto space-y-4">
      <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Student Academic History Breakdown
          </h2>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
            Official Student Record
          </span>
          <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-[10px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
            Sample Demo Data
          </span>
        </div>
        <div className="flex gap-2 text-xs font-semibold tabular-nums">
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
            Passed: {completed.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 shadow-2xs">
            Enrolled: {current.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 shadow-2xs">
            Failed: {attempted.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completed Units */}
        <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl p-3.5 shadow-2xs self-start">
          <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-tight mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Passed / Completed Units
          </h3>
          <div className="space-y-2">
            {completed.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">None completed</p>
            ) : (
              <>
                {visibleCompleted.map(item => (
                  <div key={item.history_id} className="bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 rounded-lg shadow-2xs text-xs flex justify-between items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 dark:text-white tracking-tight">{item.unit_code}</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-tight mt-0.5">{item.unit_title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">{item.grade || 'P'}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium tabular-nums">{item.year_taken} {item.period_code}</span>
                    </div>
                  </div>
                ))}
                {completed.length > 4 && (
                  <button
                    type="button"
                    onClick={() => toggleSection('completed')}
                    className="w-full py-1.5 px-3 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white bg-emerald-100/70 hover:bg-emerald-200/80 dark:bg-emerald-950 dark:hover:bg-emerald-900 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 border border-emerald-200 dark:border-emerald-800"
                  >
                    {expandedSections.completed ? (
                      <>
                        <span>Show Less</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>View More ({hiddenCompletedCount} more passed {hiddenCompletedCount === 1 ? 'unit' : 'units'})</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Current Enrolled Units */}
        <div className="bg-sky-50/40 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/40 rounded-xl p-3.5 shadow-2xs self-start">
          <h3 className="text-xs font-bold text-sky-800 dark:text-sky-300 tracking-tight mb-2.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Currently Enrolled
          </h3>
          <div className="space-y-2">
            {current.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">None currently enrolled</p>
            ) : (
              <>
                {visibleCurrent.map(item => (
                  <div key={item.history_id} className="bg-white dark:bg-slate-800 border border-sky-200/80 dark:border-sky-800/60 p-2.5 rounded-lg shadow-2xs text-xs flex justify-between items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 dark:text-white tracking-tight">{item.unit_code}</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-tight mt-0.5">{item.unit_title}</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800 tabular-nums shrink-0">
                      {item.period_code} {item.year_taken}
                    </span>
                  </div>
                ))}
                {current.length > 4 && (
                  <button
                    type="button"
                    onClick={() => toggleSection('current')}
                    className="w-full py-1.5 px-3 text-[11px] font-bold text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white bg-sky-100/70 hover:bg-sky-200/80 dark:bg-sky-950 dark:hover:bg-sky-900 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 border border-sky-200 dark:border-sky-800"
                  >
                    {expandedSections.current ? (
                      <>
                        <span>Show Less</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>View More ({hiddenCurrentCount} more enrolled {hiddenCurrentCount === 1 ? 'unit' : 'units'})</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Attempted / Failed Units */}
        <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-xl p-3.5 shadow-2xs self-start">
          <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300 tracking-tight mb-2.5 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Unsuccessful / Failed Units
          </h3>
          <div className="space-y-2">
            {attempted.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No failed units recorded</p>
            ) : (
              <>
                {visibleAttempted.map(item => (
                  <div key={item.history_id} className="bg-white dark:bg-slate-800 border border-rose-200/80 dark:border-rose-800/60 p-2.5 rounded-lg shadow-2xs text-xs flex justify-between items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900 dark:text-white tracking-tight">{item.unit_code}</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-tight mt-0.5">{item.unit_title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-rose-700 dark:text-rose-400 font-bold text-xs block tabular-nums">{item.grade || 'F'} ({item.mark || 0}%)</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium tabular-nums">{item.year_taken} {item.period_code}</span>
                    </div>
                  </div>
                ))}
                {attempted.length > 4 && (
                  <button
                    type="button"
                    onClick={() => toggleSection('attempted')}
                    className="w-full py-1.5 px-3 text-[11px] font-bold text-rose-800 dark:text-rose-300 hover:text-rose-950 dark:hover:text-white bg-rose-100/70 hover:bg-rose-200/80 dark:bg-rose-950 dark:hover:bg-rose-900 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 border border-rose-200 dark:border-rose-800"
                  >
                    {expandedSections.attempted ? (
                      <>
                        <span>Show Less</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>View More ({hiddenAttemptedCount} more failed {hiddenAttemptedCount === 1 ? 'unit' : 'units'})</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
