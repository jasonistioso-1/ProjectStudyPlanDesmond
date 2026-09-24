import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, RotateCcw, CheckCircle2, ShieldCheck, Lock, AlertCircle } from 'lucide-react';

export default function SignaturePad({ student, planStatus, planUnitsCount, isAlreadyAgreed, onAgreePlan, currentSignature }) {
  const [signMode, setSignMode] = useState('draw'); // 'draw' | 'type'
  const [typedName, setTypedName] = useState(student ? `${student.first_name || ''} ${student.last_name || ''}`.trim() : 'Alex Mercer');
  const [agreedConfirmed, setAgreedConfirmed] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedSignatureData, setSavedSignatureData] = useState(currentSignature || null);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

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
      <div className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 rounded-2xl p-6 text-center space-y-3 shadow-xs font-sans">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <span className="bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Governance Action Locked
          </span>
          <h3 className="text-sm font-extrabold text-amber-950 dark:text-amber-100 mt-2 font-heading">
            Student Digital Sign-Off Blocked
          </h3>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-300 max-w-lg mx-auto leading-relaxed font-normal">
          Your Academic Chair has not yet recommended a study plan for your profile (Current status: <strong className="uppercase">{planStatus === 'draft' ? 'Drafting' : planStatus}</strong> with <strong>{planUnitsCount} CP</strong>).
        </p>
        <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200 dark:border-amber-900/60 max-w-md mx-auto text-left flex items-start gap-2.5 text-[11px] text-slate-700 dark:text-slate-300">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Required SOP Step:</strong> Switch to Academic Chair View or wait for your Academic Chair to populate units into Year 1–3 and click <strong>"Recommend to Student"</strong>.
          </span>
        </div>
      </div>
    );
  }

  // RENDER INTERACTIVE DIGITAL SIGNATURE PAD
  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-2xl mx-auto shadow-2xs space-y-5 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
              Student Digital Signature & Agreement Pad
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Provide your digital endorsement to confirm approval of your 72 CP degree progression.
            </p>
          </div>
        </div>
        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
          Official Clearance
        </span>
      </div>

      {/* Mode Switcher: Draw vs Type */}
      {!isAlreadyAgreed && (
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setSignMode('draw')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              signMode === 'draw'
                ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>✍️ Draw Signature</span>
          </button>
          <button
            type="button"
            onClick={() => setSignMode('type')}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
              signMode === 'type'
                ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>⌨️ Type Digital Signature</span>
          </button>
        </div>
      )}

      {/* Interactive Signature Input Canvas or Input Box */}
      {!isAlreadyAgreed ? (
        <div className="space-y-3">
          {signMode === 'draw' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Draw your signature below using mouse or touch:</span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 font-bold text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Canvas
                </button>
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-inner relative">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[130px] cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs italic font-serif">
                    Sign here with mouse or finger...
                  </div>
                )}
                <div className="absolute bottom-2 left-3 right-3 border-b border-slate-300 dark:border-slate-700 pointer-events-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs text-slate-600 dark:text-slate-400 font-medium">
                Type your full student name for digital signature rendering:
              </label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Signature Preview</span>
                <p className="text-2xl font-serif italic text-slate-900 dark:text-emerald-400 border-b border-slate-300 dark:border-slate-700 pb-2 max-w-xs mx-auto">
                  {typedName.trim() || 'Your Name'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ALREADY AGREED DISPLAY CARD */
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
            <span className="flex items-center gap-1.5 font-heading">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Authenticated Digital Signature Recorded
            </span>
            <span className="font-mono text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded">
              {savedSignatureData?.verificationHash || 'SIG-VERIFIED'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Signee</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-sans">
                {student ? `${student.first_name} ${student.last_name}` : 'Alex Mercer'} ({student?.student_number || 'PT3-2026-001'})
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-mono">
                Timestamp: {savedSignatureData?.timestamp || '24 SEP 2026 14:20 SGT'}
              </span>
            </div>

            {savedSignatureData?.dataUrl && (
              <div className="h-12 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 p-1 flex items-center justify-center shrink-0 max-w-[180px]">
                <img src={savedSignatureData.dataUrl} alt="Student Digital Signature" className="max-h-full object-contain" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Checkbox */}
      <label className="flex items-start justify-center gap-3 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 select-none text-left bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <input
          type="checkbox"
          checked={agreedConfirmed || isAlreadyAgreed}
          disabled={isAlreadyAgreed}
          onChange={(e) => setAgreedConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
        />
        <span>
          I confirm that I have reviewed the credit load (maximum 12 CP per trimester) and prerequisite progression sequence for my degree program.
        </span>
      </label>

      {/* Submit Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={handleConfirmSignature}
          disabled={(!agreedConfirmed && !isAlreadyAgreed) || isAlreadyAgreed || !isReadyToSign}
          className={`px-6 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-sm ${
            isAlreadyAgreed
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 cursor-default'
              : (agreedConfirmed && isReadyToSign)
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{isAlreadyAgreed ? 'Study Plan Agreed & Digitally Signed' : 'Sign & Agree to Study Plan'}</span>
        </button>
      </div>
    </div>
  );
}
