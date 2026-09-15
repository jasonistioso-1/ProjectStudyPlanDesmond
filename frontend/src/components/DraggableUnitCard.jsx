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
    <span className="bg-slate-100 text-slate-700 border border-slate-200/80 font-semibold text-[10px] rounded-full px-2.5 py-0.5">
      CORE
    </span>
  );

  if (unitLevel >= 300) {
    categoryBadge = (
      <span className="bg-purple-50 text-purple-700 border border-purple-200/80 font-semibold text-[10px] rounded-full px-2.5 py-0.5">
        ADVANCED
      </span>
    );
  } else if (unitLevel >= 200) {
    categoryBadge = (
      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold text-[10px] rounded-full px-2.5 py-0.5">
        MAJOR
      </span>
    );
  }

  let cardBg = 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs';

  if (isCompleted) {
    cardBg = 'bg-emerald-50/40 border-emerald-200/90 hover:border-emerald-300';
  } else if (warning) {
    cardBg = 'bg-amber-50/50 border-amber-200/90 hover:border-amber-300';
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
            className="p-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200 text-slate-400 group-hover:text-slate-700 cursor-grab active:cursor-grabbing shrink-0 transition-all border border-slate-200/70 shadow-2xs"
            title="Drag to reposition unit"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <div className="truncate flex items-center gap-2 min-w-0">
            <span className="font-heading font-bold text-slate-900 text-xs tracking-tight shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
              {unit.code}
            </span>
            <span className="text-slate-900 text-xs font-semibold truncate">
              {unit.title}
            </span>
          </div>
        </div>

        {/* Right: Category Badge, Tabular CP & Remove button */}
        <div className="flex items-center gap-2 shrink-0">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> DONE
            </span>
          ) : warning ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> REQ
            </span>
          ) : (
            categoryBadge
          )}

          <span className="text-xs font-semibold text-slate-700 tabular-nums bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
            {unit.credit_points || 3} CP
          </span>

          {onRemoveUnit && (
            <button
              onClick={() => onRemoveUnit(unit.unit_id || unit.code)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 text-sm font-bold transition-all border border-transparent hover:border-red-200"
              title="Remove unit from semester"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
