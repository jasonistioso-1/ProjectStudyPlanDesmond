import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, RotateCcw, CheckCircle2, ShieldCheck, Lock, AlertCircle, XCircle, Send, MessageSquareWarning } from 'lucide-react';

export default function SignaturePad({ student, planStatus, planUnitsCount, isAlreadyAgreed, onAgreePlan, onRejectPlan, currentSignature }) {
  const [signMode, setSignMode] = useState('draw'); // 'draw' | 'type'
  const [typedName, setTypedName] = useState(student ? `${student.first_name || ''} ${student.last_name || ''}`.trim() : 'Alex Mercer');
  const [agreedConfirmed, setAgreedConfirmed] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedSignatureData, setSavedSignatureData] = useState(currentSignature || null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  const handleConfirmRejection = () => {
    if (!rejectReason.trim()) {
      alert('Please enter a comment/reason for requesting changes before submitting.');
      return;
    }
    if (onRejectPlan) {
      onRejectPlan(rejectReason.trim());
    }
  };

  // Initialize canvas context
  useEffect(() => {
    if (signMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0f172a'; // slate-900
    }
  }, [signMode]);

  // Handle canvas drawing events (mouse & touch)
  const getCoordinates = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (isAlreadyAgreed) return;
    isDrawingRef.current = true;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current || isAlreadyAgreed) return;
    e.preventDefault(); // Prevent scrolling on touch
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
      // Generate SVG data url for typed signature
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="70">
        <text x="10" y="45" font-family="Georgia, serif" font-style="italic" font-size="24" fill="#0f172a">${typedName}</text>
        <line x1="10" y1="55" x2="290" y2="55" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4"/>
      </svg>`;
      signatureDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
    }

    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) + ' SGT';

    const verificationHash = 'SIG-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const signatureObj = {
      type: signMode,
      name: typedName,
      dataUrl: signatureDataUrl,
      timestamp,
      verificationHash
    };

    setSavedSignatureData(signatureObj);
    if (onAgreePlan) {
      onAgreePlan(signatureObj);
    }
  };

  const isReadyToSign = signMode === 'draw' ? hasDrawn : typedName.trim().length > 0;
  const isPlanReadyForSignoff = planUnitsCount > 0 && (planStatus === 'recommended' || planStatus === 'agreed' || planStatus === 'approved');

  // RENDER LOCKED STATE: IF PLAN IS EMPTY OR NOT RECOMMENDED BY ACADEMIC CHAIR
  if (!isPlanReadyForSignoff) {
    return (
      <div className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 rounded-3xl p-6 md:p-8 text-center space-y-4 shadow-sm font-sans max-w-2xl mx-auto backdrop-blur-xs">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto shadow-sm ring-4 ring-amber-200/50 dark:ring-amber-900/50">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <span className="bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider font-heading shadow-2xs">
            Signature Locked
          </span>
          <h3 className="text-base font-black text-amber-950 dark:text-amber-100 font-heading">
            Digital Sign-Off Currently Locked
          </h3>
        </div>
        <p className="text-xs text-amber-900/80 dark:text-amber-300 max-w-md mx-auto leading-relaxed font-medium">
          Your study plan is currently being prepared by the Academic Office. Once a recommended study plan is released for your enrollment, you will be able to review and digitally sign it here.
        </p>
        <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-amber-200 dark:border-amber-900/60 max-w-md mx-auto text-center flex items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-300 shadow-2xs font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Status: <strong className="uppercase font-bold text-amber-800 dark:text-amber-300">{planStatus === 'draft' ? 'Drafting in Progress' : planStatus}</strong> ({planUnitsCount} CP)</span>
        </div>
      </div>
    );
  }

  // RENDER INTERACTIVE DIGITAL SIGNATURE PAD
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-3xl mx-auto shadow-xl space-y-6 font-sans backdrop-blur-md relative overflow-hidden">
      {/* Decorative Gradient Glow Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shadow-2xs shrink-0 ring-4 ring-emerald-500/10">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white font-heading tracking-tight">
              Student Digital Signature & Agreement Pad
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Provide your digital endorsement to confirm approval of your 72 CP degree progression.
            </p>
          </div>
        </div>
        <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shrink-0 self-start sm:self-center shadow-2xs font-heading">
          Official Clearance
        </span>
      </div>

      {/* Mode Switcher Tab: Draw vs Type */}
      {!isAlreadyAgreed && (
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs shadow-inner">
          <button
            type="button"
            onClick={() => setSignMode('draw')}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              signMode === 'draw'
                ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-md font-extrabold scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4 text-emerald-400" />
            <span>✍️ Draw Signature</span>
          </button>
          <button
            type="button"
            onClick={() => setSignMode('type')}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              signMode === 'type'
                ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-md font-extrabold scale-[1.01]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-4 h-4 text-amber-400" />
            <span>⌨️ Type Digital Signature</span>
          </button>
        </div>
      )}

      {/* Interactive Signature Input Canvas or Input Box */}
      {!isAlreadyAgreed ? (
        <div className="space-y-4">
          {signMode === 'draw' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <span>Draw your signature below using mouse or touch screen:</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 font-bold text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 px-2.5 py-1 rounded-lg transition-all shadow-2xs active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Canvas
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/80 rounded-2xl overflow-hidden shadow-inner relative group transition-colors hover:border-slate-400 dark:hover:border-slate-600">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[140px] cursor-crosshair touch-none bg-white dark:bg-slate-900"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs italic font-serif space-y-1">
                    <PenTool className="w-5 h-5 text-slate-300 dark:text-slate-600 animate-bounce" />
                    <span>Sign here with mouse or touch gesture...</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-4 right-4 border-b border-slate-200 dark:border-slate-800 pointer-events-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs text-slate-600 dark:text-slate-400 font-bold">
                Type your full student name for digital signature rendering:
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-4.5 py-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans shadow-2xs"
              />
              <div className="p-5 bg-gradient-to-b from-slate-50 to-slate-100/80 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block font-heading">Digital Signature Render Preview</span>
                <p className="text-3xl font-serif italic text-slate-900 dark:text-emerald-400 border-b-2 border-slate-300 dark:border-slate-700 pb-3 max-w-sm mx-auto font-medium">
                  {typedName.trim() || 'Your Full Name'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ALREADY AGREED DISPLAY CARD */
        <div className="bg-emerald-50/90 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700/80 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-black text-emerald-900 dark:text-emerald-200">
            <span className="flex items-center gap-2 font-heading">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Authenticated Digital Signature Recorded
            </span>
            <span className="font-mono text-[11px] bg-emerald-200/90 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-3 py-1 rounded-full font-bold shadow-2xs">
              {savedSignatureData?.verificationHash || 'SIG-VERIFIED'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-extrabold block tracking-wider">Signee Account</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-sans">
                {student ? `${student.first_name} ${student.last_name}` : 'Alex Mercer'} ({student?.student_number || 'PT3-2026-001'})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-mono font-medium">
                Timestamp: {savedSignatureData?.timestamp || '24 SEP 2026 14:20 SGT'}
              </span>
            </div>

            {savedSignatureData?.dataUrl && (
              <div className="h-14 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 p-1.5 flex items-center justify-center shrink-0 max-w-[200px] shadow-2xs">
                <img src={savedSignatureData.dataUrl} alt="Student Digital Signature" className="max-h-full object-contain" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Checkbox */}
      <label className="flex items-start justify-center gap-3.5 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200 select-none text-left bg-slate-50/80 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <input
          type="checkbox"
          checked={agreedConfirmed || isAlreadyAgreed}
          disabled={isAlreadyAgreed}
          onChange={(e) => setAgreedConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer shrink-0"
        />
        <span className="leading-normal">
          I confirm that I have reviewed the credit load (maximum 12 CP per trimester) and prerequisite progression sequence for my degree program.
        </span>
      </label>

      {/* Action Buttons & Rejection Form Section */}
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleConfirmSignature}
            disabled={(!agreedConfirmed && !isAlreadyAgreed) || isAlreadyAgreed || !isReadyToSign}
            className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-98 font-heading ${
              isAlreadyAgreed
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 cursor-default'
                : (agreedConfirmed && isReadyToSign)
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-500/20 cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{isAlreadyAgreed ? 'Study Plan Agreed & Digitally Signed' : 'Sign & Agree to Study Plan'}</span>
          </button>

          {!isAlreadyAgreed && (
            <button
              type="button"
              onClick={() => setShowRejectForm(prev => !prev)}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer font-heading shadow-xs active:scale-98 ${
                showRejectForm
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  : 'bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-950/60 dark:to-rose-950/60 hover:from-amber-100 hover:to-rose-100 dark:hover:from-amber-900 dark:hover:to-rose-900 text-rose-800 dark:text-rose-300 border border-amber-300 dark:border-rose-800'
              }`}
            >
              {showRejectForm ? <XCircle className="w-4 h-4 text-slate-500" /> : <MessageSquareWarning className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
              <span>{showRejectForm ? 'Cancel Request' : 'Reject Plan / Request Changes'}</span>
            </button>
          )}
        </div>

        {/* Executive Redesigned Student Rejection Comment Form */}
        {showRejectForm && !isAlreadyAgreed && (
          <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-100/40 dark:from-amber-950/80 dark:via-orange-950/50 dark:to-amber-900/60 border-2 border-amber-400/90 dark:border-amber-600/90 rounded-3xl p-6 space-y-4 shadow-xl font-sans animate-in slide-in-from-top-3 duration-200 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 dark:border-amber-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <MessageSquareWarning className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950 dark:text-amber-100 font-heading uppercase tracking-wide">
                    Request Changes / Rejection Reason (Required)
                  </h4>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    Provide detailed feedback for the Academic Chair regarding your study plan request.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase font-mono bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700">
                Student Feedback
              </span>
            </div>

            <div className="space-y-1.5">
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why you are requesting changes to this study plan (e.g. medical emergency, scheduling conflict, module preference, part-time adjustment)..."
                className="w-full p-4 bg-white dark:bg-slate-950 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400 shadow-inner font-sans leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-amber-900/70 dark:text-amber-300/70 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                This comment will be sent directly to your Academic Chair.
              </span>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejection}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-black transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 font-heading"
                >
                  <Send className="w-3.5 h-3.5 text-amber-200" />
                  <span>Submit Rejection & Comment to Chair</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

