import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableUnitCard from './DraggableUnitCard';
import { AlertCircle, Plus } from 'lucide-react';

export default function DroppablePeriod({
  id,
  yearLevel,
  period,
  units,
  onRemoveUnit,
  warningsByUnit,
  completedUnitCodes,
  historyMap,
  isReadOnly = false,
  changeRequest,
  onResolveChangeRequest
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: isReadOnly });

  const totalCP = units.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
  const targetCP = 12; // Standard full-time load benchmark
  const cpPercentage = Math.min(100, Math.round((totalCP / targetCP) * 100));

  const unitIds = units.map(u => String(u.unit_id || u.code));

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border p-3.5 flex flex-col h-full min-h-[220px] transition-all font-sans shadow-2xs relative ${
        changeRequest
          ? 'border-rose-400 dark:border-rose-700 bg-rose-50/30 dark:bg-rose-950/20 ring-2 ring-rose-400/40'
          : isOver && !isReadOnly
          ? 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-400 dark:border-slate-600 ring-2 ring-slate-400/50'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Student Change Request Exclamation Mark Alert Banner */}
      {changeRequest && (
        <div className="mb-2.5 p-2.5 bg-rose-100/90 dark:bg-rose-950/90 border-2 border-rose-500/80 rounded-xl shadow-md space-y-1">
          <div className="flex items-center justify-between text-xs font-black text-rose-900 dark:text-rose-100">
            <span className="flex items-center gap-1.5 font-heading uppercase tracking-wider text-[11px]">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black shrink-0 font-mono shadow-2xs animate-bounce">
                !
              </span>
              Student Request Alert
            </span>
            {onResolveChangeRequest && (
              <button
                type="button"
                onClick={onResolveChangeRequest}
                className="text-[10px] bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded-md font-bold hover:bg-rose-200 dark:hover:bg-rose-900 transition-all cursor-pointer shadow-2xs"
                title="Mark request resolved"
              >
                Resolve & Clear
              </button>
            )}
          </div>
          <p className="text-xs font-semibold text-rose-950 dark:text-rose-100 font-sans italic leading-normal pl-6">
            "{changeRequest}"
          </p>
        </div>
      )}

      {/* Semester Header & Credit Load Counter */}
      <div className="pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {changeRequest && <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>}
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
          <span className={`text-[11px] font-bold tabular-nums px-2.5 py-0.5 rounded-full font-mono ${
            totalCP > 12
              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
              : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
          }`}>
            {totalCP} CP
          </span>
        </div>

        {/* Credit Point Progress Meter Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-300 ${totalCP > 12 ? 'bg-rose-600' : 'bg-slate-900 dark:bg-red-600'}`}
            style={{ width: `${cpPercentage}%` }}
          />
        </div>
      </div>

      {/* Single Period Overload Warning Banner */}
      {totalCP > 12 && (
        <div className="mb-2.5 p-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-900 dark:text-rose-200 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>Period load ({totalCP} CP) exceeds 12 CP limit.</span>
        </div>
      )}

      {/* Droppable Container */}
      <SortableContext items={unitIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-1 min-h-[140px] flex flex-col justify-start">
          {units.length === 0 ? (
            <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs py-7 rounded-2xl flex flex-col items-center justify-center bg-slate-50/60 dark:bg-slate-800/30 transition-all select-none font-sans">
              {!isReadOnly ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400 flex items-center justify-center mb-2 transition-all shadow-2xs">
                    <Plus className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 font-heading">
                    Schedule Unit for {period.name}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Drag unit here or use + Add Unit button
                  </span>
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  No units scheduled for {period.name}
                </span>
              )}
            </div>
          ) : (
            units.map(unit => (
              <DraggableUnitCard
                key={unit.unit_id || unit.code}
                unit={unit}
                onRemoveUnit={onRemoveUnit}
                warning={warningsByUnit[unit.code]}
                isCompleted={completedUnitCodes.has(unit.code)}
                historyRecord={historyMap ? historyMap[unit.code] : undefined}
                isReadOnly={isReadOnly}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
