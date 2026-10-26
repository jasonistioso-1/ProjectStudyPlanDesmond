import React, { useState, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, ChevronDown, Calendar, CheckCircle2 } from 'lucide-react';
import { getDynamicOfferings } from './CourseCatalogPreview';

export function getUnitClassification(unitCode) {
  const code = (unitCode || '').toUpperCase();
  
  if (code === 'ICT302') {
    return {
      label: 'Core Capstone',
      badgeStyle: 'bg-purple-700 text-white border-purple-800 shadow-2xs font-extrabold'
    };
  }

  if (['MSP200', 'COM203'].includes(code)) {
    return {
      label: 'General Elective',
      badgeStyle: 'bg-emerald-700 text-white border-emerald-800 shadow-2xs font-extrabold'
    };
  }
  
  if (['MAS183', 'MAS162', 'MAS164'].includes(code)) {
    return {
      label: 'Core / Math',
      badgeStyle: 'bg-teal-700 text-white border-teal-800 shadow-2xs font-extrabold'
    };
  }

  // Degree Cores common to all IT pathways
  if (['ICT100', 'ICT159', 'ICT169', 'ICT145', 'ICT158', 'ICT170', 'ICT167'].includes(code)) {
    return {
      label: 'Degree Core',
      badgeStyle: 'bg-indigo-700 text-white border-indigo-800 shadow-2xs font-extrabold'
    };
  }

  // Major Cores for all IT pathways
  return {
    label: 'Major Core',
    badgeStyle: 'bg-blue-700 text-white border-blue-800 shadow-2xs font-extrabold'
  };
}

