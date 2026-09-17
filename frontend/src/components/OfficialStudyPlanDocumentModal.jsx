import React, { useRef, useState } from 'react';
import { Printer, Download, X, CheckCircle2, FileText, ExternalLink } from 'lucide-react';

export default function OfficialStudyPlanDocumentModal({ student, planUnits = [], currentPlan, onClose }) {
  const documentRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!student) return null;

  const years = [
    { level: 1, yearLabel: 'Year 1 – 2026' },
    { level: 2, yearLabel: 'Year 2 – 2027' },
    { level: 3, yearLabel: 'Year 3 – 2028' }
  ];

  const getSemesterUnits = (yearLevel, periodId) => {
    return planUnits.filter(u => u.year_level === yearLevel && u.period_id === periodId);
  };

  // Trigger PNG Image Download via html2canvas
  const handleExportPNG = async () => {
    if (!documentRef.current) return;
    try {
      setIsExporting(true);
      if (window.html2canvas) {
        const canvas = await window.html2canvas(documentRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `Study_Plan_${student.student_number || 'Document'}.png`;
        link.click();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('PNG export failed:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const courseTitle = `${student.course_code || 'B1390'} ${student.course_name || 'Bachelor of Information Technology'} (Major: ${student.major || 'Software & Data Systems'})`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl relative my-6 flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-tight">Official Academic Study Plan Document</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> {isExporting ? 'Generating PNG...' : 'Export Image (PNG)'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT CONTAINER (Exact layout matching the photo) */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex-1">
          <div
            ref={documentRef}
            className="print-only-document bg-white border-2 border-slate-900 p-6 shadow-md max-w-4xl mx-auto text-slate-900 text-xs font-sans font-medium"
          >
            {/* Header Dark Banner */}
            <div className="bg-slate-900 text-white font-bold text-sm px-4 py-2 mb-3 flex items-center justify-between tracking-tight">
              <span>{courseTitle}</span>
              <span className="text-xs font-mono font-semibold text-emerald-400">PT3 Solutions Official</span>
            </div>

            {/* Academic Chair & Student Metadata Line */}
            <div className="flex flex-wrap justify-between items-center text-xs font-semibold pb-3 border-b border-slate-300 mb-4 px-1 gap-4">
              <div>
                <span className="text-slate-500 font-normal">Academic Chair:</span>{' '}
                <strong className="text-slate-900">Dr Umera Imtinan</strong>
                <span className="text-slate-400 mx-2">|</span>
                <span className="text-slate-500 font-normal font-sans">Student:</span>{' '}
                <strong className="text-slate-900">{student.first_name} {student.last_name} ({student.student_number})</strong>
              </div>
              <div>
                <span className="text-slate-500 font-normal">Start Date:</span>{' '}
                <strong className="text-slate-900">Semester 1 2026</strong>
              </div>
            </div>

            {/* MAIN 3-YEAR STUDY PLAN GRID TABLE (Exact Layout as in Photo) */}
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
                      <span className="font-extrabold text-xs text-slate-900 tracking-wider whitespace-nowrap -rotate-90 select-none">
                        {y.yearLabel}
                      </span>
                    </div>

                    {/* Semester 1 Column */}
                    <div className="w-1/2 border-r-2 border-slate-900 flex flex-col justify-between">
                      <div>
                        {/* Sem 1 Header */}
                        <div className="bg-slate-100 border-b border-slate-900 px-3 py-1 flex justify-between font-extrabold text-xs">
                          <span>Semester 1 Units</span>
                          <span className="font-mono">CP</span>
                        </div>
                        {/* Sem 1 Units List */}
                        <div className="p-2 space-y-1.5 min-h-[90px]">
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
                        <div className="bg-slate-100 border-b border-slate-900 px-3 py-1 flex justify-between font-extrabold text-xs">
                          <span>Semester 2 Units</span>
                          <span className="font-mono">CP</span>
                        </div>
                        {/* Sem 2 Units List */}
                        <div className="p-2 space-y-1.5 min-h-[90px]">
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
                <span className="uppercase tracking-wide">TOTAL CREDIT POINTS</span>
                <span className="font-mono text-base text-slate-900">{planUnits.reduce((sum, u) => sum + Number(u.credit_points || 3), 0)} / 72 CP</span>
              </div>
            </div>

            {/* FOOTER INFORMATION & DISCOVERY UNITS BOX */}
            <div className="border border-slate-400 p-3 bg-slate-50/50 text-[11px] space-y-2 rounded-sm">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                *Discovery and Elective units
              </h4>
              <p className="text-slate-700 leading-normal">
                There are other unit options available to choose from. Check the course visualiser and handbook. Contact your Academic Chair prior to those semesters if you are unsure about these options.
              </p>
              <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-600 font-mono flex items-center justify-between">
                <span>Course Visualiser Handbook: <strong>https://handbook.pt3solutions.edu.au/course-visualiser/</strong></span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Official Clearance Verified
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Footer Actions (Hidden on print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Document format matched to official university physical study plan layout.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
}
