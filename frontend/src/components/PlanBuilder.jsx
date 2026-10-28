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
import { getDynamicOfferings } from './CourseCatalogPreview';
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
  MessageSquareQuote,
  Send,
  AlertCircle,
  Clock,
  Sparkles,
  Sliders,
  Wand2,
  Cpu,
  Building2,
  X,
  XCircle,
  FileEdit
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
  onAutoGeneratePlan,
  onWaiverChange,
  notifications = [],
  onUnlockForAmendment,
  onResetPlan
}) {
  const isChair = activeRole === 'chair';
  const [unitFilter, setUnitFilter] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [layoutType, setLayoutType] = useState('trimester'); // Default to Singapore Trimester Focus
  const [studentLayoutMode, setStudentLayoutMode] = useState('trimester'); // Independent Student View Layout Mode
  const [paletteLayoutMode, setPaletteLayoutMode] = useState('trimester'); // Independent Palette Layout Mode
  const [activeYearLevel, setActiveYearLevel] = useState(1); // 1: Year 1 (2026), 2: Year 2 (2027), 3: Year 3 (2028)
  const [viewMode, setViewMode] = useState('single'); // 'single' = Single Year Focus Slide, 'all' = All Years Grid
  const [agreedConfirmed, setAgreedConfirmed] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const [showAllCatalogUnits, setShowAllCatalogUnits] = useState(true);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);
  const [activeRequestModal, setActiveRequestModal] = useState(null);
  const [requestCommentInput, setRequestCommentInput] = useState('');
  const [dragWarningToast, setDragWarningToast] = useState(null);
  const [expandedTrimesters, setExpandedTrimesters] = useState({});
  const [showDisagreeModal, setShowDisagreeModal] = useState(false);
  const [disagreeReasonInput, setDisagreeReasonInput] = useState('');

  // Student Submit Request Modal State
  const [showSubmitPlanRequestModal, setShowSubmitPlanRequestModal] = useState(false);
  const [reqYear, setReqYear] = useState(2026);
  const [reqPeriods, setReqPeriods] = useState([3, 4, 5]); // Default all 3 trimesters selected
  const [reqComment, setReqComment] = useState('');

  // Active Plan Status
  const planStatus = currentPlan ? currentPlan.status : 'draft';

  // Disagreement / Rejection Feedback detection from currentPlan or notifications
  const studentDisagreementNotif = (notifications || []).find(n =>
    (Number(n.studentId) === Number(student?.student_id) || String(n.studentId) === String(student?.student_id)) &&
    (n.title?.includes('Disagreed') || n.title?.includes('Change Requested') || n.title?.includes('Rejected'))
  );

  const notifFeedbackComment = studentDisagreementNotif?.rejectionComment || 
                               studentDisagreementNotif?.comment || 
                               (studentDisagreementNotif?.message?.match(/"([^"]+)"/)?.[1]) || 
                               null;

  const effectiveRejectionComment = currentPlan?.rejectionComment || 
                                    currentPlan?.rejection_comment || 
                                    notifFeedbackComment || 
                                    null;

  const isPlanDisagreed = planStatus === 'rejected' || 
                          currentPlan?.status === 'rejected' || 
                          Boolean(effectiveRejectionComment) || 
                          Boolean(studentDisagreementNotif);

  // Active Plan Lock Check
  // Academic Chair can ALWAYS edit if:
  // 1. Student requested changes / disagreed (isPlanDisagreed)
  // 2. Plan was retrieved for amendment (currentPlan?.isAmending)
  // 3. Plan is in draft, request_submitted, or rejected
  const isPlanLocked = !isChair ? (
    planStatus === 'recommended' || planStatus === 'agreed' || planStatus === 'approved'
  ) : (
    !currentPlan?.isAmending &&
    !isPlanDisagreed &&
    (planStatus === 'recommended' || planStatus === 'agreed' || planStatus === 'approved')
  );

  // View More / Show Less toggle state for student feedback and change requests
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);

  const semesterRequestEntries = useMemo(() => {
    return Object.entries(semesterRequests || {}).filter(
      ([_, comment]) => typeof comment === 'string' && comment.trim().length > 0
    );
  }, [semesterRequests]);

  const isCommentLong = Boolean(effectiveRejectionComment && (effectiveRejectionComment.length > 110 || effectiveRejectionComment.includes('\n')));
  const hasSemesterRequests = semesterRequestEntries.length > 0;
  const canToggleFeedback = Boolean(isCommentLong || hasSemesterRequests);

  // Academic Chair Waiver State (VAL-04 / M05:R422)
  const [waivedUnits, setWaivedUnits] = useState(() => new Set(currentPlan?.waivedUnits || []));

  useEffect(() => {
    if (currentPlan?.waivedUnits) {
      setWaivedUnits(new Set(currentPlan.waivedUnits));
    }
  }, [currentPlan?.waivedUnits]);

  const handleToggleWaiver = (unitCode) => {
    setWaivedUnits(prev => {
      const next = new Set(prev);
      const isNowWaived = !next.has(unitCode);
      if (isNowWaived) {
        next.add(unitCode);
        setDragWarningToast(`Academic Chair Waiver Approved: Prerequisite for ${unitCode} officially waived.`);
      } else {
        next.delete(unitCode);
        setDragWarningToast(`Academic Chair Waiver revoked for unit ${unitCode}.`);
      }
      setTimeout(() => setDragWarningToast(null), 5000);
      if (onWaiverChange) {
        onWaiverChange(unitCode, isNowWaived);
      }
      return next;
    });
  };

  // Auto System Generation Scope Selection Modal State
  const [showAutoGenModal, setShowAutoGenModal] = useState(false);
  const [scopeYears, setScopeYears] = useState([2, 3]);
  const [scopePeriods, setScopePeriods] = useState([3, 4, 5]);
  const [modalLayoutType, setModalLayoutType] = useState('trimester');

  const stName = student ? `${student.first_name || 'Alex'} ${student.last_name || 'Mercer'}` : 'Alex Mercer';
  const stNumber = student ? student.student_number : '31234561';
  const stCourse = student ? (student.course_code || 'PT3-BSIT-01') : 'PT3-BSIT-01';
  const stMajor = student?.major || (student?.course_name && student.course_name.includes('Major:')
    ? student.course_name.split('Major:')[1].replace(')', '').trim()
    : 'Software Engineering');

  // Calculate completed/passed years from student history
  const passedYears = useMemo(() => {
    const completedHistory = (history || []).filter(h => h.status === 'completed');
    const set = new Set();
    const yr1Count = completedHistory.filter(h => (h.year_taken === 2026 || h.academic_year === 2026) || (h.period_id >= 3 && h.period_id <= 5 && ((h.year_taken && h.year_taken <= 2026) || (!h.year_taken && !h.academic_year)))).length;
    if (yr1Count >= 6) set.add(1);
    const yr2Count = completedHistory.filter(h => (h.year_taken === 2027 || h.academic_year === 2027)).length;
    if (yr2Count >= 6) set.add(2);
    return set;
  }, [history]);

  // Default reqYear to first non-completed year (e.g. 2027 if Year 1 is passed)
  useEffect(() => {
    const yrLvl = reqYear === 2027 ? 2 : reqYear === 2028 ? 3 : 1;
    if (passedYears.has(yrLvl)) {
      const nextAvailable = passedYears.has(1)
        ? (passedYears.has(2) ? 2028 : 2027)
        : 2026;
      setReqYear(nextAvailable);
    }
  }, [passedYears, reqYear]);

  // Auto-scroll and align with target Year level block whenever reviewing a plan
  useEffect(() => {
    if (currentPlan?.targetYearLevel || currentPlan?.forceScrollTrigger) {
      const targetLvl = Number(currentPlan.targetYearLevel) || 1;
      setActiveYearLevel(targetLvl);
      if (currentPlan?.layoutType) {
        setLayoutType(currentPlan.layoutType);
        setModalLayoutType(currentPlan.layoutType);
        setStudentLayoutMode(currentPlan.layoutType);
      }

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
  }, [currentPlan?.targetYearLevel, currentPlan?.status, currentPlan?.updated_at, currentPlan?.forceScrollTrigger, currentPlan?.layoutType]);

  // Keep studentLayoutMode synced whenever currentPlan layoutType changes
  useEffect(() => {
    if (currentPlan?.layoutType) {
      setStudentLayoutMode(currentPlan.layoutType);
    }
  }, [currentPlan?.layoutType]);

  const handleOpenAutoGenModal = () => {
    if (!isChair && isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }

    // Synchronize modal layout type with current plan's layoutType or canvas layoutType
    const targetLayout = currentPlan?.layoutType || layoutType || 'trimester';
    setModalLayoutType(targetLayout);

    // Default selected years to open/uncompleted years or current request year
    let defaultYears = [1, 2, 3].filter(y => !passedYears.has(y));
    if (currentPlan?.requestYear) {
      const reqY = Number(currentPlan.requestYear) === 2027 ? 2 : Number(currentPlan.requestYear) === 2028 ? 3 : 1;
      if (!passedYears.has(reqY)) {
        defaultYears = [reqY];
      }
    } else if (activeYearLevel && typeof activeYearLevel === 'number' && !passedYears.has(activeYearLevel)) {
      defaultYears = [activeYearLevel];
    }
    if (defaultYears.length === 0) defaultYears = [2, 3];
    setScopeYears(defaultYears);

    // Synchronize periods based on layout
    if (targetLayout === 'semester') {
      let semPeriods = [1, 2];
      if (currentPlan?.requestPeriods && currentPlan.requestPeriods.length > 0) {
        const filtered = currentPlan.requestPeriods.map(Number).filter(p => p === 1 || p === 2);
        if (filtered.length > 0) semPeriods = filtered;
      }
      setScopePeriods(semPeriods);
    } else {
      let triPeriods = [3, 4, 5];
      if (currentPlan?.requestPeriods && currentPlan.requestPeriods.length > 0) {
        const filtered = currentPlan.requestPeriods.map(Number).filter(p => p >= 3 && p <= 5);
        if (filtered.length > 0) triPeriods = filtered;
      }
      setScopePeriods(triPeriods);
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
      setModalLayoutType(currentPlan.layoutType);
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

  const t3RestrictedUnits = useMemo(() => new Set(['ICT301']), []);
  const s1OnlyUnits = useMemo(() => new Set(), []);
  const s2OnlyUnits = useMemo(() => new Set(), []);

  // Complete Warnings List & Unit-level Warning Map
  const warningsByUnit = {};
  const warningsList = [];

  const appendUnitWarning = (code, msg) => {
    if (!code || !msg) return;
    if (warningsByUnit[code]) {
      if (!warningsByUnit[code].includes(msg)) {
        warningsByUnit[code] = `${warningsByUnit[code]} • ${msg}`;
      }
    } else {
      warningsByUnit[code] = msg;
    }
  };

  // Merge backend warnings if available
  if (validationResult && validationResult.warnings) {
    validationResult.warnings.forEach(w => {
      if (w.unitCode && completedUnitCodes.has(w.unitCode)) return;
      const isPrereq = w.type?.includes('PREREQUISITE') || Boolean(w.prereqCode);
      const isWaived = w.unitCode && waivedUnits.has(w.unitCode) && isPrereq;
      if (isWaived) {
        warningsList.push({
          ...w,
          severity: 'waived',
          isWaived: true,
          message: `[Chair Waiver Approved] Prerequisite waived by Academic Chair for ${w.unitCode}.`
        });
      } else {
        warningsList.push(w);
        if (w.unitCode) {
          appendUnitWarning(w.unitCode, w.message);
        }
      }
    });
  }

  // Real-time BR-01 Offering & BR-02 Prerequisite checks on planUnits
  planUnits.forEach(unit => {
    // If unit is already completed & passed in history, skip validation warnings for it
    if (completedUnitCodes.has(unit.code) || (history || []).some(h => (h.status === 'completed' || h.status === 'passed') && (h.unit_code === unit.code || h.code === unit.code))) return;

    const isTri3 = unit.period_id === 5;
    const isS1Only = unit.period_id === 1;
    const isS2Only = unit.period_id === 2;

    // BR-01 Offering Check (Evaluates dynamically for both Semester and Trimester periods)
    const isSemPeriod = unit.period_id === 1 || unit.period_id === 2;
    const allowedOfferings = getDynamicOfferings(unit.code, isSemPeriod ? 'semester' : 'trimester');
    let currentTermKey = null;
    let currentTermName = '';
    if (isSemPeriod) {
      currentTermKey = unit.period_id === 1 ? 'Sem 1' : 'Sem 2';
      currentTermName = unit.period_id === 1 ? 'Semester 1' : 'Semester 2';
    } else {
      if (unit.period_id === 3) {
        currentTermKey = 'Tri 1';
        currentTermName = 'Trimester 1';
      } else if (unit.period_id === 4) {
        currentTermKey = 'Tri 2';
        currentTermName = 'Trimester 2';
      } else if (unit.period_id === 5) {
        currentTermKey = 'Tri 3';
        currentTermName = 'Trimester 3';
      }
    }

    if (currentTermKey && !allowedOfferings.includes(currentTermKey)) {
      const allowedStr = allowedOfferings.join(', ');
      const msg = `Unit ${unit.code} (${unit.title || unit.code}) is offered ONLY in ${allowedStr} at Singapore Campus, but is scheduled in Year ${unit.year_level} ${currentTermName}.`;
      appendUnitWarning(unit.code, msg);
      if (!warningsList.some(w => w.unitCode === unit.code && w.type === 'BR-01_OFFERING_MISMATCH')) {
        warningsList.push({
          type: 'BR-01_OFFERING_MISMATCH',
          severity: 'error',
          unitCode: unit.code,
          message: msg,
          isWaived: false
        });
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
        const isWaived = waivedUnits.has(unit.code);
        const msg = isWaived
          ? `[Chair Waiver Approved] Prerequisite Subject ${prereqCode} waived by Academic Chair for ${unit.code}.`
          : `Prerequisite Subject ${prereqCode} was FAILED in student history. You must re-enroll and pass ${prereqCode} before taking ${unit.code}.`;
        if (!isWaived) appendUnitWarning(unit.code, msg);
        if (!warningsList.some(w => w.unitCode === unit.code && (w.type === 'BR-02_PREREQUISITE_FAILED' || w.type === 'BR-02_PREREQUISITE_UNMET'))) {
          warningsList.push({ type: 'BR-02_PREREQUISITE_FAILED', severity: isWaived ? 'waived' : 'error', unitCode: unit.code, prereqCode, message: msg, isWaived });
        }
      } else if (!isCompleted && !isScheduledPrior) {
        const isWaived = waivedUnits.has(unit.code);
        const msg = isWaived
          ? `[Chair Waiver Approved] Prerequisite Subject ${prereqCode} waived by Academic Chair for ${unit.code}.`
          : `Unit ${unit.code} requires prerequisite ${prereqCode}, which is neither completed in history nor scheduled in a prior teaching period.`;
        if (!isWaived) appendUnitWarning(unit.code, msg);
        if (!warningsList.some(w => w.unitCode === unit.code && (w.type === 'BR-02_PREREQUISITE_UNMET' || w.type === 'BR-02_PREREQUISITE_FAILED'))) {
          warningsList.push({ type: 'BR-02_PREREQUISITE_UNMET', severity: isWaived ? 'waived' : 'error', unitCode: unit.code, prereqCode, message: msg, isWaived });
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

  // Validate prerequisite, general elective rule, and max 12 CP capacity limit for unit placement
  const validatePlacement = (unitCode, targetYear, targetPeriod, currentUnits, activeDragCode = null) => {
    // 0. Duplicate Unit Prevention: Check if unit was already passed in student history
    if (completedUnitCodes && completedUnitCodes.has(unitCode)) {
      return {
        valid: false,
        message: `Duplicate Course Prevented: Unit ${unitCode} has ALREADY been completed in student official academic history.`
      };
    }

    // Duplicate Unit Prevention: Check if unit is already placed elsewhere on the study plan canvas
    const alreadyScheduled = currentUnits.find(u => u.code === unitCode && (!activeDragCode || u.code !== activeDragCode));
    if (alreadyScheduled) {
      const p = alreadyScheduled.period_id;
      const pName = p === 1 ? 'Semester 1' : p === 2 ? 'Semester 2' : p === 3 ? 'Trimester 1' : p === 4 ? 'Trimester 2' : 'Trimester 3';
      return {
        valid: false,
        message: `Duplicate Course Prevented: Unit ${unitCode} is ALREADY scheduled in Year ${alreadyScheduled.year_level} ${pName}.`
      };
    }

    // 0.1 General Elective Mutual Exclusion Check (Only ONE of MSP200 or COM203 can be selected)
    if (unitCode === 'MSP200' || unitCode === 'COM203') {
      const otherCode = unitCode === 'MSP200' ? 'COM203' : 'MSP200';
      const isOtherCompleted = completedUnitCodes.has(otherCode);
      const isOtherScheduled = currentUnits.some(u => u.code === otherCode && (!activeDragCode || u.code !== activeDragCode));
      if (isOtherCompleted || isOtherScheduled) {
        return {
          valid: false,
          message: `General Elective Conflict: Student has ALREADY ${isOtherCompleted ? 'completed in history' : 'scheduled'} ${otherCode}. Only ONE General Elective (${unitCode} OR ${otherCode}) is required for degree completion.`
        };
      }
    }

    // 0.2 Offering Availability Check (BR-01: Validates for both Semester and Trimester)
    const isSemTarget = targetPeriod === 1 || targetPeriod === 2;
    const allowedOfferings = getDynamicOfferings(unitCode, isSemTarget ? 'semester' : 'trimester');
    let targetTermKey = null;
    let targetTermName = '';
    if (isSemTarget) {
      targetTermKey = targetPeriod === 1 ? 'Sem 1' : 'Sem 2';
      targetTermName = targetPeriod === 1 ? 'Semester 1' : 'Semester 2';
    } else {
      if (targetPeriod === 3) {
        targetTermKey = 'Tri 1';
        targetTermName = 'Trimester 1';
      } else if (targetPeriod === 4) {
        targetTermKey = 'Tri 2';
        targetTermName = 'Trimester 2';
      } else if (targetPeriod === 5) {
        targetTermKey = 'Tri 3';
        targetTermName = 'Trimester 3';
      }
    }

    let warningNotice = null;

    if (targetTermKey && !allowedOfferings.includes(targetTermKey)) {
      const allowedStr = allowedOfferings.join(', ');
      warningNotice = `Offering Notice (BR-01): Unit ${unitCode} is offered ONLY in ${allowedStr} at Singapore Campus. Placed on canvas with offering mismatch flagged in Rule Engine.`;
    }

    // 0.3 Prerequisite Progression Check (BR-02: Prerequisite rules are identical for both Semester and Trimester)
    const prereqCode = prereqMap[unitCode];
    if (prereqCode) {
      const isCompleted = completedUnitCodes.has(prereqCode);
      const isWaived = waivedUnits && waivedUnits.has && waivedUnits.has(unitCode);
      if (!isCompleted && !isWaived) {
        const isScheduledPrior = currentUnits.some(other => {
          if (other.code !== prereqCode || (activeDragCode && other.code === activeDragCode)) return false;
          if (Number(other.year_level) < Number(targetYear)) return true;
          if (Number(other.year_level) === Number(targetYear)) {
            return Number(other.period_id) < Number(targetPeriod);
          }
          return false;
        });

        if (!isScheduledPrior) {
          const pName = targetPeriod === 1 ? 'Semester 1' : targetPeriod === 2 ? 'Semester 2' : targetPeriod === 3 ? 'Trimester 1' : targetPeriod === 4 ? 'Trimester 2' : 'Trimester 3';
          warningNotice = `Prerequisite Notice (BR-02): Unit ${unitCode} requires ${prereqCode}. Placed on canvas for Academic Chair Waiver review.`;
        }
      }
    }

    // 1. Maximum 12 CP Capacity Limit Validation
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

    return { valid: true, warning: warningNotice };
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
      let unit = catalogUnits.find(u => String(u.unit_id || u.code) === code || u.code === code);
      if (!unit && active.data?.current?.unit) {
        unit = active.data.current.unit;
      }
      if (unit) {
        if (completedUnitCodes && completedUnitCodes.has(unit.code)) {
          setDragWarningToast(`Duplicate Unit Prevented: Unit ${unit.code} is ALREADY COMPLETED in student official academic history.`);
          setTimeout(() => setDragWarningToast(null), 4500);
          return;
        }

        const existingInPlan = planUnits.find(u => u.code === unit.code);
        if (existingInPlan) {
          const y = existingInPlan.year_level;
          const p = existingInPlan.period_id;
          const pName = p === 1 ? 'Semester 1' : p === 2 ? 'Semester 2' : p === 3 ? 'Trimester 1' : p === 4 ? 'Trimester 2' : 'Trimester 3';
          setDragWarningToast(`Duplicate Unit Prevented: Unit ${unit.code} (${unit.title}) is ALREADY scheduled in Year ${y} ${pName}!`);
          setTimeout(() => setDragWarningToast(null), 4500);
          return;
        }

        const check = validatePlacement(unit.code, targetYear, targetPeriod, planUnits);
        if (!check.valid) {
          setDragWarningToast(check.message);
          setTimeout(() => setDragWarningToast(null), 5000);
          return;
        }

        if (check.warning) {
          setDragWarningToast(check.warning);
          setTimeout(() => setDragWarningToast(null), 4500);
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

        if (check.warning) {
          setDragWarningToast(check.warning);
          setTimeout(() => setDragWarningToast(null), 4500);
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

    if (completedUnitCodes && completedUnitCodes.has(unit.code)) {
      setDragWarningToast(`Duplicate Unit Prevented: Unit ${unit.code} is ALREADY COMPLETED in student official academic history.`);
      setTimeout(() => setDragWarningToast(null), 4500);
      return;
    }

    const existing = planUnits.find(u => u.code === unit.code);
    if (existing) {
      const info = getTermName(existing.year_level, existing.period_id);
      setDragWarningToast(`Duplicate Unit Prevented: Unit ${unit.code} (${unit.title}) is ALREADY scheduled in ${info}.`);
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

    if (check.warning) {
      setDragWarningToast(check.warning);
      setTimeout(() => setDragWarningToast(null), 4500);
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

    if (completedUnitCodes && completedUnitCodes.has(unit.code)) {
      setDragWarningToast(`Duplicate Unit Prevented: Unit ${unit.code} is ALREADY COMPLETED in student official academic history.`);
      setTimeout(() => setDragWarningToast(null), 4500);
      return;
    }

    const existing = planUnits.find(u => u.code === unit.code);
    if (existing) {
      const info = getTermName(existing.year_level, existing.period_id);
      setDragWarningToast(`Duplicate Unit Prevented: Unit ${unit.code} (${unit.title}) is ALREADY scheduled in ${info}.`);
      setTimeout(() => setDragWarningToast(null), 4500);
      return;
    }

    const check = validatePlacement(unit.code, yearLevel, periodId, planUnits);
    if (!check.valid) {
      setDragWarningToast(check.message);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }

    if (check.warning) {
      setDragWarningToast(check.warning);
      setTimeout(() => setDragWarningToast(null), 4500);
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

  // Preset Plan Generation - Delegated to unified onAutoGeneratePlan with official degree presets
  const handleGeneratePresetPlan = () => {
    if (!isChair && isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }

    if (onAutoGeneratePlan) {
      onAutoGeneratePlan(student?.student_id, {
        targetYearLevel: activeYearLevel || 'all',
        layoutType: layoutType
      });
    } else {
      handleOpenAutoGenModal();
    }
  };

  // Clear all units from plan (Reset to 0 CP)
  const handleClearPlan = () => {
    if (!isChair && isPlanLocked) {
      setDragWarningToast(`This Study Plan is currently ${planStatus.toUpperCase()} and locked from canvas edits.`);
      setTimeout(() => setDragWarningToast(null), 5000);
      return;
    }
    if (onResetPlan) {
      onResetPlan();
      return;
    }
    setPlanUnits([]);
    if (onValidate) onValidate([]);
    setDragWarningToast(null);
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
    const rawList = (!catalogUnits || catalogUnits.length === 0)
      ? defaultFullCatalogUnits
      : [...catalogUnits, ...defaultFullCatalogUnits];

    const seen = new Set();
    const unique = [];
    rawList.forEach(u => {
      const code = (u.code || u.unit_code || '').trim().toUpperCase();
      if (code && !seen.has(code)) {
        seen.add(code);
        const digits = code.replace(/[^0-9]/g, '');
        const derivedLevel = digits.length > 0 ? parseInt(digits.charAt(0) + '00', 10) : 100;
        const rawLvl = u.level ? parseInt(u.level, 10) : derivedLevel;
        const normalizedLevel = rawLvl >= 100 ? rawLvl : rawLvl * 100;
        unique.push({
          ...u,
          code,
          level: normalizedLevel
        });
      }
    });
    return unique;
  }, [catalogUnits, defaultFullCatalogUnits]);

  // Filtered available offerings sorted by level and code (Master Data)
  const filteredOfferings = useMemo(() => {
    if (!effectiveCatalog || !Array.isArray(effectiveCatalog)) return [];

    const hasSearch = Boolean(unitFilter && typeof unitFilter === 'string' && unitFilter.trim().length > 0);

    const list = effectiveCatalog.filter(unit => {
      if (!unit) return false;
      const unitCode = (unit.code || unit.unit_code || '').trim().toUpperCase();
      const isAlreadyScheduled = scheduledCodesSet && scheduledCodesSet.has ? scheduledCodesSet.has(unitCode) : false;

      // When user is explicitly searching, never hide matching units so search is 100% visible
      if (!showAllCatalogUnits && !hasSearch && isAlreadyScheduled) {
        return false;
      }

      if (selectedLevel === 'ELECTIVE') {
        if (!['MSP200', 'COM203'].includes(unitCode)) return false;
      } else if (selectedLevel === 'CORE') {
        if (['MSP200', 'COM203'].includes(unitCode)) return false;
      } else if (selectedLevel && selectedLevel !== 'ALL') {
        const cleanLvlStr = String(selectedLevel).toLowerCase().replace(/[^0-9]/g, '');
        const targetLvl = parseInt(cleanLvlStr, 10);
        const normTarget = targetLvl < 10 ? targetLvl * 100 : targetLvl;

        const unitDigits = unitCode.replace(/[^0-9]/g, '');
        const derivedUnitLvl = unitDigits.length > 0 ? parseInt(unitDigits.charAt(0) + '00', 10) : 100;
        const rawUnitLvl = parseInt(unit.level || derivedUnitLvl, 10);
        const normUnit = rawUnitLvl < 10 ? rawUnitLvl * 100 : rawUnitLvl;

        if (normTarget >= 100 && normTarget <= 300) {
          if (normTarget !== normUnit) {
            return false;
          }
        }
      }

      if (hasSearch) {
        const query = unitFilter.toLowerCase().trim();
        const code = unitCode.toLowerCase();
        const title = (unit.title || '').toLowerCase();
        const prereq = (unit.prereqs || unit.prereq_code || '').toLowerCase();
        if (!code.includes(query) && !title.includes(query) && !prereq.includes(query)) {
          return false;
        }
      }
      return true;
    });

    const getUnitPriorityScore = (u) => {
      if (!u) return 999;
      const code = u.code || u.unit_code || '';
      const level = Number(u.level) || 100;
      const isElective = ['MSP200', 'COM203'].includes(code);

      if (isElective) {
        return 900 + level;
      }
      return level;
    };

    return [...list].sort((a, b) => {
      const scoreA = getUnitPriorityScore(a);
      const scoreB = getUnitPriorityScore(b);
      if (scoreA !== scoreB) return scoreA - scoreB;
      const codeA = a?.code || a?.unit_code || '';
      const codeB = b?.code || b?.unit_code || '';
      return codeA.localeCompare(codeB);
    });
  }, [effectiveCatalog, scheduledCodesSet, showAllCatalogUnits, selectedLevel, unitFilter]);

  const years = [
    { level: 1, yearName: 'Year 1 (2026)' },
    { level: 2, yearName: 'Year 2 (2027)' },
    { level: 3, yearName: 'Year 3 (2028)' }
  ];

  const getSemesterUnits = (yearLevel, periodId, activeLayout = layoutType) => {
    const yL = Number(yearLevel);
    const pI = Number(periodId);

    // 1. Check student academic history for completed units in this year and period
    const completedHistory = (history || []).filter(h => h.status === 'completed');
    const yearHistory = completedHistory.filter(h => {
      const yTaken = Number(h.year_taken || 2026);
      const calcLvl = yTaken === 2026 ? 1 : yTaken === 2027 ? 2 : 3;
      return calcLvl === yL;
    });

    let historyUnitsForSlot = [];
    if (yearHistory.length > 0) {
      if (activeLayout === 'semester') {
        // Strictly match semester period (S1 = 1, S2 = 2). Trimester units are NOT shown in semester slots!
        historyUnitsForSlot = yearHistory.filter(h => 
          Number(h.period_id) === pI || 
          (pI === 1 && (h.period_code === 'S1' || Number(h.period_id) === 1)) || 
          (pI === 2 && (h.period_code === 'S2' || Number(h.period_id) === 2))
        );
      } else {
        // Strictly match trimester period (T1 = 3, T2 = 4, T3 = 5). Semester units are NOT shown in trimester slots!
        historyUnitsForSlot = yearHistory.filter(h => 
          Number(h.period_id) === pI || 
          (pI === 3 && (h.period_code === 'T1' || Number(h.period_id) === 3)) || 
          (pI === 4 && (h.period_code === 'T2' || Number(h.period_id) === 4)) || 
          (pI === 5 && (h.period_code === 'T3' || Number(h.period_id) === 5))
        );
      }
    }

    if (historyUnitsForSlot.length > 0) {
      return historyUnitsForSlot.map(h => {
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
          grade: h.grade || 'P',
          mark: h.mark || 75,
          isCompleted: true,
          isLocked: true
        };
      });
    }

    // 2. Otherwise return planned units on canvas for this year and period (strictly matching period)
    const termUnits = planUnits.filter(u => {
      const uY = Number(u.year_level);
      const uP = Number(u.period_id);
      return uY === yL && uP === pI;
    });

    // Ensure no duplicate unit codes or already-completed unit codes can be rendered
    const seenUnitCodes = new Set();
    return termUnits.filter(u => {
      const c = (u.code || '').trim().toUpperCase();
      if (!c || seenUnitCodes.has(c) || completedCodesSet.has(c)) return false;
      seenUnitCodes.add(c);
      return true;
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

  const isNewStudent = 
    student?.account_category === 'new_student' || 
    Number(student?.student_id) === 3 ||
    student?.student_number === '31234563' ||
    student?.alias_code === 'BIS1' ||
    Number(student?.student_id) === 4 ||
    student?.student_number === '31234564' ||
    student?.alias_code === 'AI2';

  const isPlanOfficiallyGranted = planStatus === 'recommended' || planStatus === 'agreed' || planStatus === 'approved';
  const isNewStudentInitial = isNewStudent && !isPlanOfficiallyGranted;

  // Planned Canvas CP (units on canvas not already in completed history)
  const plannedCanvasCP = useMemo(() => {
    if (isNewStudentInitial) return 0;
    return (planUnits || [])
      .filter(u => !completedCodesSet.has(u.code))
      .reduce((sum, u) => sum + (u.credit_points || 3), 0);
  }, [planUnits, completedCodesSet, isNewStudentInitial]);

  // Total CP: strictly equal to the sum of credit points rendered across all 3 years on canvas
  const totalCP = useMemo(() => {
    if (isNewStudentInitial) return 0;
    const canvasSum = years.reduce((sum, y) => {
      const yearUnits = defaultPeriodList.flatMap(p => getSemesterUnits(y.level, p.period_id));
      return sum + yearUnits.reduce((ySum, u) => ySum + Number(u.credit_points || 3), 0);
    }, 0);
    return Math.max(canvasSum, completedHistoryCP + plannedCanvasCP);
  }, [years, defaultPeriodList, layoutType, planUnits, history, isNewStudentInitial, completedHistoryCP, plannedCanvasCP]);

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
        {/* ========================================================================= */}
        {/* UNIFIED EXECUTIVE STUDENT HEADER (Replaces fragmented 3 boxes)            */}
        {/* ========================================================================= */}
        <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl font-sans text-slate-900 dark:text-white transition-all relative overflow-hidden backdrop-blur-md">
          {/* Subtle executive background accents */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
            {/* Left: Soft Red Icon & Welcome Greeting + Degree / Major / Campus */}
            <div className="flex items-center gap-4 max-w-full">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 flex items-center justify-center shadow-xs shrink-0 border border-red-200/60 dark:border-red-900/60">
                <GraduationCap className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
                  {isNewStudentInitial ? `Welcome, ${stName}!` : `Welcome back, ${stName}!`}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Bachelor of Information Technology ({stMajor})
                  </span>
                  <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                  <span className="font-mono text-xs">{stCourse}</span>
                  <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {student?.location_name || 'Singapore Campus'}
                  </span>
                </p>
                {isNewStudentInitial && planStatus !== 'request_submitted' && planStatus !== 'rejected' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                    Please submit your study plan request to begin mapping your units.
                  </p>
                )}
                {planStatus === 'rejected' && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-0.5">
                    Change requested. The Academic Chair is currently reviewing your comments.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Plan Status Badge, CP Meter & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-stretch lg:self-auto justify-start lg:justify-end shrink-0">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide border shadow-2xs ${
                planStatus === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' :
                planStatus === 'agreed' ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' :
                planStatus === 'recommended' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' :
                planStatus === 'request_submitted' ? 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' :
                planStatus === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' :
                'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}>
                {planStatus === 'request_submitted' ? 'Request Submitted' : planStatus === 'rejected' ? 'Change Requested' : `Status: ${planStatus}`}
              </span>

              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
                {totalCP} / 72 CP
              </span>

              {/* Submit / Update Plan Request Button */}
              {planStatus === 'recommended' ? (
                <button
                  type="button"
                  onClick={() => {
                    const sigEl = document.getElementById('digital-signature-section');
                    if (sigEl) {
                      sigEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 font-heading tracking-tight animate-pulse"
                  title="Study plan recommended by Academic Chair. Review units and sign off below."
                >
                  <FileCheck className="w-3.5 h-3.5 text-white" />
                  <span>Review Recommended Plan</span>
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </button>
              ) : planStatus === 'request_submitted' || planStatus === 'rejected' ? (
                <button
                  type="button"
                  disabled={true}
                  className="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-black shadow-none flex items-center gap-1.5 cursor-not-allowed opacity-75 font-heading tracking-tight"
                  title={planStatus === 'rejected' ? "You requested amendments for this study plan. The Academic Chair is reviewing your comments." : "Your study plan request is currently submitted and under review by the Academic Chair."}
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{planStatus === 'rejected' ? 'Revision Pending Chair Review' : 'Request Submitted'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const defaultYear = passedYears.has(1)
                      ? (passedYears.has(2) ? 2028 : 2027)
                      : 2026;
                    setReqYear(defaultYear);
                    setShowSubmitPlanRequestModal(true);
                  }}
                  className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 font-heading tracking-tight"
                  title="Submit study plan request for Academic Chair review"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Submit Plan Request</span>
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </button>
              )}

              {/* Confirmation of Enrolment (CoE) / Export Document Button (Existing students) */}
              {onOpenOfficialDocument && !isNewStudentInitial && (
                <button
                  type="button"
                  onClick={onOpenOfficialDocument}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-red-700 dark:hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 font-sans"
                  title={planStatus === 'approved' ? 'Generate official Confirmation of Enrolment (CoE) certificate & study plan' : 'Preview Official Study Plan document and select export format (PDF, CSV)'}
                >
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                  <span>{planStatus === 'approved' ? 'Generate Confirmation of Enrolment (CoE)' : 'Study Plan Document & CoE'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Curriculum Layout Switcher Toolbar (Existing students only) */}
          {!isNewStudentInitial && (
            <div className="relative z-10 mt-4 pt-3.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Academic Curriculum View:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 text-xs font-sans shadow-2xs">
                <button
                  type="button"
                  onClick={() => setStudentLayoutMode('trimester')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
                    studentLayoutMode === 'trimester'
                      ? 'bg-red-700 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Switch Student View to Trimester Layout (3 Terms)"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Trimester View (3 Terms)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudentLayoutMode('semester')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
                    studentLayoutMode === 'semester'
                      ? 'bg-red-700 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Switch Student View to Semester Layout (2 Semesters)"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Semester View (2 Semesters)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CONDITIONAL RENDER: NEW STUDENT STATUS BANNER vs FULL STUDY PLAN GRID    */}
        {/* ========================================================================= */}
        {isNewStudentInitial ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* SUBMITTED STATUS BANNER (shown when request is submitted) */}
            {planStatus === 'request_submitted' && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      Study Plan Request Submitted
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                      Awaiting Academic Chair review and unit allocation.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0 self-start sm:self-center">
                  Awaiting Chair Action
                </span>
              </div>
            )}

            {/* REJECTED / CHANGE REQUESTED STATUS BANNER */}
            {planStatus === 'rejected' && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      Change Request Under Review
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                      You requested revisions for your study plan. The Academic Chair has been notified and is reviewing your feedback.
                    </p>
                    {currentPlan?.rejectionComment && (
                      <div className="mt-2 bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MessageSquareQuote className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-300 font-heading">
                            Your Revision Feedback:
                          </span>
                        </div>
                        <div className="pl-3.5 border-l-2 border-rose-400 dark:border-rose-600 py-0.5">
                          <p className="text-xs font-bold text-rose-950 dark:text-rose-100 font-sans italic">
                            “{currentPlan.rejectionComment}”
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-800 shrink-0 self-start sm:self-center">
                  Revision Pending Chair Review
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* RECOMMENDED STATUS BANNER (Awaiting Student Review & Digital Sign-Off) */}
            {planStatus === 'recommended' && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      Study Plan Recommended by Academic Chair
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                      Academic Chair Dr. Aris Thorne has recommended this degree plan. Please review your mapped course units below and provide your digital signature to proceed.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
                    Awaiting Student Sign-Off
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const sigEl = document.getElementById('digital-signature-section');
                      if (sigEl) {
                        sigEl.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 font-heading"
                  >
                    <span>Sign Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* REQUEST SUBMITTED STATUS BANNER */}
            {planStatus === 'request_submitted' && (
              <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      Study Plan Request Submitted
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                      Your study plan request is under review by the Academic Chair. You will be notified once a study plan is recommended.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800 shrink-0 self-start sm:self-center">
                  Awaiting Chair Action
                </span>
              </div>
            )}

            {/* REVISION REQUESTED / REJECTED STATUS BANNER */}
            {planStatus === 'rejected' && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      Change Request Under Review
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                      You requested revisions for your study plan. The Academic Chair has been notified and is preparing an updated plan.
                    </p>
                    {currentPlan?.rejectionComment && (
                      <div className="mt-2 bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MessageSquareQuote className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-300 font-heading">
                            Your Revision Feedback:
                          </span>
                        </div>
                        <div className="pl-3.5 border-l-2 border-rose-400 dark:border-rose-600 py-0.5">
                          <p className="text-xs font-bold text-rose-950 dark:text-rose-100 font-sans italic">
                            “{currentPlan.rejectionComment}”
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-800 shrink-0 self-start sm:self-center">
                  Revision Pending Chair Review
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {years.map(y => {
                const studentPeriods = studentLayoutMode === 'semester' ? semesterPeriods : trimesterPeriods;

                return (
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

                    {studentPeriods.map(p => {
                      const sUnits = getSemesterUnits(y.level, p.period_id, studentLayoutMode);
                      const semCP = sUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0);
                      const isOptimalLoad = semCP === 12;
                      const periodKey = `Y${y.level}-P${p.period_id}`;
                      const hasRequest = semesterRequests[periodKey];

                      const academicYear = (student?.commencement_year || 2026) + y.level - 1;

                      // Check if this period has already been undertaken (completed/attempted/enrolled in student history)
                      const isHistoryPeriod = (history || []).some(h => 
                        (Number(h.year_taken) === academicYear || (!h.year_taken && y.level === 1)) &&
                        Number(h.period_id) === Number(p.period_id) &&
                        (h.status === 'completed' || h.status === 'enrolled' || h.status === 'current' || h.status === 'attempted')
                      );

                      const hasHistoryUnits = sUnits.some(u => 
                        completedUnitCodes.has(u.code) || 
                        attemptedUnitCodes.has(u.code) || 
                        (historyMap[u.code] && (historyMap[u.code].status === 'enrolled' || historyMap[u.code].status === 'current'))
                      );

                      const isUndertakenPeriod = isHistoryPeriod || hasHistoryUnits;

                      // Check if a request has been made for this period
                      const hasSubmittedPeriodRequest = Boolean(
                        hasRequest ||
                        (currentPlan?.status === 'request_submitted' && 
                          (Number(currentPlan?.targetYearLevel) === y.level || Number(currentPlan?.requestYear) === academicYear) &&
                          (!currentPlan?.requestPeriods || currentPlan?.requestPeriods.includes(p.period_id)))
                      );

                      // If plan is officially approved or recommended, all periods in plan are unlocked
                      const isPlanApprovedOrRecommended = planStatus === 'recommended' || planStatus === 'agreed' || planStatus === 'approved';

                      // Period is unlocked if it has scheduled units, OR already undertaken, OR a request has been submitted, OR plan is recommended/approved
                      const isPeriodUnlocked = Boolean(
                        (sUnits && sUnits.length > 0) ||
                        isUndertakenPeriod ||
                        hasSubmittedPeriodRequest ||
                        isPlanApprovedOrRecommended
                      );

                      if (!isPeriodUnlocked) {
                        return (
                          <div 
                            key={p.period_id} 
                            className="bg-slate-50/70 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3 transition-all"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-500 dark:text-slate-400 font-heading">{p.name}</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-mono">
                                  <Lock className="w-2.5 h-2.5 shrink-0" />
                                  <span>LOCKED</span>
                                </span>
                              </div>
                              <span className="font-mono text-xs tabular-nums font-bold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700">
                                0 / 12 CP
                              </span>
                            </div>

                            <div className="py-4 px-3 bg-white/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-center space-y-2.5 backdrop-blur-2xs">
                              <div className="w-9 h-9 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
                                <Lock className="w-4.5 h-4.5 shrink-0" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white font-heading">
                                  Teaching Period Locked
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed font-sans">
                                  Submit a study plan request to the Academic Chair to unlock and view unit mapping.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (planStatus === 'recommended') {
                                    const sigEl = document.getElementById('digital-signature-section');
                                    if (sigEl) {
                                      sigEl.scrollIntoView({ behavior: 'smooth' });
                                    }
                                    return;
                                  }
                                  if (planStatus === 'request_submitted' || planStatus === 'rejected') {
                                    setDragWarningToast(planStatus === 'rejected' ? 'Revision Pending: You have requested amendments for this study plan. The Academic Chair is reviewing your comments.' : 'Active Request Pending: You already have a study plan request awaiting Academic Chair review.');
                                    setTimeout(() => setDragWarningToast(null), 5000);
                                    return;
                                  }
                                  const yrLvl = academicYear === 2027 ? 2 : academicYear === 2028 ? 3 : 1;
                                  const defaultYear = passedYears.has(yrLvl)
                                    ? (passedYears.has(1) ? (passedYears.has(2) ? 2028 : 2027) : 2026)
                                    : academicYear;
                                  setReqYear(defaultYear);
                                  if (p.period_id === 1 || p.period_id === 2) {
                                    setLayoutType('semester');
                                    setReqPeriods([p.period_id]);
                                  } else {
                                    setLayoutType('trimester');
                                    setReqPeriods([p.period_id]);
                                  }
                                  setShowSubmitPlanRequestModal(true);
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition-all font-heading ${
                                  planStatus === 'recommended'
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer active:scale-95'
                                    : planStatus === 'request_submitted' || planStatus === 'rejected'
                                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-80'
                                    : 'bg-red-700 hover:bg-red-800 text-white cursor-pointer active:scale-95 hover:shadow-md'
                                }`}
                              >
                                {planStatus === 'recommended' ? (
                                  <>
                                    <FileCheck className="w-3.5 h-3.5" />
                                    <span>Review Recommended Plan</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{planStatus === 'rejected' ? 'Revision Pending Chair Review' : planStatus === 'request_submitted' ? 'Request Pending Review' : 'Submit Request to Unlock'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      }

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
                              {!isAlreadyAgreed && planStatus !== 'agreed' && planStatus !== 'approved' && (
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
                              )}
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
                            hasSubmittedPeriodRequest ? (
                              <div className="py-4 px-3 text-center border-2 border-dashed border-sky-300 dark:border-sky-800 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 space-y-1">
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-200 font-heading">
                                  <Clock className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-sky-400" />
                                  <span>Plan Request Submitted</span>
                                </div>
                                <p className="text-[11px] text-sky-600 dark:text-sky-300 font-sans">
                                  Awaiting Academic Chair review and unit allocation.
                                </p>
                              </div>
                            ) : (
                              <div className="py-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-xl bg-white/50 dark:bg-slate-900/50">
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono italic">No units scheduled for this trimester</span>
                              </div>
                            )
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
                                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-2 border-emerald-500 dark:border-emerald-600 flex items-center gap-1.5 font-sans shrink-0 shadow-2xs" title="Completed in official academic record">
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                              <span>Grade: <strong className="font-mono text-emerald-900 dark:text-emerald-100 font-black">{hist?.grade || 'P'}</strong></span>
                                            </span>
                                          )}
                                          {isEnrolled && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-50 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 border-2 border-sky-500 dark:border-sky-600 shadow-2xs">
                                              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" /> ENROLLED
                                            </span>
                                          )}
                                          {isAttempted && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-2 border-rose-500 dark:border-rose-600 shadow-2xs">
                                              <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" /> FAILED ({hist?.grade || 'F'})
                                            </span>
                                          )}
                                          {waivedUnits?.has(u.code) && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border-2 border-purple-500 dark:border-purple-600 shadow-2xs" title="Prerequisite waived by Academic Chair">
                                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" /> Prereq Waived
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="text-slate-900 dark:text-white text-xs font-bold leading-snug break-words pt-0.5" title={u.title}>
                                        {u.title}
                                      </div>

                                      {/* Student View Warning Notice (VAL-05 / VAL-06 / VAL-07) */}
                                      {warningsByUnit[u.code] && !isCompleted && (() => {
                                        const wMsg = warningsByUnit[u.code] || '';
                                        const isPrereqWaived = waivedUnits?.has(u.code);
                                        const hasOff = wMsg.includes('NOT offered') || wMsg.includes('offered ONLY') || wMsg.includes('Offering') || wMsg.includes('offering');
                                        const hasPre = wMsg.includes('FAILED') || wMsg.includes('requires prerequisite') || wMsg.includes('prerequisite') || wMsg.includes('Prerequisite');
                                        if (!hasOff && hasPre && isPrereqWaived) return null;
                                        const badgeLabel = hasOff ? 'Offering Mismatch (Must Reschedule)' : wMsg.includes('FAILED') ? 'Prerequisite Failed' : 'Prerequisite Unmet';
                                        return (
                                          <div 
                                            className="mt-1 flex items-center justify-between gap-1.5 text-[10px] font-semibold text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg px-2 py-1 leading-snug"
                                            title={wMsg}
                                          >
                                            <div className="flex items-center gap-1.5 truncate">
                                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                                              <span className="font-bold uppercase tracking-wider font-heading truncate">
                                                {badgeLabel}
                                              </span>
                                            </div>
                                            <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0 bg-white/80 dark:bg-slate-900/80 px-1 py-0.5 rounded" title={wMsg}>
                                              Rule Notice
                                            </span>
                                          </div>
                                        );
                                      })()}
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
              );
            })}
          </div>

            {/* Unified Student Digital Signature Pad Component (Single Card for 72 CP Plan) */}
            <div id="digital-signature-section" className="scroll-mt-8">
              <SignaturePad
                student={student}
                yearLevel="ALL"
                yearName="Official 3-Year Study Plan (72 CP)"
                planStatus={planStatus}
                planUnitsCount={planUnits.length}
                isAlreadyAgreed={planStatus !== 'recommended' && (isAlreadyAgreed || Boolean(currentPlan?.studentSignature || currentPlan?.signature || currentPlan?.yearSignatures?.['ALL'] || currentPlan?.yearSignatures?.[1]))}
                isYearCompleted={false}
                isYearLocked={false}
                onAgreePlan={(sigObj) => {
                  if (onAgreePlan) onAgreePlan(sigObj, 'ALL');
                }}
                onRejectPlan={(reason) => {
                  if (onRejectPlan) onRejectPlan(reason, 'ALL');
                }}
                currentSignature={planStatus === 'recommended' ? null : (currentPlan?.studentSignature || currentPlan?.signature || currentPlan?.yearSignatures?.['ALL'] || currentPlan?.yearSignatures?.[1])}
              />
            </div>
          </>
        )}

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
                  {[2026, 2027, 2028].map(yr => {
                    const yrLvl = yr === 2027 ? 2 : yr === 2028 ? 3 : 1;
                    const isPassed = passedYears.has(yrLvl);
                    return (
                      <button
                        key={yr}
                        type="button"
                        disabled={isPassed}
                        onClick={() => {
                          if (isPassed) {
                            setDragWarningToast(`Year ${yr} units have already been completed in your academic history.`);
                            setTimeout(() => setDragWarningToast(null), 4000);
                            return;
                          }
                          setReqYear(yr);
                        }}
                        className={`py-3.5 px-4 rounded-2xl text-xs md:text-sm font-black border transition-all flex items-center justify-center gap-2 ${
                          isPassed
                            ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                            : reqYear === yr
                              ? 'bg-slate-900 text-white border-slate-900 dark:bg-red-700 dark:border-red-600 shadow-md font-heading scale-[1.01] cursor-pointer'
                              : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-extrabold cursor-pointer'
                        }`}
                        title={isPassed ? `Year ${yr} is completed in academic history` : `Select Year ${yr}`}
                      >
                        <Calendar className="w-4 h-4 opacity-80" />
                        <span>Year {yr}{isPassed ? ' (Passed)' : ''}</span>
                      </button>
                    );
                  })}
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
                    if (planStatus === 'recommended' || planStatus === 'request_submitted' || planStatus === 'rejected') {
                      alert(
                        planStatus === 'recommended'
                          ? 'A study plan has already been recommended by your Academic Chair. Please review and sign off below rather than submitting a new request.'
                          : planStatus === 'rejected'
                          ? 'Revision Pending: You have requested amendments for this study plan. The Academic Chair is reviewing your comments.'
                          : 'Active Request Pending: You already have a study plan request under review by the Academic Chair. Duplicate requests are not permitted.'
                      );
                      return;
                    }
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
                    {isPlanLocked ? 'Study Plan Locked' : (currentPlan?.isAmending ? 'Study Plan Amendment in Progress' : 'Academic Plan Governance')}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border font-mono ${
                    currentPlan?.isAmending ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-400' :
                    planStatus === 'approved' ? 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
                    planStatus === 'agreed' ? 'bg-sky-100/90 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800' :
                    planStatus === 'recommended' ? 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' :
                    planStatus === 'rejected' ? 'bg-rose-100/90 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {currentPlan?.isAmending ? 'Amendment Draft' : planStatus === 'draft' ? 'Drafting Sequence' : planStatus === 'rejected' ? 'Change Requested' : planStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {currentPlan?.isAmending && 'You are currently amending this study plan. Canvas is unlocked. Adjust units freely, then click Re-Recommend or Final Approve.'}
                  {!currentPlan?.isAmending && planStatus === 'draft' && 'Structure units on the canvas and click Recommend to Student at the bottom when ready.'}
                  {!currentPlan?.isAmending && planStatus === 'rejected' && 'Student disagreed with the recommended plan and requested amendments. Please review the student feedback note, adjust units, and re-recommend.'}
                  {!currentPlan?.isAmending && planStatus === 'recommended' && 'Plan recommended to student & locked from canvas edits. To modify units, click Unlock & Amend Canvas.'}
                  {!currentPlan?.isAmending && planStatus === 'agreed' && 'Student digital sign-off complete. Click Final Approve below or Unlock & Amend Canvas to edit.'}
                  {!currentPlan?.isAmending && planStatus === 'approved' && 'Official approved plan archived & locked. To create a new draft version, click Unlock & Amend Canvas.'}
                </p>

                {/* Approval Stages Progression Stepper (APP-01 / APP-02) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {workflowSteps.map((step) => {
                      const isCurrent = (
                        (step.id === 'draft' && (planStatus === 'draft' || planStatus === 'request_submitted')) ||
                        (step.id === 'recommended' && (planStatus === 'recommended' || planStatus === 'rejected')) ||
                        (step.id === 'agreed' && planStatus === 'agreed') ||
                        (step.id === 'approved' && (planStatus === 'approved' || planStatus === 'stored'))
                      );
                      const isPassed = (
                        (step.id === 'draft' && planStatus !== 'draft' && planStatus !== 'request_submitted') ||
                        (step.id === 'recommended' && (planStatus === 'agreed' || planStatus === 'approved' || planStatus === 'stored')) ||
                        (step.id === 'agreed' && (planStatus === 'approved' || planStatus === 'stored')) ||
                        (step.id === 'approved' && (planStatus === 'approved' || planStatus === 'stored'))
                      );

                      return (
                        <div
                          key={step.id}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                            isCurrent
                              ? 'bg-red-50 dark:bg-red-950/70 border-red-500 dark:border-red-600 text-red-950 dark:text-red-200 ring-2 ring-red-500/20 shadow-2xs font-sans'
                              : isPassed
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 animate-pulse shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                          )}
                          <span>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isPlanLocked && isChair && (
                <button
                  type="button"
                  onClick={onUnlockForAmendment}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0 font-heading"
                  title="Unlock this study plan to modify and amend units on the canvas"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Unlock & Amend Canvas</span>
                </button>
              )}

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
                    📩 {isNewStudent ? 'New Student' : 'Existing Student'} Plan Request Submitted
                  </span>
                  <span className="text-[10px] font-mono bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 px-2 py-0.5 rounded font-bold">
                    Target Year {currentPlan.requestYear || 2026}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Student requested study plan for Trimesters 1, 2, 3 ({currentPlan.requestYear || 2026}).
                </p>
                {currentPlan.requestComment && (
                  <div className="mt-1.5 mb-1 bg-white/90 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800/60 rounded-xl p-2.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageSquareQuote className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 font-heading">
                        Student Note / Request:
                      </span>
                    </div>
                    <div className="pl-3.5 border-l-2 border-purple-400 dark:border-purple-600 py-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-purple-100 font-sans italic">
                        “{currentPlan.requestComment}”
                      </p>
                    </div>
                  </div>
                )}
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
        {isPlanDisagreed && (
          <div 
            id="student-feedback-alert-banner"
            className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 dark:from-amber-950/70 dark:via-slate-900/90 dark:to-orange-950/50 border-2 border-amber-400 dark:border-amber-500/40 p-5 sm:p-6 rounded-3xl shadow-xl shadow-amber-500/5 dark:shadow-2xl dark:shadow-amber-950/40 font-sans text-amber-950 dark:text-amber-100 animate-in fade-in slide-in-from-top-3 duration-300 backdrop-blur-md"
          >
            {/* Ambient luxury accent glow in background */}
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-gradient-to-bl from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-gradient-to-tr from-amber-600/15 via-orange-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Top Row: Alert Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80 dark:border-amber-800/60">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 ring-2 ring-white dark:ring-slate-900"></span>
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-[13px] font-black uppercase tracking-wider font-heading text-amber-900 dark:text-amber-200">
                        Student Requested Changes / Plan Disagreed
                      </span>
                    </div>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-medium mt-0.5">
                      The student reviewed the recommended study plan and requested structural adjustments before agreeing.
                    </p>
                  </div>
                </div>

                {studentDisagreementNotif?.timestamp && (
                  <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-xl bg-amber-100/80 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-mono font-bold border border-amber-200 dark:border-amber-700/60 shadow-2xs shrink-0">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{studentDisagreementNotif.timestamp}</span>
                  </div>
                )}
              </div>

              {/* Middle Section: Student Feedback Dialogue Box */}
              <div className="w-full bg-white/95 dark:bg-slate-900/90 border border-amber-300/90 dark:border-amber-600/50 rounded-2xl p-4 sm:p-5 shadow-xs backdrop-blur-sm flex flex-col justify-between gap-3.5">
                  {/* Student Identity Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-amber-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0 font-heading">
                        {student?.first_name ? `${student.first_name[0]}${student.last_name ? student.last_name[0] : ''}` : 'ST'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-heading truncate">
                            {student?.first_name ? `${student.first_name} ${student.last_name}` : 'Enrolled Student'}
                          </span>
                          <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            ID: {student?.student_number || student?.alias_code || '31234561'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">
                          Course: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{student?.course_code || 'PT3-BSIT'}</strong> • Singapore Campus
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider font-heading">
                      <MessageSquareQuote className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Student Feedback Note
                    </span>
                  </div>

                  {/* Speech Bubble / Quote Content */}
                  <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/60 dark:from-slate-950/80 dark:via-slate-900/90 dark:to-amber-950/30 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3.5 sm:p-4 shadow-inner relative">
                    <div className="flex items-start gap-3">
                      <MessageSquareQuote className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 opacity-90" />
                      <div className="flex-1 min-w-0">
                        {effectiveRejectionComment ? (
                          <p className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-amber-50 font-sans tracking-tight leading-relaxed italic break-words whitespace-pre-line ${
                            !isFeedbackExpanded && isCommentLong ? 'line-clamp-2' : ''
                          }`}>
                            “{effectiveRejectionComment}”
                          </p>
                        ) : (
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic">
                            “Student indicated disagreement and requested amendments on the study plan structure.”
                          </p>
                        )}

                        {/* Extracted Unit Mention Chip if any unit code is mentioned in comment */}
                        {(() => {
                          if (!effectiveRejectionComment) return null;
                          const matchedUnit = (catalogUnits || []).find(u => 
                            effectiveRejectionComment.toLowerCase().includes(u.code.toLowerCase())
                          );
                          if (!matchedUnit) return null;
                          return (
                            <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-amber-200/70 dark:border-amber-800/40 text-[11px]">
                              <span className="text-amber-800 dark:text-amber-300 font-extrabold font-heading">Referenced Unit:</span>
                              <span className="bg-red-700 text-white font-mono font-black px-2 py-0.5 rounded text-[10px] shadow-2xs">
                                {matchedUnit.code}
                              </span>
                              <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                                {matchedUnit.title} ({matchedUnit.credit_points || 3} CP)
                              </span>
                            </div>
                          );
                        })()}

                        {/* Trimester-Specific Requests when collapsed / expanded */}
                        {hasSemesterRequests && (
                          isFeedbackExpanded ? (
                            <div className="mt-3 pt-2.5 border-t border-amber-200/80 dark:border-amber-800/60 space-y-2 animate-in fade-in duration-200">
                              <div className="flex items-center gap-1.5">
                                <Sliders className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-200 font-heading">
                                  Trimester-Specific Requests ({semesterRequestEntries.length}):
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {semesterRequestEntries.map(([periodKey, reqText]) => (
                                  <div 
                                    key={periodKey}
                                    className="bg-white/95 dark:bg-slate-900/95 border border-amber-200 dark:border-amber-700/60 rounded-xl p-2.5 shadow-2xs"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-mono font-black text-amber-900 dark:text-amber-200 text-[10px] bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                                        {periodKey.replace('Y', 'Year ').replace('-P', ' Trimester ')}
                                      </span>
                                      {onRemoveSemesterRequest && isChair && (
                                        <button
                                          type="button"
                                          onClick={() => onRemoveSemesterRequest(periodKey)}
                                          className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                                        >
                                          Resolve
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold italic break-words">
                                      "{reqText}"
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2.5 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100/90 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-bold border border-amber-200 dark:border-amber-700/60 shadow-2xs">
                                <Sliders className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                +{semesterRequestEntries.length} Trimester Request{semesterRequestEntries.length > 1 ? 's' : ''} Attached
                              </span>
                            </div>
                          )
                        )}

                        {/* View More / Show Less Toggle Button */}
                        {canToggleFeedback && (
                          <div className="mt-2.5 pt-1.5 flex items-center">
                            <button
                              type="button"
                              onClick={() => setIsFeedbackExpanded(prev => !prev)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 hover:underline cursor-pointer transition-colors"
                            >
                              <span>
                                {isFeedbackExpanded 
                                  ? 'Show Less' 
                                  : `View More ${hasSemesterRequests ? `(${semesterRequestEntries.length} Trimester Request${semesterRequestEntries.length > 1 ? 's' : ''} & Full Note)` : '(Full Note)'}`}
                              </span>
                              {isFeedbackExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              {/* Bottom Row: 3-Step Guided Workflow Strip */}
              <div className="bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span className="font-bold text-amber-950 dark:text-amber-100 font-heading uppercase tracking-wider text-[10px]">
                    Amendment Workflow:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[11px]">
                  <span className="bg-white/80 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-amber-200/60 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                    1. Review Student Note
                  </span>
                  <span className="text-amber-500 dark:text-amber-400 font-bold">➔</span>
                  <span className="bg-white/80 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-amber-200/60 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                    2. Adjust Canvas Units
                  </span>
                  <span className="text-amber-500 dark:text-amber-400 font-bold">➔</span>
                  <span className="bg-white/80 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-amber-200/60 dark:border-slate-700 font-bold text-amber-700 dark:text-amber-300">
                    3. Re-Recommend Plan
                  </span>
                </div>
              </div>
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
                    <FileText className="w-4 h-4 shrink-0" /> 4. Export Document
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-sans">
                    Click <strong>Export Document</strong> to preview your official 72 CP Study Plan and choose your format (PDF, CSV).
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
                studentMajor={student?.major || 'Software Engineering'}
                onAddUnit={handleAddUnitFromPalette}
                onAddToSpecificSemester={handleAddToSpecificSemester}
                layoutType={layoutType}
                setLayoutType={setLayoutType}
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
                      .map((w, idx) => {
                        const isPrereqWarning = w.type?.includes('PREREQUISITE') || Boolean(w.prereqCode);
                        const isOfferingWarning = w.type === 'BR-01_OFFERING_MISMATCH' || (w.message && w.message.includes('offered ONLY'));
                        const isUnitWaived = isPrereqWarning && Boolean(w.unitCode && waivedUnits.has(w.unitCode));

                        return (
                          <div
                            key={idx}
                            className={`flex items-start justify-between gap-2.5 p-2.5 rounded-xl text-xs font-medium border ${
                              isUnitWaived
                                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200'
                                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                            }`}
                          >
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              {isUnitWaived ? (
                                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                              )}
                              <div className="break-words">
                                <span className="font-bold">{w.unitCode ? `${w.unitCode}: ` : ''}</span>
                                {isUnitWaived ? `[Chair Prereq Waiver Approved] Prerequisite requirement for ${w.unitCode} waived by Academic Chair.` : w.message}
                              </div>
                            </div>

                            {isOfferingWarning && (
                              <span className="px-2 py-1 rounded-md text-[10px] font-bold shrink-0 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 font-sans" title="Offering period mismatch cannot be waived. Move unit to an offered teaching period before recommending.">
                                Reschedule (Non-Waivable)
                              </span>
                            )}

                            {isChair && isPrereqWarning && w.unitCode && (
                              <button
                                type="button"
                                onClick={() => handleToggleWaiver(w.unitCode)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shrink-0 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs font-sans ${
                                  isUnitWaived
                                    ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
                                    : 'bg-purple-700 hover:bg-purple-800 text-white border border-purple-800'
                                }`}
                                title={isUnitWaived ? 'Revoke Chair Prerequisite Waiver' : 'Grant Academic Chair Prerequisite Waiver'}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{isUnitWaived ? 'Revoke Prereq Waiver' : 'Grant Prereq Waiver'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })
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
                  <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-950/70 text-red-900 dark:text-red-200 border-2 border-red-500 dark:border-red-600 px-3.5 py-1 rounded-full text-xs font-black tracking-wide shadow-2xs font-heading">
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
                        <span>{planStatus === 'approved' ? 'Generate Confirmation of Enrolment (CoE)' : 'Study Plan Document & CoE'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Year Slide Navigation & Layout Control Bar */}
                <div id="study-plan-years-section" className="bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl flex flex-col gap-3 shadow-md font-sans scroll-mt-24">
                  
                  {/* Row 1: Slide Navigation (< Prev Year, Year Tabs, Next Year >) */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full justify-start md:justify-center">
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
                      <span>Prev Year</span>
                    </button>

                    {years.map(y => {
                      const isActive = viewMode === 'single' && activeYearLevel === y.level;
                      const isPassed = passedYears.has(y.level);
                      const yearRenderedUnits = defaultPeriodList.flatMap(p => getSemesterUnits(y.level, p.period_id));
                      const yearCP = yearRenderedUnits.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);

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
                      <span>Next Year</span>
                      <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    </button>
                  </div>

                  {/* Row 2 (Underneath): Layout Mode Switcher & View Mode Controls */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                    {/* View Mode Switcher */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 text-xs shrink-0 font-sans shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setViewMode('single')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer font-heading ${
                          viewMode === 'single'
                            ? 'bg-slate-900 text-white dark:bg-slate-700 dark:text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Single Year
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('all')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer font-heading ${
                          viewMode === 'all'
                            ? 'bg-slate-900 text-white dark:bg-slate-700 dark:text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        3-Year Overview
                      </button>
                    </div>

                    {/* Layout Mode Switcher: Trimester View vs Semester View */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 text-xs shrink-0 font-sans shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setLayoutType('trimester')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
                          layoutType === 'trimester'
                            ? 'bg-red-700 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Switch canvas view to 3 Trimesters / Year layout (T1, T2, T3)"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Trimester View (3 Terms)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLayoutType('semester')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
                          layoutType === 'semester'
                            ? 'bg-red-700 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Switch canvas view to 2 Semesters / Year layout (S1, S2)"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Semester View (2 Semesters)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Drag & Drop Year Grid Canvas */}
                <div className="space-y-5">
                  {(viewMode === 'all' ? years : years.filter(y => y.level === activeYearLevel)).map(yearObj => {
                    const isYearPassed = passedYears.has(yearObj.level);
                    const yearRenderedUnits = defaultPeriodList.flatMap(p => getSemesterUnits(yearObj.level, p.period_id));
                    const yearDisplayCP = yearRenderedUnits.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);

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
                                isPassedYear={isYearPassed && unitsInPeriod.some(u => u.isCompleted || completedUnitCodes.has(u.code))}
                                isChair={isChair}
                                changeRequest={changeReq}
                                onResolveChangeRequest={onRemoveSemesterRequest ? () => onRemoveSemesterRequest(periodKey) : undefined}
                                onRequestChange={(!isChair && !isYearPassed && !isAlreadyAgreed && planStatus !== 'agreed' && planStatus !== 'approved') ? (key, periodName) => {
                                  setActiveRequestModal({
                                    key,
                                    periodName
                                  });
                                  setRequestCommentInput(semesterRequests[key] || '');
                                } : undefined}
                                waivedUnits={waivedUnits}
                                onToggleWaiver={handleToggleWaiver}
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
                            totalCP >= 72 ? 'bg-emerald-600' : totalCP >= 36 ? 'bg-blue-600' : 'bg-red-600'
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
                        {(planStatus === 'draft' || planStatus === 'request_submitted' || planStatus === 'recommended' || planStatus === 'rejected') && (() => {
                          const offeringErrors = (warningsList || []).filter(w => {
                            if (w.unitCode && (completedUnitCodes.has(w.unitCode) || (history || []).some(h => (h.status === 'completed' || h.status === 'passed') && (h.unit_code === w.unitCode || h.code === w.unitCode)))) {
                              return false;
                            }
                            return w.type === 'BR-01_OFFERING_MISMATCH' || (w.message && w.message.includes('offered ONLY'));
                          });
                          const hasOfferingErrors = offeringErrors.length > 0;

                          return (
                            <button
                              type="button"
                              onClick={() => {
                                // 1. Check for wrong teaching period errors (BR-01) - strictly non-waivable
                                if (hasOfferingErrors) {
                                  const firstOff = offeringErrors[0];
                                  const unitPrefix = firstOff.unitCode ? `[${firstOff.unitCode}] ` : '';
                                  setDragWarningToast(`⛔ Recommendation Blocked: Unit ${unitPrefix}is scheduled in the wrong teaching period. Teaching period offering rules cannot be waived and units must be moved to their offered periods before recommending.`);
                                  setTimeout(() => setDragWarningToast(null), 8000);
                                  return;
                                }

                                // 2. Check for unresolved critical validation errors (REC-01 / M06:R104)
                                const unresolvedCritical = warningsList.filter(w => {
                                  if (w.unitCode && waivedUnits.has(w.unitCode) && (w.type?.includes('PREREQUISITE') || w.prereqCode)) {
                                    return false;
                                  }
                                  return (
                                    w.type === 'BR-02_PREREQUISITE_FAILED' ||
                                    w.type === 'BR-02_PREREQUISITE_UNMET' ||
                                    w.type === 'BR-04_CREDIT_LOAD_EXCEEDED' ||
                                    w.severity === 'error'
                                  );
                                });

                                if (unresolvedCritical.length > 0) {
                                  const firstErr = unresolvedCritical[0];
                                  const unitPrefix = firstErr.unitCode ? `[${firstErr.unitCode}] ` : '';
                                  setDragWarningToast(`Recommendation Blocked: Study plan contains unresolved critical issues (${unitPrefix}${firstErr.message}). Please resolve errors or grant an Academic Chair Prerequisite Waiver before recommending.`);
                                  setTimeout(() => setDragWarningToast(null), 8000);
                                  return;
                                }

                                if (onRecommendPlan) {
                                  onRecommendPlan(Array.from(waivedUnits));
                                }
                              }}
                              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 border font-sans ${
                                hasOfferingErrors
                                  ? 'bg-red-700/80 hover:bg-red-800 text-white border-red-800 ring-2 ring-rose-400/50'
                                  : 'bg-red-700 hover:bg-red-800 text-white border-red-800'
                              }`}
                              title={
                                hasOfferingErrors
                                  ? 'Recommendation Blocked: One or more units are scheduled in the wrong teaching period (Non-waivable rule)'
                                  : (planStatus === 'recommended' || planStatus === 'rejected' ? 'Update & Re-Recommend Study Plan' : 'Recommend Study Plan to Student')
                              }
                            >
                              <Send className="w-4 h-4 text-white/90" />
                              <span>{planStatus === 'recommended' || planStatus === 'rejected' ? 'Update & Re-Recommend' : 'Recommend Study Plan to Student'}</span>
                              <ArrowRight className="w-4 h-4 text-white/90" />
                            </button>
                          );
                        })()}

                        {planStatus !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (planStatus !== 'agreed') {
                                setDragWarningToast(`Approval Blocked: Final approval requires student agreement and digital sign-off first (Current plan status: ${planStatus.toUpperCase()}).`);
                                setTimeout(() => setDragWarningToast(null), 6000);
                                return;
                              }
                              if (onApprovePlan) onApprovePlan();
                            }}
                            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95 cursor-pointer font-sans ${
                              planStatus === 'agreed'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700'
                            }`}
                            title={planStatus === 'agreed' ? 'Final Approve and archive study plan' : 'Final approval is blocked until student digital agreement is recorded'}
                          >
                            <ShieldCheck className="w-4 h-4 text-white/90" />
                            <span>Final Approve Plan</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {planStatus === 'recommended' && onRejectPlan && (
                          <button
                            type="button"
                            onClick={() => setShowDisagreeModal(true)}
                            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 font-sans"
                            title="Disagree with proposed study plan and request amendments"
                          >
                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>Disagree / Request Changes</span>
                          </button>
                        )}

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
          <div className="fixed bottom-6 right-6 z-[9999] max-w-lg bg-slate-900/95 dark:bg-slate-950/95 text-white font-sans text-xs font-bold px-4 py-3.5 rounded-2xl shadow-2xl border border-amber-500/40 backdrop-blur-md flex items-center justify-between gap-3.5 animate-in fade-in slide-in-from-bottom-5 duration-200 ring-2 ring-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
              <div className="space-y-0.5">
                <div className="text-[11px] font-heading uppercase text-amber-400 font-extrabold tracking-wider">Validation Rule Notice</div>
                <div className="text-slate-100 font-medium leading-normal">{dragWarningToast}</div>
              </div>
            </div>
            <button
              onClick={() => setDragWarningToast(null)}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* STUDENT DISAGREEMENT / REQUEST CHANGES MODAL */}
        {showDisagreeModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[999] animate-in fade-in duration-200 font-sans">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs border border-rose-200/60 dark:border-rose-900/60">
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                      Request Study Plan Changes
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      Provide feedback or amendment requests to Academic Chair Dr. Aris Thorne.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDisagreeModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center font-bold cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 font-heading">
                  Detail your requested changes or feedback:
                </label>
                <textarea
                  rows={3}
                  value={disagreeReasonInput}
                  onChange={(e) => setDisagreeReasonInput(e.target.value)}
                  placeholder="e.g. Please swap ICT202 to Trimester 3 due to timetable clash, or reduce load to 9 CP..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold block w-full">Quick suggestions:</span>
                  {[
                    "Swap subject to next trimester",
                    "Reduce CP credit load for this year",
                    "Timetable / schedule clash conflict",
                    "Prefer online delivery format",
                    "Prerequisite waiver clarification"
                  ].map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => setDisagreeReasonInput(sugg)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDisagreeModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cleanComment = disagreeReasonInput.trim();
                    if (!cleanComment) {
                      alert('Please enter your feedback or reason for requesting changes.');
                      return;
                    }
                    if (onRejectPlan) {
                      onRejectPlan(cleanComment);
                    }
                    setShowDisagreeModal(false);
                    setDisagreeReasonInput('');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 font-heading uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Submit Change Request</span>
                </button>
              </div>
            </div>
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
                  <span>
                    Requested Year {currentPlan.requestYear} (
                    {currentPlan.requestPeriods && currentPlan.requestPeriods.length > 0
                      ? currentPlan.requestPeriods.map(p => {
                          const num = Number(p);
                          if (num === 1) return 'S1';
                          if (num === 2) return 'S2';
                          if (num === 3) return 'T1';
                          if (num === 4) return 'T2';
                          if (num === 5) return 'T3';
                          return `P${num}`;
                        }).join(', ')
                      : (currentPlan.layoutType === 'semester' ? 'Both Semesters' : 'All Trimesters')}
                    )
                  </span>
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-heading">
                    2. Target Academic Year Scope:
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Centang tahun yang ingin diisi otomatis
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 1, label: 'Year 1 (2026)' },
                    { id: 2, label: 'Year 2 (2027)' },
                    { id: 3, label: 'Year 3 (2028)' }
                  ].map(opt => {
                    const isPassed = passedYears.has(opt.id);
                    const isSelected = scopeYears.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (isPassed) {
                            setDragWarningToast(`Year ${opt.id} is already completed in student academic history.`);
                            setTimeout(() => setDragWarningToast(null), 5000);
                            return;
                          }
                          if (isSelected) {
                            if (scopeYears.length > 1) {
                              setScopeYears(scopeYears.filter(y => y !== opt.id));
                            } else {
                              setDragWarningToast('At least one academic year must be selected.');
                              setTimeout(() => setDragWarningToast(null), 4000);
                            }
                          } else {
                            setScopeYears([...scopeYears, opt.id].sort((a, b) => a - b));
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left text-xs font-extrabold transition-all cursor-pointer flex flex-col justify-between gap-1.5 font-heading ${
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
                        {isPassed ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal font-sans">Completed in History</span>
                        ) : (
                          <span className={`text-[10px] font-normal font-sans ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                            {isSelected ? 'Included in Auto-Fill' : 'Click to select'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Target Periods to Prioritize */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-heading">
                    3. Target Periods to Prioritize:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {modalLayoutType === 'trimester' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setScopePeriods([3, 4, 5])}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                            scopePeriods.length === 3
                              ? 'bg-red-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          All Terms
                        </button>
                        <button
                          type="button"
                          onClick={() => setScopePeriods([3])}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                            scopePeriods.length === 1 && scopePeriods[0] === 3
                              ? 'bg-red-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          T1 Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setScopePeriods([4])}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                            scopePeriods.length === 1 && scopePeriods[0] === 4
                              ? 'bg-red-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          T2 Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setScopePeriods([5])}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                            scopePeriods.length === 1 && scopePeriods[0] === 5
                              ? 'bg-red-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          T3 Only
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setScopePeriods([1, 2])}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                            scopePeriods.length === 2
                              ? 'bg-red-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Both Semesters
                        </button>
                        <button
                          type="button"
                          onClick={() => setScopePeriods([1])}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                            scopePeriods.length === 1 && scopePeriods[0] === 1
                              ? 'bg-red-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          S1 Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setScopePeriods([2])}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                            scopePeriods.length === 1 && scopePeriods[0] === 2
                              ? 'bg-red-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          S2 Only
                        </button>
                      </>
                    )}
                  </div>
                </div>
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
                    const primaryYear = scopeYears[0] || 1;
                    setActiveYearLevel(primaryYear);
                    if (scopeYears.length === 1) {
                      setViewMode('single');
                    } else {
                      setViewMode('all');
                    }
                    if (onAutoGeneratePlan) {
                      const reqYearCalc = primaryYear === 2 ? 2027 : primaryYear === 3 ? 2028 : 2026;
                      onAutoGeneratePlan(student?.student_id, {
                        targetYears: scopeYears,
                        targetYearLevel: scopeYears.length === 1 ? primaryYear : scopeYears,
                        requestYear: reqYearCalc,
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