export default function DraggablePaletteUnitCard({ unit, scheduledInfo, historyRecord, scheduledCodesSet, studentMajor = 'Artificial Intelligence', onAdd, onAddToSpecificSemester, layoutType = 'trimester' }) {
  const [showPicker, setShowPicker] = useState(false);
  const cardRef = useRef(null);

  const isScheduled = !!scheduledInfo;
  const isPassedHistory = historyRecord && historyRecord.status === 'completed';
  const isFailedHistory = historyRecord && historyRecord.status === 'attempted';

  const isElective = unit.code === 'MSP200' || unit.code === 'COM203';
  const otherElectiveCode = unit.code === 'MSP200' ? 'COM203' : 'MSP200';
  const isOtherElectiveScheduled = isElective && (
    (scheduledCodesSet && scheduledCodesSet.has(otherElectiveCode)) ||
    (historyRecord && historyRecord[otherElectiveCode] && historyRecord[otherElectiveCode].status === 'completed')
  );

  const classification = getUnitClassification(unit.code, studentMajor);

  const getPrereqText = () => {
    if (unit.prerequisites && Array.isArray(unit.prerequisites) && unit.prerequisites.length > 0) {
      return unit.prerequisites.map(p => typeof p === 'string' ? p : p.prereq_code || p.code).join(', ');
    }
    if (unit.prereqs) return unit.prereqs;
    if (unit.prereq_code) return unit.prereq_code;
    return 'None';
  };

  const prereqText = getPrereqText();
  const semOfferings = getDynamicOfferings(unit.code, 'semester').map(o => o.replace('Semester ', 'S').replace('Sem ', 'S'));
  const triOfferings = getDynamicOfferings(unit.code, 'trimester').map(o => o.replace('Trimester ', 'T').replace('Tri ', 'T'));
  const offeringsTitle = `Singapore Campus Offerings: Semester [${semOfferings.join(', ')}] | Trimester [${triOfferings.join(', ')}]`;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette_${unit.code || unit.unit_id}`,
    data: { unit },
    disabled: isPassedHistory || isOtherElectiveScheduled
  });

  useEffect(() => {
    if (!showPicker) return;
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
    cursor: isPassedHistory ? 'not-allowed' : isDragging ? 'grabbing' : 'grab'
  };

  const trimesterOptions = [
    { year: 1, period: 3, label: 'Year 1 Trimester 1 (T1)' },
    { year: 1, period: 4, label: 'Year 1 Trimester 2 (T2)' },
    { year: 1, period: 5, label: 'Year 1 Trimester 3 (T3)' },
    { year: 2, period: 3, label: 'Year 2 Trimester 1 (T1)' },
    { year: 2, period: 4, label: 'Year 2 Trimester 2 (T2)' },
    { year: 2, period: 5, label: 'Year 2 Trimester 3 (T3)' },
    { year: 3, period: 3, label: 'Year 3 Trimester 1 (T1)' },
    { year: 3, period: 4, label: 'Year 3 Trimester 2 (T2)' },
    { year: 3, period: 5, label: 'Year 3 Trimester 3 (T3)' }
  ];

  const semesterOptions = [
    { year: 1, period: 1, label: 'Year 1 Semester 1 (S1)' },
    { year: 1, period: 2, label: 'Year 1 Semester 2 (S2)' },
    { year: 2, period: 1, label: 'Year 2 Semester 1 (S1)' },
    { year: 2, period: 2, label: 'Year 2 Semester 2 (S2)' },
    { year: 3, period: 1, label: 'Year 3 Semester 1 (S1)' },
    { year: 3, period: 2, label: 'Year 3 Semester 2 (S2)' }
  ];

  const periodOptions = layoutType === 'semester' ? semesterOptions : trimesterOptions;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={style}
      className={`border p-3.5 rounded-xl text-xs transition-all shadow-2xs hover:shadow-xs group flex items-center justify-between select-none relative font-sans ${
        isPassedHistory
          ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/50 opacity-90'
          : isFailedHistory
          ? 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/60'
          : isScheduled
          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60'
          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div
          {...(isPassedHistory ? {} : attributes)}
          {...(isPassedHistory ? {} : listeners)}
          className={`shrink-0 transition-colors p-0.5 ${
            isPassedHistory
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing'
          }`}
          title={isPassedHistory ? 'Unit already passed in history' : 'Drag unit into a semester slot'}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-red-700 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-md shadow-2xs">{unit.code}</span>

            {isPassedHistory ? (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-2 border-emerald-500 dark:border-emerald-600 flex items-center gap-1.5 font-sans shrink-0 shadow-2xs" title="Completed in official academic record">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Grade: <strong className="font-mono text-emerald-900 dark:text-emerald-100 font-black">{historyRecord?.grade || 'P'}</strong></span>
              </span>
            ) : isFailedHistory ? (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-2 border-rose-500 dark:border-rose-600 flex items-center gap-1.5 font-sans shrink-0 shadow-2xs">
                ⚠ RE-TAKE ALLOWED
              </span>
            ) : isScheduled ? (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-2 border-emerald-500 dark:border-emerald-600 flex items-center gap-1.5 font-sans shrink-0 shadow-2xs">
                ✓ Added in {scheduledInfo.termName}
              </span>
            ) : isOtherElectiveScheduled ? (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-2 border-amber-500 dark:border-amber-600 flex items-center gap-1.5 font-sans shrink-0 shadow-2xs" title={`Degree requirements require only 1 General Elective. ${otherElectiveCode} is already scheduled.`}>
                🔒 Elective Met ({otherElectiveCode} Scheduled)
              </span>
            ) : null}
          </div>

          <div className="text-slate-900 dark:text-slate-100 text-xs font-bold truncate mt-1">
            {unit.title}
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap font-medium">
            <span className="tabular-nums font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono text-[10px]">{unit.credit_points || 3} CP</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-700">Lvl {unit.level || (unit.code ? unit.code.replace(/[^0-9]/g, '').charAt(0) + '00' : 100)}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              Prereq: <strong className={`font-mono px-1 rounded ${prereqText === 'None' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{prereqText}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="font-bold bg-blue-50/80 dark:bg-blue-950/70 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono border border-blue-200/80 dark:border-blue-800/80 flex items-center gap-1" title={offeringsTitle}>
              <Calendar className="w-3 h-3 text-red-600 dark:text-red-400 shrink-0" />
              <span>Sem: <strong className="text-purple-700 dark:text-purple-300 font-extrabold">{semOfferings.join(', ')}</strong> • Tri: <strong className="text-blue-700 dark:text-blue-300 font-extrabold">{triOfferings.join(', ')}</strong></span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 relative">
        {isPassedHistory || isScheduled || isOtherElectiveScheduled ? null : (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-red-700 dark:hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Click to select target trimester/semester period for this unit"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add Unit</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-300 dark:text-red-200 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
          </button>
        )}

        {showPicker && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs font-sans animate-in fade-in duration-150">
            <div className="text-[10px] text-slate-400 dark:text-slate-500 px-2.5 py-1 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1">
              <Calendar className="w-3 h-3 text-red-600" />
              <span>Select Target Period</span>
            </div>

            {/* Quick Auto-Assign Option */}
            <button
              onClick={() => {
                setShowPicker(false);
                if (onAdd) onAdd(unit);
              }}
              className="w-full text-left px-2.5 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold flex items-center gap-2 transition-colors border border-emerald-200/60 dark:border-emerald-800/60 text-[11px]"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Auto-assign next open slot</span>
            </button>

            {/* Trimester/Semester List */}
            <div className="space-y-0.5 pt-1 max-h-48 overflow-y-auto pr-0.5">
              {periodOptions.map(opt => {
                const isSem = layoutType === 'semester' || opt.period === 1 || opt.period === 2;
                const termKey = isSem
                  ? (opt.period === 1 ? 'Sem 1' : 'Sem 2')
                  : (opt.period === 3 ? 'Tri 1' : opt.period === 4 ? 'Tri 2' : 'Tri 3');
                const allowedList = getDynamicOfferings(unit.code, isSem ? 'semester' : 'trimester');
                const isOfferedInTerm = allowedList.includes(termKey);

                return (
                  <button
                    key={`${opt.year}_${opt.period}`}
                    onClick={() => {
                      setShowPicker(false);
                      if (onAddToSpecificSemester) {
                        onAddToSpecificSemester(unit, opt.year, opt.period);
                      } else {
                        onAdd(unit);
                      }
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-colors flex items-center justify-between ${
                      isOfferedInTerm
                        ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                        : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-normal'
                    }`}
                    title={isOfferedInTerm ? 'Matches unit offering schedule' : `Offering Restriction: Unit is offered in ${allowedList.join(', ')}`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">
                      {isOfferedInTerm ? '✓ Available' : '⚠️ Not Offered'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


