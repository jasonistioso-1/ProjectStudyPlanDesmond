import pool from '../config/db.js';
import { validateStudyPlan } from '../services/validationEngine.js';
import { mockDefaultPlanUnits, mockAuditLog, mockStudentPlans } from '../config/seedData.js';

export async function getAuditLog(req, res) {
    try {
        const [rows] = await pool.query(`
            SELECT 
                spv.version_id,
                spv.plan_id,
                spv.version_number,
                spv.amendment_reason,
                spv.snapshot_json,
                spv.created_by,
                spv.created_at,
                s.first_name,
                s.last_name,
                s.student_number,
                sp.title AS plan_title,
                sp.status AS plan_status
            FROM StudyPlanVersion spv
            LEFT JOIN StudyPlan sp ON spv.plan_id = sp.plan_id
            LEFT JOIN Student s ON spv.student_id = s.student_id
            ORDER BY spv.created_at DESC, spv.version_id DESC
            LIMIT 50
        `);
        res.json(rows && rows.length > 0 ? rows : mockAuditLog);
    } catch (err) {
        console.warn('DB query failed in getAuditLog, returning mock audit log:', err.message);
        res.json(mockAuditLog);
    }
}

export async function getPlanByStudent(req, res) {
    const numId = Number(req.params.studentId || 1);
    try {
        // Fetch study plan header
        const [planRows] = await pool.query(
            `SELECT * FROM StudyPlan WHERE student_id = ? ORDER BY plan_id DESC LIMIT 1`,
            [numId]
        );

        if (planRows.length === 0) {
            const fallback = mockStudentPlans[numId] || {
                plan: {
                    plan_id: numId,
                    student_id: numId,
                    title: 'PT3-BSIT Standard Study Plan 2026',
                    status: 'draft',
                    total_credit_points: 24
                },
                units: mockDefaultPlanUnits
            };
            return res.json(fallback);
        }

        const plan = planRows[0];

        // Fetch plan units
        const [unitRows] = await pool.query(
            `SELECT 
                spu.plan_unit_id,
                spu.plan_id,
                spu.unit_id,
                u.code,
                u.title,
                spu.credit_points,
                spu.period_id,
                tp.code AS period_code,
                tp.name AS period_name,
                spu.year_level,
                spu.sequence_order
            FROM StudyPlanUnit spu
            JOIN Unit u ON spu.unit_id = u.unit_id
            JOIN TeachingPeriod tp ON spu.period_id = tp.period_id
            WHERE spu.plan_id = ?
            ORDER BY spu.year_level ASC, tp.sequence_order ASC, spu.sequence_order ASC`,
            [plan.plan_id]
        );

        res.json({ plan, units: unitRows });
    } catch (err) {
        console.warn('Database query failed in getPlanByStudent, returning fallback plan:', err.message);
        const fallback = mockStudentPlans[numId] || {
            plan: {
                plan_id: numId,
                student_id: numId,
                title: 'PT3-BSIT Standard Study Plan 2026',
                status: 'draft',
                total_credit_points: 24
            },
            units: mockDefaultPlanUnits
        };
        res.json(fallback);
    }
}

export async function savePlan(req, res) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { student_id, title, status, units, created_by, amendment_reason } = req.body;

        // Fetch student location for validation
        const [studentRows] = await connection.query(
            `SELECT location_id FROM Student WHERE student_id = ?`,
            [student_id]
        );
        const location_id = studentRows.length > 0 ? studentRows[0].location_id : null;

        // Calculate total credit points
        const total_credit_points = units.reduce((sum, u) => sum + Number(u.credit_points || 3), 0);

        // Check if plan exists
        const [existingPlan] = await connection.query(
            `SELECT plan_id, status FROM StudyPlan WHERE student_id = ? ORDER BY plan_id DESC LIMIT 1`,
            [student_id]
        );

        let plan_id;
        let isNew = false;

        if (existingPlan.length > 0) {
            plan_id = existingPlan[0].plan_id;
            await connection.query(
                `UPDATE StudyPlan SET title = ?, total_credit_points = ?, status = ?, updated_at = NOW() WHERE plan_id = ?`,
                [title || 'Standard Study Plan', total_credit_points, status || 'draft', plan_id]
            );
        } else {
            isNew = true;
            const [insertResult] = await connection.query(
                `INSERT INTO StudyPlan (student_id, title, status, total_credit_points, created_by) VALUES (?, ?, ?, ?, ?)`,
                [student_id, title || 'Standard Study Plan', status || 'draft', total_credit_points, created_by || 'Academic Chair']
            );
            plan_id = insertResult.insertId;
        }

        // Replace units for this plan
        await connection.query(`DELETE FROM StudyPlanUnit WHERE plan_id = ?`, [plan_id]);

        if (units && units.length > 0) {
            const insertValues = units.map(u => [
                plan_id,
                u.unit_id,
                u.period_id,
                u.year_level || 1,
                u.sequence_order || 1,
                u.credit_points || 3
            ]);

            await connection.query(
                `INSERT INTO StudyPlanUnit (plan_id, unit_id, period_id, year_level, sequence_order, credit_points) VALUES ?`,
                [insertValues]
            );
        }

        // Version audit log
        const [versionRows] = await connection.query(
            `SELECT COUNT(*) AS count FROM StudyPlanVersion WHERE plan_id = ?`,
            [plan_id]
        );
        const nextVersion = (versionRows[0].count || 0) + 1;

        await connection.query(
            `INSERT INTO StudyPlanVersion (plan_id, version_number, amendment_reason, snapshot_json, created_by) VALUES (?, ?, ?, ?, ?)`,
            [
                plan_id,
                nextVersion,
                amendment_reason || (isNew ? 'Initial plan creation' : 'Updated study plan structure'),
                JSON.stringify({ plan_id, student_id, total_credit_points, unitCount: units.length, status }),
                created_by || 'Academic Chair'
            ]
        );

        await connection.commit();

        // Run validation on saved plan
        const validationResult = await validateStudyPlan({ studentId: student_id, locationId: location_id, planUnits: units });

        res.json({
            message: 'Study plan saved successfully',
            plan_id,
            total_credit_points,
            validation: validationResult
        });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
}

