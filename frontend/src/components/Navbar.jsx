import React from 'react';
import {
  GraduationCap,
  Clock,
  UserCheck,
  Download,
  FileSpreadsheet,
  History,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({
  activeRole,
  onRoleChange,
  activeTab,
  onTabChange,
  selectedStudent,
  studentsList = [],
  onSelectStudent,
  onOpenStudentSelectModal,
  storedPlansCount = 4,
  onOpenImport,
  onOpenAudit
}) {
  const isChair = activeRole === 'chair';

  const chairNavItems = [
    { id: 'STUDY_PLAN', label: 'Plan Builder' },
    { id: 'ACADEMIC_HISTORY', label: 'Academic History' },
    { id: 'STORED', label: `Stored Plans (${storedPlansCount})` }
  ];

  const studentNavItems = [
    { id: 'STUDY_PLAN', label: 'My Study Plan' },
    { id: 'ACADEMIC_HISTORY', label: 'Academic History' }
  ];

  const navItems = isChair ? chairNavItems : studentNavItems;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 font-sans shadow-2xs border-t-2 border-t-red-600">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group select-none" 
          onClick={() => onTabChange('STUDY_PLAN')}
        >
          <div className="bg-red-700 text-white w-7 h-7 rounded-md flex items-center justify-center font-bold shadow-2xs group-hover:bg-red-800 transition-colors">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-slate-900 tracking-tight">PT3 Solutions</span>
            <span className="text-slate-300 font-light">/</span>
            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Study Plan Repository</span>
          </div>
        </div>

        {/* Middle: Clean Navigation Tabs */}
        <nav className="flex items-center gap-1">
          {navItems.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Active Context, Tools & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Active Student Selector Trigger */}
          {isChair && (
            <button
              onClick={onOpenStudentSelectModal}
              className="bg-white hover:bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-2xs flex items-center gap-1.5 transition-colors"
              title="Click to select student (Step 1)"
            >
              <UserCheck className="w-3.5 h-3.5 text-red-600" />
              <span className="truncate max-w-[120px]">
                {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Select Student'}
              </span>
            </button>
          )}

          {/* Role Switcher Pill */}
          <div className="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-md p-0.5 text-xs">
            <button
              onClick={() => onRoleChange('chair')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                isChair
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Academic Chair
            </button>
            <button
              onClick={() => onRoleChange('student')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                !isChair
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student View
            </button>
          </div>

          {/* Utility Action Buttons */}
          {isChair && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                onClick={onOpenImport}
                title="Import Unit Offerings & Prerequisites CSV/Seed"
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden lg:inline">Import CSV</span>
              </button>

              <button
                onClick={onOpenAudit}
                title="View System Change Log & Audit Trail"
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden lg:inline">Change Log</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
