import React, { useState, useEffect } from 'react';
import { Search, UserCheck, BookOpen, MapPin, GraduationCap, X } from 'lucide-react';
import { fetchStudents } from '../services/api';

export default function StudentSearch({ selectedStudent, onSelectStudent }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'id' | 'course'

  useEffect(() => {
    loadStudents('');
  }, []);

  const loadStudents = async (query) => {
    try {
      const data = await fetchStudents(query);
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    loadStudents(value);
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
      const nameB = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'id') {
      const idA = (a.student_number || '').toLowerCase();
      const idB = (b.student_number || '').toLowerCase();
      return idA.localeCompare(idB, undefined, { numeric: true });
    } else if (sortBy === 'course') {
      const courseA = (a.course_code || a.course_name || '').toLowerCase();
      const courseB = (b.course_code || b.course_name || '').toLowerCase();
      return courseA.localeCompare(courseB);
    }
    return 0;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
          <UserCheck className="w-4 h-4 text-slate-900" /> Student Directory & Academic Search
        </h2>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-1.5">Sort:</span>
          <button
            onClick={() => setSortBy('name')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              sortBy === 'name' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Name
          </button>
          <button
            onClick={() => setSortBy('id')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              sortBy === 'id' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ID
          </button>
          <button
            onClick={() => setSortBy('course')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              sortBy === 'course' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Major
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            id="student-navbar-search-input"
            type="text"
            placeholder="Search student name, ID (e.g. 34001001), or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-9 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 font-medium transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilteredStudents(students);
              }}
              className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Menu */}
        {isOpen && sortedStudents.length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {sortedStudents.map((student) => (
              <div
                key={student.student_id}
                onClick={() => {
                  onSelectStudent(student);
                  setSearchTerm(`${student.first_name} ${student.last_name} (${student.student_number})`);
                  setIsOpen(false);
                }}
                className="px-4 py-3 hover:bg-blue-50/60 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">ID: {student.student_number} • {student.email}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold border border-blue-200 font-mono">
                    {student.course_code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Student Banner */}
      {selectedStudent && (
        <div className="mt-4 bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                {selectedStudent.first_name} {selectedStudent.last_name}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 bg-blue-900 text-white font-bold rounded-full font-mono shadow-sm">
                ID: {selectedStudent.student_number}
              </span>
            </div>
            <p className="text-xs text-slate-700 mt-1 font-semibold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
              {selectedStudent.course_name} ({selectedStudent.course_code})
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Campus: <strong className="text-slate-900">{selectedStudent.location_name || 'Singapore'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Intake Year: <strong className="text-slate-900">{selectedStudent.commencement_year}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
