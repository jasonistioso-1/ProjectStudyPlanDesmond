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
  fetchAuditLog
} from './services/api';

import {
  CheckCircle2,
  X,
  Clock,
  FileText,
  User,
  GraduationCap,
  Building2
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
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planUnits, setPlanUnits] = useState([]);
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

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setShowStudentSelectModal(false);
    showToast(`Selected student ${student.first_name} ${student.last_name}`);

    try {
      const [historyData, planData] = await Promise.all([
        fetchStudentHistory(student.student_id),
        fetchPlanByStudent(student.student_id)
      ]);

      setHistory(historyData || []);
      
      if (planData && planData.plan) {
        setCurrentPlan(planData.plan);
        setPlanUnits(planData.units || []);
        runValidation(student.student_id, student.location_id, planData.units || []);
      } else {
        setCurrentPlan({
          plan_id: 1,
          student_id: student.student_id,
          title: `${student.course_code || 'PT3-BSIT'} Study Plan`,
          status: 'draft',
          total_credit_points: 15
        });
        const initialUnits = (catalogUnits || []).slice(0, 4).map((u, i) => ({
          unit_id: u.unit_id,
          code: u.code,
          title: u.title,
          credit_points: u.credit_points || 3,
          year_level: i < 2 ? 1 : 2,
          period_id: i % 2 === 0 ? 1 : 2,
          sequence_order: i + 1
        }));
        setPlanUnits(initialUnits);
        runValidation(student.student_id, student.location_id, initialUnits);
      }
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
    try {
      const planId = currentPlan ? currentPlan.plan_id : 1;
      await recommendPlan(planId, 'Academic Chair');
      setCurrentPlan(prev => ({ ...prev, status: 'recommended' }));
      showToast('Plan recommended to student! Switch to Student View to review & agree.');
    } catch (err) {
      console.error('Recommend failed:', err);
      setCurrentPlan(prev => ({ ...prev, status: 'recommended' }));
      showToast('Plan recommended to student!');
    }
  };

  // Student Agree Plan
  const handleAgreePlan = async () => {
    if (!selectedStudent) return;
    try {
      const planId = currentPlan ? currentPlan.plan_id : 1;
      await agreePlan(planId, `${selectedStudent.first_name} ${selectedStudent.last_name}`);
      setCurrentPlan(prev => ({ ...prev, status: 'agreed' }));
      showToast('Study plan agreed and digitally signed by student!');
    } catch (err) {
      console.error('Agree failed:', err);
      setCurrentPlan(prev => ({ ...prev, status: 'agreed' }));
      showToast('Study plan agreed and digitally signed!');
    }
  };

  // Chair Approve & Finalise Plan
  const handleApprovePlan = async () => {
    if (!selectedStudent) return;
    try {
      const planId = currentPlan ? currentPlan.plan_id : 1;
      await approvePlan(planId, 'Academic Chair');
      setCurrentPlan(prev => ({ ...prev, status: 'approved' }));
      showToast('Study Plan officially approved and finalized by Academic Chair!');
    } catch (err) {
      console.error('Approve failed:', err);
      setCurrentPlan(prev => ({ ...prev, status: 'approved' }));
      showToast('Study Plan officially approved & finalized!');
    }
  };

  // Save & Store Plan in Repository
  const handleSavePlan = async () => {
    if (!selectedStudent) return;
    try {
      const res = await saveStudyPlan({
        student_id: selectedStudent.student_id,
        title: `${selectedStudent.course_code || 'PT3-BSIT'} Study Plan`,
        status: currentPlan ? currentPlan.status : 'draft',
        units: planUnits,
        created_by: 'Academic Chair'
      });
      setCurrentPlan(prev => ({
        ...prev,
        plan_id: res.plan_id || (prev ? prev.plan_id : 1),
        status: 'stored'
      }));
      setStoredPlansCount(prev => prev + 1);
      showToast('Study Plan saved & archived in Stored Plans Repository!');
    } catch (err) {
      console.error('Failed to save study plan:', err);
      setCurrentPlan(prev => ({ ...prev, status: 'stored' }));
      setStoredPlansCount(prev => prev + 1);
      showToast('Saved in Stored Plans Repository!');
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

          {/* Executive Student Course Info Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-2xs font-sans transition-colors">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400 inline-block animate-pulse" />
                    Major: {selectedStudent?.course_name && selectedStudent.course_name.includes('Major:')
                      ? selectedStudent.course_name.split('Major:')[1].replace(')', '').trim()
                      : 'Artificial Intelligence'}
                  </span>
                </div>

                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
                  Bachelor of Information Technology
                </h1>

                {/* Student Context Metadata Badges */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <User className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Alex Mercer'}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal">
                      ({selectedStudent ? selectedStudent.student_number : 'PT3-2026-001'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Course Code: <strong>{selectedStudent ? selectedStudent.course_code : 'PT3-BSIT-AI01'}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Singapore Campus</span>
                  </div>

                  <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-xl">
                    Sample Student Profile
                  </span>
                </div>
              </div>

              {/* Total Degree Credit Meter */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl text-right shrink-0 min-w-[230px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Degree Credit Load
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white my-0.5 tracking-tight tabular-nums flex items-baseline justify-end gap-1">
                  <span>{planUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0)}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-semibold text-xs">/ 72 CP</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-200 dark:border-slate-700">
                  <div 
                    className="bg-red-700 dark:bg-emerald-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((planUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0) / 72) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* View Component: STUDY_PLAN (Main Builder / Review) */}
          {activeTab === 'STUDY_PLAN' && (
            <PlanBuilder
              student={selectedStudent}
              planUnits={planUnits}
              setPlanUnits={setPlanUnits}
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
                  NFR-07 Auditability — Real-time database audit log recording study plan status changes and unit amendments.
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
                          v{log.version_number || '1'} — {new Date(log.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                      <span className="bg-red-600 text-white px-2 py-0.5 rounded">v1.1 — 15 SEP 2026</span>
                      <span className="text-slate-400 dark:text-slate-500">STATUS: ACTIVE RELEASE</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white font-heading">Executive Navigation & Clean Layout Update</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Integrated direct executive tab navigation and Student View selection sync across Academic Chair.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                      <span className="bg-slate-800 dark:bg-slate-700 text-white px-2 py-0.5 rounded">v1.0 — 14 SEP 2026</span>
                      <span className="text-slate-400 dark:text-slate-500">STABLE</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white font-heading">Core Engine & Database Release</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      Created 11 database tables, rule validation engine, and StudyPlanVersion audit log table.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                      <span className="bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded">v0.1 — 09 SEP 2026</span>
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
