import React, { useState } from 'react';
import { X, BookOpen, Plus } from 'lucide-react';

export default function AddUnitModal({ onAddUnit, onClose }) {
  const [unitCode, setUnitCode] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [creditPoints, setCreditPoints] = useState(3);
  const [level, setLevel] = useState(100);
  const [prereqs, setPrereqs] = useState('');
  const [offerings, setOfferings] = useState(['T1', 'T2', 'T3']);
  const [error, setError] = useState('');

  const handleToggleOffering = (term) => {
    setOfferings(prev => 
      prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!unitCode.trim()) {
      setError('Unit Code is required (e.g. ICT399)');
      return;
    }
    if (!unitTitle.trim()) {
      setError('Unit Title is required (e.g. Advanced Cybersecurity Architecture)');
      return;
    }

    const newUnit = {
      unit_id: Date.now(),
      code: unitCode.trim().toUpperCase(),
      title: unitTitle.trim(),
      credit_points: Number(creditPoints),
      level: Number(level),
      prerequisites: prereqs.trim() ? prereqs.split(/[,;&/]+/).map(p => p.trim().toUpperCase()) : [],
      offerings: offerings.length > 0 ? offerings : ['T1', 'T2']
    };

    onAddUnit(newUnit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative font-sans text-slate-900 dark:text-slate-100 transition-colors">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
              Add New Course Unit Manually
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Create a custom degree unit and add it directly into the Course Catalog & Plan Builder.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200 font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Unit Code *
              </label>
              <input
                type="text"
                placeholder="e.g. ICT399"
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold uppercase"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Credit Points
              </label>
              <select
                value={creditPoints}
                onChange={(e) => setCreditPoints(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold"
              >
                <option value={3}>3 CP (Standard Unit)</option>
                <option value={6}>6 CP (Double Project)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Unit Title / Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Advanced Cybersecurity Architecture"
              value={unitTitle}
              onChange={(e) => setUnitTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Prerequisites (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. ICT159, ICT167 or None"
              value={prereqs}
              onChange={(e) => setPrereqs(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold uppercase"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Trimester / Semester Offerings
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {['T1', 'T2', 'T3', 'S1', 'S2'].map(term => {
                const active = offerings.includes(term);
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleToggleOffering(term)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      active
                        ? 'bg-red-700 text-white border-red-700 shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {term} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save & Add Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
