import React, { useRef, useState, useEffect } from 'react';
import { Printer, Download, X, CheckCircle2, FileText, FileSpreadsheet, ShieldCheck, ExternalLink, Award, Sparkles, Layers, Eye } from 'lucide-react';

export default function OfficialStudyPlanDocumentModal({ student, planUnits = [], currentPlan, onClose }) {
  const documentRef = useRef(null);
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' | 'csv'
  const [isExporting, setIsExporting] = useState(false);
  const [exportingType, setExportingType] = useState(null);

  useEffect(() => {
    if (!student) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [student, onClose]);

  if (!student) return null;

  const isApproved = currentPlan?.status === 'approved';

  const years = [
    { level: 1, yearLabel: 'Year 1 – 2026' },
    { level: 2, yearLabel: 'Year 2 – 2027' },
    { level: 3, yearLabel: 'Year 3 – 2028' }
  ];

  const getPeriodName = (u) => {
    if (!u) return 'Trimester 1';
    if (u.period_name) return u.period_name;
    const code = String(u.period_code || '').toUpperCase();
    if (code === 'T1' || code === 'TRI1') return 'Trimester 1';
    if (code === 'T2' || code === 'TRI2') return 'Trimester 2';
    if (code === 'T3' || code === 'TRI3') return 'Trimester 3';
    if (code === 'S1' || code === 'SEM1') return 'Semester 1';
    if (code === 'S2' || code === 'SEM2') return 'Semester 2';

    const pid = Number(u.period_id);
    if (pid === 1) return 'Semester 1';
    if (pid === 2) return 'Semester 2';
    if (pid === 3) return 'Trimester 1';
    if (pid === 4) return 'Trimester 2';
    if (pid === 5) return 'Trimester 3';
    if (pid) return `Trimester ${pid}`;
    return 'Trimester 1';
  };

  const isTrimester = planUnits.some(u => Number(u.period_id) >= 3 || String(u.period_code || '').toUpperCase().startsWith('T'));
  const activePeriods = isTrimester ? [
    { period_id: 3, label: 'Trimester 1 Units' },
    { period_id: 4, label: 'Trimester 2 Units' },
    { period_id: 5, label: 'Trimester 3 Units' }
  ] : [
    { period_id: 1, label: 'Semester 1 Units' },
    { period_id: 2, label: 'Semester 2 Units' }
  ];

  const getPeriodUnits = (yearLevel, targetPid) => {
    return planUnits.filter(u => {
      const uYear = Number(u.year_level || 1);
      const uPid = Number(u.period_id);
      if (uYear !== Number(yearLevel)) return false;

      if (uPid === Number(targetPid)) return true;
      if (targetPid === 3 && (u.period_code === 'T1' || uPid === 1)) return true;
      if (targetPid === 4 && (u.period_code === 'T2' || uPid === 2)) return true;
      if (targetPid === 5 && (u.period_code === 'T3')) return true;
      if (targetPid === 1 && (u.period_code === 'S1' || uPid === 3)) return true;
      if (targetPid === 2 && (u.period_code === 'S2' || uPid === 4 || uPid === 5)) return true;

      return false;
    });
  };

  // Helper to extract clean course name and major without double/duplicate words
  const rawCourseName = student.course_name || 'Bachelor of Information Technology';
  const cleanCourseName = rawCourseName.replace(/\s*\(Major:[^)]+\)/gi, '').trim();
  const majorName = student.major || (rawCourseName.match(/\(Major:\s*([^)]+)\)/i)?.[1]) || 'Software Engineering';
  const courseCode = student.course_code || 'PT3-BSIT-SE01';
  const courseTitle = `${courseCode} ${cleanCourseName}${majorName ? ` (Major: ${majorName})` : ''}`;

  // Build CSV raw lines
  const buildCSVLines = () => {
    const lines = [];
    lines.push(`"PT3 SOLUTIONS OFFICIAL ACADEMIC STUDY PLAN DOCUMENT"`);
    lines.push(`"Student Name","${(student.first_name || '') + ' ' + (student.last_name || '')}"`);
    lines.push(`"Student Number","${student.student_number || ''}"`);
    lines.push(`"Course Code","${courseCode}"`);
    lines.push(`"Course Name","${cleanCourseName}"`);
    lines.push(`"Major Pathway","${majorName}"`);
    lines.push(`"Plan Status","${String(currentPlan?.status || 'approved').toUpperCase()}"`);
    lines.push(`"Total Credit Load","${planUnits.reduce((sum, u) => sum + Number(u.credit_points || 3), 0)} / 72 CP"`);
    lines.push('');
    lines.push('"Year Level","Academic Year","Teaching Period","Sequence Order","Unit Code","Unit Title","Credit Points"');

    const sorted = [...planUnits].sort((a, b) => {
      const yA = Number(a.year_level || 1);
      const yB = Number(b.year_level || 1);
      if (yA !== yB) return yA - yB;
      const pA = Number(a.period_id || 3);
      const pB = Number(b.period_id || 3);
      if (pA !== pB) return pA - pB;
      return Number(a.sequence_order || 1) - Number(b.sequence_order || 1);
    });

    if (sorted.length === 0) {
      lines.push('"Year 1","2026","Trimester 1","1","","No Units Scheduled","0 CP"');
    } else {
      sorted.forEach((u, idx) => {
        const pName = getPeriodName(u);
        const titleClean = (u.title || u.unit_title || '').replace(/"/g, '""');
        const unitCode = u.code || u.unit_code || '';
        const yLvl = Number(u.year_level || 1);
        const acadYear = yLvl === 1 ? 2026 : yLvl === 2 ? 2027 : 2028;
        const seq = u.sequence_order || (idx + 1);
        lines.push(`"Year ${yLvl}","${acadYear}","${pName}","${seq}","${unitCode}","${titleClean}","${u.credit_points || 3} CP"`);
      });
    }
    return lines;
  };

  // Trigger CSV Spreadsheet Download with UTF-8 BOM
  const handleExportCSV = () => {
    if (!isApproved) {
      alert('Official Document Outputs Restricted: Study plan must be officially Approved by Academic Chair before exporting (Rule OUT-03).');
      return;
    }
    const lines = buildCSVLines();
    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Study_Plan_${student.student_number || 'Document'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Determine current active tab download trigger
  const handleCurrentDownload = () => {
    if (activeTab === 'pdf') window.print();
    else if (activeTab === 'csv') handleExportCSV();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl relative my-6 flex flex-col max-h-[94vh] overflow-hidden border border-slate-200"
      >
        
        {/* Top Control Bar & Format Selector Tabs */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-red-700 text-white flex items-center justify-center font-black text-sm font-mono shadow-md border border-red-500/40">
              PT3
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-heading tracking-tight flex items-center gap-2 text-white">
                {isApproved ? 'Confirmation of Enrolment (CoE) & Approved Study Plan' : 'Official Academic Study Plan Document'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Select a format below to preview before downloading</p>
            </div>
          </div>
          
          {/* Format Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl border border-slate-700/80 shrink-0 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
                activeTab === 'pdf'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isApproved ? 'CoE Document (PDF)' : 'PDF Document'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('csv')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
                activeTab === 'csv'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV Spreadsheet</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors hidden sm:block cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Output Restriction Alert for Unapproved Plans (OUT-03) */}
        {!isApproved && (
          <div className="no-print mx-6 mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 font-sans shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold font-heading uppercase text-[11px] text-amber-800 dark:text-amber-300 block">
                Official Document Outputs Restricted (Status: {String(currentPlan?.status || 'draft').toUpperCase()})
              </span>
              <span>
                Formal Confirmation of Enrolment (CoE) and CSV exports are strictly restricted until the study plan is officially <strong>Approved</strong> by the Academic Chair.
              </span>
            </div>
          </div>
        )}

        {/* PREVIEW CONTAINER ACCORDING TO ACTIVE FORMAT TAB */}
        <div className="p-6 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex-1">
          
          {/* TAB 1: PDF PRINTABLE PAPER DOCUMENT PREVIEW */}
          {activeTab === 'pdf' && (
            <div className="relative">

              <div
                ref={documentRef}
                className="print-only-document bg-white border-2 border-slate-900 p-8 shadow-xl max-w-4xl mx-auto text-slate-900 text-xs font-sans font-medium rounded-sm transition-all"
              >
                
                {/* BRANDING HEADER: PT3 Solutions Official Logo & Header */}
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-red-700 text-white flex items-center justify-center font-black text-xl font-mono shadow-md border-2 border-slate-900 shrink-0">
                      PT3
                    </div>
                    <div>
                      <div className="text-base font-black tracking-tight text-slate-900 font-heading flex items-center gap-2">
                        <span>PT3 SOLUTIONS</span>
                      </div>
                      <div className="text-xs text-slate-600 font-bold font-sans">
                        Office of Academic Chair & Course Governance System
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-slate-900 text-white font-mono text-[10px] font-extrabold px-3 py-1 rounded shadow-2xs tracking-wider uppercase">
                      {isApproved ? 'CONFIRMATION OF ENROLMENT (CoE) - APPROVED' : `STUDY PLAN - ${String(currentPlan?.status || 'DRAFT').toUpperCase()}`}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 font-semibold">
                      Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Course Title Banner */}
                <div className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 mb-4 flex items-center justify-between tracking-tight rounded-xs">
                  <span className="font-heading">{courseTitle}</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    72 CP Degree Requirement
                  </span>
                </div>

                {/* Academic Chair & Student Metadata Line */}
                <div className="flex flex-wrap justify-between items-center text-xs font-semibold pb-3 border-b border-slate-300 mb-4 px-1 gap-4">
                  <div>
                    <span className="text-slate-500 font-normal">Academic Chair:</span>{' '}
                    <strong className="text-slate-900">Dr. Aris Thorne</strong>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="text-slate-500 font-normal font-sans">Student:</span>{' '}
                    <strong className="text-slate-900">{student.first_name} {student.last_name} ({student.student_number})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-normal">Commencement:</span>{' '}
                    <strong className="text-slate-900">Semester 1 2026</strong>
                  </div>
                </div>

                {/* MAIN 3-YEAR STUDY PLAN GRID TABLE */}
                <div className="border-2 border-slate-900 mb-4">
                  {years.map((y, yearIdx) => (
                    <div
                      key={y.level}
                      className={`flex border-b border-slate-900 ${yearIdx === years.length - 1 ? 'border-b-0' : ''}`}
                    >
                      {/* Leftmost Rotated Year Label Box */}
                      <div className="w-12 bg-slate-100 border-r-2 border-slate-900 flex items-center justify-center p-1 shrink-0">
                        <span className="font-extrabold text-xs text-slate-900 tracking-wider whitespace-nowrap -rotate-90 select-none font-heading">
                          {y.yearLabel}
                        </span>
                      </div>

                      {/* Period Columns (2 for Semesters, 3 for Trimesters) */}
                      {activePeriods.map((p, pIdx) => {
                        const units = getPeriodUnits(y.level, p.period_id);
                        const periodCP = units.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
                        const colWidth = activePeriods.length === 3 ? 'w-1/3' : 'w-1/2';
                        const isLastCol = pIdx === activePeriods.length - 1;

                        return (
                          <div key={p.period_id} className={`${colWidth} ${!isLastCol ? 'border-r-2 border-slate-900' : ''} flex flex-col justify-between`}>
                            <div>
                              <div className="bg-slate-100 border-b border-slate-900 px-3 py-1 flex justify-between font-extrabold text-xs font-heading">
                                <span>{p.label}</span>
                                <span className="font-mono">CP</span>
                              </div>
                              <div className="p-2.5 space-y-1.5 min-h-[90px]">
                                {units.length === 0 ? (
                                  <p className="text-[11px] text-slate-400 italic text-center py-4">Empty Slot</p>
                                ) : (
                                  units.map((u, i) => (
                                    <div key={i} className="flex justify-between items-start text-[11px] leading-tight font-medium">
                                      <span>
                                        <strong className="font-mono text-slate-900 mr-1.5 font-bold">{u.code || u.unit_code}</strong>
                                        <span className="text-slate-700">{u.title || u.unit_title}</span>
                                      </span>
                                      <span className="font-mono text-slate-900 font-bold ml-2 shrink-0">{u.credit_points || 3} CP</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            <div className="border-t border-slate-900 px-3 py-1 flex justify-between font-bold text-xs bg-slate-50">
                              <span>Total</span>
                              <span className="font-mono">{periodCP} CP</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Bottom Right TOTAL CREDIT POINTS Box */}
                <div className="flex justify-end mb-4">
                  <div className="bg-slate-200 border-2 border-slate-900 px-6 py-2 flex items-center gap-4 text-xs font-black">
                    <span className="uppercase tracking-wide font-heading">TOTAL CREDIT POINTS</span>
                    <span className="font-mono text-base text-slate-900">{planUnits.reduce((sum, u) => sum + Number(u.credit_points || 3), 0)} / 72 CP</span>
                  </div>
                </div>

                {/* DUAL DIGITAL SIGNATURE & AUTHORISATION BOX */}
                <div className="grid grid-cols-2 gap-4 mb-4 border-2 border-slate-900 p-3.5 bg-slate-50/90 rounded-xs">
                  {/* Academic Chair Endorsement Column */}
                  <div className="border-r border-slate-300 pr-3.5 space-y-1">
                    <div className="text-[10px] font-extrabold uppercase text-slate-500 font-mono tracking-wider">
                      Academic Chair Endorsement
                    </div>
                    <div className="text-xs font-black text-slate-900 font-heading">Dr. Aris Thorne</div>
                    <div className="text-[10px] text-slate-600 italic">Academic Chair & IT Course Director</div>
                    <div className="mt-2.5 pt-1.5 border-t border-slate-300 flex items-center justify-between text-[10px] font-mono">
                      <span className="font-extrabold text-slate-900 font-heading">Status: <strong className="text-slate-900 font-black">APPROVED & CERTIFIED</strong></span>
                      <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider font-mono shadow-2xs">OFFICIAL SEAL</span>
                    </div>
                  </div>

                  {/* Student Digital Sign-Off Column */}
                  <div className="pl-1 space-y-1">
                    <div className="text-[10px] font-extrabold uppercase text-slate-500 font-mono tracking-wider flex items-center justify-between">
                      <span>Student Digital Sign-Off</span>
                      {currentPlan?.studentSignature?.verificationHash && (
                        <span className="text-slate-900 font-mono text-[9px] font-black bg-slate-200 px-1.5 py-0.5 rounded border border-slate-400">
                          {currentPlan.studentSignature.verificationHash}
                        </span>
                      )}
                    </div>

                    {currentPlan?.studentSignature?.dataUrl ? (
                      <div className="h-9 border border-slate-300 rounded bg-white p-0.5 flex items-center justify-start my-0.5">
                        <img src={currentPlan.studentSignature.dataUrl} alt="Student Digital Signature" className="max-h-full max-w-[200px] object-contain" />
                      </div>
                    ) : (
                      <div className="text-xs font-serif italic text-slate-800 my-1 font-semibold border-b border-dashed border-slate-400 pb-0.5 inline-block">
                        {student.first_name} {student.last_name}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-700 font-bold flex items-center justify-between font-mono pt-1.5 border-t border-slate-300">
                      <span>Signee: <strong className="text-slate-900 font-black">{student.student_number || '31234561'}</strong></span>
                      <span className="text-slate-600 font-semibold">{currentPlan?.studentSignature?.timestamp || 'Digitally Endorsed'}</span>
                    </div>
                  </div>
                </div>

                {/* FOOTER INFORMATION & DISCOVERY UNITS BOX */}
                <div className="border border-slate-400 p-3 bg-slate-50/50 text-[11px] space-y-2 rounded-sm">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1 font-heading">
                    *Discovery and Elective units
                  </h4>
                  <p className="text-slate-700 leading-normal">
                    There are other unit options available to choose from. Check the course visualiser and handbook. Contact your Academic Chair prior to those semesters if you are unsure about these options.
                  </p>
                  <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-600 font-mono flex items-center justify-between">
                    <span>Course Visualiser Handbook: <strong className="text-slate-900">https://handbook.pt3solutions.edu.au/course-visualiser/</strong></span>
                    <span className="text-slate-900 font-black flex items-center gap-1 font-heading text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-900 shrink-0" /> PT3 Solutions Official Clearance
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CSV SPREADSHEET DATA PREVIEW */}
          {activeTab === 'csv' && (
            <div className="max-w-4xl mx-auto space-y-5 font-sans animate-in fade-in duration-200">
              
              {/* Summary Stats Cards Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
                      Scheduled Units
                    </div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                      {planUnits.length} {planUnits.length === 1 ? 'Record' : 'Records'}
                    </div>
                  </div>
                </div>

                <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400 font-mono">
                      Credit Load Total
                    </div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      {planUnits.reduce((sum, u) => sum + Number(u.credit_points || 3), 0)} / 72 CP
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                      Format Encoding
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      UTF-8 CSV (Excel Ready)
                    </div>
                  </div>
                </div>
              </div>

              {/* CSV Data Table Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Real-time CSV Data Table Grid Preview
                  </h4>
                  <span className="text-[10px] font-mono font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                    {planUnits.length} Active Rows
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider font-mono">
                      <tr>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Year Level</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Teaching Period</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Unit Code</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Unit Title</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Credit Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {planUnits.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-10 text-center text-slate-400 dark:text-slate-500 italic font-medium">
                            Belum ada mata kuliah yang dipilih dalam rencana studi ini (0 Records)
                          </td>
                        </tr>
                      ) : (
                        planUnits.map((u, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-bold font-mono text-slate-700 dark:text-slate-300">Year {u.year_level || 1}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400 font-semibold">{getPeriodName(u)}</td>
                            <td className="p-3 font-mono font-bold">
                              <span className="bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800/80 px-3 py-0.5 rounded-full text-[11px]">
                                {u.code || u.unit_code}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-900 dark:text-white">{u.title || u.unit_title}</td>
                            <td className="p-3 font-mono">
                              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                                {u.credit_points || 3} CP
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Footer Actions (Hidden on print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Preview format: <strong className="text-slate-900 font-extrabold uppercase">{activeTab} Mode</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCurrentDownload}
              disabled={isExporting || !isApproved}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 font-heading flex items-center gap-1.5 ${
                !isApproved
                  ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                  : activeTab === 'pdf'
                    ? 'bg-red-700 hover:bg-red-600 cursor-pointer'
                    : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
              }`}
              title={!isApproved ? 'Outputs are restricted until the study plan is officially approved by the Academic Chair' : 'Export document'}
            >
              {activeTab === 'pdf' ? <Printer className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>
                {activeTab === 'pdf'
                  ? (isApproved ? 'Print / Download CoE (PDF)' : 'PDF Restricted (Approval Required)')
                  : (isApproved ? 'Download Approved Plan (CSV)' : 'CSV Restricted (Approval Required)')}
              </span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer font-heading"
            >
              Close Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
