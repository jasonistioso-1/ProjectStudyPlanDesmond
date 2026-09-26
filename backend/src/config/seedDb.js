import pool from './db.js';
import {
    mockLocations,
    mockTeachingPeriods,
    mockCourses,
    mockUnits,
    mockStudents,
    mockStudentHistory,
    mockPrerequisites
} from './seedData.js';

export async function seedDatabase() {
    const connection = await pool.getConnection();
    try {
        console.log('🌱 Starting database seed script...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Truncate existing tables
        await connection.query('TRUNCATE TABLE StudyPlanVersion');
        await connection.query('TRUNCATE TABLE StudyPlanUnit');
        await connection.query('TRUNCATE TABLE StudyPlan');
        await connection.query('TRUNCATE TABLE StudentUnitHistory');
        await connection.query('TRUNCATE TABLE Prerequisite');
        await connection.query('TRUNCATE TABLE UnitOffering');
        await connection.query('TRUNCATE TABLE Student');
        await connection.query('TRUNCATE TABLE Unit');
        await connection.query('TRUNCATE TABLE Course');
        await connection.query('TRUNCATE TABLE TeachingPeriod');
        await connection.query('TRUNCATE TABLE Location');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // 1. Seed Locations
        for (const loc of mockLocations) {
            await connection.query(
                `INSERT INTO Location (location_id, code, name) VALUES (?, ?, ?)`,
                [loc.location_id, loc.code, loc.name]
            );
        }
        console.log(`✅ Seeded ${mockLocations.length} Locations`);

        // 2. Seed TeachingPeriods
        for (const tp of mockTeachingPeriods) {
            await connection.query(
                `INSERT INTO TeachingPeriod (period_id, code, name, period_type, sequence_order) VALUES (?, ?, ?, ?, ?)`,
                [tp.period_id, tp.code, tp.name, tp.period_type, tp.sequence_order]
            );
        }
        console.log(`✅ Seeded ${mockTeachingPeriods.length} TeachingPeriods`);

        // 3. Seed Courses
        for (const c of mockCourses) {
            await connection.query(
                `INSERT INTO Course (course_id, code, name, degree_level, total_credit_points) VALUES (?, ?, ?, ?, ?)`,
                [c.course_id, c.code, c.name, c.degree_level, c.total_credit_points]
            );
        }
        console.log(`✅ Seeded ${mockCourses.length} Courses`);

        // 4. Seed Units (All 28 Murdoch ICT Units)
        for (const u of mockUnits) {
            await connection.query(
                `INSERT INTO Unit (unit_id, code, title, credit_points, level) VALUES (?, ?, ?, ?, ?)`,
                [u.unit_id, u.code, u.title, u.credit_points, u.level]
            );
        }
        console.log(`✅ Seeded ${mockUnits.length} Units`);

        // 5. Seed Prerequisites
        for (const p of mockPrerequisites) {
            const [target] = await connection.query(`SELECT unit_id FROM Unit WHERE code = ?`, [p.target_code]);
            const [prereq] = await connection.query(`SELECT unit_id FROM Unit WHERE code = ?`, [p.prereq_code]);
            if (target.length > 0 && prereq.length > 0) {
                await connection.query(
                    `INSERT INTO Prerequisite (unit_id, prereq_unit_id, min_grade) VALUES (?, ?, 'P')`,
                    [target[0].unit_id, prereq[0].unit_id]
                );
            }
        }
        console.log(`✅ Seeded ${mockPrerequisites.length} Prerequisites`);

        // 6. Seed Unit Offerings based on specific trimester availability
        const unitOfferingSchedule = {
            'ICT100': ['T1', 'T2', 'T3'],
            'ICT158': ['T1', 'T2', 'T3'],
            'ICT159': ['T1', 'T2', 'T3'],
            'ICT167': ['T1', 'T2', 'T3'],
            'ICT169': ['T1', 'T2', 'T3'],
            'ICT170': ['T1', 'T2', 'T3'],
            'ICT145': ['T1', 'T2', 'T3'],
            'ICT201': ['T1', 'T2', 'T3'],
            'ICT202': ['T1', 'T2', 'T3'],
            'ICT203': ['T1', 'T2', 'T3'],
            'ICT206': ['T1', 'T2', 'T3'],
            'ICT283': ['T1', 'T2', 'T3'],
            'ICT284': ['T1', 'T2', 'T3'],
            'ICT285': ['T1', 'T2', 'T3'],
            'ICT292': ['T1', 'T2', 'T3'],
            'BSC203': ['T1', 'T2', 'T3'],
            'MAS162': ['T1', 'T2', 'T3'],
            'MAS164': ['T1', 'T2', 'T3'],
            'MAS183': ['T1', 'T2', 'T3'],
            'ICT301': ['T1', 'T2', 'T3'],
            'ICT302': ['T1', 'T2', 'T3'],
            'ICT303': ['T1', 'T2', 'T3'],
            'ICT304': ['T1', 'T2', 'T3'],
            'ICT305': ['T1', 'T2', 'T3'],
            'ICT373': ['T1', 'T2', 'T3'],
            'ICT374': ['T1', 'T2', 'T3'],
            'ICT393': ['T1', 'T2', 'T3'],
            'ICT394': ['T1', 'T2', 'T3']
        };

        const [allUnits] = await connection.query(`SELECT unit_id, code FROM Unit`);
        for (const u of allUnits) {
            const periodCodes = unitOfferingSchedule[u.code] || ['T1', 'T2', 'T3'];
            for (const pCode of periodCodes) {
                const [pRows] = await connection.query(`SELECT period_id FROM TeachingPeriod WHERE code = ?`, [pCode]);
                if (pRows.length > 0) {
                    await connection.query(
                        `INSERT INTO UnitOffering (unit_id, location_id, period_id, year_version, delivery_mode, is_active) VALUES (?, 2, ?, 2026, 'internal', TRUE)`,
                        [u.unit_id, pRows[0].period_id]
                    );
                }
            }
        }
        console.log(`✅ Seeded specific UnitOfferings for all units`);

        // 7. Seed Students
        for (const s of mockStudents) {
            const sid = s.student_id === 0 ? 99 : s.student_id;
            const validStatus = ['active', 'inactive', 'graduated', 'suspended'].includes(s.study_status) ? s.study_status : 'active';
            await connection.query(
                `INSERT INTO Student (student_id, student_number, first_name, last_name, email, course_id, location_id, commencement_year, study_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [sid, s.student_number, s.first_name, s.last_name, s.email, s.course_id, s.location_id, s.commencement_year, validStatus]
            );
        }
        console.log(`✅ Seeded ${mockStudents.length} Students`);

        // 8. Seed Student Academic History
        for (const h of mockStudentHistory) {
            if ([1, 2, 3, 4].includes(h.student_id)) {
                await connection.query(
                    `INSERT INTO StudentUnitHistory (history_id, student_id, unit_id, status, grade, mark, period_id, year_taken) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [h.history_id, h.student_id, h.unit_id, h.status, h.grade, h.mark, h.period_id, h.year_taken]
                );
            }
        }
        console.log(`✅ Seeded ${mockStudentHistory.length} Student Academic History records`);

        // 9. Seed Initial Study Plans
        const initialStudentPlans = [
            {
                student_id: 1,
                title: 'PT3-BSIT Artificial Intelligence Plan 2026',
                status: 'approved',
                total_credit_points: 36,
                units: [
                    // Y1 T1
                    { code: 'ICT100', year_level: 1, period_id: 3, sequence_order: 1 },
                    { code: 'ICT158', year_level: 1, period_id: 3, sequence_order: 2 },
                    { code: 'ICT159', year_level: 1, period_id: 3, sequence_order: 3 },
                    { code: 'MAS162', year_level: 1, period_id: 3, sequence_order: 4 },
                    // Y1 T2
                    { code: 'ICT167', year_level: 1, period_id: 4, sequence_order: 1 },
                    { code: 'ICT170', year_level: 1, period_id: 4, sequence_order: 2 },
                    { code: 'ICT145', year_level: 1, period_id: 4, sequence_order: 3 },
                    { code: 'MAS164', year_level: 1, period_id: 4, sequence_order: 4 },
                    // Y1 T3
                    { code: 'ICT169', year_level: 1, period_id: 5, sequence_order: 1 },
                    { code: 'ICT284', year_level: 1, period_id: 5, sequence_order: 2 },
                    { code: 'ICT285', year_level: 1, period_id: 5, sequence_order: 3 },
                    { code: 'ICT202', year_level: 1, period_id: 5, sequence_order: 4 }
                ]
            },
            {
                student_id: 2,
                title: 'PT3-BSIT Computer Science Plan 2026',
                status: 'draft',
                total_credit_points: 72,
                units: [
                    { code: 'ICT100', year_level: 1, period_id: 3, sequence_order: 1 },
                    { code: 'ICT158', year_level: 1, period_id: 3, sequence_order: 2 },
                    { code: 'ICT159', year_level: 1, period_id: 3, sequence_order: 3 },
                    { code: 'MAS162', year_level: 1, period_id: 3, sequence_order: 4 },
                    { code: 'ICT167', year_level: 1, period_id: 4, sequence_order: 1 },
                    { code: 'ICT169', year_level: 1, period_id: 4, sequence_order: 2 },
                    { code: 'ICT145', year_level: 1, period_id: 4, sequence_order: 3 },
                    { code: 'MAS164', year_level: 1, period_id: 4, sequence_order: 4 },
                    { code: 'ICT170', year_level: 1, period_id: 5, sequence_order: 1 },
                    { code: 'ICT285', year_level: 1, period_id: 5, sequence_order: 2 },
                    { code: 'ICT202', year_level: 1, period_id: 5, sequence_order: 3 },
                    { code: 'ICT283', year_level: 1, period_id: 5, sequence_order: 4 },
                    { code: 'ICT201', year_level: 2, period_id: 3, sequence_order: 1 },
                    { code: 'ICT284', year_level: 2, period_id: 3, sequence_order: 2 },
                    { code: 'ICT292', year_level: 2, period_id: 3, sequence_order: 3 },
                    { code: 'BSC203', year_level: 2, period_id: 3, sequence_order: 4 },
                    { code: 'ICT206', year_level: 2, period_id: 4, sequence_order: 1 },
                    { code: 'MAS183', year_level: 2, period_id: 4, sequence_order: 2 },
                    { code: 'ICT374', year_level: 2, period_id: 4, sequence_order: 3 },
                    { code: 'ICT301', year_level: 2, period_id: 4, sequence_order: 4 },
                    { code: 'ICT203', year_level: 2, period_id: 5, sequence_order: 1 },
                    { code: 'ICT305', year_level: 2, period_id: 5, sequence_order: 2 },
                    { code: 'ICT373', year_level: 2, period_id: 5, sequence_order: 3 },
                    { code: 'ICT302', year_level: 2, period_id: 5, sequence_order: 4 }
                ]
            },
            {
                student_id: 3,
                title: 'PT3-BSIT Business Info Systems Plan 2026',
                status: 'draft',
                total_credit_points: 0,
                units: []
            },
            {
                student_id: 4,
                title: 'PT3-BSIT Artificial Intelligence Plan 2026',
                status: 'draft',
                total_credit_points: 0,
                units: []
            }
        ];

        for (const sp of initialStudentPlans) {
            const [result] = await connection.query(
                `INSERT INTO StudyPlan (student_id, title, status, total_credit_points, created_by) VALUES (?, ?, ?, ?, 'Academic Chair')`,
                [sp.student_id, sp.title, sp.status, sp.total_credit_points]
            );
            const planId = result.insertId;

            for (const uItem of sp.units) {
                const [uRows] = await connection.query(`SELECT unit_id, credit_points FROM Unit WHERE code = ?`, [uItem.code]);
                if (uRows.length > 0) {
                    await connection.query(
                        `INSERT INTO StudyPlanUnit (plan_id, unit_id, period_id, year_level, sequence_order, credit_points) VALUES (?, ?, ?, ?, ?, ?)`,
                        [planId, uRows[0].unit_id, uItem.period_id, uItem.year_level, uItem.sequence_order, uRows[0].credit_points]
                    );
                }
            }
        }
        console.log(`✅ Seeded ${initialStudentPlans.length} initial Study Plans with Trimester 1 2026 units`);

        console.log('🎉 Database seeding complete!');
    } catch (err) {
        console.error('❌ Error seeding database:', err);
    } finally {
        connection.release();
    }
}

if (process.argv[1].endsWith('seedDb.js')) {
    seedDatabase().then(() => process.exit(0));
}