export async function recommendPlan(req, res) {
    try {
        const { planId } = req.params;
        const { recommended_by } = req.body;

        await pool.query(
            `UPDATE StudyPlan SET status = 'recommended', recommended_at = NOW(), created_by = ? WHERE plan_id = ?`,
            [recommended_by || 'Academic Chair', planId]
        );

        res.json({ message: 'Study plan marked as RECOMMENDED for student review', status: 'recommended' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function agreePlan(req, res) {
    try {
        const { planId } = req.params;
        const { student_signature } = req.body;

        await pool.query(
            `UPDATE StudyPlan SET status = 'agreed', agreed_at = NOW() WHERE plan_id = ?`,
            [planId]
        );

        res.json({
            message: 'Student agreement recorded successfully',
            status: 'agreed',
            signed: true,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function approvePlan(req, res) {
    try {
        const { planId } = req.params;

        await pool.query(
            `UPDATE StudyPlan SET status = 'approved', approved_at = NOW() WHERE plan_id = ?`,
            [planId]
        );

        // Fetch plan and student details for Certificate of Entitlement
        const [planRows] = await pool.query(`
            SELECT sp.*, s.student_number, s.first_name, s.last_name, c.name AS course_name, l.name AS location_name
            FROM StudyPlan sp
            JOIN Student s ON sp.student_id = s.student_id
            JOIN Course c ON s.course_id = c.course_id
            JOIN Location l ON s.location_id = l.location_id
            WHERE sp.plan_id = ?
        `, [planId]);

        const plan = planRows[0];

        res.json({
            message: 'Study plan successfully FINALIZED and APPROVED!',
            status: 'approved',
            certificate: {
                certificateId: `COE-SPR-2026-${planId}`,
                studentName: `${plan.first_name} ${plan.last_name}`,
                studentNumber: plan.student_number,
                courseName: plan.course_name,
                campus: plan.location_name,
                totalCreditPoints: plan.total_credit_points,
                approvedAt: new Date().toISOString(),
                issuedBy: 'PT3 Solutions Academic Board'
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function recalculatePlan(req, res) {
    try {
        const { studentId } = req.body;

        // Fetch student details
        const [studentRows] = await pool.query(
            `SELECT s.*, c.code AS course_code FROM Student s JOIN Course c ON s.course_id = c.course_id WHERE s.student_id = ?`,
            [studentId]
        );

        if (studentRows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = studentRows[0];

        // Fetch completed unit IDs
        const [completedRows] = await pool.query(
            `SELECT unit_id FROM StudentUnitHistory WHERE student_id = ? AND status = 'completed'`,
            [studentId]
        );
        const completedIds = new Set(completedRows.map(r => r.unit_id));

        // Fetch all units available
        const [allUnits] = await pool.query(`SELECT * FROM Unit ORDER BY level ASC, unit_id ASC`);

        // Filter out completed units
        const uncompletedUnits = allUnits.filter(u => !completedIds.has(u.unit_id));

        // Auto-balance logic: Assign max 4 units (12 CP) to S1 (period_id 1) and S2 (period_id 2) across Year 1, 2, 3
        const autoUnits = [];
        let currentYear = 1;
        let currentPeriodId = 1; // S1
        let countInPeriod = 0;

        for (const unit of uncompletedUnits) {
            if (countInPeriod >= 4) {
                // Switch period
                if (currentPeriodId === 1) {
                    currentPeriodId = 2; // S2
                } else {
                    currentPeriodId = 1;
                    currentYear += 1;
                }
                countInPeriod = 0;
            }

            autoUnits.push({
                unit_id: unit.unit_id,
                code: unit.code,
                title: unit.title,
                credit_points: unit.credit_points,
                period_id: currentPeriodId,
                period_code: currentPeriodId === 1 ? 'S1' : 'S2',
                year_level: currentYear,
                sequence_order: countInPeriod + 1
            });

            countInPeriod++;
        }

        // Validate auto-calculated plan
        const validation = await validateStudyPlan({
            studentId,
            locationId: student.location_id,
            planUnits: autoUnits
        });

        res.json({
            message: 'Study plan auto-calculated & re-balanced successfully',
            units: autoUnits,
            validation
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
