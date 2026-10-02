import React, { useState, useEffect } from 'react';
import { X, BookOpen, Plus } from 'lucide-react';

export default function AddUnitModal({ onAddUnit, onClose }) {
  const [unitCode, setUnitCode] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [creditPoints, setCreditPoints] = useState(3);
  const [level, setLevel] = useState(100);
  const [category, setCategory] = useState('Degree Core');
  const [prereqs, setPrereqs] = useState('');
  const [offerings, setOfferings] = useState(['T1', 'T2', 'T3']);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleUnitCodeChange = (e) => {
    const val = e.target.value.toUpperCase();
    setUnitCode(val);
    const match = val.match(/\d{3}/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num >= 300) setLevel(300);
      else if (num >= 200) setLevel(200);
      else if (num >= 100) setLevel(100);
    }
  };

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
      category: category,
      prerequisites: prereqs.trim() ? prereqs.split(/[,;&/]+/).map(p => p.trim().toUpperCase()) : [],
      offerings: offerings.length > 0 ? offerings : ['T1', 'T2', 'T3']
    };

    onAddUnit(newUnit);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-slate-900 dark:text-slate-100 transition-colors my-auto space-y-4"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
              Add New Course Unit Manually
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Create a custom degree unit and add it directly into the Course Catalog & Plan Builder.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200 font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
          {/* Unit Code & Credit Points */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 dark:text-slate-200 block mb-1 font-heading uppercase text-[11px]">
                Unit Code *
              </label>
              <input
                type="text"
                placeholder="e.g. ICT399"
                value={unitCode}
                onChange={handleUnitCodeChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold uppercase"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-800 dark:text-slate-200 block mb-1 font-heading uppercase text-[11px]">
                Credit Points
              </label>
              <select
                value={creditPoints}
                onChange={(e) => setCreditPoints(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold cursor-pointer"
              >
                <option value={3}>3 CP (Standard Unit)</option>
                <option value={6}>6 CP (Double Project)</option>
              </select>
            </div>
          </div>

          {/* Unit Title */}
          <div>
            <label className="font-extrabold text-slate-800 dark:text-slate-200 block mb-1 font-heading uppercase text-[11px]">
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

          {/* Academic Level & Category Classification */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 dark:text-slate-200 block mb-1 font-heading uppercase text-[11px]">
                Academic Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold cursor-pointer font-mono"
              >
                <option value={100}>Lvl 100 (Year 1 Core)</option>
                <option value={200}>Lvl 200 (Year 2 Core)</option>
                <option value={300}>Lvl 300 (Year 3 Capstone)</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-800 dark:text-slate-200 block mb-1 font-heading uppercase text-[11px]">
                Major / Core Classification
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-red-600 font-bold cursor-pointer"
              >
                <option value="Degree Core">Degree Core (All IT)</option>
                <option value="Major Core (AI)">Major Core - AI</option>
                <option value="Major Core (CS)">Major Core - CS</option>
                <option value="Major Core (BIS)">Major Core - BIS</option>
                <option value="General Elective">General Elective</option>
              </select>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <label className="font-extrabold text-slate-800 dark:text-slate-200 block mb-1 font-heading uppercase text-[11px]">
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

          {/* Trimester / Semester Offerings */}
          <div>
            <label className="font-extrabold text-slate-800 dark:text-slate-200 block mb-1 font-heading uppercase text-[11px]">
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border font-mono cursor-pointer ${
                      active
                        ? 'bg-red-700 text-white border-red-700 shadow-2xs scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {term} {active && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 font-heading"
            >
              <Plus className="w-4 h-4" /> Save & Add Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
