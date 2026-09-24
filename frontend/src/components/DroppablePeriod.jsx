import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableUnitCard from './DraggableUnitCard';
import { AlertCircle, Plus } from 'lucide-react';

export default function DroppablePeriod({ id, yearLevel, period, units, onRemoveUnit, warningsByUnit, completedUnitCodes }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalCP = units.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
  const targetCP = 12; // Standard full-time load benchmark
  const cpPercentage = Math.min(100, Math.round((totalCP / targetCP) * 100));

  const unitIds = units.map(u => String(u.unit_id || u.code));

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-3.5 flex flex-col h-full min-h-[220px] transition-all font-sans shadow-2xs ${
        isOver
          ? 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-400 dark:border-slate-600 ring-2 ring-slate-400/50'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Semester Header & Credit Load Counter */}
      <div className="pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-red-500"></span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight font-heading">
                {period.name}
              </span>
              {period.date_range && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                  ({period.date_range})
                </span>
              )}
            </div>
          </div>
          <span className="text-[11px] font-semibold tabular-nums px-2.5 py-0.5 rounded-full text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 font-mono">
            {totalCP} CP
          </span>
        </div>

        {/* Credit Point Progress Meter Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden flex">
          <div
            className="h-full transition-all duration-300 bg-slate-900 dark:bg-red-600"
            style={{ width: `${cpPercentage}%` }}
          />
        </div>
      </div>



      {/* Droppable Container */}
      <SortableContext items={unitIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[140px] flex flex-col justify-start">
          {units.length === 0 ? (
            <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-red-500/80 dark:hover:border-red-500/80 text-slate-400 dark:text-slate-500 text-xs py-7 rounded-2xl flex flex-col items-center justify-center bg-slate-50/60 dark:bg-slate-800/30 hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-all cursor-pointer select-none group font-sans">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:scale-110 flex items-center justify-center mb-2 transition-all shadow-2xs">
                <Plus className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors font-heading">
                Schedule Unit for {period.name}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Drag unit here or use + Add Unit button
              </span>
            </div>
          ) : (
            units.map(unit => (
              <DraggableUnitCard
                key={unit.unit_id || unit.code}
                unit={unit}
                onRemoveUnit={onRemoveUnit}
                warning={warningsByUnit[unit.code]}
                isCompleted={completedUnitCodes.has(unit.code)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
