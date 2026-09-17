import React, { useState } from 'react';
import { BookOpen, Search, FileSpreadsheet, Layers, CheckCircle2, ChevronRight, Filter, Plus } from 'lucide-react';

export default function CourseCatalogPreview({ catalogUnits = [], onOpenImport, onOpenAddUnit }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  const defaultUnits = [
    { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, level: 100, prereqs: 'None', offerings: ['S1', 'S2', 'T1', 'T2'] },
    { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, level: 100, prereqs: 'None', offerings: ['S1', 'S2', 'T1'] },
    { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, level: 100, prereqs: 'None', offerings: ['S1', 'S2', 'T1', 'T2', 'T3'] },
    { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, level: 100, prereqs: 'ICT159', offerings: ['S1', 'S2'] },
    { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, level: 100, prereqs: 'None', offerings: ['S1', 'S2'] },
    { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, level: 100, prereqs: 'None', offerings: ['S1', 'S2'] },
    { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, level: 100, prereqs: 'None', offerings: ['S1', 'S2', 'T1'] },
    { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, level: 200, prereqs: 'ICT158', offerings: ['S1', 'S2'] },
    { unit_id: 9, code: 'ICT202', title: 'Data Analytics & Processing', credit_points: 3, level: 200, prereqs: 'ICT159', offerings: ['S1', 'S2'] },
    { unit_id: 10, code: 'ICT203', title: 'Software Architecture & Design', credit_points: 3, level: 200, prereqs: 'ICT167', offerings: ['S1', 'S2'] },
    { unit_id: 11, code: 'ICT206', title: 'Distributed Systems', credit_points: 3, level: 200, prereqs: 'ICT167', offerings: ['S1', 'S2'] },
    { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, level: 200, prereqs: 'ICT167', offerings: ['S1', 'S2'] },
    { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, level: 200, prereqs: 'ICT158', offerings: ['S1', 'S2'] },
    { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, level: 200, prereqs: 'ICT159', offerings: ['S1', 'S2'] },
    { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, level: 200, prereqs: 'ICT158', offerings: ['S1', 'S2'] },
    { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, level: 200, prereqs: 'ICT158', offerings: ['S1', 'S2'] },
    { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, level: 100, prereqs: 'None', offerings: ['S1', 'S2'] },
    { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, level: 300, prereqs: 'ICT292', offerings: ['S1', 'S2'] },
    { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, level: 300, prereqs: 'ICT201', offerings: ['S1', 'S2'] },
    { unit_id: 22, code: 'ICT303', title: 'Cloud Infrastructure & DevOps', credit_points: 3, level: 300, prereqs: 'ICT202', offerings: ['S1', 'S2'] },
    { unit_id: 23, code: 'ICT304', title: 'Enterprise Software Systems', credit_points: 3, level: 300, prereqs: 'ICT203', offerings: ['S1', 'S2'] },
    { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, level: 300, prereqs: 'ICT202', offerings: ['S1', 'S2'] },
    { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, level: 300, prereqs: 'ICT283', offerings: ['S1', 'S2'] },
    { unit_id: 26, code: 'ICT374', title: 'Operating Systems', credit_points: 3, level: 300, prereqs: 'ICT283', offerings: ['S1', 'S2'] },
    { unit_id: 27, code: 'ICT393', title: 'Advanced Business Intelligence', credit_points: 3, level: 300, prereqs: 'ICT284', offerings: ['S1', 'S2'] },
    { unit_id: 28, code: 'ICT394', title: 'Business Intelligence & Analytics', credit_points: 3, level: 300, prereqs: 'ICT285', offerings: ['S1', 'S2'] }
  ];

  const unitsList = catalogUnits && catalogUnits.length > 0
    ? catalogUnits.map(u => ({
        unit_id: u.unit_id,
        code: u.code,
        title: u.title,
        credit_points: u.credit_points || 3,
        level: u.level || 100,
        prereqs: u.prerequisites && u.prerequisites.length > 0 ? u.prerequisites.map(p => p.prereq_code || p).join(', ') : 'None',
        offerings: u.offerings || ['S1', 'S2']
      }))
    : defaultUnits;

  const filteredUnits = unitsList.filter(u => {
    const matchesQuery = searchQuery === '' ||
      u.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = levelFilter === 'ALL' ||
      (levelFilter === '100' && u.level >= 100 && u.level < 200) ||
      (levelFilter === '200' && u.level >= 200 && u.level < 300) ||
      (levelFilter === '300' && u.level >= 300);

    return matchesQuery && matchesLevel;
  });

  return (
    <section className="py-4 font-sans space-y-5">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl font-sans text-slate-900 dark:text-white transition-all relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Subtle executive background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-800/60 rounded-full text-xs font-semibold tracking-wide mb-2">
            <BookOpen className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span>Data-Driven Course Unit Catalog & Prerequisites</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
            Official Course Unit Catalog & Prerequisites Directory
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-normal">
            Explore active degree units, prerequisite progression rules, and teaching period availability.
          </p>
        </div>

        {/* Actions Bar: Add Unit & Dataset Upload */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenAddUnit && (
            <button
              onClick={onOpenAddUnit}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-red-400" />
              <span>Add Unit Manually</span>
            </button>
          )}

          <button
            onClick={onOpenImport}
            className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-2 shrink-0"
            title="Upload or import unit offerings and prerequisites from CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Upload CSV / Excel Dataset</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search unit by code or title (e.g. ICT159, Machine Learning)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all placeholder:text-slate-400 font-semibold"
          />
        </div>
      </div>

      {/* Unit Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUnits.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
            <p className="text-xs text-slate-500">No course units match your search query.</p>
          </div>
        ) : (
          filteredUnits.map(unit => (
            <div
              key={unit.unit_id || unit.code}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-red-700 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-2xs">
                    {unit.code}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {unit.credit_points || 3} CP
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading mt-1">
                  {unit.title}
                </h3>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Prerequisite:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      unit.prereqs === 'None'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {unit.prereqs}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Teaching Periods:</span>
                    <div className="flex gap-1">
                      {(unit.offerings || ['S1', 'S2']).map((p, idx) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono font-bold">Active Unit</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Data-Driven
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

