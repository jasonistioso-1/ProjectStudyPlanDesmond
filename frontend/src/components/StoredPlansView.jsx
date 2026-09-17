import React, { useState } from 'react';
import { Database, Search, FileEdit, CheckCircle2, Clock, Calendar, ArrowRight, UserCheck, Eye, Layers } from 'lucide-react';

export default function StoredPlansView({ students = [], onSelectStudentAndRetrievePlan, onTabChange }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Stored Plans list matching seed data & stored plans
  const storedPlansList = [
    {
      plan_id: 101,
      student_id: 1,
      student_name: 'Alex Mercer',
      student_number: 'PT3-2026-001',
      course_code: 'PT3-BSIT-01',
      title: 'PT3-BSIT-01 Software & Systems Plan',
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
      course_code: 'PT3-BSCS-02',
      title: 'PT3-BSCS-02 Computer Science Plan',
      status: 'agreed',
      version_number: 1,
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
      course_code: 'PT3-BSE-03',
      title: 'PT3-BSE-03 Software Engineering Plan',
      status: 'recommended',
      version_number: 1,
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
      course_code: 'PT3-BSCY-04',
      title: 'PT3-BSCY-04 Cyber Security Plan',
      status: 'draft',
      version_number: 3,
      total_cp: 72,
      created_by: 'Academic Chair',
      updated_at: '2026-09-13 14:10',
      location: 'Singapore Campus'
    }
  ];

  const filteredPlans = storedPlansList.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.student_name.toLowerCase().includes(q) ||
      p.student_number.toLowerCase().includes(q) ||
      p.course_code.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">Approved</span>;
      case 'agreed':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">Student Agreed</span>;
      case 'recommended':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">Recommended</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-300 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">Draft</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t-2 border-t-red-600 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs font-sans max-w-[1440px] mx-auto space-y-5 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 font-semibold text-[10px] font-mono px-2 py-0.5 rounded">
              FR-16 & FR-17 REPOSITORY
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">• Versioned Plans Storage</span>
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-red-600 dark:text-red-400" />
            Stored Study Plans Repository
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Retrieve, review version history, and amend previously archived student study plans.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search plan by student or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-red-600 font-medium"
          />
        </div>
      </div>

      {/* Table List of Stored Plans */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase">
            <tr>
              <th className="p-3.5 font-bold">Plan Title & ID</th>
              <th className="p-3.5 font-bold">Student Record</th>
              <th className="p-3.5 font-bold">Course & Location</th>
              <th className="p-3.5 font-bold">Status</th>
              <th className="p-3.5 font-bold">Version</th>
              <th className="p-3.5 font-bold">Last Updated</th>
              <th className="p-3.5 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPlans.map(plan => {
              const matchedStudent = students.find(s => String(s.student_id) === String(plan.student_id));

              return (
                <tr key={plan.plan_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{plan.title}</div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Plan ID: #{plan.plan_id}</span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{plan.student_name}</div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{plan.student_number}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 block w-fit mb-0.5">
                      {plan.course_code}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{plan.location}</span>
                  </td>
                  <td className="p-3.5">
                    {getStatusBadge(plan.status)}
                  </td>
                  <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-bold">
                    v{plan.version_number}.0
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {plan.updated_at}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        if (matchedStudent && onSelectStudentAndRetrievePlan) {
                          onSelectStudentAndRetrievePlan(matchedStudent);
                        } else if (onTabChange) {
                          onTabChange('STUDY_PLAN');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-red-700 hover:bg-slate-800 dark:hover:bg-red-600 text-white rounded-md text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-300" />
                      <span>Retrieve & Amend</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-right">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          Showing {filteredPlans.length} stored study plans (FR-16 & FR-17 Compliant)
        </span>
      </div>
    </div>
  );
}
