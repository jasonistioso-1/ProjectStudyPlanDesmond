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

  // Determine level color bar (Murdoch handbook style unit visualizer)
  const unitLevel = Number(unit.level || (unit.code ? unit.code.replace(/[^0-9]/g, '').charAt(0) + '00' : 100));
  
  let accentBorder = 'border-l-4 border-l-indigo-600'; // Default Level 100
  let levelBadgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  let levelLabel = '100 Level';

  if (unitLevel >= 300) {
    accentBorder = 'border-l-4 border-l-rose-700'; // Level 300 / Capstone
    levelBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
    levelLabel = '300 Level';
  } else if (unitLevel >= 200) {
    accentBorder = 'border-l-4 border-l-teal-600'; // Level 200
    levelBadgeClass = 'bg-teal-50 text-teal-700 border-teal-200';
    levelLabel = '200 Level';
  }

  if (isCompleted) {
    accentBorder = 'border-l-4 border-l-emerald-600';
  } else if (warning) {
    accentBorder = 'border-l-4 border-l-amber-500';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-2.5 rounded-lg border text-xs shadow-2xs transition-all group select-none ${accentBorder} ${
        warning
          ? 'bg-amber-50/80 border-amber-300 hover:border-amber-400'
          : isCompleted
          ? 'bg-emerald-50/70 border-emerald-300/90'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Drag Handle + Unit Details */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-0.5 shrink-0 transition-colors"
            title="Drag to reposition unit"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          
          <div className="truncate flex items-center gap-2 min-w-0">
            <span className="font-mono font-bold text-slate-900 text-xs tracking-tight shrink-0">
              {unit.code}
            </span>
            <span className="text-slate-700 text-xs font-medium truncate">
              {unit.title}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> Done
              </span>
            )}
          </div>
        </div>

        {/* Right: Right-aligned Tabular CP & Minimalist × remove button */}
        <div className="flex items-center gap-2 shrink-0 font-mono">
          <span className="text-[11px] text-slate-500 font-medium tabular-nums bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/50">
            {unit.credit_points || 3} CP
          </span>

          {onRemoveUnit && (
            <button
              onClick={() => onRemoveUnit(unit.unit_id || unit.code)}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded px-1.5 py-0.5 text-xs font-sans font-light leading-none transition-colors"
              title="Remove unit"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Warning Notice */}
      {warning && (
        <div className="mt-2 p-1.5 bg-amber-100/90 border border-amber-300 rounded text-[11px] text-amber-900 flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">{warning}</span>
        </div>
      )}
    </div>
  );
}
