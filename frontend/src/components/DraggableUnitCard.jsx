import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  
  let cardBg = 'bg-blue-50/70 border-blue-200 text-blue-950 hover:bg-blue-50';
  let accentBorder = 'border-l-4 border-l-blue-600';
  let badgeClass = 'bg-blue-600 text-white font-bold';
  let badgeLabel = 'CORE';

  if (unitLevel >= 300) {
    cardBg = 'bg-purple-50/70 border-purple-200 text-purple-950 hover:bg-purple-50';
    accentBorder = 'border-l-4 border-l-purple-600';
    badgeClass = 'bg-purple-700 text-white font-bold';
    badgeLabel = 'ADVANCED';
  } else if (unitLevel >= 200) {
    cardBg = 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-50';
    accentBorder = 'border-l-4 border-l-teal-600';
    badgeClass = 'bg-teal-700 text-white font-bold';
    badgeLabel = 'MAJOR';
  }

  if (isCompleted) {
    cardBg = 'bg-emerald-100/70 border-emerald-300 text-emerald-950';
    accentBorder = 'border-l-4 border-l-emerald-600';
  } else if (warning) {
    cardBg = 'bg-amber-100/80 border-amber-300 text-amber-950';
    accentBorder = 'border-l-4 border-l-amber-600';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative p-2.5 rounded-xl border text-xs shadow-2xs transition-all group select-none ${accentBorder} ${cardBg}`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: Drag Handle + Unit Details */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing p-0.5 shrink-0 transition-colors"
            title="Drag to reposition unit"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          <div className="truncate flex items-center gap-2 min-w-0">
            <span className="font-mono font-extrabold text-slate-900 text-xs tracking-tight shrink-0 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              {unit.code}
            </span>
            <span className="text-slate-900 text-xs font-semibold truncate">
              {unit.title}
            </span>
          </div>
        </div>

        {/* Right: Category Badge, Tabular CP & Remove button */}
        <div className="flex items-center gap-1.5 shrink-0 font-mono">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white shrink-0 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-white" /> DONE
            </span>
          ) : (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${badgeClass}`}>
              {badgeLabel}
            </span>
          )}

          <span className="text-[11px] font-bold text-slate-800 tabular-nums bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
            {unit.credit_points || 3} CP
          </span>

          {onRemoveUnit && (
            <button
              onClick={() => onRemoveUnit(unit.unit_id || unit.code)}
              className="text-slate-400 hover:text-red-700 hover:bg-white rounded-md px-1.5 py-0.5 text-xs font-sans font-extrabold leading-none transition-colors border border-transparent hover:border-red-200 ml-0.5"
              title="Remove unit from semester"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Warning Notice */}
      {warning && (
        <div className="mt-2 p-1.5 bg-amber-200/90 border border-amber-400 rounded-md text-[11px] text-amber-950 flex items-center gap-1.5 font-bold">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span className="truncate">{warning}</span>
        </div>
      )}
    </div>
  );
}
