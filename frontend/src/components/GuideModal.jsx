import React, { useState } from 'react';
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
  Sparkles,
  Building2,
  Calendar,
  Lock,
  RotateCcw
} from 'lucide-react';

export default function GuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('chair_workflow'); // 'chair_workflow' | 'student_workflow' | 'architecture_erd' | 'handover_deploy'

  if (!isOpen) return null;

  const databaseEntities = [
    { name: 'Student', count: '1', desc: 'Stores student profile records, student number (PT3-2026-001), major course_id, location_id, and commencement year.', schema: 'student_id (PK), student_number, first_name, last_name, email, course_id (FK), location_id (FK), commencement_year, study_status' },
    { name: 'Course', count: '2', desc: 'Defines official degree programs and majors (AI, CS, BIS) with required total credit points (72 CP).', schema: 'course_id (PK), code, name, degree_level, total_credit_points' },
    { name: 'Unit', count: '3', desc: 'Catalogue of all academic units, unit codes (e.g. ICT159), title, credit points (3 CP), and level (100, 200, 300).', schema: 'unit_id (PK), code, title, credit_points, level' },
    { name: 'UnitOffering', count: '4', desc: 'Maps active unit availability to specific campuses, teaching periods, and year versions.', schema: 'offering_id (PK), unit_id (FK), location_id (FK), period_id (FK), year_version, delivery_mode, is_active' },
    { name: 'Prerequisite', count: '5', desc: 'Stores strict prerequisite rules between units (BR-02 rule engine enforcement).', schema: 'prereq_id (PK), unit_id (FK), prereq_unit_id (FK), min_grade, is_concurrent_allowed' },
    { name: 'StudentUnitHistory', count: '6', desc: 'Records student academic history (completed units with grades/marks, attempted failures, and current enrollments).', schema: 'history_id (PK), student_id (FK), unit_id (FK), status, grade, mark, period_id (FK), year_taken' },
    { name: 'StudyPlan', count: '7', desc: 'Stores student multi-year study plans and governance workflow states (Draft → Recommended → Agreed → Approved).', schema: 'plan_id (PK), student_id (FK), title, status, total_credit_points, created_by, recommended_at, agreed_at, approved_at' },
    { name: 'StudyPlanUnit', count: '8', desc: 'Junction table mapping scheduled units inside a study plan to specific years (Year 1..3) and teaching periods.', schema: 'plan_unit_id (PK), plan_id (FK), unit_id (FK), period_id (FK), year_level, sequence_order, credit_points' },
    { name: 'StudyPlanVersion', count: '9', desc: 'NFR-07 Audit Trail recording complete version history and amendment logs whenever a plan status changes.', schema: 'version_id (PK), plan_id (FK), version_number, plan_status, amendment_reason, created_by, created_at' },
    { name: 'TeachingPeriod', count: '10', desc: 'Defines academic study periods (Semester 1 & 2, Trimester 1, 2 & 3, Winter, Summer terms).', schema: 'period_id (PK), code, name, period_type, sequence_order, start_date, end_date' },
    { name: 'Location', count: '11', desc: 'Stores PT3 Solutions university campus locations (Main Perth, Singapore, Dubai, Online).', schema: 'location_id (PK), code, name' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-700 rounded-xl shadow-2xs">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight font-heading">
                  PT3 Solutions — Study Plan Repository System Guide
                </h2>
                <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                  Section 5 & NFR-07 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Executive operational manual, rule engine workflow guide, and 11-table relational database architecture specs.
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

        {/* Tab Navigation Bar */}
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
            <span>Academic Chair Workflow</span>
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

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs space-y-6">

          {/* TAB 1: ACADEMIC CHAIR WORKFLOW GUIDE */}
          {activeTab === 'chair_workflow' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4.5 rounded-xl flex items-start gap-3.5 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm font-heading">Academic Chair Administrative Role & Governance Workflow</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-xs">
                    As an Academic Chair, you manage student enrollment sequences, build multi-year degree study plans, execute real-time prerequisite rule checks, switch study schedules (Semester vs Trimester), recommend proposed plans, and issue final approvals.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-700 text-white font-mono text-[10px] px-2.5 py-0.5 rounded font-bold">STEP 1</span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">Student Directory</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">Select Student & View History</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs font-medium">
                    Click <strong>Select Student</strong> to pick a student from the directory (e.g. Alex Mercer, PT3-2026-001). The system automatically loads their course major, completed unit history, and grade transcript.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-700 text-white font-mono text-[10px] px-2.5 py-0.5 rounded font-bold">STEP 2</span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">Study Plan Canvas</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">Drag & Drop Unit Sequence</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs font-medium">
                    Drag units from the left catalog palette into teaching period slots across 3 academic years. Toggle between <strong>Semester</strong> and <strong>Trimester</strong> layout views seamlessly.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-700 text-white font-mono text-[10px] px-2.5 py-0.5 rounded font-bold">STEP 3</span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">Validation Console</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">Automated Rule Engine Checks</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs font-medium">
                    The rule engine automatically validates prerequisite completion (BR-02), campus availability (BR-01), and semester credit load limits (Max 12 CP per period) in real-time.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="bg-red-700 text-white font-mono text-[10px] px-2.5 py-0.5 rounded font-bold">STEP 4</span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">Approval & Audit Trail</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs font-heading">Recommend, Approve & Audit</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs font-medium">
                    Click <strong>Recommend to Student</strong>. Once the student digitally signs off, click <strong>Final Approve Plan</strong> to log version history in the StudyPlanVersion database audit trail.
                  </p>
                </div>
              </div>

              {/* Real-time Sync & Change Log Box */}
              <div className="bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-4 rounded-xl space-y-2 shadow-2xs">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-2 font-heading">
                  <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Real-Time Database Sync & NFR-07 Audit Log Compliance
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                  • <strong>Real-Time Synchronization</strong>: All plan modifications, unit movements, layout switches, and workflow state transitions instantly update in the database without page refresh.<br />
                  • <strong>NFR-07 Audit Trail</strong>: Every state change (Draft → Recommended → Agreed → Approved) records a version snapshot in the <code>StudyPlanVersion</code> table accessible via the <strong>Change Log</strong> button.
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
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm font-heading">Student Portal Review & Digital Agreement Sign-Off</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-xs">
                    Students can log into their dedicated review portal to inspect recommended study sequences, check degree progress (72 CP target), digitally sign off on proposed study plans, and export official summary documents.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white font-heading text-xs">1. View Perspective Toggle</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-xs font-medium">
                      Switch between <strong>Academic Chair View</strong> and <strong>Student View</strong> using the header role toggle pill.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white font-heading text-xs">2. Inspect Recommended Sequence</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-xs font-medium">
                      Review proposed units scheduled across 3 academic years (Year 1, 2, 3) to ensure workload balance (12 CP per semester) meets graduation targets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white font-heading text-xs">3. Digital Sign-Off Confirmation</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-xs font-medium">
                      Check the digital sign-off agreement box and click <strong>Submit Digital Sign-Off</strong> to transition the plan state to <code>AGREED</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white font-heading text-xs">4. Export PDF / Image Study Plan</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-xs font-medium">
                      Click <strong>Export PDF / Image</strong> to generate and print an official university formatted study plan document.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM ARCHITECTURE & 11 DATABASE ENTITIES */}
          {activeTab === 'architecture_erd' && (
            <div className="space-y-6">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 font-heading">
                    <Cpu className="w-4 h-4 text-red-600 dark:text-red-400" /> Technical Architecture & Database Specifications
                  </h3>
                  <span className="bg-red-700 text-white font-mono text-[10px] font-bold px-2.5 py-0.5 rounded shadow-2xs">
                    11 CORE DATABASE ENTITIES
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                  The Study Plan Repository (SPR) data model implements <strong>exactly 11 core database tables</strong> matching Section 5 Data Model requirements. It provides complete auditability (NFR-07), multi-campus offerings, multi-year progression, and prerequisite enforcement.
                </p>
              </div>

              {/* 11 Database Entities Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-heading flex items-center gap-2">
                    <Table className="w-4 h-4 text-red-600 dark:text-red-400" />
                    Section 5 Minimum Database Entities (11 Tables)
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                    MySQL 8.0 / PostgreSQL Compliant
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

              {/* Technology Stack summary boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block mb-1 font-heading">Frontend Layer</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium block">React 18 SPA, Vite, TailwindCSS, @dnd-kit Core Drag & Drop</span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block mb-1 font-heading">REST API Engine</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium block">Node.js Express Server, CORS, Excel/CSV Parser, Rule Engine Validation</span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block mb-1 font-heading">Relational Store</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium block">MySQL 8.0 Container with Foreign Keys & Cascading Audit Versioning</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETUP & DOCKER INSTALLATION */}
          {activeTab === 'handover_deploy' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-2xs">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2 font-heading">
                  <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Docker Orchestration Launch Command
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                  To build and launch all 3 microservices (Database, Backend API, and Frontend web client) in Docker containers, execute:
                </p>
                <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono text-xs select-all border border-slate-800 shadow-inner">
                  docker-compose up -d --build
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block font-heading">Environment Config (.env)</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-medium">
                    Configure port allocations and database connection parameters in <code>backend/.env</code> (PORT=3000, DB_HOST=spr-db, DB_USER=root).
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block font-heading">Sample Registered Dataset</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-medium">
                    Includes 4 registered student profiles across official degree majors (AI, CS, BIS) ready for testing and validation.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
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
