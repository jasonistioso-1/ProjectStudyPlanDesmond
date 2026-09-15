import React, { useState } from 'react';
import { Search, UserCheck, GraduationCap, Building2, ChevronRight, Sparkles, X } from 'lucide-react';

export default function StudentSelectModal({ students = [], onSelectStudent, onClose, isModal = false }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = students.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
    const num = (s.student_number || '').toLowerCase();
    const course = (s.course_code || '').toLowerCase();
    return fullName.includes(q) || num.includes(q) || course.includes(q);
  });

  const content = (
    <div className="bg-white border-t-4 border-t-red-600 border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl max-w-2xl w-full mx-auto font-sans relative">
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-2xs">
          <GraduationCap className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
          Step 1: Select Student Record
        </span>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">
          Academic Chair Student Selector
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please select a student from the Murdoch Study Plan Repository to view their academic history and construct/amend their study plan.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search student by name, student ID (e.g. PT3-2026-001) or course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Student List Grid */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-xs text-slate-500">No students match your search query.</p>
          </div>
        ) : (
          filteredStudents.map(student => (
            <div
              key={student.student_id}
              onClick={() => onSelectStudent(student)}
              className="group bg-white hover:bg-slate-50/90 border border-slate-200 hover:border-red-500/60 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-2xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                  {student.first_name ? student.first_name[0] : 'S'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors truncate">
                      {student.first_name} {student.last_name}
                    </h3>
                    <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {student.course_code || 'PT3-BSIT'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                    {student.course_name || 'Bachelor of Information Technology'}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                    <span>ID: <strong className="text-slate-700">{student.student_number}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      Perth Campus
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
                  className="px-3 py-1.5 bg-slate-900 group-hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Select</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Total Records Available: <strong>{students.length}</strong></span>
        <span className="font-mono text-slate-400">ICT302 Specification Standard</span>
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
