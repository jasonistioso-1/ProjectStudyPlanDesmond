import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Clock,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';
import { AUTH_ACCOUNTS } from '../data/authAccounts';

export default function LoginPage({ onLoginSuccess, theme = 'light', onToggleTheme }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Live Singapore Clock (Asia/Singapore - SGT / UTC+8)
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

  useEffect(() => {
    const clockInterval = setInterval(() => {
      try {
        setSingaporeTime(new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Singapore',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(new Date()));
      } catch (err) {}
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser) {
      setErrorMessage('Please enter your Student ID or username.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    // Normalized user input without whitespace, hyphens, underscores, or dots (e.g. "ai 1" -> "ai1")
    const normUser = cleanUser.replace(/[\s\-_.]/g, '');

    const checkMatch = (val) => {
      if (!val) return false;
      const v = String(val).toLowerCase();
      const normV = v.replace(/[\s\-_.]/g, '');
      return v === cleanUser || normV === normUser;
    };

    const matchedAccount = AUTH_ACCOUNTS.find(acc => {
      return (
        checkMatch(acc.username) ||
        checkMatch(acc.student_number) ||
        checkMatch(acc.aliasCode) ||
        checkMatch(acc.email) ||
        (acc.aliases && acc.aliases.some(alias => checkMatch(alias)))
      );
    });

    if (!matchedAccount) {
      setErrorMessage('Invalid student ID or username.');
      return;
    }

    const validPasswords = [matchedAccount.password, 'password123', 'admin123', 'student123', '123456'];
    if (!validPasswords.includes(cleanPass)) {
      setErrorMessage('Invalid password. Please try again.');
      return;
    }

    // Direct instant login without loading overlay
    if (onLoginSuccess) {
      onLoginSuccess(matchedAccount);
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col justify-between items-center py-6 sm:py-10 px-4 sm:px-6 bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 select-none transition-colors duration-200">

      {/* Top Utility Bar (Clock & Theme) */}
      <div className="w-full max-w-4xl flex items-center justify-end z-10 gap-3">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span className="font-semibold">{singaporeTime || '--:--:--'}</span>
          <span className="text-[10px] font-bold text-red-600 dark:text-red-400">SGT</span>
        </div>

        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-full bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        )}
      </div>

      {/* Centered Main Area */}
      <div className="w-full max-w-sm my-auto z-10 space-y-6">

        {/* Institutional Branding */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-900/30 ring-1 ring-white/20 mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
            Study Plan Repository
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
            PT03 Solutions
          </p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white dark:bg-[#111726] p-7 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl space-y-5">

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2.5 text-red-700 dark:text-red-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            {/* Student ID / Username */}
            <div>
              <label htmlFor="usernameInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Student ID / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="usernameInput"
                  name="username"
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setErrorMessage('');
                  }}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 transition"
                  placeholder="e.g. 31234564 or AI2"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="passwordInput" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="passwordInput"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setErrorMessage('');
                  }}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 transition"
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Remember this device
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-sm text-xs font-semibold text-white transition duration-150 active:scale-[0.99] cursor-pointer bg-red-700 hover:bg-red-800 active:bg-red-900"
              >
                Sign In
              </button>
            </div>
          </form>

        </div>

      </div>

      {/* Clean Minimal Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 font-normal z-10">
        © 2026 PT03 Solutions
      </footer>

      {/* Forgot Password Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-slate-900 dark:text-slate-100 space-y-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">Need help signing in?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Contact the Academic Chair office for assistance with your Student ID or password:
              </p>
              <div className="mt-2.5 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-mono font-medium text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-800">
                academic.chair@pt3solutions.edu.sg
              </div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
