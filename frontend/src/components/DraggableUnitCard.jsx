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
      className={`relative p-3 rounded-xl border text-xs shadow-2xs transition-all group select-none ${cardBg}`}
    >
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Drag Handle + Unit Details */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 shrink-0 transition-colors"
            title="Drag to reposition unit"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <div className="truncate flex items-center gap-2 min-w-0">
            <span className="font-heading font-bold text-slate-900 text-xs tracking-tight shrink-0 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
              {unit.code}
            </span>
            <span className="text-slate-800 text-xs font-medium truncate">
              {unit.title}
            </span>
          </div>
        </div>

        {/* Right: Category Badge, Tabular CP & Remove button */}
        <div className="flex items-center gap-2 shrink-0">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DONE
            </span>
          ) : warning ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> REQ
            </span>
          ) : (
            categoryBadge
          )}

          <span className="text-[11px] font-semibold text-slate-600 tabular-nums bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70">
            {unit.credit_points || 3} CP
          </span>

          {onRemoveUnit && (
            <button
              onClick={() => onRemoveUnit(unit.unit_id || unit.code)}
              className="text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md p-1 text-xs font-bold leading-none transition-colors ml-0.5"
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
