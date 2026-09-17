import React from 'react';
import {
  GraduationCap,
  Clock,
  UserCheck,
  FileSpreadsheet,
  BookOpen,
  Layers,
  Database,
  History,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';

export default function Navbar({
  activeRole,
  onRoleChange,
  activeTab,
  onTabChange,
  selectedStudent,
  onOpenStudentSelectModal,
  storedPlansCount = 4,
  onOpenImport,
  onOpenAudit,
  onOpenGuide,
  theme = 'light',
  onToggleTheme
}) {
  const isChair = activeRole === 'chair';

  const chairNavItems = [
    { id: 'STUDY_PLAN', label: 'Plan Builder', icon: Layers },
    { id: 'ACADEMIC_HISTORY', label: 'Academic History', icon: History },
    { id: 'STORED', label: `Stored Plans (${storedPlansCount})`, icon: Database },
    { id: 'CATALOG', label: 'Course Catalog', icon: BookOpen }
  ];

  const studentNavItems = [
    { id: 'STUDY_PLAN', label: 'My Study Plan', icon: Layers },
    { id: 'ACADEMIC_HISTORY', label: 'Academic History', icon: History }
  ];

  const navItems = isChair ? chairNavItems : studentNavItems;

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 font-sans shadow-2xs border-t-2 border-t-red-600 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        
        {/* Left: Brand Identity */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer shrink-0 group select-none whitespace-nowrap" 
          onClick={() => onTabChange('STUDY_PLAN')}
        >
          <div className="bg-red-700 text-white w-7 h-7 rounded-md flex items-center justify-center font-bold shadow-2xs group-hover:bg-red-800 transition-colors shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">PT3 Solutions</span>
            <span className="text-slate-300 dark:text-slate-700 font-light">/</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 hidden sm:inline whitespace-nowrap">Study Plan Repository</span>
          </div>
        </div>

        {/* Middle: Executive Navigation Tabs */}
        <nav className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          {navItems.map(tab => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
                }`}
              >
                {IconComp && <IconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`} />}
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Active Context, Tools, Theme & Role Switcher */}
        <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
          {/* Active Student Selector Trigger */}
          <button
            onClick={onOpenStudentSelectModal}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 shadow-2xs flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
            title="Click to select active student profile"
          >
            <UserCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="whitespace-nowrap font-bold">
              {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Select Student'}
            </span>
          </button>

          {/* Theme Switcher Toggle - Icon Only */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
            )}
          </button>

          {/* System Guide & Handover Modal Button */}
          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors shrink-0 whitespace-nowrap"
            title="Open User Guide, Workflows & Handover Instructions"
          >
            <HelpCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="whitespace-nowrap">User Guide</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-xs shrink-0 whitespace-nowrap">
            <button
              onClick={() => onRoleChange('chair')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 ${
                isChair
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs border border-slate-200 dark:border-slate-700 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Academic Chair
            </button>
            <button
              onClick={() => onRoleChange('student')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap shrink-0 ${
                !isChair
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs border border-slate-200 dark:border-slate-700 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Student View
            </button>
          </div>

          {/* Utility Action Buttons */}
          {isChair && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-2.5 shrink-0 whitespace-nowrap">
              <button
                onClick={onOpenImport}
                title="Import Unit Offerings & Prerequisites CSV/Seed"
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 whitespace-nowrap"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap font-bold">Import CSV</span>
              </button>

              <button
                onClick={onOpenAudit}
                title="View System Change Log & Audit Trail"
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 whitespace-nowrap"
              >
                <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                <span className="whitespace-nowrap font-bold">Change Log</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
