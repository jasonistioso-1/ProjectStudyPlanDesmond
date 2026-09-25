import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import DraggablePaletteUnitCard from './DraggablePaletteUnitCard';
import { BookOpen, Search, X } from 'lucide-react';

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
  scheduledUnitsMap = new Map(),
  onAddUnit,
  onAddToSpecificSemester,
  layoutType = 'trimester'
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
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full text-slate-700 dark:text-slate-300 tabular-nums font-mono text-[11px]">
            {filteredOfferings.length} {showAllCatalogUnits ? 'Catalog Units' : 'Available Unscheduled'}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Filter Search Box & Level Selector */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              id="palette-unit-search-input"
              type="text"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              placeholder="Search unit code or title..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 font-medium transition-all"
            />
            {unitFilter && (
              <button
                type="button"
                onClick={() => setUnitFilter('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                title="Clear unit search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Level Filter Tabs & Hide Scheduled Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 font-sans">
            {setSelectedLevel && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
                {['ALL', '100', '200', '300'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-0.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lvl === 'ALL' ? 'All Levels' : `L${lvl}`}
                  </button>
                ))}
              </div>
            )}

            {setShowAllCatalogUnits && (
              <button
                type="button"
                onClick={() => setShowAllCatalogUnits(!showAllCatalogUnits)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                  showAllCatalogUnits
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Toggle showing units that are already scheduled in the study plan"
              >
                {showAllCatalogUnits ? 'Showing All Units' : 'Hide Scheduled'}
              </button>
            )}
          </div>
        </div>

        {/* Drop zone feedback notice when dragging unit over palette */}
        {isOver && (
          <div className="p-2 bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded text-emerald-900 dark:text-emerald-200 text-xs text-center font-semibold">
            Drop here to remove unit from study plan
          </div>
        )}

        {/* Offerings Scrollable List */}
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filteredOfferings.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-6">No matching unit offerings found</p>
          ) : (
            filteredOfferings.map(unit => (
              <DraggablePaletteUnitCard
                key={unit.unit_id || unit.code}
                unit={unit}
                scheduledInfo={scheduledUnitsMap?.get(unit.code)}
                onAdd={onAddUnit}
                onAddToSpecificSemester={onAddToSpecificSemester}
                layoutType={layoutType}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
