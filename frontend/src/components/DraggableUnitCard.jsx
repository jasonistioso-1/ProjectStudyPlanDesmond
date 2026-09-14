import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, AlertCircle, CheckCircle } from 'lucide-react';

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
    opacity: isDragging ? 0.4 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-2.5 rounded-lg border text-xs shadow-2xs transition-all group select-none ${
        warning
          ? 'bg-amber-50/70 border-amber-300/80 hover:border-amber-400'
          : isCompleted
          ? 'bg-emerald-50/60 border-emerald-200'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Drag Handle + Unit Details */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 shrink-0 transition-colors"
            title="Drag to reposition unit"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          
          <div className="truncate flex items-baseline gap-2">
            <span className="font-mono font-semibold text-slate-900 text-xs tracking-tight shrink-0">
              {unit.code}
            </span>
            <span className="text-slate-600 text-xs font-normal truncate">
              {unit.title}
            </span>
            {isCompleted && (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 inline ml-1" title="Passed in History" />
            )}
          </div>
        </div>

        {/* Right: Right-aligned Tabular CP & Minimalist × remove button */}
        <div className="flex items-center gap-2 shrink-0 font-mono">
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            {unit.credit_points || 3} CP
          </span>

          {onRemoveUnit && (
            <button
              onClick={() => onRemoveUnit(unit.unit_id || unit.code)}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded px-1 py-0.5 text-xs font-sans font-light leading-none transition-colors"
              title="Remove unit"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Warning Notice */}
      {warning && (
        <div className="mt-2 p-1.5 bg-amber-100/80 border border-amber-300 rounded text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">{warning}</span>
        </div>
      )}
    </div>
  );
}
