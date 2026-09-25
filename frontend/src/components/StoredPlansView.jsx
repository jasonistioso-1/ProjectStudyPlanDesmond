import React, { useState } from 'react';
import { Database, Search, FileEdit, CheckCircle2, Clock, Calendar, ArrowRight, UserCheck, Eye, Layers, X } from 'lucide-react';

export default function StoredPlansView({ students = [], storedPlans, activeRole = 'chair', onSelectStudentAndRetrievePlan, onTabChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const isChair = activeRole === 'chair';

  // Default fallback sample Stored Plans list
  const defaultStoredPlans = [
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
  ];

  const activePlansList = (storedPlans && storedPlans.length > 0) ? storedPlans : defaultStoredPlans;

  const filteredPlans = activePlansList.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.student_name && p.student_name.toLowerCase().includes(q)) ||
      (p.student_number && p.student_number.toLowerCase().includes(q)) ||
      (p.course_code && p.course_code.toLowerCase().includes(q)) ||
      (p.title && p.title.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            Approved
          </span>
        );
      case 'agreed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
            Student Agreed
          </span>
        );
      case 'recommended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            Recommended
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
            Change Requested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs font-sans max-w-[1440px] mx-auto space-y-5 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-heading">
            <Database className="w-5 h-5 text-red-600 dark:text-red-400" />
            Stored Study Plans Repository
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Archived multi-year student study plans with version audit history.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="stored-plans-search-input"
            type="text"
            placeholder="Search plan by student or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-red-600 font-medium transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table List of Stored Plans */}
      <div className="overflow-x-auto border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50/90 dark:bg-slate-800/90 border-b border-slate-200/90 dark:border-slate-700/90 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="p-4 font-bold">Plan Title & ID</th>
              <th className="p-4 font-bold">Student Record</th>
              <th className="p-4 font-bold">Course & Location</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Version</th>
              <th className="p-4 font-bold">Last Updated</th>
              <th className="p-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredPlans.map(plan => {
              const matchedStudent = students.find(s => String(s.student_id) === String(plan.student_id));
              const isNewStudent = plan.student_id === 3 || plan.student_id === 4 || matchedStudent?.account_category === 'new_student';

              return (
                <tr key={plan.plan_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-4">
                    <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-heading">{plan.title}</div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Plan ID: #{plan.plan_id}</span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{plan.student_name}</span>
                      {isNewStudent ? (
                        <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md font-sans">New Student</span>
                      ) : (
                        <span className="bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md font-sans">Existing Student</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">{plan.student_number}</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 block w-fit mb-0.5">
                      {plan.course_code}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{plan.location}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(plan.status)}
                  </td>
                  <td className="p-4">
                    <span className="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      v2.0
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {plan.updated_at}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        if (matchedStudent && onSelectStudentAndRetrievePlan) {
                          onSelectStudentAndRetrievePlan(matchedStudent);
                        } else if (onTabChange) {
                          onTabChange('STUDY_PLAN');
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-900 dark:bg-red-700 hover:bg-slate-800 dark:hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {isChair ? (
                        <>
                          <FileEdit className="w-3.5 h-3.5 text-white/90" />
                          <span>Retrieve & Amend</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-white/90" />
                          <span>Review & Sign Plan</span>
                        </>
                      )}
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
          Showing {filteredPlans.length} archived student study plans
        </span>
      </div>
    </div>
  );
}
