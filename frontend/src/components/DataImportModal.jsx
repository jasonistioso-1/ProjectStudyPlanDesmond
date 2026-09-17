import React, { useState, useRef } from 'react';
import { Database, Upload, CheckCircle2, AlertCircle, X, FileSpreadsheet, Download, FileText, Check, AlertTriangle, Users, BookOpen, Layers, Award } from 'lucide-react';
import * as XLSX from 'xlsx';
import { importSeedData } from '../services/api';

export default function DataImportModal({ onClose }) {
  const [importEntity, setImportEntity] = useState('units'); // 'units' | 'students' | 'offerings' | 'prerequisites' | 'courses'
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [rowErrors, setRowErrors] = useState([]);
  const [status, setStatus] = useState({ loading: false, success: null, error: null });
  const fileInputRef = useRef(null);

  // Sample CSV templates for all database entity schemas:
  const sampleTemplates = {
    units: `Unit Code,Unit Name,Strict Prerequisite,2027 & 2028 Trimester Offer
ICT100,Transition to IT,None,T1, T2, T3
ICT158,Introduction to Computer Systems,None,T1, T3
ICT159,Foundations of Programming,None,T1, T2, T3
ICT167,Principles of Computer Science,ICT159,T1, T2
ICT201,IT Project Management,ICT158,T1, T2, T3
ICT202,Data Analytics & Processing,ICT159,T2, T3
ICT203,Software Architecture & Design,ICT167,T1, T3
ICT283,Data Structures & Algorithms,ICT167,T1, T2
ICT302,IT Professional Practice (Capstone),ICT201,T1, T2`,

    students: `Student Number,First Name,Last Name,Email,Course Code,Location Code,Status
PT3-2026-005,David,Miller,d.miller@student.pt3solutions.edu.sg,PT3-BSIT-AI01,SINGAPORE,active
PT3-2026-006,Jessica,Tan,j.tan@student.pt3solutions.edu.sg,PT3-BSIT-CS02,SINGAPORE,active
PT3-2026-007,Kevin,Wong,k.wong@student.pt3solutions.edu.sg,PT3-BSIT-BIS03,SINGAPORE,part-time`,

    offerings: `Unit Code,Location Code,Period Code,Year Version,Delivery Mode
ICT100,SINGAPORE,T1,2026,internal
ICT100,SINGAPORE,T2,2026,internal
ICT159,SINGAPORE,T1,2026,internal
ICT159,SINGAPORE,T2,2026,internal
ICT202,SINGAPORE,T2,2026,internal`,

    prerequisites: `Unit Code,Prerequisite Unit Code,Minimum Grade,Concurrent Allowed
ICT167,ICT159,P,false
ICT201,ICT158,P,false
ICT202,ICT159,P,false
ICT203,ICT167,P,false
ICT283,ICT167,P,false`,

    courses: `Course Code,Course Name,Degree Level,Total Credit Points
PT3-BSIT-AI01,Bachelor of Information Technology (Major: Artificial Intelligence),Bachelor,72
PT3-BSIT-CS02,Bachelor of Information Technology (Major: Computer Science),Bachelor,72
PT3-BSIT-BIS03,Bachelor of Information Technology (Major: Business Information Systems),Bachelor,72`
  };

  const parseContent = (text, entity = importEntity) => {
    if (!text || !text.trim()) {
      setParsedData([]);
      setRowErrors([]);
      return;
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      setParsedData([]);
      setRowErrors(['The uploaded file or dataset payload is empty.']);
      return;
    }

    const errors = [];
    const validRows = [];

    const headerLine = lines[0];
    const isTab = headerLine.includes('\t');
    const headers = isTab
      ? headerLine.split('\t').map(h => h.trim().toLowerCase())
      : headerLine.split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

    const hasHeader = headers.some(h => 
      h.includes('unit') || h.includes('code') || h.includes('name') || 
      h.includes('prereq') || h.includes('offer') || h.includes('student') || h.includes('email')
    );
    const startRowIdx = hasHeader ? 1 : 0;

    for (let i = startRowIdx; i < lines.length; i++) {
      const rowNum = i + 1;
      const line = lines[i];
      const cols = isTab
        ? line.split('\t').map(c => c.trim().replace(/^["']|["']$/g, ''))
        : line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));

      if (entity === 'units') {
        const unitCode = cols[0] || '';
        const unitName = cols[1] || '';
        const prereq = cols[2] || 'None';
        const offeringsRaw = cols[3] || 'T1, T2';

        if (!unitCode) { errors.push(`Row ${rowNum}: 'Unit Code' (Column 1) cannot be empty.`); continue; }
        if (!unitName) { errors.push(`Row ${rowNum} (${unitCode}): 'Unit Name' (Column 2) cannot be empty.`); continue; }

        const parsedOfferings = offeringsRaw.split(/[,;&/]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
        const invalidOfferings = parsedOfferings.filter(p => !['S1', 'S2', 'T1', 'T2', 'T3'].includes(p));
        if (invalidOfferings.length > 0) {
          errors.push(`Row ${rowNum} (${unitCode}): Invalid teaching period '${invalidOfferings.join(', ')}' in Offerings. (Valid: S1, S2, T1, T2, T3)`);
        }

        validRows.push({
          rowNum,
          code: unitCode.toUpperCase(),
          title: unitName,
          prerequisites: prereq === 'None' || !prereq ? [] : prereq.split(/[,;&/]+/).map(p => p.trim().toUpperCase()),
          offerings: parsedOfferings.length > 0 ? parsedOfferings : ['T1', 'T2']
        });
      } else if (entity === 'students') {
        const studentNum = cols[0] || '';
        const firstName = cols[1] || '';
        const lastName = cols[2] || '';
        const email = cols[3] || '';
        const courseCode = cols[4] || 'PT3-BSIT-AI01';
        const location = cols[5] || 'SINGAPORE';

        if (!studentNum) { errors.push(`Row ${rowNum}: 'Student Number' (Column 1) cannot be empty.`); continue; }
        if (!firstName || !lastName) { errors.push(`Row ${rowNum} (${studentNum}): Student First & Last Name cannot be empty.`); continue; }

        validRows.push({ rowNum, student_number: studentNum, first_name: firstName, last_name: lastName, email, course_code: courseCode, location });
      } else if (entity === 'offerings') {
        const unitCode = cols[0] || '';
        const locationCode = cols[1] || 'SINGAPORE';
        const periodCode = cols[2] || 'T1';
        const yearVersion = Number(cols[3] || 2026);
        const mode = cols[4] || 'internal';

        if (!unitCode) { errors.push(`Row ${rowNum}: 'Unit Code' (Column 1) cannot be empty.`); continue; }
        validRows.push({ rowNum, unit_code: unitCode, location_code: locationCode, period_code: periodCode, year_version: yearVersion, delivery_mode: mode });
      } else if (entity === 'prerequisites') {
        const unitCode = cols[0] || '';
        const prereqCode = cols[1] || '';
        const minGrade = cols[2] || 'P';

        if (!unitCode || !prereqCode) { errors.push(`Row ${rowNum}: Target Unit Code and Prerequisite Code are required.`); continue; }
        validRows.push({ rowNum, unit_code: unitCode, prereq_unit_code: prereqCode, min_grade: minGrade });
      } else if (entity === 'courses') {
        const courseCode = cols[0] || '';
        const courseName = cols[1] || '';
        const degreeLevel = cols[2] || 'Bachelor';
        const totalCP = Number(cols[3] || 72);

        if (!courseCode || !courseName) { errors.push(`Row ${rowNum}: Course Code and Course Name are required.`); continue; }
        validRows.push({ rowNum, code: courseCode, name: courseName, degree_level: degreeLevel, total_credit_points: totalCP });
      }
    }

    setRowErrors(errors);
    setParsedData(validRows);
  };

  const handleEntityChange = (entityKey) => {
    setImportEntity(entityKey);
    setFileName('');
    const sampleText = sampleTemplates[entityKey] || '';
    setInputText(sampleText);
    parseContent(sampleText, entityKey);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    parseContent(val);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target.result;
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          setInputText(csvText);
          parseContent(csvText);
        } catch (err) {
          setRowErrors([`Failed to parse Excel file '${file.name}': ${err.message}`]);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setInputText(content);
        parseContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSampleCSV = () => {
    const content = sampleTemplates[importEntity] || sampleTemplates.units;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sample_${importEntity}_database_schema.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = async () => {
    if (parsedData.length === 0) {
      setStatus({ loading: false, success: null, error: 'No valid records available to import.' });
      return;
    }

    try {
      setStatus({ loading: true, success: null, error: null });
      const res = await importSeedData(importEntity, parsedData);
      setStatus({ loading: false, success: res.message || `Successfully imported ${parsedData.length} ${importEntity} records into database!`, error: null });
    } catch (err) {
      setStatus({ loading: false, success: null, error: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-4xl w-full shadow-2xl relative font-sans text-slate-900 dark:text-slate-100 transition-colors max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shadow-2xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
              Universal Database CSV / Excel Dataset Import Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Import Unit Catalog, Students, Unit Offerings, Prerequisites, or Courses directly into database schema (Section 8).
            </p>
          </div>
        </div>

        {/* Entity Dataset Tab Selector */}
        <div className="flex flex-wrap gap-1.5 mb-4 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          {[
            { key: 'units', label: 'Course Units Catalog', icon: BookOpen },
            { key: 'students', label: 'Student Records', icon: Users },
            { key: 'offerings', label: 'Unit Offerings', icon: Layers },
            { key: 'prerequisites', label: 'Prerequisites', icon: AlertTriangle },
            { key: 'courses', label: 'Degree Programs', icon: Award }
          ].map(ent => {
            const Icon = ent.icon;
            return (
              <button
                key={ent.key}
                onClick={() => handleEntityChange(ent.key)}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  importEntity === ent.key
                    ? 'bg-slate-900 text-white dark:bg-red-700 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{ent.label}</span>
              </button>
            );
          })}
        </div>

        {/* Header Guidance & Template Download */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-red-600 dark:text-red-400" /> Database Schema Header Structure ({importEntity.toUpperCase()}):
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadSampleCSV}
                className="text-[11px] font-bold text-red-700 dark:text-red-400 hover:underline flex items-center gap-1 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded border border-red-200 dark:border-red-900"
              >
                <Download className="w-3.5 h-3.5" /> Download Template CSV
              </button>
              <button
                onClick={() => handleEntityChange(importEntity)}
                className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:underline bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded"
              >
                Load Sample Data
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          
          {/* File Upload Zone */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.xlsx,.xls,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 shadow-2xs"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Upload Excel / CSV File</span>
            </button>
            {fileName && (
              <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                📄 {fileName}
              </span>
            )}
          </div>

          {/* Text Area Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Or Paste CSV / Tab-Separated Excel Dataset Payload:
            </label>
            <textarea
              rows={5}
              value={inputText}
              onChange={handleInputChange}
              placeholder="Paste CSV or tab-separated Excel payload here..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-semibold"
            />
          </div>

          {/* Line-by-Line Error Feedback Box */}
          {rowErrors.length > 0 && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Detected {rowErrors.length} format validation errors across dataset rows:</span>
              </div>
              <ul className="space-y-1.5 text-xs font-mono max-h-32 overflow-y-auto pr-1">
                {rowErrors.map((err, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                      ERROR
                    </span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Valid Data Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Valid Records Preview ({parsedData.length} Records Ready to Import):
                </span>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-48 overflow-y-auto text-xs font-sans">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] sticky top-0">
                    <tr>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Row</th>
                      {importEntity === 'units' && <>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Unit Code</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Unit Name</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Prerequisite</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Offerings</th>
                      </>}
                      {importEntity === 'students' && <>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Student Number</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Name</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Email</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Course</th>
                      </>}
                      {importEntity === 'offerings' && <>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Unit Code</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Location</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Period</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Year</th>
                      </>}
                      {importEntity === 'prerequisites' && <>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Target Unit</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Prerequisite Unit</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Min Grade</th>
                      </>}
                      {importEntity === 'courses' && <>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Course Code</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Course Name</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Degree Level</th>
                        <th className="p-2 border-b border-slate-200 dark:border-slate-700">Total CP</th>
                      </>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-mono text-slate-400 text-[11px]">{row.rowNum}</td>
                        {importEntity === 'units' && <>
                          <td className="p-2 font-mono font-bold text-red-600 dark:text-red-400">{row.code}</td>
                          <td className="p-2 font-semibold text-slate-900 dark:text-white">{row.title}</td>
                          <td className="p-2 font-mono text-amber-600 dark:text-amber-400">{row.prerequisites?.length > 0 ? row.prerequisites.join(', ') : 'None'}</td>
                          <td className="p-2 font-mono text-emerald-600 dark:text-emerald-400">{row.offerings?.join(', ')}</td>
                        </>}
                        {importEntity === 'students' && <>
                          <td className="p-2 font-mono font-bold text-red-600 dark:text-red-400">{row.student_number}</td>
                          <td className="p-2 font-semibold text-slate-900 dark:text-white">{row.first_name} {row.last_name}</td>
                          <td className="p-2 text-slate-500">{row.email}</td>
                          <td className="p-2 font-mono">{row.course_code}</td>
                        </>}
                        {importEntity === 'offerings' && <>
                          <td className="p-2 font-mono font-bold text-red-600 dark:text-red-400">{row.unit_code}</td>
                          <td className="p-2 font-semibold">{row.location_code}</td>
                          <td className="p-2 font-mono text-emerald-600 dark:text-emerald-400">{row.period_code}</td>
                          <td className="p-2 font-mono">{row.year_version}</td>
                        </>}
                        {importEntity === 'prerequisites' && <>
                          <td className="p-2 font-mono font-bold text-red-600 dark:text-red-400">{row.unit_code}</td>
                          <td className="p-2 font-mono text-amber-600 dark:text-amber-400">{row.prereq_unit_code}</td>
                          <td className="p-2 font-mono">{row.min_grade}</td>
                        </>}
                        {importEntity === 'courses' && <>
                          <td className="p-2 font-mono font-bold text-red-600 dark:text-red-400">{row.code}</td>
                          <td className="p-2 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                          <td className="p-2">{row.degree_level}</td>
                          <td className="p-2 font-mono">{row.total_credit_points} CP</td>
                        </>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Status Alert */}
          {status.success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{status.success}</span>
            </div>
          )}
          {status.error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 rounded-xl text-xs text-rose-900 dark:text-rose-200 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel & Close
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={status.loading || parsedData.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Execute Import ({parsedData.length} Records)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
