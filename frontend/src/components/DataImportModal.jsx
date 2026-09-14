import React, { useState } from 'react';
import { Database, Upload, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { importSeedData } from '../services/api';

export default function DataImportModal({ onClose }) {
  const [importType, setImportType] = useState('offerings');
  const [jsonText, setJsonText] = useState('');
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const sampleOfferings = JSON.stringify([
    { unit_code: "ICT100", location_code: "PERTH", period_code: "S1", year_version: 2026, delivery_mode: "internal" },
    { unit_code: "ICT159", location_code: "PERTH", period_code: "S1", year_version: 2026, delivery_mode: "internal" },
    { unit_code: "ICT167", location_code: "PERTH", period_code: "S2", year_version: 2026, delivery_mode: "internal" }
  ], null, 2);

  const samplePrereqs = JSON.stringify([
    { unit_code: "ICT167", prereq_unit_code: "ICT159", min_grade: "P" },
    { unit_code: "MAS162", prereq_unit_code: "MAS164", min_grade: "P" }
  ], null, 2);

  const handleLoadSample = () => {
    if (importType === 'offerings') setJsonText(sampleOfferings);
    else if (importType === 'prerequisites') setJsonText(samplePrereqs);
  };

  const handleImport = async () => {
    try {
      setStatus({ loading: true, success: null, error: null });
      const parsedData = JSON.parse(jsonText);
      const res = await importSeedData(importType, parsedData);
      setStatus({ loading: false, success: res.message, error: null });
    } catch (err) {
      setStatus({ loading: false, success: null, error: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-xl p-6 max-w-xl w-full shadow-2xl relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-extrabold text-slate-900">Data Import Engine (Data-Driven Seed Tool)</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4 font-medium">
          Import new Unit Offerings or Prerequisite datasets directly into the database without altering application code (Section 8).
        </p>

        {/* Import Type Selector */}
        <div className="flex gap-2 mb-4">
          {['offerings', 'prerequisites', 'units'].map(type => (
            <button
              key={type}
              onClick={() => { setImportType(type); setStatus({ loading: false, success: null, error: null }); }}
              className={`flex-1 py-1.5 rounded text-xs font-bold uppercase tracking-wider border transition-colors ${
                importType === type
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-700">JSON Data Payload:</label>
            <button
              onClick={handleLoadSample}
              className="text-[11px] font-bold text-emerald-700 hover:underline"
            >
              Load Sample Payload
            </button>
          </div>
          <textarea
            rows={8}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste JSON array here..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
          />
        </div>

        {/* Status Feedback */}
        {status.success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{status.success}</span>
          </div>
        )}
        {status.error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{status.error}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
          <button
            onClick={handleImport}
            disabled={status.loading || !jsonText}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-extrabold rounded-lg shadow"
          >
            <Upload className="w-4 h-4" /> Execute Import
          </button>
        </div>
      </div>
    </div>
  );
}
