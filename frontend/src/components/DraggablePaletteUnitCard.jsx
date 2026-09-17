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
  let lvlBadge = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (uLvl >= 300) {
    lvlBadge = 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800 font-semibold';
  } else if (uLvl >= 200) {
    lvlBadge = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800 font-semibold';
  } else {
    lvlBadge = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 font-semibold';
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
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 p-3.5 rounded-2xl text-xs transition-all shadow-2xs hover:shadow-xs group flex items-center justify-between select-none relative"
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div
          {...attributes}
          {...listeners}
          className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing shrink-0 transition-colors p-0.5"
          title="Drag unit into a semester slot"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-slate-900 dark:text-white text-xs tracking-tight bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-600 shadow-2xs font-mono">{unit.code}</span>
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-xs font-semibold truncate mt-1">
            {unit.title}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 font-medium">
            <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-600">{unit.credit_points || 3} CP</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400">Singapore Campus</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 relative">
        <button
          onClick={() => onAdd(unit)}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-red-700 dark:hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          title="Add to study plan"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Unit</span>
        </button>

        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl transition-colors"
          title="Choose specific target semester"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {showPicker && (
          <div className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1.5 space-y-0.5 text-[11px] font-medium font-sans">
            <div className="text-[10px] text-slate-400 dark:text-slate-500 px-2.5 py-1 font-bold uppercase tracking-wider font-mono">Select Target Semester</div>
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
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold transition-colors"
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
