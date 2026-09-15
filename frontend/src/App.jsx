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
  approvePlan
} from './services/api';

import {
  CheckCircle2,
  X,
  Clock,
  FileText
} from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState('chair'); // 'chair' | 'student'
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [catalogUnits, setCatalogUnits] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planUnits, setPlanUnits] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('STUDY_PLAN');
  const [storedPlansCount, setStoredPlansCount] = useState(4);

  // Modals
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [unitsData, periodsData, studentsData] = await Promise.all([
        fetchCatalogUnits(),
        fetchTeachingPeriods(),
        fetchStudents('')
      ]);
      setCatalogUnits(unitsData || []);
      setPeriods(periodsData || []);
      setStudentsList(studentsData || []);

      // Prompt student selection if list available
      if (studentsData && studentsData.length > 0) {
        handleSelectStudent(studentsData[0]);
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
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col justify-between">
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

          {/* Student Course Info Header */}
          <div className="bg-gradient-to-r from-white via-slate-50/60 to-red-50/20 border border-slate-200/90 p-5 rounded-2xl shadow-xs font-sans relative overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-slate-900" />
            
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-5 pt-0.5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="bg-red-700 text-white font-semibold text-[11px] px-3 py-0.5 rounded-full shadow-2xs tracking-wide">
                    {selectedStudent ? selectedStudent.course_code : 'PT3-BSIT-01'}
                  </span>
                  <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Perth Main Campus
                  </span>
                </div>

                <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 font-heading">
                  Bachelor of Information Technology
                  <span className="text-slate-500 font-normal text-sm md:text-base ml-2 inline-block">(Major: Software & Systems)</span>
                </h1>

                <div className="text-xs text-slate-500 font-medium flex items-center gap-3 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-400">Student:</span>
                    <strong className="text-slate-900 font-semibold">{selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Alex Mercer'}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-slate-400">ID:</span>
                    <strong className="text-slate-800 font-medium tracking-tight bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200/80">
                      {selectedStudent ? selectedStudent.student_number : 'PT3-2026-001'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Total Degree Credit Meter */}
              <div className="bg-white/90 border border-slate-200/90 p-4 rounded-xl text-right shrink-0 min-w-[210px] shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Planned Credit Load
                </div>
                <div className="text-lg font-bold text-slate-900 my-0.5 tracking-tight tabular-nums flex items-baseline justify-end gap-1">
                  <span className="text-slate-900 text-xl font-extrabold">{planUnits.reduce((sum, u) => sum + (u.credit_points || 3), 0)}</span>
                  <span className="text-slate-400 font-semibold text-xs">/ 72 CP</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 p-0.5 border border-slate-100">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-slate-900 h-full rounded-full transition-all duration-500" 
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
            <CourseCatalogPreview />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Audit Log / Change Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-t-4 border-t-red-600 border border-slate-200 rounded-xl p-6 max-w-lg w-full shadow-2xl relative font-sans">
            <button
              onClick={() => setShowAuditModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">PT3 Solutions — System Change Log & Audit Trail</h3>
                <p className="text-[11px] text-slate-500 font-medium">ICT302 Specification Versioning History</p>
              </div>
            </div>

            {/* Change Log Entries */}
            <div className="space-y-3 max-h-72 overflow-y-auto text-xs font-sans pr-1">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded">v1.1 — 15 SEP 2026</span>
                  <span className="text-slate-400">STATUS: ACTIVE RELEASE</span>
                </div>
                <p className="font-bold text-slate-900">Executive Navigation & Clean Layout Update</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Removed cluttered workflow stepper bar. Integrated direct executive tab navigation (Plan Builder, Academic History, Stored Plans, Course Catalog) for Academic Chair.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                  <span className="bg-slate-800 text-white px-2 py-0.5 rounded">v1.0 — 14 SEP 2026</span>
                  <span className="text-slate-400">STABLE</span>
                </div>
                <p className="font-bold text-slate-900">Core Engine & MySQL Database Release</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Created 11 MySQL database tables, rule validation engine (`validationEngine.js`), Express endpoints, and React drag-and-drop plan builder.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold mb-1">
                  <span className="bg-slate-300 text-slate-800 px-2 py-0.5 rounded">v0.1 — 09 SEP 2026</span>
                  <span className="text-slate-400">INITIAL SPEC</span>
                </div>
                <p className="font-bold text-slate-900">Outsourced Development Requirements</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Initial requirements drafted following client meeting with PT03 team and Peter.
                </p>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-xs"
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
    </div>
  );
}
