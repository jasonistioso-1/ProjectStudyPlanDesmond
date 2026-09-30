import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit3, ArrowLeft, X, ArrowUpDown, ChevronRight, GraduationCap } from 'lucide-react';

export default function StudentSelectModal({ students = [], onSelectStudent, onAddStudentClick, onEditStudentClick, onClose, isModal = false }) {
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'existing_student' | 'new_student'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'id' | 'course'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Exclusively filter out Admin/Chair profile from Student Selection Modal
  const studentOnlyList = students.filter(s => s.account_category !== 'admin' && s.student_id !== 0);

  const filteredStudents = studentOnlyList
    .filter(s => {
      if (categoryFilter !== 'ALL') {
        const cat = s.account_category || 'existing_student';
        if (cat !== categoryFilter) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const num = (s.student_number || '').toLowerCase();
      const course = (s.course_code || s.course_name || '').toLowerCase();
      return fullName.includes(q) || num.includes(q) || course.includes(q);
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') {
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
        comp = nameA.localeCompare(nameB);
      } else if (sortBy === 'id') {
        const idA = (a.student_number || '').toLowerCase();
        const idB = (b.student_number || '').toLowerCase();
        comp = idA.localeCompare(idB, undefined, { numeric: true });
      } else if (sortBy === 'course') {
        const courseA = (a.course_code || a.course_name || '').toLowerCase();
        const courseB = (b.course_code || b.course_name || '').toLowerCase();
        comp = courseA.localeCompare(courseB);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

  const countAll = studentOnlyList.length;
  const countExisting = studentOnlyList.filter(s => s.account_category === 'existing_student').length;
  const countNew = studentOnlyList.filter(s => s.account_category === 'new_student').length;

  const content = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl max-w-5xl lg:max-w-6xl w-full mx-auto font-sans text-slate-900 dark:text-slate-100 transition-all">
      {/* Header Bar */}
      <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-red-700 dark:text-red-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-heading">
              Student Directory & Profiles
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Select an active student profile to review study plans, view academic progress, or update enrollment status.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onAddStudentClick && (
            <button
              onClick={onAddStudentClick}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Controls Area: Search + Underline Line Tabs + Sort */}
      <div className="space-y-3 mb-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="student-select-search-input"
            type="text"
            placeholder="Search by student name, ID (e.g. PT3-2026-001), or major..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Line Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-6 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`pb-2.5 transition-all cursor-pointer relative ${
                categoryFilter === 'ALL'
                  ? 'text-red-700 dark:text-red-400 font-bold border-b-2 border-red-700 dark:border-red-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All Students <span className="text-xs text-slate-400 font-normal ml-1">({countAll})</span>
            </button>
            <button
              onClick={() => setCategoryFilter('existing_student')}
              className={`pb-2.5 transition-all cursor-pointer relative ${
                categoryFilter === 'existing_student'
                  ? 'text-red-700 dark:text-red-400 font-bold border-b-2 border-red-700 dark:border-red-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Existing Students <span className="text-xs text-slate-400 font-normal ml-1">({countExisting})</span>
            </button>
            <button
              onClick={() => setCategoryFilter('new_student')}
              className={`pb-2.5 transition-all cursor-pointer relative ${
                categoryFilter === 'new_student'
                  ? 'text-red-700 dark:text-red-400 font-bold border-b-2 border-red-700 dark:border-red-500'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              New Students <span className="text-xs text-slate-400 font-normal ml-1">({countNew})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2 text-xs text-slate-500">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer text-xs"
            >
              <option value="name">Name</option>
              <option value="id">Student ID</option>
              <option value="course">Major</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Structured Academic Directory Table */}
      <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">No student profiles match your search criteria.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/90 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student Profile & ID</th>
                <th className="py-3 px-4">Degree Program</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map(student => {
                const isNew = student.account_category === 'new_student';
                return (
                  <tr
                    key={student.student_id}
                    onClick={() => onSelectStudent(student)}
                    className="group hover:bg-slate-50/90 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                  >
                    {/* Student Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-600">
                          {student.first_name ? student.first_name[0] : 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors text-sm">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                            <span>ID: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{student.student_number}</strong></span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <span className="text-slate-500 font-semibold">{student.course_code || 'PT3-BSIT'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Degree Program */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {student.course_name || 'Bachelor of Information Technology'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Singapore Campus
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                        isNew
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60'
                      }`}>
                        {isNew ? 'New Student' : 'Existing Student'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {onEditStudentClick && (
                          <button
                            onClick={() => onEditStudentClick(student)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                            title="Edit Student Profile"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <span>Select</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>Showing {filteredStudents.length} student profiles</span>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Study Plan</span>
          </button>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl lg:max-w-6xl my-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 sm:py-6 px-3 sm:px-4 flex items-center justify-center">
      {content}
    </div>
  );
}
