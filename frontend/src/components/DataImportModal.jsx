import React, { useState, useRef } from 'react';
import { Database, Upload, CheckCircle2, AlertCircle, X, FileSpreadsheet, Download, FileText, Check, AlertTriangle } from 'lucide-react';
import { importSeedData } from '../services/api';

export default function DataImportModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('excel'); // 'excel' | 'json'
  const [importType, setImportType] = useState('units'); // 'units' | 'offerings' | 'prerequisites'
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [rowErrors, setRowErrors] = useState([]);
  const [status, setStatus] = useState({ loading: false, success: null, error: null });
  const fileInputRef = useRef(null);

  // Exact sample header structure:
  // Unit Code | Unit Name | Strict Prerequisite | 2027 & 2028 Trimester Offer
  const sampleExcelCSV = `Unit Code,Unit Name,Strict Prerequisite,2027 & 2028 Trimester Offer
ICT100,Transition to IT,None,T1, T2, T3
ICT158,Introduction to Computer Systems,None,T1, T3
ICT159,Foundations of Programming,None,T1, T2, T3
ICT167,Principles of Computer Science,ICT159,T1, T2
ICT201,IT Project Management,ICT158,T1, T2, T3
ICT202,Machine Learning,ICT159,T2, T3
ICT203,Artificial Intelligence,ICT167,T1, T3
ICT283,Data Structures & Algorithms,ICT167,T1, T2
ICT302,IT Professional Practice (Capstone),ICT201,T1, T2`;

  const parseContent = (text) => {
    if (!text || !text.trim()) {
      setParsedData([]);
      setRowErrors([]);
      return;
    }

    // Parse JSON
    if (activeTab === 'json' || text.trim().startsWith('[')) {
      try {
        const json = JSON.parse(text);
        setParsedData(json);
        setRowErrors([]);
        return;
      } catch (err) {
        setRowErrors([`Invalid JSON payload format: ${err.message}`]);
        setParsedData([]);
        return;
      }
    }

    // Excel / CSV / Tab-Separated Parsing
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      setParsedData([]);
      setRowErrors(['The uploaded file or dataset payload is empty.']);
      return;
    }

    const errors = [];
    const validRows = [];

    // Identify header line
    const headerLine = lines[0];
    const isTab = headerLine.includes('\t');
    const headers = isTab
      ? headerLine.split('\t').map(h => h.trim().toLowerCase())
      : headerLine.split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

    let colCodeIdx = headers.findIndex(h => h.includes('code') || h.includes('unit code'));
    let colNameIdx = headers.findIndex(h => h.includes('name') || h.includes('title') || h.includes('unit name'));
    let colPrereqIdx = headers.findIndex(h => h.includes('prerequisite') || h.includes('prereq') || h.includes('strict'));
    let colOfferIdx = headers.findIndex(h => h.includes('offer') || h.includes('trimester') || h.includes('period') || h.includes('semester'));

    // Fallbacks if no header detected
    if (colCodeIdx === -1) colCodeIdx = 0;
    if (colNameIdx === -1) colNameIdx = 1;
    if (colPrereqIdx === -1) colPrereqIdx = 2;
    if (colOfferIdx === -1) colOfferIdx = 3;

    const hasHeader = headers.some(h => h.includes('unit') || h.includes('code') || h.includes('name') || h.includes('prereq') || h.includes('offer'));
    const startRowIdx = hasHeader ? 1 : 0;

    for (let i = startRowIdx; i < lines.length; i++) {
      const rowNum = i + 1; // 1-indexed row number in CSV/Excel!
      const line = lines[i];

      const cols = isTab
        ? line.split('\t').map(c => c.trim().replace(/^["']|["']$/g, ''))
        : line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));

      const unitCode = cols[colCodeIdx] || '';
      const unitName = cols[colNameIdx] || '';
      const prereq = cols[colPrereqIdx] || 'None';
      const offeringsRaw = cols[colOfferIdx] || 'T1, T2';

      // Line Validation Rules:
      if (!unitCode) {
        errors.push(`Row ${rowNum}: 'Unit Code' (Column 1) cannot be empty.`);
        continue;
      }

      if (!unitName) {
        errors.push(`Row ${rowNum} (${unitCode}): 'Unit Name' (Column 2) cannot be empty.`);
        continue;
      }

      const parsedOfferings = offeringsRaw.split(/[,;&/]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
      const invalidOfferings = parsedOfferings.filter(p => !['S1', 'S2', 'T1', 'T2', 'T3'].includes(p));

      if (invalidOfferings.length > 0) {
        errors.push(`Row ${rowNum} (${unitCode}): Invalid teaching period code '${invalidOfferings.join(', ')}' in Offerings column. (Valid: S1, S2, T1, T2, or T3)`);
      }

      validRows.push({
        rowNum,
        code: unitCode.toUpperCase(),
        title: unitName,
        prerequisites: prereq === 'None' || !prereq ? [] : prereq.split(/[,;&/]+/).map(p => p.trim().toUpperCase()),
        offerings: parsedOfferings.length > 0 ? parsedOfferings : ['T1', 'T2']
      });
    }

    setRowErrors(errors);
    setParsedData(validRows);
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
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setInputText(content);
      parseContent(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setFileName('sample_unit_catalog.csv');
    setInputText(sampleExcelCSV);
    parseContent(sampleExcelCSV);
  };

  const handleDownloadSampleCSV = () => {
    const blob = new Blob([sampleExcelCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_course_catalog_header.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = async () => {
    if (parsedData.length === 0) {
      setStatus({ loading: false, success: null, error: 'No valid unit records available to import.' });
      return;
    }

    try {
      setStatus({ loading: true, success: null, error: null });
      const res = await importSeedData(importType, parsedData);
      setStatus({ loading: false, success: res.message || `Successfully imported ${parsedData.length} course unit catalog records!`, error: null });
    } catch (err) {
      setStatus({ loading: false, success: null, error: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-3xl w-full shadow-2xl relative font-sans text-slate-900 dark:text-white transition-colors max-h-[90vh] flex flex-col">
        
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
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
              Course Catalog Excel / CSV Dataset Import Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Upload or paste unit catalog and prerequisite datasets using standard university header structure.
            </p>
          </div>
        </div>

        {/* Format Header Guidance Badge */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-red-600 dark:text-red-400" /> Standard Excel / CSV Header Structure:
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadSampleCSV}
                className="text-[11px] font-bold text-red-700 dark:text-red-400 hover:underline flex items-center gap-1 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded border border-red-200 dark:border-red-900"
              >
                <Download className="w-3 h-3" /> Download Template CSV
              </button>
              <button
                onClick={handleLoadSample}
                className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:underline bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded"
              >
                Load Sample Data
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 font-mono text-[11px] text-center font-semibold bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 py-1 rounded">Unit Code</div>
            <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1 rounded">Unit Name</div>
            <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 py-1 rounded">Strict Prerequisite</div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 py-1 rounded">2027 & 2028 Trimester Offer</div>
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
              Or Paste Raw CSV / Excel Text Payload:
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
                  <CheckCircle2 className="w-4 h-4" /> Valid Records Preview ({parsedData.length} Units Ready to Import):
                </span>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-48 overflow-y-auto text-xs font-sans">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] sticky top-0">
                    <tr>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Row</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Unit Code</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Unit Name</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Prerequisite</th>
                      <th className="p-2 border-b border-slate-200 dark:border-slate-700">Offerings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-mono text-slate-400 text-[11px]">{row.rowNum}</td>
                        <td className="p-2 font-mono font-bold text-red-600 dark:text-red-400">{row.code}</td>
                        <td className="p-2 font-semibold text-slate-900 dark:text-white">{row.title}</td>
                        <td className="p-2 font-mono text-amber-600 dark:text-amber-400">{row.prerequisites.length > 0 ? row.prerequisites.join(', ') : 'None'}</td>
                        <td className="p-2 font-mono text-emerald-600 dark:text-emerald-400">{row.offerings.join(', ')}</td>
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
