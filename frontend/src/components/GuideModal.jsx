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
  Key,
  Terminal,
  Cpu,
  ArrowRight
} from 'lucide-react';

export default function GuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('chair_workflow'); // 'chair_workflow' | 'student_workflow' | 'architecture_erd' | 'handover_deploy'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden font-sans transition-colors">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-xl">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight font-heading flex items-center gap-2">
                PT3 Solutions SPR — Comprehensive User Guide & System Handover
              </h2>
              <p className="text-xs text-slate-300 font-normal">
                Study Plan Repository System Documentation, Workflows & Architecture (ICT302 Handover)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('chair_workflow')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t-2 ${
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
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t-2 ${
              activeTab === 'student_workflow'
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-t-red-600 border-x border-slate-200 dark:border-slate-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-t-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Student Workflow</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture_erd')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t-2 ${
              activeTab === 'architecture_erd'
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-t-red-600 border-x border-slate-200 dark:border-slate-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-t-transparent'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Architecture & ERD</span>
          </button>

          <button
            onClick={() => setActiveTab('handover_deploy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t-2 ${
              activeTab === 'handover_deploy'
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-t-red-600 border-x border-slate-200 dark:border-slate-800 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-t-transparent'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Deployment & Handover</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs space-y-6">

          {/* TAB 1: ACADEMIC CHAIR WORKFLOW */}
          {activeTab === 'chair_workflow' && (
            <div className="space-y-5">
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Academic Chair Administrative Role</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    The Academic Chair possesses elevated authority to structure, validate, recommend, and officially approve study plans for all registered students across PT3 Solutions campuses.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">STEP 1</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Select Student & View History</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    Click <strong>Select Student</strong> in the navbar to choose from registered sample students (Alex Mercer, Sarah Jenkins, Michael Chang, Emily Watson). The system loads their academic transcript, passed units, and failed/attempted courses.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">STEP 2</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Build & Drag Unit Sequence</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    Drag units from the left <strong>Course Unit Palette</strong> into teaching period slots. Switch seamlessly between <strong>Semester</strong> and <strong>Trimester</strong> view mode. Maximum 12 Credit Points per period limit is automatically calculated.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">STEP 3</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Real-Time Validation Warnings</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    The validation engine automatically checks <strong>BR-01 Unit Offering Mismatch</strong> (e.g. Capstone in T3) and <strong>BR-02 Unmet Prerequisites</strong>. Visual alert cards appear on affected unit cards without hiding details.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">STEP 4</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Recommend & Approve Plan</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    Click <strong>Recommend Plan to Student</strong> to send the proposed structure for student review. Once agreed by the student, the Chair can click <strong>Approve & Archive Plan</strong> to finalize version history.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT WORKFLOW */}
          {activeTab === 'student_workflow' && (
            <div className="space-y-5">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-4 rounded-xl flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Student View & Digital Sign-Off</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    Students can review their personal academic history, inspect recommended study plans, provide digital agreement sign-off, and export official plan documents.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Role Switching</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      Use the <strong>Academic Chair / Student View</strong> toggle in the top bar to simulate the student's experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Reviewing Recommended Plan</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      Students can inspect unit distribution across semesters/trimesters and verify how their completed units contribute toward the 72 Credit Point graduation target.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Digital Sign-Off Agreement</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      Check the <strong>Student Digital Sign-off Agreement</strong> checkbox and click <strong>Submit Agreement</strong> to update status to <span className="text-blue-600 font-bold">STUDENT AGREED</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Official Study Plan PDF Export</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      Click <strong>Export Document</strong> to generate an official branded study plan summary document for printing or archiving.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & ERD */}
          {activeTab === 'architecture_erd' && (
            <div className="space-y-5">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-700">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-red-600" /> Technology Stack Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">Frontend</span>
                    <span className="text-slate-500 text-[11px]">React 18 + Vite + TailwindCSS + @dnd-kit</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">Backend API</span>
                    <span className="text-slate-500 text-[11px]">Node.js + Express.js (REST API Services)</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block">Database</span>
                    <span className="text-slate-500 text-[11px]">MySQL 8.0 / PostgreSQL 15 (ORM Ready)</span>
                  </div>
                </div>
              </div>

              {/* Entity Relationship Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Database Schema Entities (ERD Summary)</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1">
                  <div><span className="text-red-400">Student</span> (student_id PK, student_number, name, email, course_id FK, location_id FK)</div>
                  <div><span className="text-red-400">Course</span> (course_id PK, code, name, degree_level, total_credit_points)</div>
                  <div><span className="text-red-400">Unit</span> (unit_id PK, code, title, credit_points, level)</div>
                  <div><span className="text-red-400">UnitOffering</span> (offering_id PK, unit_id FK, location_id FK, period_id FK, year_version)</div>
                  <div><span className="text-red-400">Prerequisite</span> (prereq_id PK, unit_id FK, prereq_unit_id FK, min_grade)</div>
                  <div><span className="text-red-400">StudyPlan</span> (plan_id PK, student_id FK, title, status, total_credit_points)</div>
                  <div><span className="text-red-400">StudyPlanUnit</span> (plan_unit_id PK, plan_id FK, unit_id FK, period_id FK, year_level)</div>
                  <div><span className="text-red-400">StudyPlanVersion</span> (version_id PK, plan_id FK, version_number, amendment_reason)</div>
                  <div><span className="text-red-400">StudentUnitHistory</span> (history_id PK, student_id FK, unit_id FK, status, grade, mark)</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEPLOYMENT & HANDOVER */}
          {activeTab === 'handover_deploy' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" /> Docker One-Command Launch (PT03 Account Ready)
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Execute the following command in the workspace root to compile frontend assets, launch Node Express REST API, and initialize MySQL database:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] select-all">
                  docker-compose up -d --build
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Environment Configuration Template</span>
                  <p className="text-slate-500 text-[11px]">
                    See <code>.env.example</code> in root. Copy to <code>.env</code> with target database credentials (PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Sample Registered Dataset (4 Students)</span>
                  <p className="text-slate-500 text-[11px]">
                    Alex Mercer (#101 Approved), Sarah Jenkins (#102 Agreed), Michael Chang (#103 Recommended), Emily Watson (#104 Draft).
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            PT3 Solutions Study Plan Repository System v2.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-red-700 hover:bg-slate-800 dark:hover:bg-red-600 text-white font-bold rounded-lg transition-all"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
