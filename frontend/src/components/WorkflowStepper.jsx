import React from 'react';
import { CheckCircle2, ChevronRight, Info, Layers, Check, ShieldCheck, Database } from 'lucide-react';

export default function WorkflowStepper({ currentStatus, activeRole, activeStep, onStepClick }) {
  const status = currentStatus || 'draft';
  const isChair = activeRole === 'chair';

  const steps = [
    { id: 1, key: 'select', label: '1. Select Student', shortLabel: 'Select' },
    { id: 2, key: 'history', label: '2. History', shortLabel: 'History' },
    { id: 3, key: 'amend', label: '3. Create/Amend', shortLabel: 'Amend' },
    { id: 4, key: 'validate', label: '4. Validate', shortLabel: 'Validate' },
    { id: 5, key: 'recommend', label: '5. Recommend', shortLabel: 'Recommend' },
    { id: 6, key: 'agree', label: '6. Student Agree', shortLabel: 'Agree' },
    { id: 7, key: 'approve', label: '7. Chair Approve', shortLabel: 'Approve' },
    { id: 8, key: 'store', label: '8. Stored Plan', shortLabel: 'Store' }
  ];

  const getActiveStepIndex = () => {
    switch (status) {
      case 'draft':
        return activeStep || 3;
      case 'recommended':
        return 5;
      case 'agreed':
        return 6;
      case 'approved':
        return 7;
      case 'stored':
        return 8;
      default:
        return 3;
    }
  };

  const currentIndex = getActiveStepIndex();

  const getStatusText = () => {
    switch (status) {
      case 'draft': return 'Drafting Plan in Progress';
      case 'recommended': return 'Recommended by Chair — Awaiting Student Agreement';
      case 'agreed': return 'Digitally Signed by Student — Ready for Final Approval';
      case 'approved': return 'Officially Approved & Finalised by Academic Chair';
      case 'stored': return 'Saved & Archived in Stored Plans Repository';
      default: return 'Drafting Plan';
    }
  };

  return (
    <div className="mb-5 font-sans">
      {!isChair ? (
        /* Student View Banner */
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{getStatusText()}</span>
          </div>
          <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
            {status}
          </span>
        </div>
      ) : (
        /* Academic Chair 8-Step Stepper Bar */
        <div className="bg-white border-t-2 border-t-red-600 border border-slate-200 rounded-xl p-3 md:px-4 shadow-2xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
              <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-mono">
                ICT302 WORKFLOW
              </span>
              <span>8-Step Study Plan Specification Progress</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-600">
              <span>Status:</span>
              <span className="bg-slate-100 text-slate-900 border border-slate-200 px-2 py-0.5 rounded uppercase font-bold text-[10px]">
                {status}
              </span>
            </div>
          </div>

          {/* Stepper Horizontal Buttons */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
            {steps.map((step, idx) => {
              const stepNum = idx + 1;
              const isPassed = stepNum < currentIndex;
              const isCurrent = stepNum === currentIndex;

              return (
                <React.Fragment key={step.key}>
                  <button
                    onClick={() => onStepClick && onStepClick(stepNum)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 shrink-0 border ${
                      isCurrent
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={step.label}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <span className={`w-4 h-4 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                        isCurrent ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {stepNum}
                      </span>
                    )}
                    <span className="hidden md:inline">{step.label}</span>
                    <span className="inline md:hidden">{step.shortLabel}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
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
