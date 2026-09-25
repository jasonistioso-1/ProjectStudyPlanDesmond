import React, { useState } from 'react';
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
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isChair = activeRole === 'chair';

  const chairNavItems = [
    { id: 'STUDY_PLAN', label: 'Plan Builder', icon: Layers },
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
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-2">
        
        {/* Left: Brand Identity */}
        <div 
          className="flex items-center gap-2 cursor-pointer shrink-0 select-none" 
          onClick={() => { onTabChange('STUDY_PLAN'); setMobileMenuOpen(false); }}
        >
          <div className="bg-red-700 text-white w-7 h-7 rounded-md flex items-center justify-center font-bold shadow-2xs group-hover:bg-red-800 transition-colors shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">PT3 Solutions</span>
            <span className="text-slate-300 dark:text-slate-700 font-light hidden xs:inline">/</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 hidden md:inline">Study Plan Repository</span>
          </div>
        </div>

        {/* Middle: Desktop Navigation Tabs (Hidden on mobile) */}
        <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
          {navItems.map(tab => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
                }`}
              >
                {IconComp && <IconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Desktop Tools & Controls (Hidden on small mobile) */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {/* Active Student Selector Trigger */}
          <button
            onClick={onOpenStudentSelectModal}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 shadow-2xs flex items-center gap-2 transition-colors shrink-0"
            title="Click to select active student profile"
          >
            <UserCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="font-bold">
              {selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Select Student'}
            </span>
          </button>

          {/* Theme Switcher Toggle */}
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

          {/* Role Switcher Pill */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-xs shrink-0">
            <button
              onClick={() => onRoleChange('chair')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 ${
                isChair
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs border border-slate-200 dark:border-slate-700 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Academic Chair
            </button>
            <button
              onClick={() => onRoleChange('student')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 ${
                !isChair
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs border border-slate-200 dark:border-slate-700 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Student View
            </button>
          </div>

          {/* Utility Action Buttons */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-2.5 shrink-0">
            {isChair && (
              <>
                <button
                  onClick={onOpenImport}
                  title="Import Unit Offerings & Prerequisites CSV/Seed"
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold">Import CSV</span>
                </button>

                <button
                  onClick={onOpenAudit}
                  title="View System Change Log & Audit Trail"
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="font-bold">Change Log</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Compact Bar Controls (Visible on mobile / tablet) */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Active Student Selector Mobile */}
          <button
            onClick={onOpenStudentSelectModal}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 max-w-[140px] truncate"
          >
            <UserCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="truncate">{selectedStudent ? selectedStudent.first_name : 'Student'}</span>
          </button>

          {/* Theme Toggle Mobile */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-lg bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* MOBILE SLIDE-DOWN NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 font-sans animate-in slide-in-from-top-2 duration-200 shadow-xl">
          
          {/* Mobile Role Switcher Pill */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => { onRoleChange('chair'); setMobileMenuOpen(false); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                isChair
                  ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Academic Chair
            </button>
            <button
              onClick={() => { onRoleChange('student'); setMobileMenuOpen(false); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                !isChair
                  ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Student View
            </button>
          </div>

          {/* Mobile Nav Items */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1 mb-1">Navigation</div>
            {navItems.map(tab => {
              const isActive = activeTab === tab.id;
              const IconComp = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => { onTabChange(tab.id); setMobileMenuOpen(false); }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {IconComp && <IconComp className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />}
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <span className="text-[10px] font-mono bg-emerald-500 text-white px-2 py-0.5 rounded-md uppercase font-bold">Active</span>}
                </button>
              );
            })}
          </div>

          {/* Mobile Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => { onOpenStudentSelectModal(); setMobileMenuOpen(false); }}
              className="w-full px-3.5 py-2.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-xl text-xs font-bold flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-red-600" /> Switch Student Profile
              </span>
              <span className="font-mono text-[11px] font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                {selectedStudent ? selectedStudent.first_name : 'Select'}
              </span>
            </button>

            {isChair && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => { onOpenImport(); setMobileMenuOpen(false); }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Import CSV
                </button>

                <button
                  onClick={() => { onOpenAudit(); setMobileMenuOpen(false); }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <Clock className="w-3.5 h-3.5 text-red-600" /> Change Log
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
}
