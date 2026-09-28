import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import StudentSelectModal from './components/StudentSelectModal';
import AcademicHistoryView from './components/AcademicHistoryView';
import PlanBuilder from './components/PlanBuilder';
import StoredPlansView from './components/StoredPlansView';
import CourseCatalogPreview from './components/CourseCatalogPreview';
import CertificateView from './components/CertificateView';
import DataImportModal from './components/DataImportModal';
import OfficialStudyPlanDocumentModal from './components/OfficialStudyPlanDocumentModal';
import GuideModal from './components/GuideModal';
import AddUnitModal from './components/AddUnitModal';
import AddStudentModal from './components/AddStudentModal';
import Footer from './components/Footer';

import {
  fetchStudents,
  fetchStudentHistory,
  fetchCatalogUnits,
  fetchTeachingPeriods,
  fetchPlanByStudent,
  validatePlan,
  saveStudyPlan,
  recommendPlan,
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
  Search
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
    account_category: 'admin'
  },
  {
    student_id: 1,
    student_number: 'PT3-2026-001',
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
    account_category: 'existing_student'
  },
  {
    student_id: 2,
    student_number: 'PT3-2026-002',
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
    account_category: 'existing_student'
  },
  {
    student_id: 3,
    student_number: 'PT3-2026-003',
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
    account_category: 'new_student'
  },
  {
    student_id: 4,
    student_number: 'PT3-2026-004',
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
    account_category: 'new_student'
  }
];

