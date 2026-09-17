import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function DraggableUnitCard({ unit, onRemoveUnit, warning, isCompleted }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: String(unit.unit_id || unit.code) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1
  };

  const unitLevel = Number(unit.level || (unit.code ? unit.code.replace(/[^0-9]/g, '').charAt(0) + '00' : 100));

  let categoryBadge = (
    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 font-semibold text-[10px] rounded-full px-2.5 py-0.5">
      CORE
    </span>
  );

  if (unitLevel >= 300) {
    categoryBadge = (
      <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 font-semibold text-[10px] rounded-full px-2.5 py-0.5">
        ADVANCED
      </span>
    );
  } else if (unitLevel >= 200) {
    categoryBadge = (
      <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 font-semibold text-[10px] rounded-full px-2.5 py-0.5">
        MAJOR
      </span>
    );
  }

  let cardBg = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs';

  if (isCompleted) {
    cardBg = 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800';
  } else if (warning) {
    cardBg = 'bg-rose-50/90 dark:bg-rose-950/80 border-2 border-rose-400 dark:border-rose-700 shadow-sm';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-3.5 rounded-2xl border text-xs shadow-2xs transition-all group select-none space-y-2.5 ${cardBg}`}
    >
      {/* Top Header Row: Drag Handle, Code, Badges & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 cursor-grab active:cursor-grabbing shrink-0 transition-all border border-slate-200/70 dark:border-slate-600 shadow-2xs"
            title="Drag to reposition unit"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          <span className="font-heading font-extrabold text-slate-900 dark:text-white text-xs tracking-tight bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-600 shadow-2xs shrink-0 font-mono">
            {unit.code}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> DONE
            </span>
          ) : (
            categoryBadge
          )}

          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tabular-nums bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-600">
            {unit.credit_points || 3} CP
          </span>

          {onRemoveUnit && (
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

      {/* Middle Row: Full Unit Title */}
      <div className="text-slate-900 dark:text-slate-100 text-xs font-bold leading-snug break-words">
        {unit.title}
      </div>

      {/* Bottom Warning Message Box */}
      {warning && (
        <div className="text-[11px] leading-relaxed bg-rose-100 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100 p-3 rounded-xl space-y-1 font-medium shadow-sm">
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Rule Violation Detected</span>
          </div>
          <div className="font-semibold text-rose-950 dark:text-rose-100 text-xs leading-snug">
            {warning}
          </div>
        </div>
      )}
    </div>
  );
}
