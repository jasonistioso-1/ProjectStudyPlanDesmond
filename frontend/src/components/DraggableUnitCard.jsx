import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle2, AlertTriangle, RotateCcw, Clock, ShieldCheck } from 'lucide-react';

export default function DraggableUnitCard({ unit, onRemoveUnit, warning, isCompleted: isCompletedProp, historyRecord, isReadOnly = false, isWaived = false, isChair = false, onToggleWaiver }) {
  const isCompleted = isCompletedProp || (historyRecord && historyRecord.status === 'completed');
  const isEnrolled = historyRecord && (historyRecord.status === 'enrolled' || historyRecord.status === 'current');
  const isAttempted = historyRecord && historyRecord.status === 'attempted';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: String(unit.unit_id || unit.code), disabled: isReadOnly || isCompleted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1
  };

  const unitLevel = Number(unit.level || (unit.code ? unit.code.replace(/[^0-9]/g, '').charAt(0) + '00' : 100));

  const isLoadWarning = warning && (warning.includes('EXCEEDS') || warning.includes('exceeds') || warning.includes('CP limit'));
  const isOfferingIssue = warning && (
    warning.includes('NOT offered') || 
    warning.includes('offered ONLY') || 
    warning.includes('Offering') || 
    warning.includes('offering')
  );
  // Academic Chair waiver is ONLY for prerequisites; wrong teaching period offering errors can NEVER be waived
  const effectiveWarning = (isCompleted || isLoadWarning) ? null : (isWaived && !isOfferingIssue) ? null : warning;

  let cardBorder = 'border-slate-200 dark:border-slate-800';

  if (isCompleted) {
    cardBorder = 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20';
  } else if (isEnrolled) {
    cardBorder = 'border-sky-300 dark:border-sky-800/80 bg-sky-50/20 dark:bg-sky-950/20';
  } else if (isAttempted) {
    cardBorder = 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/20';
  } else if (isWaived) {
    cardBorder = 'border-2 border-purple-400 dark:border-purple-600 bg-purple-50/30 dark:bg-purple-950/20 shadow-md ring-2 ring-purple-500/20';
  } else if (effectiveWarning) {
    cardBorder = 'border-2 border-rose-500 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/30 shadow-md ring-2 ring-rose-500/20';
  }

  // Determine unit status badge (e.g. Core, Major Core, Capstone, Elective)
  const statusLabel = unit.status || unit.category || (
    ['ICT100', 'ICT159', 'ICT167', 'ICT169', 'ICT170', 'ICT145', 'ICT158'].includes(unit.code) ? 'Degree Core' :
    ['MAS183', 'MAS162', 'MAS164'].includes(unit.code) ? 'Core / Math' :
    ['ICT302'].includes(unit.code) ? 'Core Capstone' :
    ['MSP200', 'COM203'].includes(unit.code) ? 'General Elective' : 'Major Core'
  );

  // Determine prereq display text
  const prereqText = unit.prereqs || unit.prereq || (
    unit.code === 'ICT167' ? 'ICT159' :
    unit.code === 'ICT201' ? 'ICT158' :
    unit.code === 'ICT202' ? 'ICT159' :
    unit.code === 'ICT203' ? 'ICT167' :
    unit.code === 'ICT206' ? 'ICT167' :
    unit.code === 'ICT283' ? 'ICT167' :
    unit.code === 'ICT284' ? 'ICT158' :
    unit.code === 'ICT285' ? 'ICT159' :
    unit.code === 'ICT292' ? 'ICT158' :
    unit.code === 'BSC203' ? 'ICT158' :
    unit.code === 'ICT301' ? 'ICT292' :
    unit.code === 'ICT302' ? 'ICT201' :
    unit.code === 'ICT303' ? 'ICT202' :
    unit.code === 'ICT304' ? 'ICT203' :
    unit.code === 'ICT305' ? 'ICT202' :
    unit.code === 'ICT373' ? 'ICT283' :
    unit.code === 'ICT374' ? 'ICT283' :
    unit.code === 'ICT393' ? 'ICT284' :
    unit.code === 'ICT394' ? 'ICT285' : 'None'
  );

  const hasOffIssue = effectiveWarning && (
    effectiveWarning.includes('NOT offered') || 
    effectiveWarning.includes('offered ONLY') || 
    effectiveWarning.includes('Offering') || 
    effectiveWarning.includes('offering')
  );
  const hasPreIssue = effectiveWarning && (
    effectiveWarning.includes('FAILED') || 
    effectiveWarning.includes('Failed') || 
    effectiveWarning.includes('requires prerequisite') || 
    effectiveWarning.includes('prerequisite') || 
    effectiveWarning.includes('Prerequisite')
  );

  const warningBadgeLabel = effectiveWarning ? (
    (hasOffIssue && hasPreIssue)
      ? 'Offering & Prereq Issue'
      : hasOffIssue
      ? 'Offering Mismatch'
      : (effectiveWarning.includes('FAILED') || effectiveWarning.includes('Failed'))
      ? 'Prerequisite Failed'
      : hasPreIssue
      ? 'Prerequisite Unmet'
      : 'Rule Violation'
  ) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white dark:bg-slate-900 border rounded-2xl p-3.5 text-xs shadow-2xs hover:shadow-md transition-all group select-none space-y-2.5 ${cardBorder}`}
    >
      {/* Top Header Row: Drag Handle, Code, Status Pill & CP */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0">
          {!isReadOnly && !isCompleted && (
            <div
              {...attributes}
              {...listeners}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing shrink-0 transition-colors p-0.5"
              title="Drag to reposition unit"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          <span className="bg-red-700 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md shadow-2xs shrink-0">
            {unit.code}
          </span>

          <span className="bg-slate-800 text-white dark:bg-slate-700 dark:text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0 shadow-2xs">
            Lvl {unitLevel}
          </span>

          {isCompleted && (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-2 border-emerald-500 dark:border-emerald-600 flex items-center gap-1.5 font-sans shrink-0 shadow-2xs" title="Passed in academic record - sealed & locked">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Grade: <strong className="font-mono text-emerald-900 dark:text-emerald-100 font-black">{historyRecord?.grade || unit.grade || 'P'}</strong></span>
            </span>
          )}

          {isEnrolled && (
            <span className="bg-sky-50 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border-2 border-sky-500 dark:border-sky-600 flex items-center gap-1.5 font-sans shrink-0 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" /> Enrolled
            </span>
          )}

          {isAttempted && (
            <span className="bg-rose-50 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border-2 border-rose-500 dark:border-rose-600 flex items-center gap-1.5 font-sans shrink-0 shadow-2xs">
              <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" /> Failed ({historyRecord?.grade || 'F'})
            </span>
          )}

          {isWaived && (
            <span className="bg-purple-50 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md border-2 border-purple-500 dark:border-purple-600 flex items-center gap-1.5 font-sans shrink-0 shadow-2xs" title="Prerequisite waived by Academic Chair override">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Chair Waiver: Approved</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-md font-mono shrink-0">
            {unit.credit_points || 3} CP
          </span>

          {!isReadOnly && !isCompleted && onRemoveUnit && (
            <button
              onClick={() => onRemoveUnit(unit.unit_id || unit.code)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-base font-bold transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-800 cursor-pointer"
              title="Remove unit from period"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading mt-0.5 leading-snug break-words">
        {unit.title}
      </h3>

      {/* Meta Footer: Prerequisite */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="font-semibold">Prerequisite:</span>
        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
          prereqText === 'None'
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono'
        }`}>
          {prereqText}
        </span>
      </div>

      {/* Chair Waiver Override Approved Notice Box */}
      {isWaived && (
        <div className="text-[11px] leading-relaxed bg-purple-50 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-100 p-2.5 rounded-xl space-y-1.5 font-medium shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] uppercase tracking-wider font-heading">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Chair Waiver Approved</span>
            </div>
            {isChair && onToggleWaiver && (
              <button
                type="button"
                onClick={() => onToggleWaiver(unit.code)}
                className="text-[10px] bg-purple-200 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200 hover:bg-purple-300 dark:hover:bg-purple-800 font-bold px-2 py-0.5 rounded cursor-pointer transition-colors shadow-2xs"
                title="Revoke Chair Waiver"
              >
                Revoke Waiver
              </button>
            )}
          </div>
          <div className="font-semibold text-purple-950 dark:text-purple-100 text-xs leading-snug">
            Academic Chair has granted an official prerequisite waiver for this unit.
          </div>
        </div>
      )}

      {/* Compact Rule Violation Badge Indicator & Chair Waiver Action */}
      {effectiveWarning && (
        <div className="space-y-1.5">
          <div 
            className="flex items-center justify-between gap-1.5 text-[10px] px-2.5 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-2xs font-sans transition-all"
            title={effectiveWarning}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-extrabold uppercase tracking-wider font-heading truncate">
                {warningBadgeLabel}
              </span>
            </div>
            <span 
              className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-300 shrink-0 bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900"
              title={effectiveWarning}
            >
              See Validation
            </span>
          </div>
          {isChair && onToggleWaiver && hasPreIssue && !isWaived && (
            <button
              type="button"
              onClick={() => onToggleWaiver(unit.code)}
              className="w-full py-1.5 px-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[10px] font-bold tracking-tight transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 border border-purple-800"
              title={`Grant official Academic Chair prerequisite waiver for ${unit.code}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
              <span>Grant Chair Prereq Waiver</span>
            </button>
          )}
          {hasOffIssue && (
            <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 p-1.5 rounded-lg text-center font-sans">
              Wrong Teaching Period (Non-Waivable — Reschedule Period)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

