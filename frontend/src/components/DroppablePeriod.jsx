import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableUnitCard from './DraggableUnitCard';
import { AlertCircle } from 'lucide-react';

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
      className={`rounded-xl border p-3 flex flex-col h-full min-h-[210px] transition-all font-sans shadow-2xs ${
        isOver
          ? 'bg-slate-100/90 border-slate-400 ring-2 ring-indigo-400/50'
          : isOverLimit
          ? 'bg-rose-50/40 border-rose-300'
          : 'bg-white border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Semester Header & Credit Load Counter */}
      <div className="pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              {period.name}
            </span>
          </div>
          <span
            className={`text-[11px] font-mono font-semibold tabular-nums px-2 py-0.5 rounded ${
              isOverLimit
                ? 'bg-rose-100 text-rose-800 font-bold border border-rose-300'
                : 'text-slate-700 bg-slate-100 border border-slate-200'
            }`}
          >
            {totalCP} / {maxCP} CP
          </span>
        </div>

        {/* Dynamic Credit Point Progress Meter Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-300 ${
              isOverLimit ? 'bg-rose-600' : totalCP === maxCP ? 'bg-emerald-600' : 'bg-slate-800'
            }`}
            style={{ width: `${cpPercentage}%` }}
          />
        </div>
      </div>

      {/* Over Limit Warning Banner */}
      {isOverLimit && (
        <div className="mb-2 px-2.5 py-1 bg-rose-100/80 border border-rose-300 rounded-md text-[11px] text-rose-800 flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Exceeds maximum {maxCP} CP limit</span>
        </div>
      )}

      {/* Droppable Container */}
      <SortableContext items={unitIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[135px] flex flex-col justify-start">
          {units.length === 0 ? (
            <div className="h-full border-2 border-dashed border-slate-200 text-slate-400 text-xs py-7 rounded-lg flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <span className="text-[11px] font-semibold text-slate-500">Drag units here</span>
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">Drop to plan {period.name}</span>
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
