import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  UserCheck,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Server,
  FileText,
  Terminal,
  Cpu,
  Table,
  Check,
  Clock,
  ArrowRight,
  Building2,
  Calendar,
  Lock,
  RotateCcw
} from 'lucide-react';

export default function GuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('chair_workflow');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const databaseEntities = [
    { count: '1', name: 'Student', desc: 'Student profile details, student number (PT3-2026-001), degree major, and campus location.', schema: 'student_id (PK), student_number, first_name, last_name, email, course_id (FK), location_id (FK)' },
    { count: '2', name: 'Course', desc: 'Official degree programs and majors (AI, Computer Science, BIS) with 72 credit point target.', schema: 'course_id (PK), code, name, degree_level, total_credit_points' },
    { count: '3', name: 'Unit', desc: 'Course catalog of subjects (e.g. ICT159), titles, credit points (3 CP), and level details.', schema: 'unit_id (PK), code, title, credit_points, level' },
    { count: '4', name: 'UnitOffering', desc: 'Availability of units per campus, year, and teaching period (Semester vs Trimester).', schema: 'offering_id (PK), unit_id (FK), location_id (FK), period_id (FK), year_version' },
    { count: '5', name: 'Prerequisite', desc: 'Prerequisite requirements between subjects enforced by the validation engine.', schema: 'prereq_id (PK), unit_id (FK), prereq_unit_id (FK), min_grade' },
    { count: '6', name: 'StudentUnitHistory', desc: 'Academic history records including passed units, grades, marks, and current enrollments.', schema: 'history_id (PK), student_id (FK), unit_id (FK), status, grade, mark' },
    { count: '7', name: 'StudyPlan', desc: 'Active multi-year study plans and approval workflow status (Draft, Recommended, Agreed, Approved).', schema: 'plan_id (PK), student_id (FK), title, status, total_credit_points, created_by' },
    { count: '8', name: 'StudyPlanUnit', desc: 'Scheduled subjects inside a plan mapped to specific study years and teaching periods.', schema: 'plan_unit_id (PK), plan_id (FK), unit_id (FK), period_id (FK), year_level' },
    { count: '9', name: 'StudyPlanVersion', desc: 'Audit trail records logging every change and version update made to a study plan.', schema: 'version_id (PK), plan_id (FK), version_number, plan_status, amendment_reason' },
    { count: '10', name: 'TeachingPeriod', desc: 'Study terms including Semesters (S1, S2) and Trimesters (T1, T2, T3).', schema: 'period_id (PK), code, name, period_type, sequence_order' },
    { count: '11', name: 'Location', desc: 'University campus locations (Singapore, Perth, Dubai, Online).', schema: 'location_id (PK), code, name' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden transition-colors"
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-700 rounded-xl shadow-2xs">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight font-heading">
                  PT3 Solutions User Guide & System Manual
                </h2>
                <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                  Official Manual
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Simple step-by-step guide to help Academic Chairs and Students build, review, and approve degree study plans.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 gap-2 pt-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('chair_workflow')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t-2 shrink-0 ${
              activeTab === 'chair_workflow'
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-t-red-600 border-x border-slate-200 dark:border-slate-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-t-transparent'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Academic Chair Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('student_workflow')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t-2 shrink-0 ${
              activeTab === 'student_workflow'
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-t-red-600 border-x border-slate-200 dark:border-slate-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-t-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Student Review & Sign-Off</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture_erd')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t-2 shrink-0 ${
              activeTab === 'architecture_erd'
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-t-red-600 border-x border-slate-200 dark:border-slate-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-t-transparent'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>System Architecture (11 Tables)</span>
          </button>

          <button
            onClick={() => setActiveTab('handover_deploy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t-2 shrink-0 ${
              activeTab === 'handover_deploy'
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-t-red-600 border-x border-slate-200 dark:border-slate-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-t-transparent'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Setup & Docker Installation</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs space-y-6">

          {/* TAB 1: CHAIR GUIDE */}
          {activeTab === 'chair_workflow' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4.5 rounded-xl flex items-start gap-3.5 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm font-heading">Academic Chair Quick Workflow</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-xs">
                    As an Academic Chair, you can select student profiles, structure their subjects across semesters or trimesters, run automated rule checks, and approve final study plans.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-700 text-white font-mono text-[10px] px-2.5 py-0.5 rounded font-bold">1. SELECT STUDENT</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">Pick a Student Profile</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs font-medium">
                    Click <strong>Select Student</strong> in the top navigation bar to choose a student (such as Alex Mercer). The system immediately displays their degree major, completed subjects, and transcript history.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-700 text-white font-mono text-[10px] px-2.5 py-0.5 rounded font-bold">2. BUILD PLAN</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">Drag & Drop Subjects</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs font-medium">
                    Drag subjects from the course catalog on the left into semester or trimester slots across Year 1, Year 2, and Year 3.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-700 text-white font-mono text-[10px] px-2.5 py-0.5 rounded font-bold">3. VALIDATE RULES</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">Automatic Rule Checker</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs font-medium">
                    The rule checker automatically alerts you if required prerequisite subjects are missing or if a semester load exceeds 12 credit points.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-700 text-white font-mono text-[10px] px-2.5 py-0.5 rounded font-bold">4. APPROVE & ARCHIVE</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">Recommend & Approve</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs font-medium">
                    Click <strong>Recommend to Student</strong>. Once the student reviews and signs off, click <strong>Final Approve Plan</strong> to complete the process.
                  </p>
                </div>
              </div>

              {/* Data Sync info */}
              <div className="bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-4 rounded-xl space-y-2 shadow-2xs">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-2 font-heading">
                  <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Real-Time Data Sync & Audit Logging
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                  • <strong>Real-Time Updates</strong>: Subject additions, semester switches, and plan status changes update instantly across all screens.<br />
                  • <strong>Audit History</strong>: Every status update (Draft, Recommended, Agreed, Approved) is recorded in the audit log so you can review version history anytime.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT GUIDE */}
          {activeTab === 'student_workflow' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4.5 rounded-xl flex items-start gap-3.5 shadow-2xs">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm font-heading">Student Portal Review Guide</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-xs">
                    Students can inspect their recommended study plan, verify total credit points (72 CP target), digitally sign off on their plan, and download official PDF copies.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white font-heading text-xs">1. View Perspective</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-xs font-medium">
                      Use the role toggle at the top of the navigation bar to switch between Academic Chair View and Student View.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white font-heading text-xs">2. Review Subjects</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-xs font-medium">
                      Check your scheduled subjects for Year 1, Year 2, and Year 3 to ensure the workload suits your timetable.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white font-heading text-xs">3. Digital Sign-Off</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-xs font-medium">
                      Tick the digital sign-off agreement box and click <strong>Submit Digital Sign-Off</strong> to confirm your agreement.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white font-heading text-xs">4. Export Document</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-xs font-medium">
                      Click <strong>Export PDF / Image</strong> to view or print your official formatted study plan document.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & 11 TABLES */}
          {activeTab === 'architecture_erd' && (
            <div className="space-y-6">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 font-heading">
                    <Cpu className="w-4 h-4 text-red-600 dark:text-red-400" /> System Architecture & Database Structure
                  </h3>
                  <span className="bg-red-700 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded shadow-2xs">
                    11 CORE TABLES
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                  The Study Plan Repository is built on <strong>11 core database tables</strong> that manage student profiles, course catalogs, prerequisite rules, study plans, audit history, and multi-campus offerings.
                </p>
              </div>

              {/* 11 Database Entities Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-heading flex items-center gap-2">
                    <Table className="w-4 h-4 text-red-600 dark:text-red-400" />
                    Database Tables (11 Entities)
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                    MySQL / PostgreSQL Compatible
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs font-sans border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[11px] font-mono uppercase">
                        <th className="py-2.5 px-3.5 w-12 text-center">#</th>
                        <th className="py-2.5 px-3.5 w-44 font-bold">Database Entity</th>
                        <th className="py-2.5 px-3.5">Description & Purpose</th>
                        <th className="py-2.5 px-3.5 font-mono text-[10px]">Primary Key & Attributes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {databaseEntities.map((ent) => (
                        <tr key={ent.count} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="py-2.5 px-3.5 text-center font-mono font-bold text-red-600 dark:text-red-400 text-[11px]">{ent.count}</td>
                          <td className="py-2.5 px-3.5 font-bold font-mono text-slate-900 dark:text-white text-xs">{ent.name}</td>
                          <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300 font-medium text-xs leading-relaxed">{ent.desc}</td>
                          <td className="py-2.5 px-3.5 font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 font-semibold">{ent.schema}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tech Stack Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block mb-1 font-heading">Frontend</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium block">React 18, Vite, TailwindCSS, @dnd-kit Drag & Drop</span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block mb-1 font-heading">Backend REST API</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium block">Node.js Express Server with Rule Engine Validation</span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block mb-1 font-heading">Database</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium block">MySQL 8.0 / PostgreSQL with Foreign Keys & Version History</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETUP */}
          {activeTab === 'handover_deploy' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-2xs">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 font-heading">
                  <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Docker Launch Command
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                  To start all services (Database, Backend API, and Frontend) in Docker, run:
                </p>
                <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono text-xs select-all border border-slate-800 shadow-inner">
                  docker-compose up -d --build
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block font-heading">Environment Config</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-medium">
                    Configure ports and database settings in <code>backend/.env</code>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block font-heading">Pre-loaded Profiles</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-medium">
                    Includes 4 registered student profiles across official degree majors (AI, CS, BIS).
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] font-semibold">
            PT3 Solutions Study Plan Repository System
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-red-700 hover:bg-slate-800 dark:hover:bg-red-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-2xs"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
