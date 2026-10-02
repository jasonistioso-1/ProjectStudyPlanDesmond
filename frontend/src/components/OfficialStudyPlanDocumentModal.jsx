import React, { useRef, useState, useEffect } from 'react';
import { Printer, Download, X, CheckCircle2, FileText, FileSpreadsheet, Image as ImageIcon, ShieldCheck, ExternalLink, Award, Sparkles, Layers, Eye } from 'lucide-react';

export default function OfficialStudyPlanDocumentModal({ student, planUnits = [], currentPlan, onClose }) {
  const documentRef = useRef(null);
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' | 'csv' | 'png' | 'jpg'
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

  const years = [
    { level: 1, yearLabel: 'Year 1 – 2026' },
    { level: 2, yearLabel: 'Year 2 – 2027' },
    { level: 3, yearLabel: 'Year 3 – 2028' }
  ];

  const getSemesterUnits = (yearLevel, periodId) => {
    return planUnits.filter(u => u.year_level === yearLevel && u.period_id === periodId);
  };

  // Helper to dynamically obtain html2canvas instance without static import analysis issues
  const getHtml2Canvas = () => {
    return new Promise((resolve, reject) => {
      if (window.html2canvas) {
        resolve(window.html2canvas);
        return;
      }
      const existingScript = document.getElementById('html2canvas-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.html2canvas));
        existingScript.addEventListener('error', (e) => reject(e));
        return;
      }
      const script = document.createElement('script');
      script.id = 'html2canvas-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => {
        if (window.html2canvas) resolve(window.html2canvas);
        else reject(new Error('html2canvas failed to initialize'));
      };
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  };

  // Trigger PNG Image Download via html2canvas
  const handleExportPNG = async () => {
    if (!documentRef.current) return;
    try {
      setIsExporting(true);
      setExportingType('PNG');
      const html2canvasLib = await getHtml2Canvas();
      const canvas = await html2canvasLib(documentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Study_Plan_${student.student_number || 'Document'}.png`;
      link.click();
    } catch (err) {
      console.error('PNG export failed:', err);
      window.print();
    } finally {
      setIsExporting(false);
      setExportingType(null);
    }
  };

  // Trigger JPG Image Download via html2canvas
  const handleExportJPG = async () => {
    if (!documentRef.current) return;
    try {
      setIsExporting(true);
      setExportingType('JPG');
      const html2canvasLib = await getHtml2Canvas();
      const canvas = await html2canvasLib(documentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const image = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = image;
      link.download = `Study_Plan_${student.student_number || 'Document'}.jpg`;
      link.click();
    } catch (err) {
      console.error('JPG export failed:', err);
      window.print();
    } finally {
      setIsExporting(false);
      setExportingType(null);
    }
  };

  // Build CSV raw lines
  const buildCSVLines = () => {
    const lines = [];
    lines.push(`"PT3 SOLUTIONS OFFICIAL ACADEMIC STUDY PLAN DOCUMENT"`);
    lines.push(`"Student Name","${student.first_name || ''} ${student.last_name || ''}"`);
    lines.push(`"Student Number","${student.student_number || ''}"`);
    lines.push(`"Course Code","${student.course_code || 'B1390'}"`);
    lines.push(`"Course Name","${student.course_name || 'Bachelor of Information Technology'}"`);
    lines.push(`"Major Pathway","${student.major || 'Artificial Intelligence'}"`);
    lines.push(`"Total Credit Load","${planUnits.reduce((sum, u) => sum + Number(u.credit_points || 3), 0)} / 72 CP"`);
    lines.push('');
    lines.push('"Year Level","Teaching Period","Unit Code","Unit Title","Credit Points"');

    const periodMap = {
      1: 'Semester 1',
      2: 'Semester 2',
      3: 'Trimester 1',
      4: 'Trimester 2',
      5: 'Trimester 3'
    };

    const sorted = [...planUnits].sort((a, b) => a.year_level - b.year_level || a.period_id - b.period_id);
    sorted.forEach(u => {
      const pName = periodMap[u.period_id] || `Period ${u.period_id}`;
      const titleClean = (u.title || '').replace(/"/g, '""');
      lines.push(`"Year ${u.year_level}","${pName}","${u.code}","${titleClean}","${u.credit_points || 3}"`);
    });
    return lines;
  };

  // Trigger CSV Spreadsheet Download
  const handleExportCSV = () => {
    const lines = buildCSVLines();
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Study_Plan_${student.student_number || 'Document'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const courseTitle = `${student.course_code || 'B1390'} ${student.course_name || 'Bachelor of Information Technology'} (Major: ${student.major || 'Artificial Intelligence'})`;

  // Determine current active tab download trigger
  const handleCurrentDownload = () => {
    if (activeTab === 'pdf') window.print();
    else if (activeTab === 'csv') handleExportCSV();
    else if (activeTab === 'png') handleExportPNG();
    else if (activeTab === 'jpg') handleExportJPG();
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
                Official Academic Study Plan Document
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  VERIFIED RECORD
                </span>
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
              <span>PDF Document</span>
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

            <button
              type="button"
              onClick={() => setActiveTab('png')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
                activeTab === 'png'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>PNG Image</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('jpg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
                activeTab === 'jpg'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>JPG Image</span>
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

        {/* PREVIEW CONTAINER ACCORDING TO ACTIVE FORMAT TAB */}
        <div className="p-6 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex-1">
          
          {/* Format Preview Status Banner */}
          <div className="max-w-4xl mx-auto mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs font-sans">
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-xl text-white shadow-2xs ${
                activeTab === 'pdf' ? 'bg-red-700' :
                activeTab === 'csv' ? 'bg-emerald-600' :
                activeTab === 'png' ? 'bg-sky-600' : 'bg-amber-600'
              }`}>
                {activeTab === 'pdf' ? <FileText className="w-4 h-4" /> :
                 activeTab === 'csv' ? <FileSpreadsheet className="w-4 h-4" /> :
                 activeTab === 'png' ? <ImageIcon className="w-4 h-4" /> :
                 <Download className="w-4 h-4" />}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white font-heading tracking-tight">
                    {activeTab === 'pdf' && 'Official PDF Document Preview'}
                    {activeTab === 'csv' && 'CSV Spreadsheet Dataset Preview'}
                    {activeTab === 'png' && 'High-Resolution PNG Image Preview'}
                    {activeTab === 'jpg' && 'Compressed JPG Photo Snapshot Preview'}
                  </h4>
                  <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                    activeTab === 'pdf' ? 'bg-red-50 text-red-700 border-red-200' :
                    activeTab === 'csv' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    activeTab === 'png' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    LIVE PREVIEW MODE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {activeTab === 'pdf' && 'Previewing exact printable A4 paper format with PT3 Solutions official seal'}
                  {activeTab === 'csv' && 'Previewing tabular study plan dataset and raw CSV payload format'}
                  {activeTab === 'png' && 'Previewing lossless 200% High-DPI graphic snapshot format'}
                  {activeTab === 'jpg' && 'Previewing optimized 95% quality graphic image format'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCurrentDownload}
              disabled={isExporting}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer font-heading flex items-center gap-1.5 ${
                activeTab === 'pdf' ? 'bg-red-700 hover:bg-red-600' :
                activeTab === 'csv' ? 'bg-emerald-600 hover:bg-emerald-500' :
                activeTab === 'png' ? 'bg-sky-600 hover:bg-sky-500' : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {activeTab === 'pdf' ? <Printer className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>
                {isExporting ? `Generating ${activeTab.toUpperCase()}...` : `Download ${activeTab.toUpperCase()}`}
              </span>
            </button>
          </div>

          {/* TAB 1: PDF PRINTABLE PAPER DOCUMENT PREVIEW */}
          {(activeTab === 'pdf' || activeTab === 'png' || activeTab === 'jpg') && (
            <div className="relative">
              {/* Badge for Image Previews */}
              {(activeTab === 'png' || activeTab === 'jpg') && (
                <div className="max-w-4xl mx-auto mb-2 text-right">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    activeTab === 'png' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {activeTab === 'png' ? '🖼️ PNG Format (High DPI 200%)' : '📸 JPG Format (95% Quality Image)'}
                  </span>
                </div>
              )}

              <div
                ref={documentRef}
                className={`print-only-document bg-white border-2 border-slate-900 p-8 shadow-xl max-w-4xl mx-auto text-slate-900 text-xs font-sans font-medium rounded-sm transition-all ${
                  activeTab === 'png' ? 'ring-4 ring-sky-500/20' : activeTab === 'jpg' ? 'ring-4 ring-amber-500/20' : ''
                }`}
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
                        <span className="text-[10px] font-extrabold uppercase bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded font-mono">
                          ACADEMIC REPOSITORY
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-bold font-sans">
                        Office of Academic Chair & Course Governance System
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-slate-900 text-white font-mono text-[10px] font-extrabold px-3 py-1 rounded shadow-2xs tracking-wider uppercase">
                      OFFICIAL CERTIFIED STUDY PLAN
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
                  {years.map((y, yearIdx) => {
                    const sem1Units = getSemesterUnits(y.level, 1);
                    const sem2Units = getSemesterUnits(y.level, 2);
                    const sem1CP = sem1Units.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);
                    const sem2CP = sem2Units.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);

                    return (
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

                        {/* Semester 1 Column */}
                        <div className="w-1/2 border-r-2 border-slate-900 flex flex-col justify-between">
                          <div>
                            {/* Sem 1 Header */}
                            <div className="bg-slate-100 border-b border-slate-900 px-3 py-1 flex justify-between font-extrabold text-xs font-heading">
                              <span>Semester 1 Units</span>
                              <span className="font-mono">CP</span>
                            </div>
                            {/* Sem 1 Units List */}
                            <div className="p-2.5 space-y-1.5 min-h-[90px]">
                              {sem1Units.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic text-center py-4">Empty Slot</p>
                              ) : (
                                sem1Units.map((u, i) => (
                                  <div key={i} className="flex justify-between items-start text-[11px] leading-tight font-medium">
                                    <span>
                                      <strong className="font-mono text-slate-900 mr-1.5 font-bold">{u.code}</strong>
                                      <span className="text-slate-700">{u.title}</span>
                                    </span>
                                    <span className="font-mono text-slate-900 font-bold ml-2 shrink-0">{u.credit_points || 3} CP</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Sem 1 Total Footer */}
                          <div className="border-t border-slate-900 px-3 py-1 flex justify-between font-bold text-xs bg-slate-50">
                            <span>Total</span>
                            <span className="font-mono">{sem1CP} CP</span>
                          </div>
                        </div>

                        {/* Semester 2 Column */}
                        <div className="w-1/2 flex flex-col justify-between">
                          <div>
                            {/* Sem 2 Header */}
                            <div className="bg-slate-100 border-b border-slate-900 px-3 py-1 flex justify-between font-extrabold text-xs font-heading">
                              <span>Semester 2 Units</span>
                              <span className="font-mono">CP</span>
                            </div>
                            {/* Sem 2 Units List */}
                            <div className="p-2.5 space-y-1.5 min-h-[90px]">
                              {sem2Units.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic text-center py-4">Empty Slot</p>
                              ) : (
                                sem2Units.map((u, i) => (
                                  <div key={i} className="flex justify-between items-start text-[11px] leading-tight font-medium">
                                    <span>
                                      <strong className="font-mono text-slate-900 mr-1.5 font-bold">{u.code}</strong>
                                      <span className="text-slate-700">{u.title}</span>
                                    </span>
                                    <span className="font-mono text-slate-900 font-bold ml-2 shrink-0">{u.credit_points || 3} CP</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Sem 2 Total Footer */}
                          <div className="border-t border-slate-900 px-3 py-1 flex justify-between font-bold text-xs bg-slate-50">
                            <span>Total</span>
                            <span className="font-mono">{sem2CP} CP</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                      <span>Signee: <strong className="text-slate-900 font-black">{student.student_number || 'PT3-2026-001'}</strong></span>
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
            <div className="max-w-4xl mx-auto space-y-4 font-sans">
              
              {/* CSV Data Table Grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    CSV Data Grid Table Preview:
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    {planUnits.length} Study Plan Records
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                      <tr>
                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Year Level</th>
                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Teaching Period</th>
                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Unit Code</th>
                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Unit Title</th>
                        <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Credit Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {planUnits.map((u, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 font-bold font-mono">Year {u.year_level}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">Period {u.period_id}</td>
                          <td className="p-2.5 font-mono font-bold text-red-600 dark:text-red-400">{u.code}</td>
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{u.title}</td>
                          <td className="p-2.5 font-mono text-emerald-600 font-bold">{u.credit_points || 3} CP</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Raw CSV Text Payload Box */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                  <span>Raw CSV File Payload:</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400">UTF-8 Encoded CSV</span>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono overflow-x-auto text-emerald-300 leading-relaxed max-h-48">
                  {buildCSVLines().join('\n')}
                </pre>
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
              disabled={isExporting}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer font-heading flex items-center gap-1.5 ${
                activeTab === 'pdf' ? 'bg-red-700 hover:bg-red-600' :
                activeTab === 'csv' ? 'bg-emerald-600 hover:bg-emerald-500' :
                activeTab === 'png' ? 'bg-sky-600 hover:bg-sky-500' : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {activeTab === 'pdf' ? <Printer className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>
                {isExporting ? `Exporting ${activeTab.toUpperCase()}...` : `Download ${activeTab.toUpperCase()}`}
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
