import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import DraggablePaletteUnitCard from './DraggablePaletteUnitCard';
import { BookOpen, Search, X, RefreshCw } from 'lucide-react';

export default function DroppablePaletteContainer({
  filteredOfferings,
  unitFilter,
  setUnitFilter,
  selectedLevel,
  setSelectedLevel,
  showAllCatalogUnits,
  setShowAllCatalogUnits,
  totalCatalogCount = 30,
  scheduledCodesSet = new Set(),
  scheduledUnitsMap = new Map(),
  historyMap = {},
  studentMajor = 'Artificial Intelligence',
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

          {/* Level & Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl text-xs flex-wrap font-sans">
            {[
              { id: 'CORE', label: 'Recommended Cores' },
              { id: 'ALL', label: 'All Units' },
              { id: '100', label: 'Lvl 100' },
              { id: '200', label: 'Lvl 200' },
              { id: '300', label: 'Lvl 300' },
              { id: 'ELECTIVE', label: 'General Electives' }
            ].map(lvl => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedLevel && setSelectedLevel(lvl.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer font-heading ${
                  selectedLevel === lvl.id
                    ? 'bg-red-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Hide / Show Scheduled Toggle */}
          <div className="flex items-center justify-between gap-2 font-sans pt-1">
            <span className="text-[11px] text-slate-500 font-semibold">Catalog Units Palette</span>
            {setShowAllCatalogUnits && (
              <button
                type="button"
                onClick={() => setShowAllCatalogUnits(!showAllCatalogUnits)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                  showAllCatalogUnits
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                }`}
                title="Toggle showing units that are already scheduled in the study plan"
              >
                {showAllCatalogUnits ? 'Showing All Units (Click to Hide Scheduled)' : 'Hide Scheduled'}
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
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {filteredOfferings.length === 0 ? (
            <div className="p-5 text-center space-y-2.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 my-2">
              <BookOpen className="w-5 h-5 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-snug">
                {!showAllCatalogUnits
                  ? 'All units in this category are already scheduled in your study plan.'
                  : 'No matching course unit offerings found.'}
              </p>
              {!showAllCatalogUnits && setShowAllCatalogUnits && (
                <button
                  type="button"
                  onClick={() => setShowAllCatalogUnits(true)}
                  className="px-3.5 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Show Scheduled Units</span>
                </button>
              )}
            </div>
          ) : (
            filteredOfferings.map(unit => (
              <DraggablePaletteUnitCard
                key={unit.unit_id || unit.code}
                unit={unit}
                scheduledInfo={scheduledUnitsMap?.get(unit.code)}
                historyRecord={historyMap ? historyMap[unit.code] : undefined}
                scheduledCodesSet={scheduledCodesSet}
                studentMajor={studentMajor}
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

