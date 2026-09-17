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
    cardBg = 'bg-emerald-50/40 dark:bg-emerald-950/40 border-emerald-200/90 dark:border-emerald-800 hover:border-emerald-300';
  } else if (warning) {
    cardBg = 'bg-amber-50/50 dark:bg-amber-950/40 border-amber-200/90 dark:border-amber-800 hover:border-amber-300';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-3.5 rounded-2xl border text-xs shadow-2xs transition-all group select-none ${cardBg}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Drag Handle + Unit Details */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 cursor-grab active:cursor-grabbing shrink-0 transition-all border border-slate-200/70 dark:border-slate-600 shadow-2xs"
            title="Drag to reposition unit"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <div className="truncate flex items-center gap-2 min-w-0">
            <span className="font-heading font-bold text-slate-900 dark:text-white text-xs tracking-tight shrink-0 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-600 shadow-2xs">
              {unit.code}
            </span>
            <span className="text-slate-900 dark:text-slate-100 text-xs font-semibold truncate">
              {unit.title}
            </span>
          </div>
        </div>

        {/* Right: Category Badge, Tabular CP & Remove button */}
        <div className="flex items-center gap-2 shrink-0">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> DONE
            </span>
          ) : warning ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 shrink-0 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> VIOLATION
            </span>
          ) : (
            categoryBadge
          )}

          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums bg-slate-50 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-600">
            {unit.credit_points || 3} CP
          </span>

          {onRemoveUnit && (
            <button
              onClick={() => onRemoveUnit(unit.unit_id || unit.code)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 text-sm font-bold transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
              title="Remove unit from semester"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Warning Message Alert Banner */}
      {warning && (
        <div className="mt-2.5 text-[11px] bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 p-2.5 rounded-xl flex items-start gap-2 font-medium shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
}
