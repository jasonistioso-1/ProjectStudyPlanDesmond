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
    <header className="bg-[#8A0000] text-white border-b-2 border-amber-500 sticky top-0 z-40 font-sans shadow-md">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-6">
        
        {/* Left: Brand Identity (Murdoch Crimson Visualizer aesthetic) */}
        <div 
          className="flex items-center gap-3 cursor-pointer shrink-0 group select-none" 
          onClick={() => onTabChange('STUDY_PLAN')}
        >
          <div className="bg-white text-[#8A0000] w-8 h-8 rounded-lg flex items-center justify-center font-extrabold shadow-sm group-hover:bg-amber-100 transition-colors">
            <GraduationCap className="w-5 h-5 text-[#8A0000]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-white tracking-tight">PT3 Solutions</span>
            <span className="text-red-300 font-light">/</span>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider bg-red-950/60 border border-amber-500/40 px-2 py-0.5 rounded shadow-2xs">Course Visualiser</span>
          </div>
        </div>

        {/* Middle: Murdoch Crimson Nav Tabs */}
        <nav className="flex items-center gap-1">
          {navItems.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#8A0000] shadow-sm font-bold'
                    : 'text-red-100 hover:text-white hover:bg-red-800/80'
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
              <span className="text-red-200 font-medium hidden lg:inline">Student:</span>
              {studentsList.length > 0 ? (
                <select
                  value={selectedStudent ? selectedStudent.student_id : ''}
                  onChange={(e) => {
                    const st = studentsList.find(s => String(s.student_id) === String(e.target.value));
                    if (st) onSelectStudent(st);
                  }}
                  className="bg-red-950/80 border border-red-700/80 rounded-md px-2.5 py-1 text-xs font-semibold text-white shadow-2xs focus:outline-none focus:border-amber-400 cursor-pointer hover:bg-red-900 transition-colors max-w-[200px] truncate"
                >
                  {studentsList.map(st => (
                    <option key={st.student_id} value={st.student_id} className="bg-slate-900 text-white">
                      {st.first_name} {st.last_name} ({st.student_number})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-white bg-red-950 border border-red-700 px-2.5 py-1 rounded-md">
                  {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Alex Mercer'}
                </span>
              )}
            </div>
          )}

          {/* Role Switcher Pill */}
          <div className="flex items-center gap-1 bg-red-950/90 border border-red-700/80 rounded-md p-0.5 text-xs">
            <button
              onClick={() => onRoleChange('chair')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                isChair
                  ? 'bg-white text-[#8A0000] shadow-sm font-bold'
                  : 'text-red-200 hover:text-white'
              }`}
            >
              Academic Chair
            </button>
            <button
              onClick={() => onRoleChange('student')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                !isChair
                  ? 'bg-white text-[#8A0000] shadow-sm font-bold'
                  : 'text-red-200 hover:text-white'
              }`}
            >
              Student View
            </button>
          </div>

          {/* Utility Action Icons */}
          {isChair && (
            <div className="flex items-center gap-0.5 border-l border-red-800 pl-2">
              <button
                onClick={onOpenAudit}
                title="System Audit Log"
                className="p-1.5 text-red-200 hover:text-white hover:bg-red-800/80 rounded-md transition-colors"
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenImport}
                title="Data Importer"
                className="p-1.5 text-red-200 hover:text-white hover:bg-red-800/80 rounded-md transition-colors"
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
