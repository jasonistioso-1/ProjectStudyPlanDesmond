import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, ChevronDown } from 'lucide-react';

export default function DraggablePaletteUnitCard({ unit, onAdd, onAddToSpecificSemester }) {
  const [showPicker, setShowPicker] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette_${unit.unit_id || unit.code}`,
    data: { unit }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  const uLvl = Number(unit.level || (unit.code ? unit.code.replace(/[^0-9]/g, '').charAt(0) + '00' : 100));
  let lvlBadge = 'bg-slate-100 text-slate-700 border-slate-200';
  let cardBorder = 'border-l-4 border-l-slate-800';

  if (uLvl >= 300) {
    lvlBadge = 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
    cardBorder = 'border-l-4 border-l-purple-600';
  } else if (uLvl >= 200) {
    lvlBadge = 'bg-teal-50 text-teal-700 border-teal-200 font-bold';
    cardBorder = 'border-l-4 border-l-teal-600';
  } else {
    lvlBadge = 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
    cardBorder = 'border-l-4 border-l-blue-600';
  }

  const semesterOptions = [
    { year: 1, period: 1, label: 'Year 1 Sem 1' },
    { year: 1, period: 2, label: 'Year 1 Sem 2' },
    { year: 2, period: 1, label: 'Year 2 Sem 1' },
    { year: 2, period: 2, label: 'Year 2 Sem 2' },
    { year: 3, period: 1, label: 'Year 3 Sem 1' },
    { year: 3, period: 2, label: 'Year 3 Sem 2' }
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-slate-200/90 hover:border-slate-300 p-3 rounded-xl text-xs transition-all shadow-2xs hover:shadow-xs group flex items-center justify-between select-none relative ${cardBorder}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 shrink-0 transition-colors"
          title="Drag unit into a semester slot"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-slate-900 text-xs tracking-tight">{unit.code}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold ${lvlBadge}`}>
              L{uLvl}
            </span>
          </div>
          <div className="text-slate-800 text-xs font-semibold truncate mt-0.5">
            {unit.title}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
            <span className="tabular-nums font-semibold text-slate-700">{unit.credit_points || 3} CP</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">Perth Campus</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 relative">
        <button
          onClick={() => onAdd(unit)}
          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-2xs flex items-center gap-1"
          title="Add to study plan"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>

        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors"
          title="Choose specific target semester"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {showPicker && (
          <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 space-y-0.5 text-[11px] font-medium font-sans">
            <div className="text-[10px] text-slate-400 px-2.5 py-1 font-bold uppercase tracking-wider font-mono">Select Target Semester</div>
            {semesterOptions.map(opt => (
              <button
                key={`${opt.year}_${opt.period}`}
                onClick={() => {
                  setShowPicker(false);
                  if (onAddToSpecificSemester) {
                    onAddToSpecificSemester(unit, opt.year, opt.period);
                  } else {
                    onAdd(unit);
                  }
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-lg text-slate-800 font-semibold transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
