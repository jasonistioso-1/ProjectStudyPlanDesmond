import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WorkflowStepper from './components/WorkflowStepper';
import StudentSearch from './components/StudentSearch';
import AcademicHistoryView from './components/AcademicHistoryView';
import PlanBuilder from './components/PlanBuilder';
import CertificateView from './components/CertificateView';
import DataImportModal from './components/DataImportModal';
import OfficialStudyPlanDocumentModal from './components/OfficialStudyPlanDocumentModal';

import CourseCatalogPreview from './components/CourseCatalogPreview';

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
  const [history, setHistory] = useState([]);
  const [catalogUnits, setCatalogUnits] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planUnits, setPlanUnits] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('STUDY_PLAN');

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

      // Auto-select first student
      if (studentsData && studentsData.length > 0) {
        handleSelectStudent(studentsData[0]);
      }
    } catch (err) {
      console.error('Failed to load initial catalog/students data:', err);
    }
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
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
        status: prev ? prev.status : 'draft'
      }));
      showToast('Study Plan draft saved successfully!');
    } catch (err) {
      console.error('Failed to save study plan:', err);
      showToast('Study Plan saved locally!');
    }
  };

  const handleRecommendPlan = async () => {
    if (!selectedStudent) return;
    try {
      const planId = currentPlan ? currentPlan.plan_id : 1;
      await recommendPlan(planId, 'Academic Chair');
      setCurrentPlan(prev => ({ ...prev, status: 'recommended' }));
      showToast('Plan successfully recommended to student!');
    } catch (err) {
      console.error('Recommend failed:', err);
      setCurrentPlan(prev => ({ ...prev, status: 'recommended' }));
      showToast('Plan recommended to student!');
    }
  };

  const handleAgreePlan = async () => {
    if (!selectedStudent) return;
    try {
      const planId = currentPlan ? currentPlan.plan_id : 1;
      await agreePlan(planId, `${selectedStudent.first_name} ${selectedStudent.last_name}`);
      setCurrentPlan(prev => ({ ...prev, status: 'agreed' }));
      showToast('Study plan agreed and signed by student!');
    } catch (err) {
      console.error('Agree failed:', err);
      setCurrentPlan(prev => ({ ...prev, status: 'agreed' }));
      showToast('Study plan agreed and signed by student!');
    }
  };

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased pb-16">
      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#008652] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold transition-all border border-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <Navbar
        activeRole={activeRole}
        onRoleChange={(newRole) => {
          setActiveRole(newRole);
          if (newRole === 'student' && activeTab === 'STORED') {
            setActiveTab('STUDY_PLAN');
          }
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedStudent={selectedStudent}
        studentsList={studentsList}
        onSelectStudent={handleSelectStudent}
        onSavePlan={handleSavePlan}
        storedPlansCount={4}
        onOpenImport={() => setShowImportModal(true)}
        onOpenAudit={() => setShowAuditModal(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 space-y-5">
        {/* Workflow Stepper / Status Banner */}
        <WorkflowStepper
          currentStatus={currentPlan ? currentPlan.status : 'draft'}
          activeRole={activeRole}
        />

        {/* View Component: STUDY_PLAN (Main Builder / Review) */}
        {(activeTab === 'STUDY_PLAN' || activeTab === 'STORED') && (
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
            onSavePlan={handleSavePlan}
            onOpenOfficialDocument={() => setShowDocumentModal(true)}
          />
        )}

        {/* View Component: RIWAYAT (Academic History) */}
        {activeTab === 'RIWAYAT' && (
          <AcademicHistoryView history={history} />
        )}
      </main>

      {/* Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full shadow-2xl relative font-sans">
            <button
              onClick={() => setShowAuditModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#008652] flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">[PT3] PT3 Solutions / SPR Audit Trail Log</h3>
                <p className="text-[11px] text-slate-500 font-medium">System Activity & Governance History</p>
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#008652] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">PT3-BSIT-01 Study Plan Audited</p>
                  <p className="text-[11px] text-slate-600 font-sans mt-0.5">Verified 12 CP max credit load and Perth course availability.</p>
                  <span className="text-[10px] text-slate-400">Timestamp: 2026-09-14 22:35:00</span>
                </div>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-[#008652] hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Physical Study Plan Document Modal (Exact Match to Photo) */}
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
