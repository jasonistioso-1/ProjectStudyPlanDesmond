import React from 'react';
import { CheckCircle2, ChevronRight, Info } from 'lucide-react';

export default function WorkflowStepper({ currentStatus, activeRole }) {
  const status = currentStatus || 'draft';
  const isChair = activeRole === 'chair';

  const steps = [
    { key: 'draft', label: '1. Draft Plan', role: 'Chair' },
    { key: 'recommended', label: '2. Recommended', role: 'Student Review' },
    { key: 'agreed', label: '3. Student Agreed', role: 'Signed' },
    { key: 'approved', label: '4. Final Approved', role: 'Complete' }
  ];

  const getStepIndex = (st) => {
    switch (st) {
      case 'draft': return 0;
      case 'recommended': return 1;
      case 'agreed': return 2;
      case 'approved': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  // Student banner message
  const getStudentBanner = () => {
    switch (status) {
      case 'draft':
        return 'Study plan is currently being drafted by your Academic Chair.';
      case 'recommended':
        return 'Recommended by Academic Chair — awaiting your digital agreement sign-off.';
      case 'agreed':
        return 'Agreed & signed — awaiting final approval from your Academic Chair.';
      case 'approved':
        return 'Officially approved & finalized by Academic Chair.';
      default:
        return 'Recommended by Academic Chair — awaiting your agreement.';
    }
  };

  return (
    <div className="mb-6 font-sans">
      {!isChair ? (
        /* Student View Banner */
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{getStudentBanner()}</span>
          </div>
          <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
            {status}
          </span>
        </div>
      ) : (
        /* Academic Chair Workflow Stepper Bar */
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
            <span>Status Workflow:</span>
          </div>
          <div className="flex items-center gap-2 text-xs flex-1">
            {steps.map((step, idx) => {
              const isPassed = idx < currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <React.Fragment key={step.key}>
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
                      isCurrent
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                        : 'bg-slate-50 text-slate-400 border-slate-200 font-normal'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <span className={`w-4 h-4 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                        isCurrent ? 'bg-red-600 text-white font-bold' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                    )}
                    <span>{step.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
