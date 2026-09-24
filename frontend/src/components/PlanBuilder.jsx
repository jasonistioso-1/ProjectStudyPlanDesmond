import React, { useState, useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  DragOverlay
} from '@dnd-kit/core';
import DroppablePeriod from './DroppablePeriod';
import DroppablePaletteContainer from './DroppablePaletteContainer';
import SignaturePad from './SignaturePad';
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
  Check,
  Zap,
  RotateCcw,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  FileText
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
  onOpenOfficialDocument,
  onOpenStudentSelectModal
}) {
  const isChair = activeRole === 'chair';
  const [unitFilter, setUnitFilter] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [layoutType, setLayoutType] = useState('trimester'); // Default to Singapore Trimester Focus
  const [activeYearLevel, setActiveYearLevel] = useState(1); // 1: Year 1 (2026), 2: Year 2 (2027), 3: Year 3 (2028)
  const [viewMode, setViewMode] = useState('single'); // 'single' = Single Year Focus Slide, 'all' = All Years Grid
  const [agreedConfirmed, setAgreedConfirmed] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [showAllCatalogUnits, setShowAllCatalogUnits] = useState(false);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  );

  // Completed & Attempted (Failed) unit codes from student history
  const completedUnitCodes = new Set(
    (history || []).filter(h => h.status === 'completed').map(h => h.unit_code)
  );
  const attemptedUnitCodes = new Set(
    (history || []).filter(h => h.status === 'attempted').map(h => h.unit_code)
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

  // Data-driven Prerequisite Map & Unit Offering Rules (Derived dynamically from seed/sample catalogUnits data)
  const prereqMap = useMemo(() => {
    const map = {
      'ICT167': 'ICT159', 'ICT201': 'ICT158', 'ICT202': 'ICT159', 'ICT203': 'ICT167',
      'ICT206': 'ICT167', 'ICT283': 'ICT167', 'ICT284': 'ICT158', 'ICT285': 'ICT159',
      'ICT292': 'ICT158', 'BSC203': 'ICT158', 'ICT301': 'ICT292', 'ICT302': 'ICT201',
      'ICT303': 'ICT202', 'ICT304': 'ICT203', 'ICT305': 'ICT202', 'ICT373': 'ICT283',
      'ICT374': 'ICT283', 'ICT393': 'ICT284', 'ICT394': 'ICT285'
    };
    (catalogUnits || []).forEach(u => {
      if (u.code) {
        if (u.prerequisite_code) map[u.code] = u.prerequisite_code;
        else if (u.prereq_code) map[u.code] = u.prereq_code;
      }
    });
    return map;
  }, [catalogUnits]);

  const t3RestrictedUnits = useMemo(() => {
    const set = new Set(['ICT302', 'ICT373', 'ICT374', 'ICT303', 'ICT304', 'ICT203', 'ICT206']);
    (catalogUnits || []).forEach(u => {
      if (u.code && u.restricted_t3) set.add(u.code);
    });
    return set;
  }, [catalogUnits]);

  const s1OnlyUnits = useMemo(() => {
    const set = new Set(['ICT158', 'ICT145', 'MAS162', 'ICT201', 'ICT202', 'ICT283', 'ICT301', 'ICT373', 'ICT393']);
    (catalogUnits || []).forEach(u => {
      if (u.code && u.offering_period === 'S1') set.add(u.code);
    });
    return set;
  }, [catalogUnits]);

  const s2OnlyUnits = useMemo(() => {
    const set = new Set(['ICT167', 'ICT169', 'ICT170', 'ICT203', 'ICT206', 'ICT292', 'BSC203', 'ICT304', 'ICT374', 'ICT394']);
    (catalogUnits || []).forEach(u => {
      if (u.code && u.offering_period === 'S2') set.add(u.code);
    });
    return set;
  }, [catalogUnits]);

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

    // BR-02 Prerequisite & Failed Unit Check
    const prereqCode = prereqMap[unit.code];
    if (prereqCode) {
      const isCompleted = completedUnitCodes.has(prereqCode);
      const isScheduledPrior = planUnits.some(other => {
        if (other.code !== prereqCode) return false;
        if (other.year_level < unit.year_level) return true;
        if (other.year_level === unit.year_level && (other.period_id || 0) < (unit.period_id || 0)) return true;
        return false;
      });

      if (attemptedUnitCodes.has(prereqCode) && !isCompleted && !isScheduledPrior) {
        const msg = `Prerequisite Subject ${prereqCode} was FAILED in student history. You must re-enroll and pass ${prereqCode} before taking ${unit.code}.`;
        if (!warningsByUnit[unit.code]) warningsByUnit[unit.code] = msg;
        if (!warningsList.some(w => w.unitCode === unit.code && w.type === 'BR-02_PREREQUISITE_FAILED')) {
          warningsList.push({ type: 'BR-02_PREREQUISITE_FAILED', severity: 'error', unitCode: unit.code, prereqCode, message: msg });
        }
      } else if (!isCompleted && !isScheduledPrior) {
        const msg = `Unit ${unit.code} requires prerequisite ${prereqCode}, which is neither completed in history nor scheduled in a prior teaching period.`;
        if (!warningsByUnit[unit.code]) warningsByUnit[unit.code] = msg;
        if (!warningsList.some(w => w.unitCode === unit.code && w.type === 'BR-02_PREREQUISITE_UNMET')) {
          warningsList.push({ type: 'BR-02_PREREQUISITE_UNMET', severity: 'error', unitCode: unit.code, prereqCode, message: msg });
        }
      }
    }
  });

  // BR-04 Credit Load Validation (> 12 CP per period)
  const periodTotalsMap = {};
  planUnits.forEach(u => {
    const key = `y${u.year_level}_p${u.period_id}`;
    periodTotalsMap[key] = (periodTotalsMap[key] || 0) + Number(u.credit_points || 3);
  });

  Object.entries(periodTotalsMap).forEach(([key, totalPeriodCP]) => {
    if (totalPeriodCP > 12) {
      const parts = key.split('_p');
      const yLvl = parts[0].replace('y', '');
      const pId = Number(parts[1]);
      const pName = pId === 1 ? 'Semester 1' : pId === 2 ? 'Semester 2' : pId === 3 ? 'Trimester 1' : pId === 4 ? 'Trimester 2' : 'Trimester 3';
      const msg = `Year ${yLvl} ${pName} load (${totalPeriodCP} CP) EXCEEDS the maximum allowed 12 CP limit! Please reduce or reassign units.`;
      
      planUnits.forEach(u => {
        if (String(u.year_level) === String(yLvl) && Number(u.period_id) === pId) {
          if (!warningsByUnit[u.code]) warningsByUnit[u.code] = msg;
        }
      });
      if (!warningsList.some(w => w.type === 'BR-04_CREDIT_LOAD_EXCEEDED' && w.message === msg)) {
        warningsList.push({ type: 'BR-04_CREDIT_LOAD_EXCEEDED', severity: 'warning', message: msg });
      }
    }
  });

  // Handle Drag Start
  const handleDragStart = (event) => {
    const activeId = String(event.active.id);
    if (activeId.startsWith('palette_')) {
      const code = activeId.replace('palette_', '');
      const unit = catalogUnits.find(u => String(u.unit_id || u.code) === code || u.code === code);
      if (unit) setActiveDragItem(unit);
    } else {
      const unit = planUnits.find(u => String(u.unit_id || u.code) === activeId || u.code === activeId);
      if (unit) {
        setActiveDragItem(unit);
      } else {
        const code = activeId;
        const catalogUnit = catalogUnits.find(u => String(u.unit_id || u.code) === code || u.code === code);
        if (catalogUnit) setActiveDragItem(catalogUnit);
      }
    }
  };

  // Handle Drag End
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    let targetYear = null;
    let targetPeriod = null;

    if (overId.startsWith('year_') && overId.includes('_period_')) {
      const clean = overId.replace('year_', '');
      const parts = clean.split('_period_');
      targetYear = parseInt(parts[0], 10);
      targetPeriod = parseInt(parts[1], 10);
    } else if (overId.includes('_p')) {
      const clean = overId.replace('year_', '').replace('y', '');
      const parts = clean.split('_p');
      targetYear = parseInt(parts[0], 10);
      targetPeriod = parseInt(parts[1], 10);
    } else if (overId.startsWith('year_')) {
      targetYear = parseInt(overId.replace('year_', ''), 10);
      targetPeriod = layoutType === 'trimester' ? 3 : 1;
    } else {
      const overPlanUnit = planUnits.find(u => String(u.unit_id || u.code) === overId || u.code === overId);
      if (overPlanUnit) {
        targetYear = overPlanUnit.year_level;
        targetPeriod = overPlanUnit.period_id;
      }
    }

    if (!targetYear || !targetPeriod || isNaN(targetYear) || isNaN(targetPeriod)) return;

    if (activeId.startsWith('palette_')) {
      const code = activeId.replace('palette_', '');
      const unit = catalogUnits.find(u => String(u.unit_id || u.code) === code || u.code === code);
      if (unit) {
        const exists = planUnits.some(u => u.code === unit.code);
        let updated;
        if (exists) {
          updated = planUnits.map(u =>
            u.code === unit.code ? { ...u, year_level: targetYear, period_id: targetPeriod } : u
          );
        } else {
          updated = [
            ...planUnits,
            {
              ...unit,
              year_level: targetYear,
              period_id: targetPeriod,
              sequence_order: planUnits.length + 1
            }
          ];
        }
        setPlanUnits(updated);
        if (onValidate) onValidate(updated);
      }
    } else {
      // Dragging an existing unit card within the plan canvas to reposition
      const existingUnit = planUnits.find(u => String(u.unit_id || u.code) === activeId || u.code === activeId);
      if (existingUnit) {
        const updated = planUnits.map(u =>
          (String(u.unit_id || u.code) === activeId || u.code === existingUnit.code)
            ? { ...u, year_level: targetYear, period_id: targetPeriod }
            : u
        );
        setPlanUnits(updated);
        if (onValidate) onValidate(updated);
      }
    }
  };

  // Add unit from palette to Plan
  const handleAddUnitFromPalette = (unit) => {
    if (planUnits.some(u => u.code === unit.code)) return;

    const defaultPeriod = defaultPeriodList[0] ? defaultPeriodList[0].period_id : 3;
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

  // Preset 3-Year Singapore Trimester Fast-Track Plan (72 CP across 3 Years)
  const handleGeneratePresetPlan = () => {
    const isNewStudent = !history || history.length === 0;

    const singaporeStandardUnits = [
      { code: 'ICT100', title: 'Transition to IT', credit_points: 3, year_level: 1, period_id: 3 },
      { code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, year_level: 1, period_id: 3 },
      { code: 'ICT158', title: 'Intro to Computer Systems', credit_points: 3, year_level: 1, period_id: 3 },

      { code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, year_level: 1, period_id: 4 },
      { code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, year_level: 1, period_id: 4 },
      { code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, year_level: 1, period_id: 4 },

      { code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, year_level: 1, period_id: 5 },
      { code: 'ICT145', title: 'Python Programming', credit_points: 3, year_level: 1, period_id: 5 },

      { code: 'ICT201', title: 'IT Project Management', credit_points: 3, year_level: 2, period_id: 3 },
      { code: 'ICT202', title: 'Data Analytics & Processing', credit_points: 3, year_level: 2, period_id: 3 },
      { code: 'ICT285', title: 'Databases', credit_points: 3, year_level: 2, period_id: 3 },

      { code: 'ICT203', title: 'Software Architecture & Design', credit_points: 3, year_level: 2, period_id: 4 },
      { code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, year_level: 2, period_id: 4 },
      { code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, year_level: 2, period_id: 4 },

      { code: 'ICT206', title: 'Distributed Systems', credit_points: 3, year_level: 2, period_id: 5 },
      { code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, year_level: 2, period_id: 5 },
      { code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, year_level: 2, period_id: 5 },

      { code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, year_level: 3, period_id: 3 },
      { code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, year_level: 3, period_id: 3 },
      { code: 'ICT305', title: 'Data Visualisation', credit_points: 3, year_level: 3, period_id: 3 },

      { code: 'ICT303', title: 'Cloud Infrastructure & DevOps', credit_points: 3, year_level: 3, period_id: 4 },
      { code: 'ICT304', title: 'Enterprise Software Systems', credit_points: 3, year_level: 3, period_id: 4 },
      { code: 'ICT374', title: 'Operating Systems', credit_points: 3, year_level: 3, period_id: 4 },

      { code: 'ICT373', title: 'Software Architecture', credit_points: 3, year_level: 3, period_id: 5 }
    ];

    const completedCodesSet = new Set(
      (history || []).filter(h => h.status === 'completed').map(h => h.unit_code)
    );

    const generatedUnits = singaporeStandardUnits.filter(u => {
      if (!isNewStudent && completedCodesSet.has(u.code)) {
        return false;
      }
      return true;
    }).map(u => {
      const match = catalogUnits.find(c => c.code === u.code);
      return {
        unit_id: match?.unit_id || Math.floor(Math.random() * 1000) + 100,
        code: u.code,
        title: match?.title || u.title,
        credit_points: match?.credit_points || u.credit_points || 3,
        level: match?.level || (u.year_level === 1 ? 100 : u.year_level === 2 ? 200 : 300),
        year_level: u.year_level,
        period_id: u.period_id
      };
    });

    setPlanUnits(generatedUnits);
    if (onValidate) onValidate(generatedUnits);
  };

  // Clear all units from plan (Reset to 0 CP)
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
        <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-amber-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs font-sans">
              STUDENT AGREEMENT & SIGN-OFF PORTAL
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-amber-100 tracking-tight flex items-center gap-2 mt-2 font-heading">
              <FileCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              Proposed Study Plan Review ({stCourse})
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-normal leading-relaxed">
              Please review the unit sequence proposed by your Academic Chair. Check your credit load balance before digitally signing below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenStudentSelectModal && (
              <button
                onClick={onOpenStudentSelectModal}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-amber-300/80 dark:border-slate-700 px-3.5 py-2 rounded-xl text-left shadow-2xs flex items-center gap-2.5 transition-all shrink-0"
                title="Click to view/switch between registered sample database students"
              >
                <User className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block font-sans">Student Profile</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 font-sans">
                    {stName}
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold underline">(Change)</span>
                  </span>
                </div>
              </button>
            )}
            {onOpenOfficialDocument && (
              <button
                onClick={onOpenOfficialDocument}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 shrink-0"
                title="Export official Study Plan as PDF or PNG image"
              >
                <BookOpen className="w-4 h-4 text-amber-200" />
                <span>Export PDF / Image</span>
              </button>
            )}
            <div className="bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-slate-700 px-3.5 py-2 rounded-xl text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block font-sans">Current Status</span>
              <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wide font-sans">{planStatus}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-slate-700 px-3.5 py-2 rounded-xl text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block font-sans">Planned Load</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white font-sans tabular-nums">{totalCP} / 72 CP</span>
            </div>
          </div>
        </div>

        {/* Student System User Guide & SOP Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4.5 rounded-2xl space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white font-heading uppercase tracking-wider">
                Student SOP & Review Procedure Guide
              </h3>
            </div>
            <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Student Workflow SOP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white font-heading text-[11px]">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                Review Proposed Sequence
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-normal">
                Review the unit sequence for Trimester 1, 2, 3 across Year 1–3 proposed by your Academic Chair.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white font-heading text-[11px]">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                Verify Load & Prerequisites
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-normal">
                Ensure maximum 12 CP load per trimester (72 CP degree target) and verify prerequisite requirements.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white font-heading text-[11px]">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                Digital Sign-Off Confirmation
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-normal">
                Tick the digital confirmation box and click <strong>Sign & Agree</strong> (Status: <em>STUDENT AGREED</em>).
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white font-heading text-[11px]">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">4</span>
                Export Official Document
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-normal">
                Once approved by the Academic Chair, click <strong>Export PDF / Image</strong> to view or download your official document.
              </p>
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

        {/* Student Digital Signature Pad Component */}
        <SignaturePad
          student={student}
          planStatus={planStatus}
          planUnitsCount={planUnits.length}
          isAlreadyAgreed={isAlreadyAgreed}
          onAgreePlan={onAgreePlan}
          currentSignature={currentPlan?.studentSignature}
        />
      </div>
    );
  }

  // =========================================================================
  // RENDER: ACADEMIC CHAIR VIEW (SIDE-BY-SIDE SIDEBAR + CANVAS LAYOUT)
  // =========================================================================
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={(args) => {
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) return pointerCollisions;
        return rectIntersection(args);
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="font-sans max-w-[1440px] mx-auto space-y-5">

        {/* TOP: EXECUTIVE GOVERNANCE ADVISORY BAR */}
        {(!isChair || (student && student.account_category !== 'admin' && student.student_id !== 0)) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors font-sans">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Plan Status:
              </span>
              <span className={`px-3 py-0.5 rounded-xl text-xs font-bold uppercase tracking-wider font-sans border ${
                planStatus === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' :
                planStatus === 'agreed' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
                planStatus === 'recommended' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700' :
                'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}>
                {planStatus === 'draft' ? 'Drafting Sequence' : planStatus}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal hidden lg:inline">
                {planStatus === 'draft' && 'Structure units below and click Recommend to Student at the bottom when ready.'}
                {planStatus === 'recommended' && 'Recommended to student. Awaiting student digital sign-off.'}
                {planStatus === 'agreed' && 'Student has signed. Academic Chair can grant Final Approval below.'}
                {planStatus === 'approved' && 'Plan officially approved and archived in repository.'}
              </span>
            </div>

            <button
              onClick={() => setShowWorkflowGuide(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                showWorkflowGuide
                  ? 'bg-red-700 text-white border border-red-800 shadow-xs'
                  : 'bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-800'
              }`}
              title="Toggle System Workflow & User Guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showWorkflowGuide ? 'Hide User Guide' : 'System User Guide'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showWorkflowGuide ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}


        {/* Embedded Role-Tailored System Workflow & User Guide Panel */}
        {showWorkflowGuide && (
          <div className="bg-white dark:bg-slate-900 border-2 border-red-500/80 dark:border-red-600/80 rounded-2xl p-6 shadow-xl space-y-4 font-sans text-slate-900 dark:text-white animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center justify-center font-bold">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                    {isChair ? 'Academic Chair System Workflow & SOP' : 'Student Study Plan Review & Sign-Off Guide'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                    {isChair ? 'Step-by-step operating guide for structuring, validating, and approving student study plans.' : 'Step-by-step guide for reviewing recommended subjects and digitally signing your study plan.'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-sans border ${isChair
                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                }`}>
                {isChair ? 'Academic Chair Role' : 'Student Role'}
              </span>
            </div>

            {isChair ? (
              /* ACADEMIC CHAIR WORKFLOW GUIDE */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs font-sans">
                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-red-700 dark:text-red-400 flex items-center gap-1.5 font-heading">
                    <UserCheck className="w-4 h-4 shrink-0" /> 1. Select Target Student
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Click <strong>Select Student</strong> to load a student profile (Alex Mercer, Sarah Jenkins, Michael Chang, Emily Watson) to manage.
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-red-700 dark:text-red-400 flex items-center gap-1.5 font-heading">
                    <Layers className="w-4 h-4 shrink-0" /> 2. Drag & Drop / Auto Add
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    <strong>Drag & drop</strong> units into Year 1, 2, or 3 Trimesters (T1, T2, T3), or click <strong>+ Add Unit</strong> for automated trimester placement.
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-red-700 dark:text-red-400 flex items-center gap-1.5 font-heading">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> 3. Rule Validation Check
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Verify validation rules on the left console (BR-01 Singapore Trimester availability & BR-02 Prerequisite progression).
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-red-700 dark:text-red-400 flex items-center gap-1.5 font-heading">
                    <ShieldCheck className="w-4 h-4 shrink-0" /> 4. Recommend & Approve
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Click <strong>Recommend to Student</strong>. After student digital sign-off, click <strong>Final Approve Plan</strong> to archive.
                  </p>
                </div>
              </div>
            ) : (
              /* STUDENT WORKFLOW GUIDE */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> 1. Review Recommended Plan
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Inspect the scheduled subjects across Year 1, Year 2, and Year 3 Trimesters prepared for your degree major by the Academic Chair.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 2. Digital Sign-Off
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Check the confirmation box acknowledging credit load rules and click <strong>Agree & Sign-Off Study Plan</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> 3. Export Certified Document
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Click <strong>Export Document</strong> to generate or print your official certified 72 CP Study Plan document for university record.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2-COLUMN MAIN WORKSPACE */}
        {isChair && (!student || student.account_category === 'admin' || student.student_id === 0) ? (
          <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-amber-300 dark:border-amber-900/60 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs font-sans animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-xs">
              <UserCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                Plan Builder Workspace Locked
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                No target student profile selected. Please select a student profile from the directory (e.g. Alex Mercer, Sarah Jenkins, Michael Chang, etc.) to view and structure their 72 CP study plan.
              </p>
            </div>
            <button
              onClick={onOpenStudentSelectModal}
              className="mt-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 font-sans cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Select Student Profile to Manage</span>
            </button>
          </div>
        ) : (
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
                layoutType={layoutType}
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
                      <Layers className="w-4 h-4 text-red-600 dark:text-red-400" />
                      Official 3-Year Study Plan Grid
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans font-medium">
                      Structure 72 CP unit sequences across Year 1, Year 2, and Year 3 trimesters.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">

                    {onOpenOfficialDocument && (
                      <button
                        onClick={onOpenOfficialDocument}
                        className="px-3.5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-800 dark:border-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Export Document</span>
                      </button>
                    )}

                    <button
                      onClick={onSavePlan}
                      className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Save Draft</span>
                    </button>

                    <button
                      onClick={handleClearPlan}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs transition-colors"
                      title="Clear all units from study plan"
                    >
                      Clear Canvas
                    </button>
                  </div>
                </div>

                {/* Year Slide Navigation Control Bar */}
                <div className="bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs font-sans">
                  
                  {/* Left & Right Slide Controls & Year Tabs */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('single');
                        setActiveYearLevel(prev => (typeof prev === 'number' && prev > 1 ? prev - 1 : 1));
                      }}
                      disabled={viewMode === 'single' && activeYearLevel === 1}
                      className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                        viewMode === 'single' && activeYearLevel === 1
                          ? 'opacity-40 cursor-not-allowed bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 border-transparent'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs cursor-pointer active:scale-95'
                      }`}
                      title="Slide to Previous Academic Year"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {years.map(y => {
                      const isActive = viewMode === 'single' && activeYearLevel === y.level;
                      const yearCP = planUnits
                        .filter(u => u.year_level === y.level)
                        .reduce((sum, u) => sum + Number(u.credit_points || 3), 0);

                      return (
                        <button
                          key={y.level}
                          type="button"
                          onClick={() => {
                            setViewMode('single');
                            setActiveYearLevel(y.level);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                            isActive
                              ? 'bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white shadow-xs font-heading'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{y.yearName}</span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {yearCP} CP
                          </span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('single');
                        setActiveYearLevel(prev => (typeof prev === 'number' && prev < 3 ? prev + 1 : 3));
                      }}
                      disabled={viewMode === 'single' && activeYearLevel === 3}
                      className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                        viewMode === 'single' && activeYearLevel === 3
                          ? 'opacity-40 cursor-not-allowed bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 border-transparent'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs cursor-pointer active:scale-95'
                      }`}
                      title="Slide to Next Academic Year"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mode Switcher: Year Slide Mode vs View All Years */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs shrink-0 font-sans shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setViewMode('single')}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        viewMode === 'single'
                          ? 'bg-red-700 text-white dark:bg-red-700 dark:text-white font-heading shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Year Slide Focus
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        viewMode === 'all'
                          ? 'bg-red-700 text-white dark:bg-red-700 dark:text-white font-heading shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      View All 3 Years
                    </button>
                  </div>
                </div>

                {/* Drag & Drop Year Grid Canvas */}
                <div className="space-y-5">
                  {(viewMode === 'all' ? years : years.filter(y => y.level === activeYearLevel)).map(yearObj => {
                    let yearTagStyle = 'bg-slate-900 dark:bg-slate-800 text-white';

                    return (
                      <div
                        key={yearObj.level}
                        className={`bg-white dark:bg-slate-900 border transition-all rounded-3xl p-5 md:p-6 shadow-sm space-y-4 ${
                          viewMode === 'single'
                            ? 'border-slate-300 dark:border-slate-700/80 ring-1 ring-slate-200 dark:ring-slate-800 animate-in fade-in slide-in-from-right-3 duration-300'
                            : 'border-slate-200/90 dark:border-slate-800'
                        }`}
                      >

                        {/* Year Block Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-extrabold font-heading text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                              <span>{yearObj.yearName}</span>
                            </span>

                            {/* Active Official Trimester Layout & Inactive Semester Layout (Out of Scope for this Build) */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-0.5 text-xs font-sans">
                              <button
                                type="button"
                                className="px-3 py-1 rounded-lg text-xs font-extrabold bg-red-700 text-white dark:bg-red-700 dark:text-white shadow-2xs font-heading flex items-center gap-1.5 cursor-default"
                                title="Active Official Layout: 3 Trimesters per year"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Trimester Layout</span>
                              </button>

                              <button
                                type="button"
                                disabled
                                className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 opacity-60 cursor-not-allowed text-slate-400 dark:text-slate-500"
                                title="Semester views can remain in the UI as inactive/untouched layouts for future scalability, but are out of scope for this build."
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>Semester Layout</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                  Inactive
                                </span>
                              </button>
                            </div>
                          </div>

                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-2.5 py-0.5 rounded-md font-mono self-start sm:self-center">
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

                        {/* Slide Left / Right Bottom Navigation Bar in Single Year Focus Mode */}
                        {viewMode === 'single' && (
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800 font-sans text-xs">
                            <button
                              type="button"
                              onClick={() => setActiveYearLevel(prev => Math.max(1, prev - 1))}
                              disabled={activeYearLevel === 1}
                              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                                activeYearLevel === 1
                                  ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800/50'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs active:scale-95'
                              }`}
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>{activeYearLevel > 1 ? `Previous (${years[activeYearLevel - 2].yearName})` : 'Previous Year'}</span>
                            </button>

                            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium font-sans">
                              Showing {yearObj.yearName} • Slide {activeYearLevel} of 3
                            </span>

                            <button
                              type="button"
                              onClick={() => setActiveYearLevel(prev => Math.min(3, prev + 1))}
                              disabled={activeYearLevel === 3}
                              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                                activeYearLevel === 3
                                  ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800/50'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs active:scale-95'
                              }`}
                            >
                              <span>{activeYearLevel < 3 ? `Next (${years[activeYearLevel].yearName})` : 'Next Year'}</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Canvas Bottom Executive Governance & Recommendation Footer */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
                  
                  {/* Left Side: Credit Points Progress Meter & Status */}
                  <div className="space-y-1.5 flex-1 max-w-md">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-heading">
                        <Layers className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        <span>Total Planned Load:</span>
                        <strong className="text-red-700 dark:text-red-400 text-sm font-black font-mono">{totalCP} / 72 CP</strong>
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-sans border ${
                        planStatus === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' :
                        planStatus === 'agreed' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700' :
                        planStatus === 'recommended' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}>
                        STATUS: {planStatus === 'draft' ? 'DRAFTING' : planStatus.toUpperCase()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="h-full transition-all duration-300 bg-gradient-to-r from-red-600 via-rose-600 to-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((totalCP / 72) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Right Side: Primary Recommend to Student / Approve Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-sans">
                    <button
                      onClick={handleClearPlan}
                      className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                      title="Clear all units (Reset to 0 CP)"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset Canvas</span>
                    </button>

                    <button
                      onClick={onSavePlan}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-800 dark:border-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Save className="w-4 h-4 text-emerald-400" />
                      <span>Save Draft</span>
                    </button>

                    {isChair ? (
                      <>
                        {(planStatus === 'draft' || planStatus === 'recommended') && (
                          <button
                            onClick={() => onRecommendPlan && onRecommendPlan()}
                            className="px-6 py-2.5 bg-gradient-to-r from-red-700 via-red-600 to-rose-700 hover:from-red-800 hover:via-red-700 hover:to-rose-800 text-white rounded-xl font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 font-heading"
                          >
                            <span>{planStatus === 'recommended' ? 'Update & Re-Recommend' : 'Recommend to Student'}</span>
                            <ArrowRight className="w-4 h-4 text-rose-200" />
                          </button>
                        )}

                        {planStatus === 'agreed' && (
                          <button
                            onClick={() => onApprovePlan && onApprovePlan()}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-xl font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 font-heading"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-200" />
                            <span>Final Approve Plan</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {(planStatus === 'draft' || planStatus === 'recommended') && (
                          <button
                            onClick={() => onAgreePlan && onAgreePlan()}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 font-heading"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>Agree & Sign-Off Study Plan</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

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
