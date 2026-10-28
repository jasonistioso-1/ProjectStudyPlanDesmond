import pool from '../config/db.js';
import { mockStudentHistory, mockTeachingPeriods, mockPrerequisites } from '../config/seedData.js';

/**
 * Data-Driven Validation Engine for Study Plan Repository (SPR)
 * Enforces BR-01 (Unit Offerings), BR-02 (Prerequisites), Max 12 CP per period, and History rules.
 */
export async function validateStudyPlan({ studentId, locationId, planUnits, waivedUnits = [] }) {
    const warnings = [];
    const info = [];
    const waivedSet = new Set(Array.isArray(waivedUnits) ? waivedUnits : []);

    try {
        // 1. Fetch Student History if studentId provided
        let history = [];
        let prereqs = [];
        let periods = [];

        try {
            if (studentId) {
                const [historyRows] = await pool.query(
                    `SELECT sh.unit_id, u.code, sh.status 
                     FROM StudentUnitHistory sh 
                     JOIN Unit u ON sh.unit_id = u.unit_id 
                     WHERE sh.student_id = ?`,
                    [studentId]
                );
                history = historyRows;
            }

            const [periodRows] = await pool.query(
                `SELECT period_id, code, name, sequence_order FROM TeachingPeriod`
            );
            periods = periodRows;

            const [prereqRows] = await pool.query(
                `SELECT p.unit_id, u.code AS target_code, p.prereq_unit_id, pu.code AS prereq_code 
                 FROM Prerequisite p 
                 JOIN Unit u ON p.unit_id = u.unit_id 
                 JOIN Unit pu ON p.prereq_unit_id = pu.unit_id`
            );
            prereqs = prereqRows;
        } catch (dbErr) {
            console.warn('Database query failed in validationEngine, using seedData fallbacks:', dbErr.message);
            history = mockStudentHistory.map(h => ({ unit_id: h.unit_id, code: h.unit_code, status: h.status }));
            periods = mockTeachingPeriods;
            prereqs = mockPrerequisites;
        }

        // Map completed units for fast lookup
        const completedUnitCodes = new Set(
            history.filter(h => h.status === 'completed').map(h => h.code || h.unit_code)
        );

        // Fetch all Teaching Periods for sequence order comparison
        const periodMap = new Map(periods.map(p => [p.period_id, p]));

        // Group prerequisites by target unit code
        const prereqMap = new Map();
        for (const row of prereqs) {
            if (!prereqMap.has(row.target_code)) {
                prereqMap.set(row.target_code, []);
            }
            prereqMap.get(row.target_code).push(row.prereq_code);
        }

        // 5. Group plan units by period to validate Credit Points (Max 12 CP rule)
        const periodTotals = new Map(); // key: "year_periodId", value: { totalCP: number, periodCode: string, yearLevel: number }

        // BR-01 Offering Mismatch Rules for Singapore Campus
        const unitOfferingsMap = {
            'ICT100': ['T1', 'T2', 'T3'],
            'ICT158': ['T1', 'T3'],
            'ICT159': ['T1', 'T2', 'T3'],
            'ICT167': ['T1', 'T2'],
            'ICT169': ['T1', 'T2'],
            'ICT170': ['T1', 'T3'],
            'ICT145': ['T1', 'T2', 'T3'],
            'ICT201': ['T1', 'T2', 'T3'],
            'ICT202': ['T2', 'T3'],
            'ICT203': ['T1', 'T3'],
            'ICT206': ['T2', 'T3'],
            'ICT283': ['T1', 'T2', 'T3'],
            'ICT284': ['T1', 'T2'],
            'ICT285': ['T1', 'T2', 'T3'],
            'ICT292': ['T1', 'T2', 'T3'],
            'BSC203': ['T1', 'T2', 'T3'],
            'MAS162': ['T1', 'T2', 'T3'],
            'MAS164': ['T1', 'T2', 'T3'],
            'MAS183': ['T1', 'T3'],
            'ICT301': ['T1', 'T2'],
            'ICT302': ['T1', 'T2', 'T3'],
            'ICT303': ['T2', 'T3'],
            'ICT304': ['T1', 'T3'],
            'ICT305': ['T2', 'T3'],
            'ICT373': ['T1', 'T3'],
            'ICT374': ['T2', 'T3'],
            'ICT393': ['T1', 'T3'],
            'ICT394': ['T1', 'T2', 'T3'],
            'MSP200': ['T1', 'T2', 'T3'],
            'COM203': ['T1', 'T2', 'T3']
        };

        const semesterOfferingsMap = {
            'BSC203': ['S1'],
            'ICT100': ['S1'],
            'ICT145': ['S1'],
            'ICT158': ['S1'],
            'ICT159': ['S1'],
            'ICT167': ['S1', 'S2'],
            'ICT169': ['S1', 'S2'],
            'ICT170': ['S2'],
            'ICT201': ['S2'],
            'ICT202': ['S1'],
            'ICT203': ['S1'],
            'ICT206': ['S1'],
            'ICT283': ['S1', 'S2'],
            'ICT284': ['S2'],
            'ICT285': ['S1'],
            'ICT292': ['S1'],
            'ICT301': ['S2'],
            'ICT302': ['S2'],
            'ICT303': ['S2'],
            'ICT304': ['S2'],
            'ICT305': ['S2'],
            'ICT373': ['S2'],
            'ICT374': ['S2'],
            'ICT393': ['S2'],
            'ICT394': ['S2'],
            'MAS162': ['S2'],
            'MAS164': ['S1'],
            'MAS183': ['S2'],
            'MSP200': ['S1', 'S2'],
            'COM203': ['S1', 'S2']
        };

        const seenPlanUnitCodes = new Set();
        for (const unit of planUnits) {
            if (!unit || !unit.code) continue;

            if (seenPlanUnitCodes.has(unit.code)) {
                warnings.push({
                    type: 'DUPLICATE_UNIT_DETECTED',
                    severity: 'error',
                    unitCode: unit.code,
                    message: `Duplicate Unit: Unit ${unit.code} (${unit.title || unit.code}) appears multiple times in the study plan.`
                });
            } else {
                seenPlanUnitCodes.add(unit.code);
            }

            const period = periodMap.get(unit.period_id);
            const periodCode = period ? period.code : `Period #${unit.period_id}`;
            const key = `${unit.year_level}_${unit.period_id}`;

            if (!periodTotals.has(key)) {
                periodTotals.set(key, { totalCP: 0, periodCode, yearLevel: unit.year_level });
            }
            periodTotals.get(key).totalCP += Number(unit.credit_points || 3);

            // Already Completed Check (If already passed in history, no rule validation errors apply)
            if (completedUnitCodes.has(unit.code)) {
                info.push({
                    type: 'ALREADY_COMPLETED',
                    severity: 'info',
                    unitCode: unit.code,
                    message: `Unit ${unit.code} is already completed in student academic history.`
                });
                continue;
            }

            const isSemester = period?.period_type === 'semester' || unit.period_id === 1 || unit.period_id === 2 || periodCode === 'S1' || periodCode === 'S2';
            if (isSemester) {
                const termCode = (unit.period_id === 2 || periodCode === 'S2') ? 'S2' : 'S1';
                const allowedOfferings = semesterOfferingsMap[unit.code];
                if (allowedOfferings && !allowedOfferings.includes(termCode)) {
                    warnings.push({
                        type: 'BR-01_OFFERING_MISMATCH',
                        severity: 'error',
                        unitCode: unit.code,
                        message: `Unit ${unit.code} (${unit.title || unit.code}) is offered ONLY in ${allowedOfferings.join(', ')} and cannot be taken in ${periodCode}.`
                    });
                }
            } else {
                let normalizedPeriod = 'T1';
                if (unit.period_id === 4 || periodCode === 'T2') {
                    normalizedPeriod = 'T2';
                } else if (unit.period_id === 5 || periodCode === 'T3') {
                    normalizedPeriod = 'T3';
                }
                const allowedOfferings = unitOfferingsMap[unit.code];
                if (allowedOfferings && !allowedOfferings.includes(normalizedPeriod)) {
                    warnings.push({
                        type: 'BR-01_OFFERING_MISMATCH',
                        severity: 'error',
                        unitCode: unit.code,
                        message: `Unit ${unit.code} (${unit.title || unit.code}) is offered ONLY in ${allowedOfferings.join(', ')} and cannot be taken in ${periodCode} (${normalizedPeriod}).`
                    });
                }
            }

            // BR-02 Check: Prerequisites
            const requiredPrereqs = prereqMap.get(unit.code) || [];
            for (const prereqCode of requiredPrereqs) {
                // Check if already completed in history
                const isPassedInHistory = completedUnitCodes.has(prereqCode);

                // Check if scheduled in an EARLIER period in the current plan
                const isScheduledPrior = planUnits.some(otherUnit => {
                    if (otherUnit.code !== prereqCode) return false;
                    const otherPeriod = periodMap.get(otherUnit.period_id);

                    if (otherUnit.year_level < unit.year_level) return true;
                    if (otherUnit.year_level === unit.year_level && otherPeriod && period) {
                        return (otherPeriod.sequence_order || 0) < (period.sequence_order || 0);
                    }
                    return false;
                });

                if (!isPassedInHistory && !isScheduledPrior && !waivedSet.has(unit.code)) {
                    warnings.push({
                        type: 'BR-02_PREREQUISITE_UNMET',
                        severity: 'error',
                        unitCode: unit.code,
                        prereqCode,
                        message: `Unit ${unit.code} requires prerequisite ${prereqCode}, which is neither completed in history nor scheduled in a prior teaching period.`
                    });
                }
            }
        }

        // Validate Credit Point limits (Max 12 CP per semester)
        for (const [_, data] of periodTotals.entries()) {
            if (data.totalCP > 12) {
                warnings.push({
                    type: 'CREDIT_LIMIT_EXCEEDED',
                    severity: 'warning',
                    message: `Year ${data.yearLevel} ${data.periodCode} total load (${data.totalCP} CP) exceeds the maximum allowed 12 Credit Points limit.`
                });
            }
        }

        return {
            isValid: warnings.filter(w => w.severity === 'error').length === 0,
            warnings,
            info,
            periodTotals: Array.from(periodTotals.values())
        };

    } catch (err) {
        console.error('Validation Engine Error:', err);
        throw err;
    }
}
