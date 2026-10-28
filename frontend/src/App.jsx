import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import StudentSelectModal from './components/StudentSelectModal';
import AcademicHistoryView from './components/AcademicHistoryView';
import PlanBuilder from './components/PlanBuilder';
import StoredPlansView from './components/StoredPlansView';
import CourseCatalogPreview, { getDynamicOfferings } from './components/CourseCatalogPreview';
import CertificateView from './components/CertificateView';
import DataImportModal from './components/DataImportModal';
import OfficialStudyPlanDocumentModal from './components/OfficialStudyPlanDocumentModal';
import GuideModal from './components/GuideModal';
import AddUnitModal from './components/AddUnitModal';
import AddStudentModal from './components/AddStudentModal';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import { AUTH_ACCOUNTS } from './data/authAccounts';

import {
  fetchStudents,
  fetchStudentHistory,
  fetchCatalogUnits,
  fetchTeachingPeriods,
  fetchPlanByStudent,
  validatePlan,
  saveStudyPlan,
  recommendPlan,
  rejectPlan,
  agreePlan,
  approvePlan,
  fetchAuditLog,
  mockClientStudentPlans
} from './services/api';

import {
  CheckCircle2,
  X,
  Clock,
  FileText,
  User,
  GraduationCap,
  Building2,
  BookOpen,
  Award,
  ShieldCheck,
  Download,
  Search,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

const initialSampleStudents = [
  {
    student_id: 0,
    student_number: 'ADMIN-CHAIR-01',
    first_name: 'Dr. Aris',
    last_name: 'Thorne (Academic Chair)',
    email: 'academic.chair@pt3solutions.edu.sg',
    course_id: 1,
    course_code: 'PT3-ADMIN',
    course_name: 'Academic Chair',
    location_id: 2,
    location_name: 'PT3 Solutions Singapore Campus',
    commencement_year: 2026,
    study_status: 'active',
    account_category: 'admin',
    alias_code: 'ADMIN'
  },
  {
    student_id: 1,
    student_number: '31234561',
    first_name: 'Alex',
    last_name: 'Mercer',
    email: 'alex.mercer@student.pt3solutions.edu.sg',
    course_id: 1,
    course_code: 'PT3-BSIT-AI01',
    course_name: 'Bachelor of Information Technology (Major: Artificial Intelligence)',
    location_id: 2,
    location_name: 'PT3 Solutions Singapore Campus',
    commencement_year: 2026,
    study_status: 'active',
    account_category: 'existing_student',
    alias_code: 'AI1'
  },
  {
    student_id: 2,
    student_number: '31234562',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'sarah.jenkins@student.pt3solutions.edu.sg',
    course_id: 2,
    course_code: 'PT3-BSIT-CS02',
    course_name: 'Bachelor of Information Technology (Major: Computer Science)',
    location_id: 2,
    location_name: 'PT3 Solutions Singapore Campus',
    commencement_year: 2026,
    study_status: 'active',
    account_category: 'existing_student',
    alias_code: 'CS1'
  },
  {
    student_id: 3,
    student_number: '31234563',
    first_name: 'Michael',
    last_name: 'Chang',
    email: 'm.chang@student.pt3solutions.edu.sg',
    course_id: 3,
    course_code: 'PT3-BSIT-BIS03',
    course_name: 'Bachelor of Information Technology (Major: Business Information Systems)',
    location_id: 2,
    location_name: 'PT3 Solutions Singapore Campus',
    commencement_year: 2026,
    study_status: 'active',
    account_category: 'new_student',
    alias_code: 'BIS1'
  },
  {
    student_id: 4,
    student_number: '31234564',
    first_name: 'Emily',
    last_name: 'Watson',
    email: 'e.watson@student.pt3solutions.edu.sg',
    course_id: 1,
    course_code: 'PT3-BSIT-AI04',
    course_name: 'Bachelor of Information Technology (Major: Artificial Intelligence)',
    location_id: 2,
    location_name: 'PT3 Solutions Singapore Campus',
    commencement_year: 2026,
    study_status: 'part-time',
    account_category: 'new_student',
    alias_code: 'AI2'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('spr_logged_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState(() => {
    try {
      const saved = localStorage.getItem('spr_logged_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.role === 'chair' ? 'chair' : 'student';
      }
    } catch (e) {}
    return 'chair';
  });
  const [studentsList, setStudentsList] = useState(initialSampleStudents);
  const [selectedStudent, setSelectedStudent] = useState(() => {
    try {
      const savedUser = localStorage.getItem('spr_logged_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.role === 'student') {
          const target = initialSampleStudents.find(s => s.student_id === u.student_id || s.student_number === u.student_number);
          if (target) return target;
        }
      }
    } catch (e) {}
    return initialSampleStudents[0];
  });



  const handleLoginSuccess = useCallback((user) => {
    setCurrentUser(user);
    localStorage.setItem('spr_logged_user', JSON.stringify(user));
    if (user.role === 'chair') {
      setActiveRole('chair');
      const target = studentsList.find(s => s.student_id === 1) || studentsList[1] || studentsList[0];
      if (target) handleSelectStudent(target, 'chair');
    } else {
      setActiveRole('student');
      const target = studentsList.find(s => s.student_id === user.student_id || s.student_number === user.student_number) || {
        student_id: user.student_id,
        student_number: user.student_number,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        course_id: user.id || 1,
        course_code: user.course_code,
        course_name: user.course_name,
        location_id: 2,
        location_name: user.location_name || 'PT3 Solutions Singapore Campus',
        commencement_year: 2026,
        study_status: 'active',
        account_category: user.account_category
      };
      handleSelectStudent(target, 'student');
    }
    setActiveTab('STUDY_PLAN');
    showToast(`Welcome back, ${user.first_name} ${user.last_name}! (${user.roleLabel})`);
  }, [studentsList]);

  const handleLogout = () => {
    setCurrentUser(null);
    setShowStudentSelectModal(false);
    setShowImportModal(false);
    setShowAddUnitModal(false);
    setShowAddStudentModal(false);
    setShowAuditModal(false);
    setShowDocumentModal(false);
    setShowGuideModal(false);
    setActiveCertificate(null);
    localStorage.removeItem('spr_logged_user');
    showToast('You have signed out of PT3 Solutions SPR.');
  };
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [catalogUnits, setCatalogUnits] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(() => {
    return mockClientStudentPlans[1].plan;
  });
  const [planUnits, setPlanUnits] = useState(() => {
    return mockClientStudentPlans[1].units;
  });
  const [allStudentPlansMap, setAllStudentPlansMap] = useState(() => {
    return {
      1: { plan: { ...mockClientStudentPlans[1].plan }, units: [...mockClientStudentPlans[1].units] },
      2: { plan: { ...mockClientStudentPlans[2].plan }, units: [...mockClientStudentPlans[2].units] },
      3: { plan: { ...mockClientStudentPlans[3].plan }, units: [...mockClientStudentPlans[3].units] },
      4: { plan: { ...mockClientStudentPlans[4].plan }, units: [...mockClientStudentPlans[4].units] }
    };
  });

  // Sync allStudentPlansMap to in-memory mock cache whenever it updates (pure in-memory, no localStorage)
  useEffect(() => {
    try {
      Object.entries(allStudentPlansMap).forEach(([sId, data]) => {
        if (mockClientStudentPlans[Number(sId)]) {
          mockClientStudentPlans[Number(sId)].plan = data.plan;
          if (data?.units && data.units.length > 0) {
            mockClientStudentPlans[Number(sId)].units = data.units;
          }
        }
      });
    } catch (e) {}
  }, [allStudentPlansMap]);

  // Purge any lingering localStorage cache on mount so browser uses default data
  useEffect(() => {
    try {
      localStorage.removeItem('spr_student_plans_cache');
      localStorage.removeItem('spr_notifications_list');
    } catch (e) {}
  }, []);

  const [validationResult, setValidationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('STUDY_PLAN');
  
  // Stored Plans List State (Dynamic Last Updated, Version, & Status tracking)
  const [storedPlansList, setStoredPlansList] = useState([
    {
      plan_id: 101,
      student_id: 1,
      student_name: 'Alex Mercer',
      student_number: '31234561',
      alias_code: 'AI1',
      course_code: 'PT3-BSIT-AI01',
      title: 'PT3-BSIT Artificial Intelligence Plan',
      status: 'approved',
      version_number: 2,
      total_cp: 36,
      created_by: 'Academic Chair',
      updated_at: '2026-09-15 08:30',
      location: 'Singapore Campus'
    },
    {
      plan_id: 102,
      student_id: 2,
      student_name: 'Sarah Jenkins',
      student_number: '31234562',
      alias_code: 'CS1',
      course_code: 'PT3-BSIT-CS02',
      title: 'PT3-BSIT Computer Science Plan',
      status: 'agreed',
      version_number: 2,
      total_cp: 72,
      created_by: 'Academic Chair',
      updated_at: '2026-09-14 16:45',
      location: 'Singapore Campus'
    },
    {
      plan_id: 103,
      student_id: 3,
      student_name: 'Michael Chang',
      student_number: '31234563',
      alias_code: 'BIS1',
      course_code: 'PT3-BSIT-BIS03',
      title: 'PT3-BSIT Business Info Systems Plan',
      status: 'draft',
      version_number: 1,
      total_cp: 0,
      created_by: 'Academic Chair',
      updated_at: '2026-10-24 11:02',
      location: 'Singapore Campus'
    },
    {
      plan_id: 104,
      student_id: 4,
      student_name: 'Emily Watson',
      student_number: '31234564',
      alias_code: 'AI2',
      course_code: 'PT3-BSIT-AI04',
      title: 'PT3-BSIT Artificial Intelligence Plan',
      status: 'draft',
      version_number: 1,
      total_cp: 0,
      created_by: 'Academic Chair',
      updated_at: '2026-09-13 14:10',
      location: 'Singapore Campus'
    }
  ]);

  const storedPlansCount = useMemo(() => {
    return (storedPlansList || []).filter(p => p.student_id !== 0 && !String(p.student_number || '').includes('ADMIN')).length;
  }, [storedPlansList]);

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('spr_theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('spr_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Modals
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditTab, setAuditTab] = useState('data_audit'); // 'data_audit' | 'system_spec'

  // Change Log Calendar & Daily Reset Logic
  const getLocalDayKey = useCallback((date = new Date()) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const getTodayKey = useCallback(() => getLocalDayKey(new Date()), [getLocalDayKey]);

  const [auditSelectedDate, setAuditSelectedDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [showAuditCalendar, setShowAuditCalendar] = useState(false);
  const [auditCalendarMonth, setAuditCalendarMonth] = useState(() => new Date());

  // Date display helper for Change Log
  const formatSelectedDateDisplay = useCallback((dateKey) => {
    if (dateKey === 'all') return 'All Historical Logs';
    if (!dateKey) return '';
    const [y, m, d] = dateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const isToday = dateKey === getTodayKey();
    const formatted = dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return isToday ? `Today (${formatted})` : formatted;
  }, [getTodayKey]);

  // Stepper to navigate day-by-day
  const handleStepAuditDay = useCallback((delta) => {
    const baseKey = auditSelectedDate === 'all' ? getTodayKey() : auditSelectedDate;
    const [y, m, d] = baseKey.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d + delta);
    const nextKey = getLocalDayKey(targetDate);
    setAuditSelectedDate(nextKey);
    setAuditCalendarMonth(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
  }, [auditSelectedDate, getTodayKey, getLocalDayKey]);

  // Map of dateKey -> count of logs
  const auditDatesWithLogs = useMemo(() => {
    const map = new Map();
    auditLogsList.forEach(log => {
      // Exclude session / profile switch events
      if (log.version_number === 'LOG' || log.plan_status === 'logged_in' || (log.amendment_reason && log.amendment_reason.startsWith('Account Profile Switch'))) {
        return;
      }
      if (activeRole === 'student') {
        const matchesCurrentStudent = selectedStudent ? (
          (log.student_number && log.student_number === selectedStudent.student_number) ||
          (log.first_name && log.first_name.toLowerCase() === selectedStudent.first_name.toLowerCase()) ||
          (log.student_name && log.student_name.toLowerCase().includes(selectedStudent.first_name.toLowerCase()))
        ) : true;
        if (!matchesCurrentStudent) return;
      }
      const key = getLocalDayKey(log.created_at);
      if (key) {
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return map;
  }, [auditLogsList, activeRole, selectedStudent, getLocalDayKey]);

  // Active dates with logs in the currently viewed calendar month
  const activeMonthDatesWithLogs = useMemo(() => {
    const targetY = auditCalendarMonth.getFullYear();
    const targetM = auditCalendarMonth.getMonth();
    return Array.from(auditDatesWithLogs.entries()).filter(([key]) => {
      const [y, m] = key.split('-').map(Number);
      return y === targetY && (m - 1) === targetM;
    }).sort((a, b) => b[0].localeCompare(a[0]));
  }, [auditDatesWithLogs, auditCalendarMonth]);

  // Calendar grid day cells
  const auditCalendarGridDays = useMemo(() => {
    const year = auditCalendarMonth.getFullYear();
    const month = auditCalendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      days.push({
        dateKey: getLocalDayKey(prevDate),
        dayNumber: dayNum,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(year, month, d);
      days.push({
        dateKey: getLocalDayKey(currDate),
        dayNumber: d,
        isCurrentMonth: true
      });
    }

    // Next month days to complete week rows
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        dateKey: getLocalDayKey(nextDate),
        dayNumber: d,
        isCurrentMonth: false
      });
    }

    return days;
  }, [auditCalendarMonth, getLocalDayKey]);

  // Filtered audit logs respecting Role, Calendar Date (Daily Reset), and Search Query
  const filteredAuditLogs = useMemo(() => {
    return auditLogsList.filter(log => {
      // Exclude session / profile switch events
      if (log.version_number === 'LOG' || log.plan_status === 'logged_in' || (log.amendment_reason && log.amendment_reason.startsWith('Account Profile Switch'))) {
        return false;
      }

      // 1. Role filter (Student View mode)
      if (activeRole === 'student') {
        const matchesCurrentStudent = selectedStudent ? (
          (log.student_number && log.student_number === selectedStudent.student_number) ||
          (log.first_name && log.first_name.toLowerCase() === selectedStudent.first_name.toLowerCase()) ||
          (log.student_name && log.student_name.toLowerCase().includes(selectedStudent.first_name.toLowerCase()))
        ) : true;
        if (!matchesCurrentStudent) return false;
      }

      // 2. Date filter (Calendar / Daily Reset)
      if (auditSelectedDate && auditSelectedDate !== 'all') {
        const logDateKey = getLocalDayKey(log.created_at);
        if (logDateKey !== auditSelectedDate) return false;
      }

      // 3. Search query filter
      if (!auditSearchQuery.trim()) return true;
      const q = auditSearchQuery.toLowerCase();
      const name = (log.student_name || (log.first_name ? `${log.first_name} ${log.last_name || ''}` : '')).toLowerCase();
      const num = (log.student_number || '').toLowerCase();
      const reason = (log.amendment_reason || '').toLowerCase();
      const status = (log.plan_status || '').toLowerCase();
      const author = (log.created_by || '').toLowerCase();
      return name.includes(q) || num.includes(q) || reason.includes(q) || status.includes(q) || author.includes(q);
    });
  }, [auditLogsList, activeRole, selectedStudent, auditSelectedDate, auditSearchQuery, getLocalDayKey]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  const formatNotificationTimestamp = (timeMs = Date.now()) => {
    const d = new Date(timeMs);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Notifications Drawer State (pure in-memory, no localStorage cache)
  const [notifications, setNotifications] = useState(() => [
    {
      id: 'n-0',
      role: 'chair',
      studentId: 2,
      targetYear: 3,
      requestYear: 2028,
      requestPeriods: [1, 2],
      layoutType: 'semester',
      title: 'Replan Request from Sarah Jenkins (Existing Student)',
      message: 'Sarah Jenkins requested a semester study plan for Semester 1 (S1), Semester 2 (S2) 2028.',
      timestamp: formatNotificationTimestamp(Date.now() - 1800000),
      createdTimeMs: Date.now() - 1800000,
      read: false,
      actionType: 'AUTO_GENERATE',
      actionLabel: 'Review & Auto-Generate'
    },
    {
      id: 'n-1',
      role: 'chair',
      studentId: 1,
      targetYear: 2,
      requestYear: 2027,
      requestPeriods: [3, 4, 5],
      layoutType: 'trimester',
      title: 'Existing Student Plan Request from Alex Mercer',
      message: 'Alex Mercer submitted a study plan request for Trimesters 1, 2, 3 (2027).',
      timestamp: formatNotificationTimestamp(Date.now() - 3600000),
      createdTimeMs: Date.now() - 3600000,
      read: false,
      actionType: 'AUTO_GENERATE',
      actionLabel: 'Review & Auto-Generate'
    },
    {
      id: 'n-2',
      role: 'student',
      studentId: 2,
      title: 'Study Plan Signed and Agreed',
      message: 'You have agreed and signed your 72 CP Study Plan for Computer Science (PT3-BSIT-CS02).',
      timestamp: formatNotificationTimestamp(Date.now() - 900000),
      createdTimeMs: Date.now() - 900000,
      read: false,
      actionType: 'REVIEW',
      actionLabel: 'View Agreed Plan'
    }
  ]);

  // Synchronized Stored Plans List: Automatically reflects student disagreement / revision requests
  const effectiveStoredPlansList = useMemo(() => {
    return (storedPlansList || []).map(plan => {
      const sId = plan.student_id;
      const cached = allStudentPlansMap[sId] || allStudentPlansMap[Number(sId)] || allStudentPlansMap[String(sId)];

      // Look for active disagreement notification
      const disagreementNotif = (notifications || []).find(n =>
        (Number(n.studentId) === Number(sId) || String(n.studentId) === String(sId)) &&
        (n.title?.includes('Disagreed') || n.title?.includes('Change Requested') || n.title?.includes('Rejected'))
      );

      const comment = disagreementNotif?.rejectionComment ||
                      disagreementNotif?.comment ||
                      (disagreementNotif?.message?.match(/"([^"]+)"/)?.[1]) ||
                      cached?.plan?.rejectionComment ||
                      cached?.plan?.rejection_comment ||
                      (selectedStudent?.student_id === sId && currentPlan?.rejectionComment) ||
                      plan.rejectionComment;

      const hasDisagreement = Boolean(disagreementNotif || cached?.plan?.status === 'rejected' || (selectedStudent?.student_id === sId && currentPlan?.status === 'rejected') || comment);

      const isCurrentlyAmending = Boolean(plan.isAmending || (selectedStudent && Number(selectedStudent.student_id) === Number(sId) && currentPlan?.isAmending));

      if (hasDisagreement && plan.status !== 'approved_new' && !isCurrentlyAmending) {
        return {
          ...plan,
          status: 'rejected',
          rejectionComment: comment || 'Student requested changes on study plan',
          rejection_comment: comment || 'Student requested changes on study plan'
        };
      }

      // If this student currently has an active plan in memory, sync status if changed
      if (selectedStudent && Number(selectedStudent.student_id) === Number(sId) && currentPlan?.status) {
        return {
          ...plan,
          status: currentPlan.status,
          version_number: currentPlan.version_number || plan.version_number,
          updated_at: currentPlan.updated_at || plan.updated_at,
          rejectionComment: currentPlan.rejectionComment || plan.rejectionComment
        };
      }

      return plan;
    });
  }, [storedPlansList, notifications, allStudentPlansMap, selectedStudent, currentPlan]);

  // Academic Chair Prerequisite Waiver Notification Handler
  const handleWaiverChange = (unitCode, isGranted) => {
    if (!selectedStudent) return;
    const actionLabel = isGranted ? 'Approved' : 'Revoked';
    const waiverNotif = {
      id: `n-${Date.now()}`,
      role: 'student',
      studentId: selectedStudent.student_id,
      title: `Chair Prerequisite Waiver ${actionLabel}: ${unitCode}`,
      message: `Academic Chair Dr. Aris Thorne has ${actionLabel.toLowerCase()} an official prerequisite waiver override for unit ${unitCode}.`,
      timestamp: formatNotificationTimestamp(),
      createdTimeMs: Date.now(),
      read: false,
      actionType: 'REVIEW',
      actionLabel: 'View Study Plan'
    };
    setNotifications(prev => [waiverNotif, ...prev]);
  };

  // Automatic 24-Hour Notification Queue Purge Effect (Items older than 24h are auto-cleared from active notifications)
  useEffect(() => {
    const purgeOldNotifications = () => {
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
      setNotifications(prev => prev.filter(n => {
        if (!n.createdTimeMs) return true;
        return n.createdTimeMs >= twentyFourHoursAgo;
      }));
    };
    purgeOldNotifications();
    const interval = setInterval(purgeOldNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Export Change Log & Audit Trail as Printable PDF Document
  const handleDownloadAuditPDF = () => {
    const listToExport = filteredAuditLogs && filteredAuditLogs.length > 0 ? filteredAuditLogs : auditLogsList;
    const dateScopeText = auditSelectedDate === 'all'
      ? 'Complete Historical Audit Trail'
      : `Daily Filter Scope: ${formatSelectedDateDisplay(auditSelectedDate)}`;

    const logRows = listToExport.map((log) => {
      const studentName = log.student_name || (log.first_name ? `${log.first_name} ${log.last_name || ''}` : (selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Student Profile'));
      const studentNum = log.student_number || selectedStudent?.student_number || '31234561';
      const statusLabel = log.plan_status === 'logged_in' ? 'LOGIN / ACCOUNT SWITCH' :
        log.plan_status === 'request_submitted' ? 'STUDENT REQUEST' :
        log.plan_status === 'approved' ? 'APPROVED & FINALIZED' :
        log.plan_status === 'agreed' ? 'AGREED BY STUDENT' :
        log.plan_status === 'recommended' ? 'RECOMMENDED BY CHAIR' :
        log.plan_status === 'rejected' ? 'CHANGE REQUESTED' :
        (log.plan_status || 'STATUS CHANGED').toUpperCase();

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #b91c1c;">${new Date(log.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
          <td style="padding: 10px; font-family: monospace; font-weight: 800; color: #0f172a;">v${log.version_number || 1}.0</td>
          <td style="padding: 10px; font-weight: bold;">${statusLabel}</td>
          <td style="padding: 10px; font-weight: bold; font-family: monospace;">${studentName} (${studentNum})</td>
          <td style="padding: 10px; color: #334155;">${log.amendment_reason || 'Study plan status update'}</td>
          <td style="padding: 10px; font-weight: bold;">${log.created_by || 'Academic Chair'}</td>
        </tr>
      `;
    }).join('');

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow pop-ups to export the Change Log PDF.');
      return;
    }
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Study Plan Change Log & Data Audit Trail PDF</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 35px; color: #0f172a; }
          .header { border-bottom: 3px solid #b91c1c; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #0f172a; color: white; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
          .footer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Official Study Plan Change Log & Data Audit Trail</div>
            <div class="subtitle">${dateScopeText} &bull; PT03 Solutions Academic Governance System</div>
          </div>
          <div style="text-align: right; font-size: 11px; font-family: monospace;">
            <div>Export Date: ${new Date().toLocaleString()}</div>
            <div>Records in Export: ${listToExport.length}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Version</th>
              <th>Status / Event</th>
              <th>Student / Profile</th>
              <th>Change Log / Audit Description</th>
              <th>Author</th>
            </tr>
          </thead>
          <tbody>
            ${logRows || '<tr><td colspan="6" style="text-align:center; padding: 20px;">No audit records found.</td></tr>'}
          </tbody>
        </table>
        <div class="footer">
          <span>Certified Official Audit Log Document - Academic Governance System</span>
          <span>Security Hash: SEC-AUDIT-${Date.now()}</span>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleMarkAllNotificationsRead = (targetRole) => {
    setNotifications(prev => prev.map(n => n.role === targetRole ? { ...n, read: true } : n));
  };

  const handleSelectNotification = async (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));

    // 1. Extract and normalize notification request metadata
    let notifLayout = notif.layoutType;
    if (!notifLayout) {
      if (notif.message && notif.message.toLowerCase().includes('semester')) {
        notifLayout = 'semester';
      } else if (notif.message && notif.message.toLowerCase().includes('trimester')) {
        notifLayout = 'trimester';
      }
    }
    if (!notifLayout) notifLayout = 'trimester';

    let notifYear = notif.requestYear;
    let targetYr = notif.targetYear;
    if (!notifYear) {
      const matchYr = notif.message?.match(/202[6-9]/);
      if (matchYr) {
        notifYear = Number(matchYr[0]);
        targetYr = notifYear === 2027 ? 2 : notifYear === 2028 ? 3 : 1;
      }
    }
    if (!targetYr) targetYr = notifYear === 2027 ? 2 : notifYear === 2028 ? 3 : 1;
    if (!notifYear) notifYear = targetYr === 2 ? 2027 : targetYr === 3 ? 2028 : 2026;

    let notifPeriods = notif.requestPeriods;
    if (!notifPeriods || notifPeriods.length === 0) {
      if (notifLayout === 'semester') {
        notifPeriods = [1, 2];
      } else {
        notifPeriods = [3, 4, 5];
      }
    }

    const isDisagreementNotif = notif.title?.includes('Disagreed') || 
                                notif.title?.includes('Change Requested') || 
                                notif.title?.includes('Rejected') ||
                                notif.actionLabel?.includes('Review Student Feedback');
    const isRecommendedNotif = notif.title?.includes('Recommended') || notif.actionLabel?.includes('Recommended');

    const extractedComment = notif.rejectionComment || 
                             notif.comment || 
                             (notif.message?.match(/"([^"]+)"/)?.[1]) || 
                             null;

    const planOptions = {
      targetYearLevel: targetYr,
      requestYear: notifYear,
      requestPeriods: notifPeriods,
      layoutType: notifLayout,
      forceScrollTrigger: Date.now(),
      rejectionComment: isDisagreementNotif ? (extractedComment || 'Student requested changes') : undefined,
      status: isDisagreementNotif ? 'rejected' : (isRecommendedNotif ? 'recommended' : undefined)
    };

    let targetStudentObj = null;
    if (notif.studentId) {
      targetStudentObj = studentsList.find(s => Number(s.student_id) === Number(notif.studentId));
      if (targetStudentObj) {
        if (currentUser?.role === 'chair') {
          await handleSelectStudent(targetStudentObj, 'chair', planOptions);
        } else if (currentUser?.role === 'student') {
          const myProfile = studentsList.find(s => Number(s.student_id) === Number(currentUser.student_id)) || targetStudentObj;
          await handleSelectStudent(myProfile, 'student', planOptions);
        } else {
          await handleSelectStudent(targetStudentObj, notif.role === 'chair' ? 'chair' : 'student', planOptions);
        }
      }
    }

    if (currentUser?.role === 'student') {
      setActiveRole('student');
    } else if (currentUser?.role === 'chair') {
      setActiveRole('chair');
      const stName = targetStudentObj ? `${targetStudentObj.first_name} ${targetStudentObj.last_name}` : 'Student';
      const stNum = targetStudentObj?.student_number ? ` (${targetStudentObj.student_number})` : '';
      updatePlanRecordAndLogAudit(
        isDisagreementNotif ? 'rejected' : (currentPlan?.status || 'draft'),
        `Academic Chair reviewed student request notification for ${stName}${stNum}: "${notif.title} - ${notif.message}"`,
        'Academic Chair'
      );
    } else {
      setActiveRole(notif.role === 'chair' ? 'chair' : 'student');
    }

    setActiveTab('STUDY_PLAN');

    // Run unified auto-generate plan when notification action is AUTO_GENERATE or a student plan request
    const isPlanRequestNotif = notif.actionType === 'AUTO_GENERATE' || notif.title?.includes('Plan Request') || notif.title?.includes('Replan Request');
    if (isPlanRequestNotif && notif.studentId) {
      await handleAutoGeneratePlan(notif.studentId, {
        targetYearLevel: targetYr,
        requestYear: notifYear,
        requestPeriods: notifPeriods,
        layoutType: notifLayout,
        isStudentRequest: true
      });
      const stName = targetStudentObj ? `${targetStudentObj.first_name} ${targetStudentObj.last_name}` : 'Student';
      showToast(`⚡ Auto-generated ${notifLayout} study plan for ${stName} (${notifYear}) based on request!`);
    }

    // Auto-scroll directly down to student feedback alert banner if disagreement, or target year block
    const scrollToTargetSection = () => {
      if (isDisagreementNotif) {
        const feedbackBanner = document.getElementById('student-feedback-alert-banner');
        if (feedbackBanner) {
          const yOffset = -90;
          const y = feedbackBanner.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          return;
        }
      }
      const yearBlock = document.getElementById(`year-block-${targetYr}`) || document.getElementById('study-plan-years-section') || document.getElementById('year-grid-canvas');
      if (yearBlock) {
        const yOffset = -85;
        const y = yearBlock.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    };

    setTimeout(scrollToTargetSection, 100);
    setTimeout(scrollToTargetSection, 350);
    setTimeout(scrollToTargetSection, 700);
  };

  const handleStudentSubmitPlanRequest = ({ year = 2026, periodIds = [3, 4, 5], layoutType = 'trimester', comment = '' }) => {
    if (!selectedStudent) return;
    if (currentPlan?.status === 'request_submitted') {
      showToast('⚠️ You already have an active study plan request under review by the Academic Chair.');
      return;
    }
    if (currentPlan?.status === 'rejected') {
      showToast('⚠️ You have already requested changes for this study plan. The Academic Chair is reviewing your comments.');
      return;
    }
    const stName = `${selectedStudent.first_name} ${selectedStudent.last_name}`;
    const detectedLayout = layoutType || (periodIds.some(p => p === 1 || p === 2) ? 'semester' : 'trimester');
    const termLabels = periodIds.map(p => p === 1 ? 'Semester 1 (S1)' : p === 2 ? 'Semester 2 (S2)' : p === 3 ? 'Trimester 1 (T1)' : p === 4 ? 'Trimester 2 (T2)' : 'Trimester 3 (T3)').join(', ');
    const msg = `${stName} requested a ${detectedLayout} study plan for ${termLabels} ${year}.${comment ? ` Note: "${comment}"` : ''}`;

    const targetYrLvl = year === 2027 ? 2 : year === 2028 ? 3 : 1;
    const wasApproved = currentPlan?.status === 'approved' || currentPlan?.status === 'agreed' || currentPlan?.status === 'stored';
    const isNew = selectedStudent?.account_category === 'new_student';
    const studentCategoryPrefix = isNew ? 'New Student' : 'Existing Student';

    const newNotif = {
      id: `n-${Date.now()}`,
      role: 'chair',
      studentId: selectedStudent.student_id,
      targetYear: targetYrLvl,
      requestYear: year,
      requestPeriods: periodIds,
      layoutType: detectedLayout,
      title: wasApproved
        ? `Replan Request from ${stName} (${studentCategoryPrefix})`
        : `${studentCategoryPrefix} Plan Request from ${stName}`,
      message: msg,
      timestamp: formatNotificationTimestamp(),
      createdTimeMs: Date.now(),
      read: false,
      actionType: 'AUTO_GENERATE',
      actionLabel: 'Review & Auto-Generate'
    };

    setNotifications(prev => [newNotif, ...prev]);

    if (currentPlan) {
      const updatedPlan = {
        ...currentPlan,
        status: 'request_submitted',
        layoutType: detectedLayout,
        studentSignature: wasApproved ? null : currentPlan?.studentSignature,
        signature: wasApproved ? null : currentPlan?.signature,
        requestYear: year,
        targetYearLevel: targetYrLvl,
        requestPeriods: periodIds,
        requestComment: comment,
        updated_at: formatCurrentDateTime(),
        version_number: (currentPlan?.version_number || 1) + 1,
        manuallySubmittedInSession: true
      };
      setCurrentPlan(updatedPlan);
      setAllStudentPlansMap(prev => {
        const nextMap = {
          ...prev,
          [selectedStudent.student_id]: {
            plan: updatedPlan,
            units: planUnits
          },
          [String(selectedStudent.student_id)]: {
            plan: updatedPlan,
            units: planUnits
          }
        };
        return nextMap;
      });

      updatePlanRecordAndLogAudit(
        'request_submitted',
        wasApproved
          ? `Previously APPROVED study plan re-opened: Student submitted new replan request for Year ${targetYrLvl} (${year}) (${detectedLayout.toUpperCase()} layout)`
          : `Student submitted study plan request for Year ${targetYrLvl} (${year}) (${detectedLayout.toUpperCase()} layout)`,
        `Student: ${stName}`
      );
    }

    showToast(
      wasApproved
        ? `Approved plan re-opened! Replan request submitted to Academic Chair for Year ${targetYrLvl} (${year}).`
        : `Study plan request submitted to Academic Chair! Switched focus to Year ${targetYrLvl} (${year}).`
    );
  };

  const handleAutoGeneratePlan = async (targetStudentId, options = {}) => {
    const targetStudent = studentsList.find(s => Number(s.student_id) === Number(targetStudentId || selectedStudent?.student_id)) || selectedStudent;
    if (!targetStudent) return;

    // Fetch fresh student history for target student to avoid reading stale React state
    let studentHistory = history;
    if (!studentHistory || studentHistory.length === 0 || Number(selectedStudent?.student_id) !== Number(targetStudent.student_id)) {
      try {
        studentHistory = await fetchStudentHistory(targetStudent.student_id);
        if (Number(selectedStudent?.student_id) === Number(targetStudent.student_id)) {
          setHistory(studentHistory || []);
        }
      } catch (e) {
        studentHistory = history || [];
      }
    }

    // Filter completed passed units from student history
    const completedHistory = (studentHistory || []).filter(h => h.status === 'completed');
    const completedCodes = new Set(completedHistory.map(h => h.unit_code || h.code));

    // Calculate passed years from history (e.g. 6+ completed units in Year 1 / 2026 means Year 1 is passed)
    const passedYears = new Set();
    const yr1Count = completedHistory.filter(h => (h.year_taken === 2026 || h.academic_year === 2026) || (h.period_id >= 3 && h.period_id <= 5 && ((h.year_taken && h.year_taken <= 2026) || (!h.year_taken && !h.academic_year)))).length;
    if (yr1Count >= 6) passedYears.add(1);
    const yr2Count = completedHistory.filter(h => (h.year_taken === 2027 || h.academic_year === 2027)).length;
    if (yr2Count >= 6) passedYears.add(2);

    // Resolve target student's existing plan and units from cache/state
    let studentCurrentPlan = currentPlan;
    let studentExistingUnits = planUnits;
    if (Number(selectedStudent?.student_id) !== Number(targetStudent.student_id)) {
      const cached = allStudentPlansMap[targetStudent.student_id] || allStudentPlansMap[Number(targetStudent.student_id)] || allStudentPlansMap[String(targetStudent.student_id)];
      if (cached) {
        studentCurrentPlan = cached.plan || currentPlan;
        studentExistingUnits = cached.units || [];
      }
    }

    const reqYear = options.requestYear || studentCurrentPlan?.requestYear || 2026;
    let targetYearLvl = options.targetYearLevel !== undefined ? options.targetYearLevel : (studentCurrentPlan?.targetYearLevel || 'all');

    const layoutType = options.layoutType || studentCurrentPlan?.layoutType || (options.requestPeriods && options.requestPeriods.some(p => p === 1 || p === 2) ? 'semester' : 'trimester');
    const defaultPeriods = layoutType === 'semester' ? [1, 2] : [3, 4, 5];
    let requestedPeriods = (options.requestPeriods && options.requestPeriods.length > 0)
      ? options.requestPeriods.map(Number)
      : (studentCurrentPlan?.requestPeriods ? studentCurrentPlan.requestPeriods.map(Number) : defaultPeriods);

    if (layoutType === 'semester') {
      requestedPeriods = requestedPeriods.filter(p => p === 1 || p === 2);
      if (requestedPeriods.length === 0) requestedPeriods = [1, 2];
    } else {
      requestedPeriods = requestedPeriods.filter(p => p >= 3 && p <= 5);
      if (requestedPeriods.length === 0) requestedPeriods = [3, 4, 5];
    }

    // Determine numerical target year level if specific year (1, 2, 3) selected, or 'all'
    const targetLvlNum = typeof targetYearLvl === 'number'
      ? targetYearLvl
      : (targetYearLvl !== 'all' && !isNaN(Number(targetYearLvl)) ? Number(targetYearLvl) : null);

    const isAllYears = !targetLvlNum || targetYearLvl === 'all';

    // Total degree target is 72 CP.
    // Calculate how many CP are completed in academic history
    const targetDegreeCP = 72;
    const currentCompletedCP = completedHistory.reduce((sum, h) => sum + Number(h.credit_points || 3), 0);
    const neededCanvasCP = Math.max(0, targetDegreeCP - currentCompletedCP);

    // Identify all open uncompleted years
    let uncompletedYears = [1, 2, 3].filter(y => !passedYears.has(y));
    if (uncompletedYears.length === 0) uncompletedYears = [2, 3];

    // Order years so target/requested year is prioritized first, followed by other open years
    let yearsToFill = [];
    if (Array.isArray(options.targetYears) && options.targetYears.length > 0) {
      yearsToFill = options.targetYears.map(Number).filter(y => !passedYears.has(y));
    } else if (Array.isArray(options.targetYearLevel) && options.targetYearLevel.length > 0) {
      yearsToFill = options.targetYearLevel.map(Number).filter(y => !passedYears.has(y));
    } else if (targetLvlNum && !passedYears.has(targetLvlNum)) {
      yearsToFill = [targetLvlNum];
    } else {
      yearsToFill = uncompletedYears;
    }
    if (yearsToFill.length === 0) {
      yearsToFill = uncompletedYears.length > 0 ? uncompletedYears : [2, 3];
    }

    // Determine exact target slots (year_level, period_id) being auto-filled:
    // Only modify slots that match the selected/checked year(s) AND checked period(s)
    const isTargetSlot = (yearLevel, periodId) => {
      const matchesYear = yearsToFill.map(Number).includes(Number(yearLevel));
      const matchesPeriod = requestedPeriods.map(Number).includes(Number(periodId));
      return matchesYear && matchesPeriod;
    };

    const scheduledUnits = [];
    const scheduledCodes = new Set();
    const periodLoads = {};

    // Initialize periodLoads with completed units from student history
    for (const h of completedHistory) {
      const hYear = Number(h.year_taken === 2026 ? 1 : h.year_taken === 2027 ? 2 : h.year_taken === 2028 ? 3 : (h.academic_year === 2026 ? 1 : h.academic_year === 2027 ? 2 : 1));
      const hPeriod = Number(h.period_id);
      if (hYear && hPeriod) {
        const pKey = `y${hYear}_p${hPeriod}`;
        periodLoads[pKey] = (periodLoads[pKey] || 0) + Number(h.credit_points || 3);
      }
    }

    // Preserve any existing draft units whose slot is NOT in the target auto-fill scope,
    // excluding units already completed in history or belonging to passed years
    const existingDraftUnits = (studentExistingUnits || studentCurrentPlan?.plan_units || []);
    for (const u of existingDraftUnits) {
      const uYear = Number(u.year_level);
      const isCompleted = completedCodes.has(u.code);
      const isPassedYear = passedYears.has(uYear);
      if (!isTargetSlot(uYear, u.period_id) && !isCompleted && !isPassedYear) {
        scheduledUnits.push(u);
        scheduledCodes.add(u.code);
        const pKey = `y${uYear}_p${Number(u.period_id)}`;
        periodLoads[pKey] = (periodLoads[pKey] || 0) + Number(u.credit_points || 3);
      }
    }

    // Complete 72 CP Presets (24 units × 3 CP = 72 CP total: 8 units in Y1, 8 units in Y2, 8 units in Y3)
    // 100% compliant with Singapore Campus Offering Calendars and Unit Prerequisite sequences
    const MAJOR_PRESETS = {
      ai: {
        trimester: [
          // Year 1 (8 units = 24 CP)
          { year: 1, period_id: 3, cores: ['ICT100', 'ICT158', 'ICT159'] },
          { year: 1, period_id: 4, cores: ['ICT145', 'MAS162', 'ICT169'] },
          { year: 1, period_id: 5, cores: ['ICT170', 'MAS183'] },
          // Year 2 (8 units = 24 CP)
          { year: 2, period_id: 3, cores: ['ICT167', 'ICT201', 'ICT285'] },
          { year: 2, period_id: 4, cores: ['ICT202', 'ICT283', 'ICT206'] },
          { year: 2, period_id: 5, cores: ['ICT203', 'BSC203'] },
          // Year 3 (8 units = 24 CP)
          { year: 3, period_id: 3, cores: ['ICT292', 'ICT302', 'ICT304'] },
          { year: 3, period_id: 4, cores: ['ICT303', 'ICT305', 'ICT301'] },
          { year: 3, period_id: 5, cores: ['ICT374', 'ICT373'] }
        ],
        semester: [
          // Year 1 (8 units = 24 CP)
          { year: 1, period_id: 1, cores: ['ICT100', 'ICT158', 'ICT159', 'ICT145'] },
          { year: 1, period_id: 2, cores: ['MAS162', 'ICT169', 'ICT170', 'MAS183'] },
          // Year 2 (8 units = 24 CP)
          { year: 2, period_id: 1, cores: ['ICT167', 'ICT202', 'ICT285', 'ICT292'] },
          { year: 2, period_id: 2, cores: ['ICT201', 'ICT303', 'ICT305', 'ICT301'] },
          // Year 3 (8 units = 24 CP)
          { year: 3, period_id: 1, cores: ['ICT283', 'ICT203', 'ICT206', 'BSC203'] },
          { year: 3, period_id: 2, cores: ['ICT302', 'ICT304', 'ICT374', 'ICT373'] }
        ]
      },
      cs: {
        trimester: [
          // Year 1 (8 units = 24 CP)
          { year: 1, period_id: 3, cores: ['ICT100', 'ICT158', 'ICT159'] },
          { year: 1, period_id: 4, cores: ['MAS162', 'MAS164', 'ICT169'] },
          { year: 1, period_id: 5, cores: ['ICT170', 'MAS183'] },
          // Year 2 (8 units = 24 CP)
          { year: 2, period_id: 3, cores: ['ICT145', 'ICT167', 'ICT284'] },
          { year: 2, period_id: 4, cores: ['ICT283', 'ICT285', 'ICT201'] },
          { year: 2, period_id: 5, cores: ['ICT202', 'ICT292'] },
          // Year 3 (8 units = 24 CP)
          { year: 3, period_id: 3, cores: ['ICT203', 'ICT302', 'ICT304'] },
          { year: 3, period_id: 4, cores: ['ICT206', 'ICT374', 'ICT301'] },
          { year: 3, period_id: 5, cores: ['ICT373', 'ICT305'] }
        ],
        semester: [
          // Year 1 (8 units = 24 CP)
          { year: 1, period_id: 1, cores: ['ICT100', 'ICT158', 'ICT159', 'MAS164'] },
          { year: 1, period_id: 2, cores: ['MAS162', 'ICT169', 'ICT170', 'MAS183'] },
          // Year 2 (8 units = 24 CP)
          { year: 2, period_id: 1, cores: ['ICT145', 'ICT167', 'ICT285', 'ICT202'] },
          { year: 2, period_id: 2, cores: ['ICT283', 'ICT284', 'ICT201', 'ICT305'] },
          // Year 3 (8 units = 24 CP)
          { year: 3, period_id: 1, cores: ['ICT292', 'ICT206', 'ICT203', 'ICT304'] },
          { year: 3, period_id: 2, cores: ['ICT302', 'ICT373', 'ICT374', 'ICT301'] }
        ]
      },
      bis: {
        trimester: [
          // Year 1 (8 units = 24 CP)
          { year: 1, period_id: 3, cores: ['ICT100', 'ICT158', 'ICT159'] },
          { year: 1, period_id: 4, cores: ['ICT169', 'MAS162', 'ICT145'] },
          { year: 1, period_id: 5, cores: ['ICT170', 'MAS183'] },
          // Year 2 (8 units = 24 CP)
          { year: 2, period_id: 3, cores: ['MAS164', 'ICT167', 'ICT201'] },
          { year: 2, period_id: 4, cores: ['ICT284', 'ICT285', 'ICT292'] },
          { year: 2, period_id: 5, cores: ['BSC203', 'ICT202'] },
          // Year 3 (8 units = 24 CP)
          { year: 3, period_id: 3, cores: ['ICT283', 'ICT302', 'ICT393'] },
          { year: 3, period_id: 4, cores: ['ICT206', 'ICT394', 'ICT301'] },
          { year: 3, period_id: 5, cores: ['ICT305', 'ICT373'] }
        ],
        semester: [
          // Year 1 (8 units = 24 CP)
          { year: 1, period_id: 1, cores: ['ICT100', 'ICT158', 'ICT159', 'ICT169'] },
          { year: 1, period_id: 2, cores: ['MAS162', 'ICT170', 'MAS183', 'ICT167'] },
          // Year 2 (8 units = 24 CP)
          { year: 2, period_id: 1, cores: ['ICT145', 'MAS164', 'ICT285', 'ICT292'] },
          { year: 2, period_id: 2, cores: ['ICT201', 'ICT284', 'ICT394', 'ICT301'] },
          // Year 3 (8 units = 24 CP)
          { year: 3, period_id: 1, cores: ['BSC203', 'ICT283', 'ICT202', 'ICT206'] },
          { year: 3, period_id: 2, cores: ['ICT302', 'ICT393', 'ICT305', 'ICT373'] }
        ]
      },
      se: {
        trimester: [
          // Year 1 (8 units = 24 CP)
          { year: 1, period_id: 3, cores: ['ICT100', 'ICT158', 'ICT159'] },
          { year: 1, period_id: 4, cores: ['ICT145', 'MAS162', 'ICT169'] },
          { year: 1, period_id: 5, cores: ['ICT170', 'MAS183'] },
          // Year 2 (8 units = 24 CP)
          { year: 2, period_id: 3, cores: ['MAS164', 'ICT167', 'ICT201'] },
          { year: 2, period_id: 4, cores: ['ICT283', 'ICT284', 'ICT285'] },
          { year: 2, period_id: 5, cores: ['BSC203', 'ICT292'] },
          // Year 3 (8 units = 24 CP)
          { year: 3, period_id: 3, cores: ['ICT203', 'ICT302', 'ICT373'] },
          { year: 3, period_id: 4, cores: ['ICT202', 'ICT374', 'ICT301'] },
          { year: 3, period_id: 5, cores: ['ICT304', 'ICT305'] }
        ],
        semester: [
          // Year 1 (8 units = 24 CP)
          { year: 1, period_id: 1, cores: ['ICT100', 'ICT158', 'ICT159', 'ICT145'] },
          { year: 1, period_id: 2, cores: ['MAS162', 'ICT169', 'ICT170', 'MAS183'] },
          // Year 2 (8 units = 24 CP)
          { year: 2, period_id: 1, cores: ['MAS164', 'ICT167', 'ICT292', 'ICT202'] },
          { year: 2, period_id: 2, cores: ['ICT201', 'ICT284', 'ICT301', 'ICT305'] },
          // Year 3 (8 units = 24 CP)
          { year: 3, period_id: 1, cores: ['ICT283', 'ICT285', 'BSC203', 'ICT203'] },
          { year: 3, period_id: 2, cores: ['ICT302', 'ICT373', 'ICT374', 'ICT304'] }
        ]
      }
    };

    const majorStr = ((targetStudent.major || targetStudent.course_name || targetStudent.course_code || targetStudent.alias_code || '') + '').toLowerCase();
    let majorKey = 'ai';
    if (majorStr.includes('artificial') || majorStr.includes('ai')) {
      majorKey = 'ai';
    } else if (majorStr.includes('computer science') || majorStr.includes('cs')) {
      majorKey = 'cs';
    } else if (majorStr.includes('business') || majorStr.includes('bis')) {
      majorKey = 'bis';
    } else if (majorStr.includes('software') || majorStr.includes('se')) {
      majorKey = 'se';
    }

    const presetsList = (MAJOR_PRESETS[majorKey] && MAJOR_PRESETS[majorKey][layoutType]) || MAJOR_PRESETS.ai.trimester;

    const isOfferingValid = (code, periodId) => {
      const allowed = getDynamicOfferings(code, layoutType);
      let termKey = null;
      const pNum = Number(periodId);
      if (layoutType === 'semester') {
        termKey = pNum === 1 ? 'Sem 1' : 'Sem 2';
      } else {
        if (pNum === 3) termKey = 'Tri 1';
        else if (pNum === 4) termKey = 'Tri 2';
        else if (pNum === 5) termKey = 'Tri 3';
      }
      return termKey ? allowed.includes(termKey) : true;
    };

    const getUnitPrereqCode = (unit) => {
      const staticMap = {
        'ICT167': 'ICT159', 'ICT201': 'ICT158', 'ICT202': 'ICT159', 'ICT203': 'ICT167',
        'ICT206': 'ICT167', 'ICT283': 'ICT167', 'ICT284': 'ICT158', 'ICT285': 'ICT159',
        'ICT292': 'ICT158', 'BSC203': 'ICT158', 'ICT301': 'ICT292', 'ICT302': 'ICT201',
        'ICT303': 'ICT202', 'ICT304': 'ICT203', 'ICT305': 'ICT202', 'ICT373': 'ICT283',
        'ICT374': 'ICT283', 'ICT393': 'ICT284', 'ICT394': 'ICT285'
      };
      if (unit.code && staticMap[unit.code]) return staticMap[unit.code];
      if (unit.prerequisite_code) return unit.prerequisite_code;
      if (unit.prereq_code) return unit.prereq_code;
      if (Array.isArray(unit.prerequisites) && unit.prerequisites.length > 0) {
        const p = unit.prerequisites[0];
        return typeof p === 'string' ? p : (p.prereq_code || p.code);
      }
      return null;
    };

    const isPrereqSatisfied = (unit, year, periodId, scheduledUnitsList, isPreset = false) => {
      const prereq = getUnitPrereqCode(unit);
      if (!prereq) return true;
      if (completedCodes.has(prereq)) return true;

      // Check if prerequisite is already scheduled in an earlier period/year
      const alreadyScheduled = scheduledUnitsList.some(s => {
        if (s.code !== prereq) return false;
        const sYear = Number(s.year_level);
        const uYear = Number(year);
        const sPeriod = Number(s.period_id);
        const uPeriod = Number(periodId);
        if (sYear < uYear) return true;
        if (sYear === uYear && sPeriod < uPeriod) return true;
        return false;
      });
      if (alreadyScheduled) return true;

      // When auto-filling accredited preset units:
      // If partial scope is selected (e.g. filling only Year 3 or Year 2),
      // prerequisites from earlier years belong to accredited study progression
      // and must NOT block official presets from being placed.
      if (isPreset) {
        return true;
      }

      // For fallback candidate fill when filling a specific year in isolation:
      if (!isAllYears) {
        const prereqUnit = (catalogUnits || []).find(p => p.code === prereq);
        const prereqLvl = prereqUnit ? Number(prereqUnit.level || 100) : 100;
        const prereqYear = prereqLvl >= 300 ? 3 : (prereqLvl >= 200 ? 2 : 1);
        if (prereqYear < Number(year) && !yearsToFill.map(Number).includes(prereqYear)) {
          return true;
        }
      }

      return false;
    };

    const getTargetPeriodCP = (periodId) => {
      const pNum = Number(periodId);
      if (layoutType === 'semester') return 12; // 4 units × 3 CP = 12 CP
      if (pNum === 5) return 6; // Trimester 3: 2 units × 3 CP = 6 CP
      return 9; // Trimesters 1 & 2: 3 units × 3 CP = 9 CP
    };

    // Helper to calculate newly scheduled plan CP (excluding units already completed in history)
    const getPlannedCP = () => scheduledUnits.filter(u => !completedCodes.has(u.code)).length * 3;

    // STEP 1: Prescribed Core Units Placement from Major Preset
    for (const year of yearsToFill) {
      if (passedYears.has(Number(year))) continue;
      for (const periodId of requestedPeriods) {
        const pKey = `y${Number(year)}_p${Number(periodId)}`;
        periodLoads[pKey] = periodLoads[pKey] || 0;

        const presetBlock = presetsList.find(b => Number(b.year) === Number(year) && Number(b.period_id) === Number(periodId));
        if (presetBlock && presetBlock.cores) {
          for (const coreCode of presetBlock.cores) {
            if (scheduledCodes.has(coreCode)) continue;
            if (completedCodes.has(coreCode)) continue;
            if (!isOfferingValid(coreCode, periodId)) continue;

            const unit = (catalogUnits || []).find(u => u.code === coreCode) || {
              code: coreCode,
              title: coreCode,
              credit_points: 3,
              level: Number(year) === 1 ? 100 : Number(year) === 2 ? 200 : 300
            };
            if (!isPrereqSatisfied(unit, year, periodId, scheduledUnits, true)) continue;

            const unitCP = Number(unit.credit_points || 3);
            const targetCap = layoutType === 'semester' ? 12 : (Number(periodId) === 5 ? 6 : 9);
            if ((periodLoads[pKey] || 0) + unitCP <= targetCap) {
              scheduledUnits.push({
                ...unit,
                unit_id: unit.unit_id || Math.floor(Math.random() * 100000),
                year_level: Number(year),
                period_id: Number(periodId),
                credit_points: unitCP,
                sequence_order: scheduledUnits.length + 1
              });
              scheduledCodes.add(unit.code);
              periodLoads[pKey] += unitCP;
            }
          }
        }
      }
    }

    // STEP 2: Safety fill to guarantee exact target load (8 units / 24 CP per year = 72 CP total)
    const masterFallbackUnits = [
      { code: 'ICT100', title: 'Transition to IT', credit_points: 3, level: 100 },
      { code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, level: 100 },
      { code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, level: 100 },
      { code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, level: 100 },
      { code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, level: 100 },
      { code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, level: 100 },
      { code: 'ICT145', title: 'Python Programming', credit_points: 3, level: 100 },
      { code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, level: 100 },
      { code: 'MAS164', title: 'Fundamentals of Mathematics', credit_points: 3, level: 100 },
      { code: 'MAS183', title: 'Statistical Data Analysis', credit_points: 3, level: 100 },
      { code: 'ICT201', title: 'IT Project Management', credit_points: 3, level: 200 },
      { code: 'ICT202', title: 'Machine Learning', credit_points: 3, level: 200 },
      { code: 'ICT203', title: 'Artificial Intelligence', credit_points: 3, level: 200 },
      { code: 'ICT206', title: 'Intelligent Systems', credit_points: 3, level: 200 },
      { code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, level: 200 },
      { code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, level: 200 },
      { code: 'ICT285', title: 'Databases', credit_points: 3, level: 200 },
      { code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, level: 200 },
      { code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, level: 200 },
      { code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, level: 300 },
      { code: 'ICT302', title: 'IT Professional Practice', credit_points: 3, level: 300 },
      { code: 'ICT303', title: 'Advanced Machine Learning', credit_points: 3, level: 300 },
      { code: 'ICT304', title: 'AI System Design', credit_points: 3, level: 300 },
      { code: 'ICT305', title: 'Data Visualisation', credit_points: 3, level: 300 },
      { code: 'ICT373', title: 'Software Architecture', credit_points: 3, level: 300 },
      { code: 'ICT374', title: 'Operating Systems', credit_points: 3, level: 300 },
      { code: 'ICT393', title: 'Advanced Business Analysis', credit_points: 3, level: 300 },
      { code: 'ICT394', title: 'Business Intelligence', credit_points: 3, level: 300 }
    ];

    const poolCatalog = (catalogUnits && catalogUnits.length > 0) ? catalogUnits : masterFallbackUnits;

    const getCandidatePriority = (candidate, targetYear) => {
      const cLvl = Number(candidate.level || 100);
      const yr = Number(targetYear);
      if (yr === 1) {
        return cLvl <= 199 ? 1 : 99; // Year 1: strictly 100-level
      }
      if (yr === 2) {
        if (cLvl >= 200 && cLvl <= 299) return 1; // Year 2: prefer 200-level
        if (cLvl <= 199) return 2; // fallback to 100-level elective
        return 99; // 300-level not allowed in Year 2
      }
      if (yr === 3) {
        if (cLvl >= 300) return 1; // Year 3: prefer 300-level
        if (cLvl >= 200 && cLvl <= 299) return 2; // fallback to 200-level advanced elective
        return 3;
      }
      return 10;
    };

    for (const year of yearsToFill) {
      if (passedYears.has(Number(year))) continue;
      for (const periodId of requestedPeriods) {
        const pKey = `y${Number(year)}_p${Number(periodId)}`;
        const targetCapacity = getTargetPeriodCP(periodId);

        const sortedPool = [...poolCatalog].sort((a, b) => {
          const pA = getCandidatePriority(a, year);
          const pB = getCandidatePriority(b, year);
          if (pA !== pB) return pA - pB;
          return (a.code || '').localeCompare(b.code || '');
        });

        while ((periodLoads[pKey] || 0) < targetCapacity) {
          const candidate = sortedPool.find(u => {
            if (scheduledCodes.has(u.code)) return false;
            if (completedCodes.has(u.code)) return false;

            // Level validation
            const priority = getCandidatePriority(u, year);
            if (priority >= 99) return false;

            // General Elective check (only 1 of MSP200 or COM203 allowed in entire degree)
            if (u.code === 'MSP200' && (scheduledCodes.has('COM203') || completedCodes.has('COM203'))) return false;
            if (u.code === 'COM203' && (scheduledCodes.has('MSP200') || completedCodes.has('MSP200'))) return false;

            // Teaching Period Offering validation
            if (!isOfferingValid(u.code, periodId)) return false;

            // Prerequisite validation
            if (!isPrereqSatisfied(u, year, periodId, scheduledUnits, false)) return false;

            return true;
          });

          if (!candidate) break;

          const unitCP = Number(candidate.credit_points || 3);
          scheduledUnits.push({
            ...candidate,
            unit_id: candidate.unit_id || Math.floor(Math.random() * 100000),
            year_level: Number(year),
            period_id: Number(periodId),
            credit_points: unitCP,
            sequence_order: scheduledUnits.length + 1
          });
          scheduledCodes.add(candidate.code);
          periodLoads[pKey] = (periodLoads[pKey] || 0) + unitCP;
        }
      }
    }

    // Deduplicate scheduledUnits by code as final safety
    const uniqueScheduledUnits = [];
    const finalSeenCodes = new Set();
    for (const u of scheduledUnits) {
      if (!u || !u.code) continue;
      if (finalSeenCodes.has(u.code)) continue;
      finalSeenCodes.add(u.code);
      uniqueScheduledUnits.push(u);
    }

    const totalGeneratedCP = currentCompletedCP + (uniqueScheduledUnits.filter(u => !completedCodes.has(u.code)).length * 3);

    handleSetPlanUnits(uniqueScheduledUnits);
    runValidation(targetStudent.student_id, targetStudent.location_id, uniqueScheduledUnits);

    // Revert status to 'draft' if plan was previously approved/agreed
    const wasApproved = studentCurrentPlan?.status === 'approved' || studentCurrentPlan?.status === 'agreed' || studentCurrentPlan?.status === 'stored';
    const newStatus = 'draft';

    const targetFocusYear = (Array.isArray(options.targetYears) && options.targetYears.length > 0)
      ? options.targetYears[0]
      : (targetLvlNum || (reqYear === 2027 ? 2 : reqYear === 2028 ? 3 : 1));

    const updatedPlan = {
      ...studentCurrentPlan,
      status: newStatus,
      total_credit_points: totalGeneratedCP,
      layoutType: layoutType,
      targetYearLevel: targetFocusYear,
      requestYear: reqYear,
      requestPeriods: requestedPeriods,
      forceScrollTrigger: Date.now(),
      studentSignature: wasApproved ? null : studentCurrentPlan?.studentSignature,
      signature: wasApproved ? null : studentCurrentPlan?.signature,
      updated_at: formatCurrentDateTime(),
      version_number: (studentCurrentPlan?.version_number || 1) + 1
    };
    setCurrentPlan(updatedPlan);

    // Update storedPlansList total_cp & status immediately
    setStoredPlansList(prevList =>
      prevList.map(p =>
        String(p.student_id) === String(targetStudent.student_id)
          ? {
              ...p,
              total_cp: totalGeneratedCP,
              status: newStatus,
              updated_at: formatCurrentDateTime(),
              version_number: updatedPlan.version_number
            }
          : p
      )
    );

    // Synchronize allStudentPlansMap for targetStudent with updatedPlan and uniqueScheduledUnits
    setAllStudentPlansMap(prev => {
      const nextMap = {
        ...prev,
        [targetStudent.student_id]: {
          plan: updatedPlan,
          units: uniqueScheduledUnits
        },
        [String(targetStudent.student_id)]: {
          plan: updatedPlan,
          units: uniqueScheduledUnits
        }
      };
      return nextMap;
    });

    // In-memory mock cache synchronization
    if (mockClientStudentPlans[Number(targetStudent.student_id)]) {
      mockClientStudentPlans[Number(targetStudent.student_id)].plan = updatedPlan;
      mockClientStudentPlans[Number(targetStudent.student_id)].units = uniqueScheduledUnits;
    }

    // Persist to backend DB in background
    saveStudyPlan({
      student_id: targetStudent.student_id,
      title: `${targetStudent.course_code || 'PT3-BSIT'} Study Plan`,
      status: newStatus,
      units: scheduledUnits,
      created_by: 'Academic Chair'
    }).catch(err => console.warn('Background savePlan error:', err));

    const yearScopeLabel = targetLvlNum ? `Year ${targetLvlNum} (${targetLvlNum === 1 ? 2026 : targetLvlNum === 2 ? 2027 : 2028})` : 'All 3 Years';
    const periodScopeLabel = (requestedPeriods.length === 3 && layoutType === 'trimester')
      ? 'All Trimesters'
      : (requestedPeriods.length === 2 && layoutType === 'semester')
      ? 'All Semesters'
      : requestedPeriods.map(p => p === 1 ? 'S1' : p === 2 ? 'S2' : p === 3 ? 'T1' : p === 4 ? 'T2' : 'T3').join(', ');

    updatePlanRecordAndLogAudit(
      newStatus,
      wasApproved
        ? `Approved plan re-opened and reset to DRAFT via Auto System Generation for ${yearScopeLabel} [${periodScopeLabel}] (${totalGeneratedCP} CP)`
        : `Auto System Generation applied for ${yearScopeLabel} [${periodScopeLabel}] (${totalGeneratedCP} CP)`,
      'Academic Chair',
      targetStudent,
      scheduledUnits
    );

    const notif = {
      id: `n-${Date.now()}`,
      role: 'student',
      studentId: targetStudent.student_id,
      targetYear: targetFocusYear,
      title: wasApproved ? 'Approved Plan Re-opened for Replan' : 'Study Plan Auto-Generated',
      message: wasApproved
        ? `Academic Chair generated a new study plan structure for ${yearScopeLabel} [${periodScopeLabel}]. Status reset to Draft (${totalGeneratedCP} CP).`
        : `Academic Chair generated a prescribed study plan for ${yearScopeLabel} [${periodScopeLabel}] (${totalGeneratedCP} CP total).`,
      timestamp: formatNotificationTimestamp(),
      createdTimeMs: Date.now(),
      read: false,
      actionType: 'REVIEW',
      actionLabel: 'Review Recommended Plan'
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(
      wasApproved
        ? `Approved plan re-opened! Auto-filled ${totalGeneratedCP} CP for ${targetStudent.first_name} [${yearScopeLabel} • ${periodScopeLabel}].`
        : `Auto-filled preset units for ${targetStudent.first_name} [${yearScopeLabel} • ${periodScopeLabel}] (${totalGeneratedCP} CP total)!`
    );
  };

  // Per-student, per-semester change requests state: { [studentId]: { [key]: comment } }
  const [semesterRequests, setSemesterRequests] = useState({});

  const handleSaveSemesterRequest = (key, comment) => {
    const sId = selectedStudent?.student_id;
    if (!sId) return;

    setSemesterRequests(prev => ({
      ...prev,
      [sId]: {
        ...(prev[sId] || {}),
        [key]: comment
      }
    }));

    const stName = selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Student';
    const author = `Student: ${stName}`;

    if (currentPlan) {
      const updatedPlan = {
        ...currentPlan,
        status: 'request_submitted',
        updated_at: formatCurrentDateTime(),
        version_number: (currentPlan?.version_number || 1) + 1
      };
      setCurrentPlan(updatedPlan);
      setStoredPlansList(prevList =>
        prevList.map(p => p.plan_id === updatedPlan.plan_id ? { ...p, status: 'request_submitted', updated_at: updatedPlan.updated_at, version_number: updatedPlan.version_number } : p)
      );
    }

    updatePlanRecordAndLogAudit(
      'request_submitted',
      `Student requested unit period amendment for ${key}${comment ? `: "${comment}"` : ''}`,
      author
    );

    showToast(`Semester change request submitted to Academic Chair!`);
  };

  const handleRemoveSemesterRequest = (key) => {
    const sId = selectedStudent?.student_id;
    if (!sId) return;

    setSemesterRequests(prev => {
      const studentMap = { ...(prev[sId] || {}) };
      delete studentMap[key];
      return {
        ...prev,
        [sId]: studentMap
      };
    });

    const stName = selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Student';
    const author = activeRole === 'student' ? `Student: ${stName}` : 'Academic Chair';

    updatePlanRecordAndLogAudit(
      currentPlan?.status || 'draft',
      `Period amendment request resolved/cleared for ${key}`,
      author
    );

    showToast(`Semester change request resolved and cleared.`);
  };

  const handleAddUnit = (newUnit) => {
    setCatalogUnits(prev => [newUnit, ...prev]);
    showToast(`Successfully created new course unit ${newUnit.code}: ${newUnit.title}`);
  };

  const handleSaveStudent = (studentData) => {
    if (editingStudent) {
      setStudentsList(prev => prev.map(s => s.student_id === studentData.student_id ? studentData : s));
      if (selectedStudent && selectedStudent.student_id === studentData.student_id) {
        setSelectedStudent(studentData);
      }
      showToast(`Updated student profile for ${studentData.first_name} ${studentData.last_name}`);
    } else {
      setStudentsList(prev => [studentData, ...prev]);
      setSelectedStudent(studentData);
      showToast(`Registered new student ${studentData.first_name} ${studentData.last_name}`);
    }
    setEditingStudent(null);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (showAuditModal) {
      setAuditSelectedDate(getTodayKey());
      setAuditCalendarMonth(new Date());
      fetchAuditLog().then(res => {
        if (res && res.length > 0) {
          setAuditLogsList(prev => {
            const existingIds = new Set(prev.map(l => l.version_id));
            const newFetched = res.filter(l => !existingIds.has(l.version_id));
            return [...prev, ...newFetched];
          });
        }
      }).catch(console.error);
    }
  }, [showAuditModal, getTodayKey]);

  const loadInitialData = async () => {
    try {
      const [unitsData, periodsData, studentsData] = await Promise.all([
        fetchCatalogUnits(),
        fetchTeachingPeriods(),
        fetchStudents('')
      ]);
      setCatalogUnits(unitsData || []);
      setPeriods(periodsData || []);
      
      const loadedStudents = (studentsData && studentsData.length > 0) ? studentsData : initialSampleStudents;
      setStudentsList(loadedStudents);

      // Select appropriate student based on current logged in user
      if (loadedStudents && loadedStudents.length > 0) {
        const savedUser = currentUser;
        if (savedUser && savedUser.role === 'student') {
          const target = loadedStudents.find(s => s.student_id === savedUser.student_id || s.student_number === savedUser.student_number) || loadedStudents[1] || loadedStudents[0];
          handleSelectStudent(target, 'student');
        } else {
          const target = loadedStudents.find(s => s.student_id === 1) || loadedStudents[1] || loadedStudents[0];
          handleSelectStudent(target, 'chair');
        }
      }
    } catch (err) {
      console.error('Failed to load initial catalog/students data:', err);
    }
  };

  const handleRefreshCatalog = async (entityType, recordCount) => {
    try {
      const [unitsData, periodsData, studentsData] = await Promise.all([
        fetchCatalogUnits(),
        fetchTeachingPeriods(),
        fetchStudents('')
      ]);
      if (unitsData && unitsData.length > 0) setCatalogUnits(unitsData);
      if (periodsData && periodsData.length > 0) setPeriods(periodsData);
      if (studentsData && studentsData.length > 0) setStudentsList(studentsData);
      showToast(`Realtime sync complete! Processed ${recordCount || ''} ${entityType || 'database'} records.`);
    } catch (err) {
      console.warn('Realtime refresh error:', err);
    }
  };

  // Wrapper to set planUnits AND update per-student cache map
  const handleSetPlanUnits = (newUnitsOrUpdater) => {
    setPlanUnits(prevUnits => {
      const updatedUnits = typeof newUnitsOrUpdater === 'function' ? newUnitsOrUpdater(prevUnits) : newUnitsOrUpdater;
      if (selectedStudent) {
        setAllStudentPlansMap(prevMap => {
          const currentEntry = prevMap[selectedStudent.student_id] || {};
          const nextMap = {
            ...prevMap,
            [selectedStudent.student_id]: {
              plan: currentPlan || currentEntry.plan,
              units: updatedUnits
            }
          };
          return nextMap;
        });
      }
      return updatedUnits;
    });
  };

  // Dedicated Study Plan Reset Handler (Clears canvas units, restores baseline academic history, sets status to draft)
  const handleResetPlan = () => {
    if (!selectedStudent) return;
    const sId = selectedStudent.student_id;

    const completedHistory = (history || []).filter(h => h.status === 'completed');
    const histCP = completedHistory.reduce((sum, h) => sum + Number(h.credit_points || 3), 0);

    const updatedPlan = {
      ...(currentPlan || {}),
      status: 'draft',
      total_credit_points: histCP,
      studentSignature: null,
      signature: null,
      isAmending: true,
      manuallyReset: true,
      updated_at: formatCurrentDateTime()
    };

    setCurrentPlan(updatedPlan);
    handleSetPlanUnits([]);
    runValidation(sId, selectedStudent.location_id, []);

    setAllStudentPlansMap(prev => ({
      ...prev,
      [sId]: { plan: updatedPlan, units: [] },
      [String(sId)]: { plan: updatedPlan, units: [] }
    }));

    if (mockClientStudentPlans[Number(sId)]) {
      mockClientStudentPlans[Number(sId)].plan = updatedPlan;
      mockClientStudentPlans[Number(sId)].units = [];
    }

    showToast(`Study plan reset to Draft. Canvas cleared (${histCP} CP academic history preserved).`);
  };

  const handleSelectStudent = async (student, roleOverride = null, planOptions = null) => {
    // 1. Preserve previous student's working draft in cache map before switching
    if (selectedStudent && currentPlan && Number(selectedStudent.student_id) !== Number(student.student_id)) {
      setAllStudentPlansMap(prev => ({
        ...prev,
        [selectedStudent.student_id]: {
          plan: currentPlan,
          units: planUnits
        }
      }));
    }

    setSelectedStudent(student);
    setShowStudentSelectModal(false);

    const effectiveRole = roleOverride || activeRole;
    const authorName = effectiveRole === 'student' || (student && student.account_category !== 'admin' && student.student_id !== 0)
      ? `Student: ${student.first_name} ${student.last_name}`
      : 'Academic Chair';

    
    // Do NOT auto-switch activeRole when a student profile is selected.
    // If the Academic Chair selects a student, they stay in Academic Chair view to manage that student's plan.
    if (activeTab === 'STORED' || activeTab === 'CATALOG') {
      setActiveTab('STUDY_PLAN');
    }

    const categoryTag = student.account_category === 'admin' || student.student_id === 0 ? '' : ` (${student.account_category === 'new_student' ? 'New Student' : 'Existing Student'})`;
    showToast(`Loaded profile for ${student.first_name} ${student.last_name}${categoryTag}`);

    // 2. If student ALREADY has a working draft in memory, load it directly to prevent wiping data!
    let cached = allStudentPlansMap[student.student_id] || allStudentPlansMap[Number(student.student_id)] || allStudentPlansMap[String(student.student_id)];

    // Check if there is an active disagreement / revision request from notifications
    const disagreementNotif = (notifications || []).find(n => 
      (Number(n.studentId) === Number(student.student_id) || String(n.studentId) === String(student.student_id)) &&
      (n.title?.includes('Disagreed') || n.title?.includes('Change Requested') || n.title?.includes('Rejected'))
    );
    const notifComment = disagreementNotif?.rejectionComment || 
                         disagreementNotif?.comment || 
                         (disagreementNotif?.message?.match(/"([^"]+)"/)?.[1]) || 
                         null;

    const effectiveRejectionComment = planOptions?.rejectionComment || 
                                      notifComment || 
                                      cached?.plan?.rejectionComment || 
                                      cached?.plan?.rejection_comment || 
                                      null;

    const isStudentDisagreed = Boolean(effectiveRejectionComment) || 
                               Boolean(disagreementNotif) || 
                               planOptions?.status === 'rejected' || 
                               cached?.plan?.status === 'rejected';

    // Special rule for New Students (Michael Chang: 3, Emily Watson: 4)
    const isNewStudent = Number(student.student_id) === 3 || student.student_number === '31234563' ||
                         Number(student.student_id) === 4 || student.student_number === '31234564';

    const isNewStudentPlanActive = isStudentDisagreed ||
                                  cached?.plan?.manuallySubmittedInSession || 
                                  cached?.plan?.status === 'recommended' || 
                                  cached?.plan?.status === 'agreed' || 
                                  cached?.plan?.status === 'approved' || 
                                  cached?.plan?.status === 'rejected' ||
                                  cached?.plan?.status === 'request_submitted' ||
                                  (cached?.units && cached.units.length > 0);
    if (isNewStudent && !isNewStudentPlanActive) {
      cached = {
        plan: {
          plan_id: Number(student.student_id),
          student_id: Number(student.student_id),
          title: Number(student.student_id) === 3 ? 'PT3-BSIT Business Info Systems Plan 2026' : 'PT3-BSIT Artificial Intelligence Plan 2026',
          status: 'draft',
          total_credit_points: 0,
          updated_at: '2026-10-24 11:02',
          version_number: 1
        },
        units: []
      };
    }

    // For existing students (Alex: 1, Sarah: 2), if cached has empty units or missing plan, fall back to mockClientStudentPlans unless manually reset
    const isExistingStudent = [1, 2].includes(Number(student.student_id)) || ['31234561', '31234562'].includes(student.student_number);
    if (isExistingStudent && (!cached || !cached.units || (cached.units.length === 0 && !cached.plan?.manuallyReset))) {
      const fallback = mockClientStudentPlans[Number(student.student_id)];
      if (fallback && fallback.units && fallback.units.length > 0) {
        cached = {
          plan: fallback.plan,
          units: fallback.units
        };
      }
    }

    // If student has a disagreement on recommended plan but units were empty in cache, restore recommended units from mockClientStudentPlans
    if (isStudentDisagreed && (!cached || !cached.units || cached.units.length === 0)) {
      const fallback = mockClientStudentPlans[Number(student.student_id)];
      if (fallback && fallback.units && fallback.units.length > 0) {
        cached = {
          plan: { ...(cached?.plan || fallback.plan), status: 'rejected', rejectionComment: effectiveRejectionComment },
          units: fallback.units
        };
      }
    }

    if (cached && (cached.units?.length > 0 || isNewStudent)) {
      const planToSet = {
        ...cached.plan,
        targetYearLevel: planOptions?.targetYearLevel || cached.plan?.targetYearLevel || 1,
        requestYear: planOptions?.requestYear || cached.plan?.requestYear,
        requestPeriods: planOptions?.requestPeriods || cached.plan?.requestPeriods,
        layoutType: planOptions?.layoutType || cached.plan?.layoutType || 'trimester',
        forceScrollTrigger: planOptions?.forceScrollTrigger || Date.now(),
        status: planOptions?.status || (isStudentDisagreed ? 'rejected' : (cached.plan?.status || 'draft')),
        rejectionComment: effectiveRejectionComment,
        rejection_comment: effectiveRejectionComment
      };
      setCurrentPlan(planToSet);
      setPlanUnits(cached.units || []);
      runValidation(student.student_id, student.location_id, cached.units || []);
      fetchStudentHistory(student.student_id).then(h => setHistory(h || [])).catch(console.error);
      return;
    }

    // 3. Otherwise fetch from API / fallback
    try {
      const [historyData, planData] = await Promise.all([
        fetchStudentHistory(student.student_id),
        fetchPlanByStudent(student.student_id)
      ]);

      setHistory(historyData || []);
      
      const fallbackPlanObj = mockClientStudentPlans[Number(student.student_id)];
      const initialUnits = (planData && planData.units && planData.units.length > 0)
        ? planData.units
        : (fallbackPlanObj?.units && fallbackPlanObj.units.length > 0 ? fallbackPlanObj.units : []);

      const initialPlan = (planData && planData.plan) ? {
        ...planData.plan,
        status: planOptions?.status || (isStudentDisagreed ? 'rejected' : (planData.plan?.status && planData.plan.status !== 'draft' ? planData.plan.status : (fallbackPlanObj?.plan?.status || 'draft'))),
        total_credit_points: (planData.plan?.total_credit_points > 0 ? planData.plan.total_credit_points : (fallbackPlanObj?.plan?.total_credit_points || (initialUnits.length * 3))),
        targetYearLevel: planOptions?.targetYearLevel || planData.plan?.targetYearLevel || 1,
        requestYear: planOptions?.requestYear || planData.plan?.requestYear,
        requestPeriods: planOptions?.requestPeriods || planData.plan?.requestPeriods,
        layoutType: planOptions?.layoutType || planData.plan?.layoutType || fallbackPlanObj?.plan?.layoutType || 'trimester',
        forceScrollTrigger: planOptions?.forceScrollTrigger || Date.now(),
        rejectionComment: effectiveRejectionComment || planData.plan?.rejectionComment,
        rejection_comment: effectiveRejectionComment || planData.plan?.rejection_comment
      } : {
        plan_id: student.student_id,
        student_id: student.student_id,
        title: fallbackPlanObj?.plan?.title || `${student.course_code || 'PT3-BSIT'} Study Plan`,
        status: planOptions?.status || (isStudentDisagreed ? 'rejected' : (fallbackPlanObj?.plan?.status || 'draft')),
        rejectionComment: effectiveRejectionComment,
        rejection_comment: effectiveRejectionComment,
        total_credit_points: fallbackPlanObj?.plan?.total_credit_points || (initialUnits.length * 3),
        targetYearLevel: planOptions?.targetYearLevel || 1,
        requestYear: planOptions?.requestYear,
        requestPeriods: planOptions?.requestPeriods,
        layoutType: planOptions?.layoutType || fallbackPlanObj?.plan?.layoutType || 'trimester',
        forceScrollTrigger: planOptions?.forceScrollTrigger || Date.now()
      };

      setCurrentPlan(initialPlan);
      setPlanUnits(initialUnits);
      runValidation(student.student_id, student.location_id, initialUnits);

      setAllStudentPlansMap(prev => ({
        ...prev,
        [student.student_id]: {
          plan: initialPlan,
          units: initialUnits
        }
      }));
    } catch (err) {
      console.error('Failed to load student plan/history:', err);
    }
  };

  const runValidation = async (studentId, locationId, units) => {
    try {
      const res = await validatePlan({
        studentId: studentId || (selectedStudent ? selectedStudent.student_id : null),
        locationId: locationId || (selectedStudent ? selectedStudent.location_id : null),
        planUnits: units,
        waivedUnits: Array.from(currentPlan?.waivedUnits || [])
      });
      setValidationResult(res);
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  const handleValidateCurrentPlan = (updatedUnits) => {
    if (!selectedStudent) return;
    runValidation(selectedStudent.student_id, selectedStudent.location_id, updatedUnits);
  };

  const formatCurrentDateTime = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${mins}`;
  };

  const updatePlanRecordAndLogAudit = (newStatus, reason, authorName, overrideStudent = null, overrideUnits = null) => {
    const targetStudent = overrideStudent || selectedStudent;
    if (!targetStudent) return;
    const nowFormatted = formatCurrentDateTime();
    const nowIso = new Date().toISOString();
    const effectiveUnits = overrideUnits || planUnits || [];
    const calculatedCP = effectiveUnits.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);

    let assignedVersion = 1;
    setStoredPlansList(prev => {
      const existingIdx = prev.findIndex(p => String(p.student_id) === String(targetStudent.student_id));
      if (existingIdx !== -1) {
        const existing = prev[existingIdx];
        const nextVer = (existing.version_number || 1) + 1;
        assignedVersion = nextVer;
        const updatedItem = {
          ...existing,
          status: newStatus,
          version_number: nextVer,
          updated_at: nowFormatted,
          total_cp: calculatedCP
        };
        const newList = [...prev];
        newList[existingIdx] = updatedItem;
        return newList;
      } else {
        assignedVersion = currentPlan?.version_number ? currentPlan.version_number + 1 : 1;
        const newItem = {
          plan_id: Math.floor(Math.random() * 900) + 100,
          student_id: targetStudent.student_id,
          student_name: `${targetStudent.first_name} ${targetStudent.last_name}`,
          student_number: targetStudent.student_number,
          course_code: targetStudent.course_code || 'PT3-BSIT',
          title: `${targetStudent.course_code || 'PT3-BSIT'} Study Plan`,
          status: newStatus,
          version_number: assignedVersion,
          total_cp: calculatedCP,
          created_by: authorName,
          updated_at: nowFormatted,
          location: targetStudent.location_name || 'Singapore Campus'
        };
        return [newItem, ...prev];
      }
    });

    const newAuditLog = {
      version_id: `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      plan_id: currentPlan?.plan_id || targetStudent.student_id,
      version_number: assignedVersion,
      student_number: targetStudent.student_number,
      first_name: targetStudent.first_name,
      last_name: targetStudent.last_name,
      student_name: `${targetStudent.first_name} ${targetStudent.last_name}`,
      plan_title: `${targetStudent.course_code || 'PT3-BSIT'} Study Plan`,
      amendment_reason: reason,
      created_by: authorName,
      created_at: nowIso,
      plan_status: newStatus
    };
    setAuditLogsList(prev => [newAuditLog, ...prev]);
  };

  // Recommend Plan
  const handleRecommendPlan = async (waivedList = []) => {
    if (!selectedStudent || selectedStudent.account_category === 'admin' || selectedStudent.student_id === 0) {
      showToast('⚠️ Target Student Not Selected: Please select a target student profile from the directory before sending a study plan recommendation.');
      setShowStudentSelectModal(true);
      return;
    }
    if (!planUnits || planUnits.length === 0) {
      showToast('⚠️ Cannot Recommend Empty Plan: You must add at least one course unit (minimum 3 CP) to the study plan before recommending to student.');
      return;
    }

    const effectiveWaivers = Array.isArray(waivedList) ? waivedList : (currentPlan?.waivedUnits || []);
    const updatedPlan = { 
      ...currentPlan, 
      status: 'recommended', 
      isAmending: false,
      rejectionComment: null,
      rejection_comment: null,
      waivedUnits: effectiveWaivers,
      manuallySubmittedInSession: true,
      updated_at: formatCurrentDateTime(), 
      version_number: (currentPlan?.version_number || 1) + 1 
    };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => {
      const sIdNum = Number(selectedStudent.student_id);
      const sIdStr = String(selectedStudent.student_id);
      const nextMap = {
        ...prev,
        [sIdNum]: {
          plan: updatedPlan,
          units: planUnits
        },
        [sIdStr]: {
          plan: updatedPlan,
          units: planUnits
        }
      };
      return nextMap;
    });

    if (!mockClientStudentPlans[Number(selectedStudent.student_id)]) {
      mockClientStudentPlans[Number(selectedStudent.student_id)] = {
        student: selectedStudent,
        plan: updatedPlan,
        units: planUnits
      };
    } else {
      mockClientStudentPlans[Number(selectedStudent.student_id)].plan = updatedPlan;
      mockClientStudentPlans[Number(selectedStudent.student_id)].units = planUnits;
    }

    setStoredPlansList(prev => prev.map(p =>
      String(p.student_id) === String(selectedStudent.student_id)
        ? { ...p, status: 'recommended', isAmending: false, rejectionComment: null, rejection_comment: null, updated_at: updatedPlan.updated_at, version_number: updatedPlan.version_number }
        : p
    ));

    const totalCP = (planUnits || []).reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
    const waiverTag = (effectiveWaivers && effectiveWaivers.length > 0) ? ` [Chair Waiver Granted: ${effectiveWaivers.join(', ')}]` : '';
    updatePlanRecordAndLogAudit(
      'recommended',
      `Academic Chair reviewed & RECOMMENDED proposed ${totalCP} CP Study Plan to student ${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.student_number}) for student review & sign-off${waiverTag}`,
      'Academic Chair'
    );

    // Notify student about the recommended plan and resolve old disagreement notification
    const notif = {
      id: `n-${Date.now()}`,
      role: 'student',
      studentId: selectedStudent.student_id,
      title: 'Study Plan Recommended',
      message: `Academic Chair Dr. Aris Thorne recommended your ${totalCP} CP Study Plan for review and sign-off.`,
      timestamp: formatNotificationTimestamp(),
      createdTimeMs: Date.now(),
      read: false,
      actionType: 'REVIEW',
      actionLabel: 'Review Recommended Plan'
    };
    setNotifications(prev => [
      notif,
      ...prev.filter(n => !(Number(n.studentId) === Number(selectedStudent.student_id) && (n.title?.includes('Disagreed') || n.title?.includes('Change Requested') || n.title?.includes('Rejected'))))
    ]);

    showToast(`Plan successfully recommended to ${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.student_number})!`);

    // Persist recommended plan & units to backend database
    saveStudyPlan({
      student_id: selectedStudent.student_id,
      title: `${selectedStudent.course_code || 'PT3-BSIT'} Study Plan`,
      status: 'recommended',
      units: planUnits,
      created_by: 'Academic Chair'
    }).catch(err => console.warn('Save on recommend error:', err));
    try {
      const planId = currentPlan ? currentPlan.plan_id : selectedStudent.student_id;
      await recommendPlan(planId, 'Academic Chair');
    } catch (err) {
      console.error('Recommend failed:', err);
    }
  };

  // Student Agree Plan
  const handleAgreePlan = async (signatureObj) => {
    if (!selectedStudent) return;
    const effectiveSig = signatureObj || currentPlan?.studentSignature || currentPlan?.signature || {
      yearLevel: 'ALL',
      type: 'type',
      name: `${selectedStudent.first_name || 'Student'} ${selectedStudent.last_name || ''}`.trim(),
      timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' SGT',
      verificationHash: `SIG-${selectedStudent.student_number || 'ST'}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    };

    const updatedPlan = {
      ...currentPlan,
      status: 'agreed',
      studentSignature: effectiveSig,
      signature: effectiveSig,
      updated_at: formatCurrentDateTime(),
      version_number: (currentPlan?.version_number || 1) + 1
    };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => {
      const nextMap = {
        ...prev,
        [selectedStudent.student_id]: {
          plan: updatedPlan,
          units: planUnits
        }
      };
      return nextMap;
    });

    if (!mockClientStudentPlans[Number(selectedStudent.student_id)]) {
      mockClientStudentPlans[Number(selectedStudent.student_id)] = {
        student: selectedStudent,
        plan: updatedPlan,
        units: planUnits
      };
    } else {
      mockClientStudentPlans[Number(selectedStudent.student_id)].plan = updatedPlan;
      mockClientStudentPlans[Number(selectedStudent.student_id)].units = planUnits;
    }

    setStoredPlansList(prev => prev.map(p =>
      String(p.student_id) === String(selectedStudent.student_id)
        ? { ...p, status: 'agreed', isAmending: false, rejectionComment: null, rejection_comment: null, updated_at: updatedPlan.updated_at, version_number: updatedPlan.version_number }
        : p
    ));
    const hashTag = signatureObj?.verificationHash ? ` (${signatureObj.verificationHash})` : '';
    updatePlanRecordAndLogAudit('agreed', `Student agreed and digitally signed proposed study plan${hashTag}`, `Student: ${selectedStudent.first_name} ${selectedStudent.last_name}`);
    
    // Notify Academic Chair about student agreement and clear past rejection notifications
    const agreeNotif = {
      id: `n-${Date.now()}`,
      role: 'chair',
      studentId: selectedStudent.student_id,
      title: 'Study Plan Agreed & Signed',
      message: `${selectedStudent.first_name} ${selectedStudent.last_name} has agreed and digitally signed their study plan! Ready for final approval.`,
      timestamp: formatNotificationTimestamp(),
      createdTimeMs: Date.now(),
      read: false,
      actionType: 'REVIEW',
      actionLabel: 'Review & Final Approve'
    };
    setNotifications(prev => [
      agreeNotif,
      ...prev.filter(n => !(Number(n.studentId) === Number(selectedStudent.student_id) && (n.title?.includes('Disagreed') || n.title?.includes('Change Requested') || n.title?.includes('Rejected'))))
    ]);

    showToast('Study plan agreed and digitally signed by student!');
    try {
      const planId = currentPlan ? currentPlan.plan_id : selectedStudent.student_id;
      await agreePlan(planId, `${selectedStudent.first_name} ${selectedStudent.last_name}`);
    } catch (err) {
      console.error('Agree failed:', err);
    }
  };

  // Student Reject Plan / Request Changes
  const handleRejectPlan = async (rejectionComment) => {
    if (!selectedStudent) return;
    const cleanComment = typeof rejectionComment === 'string' ? rejectionComment.trim() : 'Changes requested by student';
    const updatedPlan = {
      ...currentPlan,
      status: 'rejected',
      rejectionComment: cleanComment,
      rejection_comment: cleanComment,
      manuallySubmittedInSession: true,
      updated_at: formatCurrentDateTime(),
      version_number: (currentPlan?.version_number || 1) + 1
    };
    setCurrentPlan(updatedPlan);
    const nextMap = {
      ...allStudentPlansMap,
      [selectedStudent.student_id]: {
        plan: updatedPlan,
        units: planUnits
      },
      [String(selectedStudent.student_id)]: {
        plan: updatedPlan,
        units: planUnits
      },
      [Number(selectedStudent.student_id)]: {
        plan: updatedPlan,
        units: planUnits
      }
    };
    setAllStudentPlansMap(nextMap);

    if (mockClientStudentPlans[Number(selectedStudent.student_id)]) {
      mockClientStudentPlans[Number(selectedStudent.student_id)].plan = updatedPlan;
      mockClientStudentPlans[Number(selectedStudent.student_id)].units = planUnits;
    }

    // Update storedPlansList so repository table has rejected status & feedback comment
    setStoredPlansList(prev => prev.map(p =>
      String(p.student_id) === String(selectedStudent.student_id)
        ? {
            ...p,
            status: 'rejected',
            rejectionComment: cleanComment,
            rejection_comment: cleanComment,
            updated_at: updatedPlan.updated_at,
            version_number: updatedPlan.version_number
          }
        : p
    ));

    updatePlanRecordAndLogAudit(
      'rejected',
      `Student requested changes / rejected study plan with comment: "${cleanComment}"`,
      `Student: ${selectedStudent.first_name} ${selectedStudent.last_name}`
    );

    // Notify Academic Chair about student change request / disagreement
    const rejectNotif = {
      id: `n-${Date.now()}`,
      role: 'chair',
      studentId: selectedStudent.student_id,
      rejectionComment: cleanComment,
      comment: cleanComment,
      title: 'Study Plan Disagreed / Change Requested',
      message: `${selectedStudent.first_name} ${selectedStudent.last_name} requested amendments on their recommended plan: "${cleanComment}"`,
      timestamp: formatNotificationTimestamp(),
      createdTimeMs: Date.now(),
      read: false,
      actionType: 'REVIEW',
      actionLabel: 'Review Student Feedback'
    };
    setNotifications(prev => [rejectNotif, ...prev]);

    showToast(`Study plan change request submitted to Academic Chair!`);

    try {
      const planId = currentPlan ? currentPlan.plan_id : selectedStudent.student_id;
      await rejectPlan(planId, cleanComment);
      saveStudyPlan({
        student_id: selectedStudent.student_id,
        title: `${selectedStudent.course_code || 'PT3-BSIT'} Study Plan`,
        status: 'rejected',
        units: planUnits,
        created_by: `Student: ${selectedStudent.first_name} ${selectedStudent.last_name}`
      }).catch(err => console.warn('Background save on reject error:', err));
    } catch (err) {
      console.warn('Backend rejectPlan error:', err);
    }
  };

  // Chair Unlock Plan for Amendment
  const handleUnlockForAmendment = () => {
    if (!currentPlan) return;
    const nextVersion = Number(((currentPlan?.version_number || 1) + 0.1).toFixed(1));
    const updatedTime = formatCurrentDateTime();
    const updatedPlan = {
      ...currentPlan,
      status: 'draft',
      isAmending: true,
      amendedFromStatus: currentPlan.status,
      version_number: nextVersion,
      updated_at: updatedTime
    };
    setCurrentPlan(updatedPlan);
    setStoredPlansList(prev => prev.map(p =>
      String(p.student_id) === String(selectedStudent?.student_id)
        ? { ...p, status: 'draft', isAmending: true, version_number: nextVersion, updated_at: updatedTime }
        : p
    ));
    showToast(`Study plan unlocked for amendment (v${nextVersion} Draft)! Canvas is now editable.`);
  };

  // Chair Approve & Finalise Plan
  const handleApprovePlan = async () => {
    if (!selectedStudent) return;
    if (currentPlan?.status !== 'agreed') {
      showToast(`⚠️ Final Approval Blocked: Plan cannot be approved prior to student digital agreement. Current status is ${currentPlan?.status ? currentPlan.status.toUpperCase() : 'DRAFT'}.`);
      return;
    }
    const updatedPlan = { 
      ...currentPlan, 
      status: 'approved', 
      isAmending: false,
      rejectionComment: null,
      rejection_comment: null,
      updated_at: formatCurrentDateTime(), 
      version_number: (currentPlan?.version_number || 1) + 1 
    };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => ({
      ...prev,
      [selectedStudent.student_id]: {
        plan: updatedPlan,
        units: planUnits
      }
    }));
    setStoredPlansList(prev => prev.map(p =>
      String(p.student_id) === String(selectedStudent.student_id)
        ? { ...p, status: 'approved', isAmending: false, rejectionComment: null, rejection_comment: null, updated_at: updatedPlan.updated_at, version_number: updatedPlan.version_number }
        : p
    ));
    setNotifications(prev => prev.filter(n => !(Number(n.studentId) === Number(selectedStudent.student_id) && (n.title?.includes('Disagreed') || n.title?.includes('Change Requested') || n.title?.includes('Rejected')))));
    updatePlanRecordAndLogAudit('approved', 'Study Plan officially APPROVED & finalized by Academic Chair', 'Academic Chair');
    showToast('Study Plan officially approved and finalized by Academic Chair!');
    try {
      const planId = currentPlan ? currentPlan.plan_id : selectedStudent.student_id;
      await approvePlan(planId, 'Academic Chair');
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  // Save & Store Plan in Repository
  const handleSavePlan = async () => {
    if (!selectedStudent) return;
    const currentStatus = currentPlan?.status || 'draft';
    const updatedPlan = {
      ...currentPlan,
      status: currentStatus,
      updated_at: formatCurrentDateTime()
    };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => ({
      ...prev,
      [selectedStudent.student_id]: {
        plan: updatedPlan,
        units: planUnits
      }
    }));
    updatePlanRecordAndLogAudit(currentStatus, `Study Plan draft saved for ${selectedStudent.first_name} ${selectedStudent.last_name}`, 'Academic Chair');
    showToast(`Draft saved for ${selectedStudent.first_name} ${selectedStudent.last_name}! All changes preserved.`);
    try {
      await saveStudyPlan({
        student_id: selectedStudent.student_id,
        title: `${selectedStudent.course_code || 'PT3-BSIT'} Study Plan`,
        status: currentStatus,
        units: planUnits,
        created_by: 'Academic Chair'
      });
    } catch (err) {
      console.error('Failed to save study plan:', err);
    }
  };

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col justify-between transition-colors duration-200">
      <div>
        {/* Toast Notification Banner - Centered Below Navbar */}
        {notificationMsg && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 dark:bg-emerald-800 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all border border-emerald-600 dark:border-emerald-700 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 font-sans max-w-md text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Header Bar */}
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          activeRole={activeRole}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedStudent={selectedStudent}
          onOpenStudentSelectModal={() => setShowStudentSelectModal(true)}
          storedPlansCount={storedPlansCount}
          onOpenImport={() => setShowImportModal(true)}
          onOpenAudit={() => setShowAuditModal(true)}
          onOpenGuide={() => setShowGuideModal(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          notifications={notifications}
          onSelectNotification={handleSelectNotification}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        />

        {/* Main Content Area */}
        <main className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 space-y-5">
          
          {/* Student Selection Modal (Academic Chair only) */}
          {showStudentSelectModal && activeRole === 'chair' && (
            <StudentSelectModal
              students={studentsList}
              onSelectStudent={handleSelectStudent}
              onAddStudentClick={() => {
                setEditingStudent(null);
                setShowAddStudentModal(true);
              }}
              onEditStudentClick={(st) => {
                setEditingStudent(st);
                setShowAddStudentModal(true);
              }}
              onClose={() => setShowStudentSelectModal(false)}
              isModal={selectedStudent !== null}
            />
          )}

          {/* Executive Student Course Info Header (Shown for Chair on STUDY_PLAN & for all students on ACADEMIC_HISTORY) */}
          {((activeTab === 'STUDY_PLAN' && activeRole === 'chair') || activeTab === 'ACADEMIC_HISTORY') &&
            selectedStudent && selectedStudent.account_category !== 'admin' && selectedStudent.student_id !== 0 && (
            <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl font-sans text-slate-900 dark:text-white transition-all relative overflow-hidden backdrop-blur-md">
              {/* Subtle executive background accents */}
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-4 sm:gap-6">
                {/* Left Side: Soft Red Icon Box & Degree Title */}
                <div className="flex items-center gap-3.5 max-w-full overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 flex items-center justify-center shadow-2xs shrink-0 border border-red-200/60 dark:border-red-900/60">
                    <GraduationCap className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
                      Bachelor of Information Technology
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Degree Enrolment & Study Sequence
                    </p>
                  </div>
                </div>

                {/* Right Side: Clean Student Metadata Strip */}
                <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2.5 sm:gap-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium shrink-0">
                  {activeRole === 'chair' && (
                    <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                      <User className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">
                        {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Alex Mercer'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono font-bold">
                        ({selectedStudent ? selectedStudent.student_number : '31234561'})
                      </span>
                    </div>
                  )}

                  {activeRole === 'chair' && <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>}

                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <GraduationCap className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span>Course: <strong className="text-slate-900 dark:text-white font-bold font-mono">{selectedStudent ? selectedStudent.course_code : 'PT3-BSIT-AI01'}</strong></span>
                  </div>

                  <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold">{selectedStudent?.location_name || 'Singapore Campus'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View Component: STUDY_PLAN (Main Builder / Review) */}
          {activeTab === 'STUDY_PLAN' && (
            <PlanBuilder
              student={selectedStudent}
              students={studentsList}
              onSelectStudent={handleSelectStudent}
              onAddStudentClick={() => setShowAddStudentModal(true)}
              onEditStudentClick={(st) => {
                setEditingStudent(st);
                setShowAddStudentModal(true);
              }}
              planUnits={planUnits}
              setPlanUnits={handleSetPlanUnits}
              catalogUnits={catalogUnits}
              periods={periods}
              validationResult={validationResult}
              history={history}
              onValidate={handleValidateCurrentPlan}
              activeRole={activeRole}
              currentPlan={currentPlan}
              onRecommendPlan={handleRecommendPlan}
              onAgreePlan={handleAgreePlan}
              onApprovePlan={handleApprovePlan}
              onSavePlan={handleSavePlan}
              onRejectPlan={handleRejectPlan}
              semesterRequests={selectedStudent ? (semesterRequests[selectedStudent.student_id] || {}) : {}}
              onSaveSemesterRequest={handleSaveSemesterRequest}
              onRemoveSemesterRequest={handleRemoveSemesterRequest}
              onOpenOfficialDocument={() => setShowDocumentModal(true)}
              onOpenStudentSelectModal={() => setShowStudentSelectModal(true)}
              onStudentSubmitPlanRequest={handleStudentSubmitPlanRequest}
              onAutoGeneratePlan={handleAutoGeneratePlan}
              onWaiverChange={handleWaiverChange}
              notifications={notifications}
              onUnlockForAmendment={handleUnlockForAmendment}
              onResetPlan={handleResetPlan}
            />
          )}

          {/* View Component: ACADEMIC_HISTORY (Academic History) */}
          {activeTab === 'ACADEMIC_HISTORY' && (
            <AcademicHistoryView history={history} />
          )}

          {/* View Component: STORED (Stored Plans Repository Table) */}
          {activeTab === 'STORED' && (
            <StoredPlansView
              students={studentsList}
              storedPlans={effectiveStoredPlansList}
              activeRole={activeRole}
              onSelectStudentAndRetrievePlan={(st, planRecord) => {
                handleSelectStudent(st);
                setActiveTab('STUDY_PLAN');

                // Retrieve & Amend: Unlocks the plan into an active amendment working draft
                const isAlreadyEditable = planRecord?.status === 'draft' || planRecord?.status === 'rejected' || planRecord?.status === 'request_submitted';
                const nextStatus = isAlreadyEditable ? (planRecord?.status || 'draft') : 'draft';
                const updatedTime = formatCurrentDateTime();
                const nextVersion = isAlreadyEditable
                  ? (planRecord?.version_number || 1)
                  : Number(((planRecord?.version_number || 1) + 0.1).toFixed(1));

                setCurrentPlan(prev => ({
                  ...prev,
                  status: nextStatus,
                  isAmending: true,
                  amendedFromStatus: planRecord?.status,
                  version_number: nextVersion,
                  updated_at: updatedTime,
                  total_credit_points: planRecord?.total_credit_points || prev?.total_credit_points || 0
                }));

                // Update storedPlansList so repository table reflects amendment draft
                setStoredPlansList(prev => prev.map(p =>
                  String(p.student_id) === String(st.student_id)
                    ? {
                        ...p,
                        status: nextStatus,
                        isAmending: true,
                        version_number: nextVersion,
                        updated_at: updatedTime
                      }
                    : p
                ));

                showToast(`Retrieved ${st.first_name || ''}'s plan for Amendment! Canvas unlocked for editing.`);
                setTimeout(() => {
                  const el = document.getElementById('year-block-1') || document.getElementById('study-plan-years-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
              }}
              onTabChange={setActiveTab}
            />
          )}

          {/* View Component: CATALOG (Course Catalog Preview) */}
          {activeTab === 'CATALOG' && (
            <CourseCatalogPreview
              catalogUnits={catalogUnits}
              onOpenImport={() => setShowImportModal(true)}
              onOpenAddUnit={() => setShowAddUnitModal(true)}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Audit Log / Change Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border-t-4 border-t-red-600 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
            
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between gap-3 p-4 sm:p-5 pb-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                      Study Plan Change Log
                    </h3>
                    <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                      activeRole === 'student'
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                    }`}>
                      {activeRole === 'student' ? 'Student View (My Actions Only)' : 'Academic Chair (Full Audit Log)'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Close Change Log"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5">
              {/* Calendar & Date Filter Bar */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {formatSelectedDateDisplay(auditSelectedDate)}
                    </span>
                    {auditSelectedDate !== 'all' && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        (auditDatesWithLogs.get(auditSelectedDate) || 0) > 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {auditDatesWithLogs.get(auditSelectedDate) || 0} logs
                      </span>
                    )}
                  </div>

                  {auditSelectedDate === getTodayKey() && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 hidden sm:inline-block">
                      Daily Fresh Log
                    </span>
                  )}
                </div>

                {/* Navigation Stepper & Calendar Toggle */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleStepAuditDay(-1)}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuditSelectedDate(getTodayKey());
                      setAuditCalendarMonth(new Date());
                    }}
                    className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                      auditSelectedDate === getTodayKey()
                        ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                    title="Reset to Today"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepAuditDay(1)}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

                  <button
                    type="button"
                    onClick={() => setShowAuditCalendar(prev => !prev)}
                    className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                      showAuditCalendar
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                    title="Toggle Calendar Grid"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{showAuditCalendar ? 'Hide Calendar' : 'Calendar View'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuditSelectedDate(prev => prev === 'all' ? getTodayKey() : 'all')}
                    className={`px-2 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                      auditSelectedDate === 'all'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                    title="Toggle between Daily View and All History"
                  >
                    {auditSelectedDate === 'all' ? 'Daily View' : 'All History'}
                  </button>
                </div>
              </div>

              {/* Expandable Visual Calendar Drawer */}
              {showAuditCalendar && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-red-600" />
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                        {auditCalendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setAuditCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Previous Month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          setAuditCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                          setAuditSelectedDate(getTodayKey());
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Current Month
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuditCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Next Month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-mono font-bold text-[10px] text-slate-400 mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="py-0.5">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {auditCalendarGridDays.map((cell, idx) => {
                      const count = auditDatesWithLogs.get(cell.dateKey) || 0;
                      const isSelected = auditSelectedDate === cell.dateKey;
                      const isToday = cell.dateKey === getTodayKey();

                      return (
                        <button
                          key={cell.dateKey + idx}
                          type="button"
                          onClick={() => {
                            setAuditSelectedDate(cell.dateKey);
                          }}
                          className={`py-1 px-0.5 rounded-lg text-xs font-mono transition-all flex flex-col items-center justify-center relative cursor-pointer h-7 sm:h-8 ${
                            !cell.isCurrentMonth
                              ? 'text-slate-300 dark:text-slate-600 hover:bg-slate-100/50 dark:hover:bg-slate-700/30'
                              : isSelected
                              ? 'bg-red-600 text-white font-black shadow-xs'
                              : isToday
                              ? 'border border-red-500 font-extrabold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30'
                              : count > 0
                              ? 'font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-700/60 hover:bg-red-50 dark:hover:bg-red-950/50 border border-slate-200 dark:border-slate-700'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <span className="leading-none">{cell.dayNumber}</span>
                          {count > 0 && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                                isSelected ? 'bg-white' : 'bg-red-600 dark:bg-red-400'
                              }`}
                              title={`${count} changes recorded`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {activeMonthDatesWithLogs.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        Dates with changes:
                      </span>
                      {activeMonthDatesWithLogs.map(([dateKey, count]) => {
                        const isSelected = auditSelectedDate === dateKey;
                        const [, m, d] = dateKey.split('-');
                        return (
                          <button
                            key={dateKey}
                            type="button"
                            onClick={() => setAuditSelectedDate(dateKey)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-red-400'
                            }`}
                          >
                            {d}/{m} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Search & Filter Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search audit trail by student name, ID, status, or keyword..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/50"
                />
              </div>

              {/* Change Log Entries - Data Audit Trail (NFR-07) */}
              <div className="space-y-3 text-xs font-sans">
                {filteredAuditLogs.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400">
                      <Calendar className="w-5 h-5 text-red-500/80" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {auditSearchQuery
                        ? 'No audit entries matching your search query.'
                        : auditSelectedDate === getTodayKey()
                        ? 'No Change Logs Recorded Yet Today'
                        : `No Logs on ${formatSelectedDateDisplay(auditSelectedDate)}`}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      {auditSearchQuery
                        ? 'Try clearing your search query or switching date filters.'
                        : 'Change logs reset daily so records do not pile up in one place. Actions taken today will appear here fresh.'}
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setAuditSelectedDate('all')}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                      >
                        View All Historical Logs ({auditLogsList.length})
                      </button>
                      {auditDatesWithLogs.size > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAuditCalendar(true)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Pick Active Date from Calendar
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  filteredAuditLogs.map((log, idx) => {
                    const studentName = log.student_name || (log.first_name ? `${log.first_name} ${log.last_name || ''}` : (selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Student Profile'));
                    const studentNum = log.student_number || selectedStudent?.student_number || '31234561';

                    const logAuthorDisplay = activeRole === 'student'
                      ? (log.created_by && log.created_by.toLowerCase().includes('student')
                          ? log.created_by
                          : `Student: ${studentName}`)
                      : (log.created_by || 'Academic Chair');

                    return (
                      <div key={log.version_id || idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between font-mono text-[10px] font-bold gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-red-700 text-white px-2.5 py-0.5 rounded-md font-mono shadow-2xs shrink-0">
                              {new Date(log.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-md uppercase font-extrabold text-[9px] font-mono border text-right shrink-0 ${
                            log.plan_status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
                            log.plan_status === 'agreed' ? 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800' :
                            log.plan_status === 'recommended' ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' :
                            log.plan_status === 'request_submitted' || log.plan_status === 'request' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800' :
                            log.plan_status === 'rejected' ? 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800' :
                            log.plan_status === 'logged_in' ? 'bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800' :
                            'bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800'
                          }`}>
                            {log.plan_status === 'logged_in' ? 'LOGIN / ACCOUNT SWITCH' :
                             log.plan_status === 'request_submitted' ? 'STUDENT REQUEST SUBMITTED' :
                             log.plan_status === 'rejected' ? 'CHANGE REQUESTED' :
                             log.plan_status === 'recommended' ? 'RECOMMENDED BY CHAIR' :
                             log.plan_status === 'agreed' ? 'AGREED BY STUDENT' :
                             log.plan_status === 'approved' ? 'APPROVED & FINALIZED' :
                             (log.plan_status || 'STATUS CHANGED').toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                          <span>Student: {studentName} <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">({studentNum})</span></span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">By: <strong className="text-slate-800 dark:text-slate-200 font-bold">{logAuthorDisplay}</strong></span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-0.5">
                          {log.amendment_reason || 'Study plan status update'}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="p-4 sm:px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 shrink-0 flex items-center justify-between gap-3">
              <button
                onClick={handleDownloadAuditPDF}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer font-heading active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Change Log PDF</span>
              </button>
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Physical Study Plan Document Modal */}
      {showDocumentModal && (
        <OfficialStudyPlanDocumentModal
          student={selectedStudent}
          planUnits={planUnits}
          history={history}
          currentPlan={currentPlan}
          onClose={() => setShowDocumentModal(false)}
        />
      )}

      {/* Certificate Modal */}
      {activeCertificate && (
        <CertificateView
          certificate={activeCertificate}
          onClose={() => setActiveCertificate(null)}
        />
      )}

      {/* Data Import Modal */}
      {showImportModal && (
        <DataImportModal
          onImportSuccess={handleRefreshCatalog}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Add Unit Manually Modal */}
      {showAddUnitModal && (
        <AddUnitModal
          onAddUnit={handleAddUnit}
          onClose={() => setShowAddUnitModal(false)}
        />
      )}

      {/* Add / Edit Student Profile Modal */}
      {showAddStudentModal && (
        <AddStudentModal
          onSaveStudent={handleSaveStudent}
          editStudent={editingStudent}
          onClose={() => {
            setShowAddStudentModal(false);
            setEditingStudent(null);
          }}
        />
      )}

      {/* User & System Guide Modal */}
      <GuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
}
