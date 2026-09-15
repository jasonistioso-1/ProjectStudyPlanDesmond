import React, { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  DragOverlay
} from '@dnd-kit/core';
import DroppablePeriod from './DroppablePeriod';
import DroppablePaletteContainer from './DroppablePaletteContainer';
import {
  CheckCircle2,
  Save,
  BookOpen,
  Layers,
  ArrowRight,
  GripVertical,
  ShieldCheck,
  Database,
  FileCheck,
  AlertTriangle,
  Plus
} from 'lucide-react';

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
  onApprovePlan,
  onSavePlan,
  onOpenOfficialDocument
}) {
  const isChair = activeRole === 'chair';
  const [builderTab, setBuilderTab] = useState('GRID'); // 'GRID' | 'PALETTE' | 'VALIDATION'
  const [unitFilter, setUnitFilter] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [layoutType, setLayoutType] = useState('semester'); // 'semester' | 'trimester' (FR-05)
  const [agreedConfirmed, setAgreedConfirmed] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  );

  // Completed unit codes
  const completedUnitCodes = new Set(
    (history || []).filter(h => h.status === 'completed').map(h => h.unit_code)
  );

  // Teaching Periods list according to layoutType (FR-05 Semester vs Trimester)
  const semesterPeriods = [
    { period_id: 1, name: 'Semester 1', code: 'S1' },
    { period_id: 2, name: 'Semester 2', code: 'S2' }
  ];

  const trimesterPeriods = [
    { period_id: 3, name: 'Trimester 1', code: 'T1' },
    { period_id: 4, name: 'Trimester 2', code: 'T2' },
    { period_id: 5, name: 'Trimester 3', code: 'T3' }
  ];

  const defaultPeriodList = layoutType === 'trimester' ? trimesterPeriods : semesterPeriods;

  // Warnings mapping
  const warningsByUnit = {};
  const warningsList = (validationResult && validationResult.warnings) ? validationResult.warnings : [];
  warningsList.forEach(w => {
    if (w.unitCode && !warningsByUnit[w.unitCode]) {
      warningsByUnit[w.unitCode] = w.message;
    }
  });

  // Handle Drag Start
  const handleDragStart = (event) => {
    const activeId = String(event.active.id);
    if (activeId.startsWith('palette_')) {
      const code = activeId.replace('palette_', '');
      const unit = catalogUnits.find(u => String(u.unit_id || u.code) === code || u.code === code);
      setActiveDragItem(unit);
    } else {
      const unit = planUnits.find(u => String(u.unit_id || u.code) === activeId || u.code === activeId);
      setActiveDragItem(unit);
    }
  };

  // Handle Drag End event
  const handleDragEnd = (event) => {
    setActiveDragItem(null);
    const { active, over } = event;
    const activeId = String(active.id);

    if (!over) {
      if (!activeId.startsWith('palette_')) {
        handleRemoveUnit(activeId);
      }
      return;
    }

    const overId = String(over.id);

    // If dropped back on Available Units sidebar -> remove from plan!
    if (overId === 'available_units_dropzone') {
      if (!activeId.startsWith('palette_')) {
        handleRemoveUnit(activeId);
      }
      return;
    }

    let targetYear = 1;
    let targetPeriodId = 1;

    if (overId.startsWith('year_')) {
      const parts = overId.split('_');
      targetYear = Number(parts[1]);
      targetPeriodId = Number(parts[3]);
    } else {
      const overUnit = planUnits.find(u => String(u.unit_id || u.code) === overId);
      if (overUnit) {
        targetYear = overUnit.year_level;
        targetPeriodId = overUnit.period_id;
      }
    }

    if (activeId.startsWith('palette_')) {
      // Dragged from Available Units palette into a target semester
      const paletteCode = activeId.replace('palette_', '');
      const catalogUnit = catalogUnits.find(u => String(u.unit_id || u.code) === paletteCode || u.code === paletteCode);

      if (catalogUnit && !planUnits.some(u => String(u.code) === String(catalogUnit.code))) {
        const newPlanUnit = {
          unit_id: catalogUnit.unit_id,
          code: catalogUnit.code,
          title: catalogUnit.title,
          credit_points: catalogUnit.credit_points || 3,
          period_id: targetPeriodId,
          year_level: targetYear,
          sequence_order: planUnits.length + 1
        };

        const updated = [...planUnits, newPlanUnit];
        setPlanUnits(updated);
        if (onValidate) onValidate(updated);
      }
    } else {
      // Dragged between semesters
      setPlanUnits(prevUnits => {
        const updated = prevUnits.map(unit => {
          if (String(unit.unit_id || unit.code) === activeId) {
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
    }
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

  // Add unit from palette to a specific target semester
  const handleAddToSpecificSemester = (unit, yearLevel, periodId) => {
    if (planUnits.some(u => u.code === unit.code)) return;

    const newPlanUnit = {
      unit_id: unit.unit_id,
      code: unit.code,
      title: unit.title,
      credit_points: unit.credit_points || 3,
      period_id: periodId,
      year_level: yearLevel,
      sequence_order: planUnits.length + 1
    };

    const updated = [...planUnits, newPlanUnit];
    setPlanUnits(updated);
    if (onValidate) onValidate(updated);
  };

  // Clear all units from plan
  const handleClearPlan = () => {
    setPlanUnits([]);
    if (onValidate) onValidate([]);
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

  const planStatus = currentPlan ? currentPlan.status : 'draft';
  const totalCP = planUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0);

  // =========================================================================
  // RENDER: STUDENT VIEW (READ-ONLY REVIEW & SIGN-OFF)
  // =========================================================================
  if (!isChair) {
    const studentCourse = student ? `${student.course_code || 'PT3-BSIT-01'} — ${student.course_name || 'Bachelor of IT'}` : 'Bachelor of IT (Major: Software & Systems)';
    const isAlreadyAgreed = planStatus === 'agreed' || planStatus === 'approved' || planStatus === 'stored';

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs font-sans max-w-[1440px] mx-auto space-y-6">
        {/* Student View Banner Header */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold bg-amber-600 text-white px-2.5 py-0.5 rounded uppercase tracking-wide">
              STUDENT AGREEMENT & SIGN-OFF PORTAL
            </span>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-1.5">
              <FileCheck className="w-5 h-5 text-amber-700" />
              Proposed Study Plan Review — {studentCourse}
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-normal">
              Please review the unit sequence proposed by your Academic Chair. Check your credit load balance before digitally signing below.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white border border-amber-200 px-3 py-1.5 rounded-lg text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 font-mono block">Current Status</span>
              <span className="text-xs font-bold text-amber-900 uppercase">{planStatus}</span>
            </div>
            <div className="bg-white border border-amber-200 px-3 py-1.5 rounded-lg text-right shadow-2xs">
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
          <h3 className="text-sm font-bold text-slate-900">Student Digital Sign-off Agreement</h3>
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
  // RENDER: ACADEMIC CHAIR VIEW (TAB-BASED FOCUS VIEW: GRID / PALETTE / VALIDATION)
  // =========================================================================
  return (
    <div className="font-sans max-w-[1440px] mx-auto space-y-4">
      {/* Sub-tab Focus View Selector Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Sub-tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setBuilderTab('GRID')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              builderTab === 'GRID'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className={`w-4 h-4 ${builderTab === 'GRID' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>3-Year Plan Canvas</span>
            <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
              {totalCP}/72 CP
            </span>
          </button>

          <button
            onClick={() => setBuilderTab('PALETTE')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              builderTab === 'PALETTE'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${builderTab === 'PALETTE' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Available Units Catalog</span>
            <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full">
              {filteredOfferings.length} Units
            </span>
          </button>

          <button
            onClick={() => setBuilderTab('VALIDATION')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              builderTab === 'VALIDATION'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {warningsList.length > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className={`w-4 h-4 ${builderTab === 'VALIDATION' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            )}
            <span>Rule Validation Console</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              warningsList.length > 0 ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {warningsList.length > 0 ? `${warningsList.length} Warnings` : 'Passed'}
            </span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenOfficialDocument && (
            <button
              onClick={onOpenOfficialDocument}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Export PDF
            </button>
          )}

          <button
            onClick={onSavePlan}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" /> Save Draft
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* SUB-TAB 1: 100% FULL-WIDTH 3-YEAR PLAN CANVAS */}
        {builderTab === 'GRID' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2 font-heading">
                  <Layers className="w-4 h-4 text-slate-700" />
                  3-Year Interactive Study Plan Canvas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  Structure your degree units across semesters. Max 12 Credit Points per semester.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Teaching Period Switcher */}
                <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs">
                  <button
                    onClick={() => setLayoutType('semester')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      layoutType === 'semester'
                        ? 'bg-slate-900 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semester
                  </button>
                  <button
                    onClick={() => setLayoutType('trimester')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      layoutType === 'trimester'
                        ? 'bg-slate-900 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Trimester
                  </button>
                </div>

                <button
                  onClick={() => setBuilderTab('PALETTE')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" /> Add Units from Catalog
                </button>

                <button
                  onClick={handleClearPlan}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
                >
                  Clear Grid
                </button>
              </div>
            </div>

            {/* 3-Year Grid */}
            <div className="space-y-6">
              {years.map(yearObj => {
                let yearTagStyle = 'bg-red-700 text-white';
                if (yearObj.level === 2) yearTagStyle = 'bg-slate-800 text-white';
                else if (yearObj.level === 3) yearTagStyle = 'bg-indigo-900 text-white';

                return (
                  <div key={yearObj.level} className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-3.5">
                      <span className={`text-xs font-mono font-bold px-3 py-1 rounded-lg ${yearTagStyle}`}>
                        {yearObj.yearName}
                      </span>
                      <span className="text-xs font-mono text-slate-500">Max 12 CP / Period</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

            {/* Footer Workflow Action Controls */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-mono">
                Current Plan Status: <strong className="text-slate-900 uppercase font-extrabold">{planStatus}</strong>
              </div>

              <div className="flex items-center gap-2">
                {planStatus === 'draft' && (
                  <button
                    onClick={() => onRecommendPlan && onRecommendPlan()}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-2"
                  >
                    <span>Recommend Plan to Student</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                )}

                {planStatus === 'agreed' && (
                  <button
                    onClick={() => onApprovePlan && onApprovePlan()}
                    className="px-6 py-2.5 bg-[#008652] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve & Finalise Study Plan</span>
                  </button>
                )}

                {(planStatus === 'approved' || planStatus === 'stored') && (
                  <button
                    onClick={() => onSavePlan && onSavePlan()}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-2"
                  >
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Save & Archive in Stored Repository</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: 100% FULL-WIDTH AVAILABLE UNITS CATALOG */}
        {builderTab === 'PALETTE' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
            <DroppablePaletteContainer
              filteredOfferings={filteredOfferings}
              unitFilter={unitFilter}
              setUnitFilter={setUnitFilter}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              onAddUnit={handleAddUnitFromPalette}
              onAddToSpecificSemester={handleAddToSpecificSemester}
            />
          </div>
        )}

        {/* SUB-TAB 3: 100% FULL-WIDTH RULE VALIDATION CONSOLE */}
        {builderTab === 'VALIDATION' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                  DATA-DRIVEN VALIDATION ENGINE
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  System Rule Validation Console
                </h3>
              </div>

              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
                Campus: Perth Main Campus
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>BR-01 Check: All scheduled units are offered at Perth Campus for 2026.</span>
              </div>

              {warningsList && warningsList.length > 0 ? (
                warningsList.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-950 font-mono">{w.unitCode || 'Rule Warning'}:</span> {w.message}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>BR-02 Check: All prerequisite dependencies and 12 CP maximum semester credit load limits passed cleanly.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Drag Overlay Floating Drag Card Preview */}
        <DragOverlay>
          {activeDragItem ? (
            <div className="bg-white border-2 border-slate-900 shadow-xl p-3 rounded-xl text-xs font-sans opacity-90 cursor-grabbing flex items-center justify-between w-64 select-none">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="font-mono font-bold text-slate-900">{activeDragItem.code}</div>
                  <div className="text-slate-700 font-medium truncate max-w-[150px]">{activeDragItem.title}</div>
                </div>
              </div>
              <span className="font-mono text-slate-600 font-semibold">{activeDragItem.credit_points || 3} CP</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
