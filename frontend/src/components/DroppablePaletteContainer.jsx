import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import DraggablePaletteUnitCard from './DraggablePaletteUnitCard';
import { BookOpen, Search } from 'lucide-react';

export default function DroppablePaletteContainer({
  filteredOfferings,
  unitFilter,
  setUnitFilter,
  selectedLevel,
  setSelectedLevel,
  showAllCatalogUnits,
  setShowAllCatalogUnits,
  totalCatalogCount = 28,
  scheduledCodesSet = new Set(),
  onAddUnit,
  onAddToSpecificSemester
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'available_units_dropzone'
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white dark:bg-slate-900 border rounded-2xl shadow-2xs overflow-hidden transition-all ${
        isOver
          ? 'border-emerald-500 ring-2 ring-emerald-400/50 bg-emerald-50/20 dark:bg-emerald-950/20'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="bg-slate-50/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
            <BookOpen className="w-4 h-4 text-red-600 dark:text-red-400" />
            Available Course Units
          </h3>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
            Official Unit Directory
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full text-slate-700 dark:text-slate-300 tabular-nums font-mono text-[11px]">
            {filteredOfferings.length} Available / {totalCatalogCount} Units
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Filter Search Box & Level Selector */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              placeholder="Search unit code or title..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 font-medium transition-all"
            />
          </div>

          {/* Show All / Hide Scheduled Units Toggle */}
          {setShowAllCatalogUnits && (
            <div className="flex items-center justify-end font-sans">
              <button
                onClick={() => setShowAllCatalogUnits(!showAllCatalogUnits)}
                className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                  showAllCatalogUnits
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Toggle showing units that are already scheduled in the study plan"
              >
                {showAllCatalogUnits ? 'Showing All 28 Units' : 'Hide Scheduled Units'}
              </button>
            </div>
          )}
        </div>

        {/* Drop zone feedback notice when dragging unit over palette */}
        {isOver && (
          <div className="p-2 bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded text-emerald-900 dark:text-emerald-200 text-xs text-center font-semibold">
            Drop here to remove unit from study plan
          </div>
        )}

        {/* Offerings Scrollable List */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filteredOfferings.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-6">No matching unit offerings found</p>
          ) : (
            filteredOfferings.map(unit => (
              <DraggablePaletteUnitCard
                key={unit.unit_id || unit.code}
                unit={unit}
                onAdd={onAddUnit}
                onAddToSpecificSemester={onAddToSpecificSemester}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
