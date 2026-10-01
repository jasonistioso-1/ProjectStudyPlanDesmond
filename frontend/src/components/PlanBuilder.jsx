import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  FileText,
  Lock,
  MessageSquare,
  Send,
  AlertCircle,
  Clock,
  Sparkles,
  Sliders,
  Wand2,
  Cpu,
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
  onRemoveSemesterRequest,
  onStudentSubmitPlanRequest,
  onAutoGeneratePlan
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
  const [activeRequestModal, setActiveRequestModal] = useState(null);
  const [requestCommentInput, setRequestCommentInput] = useState('');
  const [dragWarningToast, setDragWarningToast] = useState(null);
  const [expandedTrimesters, setExpandedTrimesters] = useState({});

  // Student Submit Request Modal State
  const [showSubmitPlanRequestModal, setShowSubmitPlanRequestModal] = useState(false);
  const [reqYear, setReqYear] = useState(2026);
  const [reqPeriods, setReqPeriods] = useState([3, 4, 5]); // Default all 3 trimesters selected
  const [reqComment, setReqComment] = useState('');

  // Active Plan Status and Lock Check
  const planStatus = currentPlan ? currentPlan.status : 'draft';
  const isPlanLocked = planStatus === 'recommended' || planStatus === 'agreed' || planStatus === 'approved';

  // Auto System Generation Scope Selection Modal State
  const [showAutoGenModal, setShowAutoGenModal] = useState(false);
  const [scopeYear, setScopeYear] = useState('all');
  const [scopePeriods, setScopePeriods] = useState([3, 4, 5]);
  const [modalLayoutType, setModalLayoutType] = useState('trimester');

  // Calculate completed/passed years from student history
  const passedYears = useMemo(() => {
    const completedHistory = (history || []).filter(h => h.status === 'completed');
    const set = new Set();
    const yr1Count = completedHistory.filter(h => h.year_taken === 2026 || (h.period_id >= 3 && h.period_id <= 5 && (h.year_taken <= 2026 || !h.year_taken))).length;
    if (yr1Count >= 6) set.add(1);
    const yr2Count = completedHistory.filter(h => h.year_taken === 2027).length;
    if (yr2Count >= 6) set.add(2);
    return set;
  }, [history]);

  // Auto-scroll and align with target Year level block whenever reviewing a plan
  useEffect(() => {
    if (currentPlan?.targetYearLevel || currentPlan?.forceScrollTrigger) {
      const targetLvl = Number(currentPlan.targetYearLevel) || 1;
      setActiveYearLevel(targetLvl);

      const scrollToTarget = () => {
        const yearBlock = document.getElementById(`year-block-${targetLvl}`) || document.getElementById('study-plan-years-section') || document.getElementById('year-grid-canvas');
        if (yearBlock) {
          const yOffset = -85;
          const y = yearBlock.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }
      };

      const t1 = setTimeout(scrollToTarget, 100);
      const t2 = setTimeout(scrollToTarget, 350);
      const t3 = setTimeout(scrollToTarget, 700);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [currentPlan?.targetYearLevel, currentPlan?.status, currentPlan?.updated_at, currentPlan?.forceScrollTrigger]);

  const handleOpenAutoGenModal = () => {
    if (isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits. Click 'Retrieve & Amend' in Stored Repository to make modifications.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }

    if (currentPlan?.targetYearLevel) {
      setScopeYear(currentPlan.targetYearLevel);
    } else if (currentPlan?.requestYear) {
      setScopeYear(currentPlan.requestYear === 2027 ? 2 : currentPlan.requestYear === 2028 ? 3 : 1);
    }
    if (currentPlan?.requestPeriods && currentPlan.requestPeriods.length > 0) {
      setScopePeriods(currentPlan.requestPeriods);
    }
    setShowAutoGenModal(true);
  };

  const toggleTrimesterExpand = (key) => {
    setExpandedTrimesters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Automatically focus & slide to requested/target year level when currentPlan or student updates
  React.useEffect(() => {
    if (currentPlan && currentPlan.targetYearLevel) {
      setActiveYearLevel(Number(currentPlan.targetYearLevel));
      setViewMode('single');
    } else if (currentPlan && currentPlan.requestYear) {
      const targetLvl = Number(currentPlan.requestYear) === 2027 ? 2 : Number(currentPlan.requestYear) === 2028 ? 3 : 1;
      setActiveYearLevel(targetLvl);
      setViewMode('single');
    }
    if (currentPlan && currentPlan.layoutType) {
      setLayoutType(currentPlan.layoutType);
    }
  }, [currentPlan, student]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  );

  // Completed & Attempted (Failed) unit codes from student history
  const completedUnitCodes = new Set(
    (history || []).filter(h => h.status === 'completed').map(h => h.unit_code || h.code)
  );
  const attemptedUnitCodes = new Set(
    (history || []).filter(h => h.status === 'attempted').map(h => h.unit_code || h.code)
  );

  const historyMap = useMemo(() => {
    const map = {};
    (history || []).forEach(h => {
      if (h) {
        const code = h.unit_code || h.code;
        if (code) map[code] = h;
      }
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

  const t3RestrictedUnits = useMemo(() => new Set(), []);
  const s1OnlyUnits = useMemo(() => new Set(), []);
  const s2OnlyUnits = useMemo(() => new Set(), []);

  // Complete Warnings List & Unit-level Warning Map
  const warningsByUnit = {};
  const warningsList = [];

  // Merge backend warnings if available
  if (validationResult && validationResult.warnings) {
    validationResult.warnings.forEach(w => {
      if (w.unitCode && completedUnitCodes.has(w.unitCode)) return;
      warningsList.push(w);
      if (w.unitCode && !warningsByUnit[w.unitCode]) {
        warningsByUnit[w.unitCode] = w.message;
      }
    });
  }

  // Real-time BR-01 Offering & BR-02 Prerequisite checks on planUnits
  planUnits.forEach(unit => {
    // If unit is already completed & passed in history, skip validation warnings for it
    if (completedUnitCodes.has(unit.code)) return;

    const isTri3 = unit.period_id === 5;
    const isS1Only = unit.period_id === 1;
    const isS2Only = unit.period_id === 2;

    // BR-01 Offering Check
    if (isTri3 && t3RestrictedUnits.has(unit.code)) {
      const msg = `Unit ${unit.code} (${unit.title}) is NOT offered in Tri-Semester 3 (T3) at Singapore Campus.`;
      if (!warningsByUnit[unit.code]) warningsByUnit[unit.code] = msg;
      if (!warningsList.some(w => w.unitCode === unit.code && w.type === 'BR-01_OFFERING_MISMATCH')) {
        warningsList.push({ type: 'BR-01_OFFERING_MISMATCH', severity: 'error', unitCode: unit.code, message: msg });
      }
    } else if (isS2Only && s1OnlyUnits.has(unit.code)) {
      const msg = `Unit ${unit.code} (${unit.title}) is offered ONLY in Semester 1 and cannot be taken in Semester 2.`;
      if (!warningsByUnit[unit.code]) warningsByUnit[unit.code] = msg;
      if (!warningsList.some(w => w.unitCode === unit.code && w.type === 'BR-01_OFFERING_MISMATCH')) {
        warningsList.push({ type: 'BR-01_OFFERING_MISMATCH', severity: 'error', unitCode: unit.code, message: msg });
      }
    } else if (isS1Only && s2OnlyUnits.has(unit.code)) {
      const msg = `Unit ${unit.code} (${unit.title}) is offered ONLY in Semester 2 and cannot be taken in Semester 1.`;
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

  // General Elective Rule Check (MSP200 or COM203)
  const hasMSP200 = planUnits.some(u => u.code === 'MSP200') || completedUnitCodes.has('MSP200');
  const hasCOM203 = planUnits.some(u => u.code === 'COM203') || completedUnitCodes.has('COM203');

  if (hasMSP200 && hasCOM203) {
    warningsList.push({
      type: 'GENERAL_ELECTIVE_NOTICE',
      severity: 'info',
      message: 'Both MSP200 and COM203 are scheduled. Note: Only one General Elective (MSP200 OR COM203) is required for graduation.'
    });
  }

  // Handle Drag Start
  const handleDragStart = (event) => {
    if (isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits. Click 'Retrieve & Amend' in Stored Repository to make modifications.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }
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

  // Validate prerequisite and max 12 CP capacity limit for unit placement
  const validatePlacement = (unitCode, targetYear, targetPeriod, currentUnits, activeDragCode = null) => {
    // 1. Prerequisite Validation
    const prereqCode = prereqMap[unitCode];
    if (prereqCode) {
      const isCompletedInHistory = completedUnitCodes.has(prereqCode);
      if (!isCompletedInHistory) {
        const isScheduledPrior = currentUnits.some(other => {
          if (activeDragCode && other.code === activeDragCode) return false;
          if (other.code !== prereqCode) return false;
          if (other.year_level < targetYear) return true;
          if (other.year_level === targetYear && (other.period_id || 0) < targetPeriod) return true;
          return false;
        });

        if (!isScheduledPrior) {
          const unitObj = catalogUnits.find(u => u.code === unitCode);
          const title = unitObj ? unitObj.title : unitCode;
          return {
            valid: false,
            message: `Prerequisite Violation: Unit ${unitCode} (${title}) requires prerequisite ${prereqCode}, which has NOT been completed in an earlier teaching period!`
          };
        }
      }
    }

    // 2. Maximum 12 CP Capacity Limit Validation
    const periodUnits = currentUnits.filter(u => {
      if (activeDragCode && u.code === activeDragCode) return false;
      return Number(u.year_level) === Number(targetYear) && Number(u.period_id) === Number(targetPeriod);
    });

    const currentPeriodCP = periodUnits.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
    const unitObj = catalogUnits.find(u => u.code === unitCode);
    const unitCP = Number(unitObj?.credit_points || 3);

    if (currentPeriodCP + unitCP > 12) {
      const pName = targetPeriod === 1 ? 'Semester 1' : targetPeriod === 2 ? 'Semester 2' : targetPeriod === 3 ? 'Trimester 1' : targetPeriod === 4 ? 'Trimester 2' : 'Trimester 3';
      return {
        valid: false,
        message: `Credit Load Exceeded: Adding ${unitCode} (${unitCP} CP) into Year ${targetYear} ${pName} would exceed the maximum 12 CP limit (${currentPeriodCP + unitCP} / 12 CP)!`
      };
    }

    return { valid: true };
  };

  // Handle Drag End
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;

    if (isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits. Click 'Retrieve & Amend' in Stored Repository to make modifications.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }

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

    if (passedYears.has(targetYear)) {
      setDragWarningToast(`Year ${targetYear} (${targetYear === 1 ? '2026' : '2027'}) is already completed/passed by student. Please schedule units in Year 2 (2027) or Year 3 (2028).`);
      setTimeout(() => setDragWarningToast(null), 4500);
      return;
    }

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

        const check = validatePlacement(unit.code, targetYear, targetPeriod, planUnits);
        if (!check.valid) {
          setDragWarningToast(check.message);
          setTimeout(() => setDragWarningToast(null), 5000);
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
        if (historyMap[existingUnit.code]?.status === 'completed') {
          setDragWarningToast(`Unit ${existingUnit.code} is PASSED in official academic history and cannot be moved.`);
          setTimeout(() => setDragWarningToast(null), 4500);
          return;
        }

        const check = validatePlacement(existingUnit.code, targetYear, targetPeriod, planUnits, existingUnit.code);
        if (!check.valid) {
          setDragWarningToast(check.message);
          setTimeout(() => setDragWarningToast(null), 5000);
          return;
        }

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
    if (isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits. Click 'Retrieve & Amend' in Stored Repository to make modifications.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }

    const existing = planUnits.find(u => u.code === unit.code);
    if (existing) {
      const info = getTermName(existing.year_level, existing.period_id);
      setDragWarningToast(`Unit ${unit.code} (${unit.title}) is ALREADY scheduled in ${info}.`);
      setTimeout(() => setDragWarningToast(null), 4500);
      return;
    }

    const defaultPeriod = defaultPeriodList[0] ? defaultPeriodList[0].period_id : 3;
    const check = validatePlacement(unit.code, 1, defaultPeriod, planUnits);
    if (!check.valid) {
      setDragWarningToast(check.message);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }

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
    if (isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits. Click 'Retrieve & Amend' in Stored Repository to make modifications.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }

    if (passedYears.has(yearLevel)) {
      setDragWarningToast(`Year ${yearLevel} (${yearLevel === 1 ? '2026' : '2027'}) is already completed/passed by student. Please schedule units in Year 2 (2027) or Year 3 (2028).`);
      setTimeout(() => setDragWarningToast(null), 4500);
      return;
    }

    const existing = planUnits.find(u => u.code === unit.code);
    if (existing) {
      const info = getTermName(existing.year_level, existing.period_id);
      setDragWarningToast(`Unit ${unit.code} (${unit.title}) is ALREADY scheduled in ${info}.`);
      setTimeout(() => setDragWarningToast(null), 4500);
      return;
    }

    const check = validatePlacement(unit.code, yearLevel, periodId, planUnits);
    if (!check.valid) {
      setDragWarningToast(check.message);
      setTimeout(() => setDragWarningToast(null), 5000);
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
  };

  // Preset 3-Year Singapore Trimester Fast-Track Plan (72 CP across 3 Years)
  const handleGeneratePresetPlan = () => {
    if (isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits. Click 'Retrieve & Amend' in Stored Repository to make modifications.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }

    const isNewStudent = !history || history.length === 0;
    const completedCodesSet = new Set(
      (history || []).filter(h => h.status === 'completed').map(h => h.unit_code || h.code)
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
      const p3 = source.slice(0, 4);
      const p4 = source.slice(4, 8);
      const p5 = source.slice(8, 12);

      p3.forEach((u, idx) => {
        if (generated.length < 24) {
          generated.push({ ...u, unit_id: u.unit_id || Math.floor(Math.random() * 1000) + 10, year_level: yearLevel, period_id: 3, sequence_order: idx + 1, credit_points: u.credit_points || 3 });
        }
      });
      p4.forEach((u, idx) => {
        if (generated.length < 24) {
          generated.push({ ...u, unit_id: u.unit_id || Math.floor(Math.random() * 1000) + 100, year_level: yearLevel, period_id: 4, sequence_order: idx + 5, credit_points: u.credit_points || 3 });
        }
      });
      p5.forEach((u, idx) => {
        if (generated.length < 24) {
          generated.push({ ...u, unit_id: u.unit_id || Math.floor(Math.random() * 1000) + 200, year_level: yearLevel, period_id: 5, sequence_order: idx + 9, credit_points: u.credit_points || 3 });
        }
      });
    };

    distributeToYear(level100, availableCatalog.slice(0, 12), 1);
    distributeToYear(level200, availableCatalog.slice(12, 24), 2);
    distributeToYear(level300, availableCatalog.slice(24, 36), 3);

    setPlanUnits(generated);
    if (onValidate) onValidate(generated);
  };

  // Clear all units from plan (Reset to 0 CP)
  const handleClearPlan = () => {
    if (isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits. Click 'Retrieve & Amend' in Stored Repository to make modifications.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }
    setPlanUnits([]);
    if (onValidate) onValidate([]);
  };

  // Remove unit from Plan
  const handleRemoveUnit = (unitIdOrCode) => {
    if (isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits. Click 'Retrieve & Amend' in Stored Repository to make modifications.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }
    const targetUnit = planUnits.find(u => String(u.unit_id || u.code) === String(unitIdOrCode));
    if (targetUnit && historyMap[targetUnit.code]?.status === 'completed') {
      setDragWarningToast(`Unit ${targetUnit.code} is PASSED in official academic history and cannot be removed.`);
      setTimeout(() => setDragWarningToast(null), 4500);
      return;
    }
    const updated = planUnits.filter(u => String(u.unit_id || u.code) !== String(unitIdOrCode));
    setPlanUnits(updated);
    if (onValidate) onValidate(updated);
  };

  const scheduledCodesSet = useMemo(() => {
    const set = new Set(planUnits.map(pu => pu.code));
    (history || []).filter(h => h.status === 'completed').forEach(h => set.add(h.unit_code || h.code));
    return set;
  }, [planUnits, history]);

  const defaultFullCatalogUnits = useMemo(() => [
    { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, level: 100, prereqs: 'ICT159' },
    { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, level: 200, prereqs: 'ICT158' },
    { unit_id: 9, code: 'ICT202', title: 'Machine Learning', credit_points: 3, level: 200, prereqs: 'ICT159' },
    { unit_id: 10, code: 'ICT203', title: 'Artificial Intelligence', credit_points: 3, level: 200, prereqs: 'ICT167' },
    { unit_id: 11, code: 'ICT206', title: 'Intelligent Systems', credit_points: 3, level: 200, prereqs: 'ICT167' },
    { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, level: 200, prereqs: 'ICT167' },
    { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, level: 200, prereqs: 'ICT158' },
    { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, level: 200, prereqs: 'ICT159' },
    { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, level: 200, prereqs: 'ICT158' },
    { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, level: 200, prereqs: 'ICT158' },
    { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 18, code: 'MAS164', title: 'Fundamentals of Mathematics', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 19, code: 'MAS183', title: 'Statistical Data Analysis', credit_points: 3, level: 100, prereqs: 'None' },
    { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, level: 300, prereqs: 'ICT292' },
    { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, level: 300, prereqs: 'ICT201' },
    { unit_id: 22, code: 'ICT303', title: 'Advanced Machine Learning', credit_points: 3, level: 300, prereqs: 'ICT202' },
    { unit_id: 23, code: 'ICT304', title: 'AI System Design', credit_points: 3, level: 300, prereqs: 'ICT203' },
    { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, level: 300, prereqs: 'ICT202' },
    { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, level: 300, prereqs: 'ICT283' },
    { unit_id: 26, code: 'ICT374', title: 'Operating Systems', credit_points: 3, level: 300, prereqs: 'ICT283' },
    { unit_id: 27, code: 'ICT393', title: 'Advanced Business Analysis', credit_points: 3, level: 300, prereqs: 'ICT284' },
    { unit_id: 28, code: 'ICT394', title: 'Business Intelligence & Analytics', credit_points: 3, level: 300, prereqs: 'ICT285' },
    { unit_id: 29, code: 'MSP200', title: 'Building Employability Skills', credit_points: 3, level: 200, prereqs: 'None' },
    { unit_id: 30, code: 'COM203', title: 'Consulting and Freelancing', credit_points: 3, level: 200, prereqs: 'None' }
  ], []);

  const effectiveCatalog = useMemo(() => {
    if (!catalogUnits || catalogUnits.length === 0) return defaultFullCatalogUnits;
    const existingCodes = new Set(catalogUnits.map(u => u.code));
    const missingUnits = defaultFullCatalogUnits.filter(u => !existingCodes.has(u.code));
    return [...catalogUnits, ...missingUnits];
  }, [catalogUnits, defaultFullCatalogUnits]);

  // Filtered available offerings
  const filteredOfferings = useMemo(() => {
    return effectiveCatalog.filter(unit => {
      const isAlreadyScheduled = scheduledCodesSet.has(unit.code);
      if (!showAllCatalogUnits && isAlreadyScheduled) return false;

      if (selectedLevel === 'ELECTIVE') {
        if (!['MSP200', 'COM203'].includes(unit.code)) return false;
      } else if (selectedLevel === 'CORE') {
        if (['MSP200', 'COM203'].includes(unit.code)) return false;
      } else if (selectedLevel !== 'ALL' && String(unit.level) !== selectedLevel) {
        return false;
      }

      if (unitFilter.trim()) {
        const query = unitFilter.toLowerCase();
        return (
          unit.code.toLowerCase().includes(query) ||
          (unit.title && unit.title.toLowerCase().includes(query))
        );
      }
      return true;
    }).sort((a, b) => {
      if (selectedLevel === 'CORE') {
        return (a.level || 100) - (b.level || 100);
      }
      return 0;
    });
  }, [effectiveCatalog, scheduledCodesSet, showAllCatalogUnits, selectedLevel, unitFilter]);

  const years = [
    { level: 1, yearName: 'Year 1 (2026)' },
    { level: 2, yearName: 'Year 2 (2027)' },
    { level: 3, yearName: 'Year 3 (2028)' }
  ];

  const getSemesterUnits = (yearLevel, periodId) => {
    const yL = Number(yearLevel);
    const pI = Number(periodId);

    // If this year is a passed year in student academic history (e.g. Year 1)
    if (passedYears.has(yL)) {
      const completedHistory = (history || []).filter(h => h.status === 'completed');
      
      const yearHistory = completedHistory.filter(h => {
        const yTaken = Number(h.year_taken || 2026);
        const calcLvl = yTaken === 2026 ? 1 : yTaken === 2027 ? 2 : 3;
        return calcLvl === yL;
      });

      const itemsWithPeriod = yearHistory.filter(h => Number(h.period_id) === pI);

      let targetHistoryUnits = [];
      if (itemsWithPeriod.length > 0) {
        targetHistoryUnits = itemsWithPeriod;
      } else if (yearHistory.length > 0) {
        // Partition history units evenly into 4 units per trimester (T1=3, T2=4, T3=5)
        const termIdx = pI === 3 ? 0 : pI === 4 ? 1 : 2;
        targetHistoryUnits = yearHistory.slice(termIdx * 4, (termIdx + 1) * 4);
      }

      if (targetHistoryUnits.length > 0) {
        return targetHistoryUnits.map(h => {
          const uCode = h.unit_code || h.code;
          const catUnit = catalogUnits.find(c => c.code === uCode);
          return {
            ...(catUnit || {}),
            code: uCode,
            title: h.title || catUnit?.title || uCode,
            credit_points: Number(h.credit_points || catUnit?.credit_points || 3),
            year_level: yL,
            period_id: pI,
            status: 'completed',
            isCompleted: true,
            isLocked: true
          };
        });
      }
    }

    return planUnits.filter(u => {
      const uY = Number(u.year_level);
      if (uY !== yL) return false;

      const uP = Number(u.period_id);
      if (uP === pI) return true;

      // Period aliases for Trimester (T1: 3, T2: 4, T3: 5) vs Semester (S1: 1, S2: 2)
      if (layoutType === 'trimester') {
        const seq = Number(u.sequence_order || 1);
        if (pI === 3) return uP === 3 || (uP === 1 && seq <= 3);
        if (pI === 4) return uP === 4 || (uP === 2 && seq <= 3);
        if (pI === 5) return uP === 5 || (uP === 1 && seq > 3) || (uP === 2 && seq > 3);
        if (pI === 1) return uP === 1 || uP === 3;
        if (pI === 2) return uP === 2 || uP === 4 || uP === 5;
      }
      return false;
    });
  };

  // Calculate completed/passed CP from student academic history
  const completedHistoryCP = useMemo(() => {
    return (history || [])
      .filter(h => h.status === 'completed')
      .reduce((sum, h) => sum + (h.credit_points || 3), 0);
  }, [history]);

  const completedCodesSet = useMemo(() => {
    return new Set((history || []).filter(h => h.status === 'completed').map(h => h.unit_code || h.code));
  }, [history]);

  // Planned Canvas CP (units on canvas not already in completed history)
  const plannedCanvasCP = useMemo(() => {
    return (planUnits || [])
      .filter(u => !completedCodesSet.has(u.code))
      .reduce((sum, u) => sum + (u.credit_points || 3), 0);
  }, [planUnits, completedCodesSet]);

  // Total CP = Completed History CP + Planned Canvas CP (Cumulative across ALL 3 years)
  const totalCP = completedHistoryCP + plannedCanvasCP;

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
        {/* Student View Action & Status Toolbar (Sleek 1-line bar below main Page Header) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 font-sans transition-all">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Major: <strong className="text-slate-900 dark:text-white font-bold">{stMajor}</strong>
            </span>

            {onOpenStudentSelectModal && (
              <button
                onClick={onOpenStudentSelectModal}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white transition-all cursor-pointer active:scale-95"
                title="Click to switch active student profile"
              >
                <User className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                <span>Change Student</span>
              </button>
            )}

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Plan Status:
            </span>
            <span className={`px-2.5 py-0.5 rounded-xl text-xs font-bold uppercase tracking-wide border ${
              planStatus === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' :
              planStatus === 'agreed' ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' :
              planStatus === 'recommended' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' :
              planStatus === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' :
              'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
              {planStatus === 'rejected' ? 'Change Requested' : planStatus}
            </span>

            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl shadow-2xs">
              {totalCP} / 72 CP
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-stretch md:self-auto justify-end">
            <button
              onClick={() => setShowSubmitPlanRequestModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 font-heading tracking-tight"
              title="Submit a study plan request for Academic Chair review"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Submit Plan Request</span>
            </button>

            {onOpenOfficialDocument && (
              <button
                onClick={onOpenOfficialDocument}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-red-700 dark:hover:bg-red-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 font-sans"
                title="Export official Study Plan as PDF"
              >
                <BookOpen className="w-3.5 h-3.5 text-white" />
                <span>Export PDF</span>
              </button>
            )}
          </div>
        </div>



        {/* Student Degree Plan Guide Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs font-sans space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white font-heading">
                Student Degree Plan Workflow & Operating Guide
              </h3>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full font-mono border border-emerald-200 dark:border-emerald-800">
              4 Steps Flow
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-sans">
            <div className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1 shadow-2xs">
              <div className="font-extrabold text-blue-700 dark:text-blue-400 flex items-center gap-2 font-heading">
                <Send className="w-3.5 h-3.5 shrink-0" /> 1. Submit Plan Request
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Click <strong>Submit Plan Request</strong> at the top to select target trimesters and submit a request to your Chair.
              </p>
            </div>

            <div className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1 shadow-2xs">
              <div className="font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-2 font-heading">
                <BookOpen className="w-3.5 h-3.5 shrink-0" /> 2. Review Recommended Units
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Inspect scheduled subjects across Year 1, Year 2, and Year 3 Trimesters prepared by your Academic Chair.
              </p>
            </div>

            <div className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1 shadow-2xs">
              <div className="font-extrabold text-sky-700 dark:text-sky-400 flex items-center gap-2 font-heading">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> 3. Digital Sign-Off
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Check the credit load acknowledgement and click <strong>Agree & Sign-Off Study Plan</strong> at the bottom.
              </p>
            </div>

            <div className="bg-slate-50/90 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1 shadow-2xs">
              <div className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 font-heading">
                <FileText className="w-3.5 h-3.5 shrink-0" /> 4. Export Certified PDF
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Click <strong>Export PDF</strong> to generate or print your official certified 72 CP Study Plan document.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {years.map(y => (
            <div key={y.level} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
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
                      (() => {
                        const isExpanded = expandedTrimesters[periodKey];
                        const displayUnits = isExpanded ? sUnits : sUnits.slice(0, 3);
                        const hiddenCount = sUnits.length - 3;

                        return (
                          <div className="space-y-2">
                            {displayUnits.map(u => {
                              const isCompleted = completedUnitCodes.has(u.code);
                              const isAttempted = attemptedUnitCodes.has(u.code);
                              const hist = historyMap[u.code];
                              const isEnrolled = hist && (hist.status === 'enrolled' || hist.status === 'current');

                              let cardBg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200';
                              if (isCompleted) {
                                cardBg = 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100';
                              } else if (isEnrolled) {
                                cardBg = 'bg-sky-50/60 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-950 dark:text-sky-100';
                              } else if (isAttempted) {
                                cardBg = 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100';
                              }

                              return (
                                <div
                                  key={u.unit_id || u.code}
                                  className={`p-3 rounded-xl border text-xs shadow-2xs transition-all space-y-1.5 ${cardBg}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-heading font-extrabold text-white bg-blue-600 dark:bg-blue-700 text-xs tracking-tight px-2.5 py-0.5 rounded-md shadow-2xs font-mono">
                                        {u.code}
                                      </span>
                                      <span className="text-xs font-mono text-slate-700 dark:text-slate-300 tabular-nums font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                        {u.credit_points || 3} CP
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {isCompleted && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-sans shrink-0" title="Completed in official academic record">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                          <span>Grade: <strong className="font-mono text-emerald-900 dark:text-emerald-200 font-extrabold">{hist?.grade || 'P'}</strong></span>
                                        </span>
                                      )}
                                      {isEnrolled && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80">
                                          <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" /> ENROLLED
                                        </span>
                                      )}
                                      {isAttempted && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
                                          <RotateCcw className="w-3 h-3 text-rose-600 dark:text-rose-400" /> FAILED ({hist?.grade || 'F'})
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-slate-900 dark:text-white text-xs font-bold leading-snug break-words pt-0.5" title={u.title}>
                                    {u.title}
                                  </div>
                                </div>
                              );
                            })}

                            {sUnits.length > 3 && (
                              <button
                                type="button"
                                onClick={() => toggleTrimesterExpand(periodKey)}
                                className="w-full py-1.5 px-3 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 border border-slate-200 dark:border-slate-700"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Show Less</span>
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                  </>
                                ) : (
                                  <>
                                    <span>View More ({hiddenCount} more {hiddenCount === 1 ? 'unit' : 'units'})</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })()
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Unified Student Digital Signature Pad Component (Single Card for 72 CP Plan) */}
        <SignaturePad
          student={student}
          yearLevel="ALL"
          yearName="Official 3-Year Study Plan (72 CP)"
          planStatus={planStatus}
          planUnitsCount={planUnits.length}
          isAlreadyAgreed={isAlreadyAgreed || Boolean(currentPlan?.signature || currentPlan?.yearSignatures?.['ALL'] || currentPlan?.yearSignatures?.[1])}
          isYearCompleted={false}
          isYearLocked={false}
          onAgreePlan={(sigObj) => {
            if (onAgreePlan) onAgreePlan(sigObj, 'ALL');
          }}
          onRejectPlan={(reason) => {
            if (onRejectPlan) onRejectPlan(reason, 'ALL');
          }}
          currentSignature={currentPlan?.signature || currentPlan?.yearSignatures?.['ALL'] || currentPlan?.yearSignatures?.[1]}
        />

        {/* Semester Change Request Modal Dialog */}
        {activeRequestModal && (
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

        {/* Student Submit Plan Request Modal */}
        {showSubmitPlanRequestModal && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-50 animate-in fade-in duration-200 font-sans">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-slate-900 dark:text-white relative overflow-hidden">
              {/* Executive Academic Top Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-700 dark:bg-red-600" />

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-red-700 text-white flex items-center justify-center font-bold shadow-md shadow-red-700/20">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
                      Submit Study Plan Request
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubmitPlanRequestModal(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold transition-all cursor-pointer hover:scale-105"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Academic Year Selection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 font-heading uppercase tracking-wider">
                  1. Target Academic Year:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[2026, 2027, 2028].map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setReqYear(yr)}
                      className={`py-3.5 px-4 rounded-2xl text-xs md:text-sm font-black border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        reqYear === yr
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-red-700 dark:border-red-600 shadow-md font-heading scale-[1.01]'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold'
                      }`}
                    >
                      <Calendar className="w-4 h-4 opacity-80" />
                      <span>Year {yr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Teaching Period Selection: Trimester vs Semester Layout Choice */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 font-heading uppercase tracking-wider">
                  2. Select Teaching Period System & Terms:
                </label>

                {/* System Choice Radio Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setLayoutType('trimester');
                      setReqPeriods([3, 4, 5]);
                    }}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-black transition-all cursor-pointer font-heading flex flex-col justify-between gap-1.5 ${
                      layoutType === 'trimester'
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-red-700 dark:border-red-600 shadow-md scale-[1.01]'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Trimester System</span>
                      {layoutType === 'trimester' && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">Active</span>}
                    </div>
                    <span className="text-[10px] opacity-80 font-sans font-medium">3 Periods / Year (T1, T2, T3)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLayoutType('semester');
                      setReqPeriods([1, 2]);
                    }}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-black transition-all cursor-pointer font-heading flex flex-col justify-between gap-1.5 ${
                      layoutType === 'semester'
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-red-700 dark:border-red-600 shadow-md scale-[1.01]'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Semester System</span>
                      {layoutType === 'semester' && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">Active</span>}
                    </div>
                    <span className="text-[10px] opacity-80 font-sans font-medium">2 Semesters / Year (S1, S2)</span>
                  </button>
                </div>

                {/* Period Selection for Selected System */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-heading">
                    <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>{layoutType === 'semester' ? 'Select Target Semesters (2 Terms/Year):' : 'Select Target Trimesters (3 Terms/Year):'}</span>
                  </span>

                  <div className={`grid ${layoutType === 'semester' ? 'grid-cols-2' : 'grid-cols-3'} gap-2.5 text-xs`}>
                    {(layoutType === 'semester' ? [
                      { id: 1, label: 'Semester 1 (S1)' },
                      { id: 2, label: 'Semester 2 (S2)' }
                    ] : [
                      { id: 3, label: 'Trimester 1 (T1)' },
                      { id: 4, label: 'Trimester 2 (T2)' },
                      { id: 5, label: 'Trimester 3 (T3)' }
                    ]).map(t => {
                      const isChecked = reqPeriods.includes(t.id);
                      return (
                        <label
                          key={t.id}
                          className={`py-3 px-3.5 rounded-xl border text-center font-extrabold text-xs md:text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${
                            isChecked
                              ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-white shadow-md font-extrabold'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400 font-extrabold'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setReqPeriods(prev => [...prev, t.id]);
                              } else {
                                setReqPeriods(prev => prev.filter(p => p !== t.id));
                              }
                            }}
                            className="hidden"
                          />
                          <span>{t.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Additional Request Comment */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 font-heading uppercase tracking-wider">
                    3. Request Comments / Notes for Chair:
                  </label>
                  <span className="text-xs text-slate-400 font-sans italic">(Optional)</span>
                </div>

                {/* Suggestion Chips */}
                <div className="flex flex-wrap gap-2 pb-1">
                  {[
                    `Full ${reqYear} Fast-Track Replan`,
                    `Focus on Core Major Electives`,
                    layoutType === 'semester' ? `Adjust Semester 2 Unit Load` : `Adjust Trimester 3 Unit Load`
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReqComment(prev => prev ? `${prev} - ${chip}` : chip)}
                      className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={reqComment}
                  onChange={(e) => setReqComment(e.target.value)}
                  placeholder={layoutType === 'semester' ? "e.g. Requesting study plan for 2026 Semesters 1 & 2 with focus on major core electives..." : "e.g. Requesting study plan for 2026 Trimesters 1, 2, 3 with focus on major core electives..."}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs md:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-red-600 shadow-inner"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitPlanRequestModal(false)}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs md:text-sm font-extrabold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (reqPeriods.length === 0) {
                      alert(layoutType === 'semester' ? 'Please select at least one semester period.' : 'Please select at least one trimester period.');
                      return;
                    }
                    if (onStudentSubmitPlanRequest) {
                      onStudentSubmitPlanRequest({
                        year: reqYear,
                        periodIds: reqPeriods,
                        layoutType: layoutType,
                        comment: reqComment.trim()
                      });
                    }
                    setShowSubmitPlanRequestModal(false);
                  }}
                  className="px-7 py-3 bg-red-700 hover:bg-red-800 text-white rounded-2xl text-xs md:text-sm font-black shadow-lg shadow-red-700/25 flex items-center gap-2.5 cursor-pointer font-heading tracking-tight active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Request</span>
                </button>
              </div>
            </div>
          </div>
        )}
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
          <div className={`p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 transition-all font-sans relative overflow-hidden ${
            isPlanLocked
              ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/5 dark:from-amber-950/40 dark:via-slate-900/40 dark:to-slate-900/80 border border-amber-300/80 dark:border-amber-800/80'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                isPlanLocked
                  ? 'bg-amber-100 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border-amber-300/70 dark:border-amber-800/70'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}>
                {isPlanLocked ? <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400" />}
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                    {isPlanLocked ? 'Study Plan Locked' : 'Academic Plan Governance'}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border font-mono ${
                    planStatus === 'approved' ? 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
                    planStatus === 'agreed' ? 'bg-sky-100/90 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800' :
                    planStatus === 'recommended' ? 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {planStatus === 'draft' ? 'Drafting Sequence' : planStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {planStatus === 'draft' && 'Structure units on the canvas and click Recommend to Student at the bottom when ready.'}
                  {planStatus === 'recommended' && 'Plan recommended to student & locked from canvas edits. To modify units, click Retrieve & Amend in Stored Repository.'}
                  {planStatus === 'agreed' && 'Student digital sign-off complete. Click Final Approve below or Retrieve & Amend in Repository to edit.'}
                  {planStatus === 'approved' && 'Official approved plan archived & locked. To create a new draft version, click Retrieve & Amend in Stored Repository.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowWorkflowGuide(prev => !prev)}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0 ${
                showWorkflowGuide
                  ? 'bg-red-700 text-white border border-red-800 shadow-xs'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
              title="Toggle System Workflow & User Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>{showWorkflowGuide ? 'Hide User Guide' : 'System User Guide'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showWorkflowGuide ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {/* STUDENT SUBMITTED PLAN REQUEST ALERT BANNER */}
        {currentPlan?.status === 'request_submitted' && (
          <div className="bg-purple-50 dark:bg-purple-950/60 border-2 border-purple-400 dark:border-purple-700 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans text-purple-950 dark:text-purple-100">
            <div className="flex items-start gap-3">
              <Sliders className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider font-heading text-purple-900 dark:text-purple-200">
                    📩 Student Plan Request Submitted
                  </span>
                  <span className="text-[10px] font-mono bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 px-2 py-0.5 rounded font-bold">
                    Target Year {currentPlan.requestYear || 2026}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Student requested study plan for Trimesters 1, 2, 3 ({currentPlan.requestYear || 2026}). {currentPlan.requestComment && <em className="italic">"{currentPlan.requestComment}"</em>}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Choose <strong>Auto System Generation</strong> to select target semesters and build an optimal plan, or arrange units manually.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto">
              {onAutoGeneratePlan && (
                <button
                  type="button"
                  onClick={handleOpenAutoGenModal}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-purple-900 dark:hover:bg-purple-800 rounded-xl text-xs font-extrabold shadow-2xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 border border-slate-700 font-sans"
                  title="Auto-fill recommended study plan based on course offerings and prerequisite rules"
                >
                  <Wand2 className="w-3.5 h-3.5 text-purple-200 dark:text-purple-300 shrink-0" />
                  <span>Auto-Fill Preset Plan</span>
                </button>
              )}
            </div>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 font-sans text-slate-900 dark:text-white animate-in slide-in-from-top-2 duration-200 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 flex items-center justify-center shadow-2xs shrink-0 border border-red-200/60 dark:border-red-900/60">
                  <HelpCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                    {isChair ? 'Academic Chair System Workflow & SOP' : 'Student Study Plan Workflow & Guide'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {isChair ? 'Step-by-step operating guide for structuring, validating, and approving student study plans.' : 'Step-by-step guide for submitting requests, reviewing recommended units, and digitally signing your study plan.'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono border ${isChair
                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                }`}>
                {isChair ? 'Academic Chair Role' : 'Student Role'}
              </span>
            </div>

            {isChair ? (
              /* ACADEMIC CHAIR WORKFLOW GUIDE */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs font-sans relative z-10">
                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-red-700 dark:text-red-400 flex items-center gap-1.5 font-heading">
                    <UserCheck className="w-4 h-4 shrink-0" /> 1. Select Target Student
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
                    Click <strong>Select Student</strong> to load a student profile (Alex Mercer, Sarah Jenkins, etc.) to manage.
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-red-700 dark:text-red-400 flex items-center gap-1.5 font-heading">
                    <Layers className="w-4 h-4 shrink-0" /> 2. Auto Add / Drag & Drop
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
                    Click <strong>Auto System Generation</strong> or <strong>drag & drop</strong> units into Year 1, 2, 3 Trimesters (T1, T2, T3).
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-red-700 dark:text-red-400 flex items-center gap-1.5 font-heading">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> 3. Rule Validation Check
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
                    Verify validation rules on the left console (BR-01 Singapore Trimester availability & BR-02 Prerequisite progression).
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-red-700 dark:text-red-400 flex items-center gap-1.5 font-heading">
                    <ShieldCheck className="w-4 h-4 shrink-0" /> 4. Recommend & Approve
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
                    Click <strong>Recommend to Student</strong>. After student digital sign-off, click <strong>Final Approve Plan</strong> to archive.
                  </p>
                </div>
              </div>
            ) : (
              /* STUDENT WORKFLOW GUIDE */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs font-sans relative z-10">
                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 font-heading">
                    <Send className="w-4 h-4 shrink-0" /> 1. Submit Plan Request
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
                    Click <strong>Submit Plan Request</strong> at the top to select target trimesters and submit a request to your Chair.
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-heading">
                    <BookOpen className="w-4 h-4 shrink-0" /> 2. Review Recommended Units
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
                    Inspect scheduled subjects across Year 1, Year 2, and Year 3 Trimesters prepared for your degree major.
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-sky-700 dark:text-sky-400 flex items-center gap-1.5 font-heading">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> 3. Digital Sign-Off
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
                    Check the credit load acknowledgement and click <strong>Agree & Sign-Off Study Plan</strong> at the bottom.
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/90 dark:border-slate-700/90 space-y-1.5 shadow-2xs">
                  <div className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-heading">
                    <FileText className="w-4 h-4 shrink-0" /> 4. Export Certified PDF
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
                    Click <strong>Export PDF</strong> to generate or print your official certified 72 CP Study Plan document.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT COLUMN: 4/12 WIDTH (~1/3 SIDEBAR) - AVAILABLE UNIT OFFERINGS & VALIDATION CONSOLE */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6 self-start max-h-[calc(100vh-2.5rem)] overflow-y-auto pr-1 font-sans">

              {/* Box 1: Available Unit Offerings Palette */}
              <DroppablePaletteContainer
                filteredOfferings={filteredOfferings}
                unitFilter={unitFilter}
                setUnitFilter={setUnitFilter}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
                showAllCatalogUnits={showAllCatalogUnits}
                setShowAllCatalogUnits={setShowAllCatalogUnits}
                totalCatalogCount={effectiveCatalog.length}
                scheduledCodesSet={scheduledCodesSet}
                scheduledUnitsMap={scheduledUnitsMap}
                historyMap={historyMap}
                studentMajor={stMajor}
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
                    {onAutoGeneratePlan && (
                      <button
                        type="button"
                        onClick={handleOpenAutoGenModal}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-extrabold shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-slate-700 font-sans"
                        title="Auto-fill recommended study plan based on course offerings and prerequisite rules"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>Auto-Fill Preset Plan</span>
                      </button>
                    )}

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
                <div id="study-plan-years-section" className="bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-md font-sans scroll-mt-24">
                  
                  {/* Left & Right Slide Controls & Year Tabs */}
                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <button
                      type="button"
                      onClick={() => {
                        const targetLvl = activeYearLevel > 1 ? activeYearLevel - 1 : 1;
                        setActiveYearLevel(targetLvl);
                        if (viewMode === 'all') {
                          const el = document.getElementById(`year-block-${targetLvl}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      disabled={activeYearLevel === 1}
                      className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 shrink-0 font-extrabold text-xs shadow-2xs font-heading ${
                        activeYearLevel === 1
                          ? 'opacity-40 cursor-not-allowed bg-slate-200/60 dark:bg-slate-800/60 text-slate-400 border-transparent'
                          : 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer active:scale-95'
                      }`}
                      title="Slide to Previous Academic Year (<)"
                    >
                      <ChevronLeft className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                      <span>&lt; Prev Year</span>
                    </button>

                    {years.map(y => {
                      const isActive = viewMode === 'single' && activeYearLevel === y.level;
                      const isPassed = passedYears.has(y.level);
                      const yearUnitsCP = planUnits
                        .filter(u => u.year_level === y.level)
                        .reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
                      const yearCP = isPassed ? 36 : yearUnitsCP;

                      return (
                        <button
                          key={y.level}
                          type="button"
                          onClick={() => {
                            setActiveYearLevel(y.level);
                            if (viewMode === 'all') {
                              const el = document.getElementById(`year-block-${y.level}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            } else {
                              setViewMode('single');
                            }
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                            isActive
                              ? 'bg-red-700 hover:bg-red-800 text-white shadow-md font-heading border-red-800 scale-[1.02]'
                              : isPassed
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{y.yearName}</span>
                          {isPassed && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-sans flex items-center gap-1 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                            }`}>
                              ✓ Passed
                            </span>
                          )}
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {yearCP} CP
                          </span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        const targetLvl = activeYearLevel < 3 ? activeYearLevel + 1 : 3;
                        setActiveYearLevel(targetLvl);
                        if (viewMode === 'all') {
                          const el = document.getElementById(`year-block-${targetLvl}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      disabled={activeYearLevel === 3}
                      className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 shrink-0 font-extrabold text-xs shadow-2xs font-heading ${
                        activeYearLevel === 3
                          ? 'opacity-40 cursor-not-allowed bg-slate-200/60 dark:bg-slate-800/60 text-slate-400 border-transparent'
                          : 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer active:scale-95'
                      }`}
                      title="Slide to Next Academic Year (>)"
                    >
                      <span>Next Year &gt;</span>
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    </button>
                  </div>

                  {/* Mode & Layout Switchers */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Layout Mode Switcher: Trimester (3 Terms) vs Semester (2 Semesters) */}
                    <div className="flex items-center gap-1 bg-slate-900 text-white dark:bg-slate-900/90 border border-slate-800 rounded-2xl p-1 text-xs shrink-0 font-sans shadow-md">
                      <button
                        type="button"
                        onClick={() => setLayoutType('trimester')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
                          layoutType === 'trimester'
                            ? 'bg-red-700 text-white shadow-md'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Switch canvas view to 3 Trimesters / Year layout (T1, T2, T3)"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Trimester View (3 Terms)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLayoutType('semester')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
                          layoutType === 'semester'
                            ? 'bg-red-700 text-white shadow-md'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Switch canvas view to 2 Semesters / Year layout (S1, S2)"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Semester View (2 Semesters)</span>
                      </button>
                    </div>

                    {/* Mode Switcher: Single Year vs 3-Year Overview */}
                    <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-2xl p-1 text-xs shrink-0 font-sans shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setViewMode('single')}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer font-heading ${
                          viewMode === 'single'
                            ? 'bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Single Year
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('all')}
                        className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer font-heading ${
                          viewMode === 'all'
                            ? 'bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        3-Year Overview
                      </button>
                    </div>
                  </div>
                </div>

                {/* Drag & Drop Year Grid Canvas */}
                <div className="space-y-5">
                  {(viewMode === 'all' ? years : years.filter(y => y.level === activeYearLevel)).map(yearObj => {
                    const isYearPassed = passedYears.has(yearObj.level);
                    const yearUnitsCP = planUnits
                      .filter(u => u.year_level === yearObj.level)
                      .reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
                    const yearDisplayCP = isYearPassed ? 36 : yearUnitsCP;

                    return (
                      <div
                        key={yearObj.level}
                        id={`year-block-${yearObj.level}`}
                        className={`bg-white dark:bg-slate-900 border transition-all rounded-3xl p-5 md:p-6 shadow-sm space-y-4 scroll-mt-24 ${
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

                            {/* Year Total CP Badge */}
                            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono font-bold">
                              Year Load: {yearDisplayCP} / 36 CP
                            </span>

                            {/* Layout Mode Switcher: Trimester vs Semester */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-0.5 text-xs font-sans">
                              <button
                                type="button"
                                onClick={() => setLayoutType('trimester')}
                                className={`px-3 py-1 rounded-lg text-xs font-extrabold shadow-2xs font-heading flex items-center gap-1.5 cursor-pointer transition-all ${
                                  layoutType === 'trimester'
                                    ? 'bg-red-700 text-white dark:bg-red-700 dark:text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                title="Switch to Trimester Layout (3 trimesters per year)"
                              >
                                <span>Trimester Layout</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setLayoutType('semester')}
                                className={`px-3 py-1 rounded-lg text-xs font-extrabold shadow-2xs font-heading flex items-center gap-1.5 cursor-pointer transition-all ${
                                  layoutType === 'semester'
                                    ? 'bg-red-700 text-white dark:bg-red-700 dark:text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                title="Switch to Semester Layout (2 semesters per year)"
                              >
                                <span>Semester Layout</span>
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
                            const unitsInPeriod = getSemesterUnits(yearObj.level, period.period_id);
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
                                isReadOnly={isYearPassed}
                                isPassedYear={isYearPassed}
                                isChair={isChair}
                                changeRequest={changeReq}
                                onResolveChangeRequest={onRemoveSemesterRequest ? () => onRemoveSemesterRequest(periodKey) : undefined}
                                onRequestChange={(!isChair && !isYearPassed) ? (key, periodName) => {
                                  setActiveRequestModal({
                                    key,
                                    periodName
                                  });
                                  setRequestCommentInput(semesterRequests[key] || '');
                                } : undefined}
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
                              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
                                activeYearLevel === 1
                                  ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800/50'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs active:scale-95'
                              }`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span>{activeYearLevel > 1 ? `Previous (Year ${activeYearLevel - 1})` : 'Previous Year'}</span>
                            </button>

                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 font-sans shadow-2xs">
                              Year {activeYearLevel} of 3
                            </span>

                            <button
                              type="button"
                              onClick={() => setActiveYearLevel(prev => Math.min(3, prev + 1))}
                              disabled={activeYearLevel === 3}
                              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
                                activeYearLevel === 3
                                  ? 'opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800/50'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-2xs active:scale-95'
                              }`}
                            >
                              <span>{activeYearLevel < 3 ? `Next (Year ${activeYearLevel + 1})` : 'Next Year'}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
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
                        {(planStatus === 'draft' || planStatus === 'request_submitted' || planStatus === 'recommended') && (
                          <button
                            onClick={() => onRecommendPlan && onRecommendPlan()}
                            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-red-800 font-sans"
                          >
                            <Send className="w-4 h-4 text-white/90" />
                            <span>{planStatus === 'recommended' ? 'Update & Re-Recommend' : 'Recommend Study Plan to Student'}</span>
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
        <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeDragItem ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-red-600 dark:border-red-500 shadow-2xl p-3.5 rounded-2xl text-xs font-sans cursor-grabbing flex items-center justify-between w-72 select-none ring-4 ring-red-500/20 rotate-1 scale-105 transition-transform duration-75 ease-out">
              <div className="flex items-center gap-2.5 min-w-0">
                <GripVertical className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-extrabold text-white bg-red-700 text-xs px-2.5 py-0.5 rounded-md font-mono shrink-0">{activeDragItem.code}</span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 font-mono shrink-0">{activeDragItem.credit_points || 3} CP</span>
                  </div>
                  <div className="text-slate-900 dark:text-white font-bold truncate max-w-[170px] mt-1">{activeDragItem.title}</div>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>

        {/* Semester Change Request Modal Dialog */}
        {activeRequestModal && (
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
        {/* AUTO SYSTEM GENERATION SCOPE SELECTION MODAL */}
        {showAutoGenModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[999] flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white space-y-5">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-100/80 dark:bg-red-950/80 text-red-700 dark:text-red-300 rounded-2xl border border-red-200/60 dark:border-red-900/60 shadow-2xs">
                    <Wand2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                      Auto-Fill Preset Plan Options
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Configure study layout, academic scope, and core unit placement rules
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAutoGenModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student Request Notice if available */}
              {currentPlan?.requestYear && (
                <div className="bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 p-3 rounded-2xl text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2 font-medium">
                  <span className="font-mono font-bold bg-purple-200 dark:bg-purple-900 px-2 py-0.5 rounded-lg text-[11px]">
                    Student Request
                  </span>
                  <span>Requested Year {currentPlan.requestYear} ({currentPlan.requestPeriods ? currentPlan.requestPeriods.map(p=> p===3?'T1':p===4?'T2':'T3').join(', ') : 'All Trimesters'})</span>
                </div>
              )}

              {/* 1. Study Mode Layout */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-heading">
                  1. Study Mode Layout:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setModalLayoutType('trimester');
                      setScopePeriods([3, 4, 5]);
                    }}
                    className={`p-3 rounded-2xl border text-left text-xs font-extrabold transition-all cursor-pointer font-heading ${
                      modalLayoutType === 'trimester'
                        ? 'border-red-700 bg-red-700 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Trimester Layout</span>
                      {modalLayoutType === 'trimester' && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Active</span>}
                    </div>
                    <span className="block text-[10px] opacity-80 font-sans font-medium mt-0.5">3 Terms / Year (Singapore)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalLayoutType('semester');
                      setScopePeriods([1, 2]);
                    }}
                    className={`p-3 rounded-2xl border text-left text-xs font-extrabold transition-all cursor-pointer font-heading ${
                      modalLayoutType === 'semester'
                        ? 'border-red-700 bg-red-700 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Semester Layout</span>
                      {modalLayoutType === 'semester' && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Active</span>}
                    </div>
                    <span className="block text-[10px] opacity-80 font-sans font-medium mt-0.5">2 Semesters / Year (Singapore)</span>
                  </button>
                </div>
              </div>

              {/* 2. Target Academic Year Scope */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-heading">
                  2. Target Academic Year Scope:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'all', label: 'All 3 Years (72 CP)' },
                    { id: 1, label: 'Year 1 (2026)' },
                    { id: 2, label: 'Year 2 (2027)' },
                    { id: 3, label: 'Year 3 (2028)' }
                  ].map(opt => {
                    const isPassed = typeof opt.id === 'number' && passedYears.has(opt.id);
                    const isSelected = scopeYear === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (isPassed) {
                            setDragWarningToast(`Year ${opt.id} is already completed in history. Selecting 'All 3 Years' will auto-fulfill open units in Year 2 & 3.`);
                            setScopeYear('all');
                          } else {
                            setScopeYear(opt.id);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left text-xs font-extrabold transition-all cursor-pointer flex flex-col justify-between gap-1 font-heading ${
                          isSelected
                            ? 'border-red-700 bg-red-700 text-white shadow-xs'
                            : isPassed
                            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{isSelected ? '✓ ' : ''}{opt.label}</span>
                          {isPassed && <span className="text-[10px] font-extrabold font-mono bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-1.5 py-0.5 rounded-md">🔒 Passed</span>}
                        </span>
                        {isPassed && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal font-sans">Completed in History</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Target Periods to Prioritize */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-heading">
                  3. Target Periods to Prioritize:
                </label>
                <div className={`grid ${modalLayoutType === 'semester' ? 'grid-cols-2' : 'grid-cols-3'} gap-2.5`}>
                  {(modalLayoutType === 'semester' ? [
                    { id: 1, label: 'Semester 1 (S1)' },
                    { id: 2, label: 'Semester 2 (S2)' }
                  ] : [
                    { id: 3, label: 'Trimester 1 (T1)' },
                    { id: 4, label: 'Trimester 2 (T2)' },
                    { id: 5, label: 'Trimester 3 (T3)' }
                  ]).map(t => {
                    const selected = scopePeriods.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            if (scopePeriods.length > 1) {
                              setScopePeriods(scopePeriods.filter(p => p !== t.id));
                            }
                          } else {
                            setScopePeriods([...scopePeriods, t.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-extrabold transition-all cursor-pointer font-heading ${
                          selected
                            ? 'border-red-700 bg-red-700 text-white shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {selected ? '✓ ' : ''}{t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Core-Only Strategy Option Toggle */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-heading">
                  4. Auto-Fill Content Strategy:
                </label>
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                    <span className="font-extrabold text-slate-900 dark:text-white font-heading">
                      Prescribed Core Units Only (Recommended)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Automatically schedules official Degree Core & Major Core requirements according to your major catalog. Elective slots are left open for manual drag-and-drop customization.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAutoGenModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAutoGenModal(false);
                    setLayoutType(modalLayoutType);
                    if (onAutoGeneratePlan) {
                      onAutoGeneratePlan(student?.student_id, {
                        targetYearLevel: scopeYear,
                        requestPeriods: scopePeriods,
                        layoutType: modalLayoutType
                      });
                    }
                  }}
                  className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 font-heading"
                >
                  <Wand2 className="w-4 h-4 text-white" />
                  <span>Apply Auto-Fill Preset</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
