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

  const rawPlansList = (storedPlans && storedPlans.length > 0) ? storedPlans : defaultStoredPlans;
  const activePlansList = rawPlansList.filter(p => {
    const isChairAdmin = p.student_id === 0 || p.student_id === '0' || String(p.student_number || '').includes('ADMIN') || String(p.student_name || '').includes('Academic Chair');
    return !isChairAdmin;
  });

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
            Approved
          </span>
        );
      case 'agreed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80">
            Student Agreed
          </span>
        );
      case 'recommended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            Recommended
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
            Change Requested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="font-sans max-w-[1440px] mx-auto space-y-5 transition-colors">
      {/* Executive Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl font-sans text-slate-900 dark:text-white transition-all relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Subtle executive background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 flex items-center justify-center shadow-2xs shrink-0 border border-red-200/60 dark:border-red-900/60">
            <Database className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
              Stored Study Plans Repository
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Archived multi-year student study plans with version audit history.
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="stored-plans-search-input"
            type="text"
            placeholder="Search plan by student or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 font-semibold transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">

      {/* Table List of Stored Plans */}
      <div className="overflow-x-auto border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50/90 dark:bg-slate-800/90 border-b border-slate-200/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-300 font-heading font-extrabold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="p-4">Plan Title & ID</th>
              <th className="p-4">Student Record</th>
              <th className="p-4">Course & Location</th>
              <th className="p-4">Status</th>
              <th className="p-4">Version</th>
              <th className="p-4">Last Updated</th>
              <th className="p-4 text-right">Action</th>
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
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-heading">
                      <span>{plan.student_name}</span>
                      {isNewStudent ? (
                        <span className="bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-md font-sans">New Student</span>
                      ) : (
                        <span className="bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 text-[10px] font-semibold px-2 py-0.5 rounded-md font-sans">Existing Student</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">{plan.student_number}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-heading font-extrabold text-white bg-red-700 text-xs tracking-tight px-2.5 py-0.5 rounded-md shadow-2xs font-mono inline-block mb-1">
                      {plan.course_code}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{plan.location}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(plan.status)}
                  </td>
                  <td className="p-4">
                    <span className="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      v{plan.version_number ? Number(plan.version_number).toFixed(1) : '2.0'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {plan.updated_at}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        const targetStudent = matchedStudent || students.find(s => String(s.student_id) === String(plan.student_id)) || {
                          student_id: plan.student_id,
                          first_name: plan.student_name ? plan.student_name.split(' ')[0] : 'Student',
                          last_name: plan.student_name ? plan.student_name.split(' ').slice(1).join(' ') : `#${plan.student_id}`,
                          student_number: plan.student_number || `PT3-2026-00${plan.student_id}`,
                          course_code: plan.course_code || 'PT3-BSIT',
                          course_name: plan.title || 'Bachelor of Information Technology'
                        };
                        if (onSelectStudentAndRetrievePlan) {
                          onSelectStudentAndRetrievePlan(targetStudent, plan);
                        } else if (onTabChange) {
                          onTabChange('STUDY_PLAN');
                        }
                      }}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-2xs hover:shadow-md inline-flex items-center gap-1.5 cursor-pointer active:scale-95 border border-red-800 font-heading"
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
    </div>
  );
}
