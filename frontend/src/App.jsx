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
    study_status: 'active'
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
    study_status: 'active'
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
    study_status: 'active'
  },
  {
    student_id: 4,
    student_number: 'PT3-2026-004',
    first_name: 'Emily',
    last_name: 'Watson',
    email: 'e.watson@student.pt3solutions.edu.sg',
    course_id: 4,
    course_code: 'PT3-BSIT-AI04',
    course_name: 'Bachelor of Information Technology (Major: Artificial Intelligence)',
    location_id: 2,
    location_name: 'PT3 Solutions Singapore Campus',
    commencement_year: 2026,
    study_status: 'part-time'
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
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [auditTab, setAuditTab] = useState('data_audit'); // 'data_audit' | 'system_spec'
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (showAuditModal) {
      fetchAuditLog().then(res => setAuditLogsList(res || [])).catch(console.error);
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
    showToast(`Selected student ${student.first_name} ${student.last_name}`);

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

  // Recommend Plan
  const handleRecommendPlan = async () => {
    if (!selectedStudent) return;
    const updatedPlan = { ...currentPlan, status: 'recommended' };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => ({
      ...prev,
      [selectedStudent.student_id]: {
        plan: updatedPlan,
        units: planUnits
      }
    }));
    showToast('Plan recommended to student! Switch to Student View to review & agree.');
    try {
      const planId = currentPlan ? currentPlan.plan_id : selectedStudent.student_id;
      await recommendPlan(planId, 'Academic Chair');
    } catch (err) {
      console.error('Recommend failed:', err);
    }
  };

  // Student Agree Plan
  const handleAgreePlan = async () => {
    if (!selectedStudent) return;
    const updatedPlan = { ...currentPlan, status: 'agreed' };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => ({
      ...prev,
      [selectedStudent.student_id]: {
        plan: updatedPlan,
        units: planUnits
      }
    }));
    showToast('Study plan agreed and digitally signed by student!');
    try {
      const planId = currentPlan ? currentPlan.plan_id : selectedStudent.student_id;
      await agreePlan(planId, `${selectedStudent.first_name} ${selectedStudent.last_name}`);
    } catch (err) {
      console.error('Agree failed:', err);
    }
  };

  // Chair Approve & Finalise Plan
  const handleApprovePlan = async () => {
    if (!selectedStudent) return;
    const updatedPlan = { ...currentPlan, status: 'approved' };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => ({
      ...prev,
      [selectedStudent.student_id]: {
        plan: updatedPlan,
        units: planUnits
      }
    }));
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
    const updatedPlan = { ...currentPlan, status: 'stored' };
    setCurrentPlan(updatedPlan);
    setAllStudentPlansMap(prev => ({
      ...prev,
      [selectedStudent.student_id]: {
        plan: updatedPlan,
        units: planUnits
      }
    }));
    setStoredPlansCount(prev => prev + 1);
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
        {/* Toast Notification Banner */}
        {notificationMsg && (
          <div className="fixed top-4 right-4 z-50 bg-[#008652] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold transition-all border border-emerald-700 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Header Bar */}
        <Navbar
          activeRole={activeRole}
          onRoleChange={(newRole) => {
            setActiveRole(newRole);
            if (newRole === 'student' && (activeTab === 'STORED' || activeTab === 'CATALOG')) {
              setActiveTab('STUDY_PLAN');
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
              onClose={() => setShowStudentSelectModal(false)}
              isModal={selectedStudent !== null}
            />
          )}

          {/* Executive Student Course Info Header (Shown only on STUDY_PLAN & ACADEMIC_HISTORY tabs) */}
          {(activeTab === 'STUDY_PLAN' || activeTab === 'ACADEMIC_HISTORY') && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl font-sans text-white transition-all relative overflow-hidden">
              {/* Subtle executive background accents */}
              <div className="absolute -right-16 -top-16 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div className="space-y-3">
                  {/* Major & Status Tags */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 bg-red-950/80 text-red-300 border border-red-800/60 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide">
                      <BookOpen className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Major: {selectedStudent?.course_name && selectedStudent.course_name.includes('Major:')
                        ? selectedStudent.course_name.split('Major:')[1].replace(')', '').trim()
                        : 'Artificial Intelligence'}</span>
                    </span>

                    {currentPlan?.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-3.5 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Plan Approved & Finalized
                      </span>
                    )}
                    {currentPlan?.status === 'agreed' && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-950/80 text-blue-300 border border-blue-800/60 px-3.5 py-1 rounded-full text-xs font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Student Agreed
                      </span>
                    )}
                    {currentPlan?.status === 'recommended' && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-950/80 text-amber-300 border border-amber-800/60 px-3.5 py-1 rounded-full text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Recommended to Student
                      </span>
                    )}
                    {(!currentPlan || currentPlan?.status === 'draft' || currentPlan?.status === 'stored') && (
                      <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-3.5 py-1 rounded-full text-xs font-semibold">
                        Official Draft Plan
                      </span>
                    )}
                  </div>

                  {/* Degree Title */}
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-heading">
                    Bachelor of Information Technology
                  </h1>

                  {/* Student Context Metadata Strip */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-0.5">
                    <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/90 px-3.5 py-1.5 rounded-xl">
                      <User className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="font-semibold text-white">
                        {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Alex Mercer'}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                        {selectedStudent ? selectedStudent.student_number : 'PT3-2026-001'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/90 px-3.5 py-1.5 rounded-xl text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Course Code: <strong className="text-white font-semibold font-mono">{selectedStudent ? selectedStudent.course_code : 'PT3-BSIT-AI01'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/90 px-3.5 py-1.5 rounded-xl text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{selectedStudent?.location_name || 'PT3 Solutions Singapore Campus'}</span>
                    </div>
                  </div>
                </div>

                {/* Total Degree Credit Meter Widget */}
                {(() => {
                  const calculatedCP = (planUnits || []).reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
                  const progressPct = Math.min(100, Math.round((calculatedCP / 72) * 100));

                  return (
                    <div className="bg-slate-800/90 border border-slate-700/90 p-5 rounded-2xl text-right shrink-0 min-w-[260px] shadow-sm relative">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                        <span>Degree Load Progress</span>
                        <span className="text-emerald-400 font-bold font-mono">{progressPct}%</span>
                      </div>

                      <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline justify-end gap-1.5 my-1">
                        <span className="tabular-nums font-mono">{calculatedCP}</span>
                        <span className="text-slate-400 font-medium text-xs font-mono">/ 72 CP</span>
                      </div>

                      {/* Dynamic Gradient Progress Bar */}
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/80 my-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                        <span>Target: 72 CP</span>
                        <span className="text-slate-300 font-semibold font-mono">{Math.max(0, 72 - calculatedCP)} CP remaining</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* View Component: STUDY_PLAN (Main Builder / Review) */}
          {activeTab === 'STUDY_PLAN' && (
            <PlanBuilder
              student={selectedStudent}
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
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Audit Log / Change Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-t-4 border-t-red-600 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative font-sans text-slate-900 dark:text-slate-100 transition-colors">
            <button
              onClick={() => setShowAuditModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shadow-2xs">
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

            {/* Audit Log Type Toggle */}
            <div className="flex items-center gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setAuditTab('data_audit')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  auditTab === 'data_audit'
                    ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Study Plan Data Audit Trail (NFR-07)
              </button>
              <button
                onClick={() => setAuditTab('system_spec')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  auditTab === 'system_spec'
                    ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Specification Change Log (Sec 18)
              </button>
            </div>

            {/* Change Log Entries */}
            <div className="space-y-3 max-h-80 overflow-y-auto text-xs font-sans pr-1">
              {auditTab === 'data_audit' ? (
                auditLogsList.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">No plan data audit logs recorded yet.</div>
                ) : (
                  auditLogsList.map((log, idx) => (
                    <div key={log.version_id || idx} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-[10px] font-bold">
                        <span className="bg-red-700 text-white px-2 py-0.5 rounded font-mono">
                          v{log.version_number || '1'} · {new Date(log.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] ${
                          log.plan_status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300' :
                          log.plan_status === 'agreed' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300' :
                          log.plan_status === 'recommended' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300' :
                          'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}>
                          {log.plan_status || 'STATUS CHANGED'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                        <span>Student: <strong>{log.first_name || 'Alex'} {log.last_name || 'Mercer'}</strong> ({log.student_number || 'PT3-2026-001'})</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">By: <strong>{log.created_by || 'Academic Chair'}</strong></span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        {log.amendment_reason || 'Study plan status update'}
                      </p>
                    </div>
                  ))
                )
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                      <span className="bg-red-600 text-white px-2 py-0.5 rounded">v1.1 · 15 SEP 2026</span>
                      <span className="text-slate-400 dark:text-slate-500">STATUS: ACTIVE RELEASE</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white font-heading">Executive Navigation & Clean Layout Update</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Integrated direct executive tab navigation and Student View selection sync across Academic Chair.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                      <span className="bg-slate-800 dark:bg-slate-700 text-white px-2 py-0.5 rounded">v1.0 · 14 SEP 2026</span>
                      <span className="text-slate-400 dark:text-slate-500">STABLE</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white font-heading">Core Engine & Database Release</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Created 11 database tables, rule validation engine, and StudyPlanVersion audit log table.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                      <span className="bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded">v0.1 · 09 SEP 2026</span>
                      <span className="text-slate-400 dark:text-slate-500">INITIAL SPEC</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white font-heading">Outsourced Development Requirements</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Initial outsourced development requirements document published by PT03.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-red-700 hover:bg-slate-800 dark:hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
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
          onClose={() => setShowImportModal(false)}
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
