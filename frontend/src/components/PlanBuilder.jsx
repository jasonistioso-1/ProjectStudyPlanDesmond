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
    const studentCourse = student ? `${student.course_code || 'PT3-BSIT-01'} — ${student.course_name || 'Bachelor of IT'}` : 'Bachelor of IT (Major: Software & Systems)';
    const planStatus = currentPlan ? currentPlan.status : 'recommended';
    const isAlreadyAgreed = planStatus === 'agreed' || planStatus === 'approved';
    const totalCP = planUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0);

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs font-sans max-w-[1440px] mx-auto space-y-6">
        {/* Student View Banner Header */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[11px] font-mono font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded uppercase tracking-wide">
              STUDENT SIGN-OFF PORTAL
            </span>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-1.5">
              <FileCheck className="w-5 h-5 text-blue-700" />
              Proposed Study Plan Review — {studentCourse}
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-normal">
              Please review the semester-by-semester unit sequence proposed by your Academic Chair. Check your credit load balance before digitally signing below.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white border border-blue-200 px-3 py-1.5 rounded-lg text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 font-mono block">Status</span>
              <span className="text-xs font-bold text-blue-900 uppercase">{planStatus}</span>
            </div>
            <div className="bg-white border border-blue-200 px-3 py-1.5 rounded-lg text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 font-mono block">Planned Load</span>
              <span className="text-xs font-mono font-bold text-slate-900">{totalCP} / 72 CP</span>
            </div>
          </div>
        </div>

        {/* Read-Only 3-Year Grid Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {years.map(y => (
            <div key={y.level} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {y.yearName}
                </span>
                <span className="text-[11px] font-mono text-slate-500">Max 12 CP / Sem</span>
              </div>

              {defaultPeriodList.map(p => {
                const sUnits = getSemesterUnits(y.level, p.period_id);
                const semCP = sUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0);

                return (
                  <div key={p.period_id} className="mb-3 last:mb-0 bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 text-xs">
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <span className="font-mono text-xs tabular-nums text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">
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
                            className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md font-medium text-slate-800"
                          >
                            <span className="font-mono font-extrabold text-slate-900">{u.code}</span>
                            <span className="text-slate-700 text-xs truncate max-w-[140px] ml-2 mr-auto">{u.title}</span>
                            <span className="text-xs font-mono text-slate-600 tabular-nums shrink-0 font-semibold">{u.credit_points || 3} CP</span>
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

        {/* Student Decision Helper & Digital Signature Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-2xl mx-auto shadow-2xs text-center space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Student Agreement & Digital Sign-off</h3>
          <p className="text-xs text-slate-600 font-normal leading-relaxed">
            By signing below, you agree to the recommended unit sequence and acknowledge that changes to your study plan require Academic Chair re-approval.
          </p>

          <label className="flex items-start justify-center gap-3 cursor-pointer text-xs font-medium text-slate-800 select-none text-left bg-white p-3.5 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={agreedConfirmed || isAlreadyAgreed}
              disabled={isAlreadyAgreed}
              onChange={(e) => setAgreedConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span>
              I confirm that I have reviewed the credit load (maximum 12 CP per semester) and prerequisite progression sequence for my degree program.
            </span>
          </label>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => onAgreePlan && onAgreePlan()}
              disabled={(!agreedConfirmed && !isAlreadyAgreed) || isAlreadyAgreed}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
                isAlreadyAgreed
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                  : agreedConfirmed
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
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

              {/* Offerings Scrollable List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredOfferings.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No matching unit offerings found</p>
                ) : (
                  filteredOfferings.map(unit => {
                    const uLvl = Number(unit.level || (unit.code ? unit.code.replace(/[^0-9]/g, '').charAt(0) + '00' : 100));
                    let lvlBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                    let cardBorder = 'border-l-4 border-l-blue-500';

                    if (uLvl >= 300) {
                      lvlBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                      cardBorder = 'border-l-4 border-l-purple-500';
                    } else if (uLvl >= 200) {
                      lvlBadge = 'bg-teal-50 text-teal-700 border-teal-200';
                      cardBorder = 'border-l-4 border-l-teal-500';
                    }

                    return (
                      <div
                        key={unit.unit_id || unit.code}
                        className={`bg-white border border-slate-200 hover:border-slate-300 p-2.5 rounded-lg text-xs transition-all shadow-2xs group flex items-center justify-between ${cardBorder}`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-xs">{unit.code}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium ${lvlBadge}`}>
                              L{uLvl}
                            </span>
                          </div>
                          <div className="text-slate-800 text-xs font-medium truncate mt-0.5">
                            {unit.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span className="tabular-nums font-medium">{unit.credit_points || 3} CP</span>
                            <span>•</span>
                            <span>Perth Campus</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddUnitFromPalette(unit)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Validation Console */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Validation Summary
              </h3>
            </div>

            <div className="p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Offered in Perth Campus</span>
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
                  <span>Prerequisites and load limits satisfied</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3-YEAR STUDY PLAN GRID (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            
            {/* Academic Advisor Decision Helper Box */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-4 mb-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border border-slate-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider bg-red-600 text-white px-2 py-0.5 rounded">Academic Advisor Decision Helper</span>
                  <span className="text-xs text-slate-300 font-medium">Optimal Course Pathway Analysis</span>
                </div>
                <p className="text-xs text-slate-200 font-normal leading-relaxed max-w-xl">
                  {student ? `${student.name} is on track for ${student.major || 'Software & Systems'}. Ensure 100-level core prerequisites (ICT100, ICT159) are completed prior to 200-level sequences.` : 'Ensure 100-level core prerequisites are completed prior to 200-level sequences.'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <span className="text-[11px] font-mono bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Pathway Recommended
                </span>
              </div>
            </div>

            {/* Action Bar Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-700" />
                  3-Year Study Plan Grid
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  Drag and drop units between semesters or use '+ Add' from available list. (Max 12 CP per semester).
                </p>
              </div>

              {/* Context Action Button Flow */}
              <div className="flex items-center gap-2">
                {onOpenOfficialDocument && (
                  <button
                    onClick={onOpenOfficialDocument}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                    title="Export official physical study plan document (PDF / PNG)"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Export Document (PDF/PNG)
                  </button>
                )}
                <button
                  onClick={onSavePlan}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md font-medium text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" /> Save Draft
                </button>
              </div>
            </div>

            {/* 3-Year Interactive Drag & Drop Grid */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="space-y-5">
                {years.map(yearObj => {
                  let yearTagStyle = 'bg-red-700 text-white'; // Year 1 Red
                  if (yearObj.level === 2) yearTagStyle = 'bg-slate-800 text-white'; // Year 2 Slate
                  else if (yearObj.level === 3) yearTagStyle = 'bg-indigo-900 text-white'; // Year 3 Indigo

                  return (
                    <div key={yearObj.level} className="bg-slate-50/60 border border-slate-200 rounded-xl p-4">
                      {/* Year Level Tag */}
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md ${yearTagStyle}`}>
                          {yearObj.yearName}
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
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-xs shadow-2xs transition-all flex items-center gap-2"
              >
                <span>Recommend Plan to Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
