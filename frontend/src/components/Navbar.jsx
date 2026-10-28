import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Bell,
  Sliders,
  CheckCircle2,
  MessageSquare,
  Send,
  Calendar,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';

export default function Navbar({
  currentUser,
  onLogout,
  activeRole,
  activeTab,
  onTabChange,
  selectedStudent,
  onOpenStudentSelectModal,
  storedPlansCount = 4,
  onOpenImport,
  onOpenAudit,
  onOpenGuide,
  theme = 'light',
  onToggleTheme,
  notifications = [],
  onSelectNotification,
  onMarkAllNotificationsRead
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  // Live Singapore Campus Clock (Asia/Singapore - SGT / UTC+8)
  const [singaporeTime, setSingaporeTime] = useState(() => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date());
    } catch (e) {
      return '';
    }
  });

  const [singaporeDate, setSingaporeDate] = useState(() => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Singapore',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(new Date());
    } catch (e) {
      return '';
    }
  });

  useEffect(() => {
    const updateSingaporeClock = () => {
      const now = new Date();
      try {
        setSingaporeTime(new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(now));

        setSingaporeDate(new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Singapore',
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(now));
      } catch (err) {
        console.error('Clock error:', err);
      }
    };

    updateSingaporeClock();
    const interval = setInterval(updateSingaporeClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return;
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const isChair = activeRole === 'chair';
  const roleTarget = isChair ? 'chair' : 'student';

  const filteredNotifications = notifications.filter(n => {
    if (n.role !== roleTarget) return false;
    if (!isChair && currentUser?.role === 'student' && currentUser?.student_id) {
      if (n.studentId && String(n.studentId) !== String(currentUser.student_id)) {
        return false;
      }
    }
    return true;
  });
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  const formatNotificationDate = (n) => {
    if (n.createdTimeMs) {
      const d = new Date(n.createdTimeMs);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (n.timestamp && /\b20\d\d\b/.test(n.timestamp)) {
      return n.timestamp;
    }
    const now = new Date();
    if (n.timestamp === '30 mins ago') {
      const d = new Date(now.getTime() - 30 * 60 * 1000);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (n.timestamp === 'Just now') {
      return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${n.timestamp || now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  };

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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
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
        <div className="hidden lg:flex items-center gap-2.5 shrink-0 relative">
          
          {/* Notifications Bell Icon Button & Dropdown Drawer */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(prev => !prev)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center relative shrink-0 cursor-pointer"
              title={`Notifications (${unreadCount} unread)`}
              aria-label="View Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-[480px] sm:w-[520px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-white font-sans animate-in fade-in duration-150">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <h3 className="text-base font-extrabold font-heading tracking-tight text-slate-900 dark:text-white">
                      Notifications ({isChair ? 'Academic Chair' : 'Student'})
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-black px-3 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && onMarkAllNotificationsRead && (
                      <button
                        onClick={() => onMarkAllNotificationsRead(roleTarget)}
                        className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="w-8 h-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Close notifications"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-10 text-center text-sm font-medium text-slate-400 dark:text-slate-500 italic">
                      No notifications yet.
                    </div>
                  ) : (
                    filteredNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (onSelectNotification) onSelectNotification(n);
                          setNotificationsOpen(false);
                        }}
                        className={`p-5 text-sm transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                          !n.read
                            ? 'bg-red-50/50 dark:bg-red-950/30 border-l-4 border-l-red-600 font-medium'
                            : 'opacity-90'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 font-extrabold text-slate-900 dark:text-white text-base font-heading tracking-tight">
                            <span>{n.title}</span>
                            {!n.read && (
                              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-red-600 text-white shrink-0">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono shrink-0 font-semibold flex items-center gap-1.5" title={n.timestamp}>
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatNotificationDate(n)}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-200 mt-2 leading-relaxed font-sans font-medium">
                          {n.message}
                        </p>
                        {n.actionType && (
                          <div className="mt-3.5 flex items-center gap-2">
                            <span className="inline-flex items-center gap-2 text-xs font-extrabold px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-red-700 hover:bg-slate-800 transition-colors shadow-2xs font-heading tracking-wide">
                              <ChevronRight className="w-4 h-4 text-white" />
                              <span>
                                {n.actionLabel === 'Review & Auto-Generate'
                                  ? (n.layoutType === 'semester' || n.message?.toLowerCase().includes('semester') ? 'View Semester Plan' : 'View Trimester Plan')
                                  : (n.actionLabel || 'View Details')}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Target Student Selector Trigger (For Academic Chair only) */}
          {isChair && onOpenStudentSelectModal && (
            <button
              onClick={onOpenStudentSelectModal}
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 shadow-2xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              title="Click to select target student profile for plan building"
            >
              <UserCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
              <span className="font-bold text-xs truncate max-w-[130px]">
                {selectedStudent && selectedStudent.student_id !== 0
                  ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
                  : 'Select Student'}
              </span>
            </button>
          )}

          {/* Live Singapore Campus Clock */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-mono text-slate-800 dark:text-slate-200 shadow-2xs shrink-0 select-none"
            title={`Singapore Standard Time (SGT / UTC+8)\n${singaporeDate}`}
          >
            <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="font-extrabold text-xs tracking-tight">{singaporeTime || '--:--:--'}</span>
            <span className="text-[9px] font-extrabold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-1 py-0.5 rounded border border-red-200/60 dark:border-red-900/60">
              SGT
            </span>
          </div>

          {/* Current Logged-in User Profile Chip */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1 text-xs shrink-0 shadow-2xs">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center font-extrabold text-[10px] text-white shrink-0 ${
              isChair ? 'bg-red-600' : 'bg-sky-600'
            }`}>
              {currentUser?.avatar || (isChair ? 'AT' : (selectedStudent?.first_name ? `${selectedStudent.first_name[0]}${selectedStudent.last_name ? selectedStudent.last_name[0] : ''}` : 'ST'))}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight truncate max-w-[140px]">
                {currentUser?.first_name
                  ? `${currentUser.first_name} ${currentUser.last_name || ''}`
                  : (isChair ? 'Dr. Aris Thorne' : (selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Student'))}
              </span>
              <span className={`text-[9px] font-mono font-bold leading-none mt-0.5 ${
                isChair ? 'text-red-600 dark:text-red-400' : 'text-sky-600 dark:text-sky-400'
              }`}>
                {isChair ? 'Academic Chair' : (currentUser?.student_number || selectedStudent?.student_number || 'Student')}
              </span>
            </div>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
            )}
          </button>

          {/* Utility Action Buttons */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-2.5 shrink-0">
            {isChair && (
              <button
                onClick={onOpenImport}
                title="Import Unit Offerings & Prerequisites CSV/Seed"
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold">Import CSV</span>
              </button>
            )}

            <button
              onClick={onOpenAudit}
              title="View System Change Log & Audit Trail"
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
              <span className="font-bold">Change Log</span>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out of current account"
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Compact Bar Controls (Visible on mobile / tablet) */}
        <div className="flex lg:hidden items-center gap-1.5">
          {/* Mobile Live Singapore Clock */}
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0 select-none"
            title={`Singapore Standard Time: ${singaporeTime} SGT`}
          >
            <Clock className="w-3 h-3 text-red-600 shrink-0" />
            <span>{singaporeTime || '--:--'}</span>
            <span className="text-[8px] text-red-600 font-extrabold">SGT</span>
          </div>

          {/* Notifications Mobile Button */}
          <button
            onClick={() => setNotificationsOpen(prev => !prev)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative"
            aria-label="View Notifications"
          >
            <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 text-white rounded-full text-[8px] font-extrabold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Active Student Selector Mobile (Chair only) */}
          {isChair && onOpenStudentSelectModal && (
            <button
              onClick={onOpenStudentSelectModal}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 border border-slate-200 dark:border-slate-700 max-w-[120px] truncate"
            >
              <UserCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
              <span className="truncate">{selectedStudent ? selectedStudent.first_name : 'Student'}</span>
            </button>
          )}

          {/* Mobile Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-red-600" />
            </button>
          )}

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
          
          {/* User Profile Header in Mobile Drawer */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white ${
                isChair ? 'bg-red-600' : 'bg-sky-600'
              }`}>
                {currentUser?.avatar || (isChair ? 'AT' : 'ST')}
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}` : (isChair ? 'Dr. Aris Thorne' : 'Student Profile')}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {isChair ? 'Academic Chair' : (currentUser?.student_number || selectedStudent?.student_number)}
                </div>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
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
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
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
            {isChair && onOpenStudentSelectModal && (
              <button
                onClick={() => { onOpenStudentSelectModal(); setMobileMenuOpen(false); }}
                className="w-full px-3.5 py-2.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-red-600" /> Switch Target Student
                </span>
                <span className="font-mono text-[11px] font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                  {selectedStudent ? selectedStudent.first_name : 'Select'}
                </span>
              </button>
            )}

            {isChair && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => { onOpenImport(); setMobileMenuOpen(false); }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Import CSV
                </button>

                <button
                  onClick={() => { onOpenAudit(); setMobileMenuOpen(false); }}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
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
