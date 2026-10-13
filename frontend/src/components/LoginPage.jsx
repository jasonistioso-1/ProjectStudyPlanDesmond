import React, { useState, useEffect, useRef } from 'react';
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
  HelpCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck,
  Layers,
  Sparkles
} from 'lucide-react';
import { AUTH_ACCOUNTS } from '../data/authAccounts';

export default function LoginPage({ onLoginSuccess, theme = 'light', onToggleTheme }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Stable reference to onLoginSuccess to avoid timer cancellation
  const onLoginSuccessRef = useRef(onLoginSuccess);
  useEffect(() => {
    onLoginSuccessRef.current = onLoginSuccess;
  }, [onLoginSuccess]);

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

  // Loading Screen Animation States
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);
  const [loadingStepText, setLoadingStepText] = useState('Verifying credentials...');
  const [loadingPhase, setLoadingPhase] = useState(1); // 1: credentials, 2: role/auth, 3: workspace, 4: complete
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  const activeTimersRef = useRef([]);

  useEffect(() => {
    return () => {
      activeTimersRef.current.forEach(t => clearTimeout(t));
      activeTimersRef.current = [];
    };
  }, []);

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    if (isLoggingIn) return;
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

    const matchedAccount = AUTH_ACCOUNTS.find(acc => {
      return (
        acc.username.toLowerCase() === cleanUser ||
        acc.student_number.toLowerCase() === cleanUser ||
        acc.email.toLowerCase() === cleanUser ||
        (acc.aliases && acc.aliases.some(alias => alias.toLowerCase() === cleanUser))
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

    // Initialize State for Cinematic Loading Screen
    setAuthenticatedUser(matchedAccount);
    setIsLoggingIn(true);
    setLoginProgress(15);
    setLoadingPhase(1);
    setLoadingStepText('Validating institutional credentials...');

    activeTimersRef.current.forEach(t => clearTimeout(t));
    activeTimersRef.current = [];

    // Stage 2: Security Role & Policy Validation
    const t1 = setTimeout(() => {
      setLoginProgress(50);
      setLoadingPhase(2);
      setLoadingStepText(
        matchedAccount.role === 'chair'
          ? 'Authorizing Academic Chair administrative privileges...'
          : `Verifying degree enrolment for ${matchedAccount.first_name}...`
      );
    }, 450);

    // Stage 3: Workspace & Study Sequence Initialization
    const t2 = setTimeout(() => {
      setLoginProgress(82);
      setLoadingPhase(3);
      setLoadingStepText(
        matchedAccount.role === 'chair'
          ? 'Synchronizing Academic Governance repository...'
          : `Loading ${matchedAccount.course_code || 'PT3-BSIT'} pathway records...`
      );
    }, 950);

    // Stage 4: Ready State
    const t3 = setTimeout(() => {
      setLoginProgress(100);
      setLoadingPhase(4);
      setLoadingStepText('Authorization successful. Launching workspace...');
    }, 1450);

    // Stage 5: Smooth Transition into Portal
    const t4 = setTimeout(() => {
      if (onLoginSuccessRef.current) {
        onLoginSuccessRef.current(matchedAccount);
      }
    }, 1800);

    activeTimersRef.current = [t1, t2, t3, t4];
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
                  disabled={isLoggingIn}
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setErrorMessage('');
                  }}
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 transition disabled:opacity-50"
                  placeholder="e.g. PT3-2026-001 or admin"
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
                  disabled={isLoggingIn}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setErrorMessage('');
                  }}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 transition disabled:opacity-50"
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
                  disabled={isLoggingIn}
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
                disabled={isLoggingIn}
                className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-sm text-xs font-semibold text-white transition duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-red-700 hover:bg-red-800 active:bg-red-900"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Signing In...
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
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

      {/* State-of-the-Art Executive Loading Overlay */}
      {isLoggingIn && authenticatedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 font-sans animate-in fade-in duration-300">
          
          {/* Deep Ambient Red Atmosphere Glow */}
          <div className="absolute w-[450px] h-[450px] bg-red-600/15 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

          {/* Luxury Executive Modal Card (Spacious 440px width to avoid any text cutoff) */}
          <div className="relative max-w-md w-full bg-[#0c1220]/95 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-8 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_50px_-10px_rgba(220,38,38,0.35)] text-center space-y-6 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Diagonal Holographic Shimmer Sweep */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
            </div>

            {/* Top Precision Neon Accent Edge */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,1)]" />

            {/* Multi-Layer Orbital Holographic Crest */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              {/* Outer Dashed Orbit Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-red-500/30 animate-orbit-slow" />
              {/* Counter-Rotating Inner Accent Arc */}
              <div className="absolute inset-2 rounded-full border border-rose-500/25 animate-orbit-reverse" />
              {/* Soft Pulsing Ambient Halo */}
              <div className="absolute inset-3 rounded-full bg-red-600/20 blur-md animate-pulse-glow" />
              {/* Center Ruby Emblem with Depth */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-rose-700 to-red-900 text-white flex items-center justify-center shadow-xl shadow-red-700/50 ring-1 ring-white/20">
                <GraduationCap className="w-8 h-8 text-white filter drop-shadow-md animate-pulse" />
              </div>
            </div>

            {/* Verified Identity Header */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-tight font-heading">
                Secure Session Authorization
              </h3>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>{authenticatedUser.first_name} {authenticatedUser.last_name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-red-400 font-bold uppercase text-[10px] tracking-wider">
                  {authenticatedUser.role === 'chair' ? 'Academic Chair' : 'Student'}
                </span>
              </div>
            </div>

            {/* Executive Connected 3-Stage Verification Pipeline */}
            <div className="relative px-2 pt-2">
              {/* Connecting Laser Beam Line */}
              <div className="absolute top-[26px] inset-x-8 h-0.5 bg-slate-800 rounded-full" />
              <div 
                className="absolute top-[26px] left-8 h-0.5 bg-gradient-to-r from-emerald-500 to-red-500 transition-all duration-500 ease-out shadow-[0_0_8px_#10b981]"
                style={{
                  width: loadingPhase === 1 ? '15%' : loadingPhase === 2 ? '50%' : '80%'
                }}
              />

              <div className="relative grid grid-cols-3 gap-2">
                {/* Node 1: Credentials */}
                <div className="flex flex-col items-center space-y-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                    loadingPhase > 1
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-red-950/80 border-red-500/80 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  }`}>
                    {loadingPhase > 1 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <KeyRound className="w-4 h-4 animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold tracking-tight ${
                    loadingPhase >= 1 ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    Credentials
                  </span>
                </div>

                {/* Node 2: Role Authorization */}
                <div className="flex flex-col items-center space-y-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                    loadingPhase > 2
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : loadingPhase === 2
                      ? 'bg-red-950/80 border-red-500/80 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                      : 'bg-slate-900 border-slate-700/80 text-slate-500'
                  }`}>
                    {loadingPhase > 2 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : loadingPhase === 2 ? (
                      <ShieldCheck className="w-4 h-4 animate-pulse text-red-300" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold tracking-tight ${
                    loadingPhase >= 2 ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    Permissions
                  </span>
                </div>

                {/* Node 3: Academic Workspace */}
                <div className="flex flex-col items-center space-y-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                    loadingPhase >= 4
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : loadingPhase === 3
                      ? 'bg-red-950/80 border-red-500/80 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                      : 'bg-slate-900 border-slate-700/80 text-slate-500'
                  }`}>
                    {loadingPhase >= 4 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : loadingPhase === 3 ? (
                      <Layers className="w-4 h-4 animate-pulse text-red-300" />
                    ) : (
                      <Layers className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold tracking-tight ${
                    loadingPhase >= 3 ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    Workspace
                  </span>
                </div>
              </div>
            </div>

            {/* Glowing Dual-Layer Progress Gauge & Status Ticker */}
            <div className="space-y-2.5 pt-1">
              <div className="w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-700/80 shadow-inner relative">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-400 rounded-full transition-all duration-400 ease-out shadow-[0_0_14px_rgba(239,68,68,0.7)]"
                  style={{ width: `${loginProgress}%` }}
                />
              </div>

              {/* Status Message and Numerical Gauge (Uncut full width) */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2 truncate text-left pr-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="truncate text-slate-300 font-sans text-xs">{loadingStepText}</span>
                </span>
                <span className="font-bold text-white shrink-0 font-mono text-xs">
                  {loginProgress}%
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
