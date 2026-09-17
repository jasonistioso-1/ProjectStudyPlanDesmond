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
  Plus,
  User,
  GraduationCap,
  Calendar,
  Search,
  Check
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
  const [unitFilter, setUnitFilter] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [layoutType, setLayoutType] = useState('semester'); // 'semester' | 'trimester'
  const [agreedConfirmed, setAgreedConfirmed] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [showAllCatalogUnits, setShowAllCatalogUnits] = useState(false);

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
    { period_id: 1, name: 'Semester 1', code: 'S1', date_range: '02 Mar – 26 Jun' },
    { period_id: 2, name: 'Semester 2', code: 'S2', date_range: '27 Jul – 20 Nov' }
  ];

  const trimesterPeriods = [
    { period_id: 3, name: 'Trimester 1', code: 'T1', date_range: '05 Jan – 17 Apr' },
    { period_id: 4, name: 'Trimester 2', code: 'T2', date_range: '04 May – 14 Aug' },
    { period_id: 5, name: 'Trimester 3', code: 'T3', date_range: '31 Aug – 11 Dec' }
  ];

  const defaultPeriodList = layoutType === 'trimester' ? trimesterPeriods : semesterPeriods;

  // Data-driven Prerequisite Map & Unit Offering Rules
  const prereqMap = {
    'ICT167': 'ICT159',
    'ICT201': 'ICT158',
    'ICT202': 'ICT159',
    'ICT203': 'ICT167',
    'ICT206': 'ICT167',
    'ICT283': 'ICT167',
    'ICT284': 'ICT158',
    'ICT285': 'ICT159',
    'ICT292': 'ICT158',
    'BSC203': 'ICT158',
    'ICT301': 'ICT292',
    'ICT302': 'ICT201',
    'ICT303': 'ICT202',
    'ICT304': 'ICT203',
    'ICT305': 'ICT202',
    'ICT373': 'ICT283',
    'ICT374': 'ICT283',
    'ICT393': 'ICT284',
    'ICT394': 'ICT285'
  };

  const t3RestrictedUnits = new Set(['ICT302', 'ICT373', 'ICT374', 'ICT303', 'ICT304', 'ICT203', 'ICT206']);
  const s1OnlyUnits = new Set(['ICT158', 'ICT145', 'MAS162', 'ICT201', 'ICT202', 'ICT283', 'ICT301', 'ICT373', 'ICT393']);
  const s2OnlyUnits = new Set(['ICT167', 'ICT169', 'ICT170', 'ICT203', 'ICT206', 'ICT292', 'BSC203', 'ICT304', 'ICT374', 'ICT394']);

  // Complete Warnings List & Unit-level Warning Map
  const warningsByUnit = {};
  const warningsList = [];

  // Merge backend warnings if available
  if (validationResult && validationResult.warnings) {
    validationResult.warnings.forEach(w => {
      warningsList.push(w);
      if (w.unitCode && !warningsByUnit[w.unitCode]) {
        warningsByUnit[w.unitCode] = w.message;
      }
    });
  }

  // Real-time BR-01 Offering & BR-02 Prerequisite checks on planUnits
  planUnits.forEach(unit => {
    const isTri3 = unit.period_id === 5;
    const isS1OrT1 = unit.period_id === 1 || unit.period_id === 3;
    const isS2OrT2 = unit.period_id === 2 || unit.period_id === 4;

    // BR-01 Offering Check
    if (isTri3 && t3RestrictedUnits.has(unit.code)) {
      const msg = `Unit ${unit.code} (${unit.title}) is NOT offered in Tri-Semester 3 (T3) at Singapore Campus.`;
      if (!warningsByUnit[unit.code]) warningsByUnit[unit.code] = msg;
      if (!warningsList.some(w => w.unitCode === unit.code && w.type === 'BR-01_OFFERING_MISMATCH')) {
        warningsList.push({ type: 'BR-01_OFFERING_MISMATCH', severity: 'error', unitCode: unit.code, message: msg });
      }
    } else if (isS2OrT2 && s1OnlyUnits.has(unit.code)) {
      const msg = `Unit ${unit.code} (${unit.title}) is offered ONLY in Semester 1 / Trimester 1 and cannot be taken in this period.`;
      if (!warningsByUnit[unit.code]) warningsByUnit[unit.code] = msg;
      if (!warningsList.some(w => w.unitCode === unit.code && w.type === 'BR-01_OFFERING_MISMATCH')) {
        warningsList.push({ type: 'BR-01_OFFERING_MISMATCH', severity: 'error', unitCode: unit.code, message: msg });
      }
    } else if (isS1OrT1 && s2OnlyUnits.has(unit.code)) {
      const msg = `Unit ${unit.code} (${unit.title}) is offered ONLY in Semester 2 / Trimester 2 and cannot be taken in this period.`;
      if (!warningsByUnit[unit.code]) warningsByUnit[unit.code] = msg;
      if (!warningsList.some(w => w.unitCode === unit.code && w.type === 'BR-01_OFFERING_MISMATCH')) {
        warningsList.push({ type: 'BR-01_OFFERING_MISMATCH', severity: 'error', unitCode: unit.code, message: msg });
      }
    }

    // BR-02 Prerequisite Check
    const prereqCode = prereqMap[unit.code];
    if (prereqCode) {
      const isCompleted = completedUnitCodes.has(prereqCode);
      const isScheduledPrior = planUnits.some(other => {
        if (other.code !== prereqCode) return false;
        if (other.year_level < unit.year_level) return true;
        if (other.year_level === unit.year_level && (other.period_id || 0) < (unit.period_id || 0)) return true;
        return false;
      });

      if (!isCompleted && !isScheduledPrior) {
        const msg = `Unit ${unit.code} requires prerequisite ${prereqCode}, which is neither completed in history nor scheduled in a prior teaching period.`;
        if (!warningsByUnit[unit.code]) warningsByUnit[unit.code] = msg;
        if (!warningsList.some(w => w.unitCode === unit.code && w.type === 'BR-02_PREREQUISITE_UNMET')) {
          warningsList.push({ type: 'BR-02_PREREQUISITE_UNMET', severity: 'error', unitCode: unit.code, prereqCode, message: msg });
        }
      }
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

  const scheduledCodesSet = new Set(planUnits.map(pu => pu.code));

  // Filtered available offerings
  const filteredOfferings = catalogUnits.filter(unit => {
    const isAlreadyScheduled = scheduledCodesSet.has(unit.code);
    if (!showAllCatalogUnits && isAlreadyScheduled) return false;
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

  // Student Info details
  const stName = student ? `${student.first_name || 'Alex'} ${student.last_name || 'Mercer'}` : 'Alex Mercer';
  const stNumber = student ? student.student_number : 'PT3-2026-001';
  const stCourse = student ? (student.course_code || 'PT3-BSIT-01') : 'PT3-BSIT-01';

  // Governance Workflow Stepper Steps
  const workflowSteps = [
    { id: 'draft', label: '1. Draft Plan', active: planStatus === 'draft' || planStatus === 'recommended' || planStatus === 'agreed' || planStatus === 'approved' },
    { id: 'recommended', label: '2. Recommended', active: planStatus === 'recommended' || planStatus === 'agreed' || planStatus === 'approved' },
    { id: 'agreed', label: '3. Student Agreed', active: planStatus === 'agreed' || planStatus === 'approved' },
    { id: 'approved', label: '4. Final Approved', active: planStatus === 'approved' }
  ];

  // =========================================================================
  // RENDER: STUDENT VIEW (READ-ONLY REVIEW & SIGN-OFF)
  // =========================================================================
  if (!isChair) {
    const isAlreadyAgreed = planStatus === 'agreed' || planStatus === 'approved' || planStatus === 'stored';

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs font-sans max-w-[1440px] mx-auto space-y-6 transition-colors">
        {/* Student View Banner Header */}
        <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold bg-amber-600 text-white px-2.5 py-0.5 rounded uppercase tracking-wide">
              STUDENT AGREEMENT & SIGN-OFF PORTAL
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-amber-100 tracking-tight flex items-center gap-2 mt-1.5">
              <FileCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              Proposed Study Plan Review — {stCourse}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-normal">
              Please review the unit sequence proposed by your Academic Chair. Check your credit load balance before digitally signing below.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Current Status</span>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase">{planStatus}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Planned Load</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{totalCP} / 72 CP</span>
            </div>
          </div>
        </div>

        {/* Read-Only 3-Year Grid Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {years.map(y => (
            <div key={y.level} className="bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                  {y.yearName}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Max 12 CP / Sem</span>
              </div>

              {defaultPeriodList.map(p => {
                const sUnits = getSemesterUnits(y.level, p.period_id);
                const semCP = sUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0);

                return (
                  <div key={p.period_id} className="mb-3 last:mb-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-2xs">
                    <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                      <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {semCP} / 12 CP
                      </span>
                    </div>

                    {sUnits.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-2 font-mono">Empty slot</p>
                    ) : (
                      <div className="space-y-1.5">
                        {sUnits.map(u => (
                          <div
                            key={u.unit_id || u.code}
                            className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-md font-medium text-slate-800 dark:text-slate-200"
                          >
                            <span className="font-mono font-extrabold text-slate-900 dark:text-white">{u.code}</span>
                            <span className="text-slate-700 dark:text-slate-300 text-xs truncate max-w-[140px] ml-2 mr-auto">{u.title}</span>
                            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 tabular-nums shrink-0 font-semibold">{u.credit_points || 3} CP</span>
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
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-6 max-w-2xl mx-auto shadow-2xs text-center space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Digital Sign-off Agreement</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            By signing below, you agree to the recommended unit sequence and acknowledge that changes to your study plan require Academic Chair re-approval.
          </p>

          <label className="flex items-start justify-center gap-3 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 select-none text-left bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
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
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 cursor-default'
                  : agreedConfirmed
                  ? 'bg-slate-900 dark:bg-red-700 hover:bg-slate-800 dark:hover:bg-red-800 text-white shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
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
  // RENDER: ACADEMIC CHAIR VIEW (SIDE-BY-SIDE SIDEBAR + CANVAS LAYOUT)
  // =========================================================================
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="font-sans max-w-[1440px] mx-auto space-y-5">
        
        {/* TOP: WORKFLOW STATUS STEPPER BAR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Workflow Status
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-1 justify-center md:justify-start">
            {workflowSteps.map((step, i) => {
              const isCurrent = (planStatus === 'draft' && step.id === 'draft') ||
                (planStatus === 'recommended' && step.id === 'recommended') ||
                (planStatus === 'agreed' && step.id === 'agreed') ||
                (planStatus === 'approved' && step.id === 'approved');

              return (
                <React.Fragment key={step.id}>
                  {i > 0 && <span className="text-slate-300 dark:text-slate-700 text-xs font-bold">›</span>}
                  <div
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      isCurrent
                        ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white border-slate-900 dark:border-red-600 shadow-2xs'
                        : step.active
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{step.label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Stepper Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            {planStatus === 'draft' && (
              <button
                onClick={() => onRecommendPlan && onRecommendPlan()}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
              >
                <span>Recommend</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            )}

            {planStatus === 'agreed' && (
              <button
                onClick={() => onApprovePlan && onApprovePlan()}
                className="px-3.5 py-1.5 bg-[#008652] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Final Approve</span>
              </button>
            )}
          </div>
        </div>

        {/* 2-COLUMN MAIN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: 4/12 WIDTH (~1/3 SIDEBAR) - AVAILABLE UNIT OFFERINGS & VALIDATION CONSOLE */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Box 1: Available Unit Offerings Palette */}
            <DroppablePaletteContainer
              filteredOfferings={filteredOfferings}
              unitFilter={unitFilter}
              setUnitFilter={setUnitFilter}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              showAllCatalogUnits={showAllCatalogUnits}
              setShowAllCatalogUnits={setShowAllCatalogUnits}
              totalCatalogCount={catalogUnits.length}
              scheduledCodesSet={scheduledCodesSet}
              onAddUnit={handleAddUnitFromPalette}
              onAddToSpecificSemester={handleAddToSpecificSemester}
            />

            {/* Box 2: Rule Engine Validation Console */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3 transition-colors">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white font-heading">
                    Validation Summary
                  </h3>
                </div>
                <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Singapore Campus
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {warningsList && warningsList.length > 0 ? (
                  warningsList.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs font-medium rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">{w.unitCode ? `${w.unitCode}: ` : ''}</span>{w.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-900 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>All prerequisite, unit offering, and 12 CP load rules satisfied!</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 8/12 WIDTH (~2/3 CANVAS) - 3-YEAR STUDY PLAN GRID */}
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-5 transition-colors">
              
              {/* Grid Canvas Header & Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-heading">
                    <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    3-Year Study Plan Grid
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                    Maximum 12 CP per semester limit strictly enforced.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Semester vs Trimester Layout Switcher */}
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 text-xs">
                    <button
                      onClick={() => setLayoutType('semester')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        layoutType === 'semester'
                          ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Semester
                    </button>
                    <button
                      onClick={() => setLayoutType('trimester')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        layoutType === 'trimester'
                          ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Trimester
                    </button>
                  </div>

                  {onOpenOfficialDocument && (
                    <button
                      onClick={onOpenOfficialDocument}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-800 dark:border-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Export Document</span>
                    </button>
                  )}

                  <button
                    onClick={onSavePlan}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    onClick={handleClearPlan}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-xs transition-colors"
                    title="Clear all units from study plan"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* 3-Year Drag & Drop Grid */}
              <div className="space-y-5">
                {years.map(yearObj => {
                  let yearTagStyle = 'bg-slate-900 dark:bg-slate-800 text-white';

                  return (
                    <div key={yearObj.level} className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-2xs space-y-3 transition-colors">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className={`text-xs font-extrabold font-heading px-3 py-1 rounded-lg shadow-xs ${yearTagStyle}`}>
                          {yearObj.yearName}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Max 12 CP / Period
                        </span>
                      </div>

                      <div className={`grid grid-cols-1 ${layoutType === 'trimester' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
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

              {/* Canvas Bottom Summary */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>Total Planned Credit Points: <strong className="text-slate-900 dark:text-white font-extrabold">{totalCP} / 72 CP</strong></span>
                <span className="uppercase font-bold text-emerald-600 dark:text-emerald-400">Status: {planStatus}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Drag Overlay Floating Drag Card Preview */}
        <DragOverlay>
          {activeDragItem ? (
            <div className="bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 shadow-xl p-3 rounded-xl text-xs font-sans opacity-90 cursor-grabbing flex items-center justify-between w-64 select-none">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">{activeDragItem.code}</div>
                  <div className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">{activeDragItem.title}</div>
                </div>
              </div>
              <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{activeDragItem.credit_points || 3} CP</span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
