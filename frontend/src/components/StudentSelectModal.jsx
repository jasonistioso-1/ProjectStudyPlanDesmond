import React, { useState, useEffect } from 'react';
import { Search, UserCheck, GraduationCap, Building2, ChevronRight, X, ArrowUpDown, UserPlus, Edit3, ArrowLeft } from 'lucide-react';

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

  const content = (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl max-w-2xl w-full mx-auto font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight font-heading">
            Select Student Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose a student profile to view or edit active study plan and academic progress.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onAddStudentClick && (
            <button
              onClick={onAddStudentClick}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Control Row: Search & Filters */}
      <div className="space-y-3 mb-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          <input
            id="student-select-search-input"
            type="text"
            placeholder="Search by student name, ID (e.g. PT3-2026-001), or major..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
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

        {/* Filter Pills & Sort Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({studentOnlyList.length})
            </button>
            <button
              onClick={() => setCategoryFilter('existing_student')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'existing_student'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Existing ({studentOnlyList.filter(s => s.account_category === 'existing_student').length})
            </button>
            <button
              onClick={() => setCategoryFilter('new_student')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === 'new_student'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              New ({studentOnlyList.filter(s => s.account_category === 'new_student').length})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1">
                Sort:
              </span>
              <button
                onClick={() => setSortBy('name')}
                className={`px-2 py-0.5 rounded-md text-xs transition-all cursor-pointer ${
                  sortBy === 'name'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Name
              </button>
              <button
                onClick={() => setSortBy('id')}
                className={`px-2 py-0.5 rounded-md text-xs transition-all cursor-pointer ${
                  sortBy === 'id'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setSortBy('course')}
                className={`px-2 py-0.5 rounded-md text-xs transition-all cursor-pointer ${
                  sortBy === 'course'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Major
              </button>
            </div>

            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
              title={`Order: ${sortOrder === 'asc' ? 'Ascending (A-Z)' : 'Descending (Z-A)'}`}
            >
              <ArrowUpDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Student List Grid */}
      <div className="space-y-2.5 max-h-[380px] sm:max-h-[440px] overflow-y-auto pr-1">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">No students match your search criteria.</p>
          </div>
        ) : (
          filteredStudents.map(student => (
            <div
              key={student.student_id}
              onClick={() => onSelectStudent(student)}
              className="group bg-slate-50/50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-red-500 dark:hover:border-red-500/80 rounded-xl p-3.5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                  {student.first_name ? student.first_name[0] : 'S'}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors truncate">
                      {student.first_name} {student.last_name}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {student.course_code || 'PT3-BSIT'}
                    </span>
                    {student.account_category === 'new_student' ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        New Student
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Existing Student
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {student.course_name || 'Bachelor of Information Technology'}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    <span>ID: <strong className="text-slate-600 dark:text-slate-300">{student.student_number}</strong></span>
                    <span>•</span>
                    <span className="truncate">Singapore Campus</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t border-slate-200/60 sm:border-t-0 dark:border-slate-700/50">
                {onEditStudentClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditStudentClick(student);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
                    title="Edit Student Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStudent(student);
                  }}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-red-700 group-hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer w-full sm:w-auto"
                >
                  <span>Select Student</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Showing {filteredStudents.length} student profiles</span>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
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
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl my-auto">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-12 px-3 sm:px-4 flex items-center justify-center">
      {content}
    </div>
  );
}
