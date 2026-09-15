import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';

export default function DraggablePaletteUnitCard({ unit, onAdd }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette_${unit.unit_id || unit.code}`,
    data: { unit }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  const uLvl = Number(unit.level || (unit.code ? unit.code.replace(/[^0-9]/g, '').charAt(0) + '00' : 100));
  let lvlBadge = 'bg-blue-50 text-blue-700 border-blue-200';
  let cardBorder = 'border-l-4 border-l-blue-500';

  if (uLvl >= 300) {
    lvlBadge = 'bg-purple-50 text-purple-700 border-purple-200';
    cardBorder = 'border-l-4 border-l-purple-500';
  } else if (uLvl >= 200) {
    lvlBadge = 'bg-teal-50 text-teal-700 border-teal-200';
    cardBorder = 'border-l-4 border-l-teal-500';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-slate-200 hover:border-slate-300 p-2.5 rounded-lg text-xs transition-all shadow-2xs group flex items-center justify-between select-none ${cardBorder}`}
    >
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 shrink-0 transition-colors"
          title="Drag to semester"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900 text-xs">{unit.code}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium ${lvlBadge}`}>
              L{uLvl}
            </span>
          </div>
          <div className="text-slate-800 text-xs font-medium truncate mt-0.5">
            {unit.title}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
            <span className="tabular-nums font-medium">{unit.credit_points || 3} CP</span>
            <span>•</span>
            <span>Perth Campus</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onAdd(unit)}
        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
        title="Add to study plan"
      >
        <Plus className="w-3 h-3" /> Add
      </button>
    </div>
  );
}