export default function App() {
  const [activeRole, setActiveRole] = useState('chair'); // 'chair' | 'student'
  const [studentsList, setStudentsList] = useState(initialSampleStudents);
  const [selectedStudent, setSelectedStudent] = useState(initialSampleStudents[0]);
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [catalogUnits, setCatalogUnits] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(() => mockClientStudentPlans[1].plan);
  const [planUnits, setPlanUnits] = useState(() => mockClientStudentPlans[1].units);
  const [allStudentPlansMap, setAllStudentPlansMap] = useState(() => ({
    1: { plan: mockClientStudentPlans[1].plan, units: mockClientStudentPlans[1].units },
    2: { plan: mockClientStudentPlans[2].plan, units: mockClientStudentPlans[2].units },
    3: { plan: mockClientStudentPlans[3].plan, units: mockClientStudentPlans[3].units },
    4: { plan: mockClientStudentPlans[4].plan, units: mockClientStudentPlans[4].units }
  }));
  const [validationResult, setValidationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('STUDY_PLAN');
  
  // Stored Plans List State (Dynamic Last Updated, Version, & Status tracking)
  const [storedPlansList, setStoredPlansList] = useState([
    {
      plan_id: 101,
      student_id: 1,
      student_name: 'Alex Mercer',
      student_number: 'PT3-2026-001',
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
      student_number: 'PT3-2026-002',
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
      student_number: 'PT3-2026-003',
      course_code: 'PT3-BSIT-BIS03',
      title: 'PT3-BSIT Business Info Systems Plan',
      status: 'draft',
      version_number: 1,
      total_cp: 0,
      created_by: 'Academic Chair',
      updated_at: '2026-09-14 11:20',
      location: 'Singapore Campus'
    },
    {
      plan_id: 104,
      student_id: 4,
      student_name: 'Emily Watson',
      student_number: 'PT3-2026-004',
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
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  // Notifications Drawer State
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      role: 'chair',
      studentId: 1,
      title: 'Study Plan Request',
      message: 'Alex Mercer submitted a study plan request for Trimesters 1, 2, 3 (2026).',
      timestamp: '09:30 AM',
      createdTimeMs: Date.now(),
      read: false,
      actionType: 'AUTO_GENERATE',
      actionLabel: 'Review & Auto-Generate'
    },
    {
      id: 'n-2',
      role: 'student',
      studentId: 1,
      title: 'Study Plan Recommended',
      message: 'Academic Chair Dr. Aris Thorne recommended your 72 CP Study Plan.',
      timestamp: 'Yesterday',
      createdTimeMs: Date.now(),
      read: true,
      actionType: 'REVIEW',
      actionLabel: 'Review Recommended Plan'
    }
  ]);

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
    const logRows = auditLogsList.map((log) => {
      const studentName = log.student_name || (log.first_name ? `${log.first_name} ${log.last_name || ''}` : (selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Student Profile'));
      const studentNum = log.student_number || selectedStudent?.student_number || 'PT3-2026-001';
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
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background-color: #0f172a; color: white; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
          .footer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Official Study Plan Change Log & Data Audit Trail</div>
            <div class="subtitle">Murdoch University Academic Governance System & Historical Audit Log</div>
          </div>
          <div style="text-align: right; font-size: 11px; font-family: monospace;">
            <div>Export Date: ${new Date().toLocaleString()}</div>
            <div>Total Audit Records: ${auditLogsList.length}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Status / Event</th>
              <th>Student / Profile</th>
              <th>Change Log / Audit Description</th>
              <th>Author</th>
            </tr>
          </thead>
          <tbody>
            ${logRows || '<tr><td colspan="5" style="text-align:center; padding: 20px;">No audit records found.</td></tr>'}
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

  const handleSelectNotification = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));

    let targetStudentObj = null;
    if (notif.studentId) {
      targetStudentObj = studentsList.find(s => s.student_id === notif.studentId);
      if (targetStudentObj) {
        handleSelectStudent(targetStudentObj);
      }
    }

    if (notif.role === 'chair') {
      setActiveRole('chair');
      const stName = targetStudentObj ? `${targetStudentObj.first_name} ${targetStudentObj.last_name}` : 'Student';
      const stNum = targetStudentObj?.student_number ? ` (${targetStudentObj.student_number})` : '';
      updatePlanRecordAndLogAudit(
        currentPlan?.status || 'draft',
        `Academic Chair reviewed student request notification for ${stName}${stNum}: "${notif.title} - ${notif.message}"`,
        'Academic Chair'
      );
    } else {
      setActiveRole('student');
    }

    setActiveTab('STUDY_PLAN');

    const targetYr = notif.targetYear || 1;
    setCurrentPlan(prev => ({
      ...prev,
      targetYearLevel: targetYr,
      forceScrollTrigger: Date.now()
    }));

    if (notif.actionType === 'AUTO_GENERATE' && notif.studentId) {
      handleAutoGeneratePlan(notif.studentId, { targetYearLevel: targetYr });
    }

    // Auto-scroll directly down past student header banner & workflow guide to Year 1 / 2 / 3 grid block
    const scrollToTargetYear = () => {
      const yearBlock = document.getElementById(`year-block-${targetYr}`) || document.getElementById('study-plan-years-section') || document.getElementById('year-grid-canvas');
      if (yearBlock) {
        const yOffset = -85;
        const y = yearBlock.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    };

    setTimeout(scrollToTargetYear, 100);
    setTimeout(scrollToTargetYear, 350);
    setTimeout(scrollToTargetYear, 700);
  };

  const handleStudentSubmitPlanRequest = ({ year = 2026, periodIds = [3, 4, 5], comment = '' }) => {
    if (!selectedStudent) return;
    const stName = `${selectedStudent.first_name} ${selectedStudent.last_name}`;
    const termLabels = periodIds.map(p => p === 3 ? 'Trimester 1 (T1)' : p === 4 ? 'Trimester 2 (T2)' : 'Trimester 3 (T3)').join(', ');
    const msg = `${stName} requested a study plan for ${termLabels} ${year}.${comment ? ` Note: "${comment}"` : ''}`;

    const targetYrLvl = year === 2027 ? 2 : year === 2028 ? 3 : 1;
    const wasApproved = currentPlan?.status === 'approved' || currentPlan?.status === 'agreed' || currentPlan?.status === 'stored';

    const newNotif = {
      id: `n-${Date.now()}`,
      role: 'chair',
      studentId: selectedStudent.student_id,
      targetYear: targetYrLvl,
      title: wasApproved ? `Replan Request from ${stName} (Approved Plan)` : `Plan Request from ${stName}`,
      message: msg,
      timestamp: 'Just now',
      read: false,
      actionType: 'AUTO_GENERATE',
      actionLabel: 'Review & Auto-Generate'
    };

    setNotifications(prev => [newNotif, ...prev]);

    if (currentPlan) {
      const updatedPlan = {
        ...currentPlan,
        status: 'request_submitted',
        studentSignature: wasApproved ? null : currentPlan?.studentSignature,
        signature: wasApproved ? null : currentPlan?.signature,
        requestYear: year,
        targetYearLevel: targetYrLvl,
        requestPeriods: periodIds,
        requestComment: comment,
        updated_at: formatCurrentDateTime(),
        version_number: (currentPlan?.version_number || 1) + 1
      };
      setCurrentPlan(updatedPlan);

      updatePlanRecordAndLogAudit(
        'request_submitted',
        wasApproved
          ? `Previously APPROVED study plan re-opened: Student submitted new replan request for Year ${targetYrLvl} (${year})`
          : `Student submitted study plan request for Year ${targetYrLvl} (${year})`,
        `Student: ${stName}`
      );
    }

    showToast(
      wasApproved
        ? `Approved plan re-opened! Replan request submitted to Academic Chair for Year ${targetYrLvl} (${year}).`
        : `Study plan request submitted to Academic Chair! Switched focus to Year ${targetYrLvl} (${year}).`
    );
  };

  const handleAutoGeneratePlan = (targetStudentId, options = {}) => {
    const targetStudent = studentsList.find(s => s.student_id === (targetStudentId || selectedStudent?.student_id)) || selectedStudent;
    if (!targetStudent) return;

    // Filter completed passed units from student history
    const completedHistory = (history || []).filter(h => h.status === 'completed');
    const completedCodes = new Set(completedHistory.map(h => h.unit_code || h.code));

    // Calculate passed years from history (e.g. 6+ completed units in Year 1 / 2026 means Year 1 is passed)
    const passedYears = new Set();
    const yr1Count = completedHistory.filter(h => h.year_taken === 2026 || (h.period_id >= 3 && h.period_id <= 5 && (h.year_taken <= 2026 || !h.year_taken))).length;
    if (yr1Count >= 6) passedYears.add(1);
    const yr2Count = completedHistory.filter(h => h.year_taken === 2027).length;
    if (yr2Count >= 6) passedYears.add(2);

    const reqYear = options.requestYear || currentPlan?.requestYear || 2026;
    let targetYearLvl = options.targetYearLevel !== undefined ? options.targetYearLevel : (currentPlan?.targetYearLevel || (reqYear === 2027 ? 2 : reqYear === 2028 ? 3 : 1));
    const requestedPeriods = options.requestPeriods || currentPlan?.requestPeriods || [3, 4, 5];

    // Determine numerical target year level if specific year (1, 2, 3) selected
    const targetLvlNum = typeof targetYearLvl === 'number'
      ? targetYearLvl
      : (targetYearLvl !== 'all' && !isNaN(Number(targetYearLvl)) ? Number(targetYearLvl) : null);

    // Open years in chronological order excluding passed ones
    const chronologicalOpenYears = [1, 2, 3].filter(y => !passedYears.has(y));
    if (chronologicalOpenYears.length === 0) chronologicalOpenYears.push(3);

    let yearOrder = chronologicalOpenYears;
    let preserveOtherYears = false;

    if (targetLvlNum && !passedYears.has(targetLvlNum)) {
      yearOrder = [targetLvlNum];
      preserveOtherYears = true;
    }

    const periodOrder = requestedPeriods.length > 0 ? requestedPeriods : [3, 4, 5];

    // Units that are failed, enrolled, or not yet taken ARE available!
    const availableCatalog = (catalogUnits || []).filter(u => !completedCodes.has(u.code));

    const scheduledUnits = [];
    const scheduledCodes = new Set();
    const periodLoads = {};

    // If targeting a specific year level (e.g. Year 3), preserve existing draft units from other year levels
    if (preserveOtherYears) {
      const existingDraftUnits = (planUnits || currentPlan?.plan_units || []).filter(u => u.year_level !== targetLvlNum);
      for (const u of existingDraftUnits) {
        scheduledUnits.push(u);
        scheduledCodes.add(u.code);
        const pKey = `y${u.year_level}_p${u.period_id}`;
        periodLoads[pKey] = (periodLoads[pKey] || 0) + Number(u.credit_points || 3);
      }
    }

    const studentMajor = ((targetStudent.major || targetStudent.course_name || '') + '').toLowerCase();

    const getMajorRelevanceScore = (unit) => {
      const code = (unit.code || '').toLowerCase();
      const title = (unit.title || '').toLowerCase();
      
      if (studentMajor.includes('artificial intelligence') || studentMajor.includes('ai')) {
        if (code.includes('303') || code.includes('304') || code.includes('305') || code.includes('206') || code.includes('183') || title.includes('machine learning') || title.includes('ai') || title.includes('intelligent') || title.includes('data')) return 10;
      } else if (studentMajor.includes('computer science') || studentMajor.includes('cs')) {
        if (code.includes('283') || code.includes('373') || code.includes('374') || code.includes('167') || title.includes('algorithm') || title.includes('system') || title.includes('software')) return 10;
      } else if (studentMajor.includes('business') || studentMajor.includes('bis')) {
        if (code.includes('301') || code.includes('393') || code.includes('394') || title.includes('business') || title.includes('enterprise')) return 10;
      }
      return 1;
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

    const isPrereqSatisfied = (unit, year, periodId, scheduledUnitsList) => {
      const prereq = getUnitPrereqCode(unit);
      if (!prereq) return true;
      if (completedCodes.has(prereq)) return true;
      return scheduledUnitsList.some(s => {
        if (s.code !== prereq) return false;
        if (s.year_level < year) return true;
        if (s.year_level === year && s.period_id < periodId) return true;
        return false;
      });
    };

    // Pass 1: Schedule in chronological period order (Year -> Period) with strict prerequisite checking
    for (const year of yearOrder) {
      for (const periodId of periodOrder) {
        const pKey = `y${year}_p${periodId}`;
        periodLoads[pKey] = 0;

        const targetLvl = String(year === 1 ? 1 : year === 2 ? 2 : 3);
        const sortedCatalog = [...availableCatalog].sort((a, b) => {
          // 1. Target Level Priority (Level 200 for Yr 2, Level 300 for Yr 3)
          const aMatch = String(a.level) === targetLvl ? 0 : 1;
          const bMatch = String(b.level) === targetLvl ? 0 : 1;
          if (aMatch !== bMatch) return aMatch - bMatch;

          // 2. Student Major Priority Score
          const aScore = getMajorRelevanceScore(a);
          const bScore = getMajorRelevanceScore(b);
          if (aScore !== bScore) return bScore - aScore;

          // 3. Lower Level units first (Level 100/200 before 300)
          const aLvlNum = Number(a.level || 100);
          const bLvlNum = Number(b.level || 100);
          if (aLvlNum !== bLvlNum) return aLvlNum - bLvlNum;

          return (a.code || '').localeCompare(b.code || '');
        });

        for (const unit of sortedCatalog) {
          if (scheduledCodes.has(unit.code)) continue;

          // Check trimester offering compatibility (T1=3, T2=4, T3=5)
          const termCode = periodId === 3 ? 'T1' : periodId === 4 ? 'T2' : 'T3';
          if (unit.offerings && Array.isArray(unit.offerings) && unit.offerings.length > 0) {
            if (!unit.offerings.includes(termCode)) continue;
          }

          // Max 12 CP per period limit check for Pass 1
          if ((periodLoads[pKey] || 0) + Number(unit.credit_points || 3) > 12) {
            continue;
          }

          // BR-01 Tri 3 restriction
          if (periodId === 5 && (unit.code === 'ICT302' || unit.code === 'ICT374')) {
            continue;
          }

          // BR-02 Prerequisite check - MUST BE STRICT
          if (!isPrereqSatisfied(unit, year, periodId, scheduledUnits)) {
            continue;
          }

          const scheduledObj = {
            ...unit,
            unit_id: unit.unit_id || Math.floor(Math.random() * 100000),
            year_level: year,
            period_id: periodId,
            credit_points: Number(unit.credit_points || 3),
            sequence_order: scheduledUnits.length + 1
          };

          scheduledUnits.push(scheduledObj);
          scheduledCodes.add(unit.code);
          periodLoads[pKey] += Number(unit.credit_points || 3);
        }
      }
    }

    // Pass 2: Fallback fill loop to guarantee every open trimester reaches 12 CP (4 units)
    for (const year of yearOrder) {
      for (const periodId of periodOrder) {
        const pKey = `y${year}_p${periodId}`;
        const termCode = periodId === 3 ? 'T1' : periodId === 4 ? 'T2' : 'T3';

        while ((periodLoads[pKey] || 0) < 12 && (scheduledUnits.length + completedCodes.size) < 24) {
          const candidate = availableCatalog.find(u => {
            if (scheduledCodes.has(u.code)) return false;
            if (periodId === 5 && (u.code === 'ICT302' || u.code === 'ICT374')) return false;
            if (u.offerings && Array.isArray(u.offerings) && u.offerings.length > 0) {
              if (!u.offerings.includes(termCode)) return false;
            }
            if (!isPrereqSatisfied(u, year, periodId, scheduledUnits)) return false;
            return true;
          });

          if (!candidate) break; // no more unscheduled catalog units with satisfied prerequisites

          const scheduledObj = {
            ...candidate,
            unit_id: candidate.unit_id || Math.floor(Math.random() * 100000),
            year_level: year,
            period_id: periodId,
            credit_points: Number(candidate.credit_points || 3),
            sequence_order: scheduledUnits.length + 1
          };

          scheduledUnits.push(scheduledObj);
          scheduledCodes.add(candidate.code);
          periodLoads[pKey] = (periodLoads[pKey] || 0) + Number(candidate.credit_points || 3);
        }
      }
    }

    // Pass 3: Relax offering filter to fill open trimesters to 12 CP (4 units)
    for (const year of yearOrder) {
      for (const periodId of periodOrder) {
        const pKey = `y${year}_p${periodId}`;

        while ((periodLoads[pKey] || 0) < 12 && (scheduledUnits.length + completedCodes.size) < 24) {
          const candidate = availableCatalog.find(u => {
            if (scheduledCodes.has(u.code)) return false;
            if (periodId === 5 && (u.code === 'ICT302' || u.code === 'ICT374')) return false;
            return true;
          });

          if (!candidate) break;

          const scheduledObj = {
            ...candidate,
            unit_id: candidate.unit_id || Math.floor(Math.random() * 100000),
            year_level: year,
            period_id: periodId,
            credit_points: Number(candidate.credit_points || 3),
            sequence_order: scheduledUnits.length + 1
          };

          scheduledUnits.push(scheduledObj);
          scheduledCodes.add(candidate.code);
          periodLoads[pKey] = (periodLoads[pKey] || 0) + Number(candidate.credit_points || 3);
        }
      }
    }

    // Pass 4: Fill from degree fallback pool if needed to ensure 12 CP per trimester until 72 CP total is reached
    const fallbackDegreeUnits = [
      { code: 'ICT100', title: 'Transition to IT', credit_points: 3, level: 100 },
      { code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, level: 100 },
      { code: 'ICT158', title: 'Intro to Computer Systems', credit_points: 3, level: 100 },
      { code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, level: 100 },
      { code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, level: 100 },
      { code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, level: 100 },
      { code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, level: 100 },
      { code: 'ICT145', title: 'Python Programming', credit_points: 3, level: 100 },
      { code: 'MAS183', title: 'Statistical Data Analysis', credit_points: 3, level: 100 },
      { code: 'MAS164', title: 'Fundamentals of Mathematics', credit_points: 3, level: 100 },
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

    for (const year of yearOrder) {
      for (const periodId of periodOrder) {
        const pKey = `y${year}_p${periodId}`;

        while ((periodLoads[pKey] || 0) < 12 && (scheduledUnits.length + completedCodes.size) < 24) {
          const candidate = fallbackDegreeUnits.find(u => {
            if (scheduledCodes.has(u.code)) return false;
            if (completedCodes.has(u.code)) return false;
            if (periodId === 5 && (u.code === 'ICT302' || u.code === 'ICT374')) return false;
            return true;
          });

          if (!candidate) break;

          const scheduledObj = {
            ...candidate,
            unit_id: candidate.unit_id || Math.floor(Math.random() * 100000),
            year_level: year,
            period_id: periodId,
            credit_points: Number(candidate.credit_points || 3),
            sequence_order: scheduledUnits.length + 1
          };

          scheduledUnits.push(scheduledObj);
          scheduledCodes.add(candidate.code);
          periodLoads[pKey] = (periodLoads[pKey] || 0) + Number(candidate.credit_points || 3);
        }
      }
    }

    handleSetPlanUnits(scheduledUnits);
    runValidation(targetStudent.student_id, targetStudent.location_id, scheduledUnits);

    // Revert status to 'draft' (or 'request_submitted') if plan was previously approved/agreed
    const wasApproved = currentPlan?.status === 'approved' || currentPlan?.status === 'agreed' || currentPlan?.status === 'stored';
    const newStatus = 'draft';

    const updatedPlan = {
      ...currentPlan,
      status: newStatus,
      studentSignature: wasApproved ? null : currentPlan?.studentSignature,
      signature: wasApproved ? null : currentPlan?.signature,
      updated_at: formatCurrentDateTime(),
      version_number: (currentPlan?.version_number || 1) + 1
    };
    setCurrentPlan(updatedPlan);

    updatePlanRecordAndLogAudit(
      newStatus,
      wasApproved
        ? `Approved plan re-opened and reset to DRAFT via Auto System Generation for requested year ${reqYear}`
        : `Auto System Generation applied for requested year ${reqYear}`,
      'Academic Chair',
      targetStudent
    );

    const notif = {
      id: `n-${Date.now()}`,
      role: 'student',
      studentId: targetStudent.student_id,
      targetYear: targetYearLvl,
      title: wasApproved ? 'Approved Plan Re-opened for Replan' : 'Study Plan Auto-Generated',
      message: wasApproved
        ? `Academic Chair generated a new study plan structure for ${reqYear}. Status reset to Draft for review.`
        : `Academic Chair generated a recommended 72 CP Study Plan for Year ${targetYearLvl} (${reqYear}).`,
      timestamp: 'Just now',
      read: false,
      actionType: 'REVIEW',
      actionLabel: 'Review Recommended Plan'
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(
      wasApproved
        ? `Approved plan re-opened! Auto-generated new 72 CP plan for ${targetStudent.first_name} (Status reset to Draft).`
        : `Auto-generated 72 CP plan for ${targetStudent.first_name} tailored to requested Year ${targetYearLvl} (${reqYear})!`
    );
  };

  // Per-semester change requests state (key format: 'Y{yearLevel}-P{periodId}')
  const [semesterRequests, setSemesterRequests] = useState({
    'Y2-P1': 'Student request: "Please swap ICT283 Data Structures to Trimester 2 due to timetable conflict."'
  });

  const handleSaveSemesterRequest = (key, comment) => {
    setSemesterRequests(prev => ({
      ...prev,
      [key]: comment
    }));

    if (currentPlan) {
      const updatedPlan = {
        ...currentPlan,
        status: 'rejected',
        updated_at: formatCurrentDateTime(),
        version_number: (currentPlan?.version_number || 1) + 1
      };
      setCurrentPlan(updatedPlan);
      setStoredPlansList(prevList =>
        prevList.map(p => p.plan_id === updatedPlan.plan_id ? { ...p, status: 'rejected', updated_at: updatedPlan.updated_at, version_number: updatedPlan.version_number } : p)
      );
    }
    showToast(`Semester change request submitted to Academic Chair!`);
  };

  const handleRemoveSemesterRequest = (key) => {
    setSemesterRequests(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
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
  }, [showAuditModal]);

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

      // Select first student if available
      if (loadedStudents && loadedStudents.length > 0) {
        handleSelectStudent(loadedStudents[0]);
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
        setAllStudentPlansMap(prevMap => ({
          ...prevMap,
          [selectedStudent.student_id]: {
            plan: currentPlan,
            units: updatedUnits
          }
        }));
      }
      return updatedUnits;
    });
  };

  const handleSelectStudent = async (student) => {
    // 1. Preserve current student's working draft in cache map before switching
    if (selectedStudent && currentPlan) {
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

    // Record login / account switch event into Audit Log
    setAuditLogsList(prev => [
      {
        version_id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        version_number: 'LOG',
        student_number: student.student_number || 'PT3-2026-000',
        first_name: student.first_name,
        last_name: student.last_name,
        plan_title: `${student.course_code || 'PT3-BSIT'} Account Session`,
        amendment_reason: `Account Profile Switch: Loaded profile for ${student.first_name} ${student.last_name}${student.account_category === 'admin' || student.student_id === 0 ? '' : ` (${(student.account_category || 'STUDENT').replace('_', ' ').toUpperCase()})`}`,
        created_by: activeRole === 'chair' ? 'Academic Chair' : `Student: ${student.first_name} ${student.last_name}`,
        created_at: new Date().toISOString(),
        plan_status: 'logged_in'
      },
      ...prev
    ]);
    
    // Do NOT auto-switch activeRole when a student profile is selected.
    // If the Academic Chair selects a student, they stay in Academic Chair view to manage that student's plan.
    if (activeTab === 'STORED' || activeTab === 'CATALOG') {
      setActiveTab('STUDY_PLAN');
    }

    const categoryTag = student.account_category === 'admin' || student.student_id === 0 ? '' : ` (${student.account_category === 'new_student' ? 'New Student' : 'Existing Student'})`;
    showToast(`Loaded profile for ${student.first_name} ${student.last_name}${categoryTag}`);

    // 2. If student ALREADY has a working draft in memory, load it directly to prevent wiping data!
    if (allStudentPlansMap[student.student_id]) {
      const cached = allStudentPlansMap[student.student_id];
      setCurrentPlan(cached.plan);
      setPlanUnits(cached.units);
      runValidation(student.student_id, student.location_id, cached.units);
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
      
      const initialPlan = (planData && planData.plan) ? planData.plan : {
        plan_id: student.student_id,
        student_id: student.student_id,
        title: `${student.course_code || 'PT3-BSIT'} Study Plan`,
        status: 'draft',
        total_credit_points: 0
      };
      const initialUnits = (planData && planData.units) ? planData.units : [];

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
        planUnits: units
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

  const updatePlanRecordAndLogAudit = (newStatus, reason, authorName, overrideStudent = null) => {
    const targetStudent = overrideStudent || selectedStudent;
    if (!targetStudent) return;
    const nowFormatted = formatCurrentDateTime();
    const nowIso = new Date().toISOString();

    setStoredPlansList(prev => {
      const existingIdx = prev.findIndex(p => String(p.student_id) === String(targetStudent.student_id));
      if (existingIdx !== -1) {
        const existing = prev[existingIdx];
        const nextVer = (existing.version_number || 1) + 1;
        const updatedItem = {
          ...existing,
          status: newStatus,
          version_number: nextVer,
          updated_at: nowFormatted,
          total_cp: (planUnits || []).reduce((sum, u) => sum + Number(u.credit_points || 3), 0)
        };
        const newList = [...prev];
        newList[existingIdx] = updatedItem;
        return newList;
      } else {
        const newItem = {
          plan_id: Math.floor(Math.random() * 900) + 100,
          student_id: targetStudent.student_id,
          student_name: `${targetStudent.first_name} ${targetStudent.last_name}`,
          student_number: targetStudent.student_number,
          course_code: targetStudent.course_code || 'PT3-BSIT',
          title: `${targetStudent.course_code || 'PT3-BSIT'} Study Plan`,
          status: newStatus,
          version_number: 1,
          total_cp: (planUnits || []).reduce((sum, u) => sum + Number(u.credit_points || 3), 0),
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
      version_number: (currentPlan?.version_number || 1) + 1,
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
  const handleRecommendPlan = async () => {
    if (!selectedStudent || selectedStudent.account_category === 'admin' || selectedStudent.student_id === 0) {
      showToast('⚠️ Target Student Not Selected: Please select a target student profile from the directory before sending a study plan recommendation.');
      setShowStudentSelectModal(true);
      return;
    }
    if (!planUnits || planUnits.length === 0) {
      showToast('⚠️ Cannot Recommend Empty Plan: You must add at least one course unit (minimum 3 CP) to the study plan before recommending to student.');
      return;
    }

    const updatedPlan = { ...currentPlan, status: 'recommended', updated_at: formatCurrentDateTime(), version_number: (currentPlan?.version_number || 1) + 1 };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => ({
      ...prev,
      [selectedStudent.student_id]: {
        plan: updatedPlan,
        units: planUnits
      }
    }));
    const totalCP = (planUnits || []).reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
    updatePlanRecordAndLogAudit(
      'recommended',
      `Academic Chair reviewed & RECOMMENDED proposed ${totalCP} CP Study Plan to student ${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.student_number}) for student review & sign-off`,
      'Academic Chair'
    );
    showToast(`Plan successfully recommended to ${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.student_number})!`);
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
    const updatedPlan = {
      ...currentPlan,
      status: 'agreed',
      studentSignature: signatureObj || currentPlan?.studentSignature,
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
    const hashTag = signatureObj?.verificationHash ? ` (${signatureObj.verificationHash})` : '';
    updatePlanRecordAndLogAudit('agreed', `Student agreed and digitally signed proposed study plan${hashTag}`, `Student: ${selectedStudent.first_name} ${selectedStudent.last_name}`);
    showToast('Study plan agreed and digitally signed by student!');
    try {
      const planId = currentPlan ? currentPlan.plan_id : selectedStudent.student_id;
      await agreePlan(planId, `${selectedStudent.first_name} ${selectedStudent.last_name}`);
    } catch (err) {
      console.error('Agree failed:', err);
    }
  };

  // Student Reject Plan / Request Changes
  const handleRejectPlan = (rejectionComment) => {
    if (!selectedStudent) return;
    const updatedPlan = {
      ...currentPlan,
      status: 'rejected',
      rejectionComment,
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
    updatePlanRecordAndLogAudit(
      'rejected',
      `Student requested changes / rejected study plan with comment: "${rejectionComment}"`,
      `Student: ${selectedStudent.first_name} ${selectedStudent.last_name}`
    );
    showToast(`Study plan rejection submitted to Academic Chair! Comment: "${rejectionComment}"`);
  };

  // Chair Approve & Finalise Plan
  const handleApprovePlan = async () => {
    if (!selectedStudent) return;
    const updatedPlan = { ...currentPlan, status: 'approved', updated_at: formatCurrentDateTime(), version_number: (currentPlan?.version_number || 1) + 1 };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => ({
      ...prev,
      [selectedStudent.student_id]: {
        plan: updatedPlan,
        units: planUnits
      }
    }));
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
          activeRole={activeRole}
          onRoleChange={(newRole) => {
            setActiveRole(newRole);
            if (newRole === 'chair') {
              const adminAcc = studentsList.find(s => s.account_category === 'admin' || s.student_id === 0);
              if (adminAcc) handleSelectStudent(adminAcc);
            } else {
              if (activeTab === 'STORED' || activeTab === 'CATALOG') {
                setActiveTab('STUDY_PLAN');
              }
              if (selectedStudent && (selectedStudent.account_category === 'admin' || selectedStudent.student_id === 0)) {
                const firstStudent = studentsList.find(s => s.account_category !== 'admin' && s.student_id !== 0);
                if (firstStudent) handleSelectStudent(firstStudent);
              }
            }
          }}
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
          
          {/* Student Selection Modal */}
          {showStudentSelectModal && (
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

          {/* Executive Student Course Info Header (Shown only when a real target student profile is selected on STUDY_PLAN & ACADEMIC_HISTORY tabs) */}
          {(activeTab === 'STUDY_PLAN' || activeTab === 'ACADEMIC_HISTORY') &&
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
                      Official Degree Enrolment Record & Multi-Year Study Sequence
                    </p>
                  </div>
                </div>

                {/* Right Side: Clean Student Metadata Strip */}
                <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2.5 sm:gap-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium shrink-0">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <User className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">
                      {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Alex Mercer'}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono font-bold">
                      ({selectedStudent ? selectedStudent.student_number : 'PT3-2026-001'})
                    </span>
                  </div>

                  <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

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
              semesterRequests={semesterRequests}
              onSaveSemesterRequest={handleSaveSemesterRequest}
              onRemoveSemesterRequest={handleRemoveSemesterRequest}
              onOpenOfficialDocument={() => setShowDocumentModal(true)}
              onOpenStudentSelectModal={() => setShowStudentSelectModal(true)}
              onStudentSubmitPlanRequest={handleStudentSubmitPlanRequest}
              onAutoGeneratePlan={handleAutoGeneratePlan}
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
              storedPlans={storedPlansList}
              activeRole={activeRole}
              onSelectStudentAndRetrievePlan={(st, planRecord) => {
                handleSelectStudent(st);
                setActiveTab('STUDY_PLAN');
                if (planRecord && (planRecord.status === 'approved' || planRecord.status === 'agreed')) {
                  setCurrentPlan(prev => ({
                    ...prev,
                    status: 'draft',
                    updated_at: formatCurrentDateTime()
                  }));
                }
                showToast(`Retrieved plan for ${st.first_name || ''} ${st.last_name || ''}. You can now amend and update units.`);
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
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white dark:bg-slate-900 border-t-4 border-t-red-600 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative text-slate-900 dark:text-slate-100 transition-colors">
            <button
              onClick={() => setShowAuditModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shadow-2xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  Study Plan Change Log & Data Audit Trail
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Real-time database audit log recording study plan status changes, recommendations, and unit amendments.
                </p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="relative mb-3.5">
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
            <div className="space-y-3 max-h-80 overflow-y-auto text-xs font-sans pr-1">
              {(() => {
                const filtered = auditLogsList.filter(log => {
                  if (!auditSearchQuery.trim()) return true;
                  const q = auditSearchQuery.toLowerCase();
                  const name = (log.student_name || (log.first_name ? `${log.first_name} ${log.last_name || ''}` : '')).toLowerCase();
                  const num = (log.student_number || '').toLowerCase();
                  const reason = (log.amendment_reason || '').toLowerCase();
                  const status = (log.plan_status || '').toLowerCase();
                  const author = (log.created_by || '').toLowerCase();
                  return name.includes(q) || num.includes(q) || reason.includes(q) || status.includes(q) || author.includes(q);
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {auditSearchQuery ? 'No audit entries matching your search query.' : 'No plan data audit logs recorded yet.'}
                      </p>
                    </div>
                  );
                }

                return filtered.map((log, idx) => {
                  const studentName = log.student_name || (log.first_name ? `${log.first_name} ${log.last_name || ''}` : (selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Student Profile'));
                  const studentNum = log.student_number || selectedStudent?.student_number || 'PT3-2026-001';

                  return (
                    <div key={log.version_id || idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between font-mono text-[10px] font-bold gap-2">
                        <span className="bg-red-700 text-white px-2.5 py-0.5 rounded-md font-mono shadow-2xs shrink-0">
                          {new Date(log.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md uppercase font-extrabold text-[9px] font-mono border text-right truncate ${
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
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">By: <strong className="text-slate-800 dark:text-slate-200 font-bold">{log.created_by || 'Academic Chair'}</strong></span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-0.5">
                        {log.amendment_reason || 'Study plan status update'}
                      </p>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={handleDownloadAuditPDF}
                className="px-4.5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer font-heading active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Change Log PDF</span>
              </button>
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
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
