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
  onAddUnit
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'available_units_dropzone'
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white border rounded-xl shadow-2xs overflow-hidden transition-all ${
        isOver
          ? 'border-emerald-500 ring-2 ring-emerald-400/50 bg-emerald-50/20'
          : 'border-slate-200'
      }`}
    >
      <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-700" />
          Available Units
        </h3>
        <span className="text-xs font-mono font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
          {filteredOfferings.length} units
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Filter Search Box & Level Selector */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              placeholder="Search code or title..."
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 font-normal"
            />
          </div>

          {/* Level Filter Pills */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {[
              { key: 'ALL', label: 'All' },
              { key: '100', label: '100 Level' },
              { key: '200', label: '200 Level' },
              { key: '300', label: '300 Level' }
            ].map(lvl => (
              <button
                key={lvl.key}
                onClick={() => setSelectedLevel(lvl.key)}
                className={`px-2 py-0.5 rounded border transition-all ${
                  selectedLevel === lvl.key
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drop zone feedback notice when dragging unit over palette */}
        {isOver && (
          <div className="p-2 bg-emerald-100/80 border border-emerald-300 rounded text-emerald-900 text-xs text-center font-semibold">
            Drop here to remove unit from study plan
          </div>
        )}

        {/* Offerings Scrollable List */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filteredOfferings.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">No matching unit offerings found</p>
          ) : (
            filteredOfferings.map(unit => (
              <DraggablePaletteUnitCard
                key={unit.unit_id || unit.code}
                unit={unit}
                onAdd={onAddUnit}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
