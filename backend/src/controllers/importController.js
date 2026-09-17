import pool from '../config/db.js';

export async function importData(req, res) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { type, data } = req.body; // type: 'offerings' | 'prerequisites' | 'units'

        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'data must be an array of objects' });
        }

        let importedCount = 0;

        if (type === 'units') {
            for (const item of data) {
                await connection.query(
                    `INSERT INTO Unit (code, title, credit_points, level) VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE title = VALUES(title), credit_points = VALUES(credit_points), level = VALUES(level)`,
                    [item.code, item.title, item.credit_points || 3, item.level || 100]
                );
                importedCount++;
            }
        } else if (type === 'offerings') {
            for (const item of data) {
                // item: { unit_code, location_code, period_code, year_version, delivery_mode }
                const [u] = await connection.query(`SELECT unit_id FROM Unit WHERE code = ?`, [item.unit_code]);
                const [l] = await connection.query(`SELECT location_id FROM Location WHERE code = ?`, [item.location_code]);
                const [p] = await connection.query(`SELECT period_id FROM TeachingPeriod WHERE code = ?`, [item.period_code]);

                if (u.length > 0 && l.length > 0 && p.length > 0) {
                    await connection.query(
                        `INSERT INTO UnitOffering (unit_id, location_id, period_id, year_version, delivery_mode, is_active)
                         VALUES (?, ?, ?, ?, ?, TRUE)
                         ON DUPLICATE KEY UPDATE delivery_mode = VALUES(delivery_mode), is_active = TRUE`,
                        [u[0].unit_id, l[0].location_id, p[0].period_id, item.year_version || 2026, item.delivery_mode || 'internal']
                    );
                    importedCount++;
                }
            }
        } else if (type === 'prerequisites') {
            for (const item of data) {
                // item: { unit_code, prereq_unit_code, min_grade }
                const [u] = await connection.query(`SELECT unit_id FROM Unit WHERE code = ?`, [item.unit_code]);
                const [pu] = await connection.query(`SELECT unit_id FROM Unit WHERE code = ?`, [item.prereq_unit_code]);

                if (u.length > 0 && pu.length > 0) {
                    await connection.query(
                        `INSERT INTO Prerequisite (unit_id, prereq_unit_id, min_grade) VALUES (?, ?, ?)
                         ON DUPLICATE KEY UPDATE min_grade = VALUES(min_grade)`,
                        [u[0].unit_id, pu[0].unit_id, item.min_grade || 'P']
                    );
                    importedCount++;
                }
            }
        } else if (type === 'students') {
            for (const item of data) {
                // item: { student_number, first_name, last_name, email, course_code, location }
                let courseId = 1;
                let locationId = 2;
                if (item.course_code) {
                    const [c] = await connection.query(`SELECT course_id FROM Course WHERE code = ?`, [item.course_code]);
                    if (c.length > 0) courseId = c[0].course_id;
                }
                if (item.location) {
                    const [l] = await connection.query(`SELECT location_id FROM Location WHERE code LIKE ? OR name LIKE ?`, [`%${item.location}%`, `%${item.location}%`]);
                    if (l.length > 0) locationId = l[0].location_id;
                }

                await connection.query(
                    `INSERT INTO Student (student_number, first_name, last_name, email, course_id, location_id, commencement_year, status)
                     VALUES (?, ?, ?, ?, ?, ?, 2026, ?)
                     ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), email = VALUES(email)`,
                    [item.student_number, item.first_name, item.last_name, item.email, courseId, locationId, item.status || 'active']
                );
                importedCount++;
            }
        } else if (type === 'courses') {
            for (const item of data) {
                // item: { code, name, degree_level, total_credit_points }
                await connection.query(
                    `INSERT INTO Course (code, name, degree_level, total_credit_points) VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE name = VALUES(name), degree_level = VALUES(degree_level), total_credit_points = VALUES(total_credit_points)`,
                    [item.code, item.name, item.degree_level || 'Bachelor', item.total_credit_points || 72]
                );
                importedCount++;
            }
        } else {
            return res.status(400).json({ error: 'Invalid import type. Use units, students, offerings, prerequisites, or courses' });
        }

        await connection.commit();
        res.json({ message: `Data import successful for type: ${type}`, count: importedCount });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
}
