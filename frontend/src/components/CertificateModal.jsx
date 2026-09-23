import React, { useEffect } from 'react';
import { Award, CheckCircle, Printer, X } from 'lucide-react';

export default function CertificateModal({ certificate, onClose }) {
  useEffect(() => {
    if (!certificate) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [certificate, onClose]);

  if (!certificate) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white border-2 border-emerald-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative text-slate-900 my-8 font-sans"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header */}
        <div className="text-center border-b border-slate-200 pb-6 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border-2 border-[#008652] mb-3 text-[#008652] shadow-sm">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            PT3 SOLUTIONS
          </h1>
          <p className="text-xs tracking-widest text-slate-500 uppercase font-mono font-bold mt-1">
            OFFICIAL CERTIFICATE OF STUDY PLAN ENTITLEMENT
          </p>
        </div>

        {/* Certificate Body Content */}
        <div className="space-y-4 text-sm leading-relaxed text-slate-800 font-medium">
          <p className="text-center font-mono text-xs text-[#008652] font-bold">
            Certificate ID: <strong>{certificate.certificateId}</strong>
          </p>

          <p className="text-center italic text-slate-600">
            This hereby certifies that the official Study Plan for student:
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center my-4 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900">
              {certificate.studentName}
            </h2>
            <p className="text-xs font-mono text-slate-600 font-bold">Student ID: {certificate.studentNumber}</p>
            <p className="text-xs font-bold text-[#008652] mt-1">{certificate.courseName}</p>
            <p className="text-[11px] text-slate-600 font-medium">Campus Location: {certificate.campus}</p>
          </div>

          <p className="text-xs text-slate-700 text-center leading-relaxed font-medium">
            Has been fully audited, complies with all prerequisite rules and teaching period availability at <strong>PT3 Solutions</strong>, and is officially <strong>FINAL APPROVED</strong> by the Academic Chair.
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono my-4">
            <div>
              <span className="text-slate-500 block">TOTAL CREDIT POINTS:</span>
              <span className="text-[#008652] font-black">{certificate.totalCreditPoints} CP</span>
            </div>
            <div>
              <span className="text-slate-500 block">ISSUED BY:</span>
              <span className="text-slate-900 font-bold">PT3 Solutions Academic Board</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block">APPROVAL TIMESTAMP:</span>
              <span className="text-[#008652] font-bold">{new Date(certificate.approvedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-6">
          <span className="text-xs text-[#008652] flex items-center gap-1.5 font-mono font-bold">
            <CheckCircle className="w-4 h-4 text-[#008652]" /> Verified Digital Signature
          </span>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print Certificate
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#008652] hover:bg-[#007044] text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
