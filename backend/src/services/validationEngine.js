import pool from '../config/db.js';

/**
 * Data-Driven Validation Engine for Study Plan Repository (SPR)
 * Enforces BR-01 (Unit Offerings), BR-02 (Prerequisites), Max 12 CP per period, and History rules.
 */
export async function validateStudyPlan({ studentId, locationId, planUnits }) {
    const warnings = [];
    const info = [];

    try {
        // 1. Fetch Student History if studentId provided
        let history = [];
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

        // Map completed units for fast lookup
        const completedUnitCodes = new Set(
            history.filter(h => h.status === 'completed').map(h => h.code)
        );

        // 2. Fetch all Unit Offerings for validation (BR-01)
        const [offeringRows] = await pool.query(
            `SELECT unit_id, location_id, period_id 
             FROM UnitOffering 
             WHERE is_active = TRUE`
        );

        const offeringSet = new Set(
            offeringRows.map(o => `${o.unit_id}_${o.location_id}_${o.period_id}`)
        );

        // 3. Fetch all Teaching Periods for sequence order comparison
        const [periodRows] = await pool.query(
            `SELECT period_id, code, name, sequence_order FROM TeachingPeriod`
        );
        const periodMap = new Map(periodRows.map(p => [p.period_id, p]));

        // 4. Fetch all Prerequisites (BR-02)
        const [prereqRows] = await pool.query(
            `SELECT p.unit_id, u.code AS target_code, p.prereq_unit_id, pu.code AS prereq_code 
             FROM Prerequisite p 
             JOIN Unit u ON p.unit_id = u.unit_id 
             JOIN Unit pu ON p.prereq_unit_id = pu.unit_id`
        );

        // Group prerequisites by target unit code
        const prereqMap = new Map();
        for (const row of prereqRows) {
            if (!prereqMap.has(row.target_code)) {
                prereqMap.set(row.target_code, []);
            }
            prereqMap.get(row.target_code).push(row.prereq_code);
        }

        // 5. Group plan units by period to validate Credit Points (Max 12 CP rule)
        const periodTotals = new Map(); // key: "year_periodId", value: { totalCP: number, periodCode: string, yearLevel: number }

        for (const unit of planUnits) {
            const period = periodMap.get(unit.period_id);
            const periodCode = period ? period.code : `Period #${unit.period_id}`;
            const key = `${unit.year_level}_${unit.period_id}`;

            if (!periodTotals.has(key)) {
                periodTotals.set(key, { totalCP: 0, periodCode, yearLevel: unit.year_level });
            }
            periodTotals.get(key).totalCP += Number(unit.credit_points || 3);

            // BR-01 Check: Unit Offering by Location and Period
            if (locationId) {
                const offeringKey = `${unit.unit_id}_${locationId}_${unit.period_id}`;
                if (!offeringSet.has(offeringKey)) {
                    warnings.push({
                        type: 'BR-01_OFFERING_MISMATCH',
                        severity: 'error',
                        unitCode: unit.code,
                        message: `Unit ${unit.code} (${unit.title}) is NOT offered in ${periodCode} at your campus location.`
                    });
                }
            }

            // Already Completed Check
            if (completedUnitCodes.has(unit.code)) {
                info.push({
                    type: 'ALREADY_COMPLETED',
                    severity: 'info',
                    unitCode: unit.code,
                    message: `Unit ${unit.code} is already completed in student academic history.`
                });
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
                        return otherPeriod.sequence_order < period.sequence_order;
                    }
                    return false;
                });

                if (!isPassedInHistory && !isScheduledPrior) {
                    warnings.push({
                        type: 'BR-02_PREREQUISITE_UNMET',
                        severity: 'error',
                        unitCode: unit.code,
                        prereqCode,
                        message: `Unit ${unit.code} requires prerequisite ${prereqCode}, which is neither completed nor scheduled in a prior period.`
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
