import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle2, AlertTriangle, RotateCcw, Clock, Lock } from 'lucide-react';

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

  let cardBg = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs';

  const isLoadWarning = warning && (warning.includes('EXCEEDS') || warning.includes('exceeds') || warning.includes('CP limit'));
  const effectiveWarning = (isCompleted || isLoadWarning) ? null : warning;

  let cardBorder = 'border-slate-200 dark:border-slate-800';

  if (isCompleted) {
    cardBorder = 'border-emerald-300 dark:border-emerald-800/80';
  } else if (isEnrolled) {
    cardBorder = 'border-sky-300 dark:border-sky-800/80';
  } else if (isAttempted) {
    cardBorder = 'border-rose-300 dark:border-rose-800/80';
  } else if (effectiveWarning) {
    cardBorder = 'border-2 border-rose-400 dark:border-rose-700';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white dark:bg-slate-900 border rounded-2xl p-4 text-xs shadow-2xs hover:shadow-md transition-all group select-none space-y-3 ${cardBorder}`}
    >
      {/* Top Header Row: Drag Handle, Code, Status Pill & CP */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
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
              className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-base font-bold transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
              title="Remove unit from period"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Middle Row: Full Unit Title (Matching CourseCatalogPreview) */}
      <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading mt-1 leading-snug break-words">
        {unit.title}
      </h3>

      {/* Bottom Warning Message Box */}
      {effectiveWarning && (
        <div className="text-[11px] leading-relaxed bg-rose-100 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100 p-3 rounded-xl space-y-1 font-medium shadow-sm">
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] uppercase tracking-wider">
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

