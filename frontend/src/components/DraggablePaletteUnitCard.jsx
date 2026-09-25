import React, { useState, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, ChevronDown, Zap, Calendar } from 'lucide-react';

export default function DraggablePaletteUnitCard({ unit, scheduledInfo, onAdd, onAddToSpecificSemester, layoutType = 'trimester' }) {
  const [showPicker, setShowPicker] = useState(false);
  const cardRef = useRef(null);

  const isScheduled = !!scheduledInfo;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette_${unit.unit_id || unit.code}`,
    data: { unit }
  });

  useEffect(() => {
    if (!showPicker) return;
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  const trimesterOptions = [
    { year: 1, period: 3, label: 'Year 1 Trimester 1 (T1)' },
    { year: 1, period: 4, label: 'Year 1 Trimester 2 (T2)' },
    { year: 1, period: 5, label: 'Year 1 Trimester 3 (T3)' },
    { year: 2, period: 3, label: 'Year 2 Trimester 1 (T1)' },
    { year: 2, period: 4, label: 'Year 2 Trimester 2 (T2)' },
    { year: 2, period: 5, label: 'Year 2 Trimester 3 (T3)' },
    { year: 3, period: 3, label: 'Year 3 Trimester 1 (T1)' },
    { year: 3, period: 4, label: 'Year 3 Trimester 2 (T2)' },
    { year: 3, period: 5, label: 'Year 3 Trimester 3 (T3)' }
  ];

  const semesterOptions = [
    { year: 1, period: 1, label: 'Year 1 Semester 1 (S1)' },
    { year: 1, period: 2, label: 'Year 1 Semester 2 (S2)' },
    { year: 2, period: 1, label: 'Year 2 Semester 1 (S1)' },
    { year: 2, period: 2, label: 'Year 2 Semester 2 (S2)' },
    { year: 3, period: 1, label: 'Year 3 Semester 1 (S1)' },
    { year: 3, period: 2, label: 'Year 3 Semester 2 (S2)' }
  ];

  const periodOptions = layoutType === 'semester' ? semesterOptions : trimesterOptions;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={style}
      className={`border p-3 rounded-xl text-xs transition-all shadow-2xs hover:shadow-xs group flex items-center justify-between select-none relative font-sans ${
        isScheduled
          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60'
          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-heading font-extrabold text-white bg-slate-900 dark:bg-red-700 text-xs tracking-tight px-2.5 py-0.5 rounded-md shadow-2xs font-mono">{unit.code}</span>
            <span className="text-[10px] font-mono font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              L{unit.level || (unit.code ? unit.code.replace(/[^0-9]/g, '').charAt(0) + '00' : '100')}
            </span>

            {isScheduled && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-sans">
                ✓ Added in {scheduledInfo.termName}
              </span>
            )}
          </div>
          <div className="text-slate-900 dark:text-slate-100 text-xs font-bold truncate mt-1">
            {unit.title}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 font-medium">
            <span className="tabular-nums font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 font-mono text-[10px]">{unit.credit_points || 3} CP</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400">Singapore Campus</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 relative">
        {isScheduled ? null : (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-red-700 dark:hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Click to select target trimester/semester period for this unit"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add Unit</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-300 dark:text-red-200 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
          </button>
        )}

        {showPicker && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs font-sans animate-in fade-in duration-150">
            <div className="text-[10px] text-slate-400 dark:text-slate-500 px-2.5 py-1 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1">
              <Calendar className="w-3 h-3 text-red-600" />
              <span>Select Target Period</span>
            </div>

            {/* Quick Auto-Assign Option */}
            <button
              onClick={() => {
                setShowPicker(false);
                if (onAdd) onAdd(unit);
              }}
              className="w-full text-left px-2.5 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold flex items-center gap-2 transition-colors border border-emerald-200/60 dark:border-emerald-800/60 text-[11px]"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Auto-assign next open slot</span>
            </button>

            {/* Trimester/Semester List */}
            <div className="space-y-0.5 pt-1 max-h-48 overflow-y-auto pr-0.5">
              {periodOptions.map(opt => (
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
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-medium text-[11px] transition-colors flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                  <Plus className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
