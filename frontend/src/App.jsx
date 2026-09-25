import React, { useState, useEffect } from 'react';
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
  ShieldCheck
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
  const [storedPlansCount, setStoredPlansCount] = useState(4);

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
      total_cp: 72,
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
      status: 'recommended',
      version_number: 2,
      total_cp: 69,
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
      version_number: 2,
      total_cp: 72,
      created_by: 'Academic Chair',
      updated_at: '2026-09-13 14:10',
      location: 'Singapore Campus'
    }
  ]);

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
  const [auditTab, setAuditTab] = useState('data_audit'); // 'data_audit' | 'system_spec'
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

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
        amendment_reason: `Account Profile Switch: Loaded profile for ${student.first_name} ${student.last_name} (${(student.account_category || 'STUDENT').replace('_', ' ').toUpperCase()})`,
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

    showToast(`Loaded profile for ${student.first_name} ${student.last_name} (${student.account_category === 'admin' ? 'Academic Chair' : student.account_category === 'new_student' ? 'New Student' : 'Existing Student'})`);

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

  const updatePlanRecordAndLogAudit = (newStatus, reason, authorName) => {
    if (!selectedStudent) return;
    const nowFormatted = formatCurrentDateTime();
    const nowIso = new Date().toISOString();

    setStoredPlansList(prev => {
      const existingIdx = prev.findIndex(p => String(p.student_id) === String(selectedStudent.student_id));
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
          student_id: selectedStudent.student_id,
          student_name: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
          student_number: selectedStudent.student_number,
          course_code: selectedStudent.course_code || 'PT3-BSIT',
          title: `${selectedStudent.course_code || 'PT3-BSIT'} Study Plan`,
          status: newStatus,
          version_number: 1,
          total_cp: (planUnits || []).reduce((sum, u) => sum + Number(u.credit_points || 3), 0),
          created_by: authorName,
          updated_at: nowFormatted,
          location: selectedStudent.location_name || 'Singapore Campus'
        };
        return [newItem, ...prev];
      }
    });

    const newAuditLog = {
      version_id: Date.now(),
      plan_id: currentPlan?.plan_id || selectedStudent.student_id,
      version_number: (currentPlan?.version_number || 1) + 1,
      student_number: selectedStudent.student_number,
      first_name: selectedStudent.first_name,
      last_name: selectedStudent.last_name,
      plan_title: `${selectedStudent.course_code || 'PT3-BSIT'} Study Plan`,
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
    updatePlanRecordAndLogAudit('recommended', 'Study plan marked as RECOMMENDED to student for review', 'Academic Chair');
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
    const updatedPlan = { ...currentPlan, status: 'stored', updated_at: formatCurrentDateTime(), version_number: (currentPlan?.version_number || 1) + 1 };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => ({
      ...prev,
      [selectedStudent.student_id]: {
        plan: updatedPlan,
        units: planUnits
      }
    }));
    setStoredPlansCount(prev => prev + 1);
    updatePlanRecordAndLogAudit('stored', 'Study Plan saved & archived in Stored Plans Repository', 'Academic Chair');
    showToast('Study Plan saved & archived in Stored Plans Repository!');
    try {
      await saveStudyPlan({
        student_id: selectedStudent.student_id,
        title: `${selectedStudent.course_code || 'PT3-BSIT'} Study Plan`,
        status: currentPlan ? currentPlan.status : 'draft',
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
            <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl font-sans text-slate-900 dark:text-white transition-all relative overflow-hidden backdrop-blur-md">
              {/* Subtle executive background accents */}
              <div className="absolute -right-16 -top-16 w-80 h-80 bg-gradient-to-br from-red-600/15 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-gradient-to-tr from-emerald-600/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-4 sm:gap-6">
                {/* Left Side: Major Badge, Status & Degree Title */}
                <div className="space-y-2 max-w-full overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2 font-sans">
                    {currentPlan?.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Approved
                      </span>
                    )}
                    {currentPlan?.status === 'agreed' && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Student Agreed
                      </span>
                    )}
                    {currentPlan?.status === 'recommended' && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Recommended
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-heading">
                    Bachelor of Information Technology
                  </h1>
                </div>

                {/* Right Side: Clean Student Metadata Strip (No background boxes) */}
                <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2.5 sm:gap-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium shrink-0">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                    <User className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm font-heading">
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
              onSelectStudentAndRetrievePlan={(st) => {
                handleSelectStudent(st);
                setActiveTab('STUDY_PLAN');
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
          <div className="bg-white dark:bg-slate-900 border-t-4 border-t-red-600 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative text-slate-900 dark:text-slate-100 transition-colors">
            <button
              onClick={() => setShowAuditModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
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
                  Real-time database audit log recording study plan status changes and unit amendments.
                </p>
              </div>
            </div>

            {/* Change Log Entries - Data Audit Trail (NFR-07) */}
            <div className="space-y-3 max-h-80 overflow-y-auto text-xs font-sans pr-1">
              {auditLogsList.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No plan data audit logs recorded yet.</p>
                </div>
              ) : (
                auditLogsList.map((log, idx) => (
                  <div key={log.version_id || idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold">
                      <span className="bg-red-700 text-white px-2.5 py-0.5 rounded-md font-mono shadow-2xs">
                        {new Date(log.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md uppercase font-extrabold text-[9px] font-mono border ${
                        log.plan_status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
                        log.plan_status === 'agreed' ? 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800' :
                        log.plan_status === 'recommended' ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' :
                        log.plan_status === 'logged_in' ? 'bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800' :
                        'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                      }`}>
                        {log.plan_status === 'logged_in' ? 'LOGIN / ACCOUNT SWITCH' : (log.plan_status || 'STATUS CHANGED')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>Student: {log.first_name || 'Alex'} {log.last_name || 'Mercer'} <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">({log.student_number || 'PT3-2026-001'})</span></span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">By: <strong className="text-slate-800 dark:text-slate-200 font-bold">{log.created_by || 'Academic Chair'}</strong></span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-0.5">
                      {log.amendment_reason || 'Study plan status update'}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-red-700 dark:hover:bg-red-800 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs"
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
