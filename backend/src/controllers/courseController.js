import pool from '../config/db.js';
import { mockCourses, mockUnits, mockTeachingPeriods, mockLocations, mockPrerequisites } from '../config/seedData.js';

export async function getCourses(req, res) {
    try {
        const [rows] = await pool.query('SELECT * FROM Course ORDER BY code ASC');
        res.json(rows);
    } catch (err) {
        console.warn('Database query failed, returning fallback mockCourses:', err.message);
        res.json(mockCourses);
    }
}

export async function getUnits(req, res) {
    try {
        const [units] = await pool.query('SELECT * FROM Unit ORDER BY level ASC, code ASC');
        
        // Fetch prerequisites
        const [prereqs] = await pool.query(`
            SELECT p.unit_id, u.code AS target_code, p.prereq_unit_id, pu.code AS prereq_code 
            FROM Prerequisite p 
            JOIN Unit u ON p.unit_id = u.unit_id 
            JOIN Unit pu ON p.prereq_unit_id = pu.unit_id
        `);

        const prereqMap = new Map();
        for (const p of prereqs) {
            if (!prereqMap.has(p.unit_id)) {
                prereqMap.set(p.unit_id, []);
            }
            prereqMap.get(p.unit_id).push({ prereq_unit_id: p.prereq_unit_id, prereq_code: p.prereq_code });
        }

        const unitsWithPrereqs = units.map(u => ({
            ...u,
            prerequisites: prereqMap.get(u.unit_id) || []
        }));

        res.json(unitsWithPrereqs);
    } catch (err) {
        console.warn('Database query failed, returning fallback mockUnits:', err.message);
        const unitsWithPrereqs = mockUnits.map(u => {
            const reqs = mockPrerequisites.filter(p => p.target_code === u.code).map(p => ({ prereq_code: p.prereq_code }));
            return { ...u, prerequisites: reqs };
        });
        res.json(unitsWithPrereqs);
    }
}

export async function getTeachingPeriods(req, res) {
    try {
        const [rows] = await pool.query('SELECT * FROM TeachingPeriod ORDER BY sequence_order ASC');
        res.json(rows);
    } catch (err) {
        console.warn('Database query failed, returning fallback mockTeachingPeriods:', err.message);
        res.json(mockTeachingPeriods);
    }
}

export async function getLocations(req, res) {
    try {
        const [rows] = await pool.query('SELECT * FROM Location ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.warn('Database query failed, returning fallback mockLocations:', err.message);
        res.json(mockLocations);
    }
}
