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
  Cpu
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
            <div className="p-2.5 bg-red-700 rounded-xl shadow-2xs">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight font-heading flex items-center gap-2">
                PT3 Solutions — Study Plan Repository User Guide
              </h2>
              <p className="text-xs text-slate-300 font-normal">
                Interactive guide for Academic Chairs and Students to construct, validate, and manage degree study plans.
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
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 gap-2 pt-2 overflow-x-auto no-scrollbar">
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
            <span>Student Guide</span>
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
            <span>System Architecture</span>
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
            <span>Setup & Installation</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs space-y-6">

          {/* TAB 1: ACADEMIC CHAIR GUIDE */}
          {activeTab === 'chair_workflow' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Academic Chair Administrative Role</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    As an Academic Chair, you can select registered students, review their academic records, build personalized multi-year study plans, verify prerequisites, recommend proposed plans, and grant final approval.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">STEP 1</span>
                    <span className="text-[10px] text-slate-400 font-mono">Student Directory</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Select Student & View Transcript</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Click <strong>Select Student</strong> in the navigation bar to pick a student from the directory. The system automatically loads their course details, completed units, and academic history.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">STEP 2</span>
                    <span className="text-[10px] text-slate-400 font-mono">Plan Canvas</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Build & Drag Unit Sequence</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Drag units from the left course palette into teaching period slots. Easily switch between <strong>Semester</strong> and <strong>Trimester</strong> view options according to your campus schedule.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">STEP 3</span>
                    <span className="text-[10px] text-slate-400 font-mono">Validation Checks</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Real-Time Validation Alerts</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    The validation system automatically checks unit availability for the selected period and verifies whether required prerequisite units have been passed before enrolling in advanced units.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">STEP 4</span>
                    <span className="text-[10px] text-slate-400 font-mono">Approval Workflow</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Recommend & Approve Plan</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Click <strong>Recommend Plan to Student</strong> to share the proposed plan for review. Once the student confirms digital agreement, click <strong>Approve & Archive Plan</strong> to finalize version history.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT GUIDE */}
          {activeTab === 'student_workflow' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Student View & Digital Sign-Off</h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Students can review their academic progress, inspect recommended study plans, digitally sign off on proposed unit sequences, and download official plan summary documents.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Role Switching</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Use the <strong>Academic Chair / Student View</strong> pill in the top navigation bar to switch perspectives.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Reviewing Recommended Plan</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Students can inspect their scheduled unit sequence across semesters or trimesters to ensure it aligns with their personal graduation goals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Digital Sign-Off Agreement</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Check the digital agreement sign-off checkbox and click <strong>Submit Agreement</strong> to confirm agreement with the recommended study sequence.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Official Study Plan Export</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Click <strong>Export Document</strong> to view or print an official formatted study plan summary document.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM ARCHITECTURE */}
          {activeTab === 'architecture_erd' && (
            <div className="space-y-5">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-700">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-red-600" /> Technology Stack Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Frontend Application</span>
                    <span className="text-slate-500 text-[11px]">React 18, Vite, TailwindCSS, @dnd-kit</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Backend REST Services</span>
                    <span className="text-slate-500 text-[11px]">Node.js Express API Server</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Database Store</span>
                    <span className="text-slate-500 text-[11px]">MySQL 8.0 / PostgreSQL 15</span>
                  </div>
                </div>
              </div>

              {/* Entity Relationship Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Core Relational Database Entities</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1.5 border border-slate-800">
                  <div><span className="text-red-400 font-bold">Student</span> (student_id, student_number, first_name, last_name, email, course_id, location_id)</div>
                  <div><span className="text-red-400 font-bold">Course</span> (course_id, code, name, degree_level, total_credit_points)</div>
                  <div><span className="text-red-400 font-bold">Unit</span> (unit_id, code, title, credit_points, level)</div>
                  <div><span className="text-red-400 font-bold">UnitOffering</span> (offering_id, unit_id, location_id, period_id, year_version)</div>
                  <div><span className="text-red-400 font-bold">Prerequisite</span> (prereq_id, unit_id, prereq_unit_id, min_grade)</div>
                  <div><span className="text-red-400 font-bold">StudyPlan</span> (plan_id, student_id, title, status, total_credit_points)</div>
                  <div><span className="text-red-400 font-bold">StudyPlanUnit</span> (plan_unit_id, plan_id, unit_id, period_id, year_level)</div>
                  <div><span className="text-red-400 font-bold">StudyPlanVersion</span> (version_id, plan_id, version_number, amendment_reason)</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETUP & INSTALLATION */}
          {activeTab === 'handover_deploy' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" /> Standard Docker Launch
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  To build and start all application services in Docker, run the following command in the workspace root:
                </p>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] select-all border border-slate-800">
                  docker-compose up -d --build
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Environment Configuration</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Refer to <code>.env.example</code> for standard environment variables (PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Sample Registered Dataset</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Includes 4 registered sample students under Bachelor of Information Technology degree majors (AI, CS, BIS).
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            PT3 Solutions Study Plan Repository System
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-red-700 hover:bg-slate-800 dark:hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-2xs"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
