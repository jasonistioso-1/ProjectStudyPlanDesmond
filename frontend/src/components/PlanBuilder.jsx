import React, { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import DroppablePeriod from './DroppablePeriod';
import {
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Save,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { recalculatePlan } from '../services/api';

export default function PlanBuilder({
  student,
  planUnits,
  setPlanUnits,
  catalogUnits = [],
  periods = [],
  validationResult,
  history = [],
  onValidate,
  activeRole = 'chair',
  currentPlan,
  onRecommendPlan,
  onAgreePlan,
  onSavePlan,
  onOpenOfficialDocument
}) {
  const isChair = activeRole === 'chair';
  const [unitFilter, setUnitFilter] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [agreedConfirmed, setAgreedConfirmed] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  );

  // Completed unit codes
  const completedUnitCodes = new Set(
    (history || []).filter(h => h.status === 'completed').map(h => h.unit_code)
  );

  // Semesters list
  const activePeriods = periods.filter(p => p.code === 'S1' || p.code === 'S2');
  const defaultPeriodList = activePeriods.length > 0 ? activePeriods : [
    { period_id: 1, name: 'Semester 1', code: 'S1' },
    { period_id: 2, name: 'Semester 2', code: 'S2' }
  ];

  // Warnings mapping
  const warningsByUnit = {};
  if (validationResult && validationResult.warnings) {
    validationResult.warnings.forEach(w => {
      if (w.unitCode && !warningsByUnit[w.unitCode]) {
        warningsByUnit[w.unitCode] = w.message;
      }
    });
  }

  // Handle Drag End event
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    let targetYear = 1;
    let targetPeriodId = 1;

    if (String(overId).startsWith('year_')) {
      const parts = String(overId).split('_');
      targetYear = Number(parts[1]);
      targetPeriodId = Number(parts[3]);
    } else {
      const overUnit = planUnits.find(u => String(u.unit_id || u.code) === String(overId));
      if (overUnit) {
        targetYear = overUnit.year_level;
        targetPeriodId = overUnit.period_id;
      }
    }

    setPlanUnits(prevUnits => {
      const updated = prevUnits.map(unit => {
        if (String(unit.unit_id || unit.code) === String(activeId)) {
          return {
            ...unit,
            year_level: targetYear,
            period_id: targetPeriodId
          };
        }
        return unit;
      });

      if (onValidate) onValidate(updated);
      return updated;
    });
  };

  // Add unit from palette to Plan
  const handleAddUnitFromPalette = (unit) => {
    if (planUnits.some(u => u.code === unit.code)) return;

    const defaultPeriod = defaultPeriodList[0] ? defaultPeriodList[0].period_id : 1;
    const newPlanUnit = {
      unit_id: unit.unit_id,
      code: unit.code,
      title: unit.title,
      credit_points: unit.credit_points || 3,
      period_id: defaultPeriod,
      year_level: 1,
      sequence_order: planUnits.length + 1
    };

    const updated = [...planUnits, newPlanUnit];
    setPlanUnits(updated);
    if (onValidate) onValidate(updated);
  };

  // Remove unit from Plan
  const handleRemoveUnit = (unitIdOrCode) => {
    const updated = planUnits.filter(u => String(u.unit_id || u.code) !== String(unitIdOrCode));
    setPlanUnits(updated);
    if (onValidate) onValidate(updated);
  };

  // Filtered available offerings
  const filteredOfferings = catalogUnits.filter(unit => {
    if (planUnits.some(pu => pu.code === unit.code)) return false;
    if (selectedLevel !== 'ALL' && String(unit.level) !== selectedLevel) return false;
    if (unitFilter.trim()) {
      const query = unitFilter.toLowerCase();
      return (
        unit.code.toLowerCase().includes(query) ||
        (unit.title && unit.title.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const years = [
    { level: 1, yearName: 'Year 1 (2026)' },
    { level: 2, yearName: 'Year 2 (2027)' },
    { level: 3, yearName: 'Year 3 (2028)' }
  ];

  const getSemesterUnits = (yearLevel, periodId) => {
    return planUnits.filter(u => u.year_level === yearLevel && u.period_id === periodId);
  };

  // =========================================================================
  // RENDER: STUDENT VIEW (READ-ONLY REVIEW & SIGN-OFF)
  // =========================================================================
  if (!isChair) {
    const studentCourse = student ? `${student.course_code || 'Bachelor of IT'} - ${student.major || 'IT Major'}` : 'Bachelor of IT - IT Major';
    const planStatus = currentPlan ? currentPlan.status : 'recommended';
    const isAlreadyAgreed = planStatus === 'agreed' || planStatus === 'approved';

    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-2xs font-sans max-w-[1440px] mx-auto">
        {/* Title Header */}
        <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Proposed Study Plan Review — {studentCourse}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Review your Academic Chair's proposed unit sequence and credit load before signing.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {planStatus.toUpperCase()}
          </span>
        </div>

        {/* Read-Only Grid Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {years.map(y => (
            <div key={y.level} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-slate-900 font-mono">
                  {y.yearName}
                </span>
                <span className="text-[11px] font-mono text-slate-400">Max 12 CP / Sem</span>
              </div>

              {defaultPeriodList.map(p => {
                const sUnits = getSemesterUnits(y.level, p.period_id);
                const semCP = sUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0);

                return (
                  <div key={p.period_id} className="mb-3 last:mb-0 bg-white border border-slate-200/80 rounded-lg p-3 shadow-2xs">
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 text-xs">
                      <span className="font-semibold text-slate-800">{p.name}</span>
                      <span className="font-mono text-xs tabular-nums text-slate-500 font-medium">
                        {semCP} / 12 CP
                      </span>
                    </div>

                    {sUnits.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-2 font-mono">Empty slot</p>
                    ) : (
                      <div className="space-y-1.5">
                        {sUnits.map(u => (
                          <div
                            key={u.unit_id || u.code}
                            className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200/60 px-2.5 py-1.5 rounded-md font-medium text-slate-800"
                          >
                            <span className="font-mono font-semibold text-slate-900">{u.code}</span>
                            <span className="text-slate-600 text-xs truncate max-w-[140px] ml-2 mr-auto">{u.title}</span>
                            <span className="text-xs font-mono text-slate-500 tabular-nums shrink-0">{u.credit_points || 3} CP</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Confirmation Checkbox & Signature Action */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-center max-w-xl mx-auto shadow-2xs">
          <label className="flex items-start justify-center gap-3 cursor-pointer text-xs font-medium text-slate-700 mb-5 select-none text-left">
            <input
              type="checkbox"
              checked={agreedConfirmed || isAlreadyAgreed}
              disabled={isAlreadyAgreed}
              onChange={(e) => setAgreedConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span>
              I confirm that I have reviewed the credit load (maximum 12 CP per semester) and unit progression requirements.
            </span>
          </label>

          <div className="flex justify-center">
            <button
              onClick={() => onAgreePlan && onAgreePlan()}
              disabled={(!agreedConfirmed && !isAlreadyAgreed) || isAlreadyAgreed}
              className={`px-6 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-2xs ${
                isAlreadyAgreed
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                  : agreedConfirmed
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isAlreadyAgreed ? 'Study Plan Agreed & Digitally Signed' : 'Sign & Agree to Study Plan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: ACADEMIC CHAIR VIEW (AVAILABLE OFFERINGS + 3-YEAR GRID)
  // =========================================================================
  return (
    <div className="font-sans max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: AVAILABLE OFFERINGS & VALIDATION CONSOLE (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card 1: Available Unit Offerings */}
          <div className="bg-white border border-slate-300 rounded-xl shadow-md overflow-hidden">
            {/* Murdoch Crimson Header */}
            <div className="bg-[#8A0000] text-white px-4 py-3 flex justify-between items-center border-b-2 border-amber-500">
              <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-300" />
                Available Unit Offerings
              </h3>
              <span className="text-xs font-mono font-bold bg-amber-400 text-red-950 px-2 py-0.5 rounded shadow-2xs">
                {filteredOfferings.length} units
              </span>
            </div>

            <div className="p-4 space-y-3">
              {/* Filter Search Box & Murdoch Style Level Selector */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    placeholder="Search unit code or title..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-600 font-semibold"
                  />
                </div>

                {/* Vibrant Level Filter Pills */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono">
                  {[
                    { key: 'ALL', label: 'All', color: 'bg-slate-900' },
                    { key: '100', label: 'L100 (Core)', color: 'bg-blue-600' },
                    { key: '200', label: 'L200 (Major)', color: 'bg-teal-600' },
                    { key: '300', label: 'L300 (Adv)', color: 'bg-purple-600' }
                  ].map(lvl => (
                    <button
                      key={lvl.key}
                      onClick={() => setSelectedLevel(lvl.key)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all shadow-2xs ${
                        selectedLevel === lvl.key
                          ? `${lvl.color} text-white ring-2 ring-amber-400 font-black scale-105`
                          : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Offerings Scrollable List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredOfferings.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6 font-medium">No matching unit offerings found</p>
                ) : (
                  filteredOfferings.map(unit => {
                    const uLvl = Number(unit.level || (unit.code ? unit.code.replace(/[^0-9]/g, '').charAt(0) + '00' : 100));
                    let lvlTagClass = 'bg-blue-600 text-white font-bold';
                    let lvlName = 'CORE';
                    let cardBorder = 'border-l-4 border-l-blue-600 bg-blue-50/50';

                    if (uLvl >= 300) {
                      lvlTagClass = 'bg-purple-700 text-white font-bold';
                      lvlName = 'CAPSTONE';
                      cardBorder = 'border-l-4 border-l-purple-600 bg-purple-50/50';
                    } else if (uLvl >= 200) {
                      lvlTagClass = 'bg-teal-700 text-white font-bold';
                      lvlName = 'MAJOR';
                      cardBorder = 'border-l-4 border-l-teal-600 bg-teal-50/50';
                    }

                    return (
                      <div
                        key={unit.unit_id || unit.code}
                        className={`border border-slate-200 hover:border-slate-300 p-2.5 rounded-lg text-xs transition-all shadow-2xs group flex items-center justify-between ${cardBorder}`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-slate-900 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">{unit.code}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${lvlTagClass}`}>
                              {lvlName}
                            </span>
                          </div>
                          <div className="text-slate-900 text-xs font-bold truncate mt-1">
                            {unit.title}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                            <span className="tabular-nums font-bold text-slate-700">{unit.credit_points || 3} CP</span>
                            <span>•</span>
                            <span className="font-medium">Perth Campus</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddUnitFromPalette(unit)}
                          className="px-3 py-1.5 bg-[#8A0000] hover:bg-red-900 text-white text-xs font-extrabold rounded-md transition-all flex items-center gap-1 shrink-0 shadow-sm border border-red-900 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-300" /> Add
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Validation Console */}
          <div className="bg-white border border-slate-300 rounded-xl shadow-md overflow-hidden">
            <div className="bg-emerald-800 text-white px-4 py-3 border-b-2 border-emerald-500 flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Validation Console
              </h3>
              <span className="text-[11px] font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded text-emerald-200">LIVE RULES</span>
            </div>

            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-bold shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
                <span>Offered in Perth Campus (BR-01 Validated)</span>
              </div>

              {validationResult && validationResult.warnings && validationResult.warnings.length > 0 ? (
                validationResult.warnings.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 text-xs font-bold shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block mt-1 shrink-0"></span>
                    <div>
                      <span className="font-extrabold text-amber-900 underline">{w.unitCode || 'Rule Warning'}:</span> {w.message}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-950 font-bold shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                  <span>Prerequisite requirements met (BR-02 Validated)</span>
                </div>
              )}
            </div>
          </div>

              {validationResult && validationResult.warnings && validationResult.warnings.length > 0 ? (
                validationResult.warnings.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mt-1 shrink-0"></span>
                    <div>
                      <span className="font-semibold">{w.unitCode || 'Rule'}:</span> {w.message}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Prerequisite requirements met</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3-YEAR STUDY PLAN GRID (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs">
            
            {/* Action Bar Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-700" />
                  3-Year Study Plan Grid
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  Maximum 12 CP per semester limit strictly enforced.
                </p>
              </div>

              {/* Context Action Button Flow */}
              <div className="flex items-center gap-2">
                {onOpenOfficialDocument && (
                  <button
                    onClick={onOpenOfficialDocument}
                    className="px-3.5 py-1.5 bg-[#8A0000] hover:bg-red-900 text-white rounded-md font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5 border border-red-800"
                    title="Export official physical study plan document (PDF / PNG)"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" /> Export Document (PDF/PNG)
                  </button>
                )}
                <button
                  onClick={onSavePlan}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md font-medium text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" /> Save Draft
                </button>
              </div>
            </div>

            {/* 3-Year Interactive Drag & Drop Grid */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="space-y-6">
                {years.map(yearObj => {
                  let yearHeaderStyle = 'bg-[#8A0000] text-white border-red-900'; // Year 1 Crimson
                  let containerBg = 'bg-red-50/20 border-red-200/60';
                  if (yearObj.level === 2) {
                    yearHeaderStyle = 'bg-[#1E293B] text-white border-slate-900'; // Year 2 Deep Navy
                    containerBg = 'bg-blue-50/20 border-slate-300';
                  } else if (yearObj.level === 3) {
                    yearHeaderStyle = 'bg-[#4C1D95] text-white border-purple-950'; // Year 3 Purple
                    containerBg = 'bg-purple-50/20 border-purple-200';
                  }

                  return (
                    <div key={yearObj.level} className={`border rounded-xl p-4 shadow-sm ${containerBg}`}>
                      {/* Year Level Tag */}
                      <div className="flex justify-between items-center mb-3.5">
                        <span className={`text-xs font-mono font-black px-3.5 py-1.5 rounded-lg shadow-sm flex items-center gap-2 border ${yearHeaderStyle}`}>
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          {yearObj.yearName}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                          Target: 24 CP / Year
                        </span>
                      </div>

                      {/* Semester Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {defaultPeriodList.map(period => {
                          const droppableId = `year_${yearObj.level}_period_${period.period_id}`;
                          const unitsInPeriod = planUnits.filter(
                            u => u.year_level === yearObj.level && u.period_id === period.period_id
                          );

                          return (
                            <DroppablePeriod
                              key={droppableId}
                              id={droppableId}
                              yearLevel={yearObj.level}
                              period={period}
                              units={unitsInPeriod}
                              onRemoveUnit={handleRemoveUnit}
                              warningsByUnit={warningsByUnit}
                              completedUnitCodes={completedUnitCodes}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </DndContext>

            {/* Bottom Right Recommend Primary Flow Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => onRecommendPlan && onRecommendPlan()}
                className="px-5 py-2 bg-[#8A0000] hover:bg-red-900 text-white rounded-md font-extrabold text-xs shadow-md transition-all flex items-center gap-2 border border-red-900"
              >
                <span>Recommend Plan to Student</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
