import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, CheckCircle2 } from 'lucide-react';

export default function AddStudentModal({ onSaveStudent, editStudent = null, onClose }) {
  const [studentNumber, setStudentNumber] = useState(editStudent ? editStudent.student_number : `PT3-2026-00${Math.floor(Math.random() * 90) + 10}`);
  const [firstName, setFirstName] = useState(editStudent ? editStudent.first_name : '');
  const [lastName, setLastName] = useState(editStudent ? editStudent.last_name : '');
  const [email, setEmail] = useState(editStudent ? editStudent.email : '');
  const [courseCode, setCourseCode] = useState(editStudent ? editStudent.course_code : 'PT3-BSIT-AI01');
  const [locationName, setLocationName] = useState(editStudent ? editStudent.location_name : 'PT3 Solutions Singapore Campus');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const courseOptions = [
    { code: 'PT3-BSIT-AI01', name: 'Bachelor of Information Technology (Major: Artificial Intelligence)' },
    { code: 'PT3-BSIT-CS02', name: 'Bachelor of Information Technology (Major: Computer Science)' },
    { code: 'PT3-BSIT-BIS03', name: 'Bachelor of Information Technology (Major: Business Information Systems)' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and Last Name are required');
      return;
    }
    if (!studentNumber.trim()) {
      setError('Student Number is required');
      return;
    }

    const selectedCourseObj = courseOptions.find(c => c.code === courseCode) || courseOptions[0];

    const studentData = {
      student_id: editStudent ? editStudent.student_id : Date.now(),
      student_number: studentNumber.trim().toUpperCase(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.pt3solutions.edu.sg`,
      course_id: 1,
      course_code: courseCode,
      course_name: selectedCourseObj.name,
      location_id: 2,
      location_name: locationName,
      commencement_year: 2026,
      study_status: 'active'
    };

    onSaveStudent(studentData);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative font-sans text-slate-900 dark:text-slate-100 transition-colors my-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shadow-2xs">
            {editStudent ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
              {editStudent ? 'Edit Student Profile' : 'Add New Student Profile'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {editStudent ? 'Update student metadata, degree major, or name.' : 'Register a new student profile in the SPR database.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200 font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                First Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Last Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Mercer"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Student ID / Number *
              </label>
              <input
                type="text"
                placeholder="e.g. PT3-2026-001"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold uppercase"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. alex.mercer@student.pt3solutions.edu.sg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Degree Major / Course
            </label>
            <select
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold"
            >
              {courseOptions.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Campus Location
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Student Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
