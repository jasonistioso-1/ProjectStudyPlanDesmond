import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle2, AlertTriangle, RotateCcw, Clock } from 'lucide-react';

export default function DraggableUnitCard({ unit, onRemoveUnit, warning, isCompleted: isCompletedProp, historyRecord, isReadOnly = false }) {
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
  const effectiveWarning = (isCompleted || isLoadWarning) ? null : warning;

  let cardBorder = 'border-slate-200 dark:border-slate-800';

  if (isCompleted) {
    cardBorder = 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20';
  } else if (isEnrolled) {
    cardBorder = 'border-sky-300 dark:border-sky-800/80 bg-sky-50/20 dark:bg-sky-950/20';
  } else if (isAttempted) {
    cardBorder = 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/20';
  } else if (effectiveWarning) {
    cardBorder = 'border-2 border-rose-500 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/30 shadow-md ring-2 ring-rose-500/20';
  }

  // Determine unit status badge (e.g. Core, Major Core, Capstone, Elective)
  const statusLabel = unit.status || unit.category || (
    ['ICT100', 'ICT159', 'ICT167', 'ICT169', 'ICT170', 'ICT145'].includes(unit.code) ? 'Core' :
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

          <span className="bg-red-700 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-2xs font-mono shrink-0">
            {unit.code}
          </span>

          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono shrink-0">
            Lvl {unitLevel}
          </span>

          {statusLabel && !statusLabel.includes('Elective') && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border font-heading shrink-0 ${
              statusLabel.includes('Capstone') ? 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800' :
              statusLabel.includes('Major') ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800' :
              statusLabel.includes('Math') ? 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-800' :
              'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800'
            }`}>
              {statusLabel}
            </span>
          )}

          {isCompleted && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-sans shrink-0" title="Passed in academic record - sealed & locked">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Grade: <strong className="font-mono text-emerald-900 dark:text-emerald-200 font-extrabold">{historyRecord?.grade || unit.grade || 'P'}</strong></span>
            </span>
          )}

          {isEnrolled && (
            <span className="bg-sky-50 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-bold text-[11px] px-2.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 flex items-center gap-1 font-sans shrink-0">
              <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" /> Enrolled
            </span>
          )}

          {isAttempted && (
            <span className="bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold text-[11px] px-2.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-800 flex items-center gap-1 font-sans shrink-0">
              <RotateCcw className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Failed ({historyRecord?.grade || 'F'})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
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

      {/* Rule Violation Warning Notice Box */}
      {effectiveWarning && (
        <div className="text-[11px] leading-relaxed bg-rose-100 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100 p-2.5 rounded-xl space-y-1 font-medium shadow-sm">
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] uppercase tracking-wider font-heading">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Rule Violation Detected</span>
          </div>
          <div className="font-semibold text-rose-950 dark:text-rose-100 text-xs leading-snug">
            {effectiveWarning}
          </div>
        </div>
      )}
    </div>
  );
}

