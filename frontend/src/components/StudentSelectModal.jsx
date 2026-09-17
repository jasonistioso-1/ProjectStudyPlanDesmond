import React, { useState } from 'react';
import { Search, UserCheck, GraduationCap, Building2, ChevronRight, Sparkles, X, ArrowUpDown } from 'lucide-react';

export default function StudentSelectModal({ students = [], onSelectStudent, onClose, isModal = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'id' | 'course'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const filteredStudents = students
    .filter(s => {
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
    <div className="bg-white dark:bg-slate-900 border-t-4 border-t-red-600 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl max-w-2xl w-full mx-auto font-sans relative text-slate-900 dark:text-slate-100 transition-colors">
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
          <GraduationCap className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
          PT3 SOLUTIONS SINGAPORE STUDENT DIRECTORY
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 font-heading">
          Academic Chair Student Selector
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Please select a student from the PT3 Solutions Study Plan Repository to view their academic history and construct/amend their study plan.
        </p>
      </div>

      {/* Search Input & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student by name, student ID (e.g. PT3-2026-001) or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Sorting Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1.5 flex items-center gap-1">
              Sort:
            </span>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                sortBy === 'name'
                  ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('id')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                sortBy === 'id'
                  ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setSortBy('course')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                sortBy === 'course'
                  ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              Major
            </button>
          </div>

          <button
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shrink-0"
            title={`Order: ${sortOrder === 'asc' ? 'Ascending (A-Z)' : 'Descending (Z-A)'}`}
          >
            <ArrowUpDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Student List Grid */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">No students match your search query.</p>
          </div>
        ) : (
          filteredStudents.map(student => (
            <div
              key={student.student_id}
              onClick={() => onSelectStudent(student)}
              className="group bg-white dark:bg-slate-800/90 hover:bg-slate-50/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-500/60 dark:hover:border-red-500/60 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-2xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-700 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                  {student.first_name ? student.first_name[0] : 'S'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors truncate">
                      {student.first_name} {student.last_name}
                    </h3>
                    <span className="bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {student.course_code || 'PT3-BSIT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                    {student.course_name || 'Bachelor of Information Technology'}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                    <span>ID: <strong className="text-slate-700 dark:text-slate-300">{student.student_number}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      Singapore Campus
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStudent(student);
                  }}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-red-700 group-hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Select Student</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Total Records Available: <strong className="text-slate-800 dark:text-slate-200">{students.length}</strong></span>
        <span className="font-mono text-slate-400 dark:text-slate-500">ICT302 Specification Standard</span>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 px-4 flex items-center justify-center">
      {content}
    </div>
  );
}
