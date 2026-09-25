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
import StudentSelectModal from './StudentSelectModal';
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
  FileText,
  Lock,
  MessageSquare,
  Send,
  AlertCircle,
  X
} from 'lucide-react';

export default function PlanBuilder({
  student,
  students = [],
  onSelectStudent,
  onAddStudentClick,
  onEditStudentClick,
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
  onOpenStudentSelectModal,
  onRejectPlan,
  semesterRequests = {},
  onSaveSemesterRequest,
  onRemoveSemesterRequest
}) {
  const isChair = activeRole === 'chair';
  const [unitFilter, setUnitFilter] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [layoutType, setLayoutType] = useState('trimester'); // Default to Singapore Trimester Focus
  const [activeYearLevel, setActiveYearLevel] = useState(1); // 1: Year 1 (2026), 2: Year 2 (2027), 3: Year 3 (2028)
  const [viewMode, setViewMode] = useState('single'); // 'single' = Single Year Focus Slide, 'all' = All Years Grid
  const [agreedConfirmed, setAgreedConfirmed] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [showAllCatalogUnits, setShowAllCatalogUnits] = useState(true);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);
  const [activeRequestModal, setActiveRequestModal] = useState(null);
  const [requestCommentInput, setRequestCommentInput] = useState('');
  const [dragWarningToast, setDragWarningToast] = useState(null);

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

  const historyMap = useMemo(() => {
    const map = {};
    (history || []).forEach(h => {
      if (h && h.unit_code) map[h.unit_code] = h;
    });
    return map;
  }, [history]);

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
        const existingInPlan = planUnits.find(u => u.code === unit.code);
        if (existingInPlan) {
          const y = existingInPlan.year_level;
          const p = existingInPlan.period_id;
          const pName = p === 1 ? 'Semester 1' : p === 2 ? 'Semester 2' : p === 3 ? 'Trimester 1' : p === 4 ? 'Trimester 2' : 'Trimester 3';
          setDragWarningToast(`Unit ${unit.code} (${unit.title}) is ALREADY scheduled in Year ${y} ${pName}!`);
          setTimeout(() => setDragWarningToast(null), 4500);
          return;
        }
        const updated = [
          ...planUnits,
          {
            ...unit,
            year_level: targetYear,
            period_id: targetPeriod,
            sequence_order: planUnits.length + 1
          }
        ];
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

  const getTermName = (yearLevel, periodId) => {
    if (periodId === 3) return `Year ${yearLevel} Trimester 1`;
    if (periodId === 4) return `Year ${yearLevel} Trimester 2`;
    if (periodId === 5) return `Year ${yearLevel} Trimester 3`;
    if (periodId === 1) return `Year ${yearLevel} Semester 1`;
    if (periodId === 2) return `Year ${yearLevel} Semester 2`;
    return `Year ${yearLevel} Period ${periodId}`;
  };

  const scheduledUnitsMap = useMemo(() => {
    const map = new Map();
    planUnits.forEach(u => {
      map.set(u.code, {
        year_level: u.year_level,
        period_id: u.period_id,
        termName: getTermName(u.year_level, u.period_id)
      });
    });
    return map;
  }, [planUnits]);

  // Add unit from palette to Plan
  const handleAddUnitFromPalette = (unit) => {
    const existing = planUnits.find(u => u.code === unit.code);
    if (existing) {
      const info = getTermName(existing.year_level, existing.period_id);
      showToast(`Unit ${unit.code} (${unit.title}) is ALREADY scheduled in ${info}.`, 'info');
      return;
    }

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
    showToast(`Added ${unit.code} to ${getTermName(1, defaultPeriod)}`);
  };

  // Add unit from palette to a specific target semester
  const handleAddToSpecificSemester = (unit, yearLevel, periodId) => {
    const existing = planUnits.find(u => u.code === unit.code);
    if (existing) {
      const info = getTermName(existing.year_level, existing.period_id);
      showToast(`Unit ${unit.code} (${unit.title}) is ALREADY scheduled in ${info}.`, 'info');
      return;
    }

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
    showToast(`Added ${unit.code} to ${getTermName(yearLevel, periodId)}`);
  };

  // Preset 3-Year Singapore Trimester Fast-Track Plan (72 CP across 3 Years)
  const handleGeneratePresetPlan = () => {
    const isNewStudent = !history || history.length === 0;
    const completedCodesSet = new Set(
      (history || []).filter(h => h.status === 'completed').map(h => h.unit_code)
    );

    // Gather candidate units from active catalogUnits or fallback standard list
    let availableCatalog = (catalogUnits || []).filter(u => {
      if (!isNewStudent && completedCodesSet.has(u.code)) return false;
      return true;
    });

    if (availableCatalog.length === 0) {
      availableCatalog = [
        { code: 'ICT100', title: 'Transition to IT', credit_points: 3, level: 100 },
        { code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, level: 100 },
        { code: 'ICT158', title: 'Intro to Computer Systems', credit_points: 3, level: 100 },
        { code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, level: 100 },
        { code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, level: 100 },
        { code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, level: 100 },
        { code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, level: 100 },
        { code: 'ICT145', title: 'Python Programming', credit_points: 3, level: 100 },
        { code: 'ICT201', title: 'IT Project Management', credit_points: 3, level: 200 },
        { code: 'ICT202', title: 'Data Analytics & Processing', credit_points: 3, level: 200 },
        { code: 'ICT285', title: 'Databases', credit_points: 3, level: 200 },
        { code: 'ICT203', title: 'Software Architecture & Design', credit_points: 3, level: 200 },
        { code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, level: 200 },
        { code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, level: 200 },
        { code: 'ICT206', title: 'Distributed Systems', credit_points: 3, level: 200 },
        { code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, level: 200 },
        { code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, level: 200 },
        { code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, level: 300 },
        { code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, level: 300 },
        { code: 'ICT305', title: 'Data Visualisation', credit_points: 3, level: 300 },
        { code: 'ICT303', title: 'Cloud Infrastructure & DevOps', credit_points: 3, level: 300 },
        { code: 'ICT304', title: 'Enterprise Software Systems', credit_points: 3, level: 300 },
        { code: 'ICT374', title: 'Operating Systems', credit_points: 3, level: 300 },
        { code: 'ICT373', title: 'Software Architecture', credit_points: 3, level: 300 }
      ];
    }

    // Sort by level: 100 level -> Year 1, 200 level -> Year 2, 300 level -> Year 3
    const getUnitLvl = (u) => Number(u.level || (u.code ? u.code.replace(/[^0-9]/g, '').charAt(0) + '00' : 100));

    const level100 = availableCatalog.filter(u => getUnitLvl(u) <= 199);
    const level200 = availableCatalog.filter(u => {
      const lvl = getUnitLvl(u);
      return lvl >= 200 && lvl <= 299;
    });
    const level300 = availableCatalog.filter(u => getUnitLvl(u) >= 300);

    const generated = [];

    const distributeToYear = (units, fallbackSlice, yearLevel) => {
      const source = units.length > 0 ? units : fallbackSlice;
      const p3 = source.slice(0, 3);
      const p4 = source.slice(3, 6);
      const p5 = source.slice(6, 8);

      p3.forEach((u, idx) => generated.push({ ...u, unit_id: u.unit_id || Math.floor(Math.random() * 1000) + 10, year_level: yearLevel, period_id: 3, sequence_order: idx + 1, credit_points: u.credit_points || 3 }));
      p4.forEach((u, idx) => generated.push({ ...u, unit_id: u.unit_id || Math.floor(Math.random() * 1000) + 100, year_level: yearLevel, period_id: 4, sequence_order: idx + 4, credit_points: u.credit_points || 3 }));
      p5.forEach((u, idx) => generated.push({ ...u, unit_id: u.unit_id || Math.floor(Math.random() * 1000) + 200, year_level: yearLevel, period_id: 5, sequence_order: idx + 7, credit_points: u.credit_points || 3 }));
    };

    distributeToYear(level100, availableCatalog.slice(0, 8), 1);
    distributeToYear(level200, availableCatalog.slice(8, 16), 2);
    distributeToYear(level300, availableCatalog.slice(16, 24), 3);

    setPlanUnits(generated);
    if (onValidate) onValidate(generated);
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
    return planUnits.filter(u => {
      const uY = Number(u.year_level);
      const yL = Number(yearLevel);
      if (uY !== yL) return false;

      const uP = Number(u.period_id);
      const pI = Number(periodId);

      if (uP === pI) return true;

      // Period aliases for Trimester (T1: 3, T2: 4, T3: 5) vs Semester (S1: 1, S2: 2)
      if (layoutType === 'trimester') {
        const seq = Number(u.sequence_order || 1);
        if (pI === 3) return uP === 3 || (uP === 1 && seq <= 3);
        if (pI === 4) return uP === 4 || (uP === 2 && seq <= 3);
        if (pI === 5) return uP === 5 || (uP === 1 && seq > 3) || (uP === 2 && seq > 3);
      } else {
        if (pI === 1) return uP === 1 || uP === 3;
        if (pI === 2) return uP === 2 || uP === 4 || uP === 5;
      }
      return false;
    });
  };

  const planStatus = currentPlan ? currentPlan.status : 'draft';
  const totalCP = planUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0);

  const stName = student ? `${student.first_name || 'Alex'} ${student.last_name || 'Mercer'}` : 'Alex Mercer';
  const stNumber = student ? student.student_number : 'PT3-2026-001';
  const stCourse = student ? (student.course_code || 'PT3-BSIT-01') : 'PT3-BSIT-01';
  const stMajor = student?.major || (student?.course_name && student.course_name.includes('Major:')
    ? student.course_name.split('Major:')[1].replace(')', '').trim()
    : 'Artificial Intelligence');

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
      <div className="font-sans max-w-[1440px] mx-auto space-y-5 transition-colors">
        {/* Student View Executive Banner Header (Consistent with Course Catalog & Stored Plans style) */}
        <div className="bg-white dark:bg-slate-900 border-t-2 border-t-red-600 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 font-heading">
              <FileCheck className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              Proposed Study Plan Review ({stCourse})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 self-stretch md:self-auto justify-end">
            {onOpenStudentSelectModal && (
              <button
                onClick={onOpenStudentSelectModal}
                className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-left shadow-2xs flex items-center gap-2.5 transition-all shrink-0 cursor-pointer active:scale-95"
                title="Click to view or switch student profile"
              >
                <User className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block font-sans">Active Profile</span>
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
                className="bg-slate-900 hover:bg-slate-800 dark:bg-red-700 dark:hover:bg-red-600 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 font-sans"
                title="Export official Study Plan as PDF or PNG image"
              >
                <BookOpen className="w-4 h-4 text-emerald-400 dark:text-white" />
                <span>Export PDF / Image</span>
              </button>
            )}

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block font-sans">Current Status</span>
              <span className={`text-xs font-extrabold uppercase tracking-wide font-sans block mt-0.5 ${
                planStatus === 'approved' ? 'text-emerald-700 dark:text-emerald-400' :
                planStatus === 'agreed' ? 'text-blue-700 dark:text-blue-400' :
                planStatus === 'recommended' ? 'text-amber-700 dark:text-amber-400' :
                planStatus === 'rejected' ? 'text-rose-700 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
              }`}>
                {planStatus === 'rejected' ? 'CHANGE REQUESTED' : planStatus}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block font-sans">Planned Load</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono tabular-nums block mt-0.5">{totalCP} / 72 CP</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {years.map(y => (
            <div key={y.level} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
                    {y.yearName}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full uppercase">
                  Max 12 CP
                </span>
              </div>

              {defaultPeriodList.map(p => {
                const sUnits = getSemesterUnits(y.level, p.period_id);
                const semCP = sUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0);
                const isOptimalLoad = semCP === 12;
                const periodKey = `Y${y.level}-P${p.period_id}`;
                const hasRequest = semesterRequests[periodKey];

                return (
                  <div key={p.period_id} className={`bg-slate-50/90 dark:bg-slate-800/60 border rounded-2xl p-3.5 shadow-2xs space-y-2.5 ${hasRequest ? 'border-amber-400 dark:border-amber-700 ring-2 ring-amber-400/30' : 'border-slate-200/80 dark:border-slate-700/80'}`}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 font-heading">{p.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-xs tabular-nums font-bold px-2.5 py-0.5 rounded-full border ${
                          isOptimalLoad ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' :
                          semCP > 0 ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' :
                          'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}>
                          {semCP} / 12 CP
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveRequestModal({
                              key: periodKey,
                              yearLevel: y.level,
                              periodId: p.period_id,
                              periodName: `Year ${y.level} - ${p.name}`
                            });
                            setRequestCommentInput(semesterRequests[periodKey] || '');
                          }}
                          className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="Request change specifically for this semester"
                        >
                          <MessageSquare className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>{hasRequest ? 'Edit Request' : 'Request Change'}</span>
                        </button>
                      </div>
                    </div>

                    {hasRequest && (
                      <div className="p-2.5 bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider font-heading">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            Your Request to Chair
                          </span>
                          {onRemoveSemesterRequest && (
                            <button
                              type="button"
                              onClick={() => onRemoveSemesterRequest(periodKey)}
                              className="text-rose-600 dark:text-rose-400 hover:underline font-bold text-[10px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-amber-950 dark:text-amber-100 font-semibold italic">
                          "{hasRequest}"
                        </p>
                      </div>
                    )}

                    {sUnits.length === 0 ? (
                      <div className="py-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-xl bg-white/50 dark:bg-slate-900/50">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono italic">No units scheduled for this trimester</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sUnits.map(u => {
                          const isCompleted = completedUnitCodes.has(u.code);
                          const isAttempted = attemptedUnitCodes.has(u.code);
                          const hist = historyMap[u.code];

                          let cardBg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200';
                          if (isCompleted) {
                            cardBg = 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100';
                          } else if (isAttempted) {
                            cardBg = 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100';
                          }

                          return (
                            <div
                              key={u.unit_id || u.code}
                              className={`flex items-center justify-between text-xs border p-2.5 rounded-xl font-medium shadow-2xs transition-all ${cardBg}`}
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <span className="bg-slate-900 text-white dark:bg-red-700 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0">
                                  L{u.level || 1}00
                                </span>
                                <span className="font-mono font-extrabold text-slate-900 dark:text-white shrink-0">{u.code}</span>
                                <span className="text-slate-600 dark:text-slate-400 text-xs truncate font-normal">{u.title}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isCompleted && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> PASSED {hist?.grade ? `(${hist.grade})` : ''}
                                  </span>
                                )}
                                {isAttempted && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                                    <RotateCcw className="w-3 h-3 text-rose-600 dark:text-rose-400" /> FAILED ({hist?.grade || 'F'})
                                  </span>
                                )}
                                <span className="text-xs font-mono text-slate-700 dark:text-slate-300 tabular-nums font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  {u.credit_points || 3} CP
                                </span>
                              </div>
                            </div>
                          );
                        })}
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
          onRejectPlan={onRejectPlan}
          currentSignature={currentPlan?.studentSignature}
        />
      </div>
    );
  }

  // =========================================================================
  // RENDER: ACADEMIC CHAIR VIEW - NO TARGET STUDENT SELECTED (INLINE SELECTOR)
  // =========================================================================
  if (isChair && (!student || student.account_category === 'admin' || student.student_id === 0)) {
    return (
      <div className="font-sans max-w-[1440px] mx-auto space-y-5 animate-in fade-in duration-200">
        <StudentSelectModal
          students={students}
          onSelectStudent={onSelectStudent}
          onAddStudentClick={onAddStudentClick}
          onEditStudentClick={onEditStudentClick}
          isModal={false}
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

        {/* STUDENT REJECTION / CHANGE REQUEST ALERT BANNER */}
        {currentPlan?.rejectionComment && (
          <div className="bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 p-4 rounded-2xl shadow-xs flex items-start gap-3 font-sans text-amber-950 dark:text-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider font-heading text-amber-800 dark:text-amber-300">
                  ⚠️ Student Requested Changes / Plan Rejected
                </span>
                <span className="text-[10px] font-mono bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded font-bold">
                  Action Required
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Student Comment: <em className="text-amber-900 dark:text-amber-200 italic font-serif">"{currentPlan.rejectionComment}"</em>
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Please adjust the teaching period assignments or unit structure based on the student's request, then re-recommend the study plan.
              </p>
            </div>
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
                scheduledUnitsMap={scheduledUnitsMap}
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
                    warningsList
                      .filter((w, index, self) => index === self.findIndex(t => t.message === w.message))
                      .map((w, idx) => (
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
                  </div>

                  {/* Centered Major Badge Pill */}
                  <div className="inline-flex items-center gap-1.5 bg-red-50/90 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/80 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-2xs font-heading">
                    <BookOpen className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                    <span>Major: {stMajor}</span>
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
                                <span>Trimester Layout</span>
                              </button>

                              <button
                                type="button"
                                disabled
                                className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 opacity-60 cursor-not-allowed text-slate-400 dark:text-slate-500"
                                title="Semester views can remain in the UI as inactive/untouched layouts for future scalability, but are out of scope for this build."
                              >
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
                            const periodKey = `Y${yearObj.level}-P${period.period_id}`;
                            const changeReq = semesterRequests[periodKey];

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
                                historyMap={historyMap}
                                changeRequest={changeReq}
                                onResolveChangeRequest={onRemoveSemesterRequest ? () => onRemoveSemesterRequest(periodKey) : undefined}
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
                  <div className="flex items-center gap-4 flex-1 max-w-lg">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between text-xs font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Planned Load:
                          </span>
                          <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                            {totalCP} <span className="text-slate-400 font-normal text-xs">/ 72 CP</span>
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-sans border ${
                          planStatus === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                          planStatus === 'agreed' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                          planStatus === 'recommended' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          {planStatus === 'draft' ? 'Drafting' : planStatus}
                        </span>
                      </div>

                      {/* Clean Solid Progress Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            totalCP >= 72 ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((totalCP / 72) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Primary Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 font-sans">
                    <button
                      onClick={handleClearPlan}
                      className="px-3 py-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Clear all units (Reset to 0 CP)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>

                    <button
                      onClick={onSavePlan}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Save className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span>Save Draft</span>
                    </button>

                    {isChair ? (
                      <>
                        {(planStatus === 'draft' || planStatus === 'recommended') && (
                          <button
                            onClick={() => onRecommendPlan && onRecommendPlan()}
                            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            <span>{planStatus === 'recommended' ? 'Update & Re-Recommend' : 'Recommend to Student'}</span>
                            <ArrowRight className="w-4 h-4 text-white/90" />
                          </button>
                        )}

                        {planStatus === 'agreed' && (
                          <button
                            onClick={() => onApprovePlan && onApprovePlan()}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            <ShieldCheck className="w-4 h-4 text-white/90" />
                            <span>Final Approve Plan</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {(planStatus === 'draft' || planStatus === 'recommended') && (
                          <button
                            onClick={() => onAgreePlan && onAgreePlan()}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white/90" />
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

        {/* Semester Change Request Modal Dialog (Restricted to Student View) */}
        {!isChair && activeRequestModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
            <div className="bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shadow-2xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                      Request Change for {activeRequestModal.periodName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Send a specific modification comment to your Academic Chair.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRequestModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 font-heading">
                  Enter your request / comment for this trimester:
                </label>
                <textarea
                  rows={3}
                  value={requestCommentInput}
                  onChange={(e) => setRequestCommentInput(e.target.value)}
                  placeholder="e.g. Please swap ICT283 Data Structures to Trimester 2 due to timetable conflict or reduce load to 9 CP..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold block w-full">Quick suggestions:</span>
                  {[
                    "Swap subject to next trimester",
                    "Reduce CP credit load for this term",
                    "Prefer online delivery mode",
                    "Prerequisite requirement clarification"
                  ].map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setRequestCommentInput(sugg)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveRequestModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!requestCommentInput.trim()) {
                      alert('Please enter a comment before submitting.');
                      return;
                    }
                    if (onSaveSemesterRequest) {
                      onSaveSemesterRequest(activeRequestModal.key, requestCommentInput.trim());
                    }
                    setActiveRequestModal(null);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer font-heading uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request to Chair</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drag Warning Toast Banner */}
        {dragWarningToast && (
          <div className="fixed bottom-6 right-6 z-[9999] max-w-md bg-amber-500 text-white font-sans text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-white" />
              <span>{dragWarningToast}</span>
            </div>
            <button
              onClick={() => setDragWarningToast(null)}
              className="hover:bg-amber-600 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>
    </DndContext>
  );
}
