import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableUnitCard from './DraggableUnitCard';
import { AlertCircle, Plus } from 'lucide-react';

export default function DroppablePeriod({ id, yearLevel, period, units, onRemoveUnit, warningsByUnit, completedUnitCodes }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalCP = units.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
  const maxCP = 12;
  const isOverLimit = totalCP > maxCP;
  const cpPercentage = Math.min(100, Math.round((totalCP / maxCP) * 100));

  const unitIds = units.map(u => String(u.unit_id || u.code));

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-3.5 flex flex-col h-full min-h-[220px] transition-all font-sans shadow-2xs ${
        isOver
          ? 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-400 dark:border-slate-600 ring-2 ring-slate-400/50'
          : isOverLimit
          ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
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
          <span
            className={`text-[11px] font-semibold tabular-nums px-2.5 py-0.5 rounded-full ${
              isOverLimit
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                : totalCP === maxCP
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            {totalCP} / {maxCP} CP
          </span>
        </div>

        {/* Dynamic Credit Point Progress Meter Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-300 ${
              isOverLimit ? 'bg-rose-600' : totalCP === maxCP ? 'bg-emerald-600' : 'bg-slate-900 dark:bg-red-600'
            }`}
            style={{ width: `${cpPercentage}%` }}
          />
        </div>
      </div>

      {/* Over Limit Warning Banner */}
      {isOverLimit && (
        <div className="mb-2 px-2.5 py-1 bg-rose-100/90 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 rounded-lg text-[11px] text-rose-900 dark:text-rose-200 flex items-center gap-1.5 font-bold">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>Exceeds maximum {maxCP} CP limit per semester</span>
        </div>
      )}

      {/* Droppable Container */}
      <SortableContext items={unitIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[140px] flex flex-col justify-start">
          {units.length === 0 ? (
            <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-400 dark:text-slate-500 text-xs py-8 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer select-none">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                Drag units here
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">Drop unit to schedule {period.name}</span>
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
