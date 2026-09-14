import React from 'react';
import {
  GraduationCap,
  Clock,
  Database,
  UserCheck
} from 'lucide-react';

export default function Navbar({
  activeRole,
  onRoleChange,
  activeTab,
  onTabChange,
  selectedStudent,
  studentsList = [],
  onSelectStudent,
  storedPlansCount = 4,
  onOpenImport,
  onOpenAudit
}) {
  const isChair = activeRole === 'chair';

  const chairNavItems = [
    { id: 'STUDY_PLAN', label: 'Plan Builder' },
    { id: 'RIWAYAT', label: 'Academic History' },
    { id: 'STORED', label: `Stored Plans (${storedPlansCount})` }
  ];

  const studentNavItems = [
    { id: 'STUDY_PLAN', label: 'My Study Plan' },
    { id: 'RIWAYAT', label: 'Academic History' }
  ];

  const navItems = isChair ? chairNavItems : studentNavItems;

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 font-sans shadow-2xs border-t-4 border-t-red-700">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-6">
        
        {/* Left: Brand Identity (PT3 Solutions / Murdoch Visualizer aesthetic) */}
        <div 
          className="flex items-center gap-3 cursor-pointer shrink-0 group select-none" 
          onClick={() => onTabChange('STUDY_PLAN')}
        >
          <div className="bg-red-800 text-white w-8 h-8 rounded-lg flex items-center justify-center font-extrabold shadow-2xs group-hover:bg-red-900 transition-colors">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-900 tracking-tight">PT3 Solutions</span>
            <span className="text-slate-300 font-light">/</span>
            <span className="text-xs font-bold text-red-800 uppercase tracking-wide bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">SPR Visualiser</span>
          </div>
        </div>

        {/* Middle: Clean Navigation Tabs (No literal brackets) */}
        <nav className="flex items-center gap-1">
          {navItems.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Active Context & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Active Student Picker */}
          {isChair && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium hidden lg:inline">Student:</span>
              {studentsList.length > 0 ? (
                <select
                  value={selectedStudent ? selectedStudent.student_id : ''}
                  onChange={(e) => {
                    const st = studentsList.find(s => String(s.student_id) === String(e.target.value));
                    if (st) onSelectStudent(st);
                  }}
                  className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-2xs focus:outline-none focus:border-slate-400 cursor-pointer hover:bg-slate-50 transition-colors max-w-[200px] truncate"
                >
                  {studentsList.map(st => (
                    <option key={st.student_id} value={st.student_id}>
                      {st.first_name} {st.last_name} ({st.student_number})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                  {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Alice Smith'}
                </span>
              )}
            </div>
          )}

          {/* Role Switcher Pill */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md p-0.5 text-xs">
            <button
              onClick={() => onRoleChange('chair')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                isChair
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Academic Chair
            </button>
            <button
              onClick={() => onRoleChange('student')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                !isChair
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Student View
            </button>
          </div>

          {/* Utility Action Icons */}
          {isChair && (
            <div className="flex items-center gap-0.5 border-l border-slate-200 pl-2">
              <button
                onClick={onOpenAudit}
                title="System Audit Log"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenImport}
                title="Data Importer"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Database className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
