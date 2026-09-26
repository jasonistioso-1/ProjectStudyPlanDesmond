import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, RotateCcw, CheckCircle2, ShieldCheck, Lock, AlertCircle, XCircle, Send, MessageSquareWarning, Maximize2, X } from 'lucide-react';

export default function SignaturePad({
  student,
  yearLevel = null,
  yearName = '',
  planStatus,
  planUnitsCount = 0,
  isAlreadyAgreed = false,
  isYearCompleted = false,
  isYearLocked = false,
  onAgreePlan,
  onRejectPlan,
  currentSignature = null
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signMode, setSignMode] = useState('draw'); // 'draw' | 'type'
  const [typedName, setTypedName] = useState(student ? `${student.first_name || ''} ${student.last_name || ''}`.trim() : 'Alex Mercer');
  const [agreedConfirmed, setAgreedConfirmed] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedSignatureData, setSavedSignatureData] = useState(currentSignature || null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (currentSignature) {
      setSavedSignatureData(currentSignature);
    }
  }, [currentSignature]);

  const handleConfirmRejection = () => {
    if (!rejectReason.trim()) {
      alert('Please enter a comment/reason for requesting changes before submitting.');
      return;
    }
    if (onRejectPlan) {
      onRejectPlan(rejectReason.trim(), yearLevel);
    }
  };

  // Initialize canvas context when modal opens or signMode changes
  useEffect(() => {
    if (isModalOpen && signMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a'; // slate-900 / dark ink
    }
  }, [isModalOpen, signMode]);

  // Handle canvas drawing events with coordinate scaling
  const getCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if ((clientX === undefined || clientY === undefined) && e.nativeEvent) {
      clientX = e.nativeEvent.clientX;
      clientY = e.nativeEvent.clientY;
    }

    if ((clientX === undefined || clientY === undefined) && e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    if (clientX === undefined) clientX = 0;
    if (clientY === undefined) clientY = 0;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.target && e.target.setPointerCapture && e.pointerId !== undefined) {
      try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
    }

    isDrawingRef.current = true;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // slate-900 dark ink

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!hasDrawn) setHasDrawn(true);
  };

  const stopDrawing = (e) => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      if (e && e.target && e.target.releasePointerCapture && e.pointerId !== undefined) {
        try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Generate Digital Signature Payload
  const handleConfirmSignature = () => {
    let signatureDataUrl = '';
    if (signMode === 'draw') {
      if (!hasDrawn) {
        alert('Please draw your signature in the signature box before confirming.');
        return;
      }
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    } else {
      if (!typedName.trim()) {
        alert('Please type your full name for digital signature endorsement.');
        return;
      }
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="90">
        <text x="15" y="55" font-family="Georgia, serif" font-style="italic" font-size="32" fill="#0f172a">${typedName}</text>
        <line x1="15" y1="70" x2="385" y2="70" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6"/>
      </svg>`;
      signatureDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
    }

    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) + ' SGT';

    const verificationHash = `SIG-Y${yearLevel || 'ALL'}-` + Math.random().toString(36).substring(2, 7).toUpperCase();

    const signatureObj = {
      yearLevel,
      type: signMode,
      name: typedName,
      dataUrl: signatureDataUrl,
      timestamp,
      verificationHash
    };

    setSavedSignatureData(signatureObj);
    setIsModalOpen(false);

    if (onAgreePlan) {
      onAgreePlan(signatureObj, yearLevel);
    }
  };

  // 1. RENDER COMPLETED YEAR STATE (e.g., Year 1 passed in Academic History)
  if (isYearCompleted) {
    return (
      <div className="bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-4 shadow-2xs space-y-2 font-sans mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-extrabold text-emerald-900 dark:text-emerald-200 font-heading">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {yearName ? `${yearName} Digital Sign-Off` : `Year ${yearLevel} Sign-Off`}: PASSED & COMPLETED
          </span>
          <span className="font-mono text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">
            ACADEMIC RECORD
          </span>
        </div>
        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
          All subjects in {yearName || `Year ${yearLevel}`} are completed & passed in official academic history. Progression sealed.
        </p>
      </div>
    );
  }

  // 2. RENDER LOCKED YEAR STATE (e.g., Year 3 locked because Year 2 not done)
  if (isYearLocked) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 text-center space-y-1.5 shadow-2xs font-sans mt-3">
        <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Lock className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold font-heading">{yearName ? `${yearName} Sign-Off Locked` : `Year ${yearLevel} Sign-Off Locked`}</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Complete and sign Year {yearLevel > 1 ? yearLevel - 1 : 1} study progression first before unlocking sign-off for {yearName || `Year ${yearLevel}`}.
        </p>
      </div>
    );
  }

  // 3. RENDER AGREED & SIGNED STATE FOR THIS YEAR
  if (isAlreadyAgreed && savedSignatureData) {
    return (
      <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 md:p-5 space-y-3 shadow-xs font-sans mt-4 transition-colors">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-950 dark:text-emerald-200">
          <span className="flex items-center gap-2 font-heading text-xs font-extrabold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Official Digital Sign-Off: AGREED & SIGNED
          </span>
          <span className="font-mono text-[11px] bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-bold">
            {savedSignatureData.verificationHash || `SIG-Y${yearLevel}`}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3 shadow-2xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Signee Account</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white font-sans">
              {student ? `${student.first_name} ${student.last_name}` : 'Student'} ({student?.student_number || 'PT3-2026-001'})
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono font-medium mt-0.5">
              Signed: {savedSignatureData.timestamp || 'Official Record'}
            </span>
          </div>

          {savedSignatureData.dataUrl && (
            <div className="h-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 p-1 flex items-center justify-center shrink-0 max-w-[140px]">
              <img src={savedSignatureData.dataUrl} alt="Signature" className="max-h-full object-contain" />
            </div>
          )}
        </div>
      </div>
    );
  }

  const isReadyToSign = signMode === 'draw' ? hasDrawn : typedName.trim().length > 0;

  // 4. RENDER SIGN-OFF CARD & FULLSCREEN MODAL OVERLAY
  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5 shadow-xs font-sans mt-4 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 mt-0.5 sm:mt-0">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-heading tracking-tight">
                  Official Digital Sign-Off
                </h4>
                <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  72 CP Plan
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Review your 3-year trimester schedule and open the signature pad to endorse your degree plan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-2 shadow-xs border border-slate-900 dark:border-emerald-500 cursor-pointer active:scale-95 shrink-0"
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
            <span>Sign Study Plan</span>
          </button>
        </div>
      </div>

      {/* FULLSCREEN ZOOMED-IN SIGNATURE MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                    Digital Signature Pad
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Endorsing {yearName ? yearName.replace(/\s*Study Plan$/i, '').replace(/\s*Plan$/i, '') : `Year ${yearLevel}`} Progression
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setSignMode('draw')}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  signMode === 'draw'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PenTool className="w-4 h-4 text-emerald-400 dark:text-emerald-200" />
                <span>Draw Signature (Mouse / Touch)</span>
              </button>
              <button
                type="button"
                onClick={() => setSignMode('type')}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  signMode === 'type'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Type className="w-4 h-4 text-amber-400 dark:text-amber-200" />
                <span>Type Signature</span>
              </button>
            </div>

            {/* Canvas / Input Box (Large Zoomed View) */}
            {signMode === 'draw' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span>Draw your official signature inside the box:</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-red-600 dark:text-red-400 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear Canvas
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white rounded-2xl overflow-hidden relative shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={650}
                    height={220}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    onPointerCancel={stopDrawing}
                    style={{ touchAction: 'none' }}
                    className="w-full h-56 cursor-crosshair bg-white select-none block"
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-sm italic gap-1">
                      <PenTool className="w-6 h-6 opacity-40 mb-1" />
                      <span>Sign here with your mouse, pen, or touch...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name Endorsement
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your full legal name..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-inner">
                  <p className="text-3xl font-serif italic text-slate-900 dark:text-emerald-400 tracking-wide">
                    {typedName.trim() || 'Your Signature Name'}
                  </p>
                </div>
              </div>
            )}

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-3 p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={agreedConfirmed}
                onChange={(e) => setAgreedConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer"
              />
              <span className="leading-relaxed">
                I confirm and agree to {yearName || `Year ${yearLevel}`} course progression (12 CP per period limit) and state that this signature is legally binding for my academic enrolment.
              </span>
            </label>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSignature}
                disabled={!agreedConfirmed || !isReadyToSign}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
                  agreedConfirmed && isReadyToSign
                    ? 'bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Apply Signature</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

