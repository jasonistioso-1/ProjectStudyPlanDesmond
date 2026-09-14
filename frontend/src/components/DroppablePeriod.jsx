import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableUnitCard from './DraggableUnitCard';
import { AlertCircle } from 'lucide-react';

export default function DroppablePeriod({ id, yearLevel, period, units, onRemoveUnit, warningsByUnit, completedUnitCodes }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalCP = units.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
  const isOverLimit = totalCP > 12;

  const unitIds = units.map(u => String(u.unit_id || u.code));

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border p-3 flex flex-col h-full min-h-[190px] transition-all font-sans ${
        isOver
          ? 'bg-slate-50 border-slate-400 ring-2 ring-slate-200'
          : isOverLimit
          ? 'bg-rose-50/30 border-rose-300'
          : 'bg-white border-slate-200/80'
      }`}
    >
      {/* Semester Header & Credit Load Counter */}
      <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-800">
          {period.name}
        </span>
        <span
          className={`text-xs font-mono font-medium tabular-nums px-2 py-0.5 rounded ${
            isOverLimit
              ? 'bg-rose-100 text-rose-700 font-bold border border-rose-200'
              : 'text-slate-500 bg-slate-100/70 border border-slate-200/60'
          }`}
        >
          {totalCP} / 12 CP
        </span>
      </div>

      {/* Over Limit Warning Banner */}
      {isOverLimit && (
        <div className="mb-2 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-md text-[11px] text-rose-700 flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Exceeds max 12 CP limit</span>
        </div>
      )}

      {/* Droppable Container */}
      <SortableContext items={unitIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[130px] flex flex-col justify-start">
          {units.length === 0 ? (
            <div className="h-full border border-dashed border-slate-200 text-slate-400 text-xs py-6 rounded-lg flex items-center justify-center hover:bg-slate-50/50 transition-colors">
              <span className="text-[11px] font-medium text-slate-400">Drag units here</span>
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
