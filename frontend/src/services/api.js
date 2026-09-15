const API_BASE = '/api';

export async function fetchStudents(search = '') {
    try {
        const res = await fetch(`${API_BASE}/students?search=${encodeURIComponent(search)}`);
        if (!res.ok) throw new Error('Failed to fetch students');
        return await res.json();
    } catch (err) {
        console.warn('API fetchStudents fallback activated:', err.message);
        return [
            {
                student_id: 1,
                student_number: 'PT3-2026-001',
                first_name: 'Alex',
                last_name: 'Mercer',
                email: 'alex.mercer@student.pt3solutions.edu.au',
                course_id: 1,
                course_code: 'PT3-BSIT-01',
                course_name: 'Bachelor of Information Technology (Major: Software & Systems)',
                location_id: 1,
                location_name: 'PT3 Solutions Main Campus (Perth)',
                commencement_year: 2026,
                study_status: 'active'
            }
        ];
    }
}

export async function fetchStudentById(id) {
    try {
        const res = await fetch(`${API_BASE}/students/${id}`);
        if (!res.ok) throw new Error('Failed to fetch student details');
        return await res.json();
    } catch (err) {
        console.warn('API fetchStudentById fallback activated:', err.message);
        return {
            student_id: Number(id || 1),
            student_number: 'PT3-2026-001',
            first_name: 'Alex',
            last_name: 'Mercer',
            email: 'alex.mercer@student.pt3solutions.edu.au',
            course_id: 1,
            course_code: 'PT3-BSIT-01',
            course_name: 'Bachelor of Information Technology (Major: Software & Systems)',
            location_id: 1,
            location_name: 'PT3 Solutions Main Campus (Perth)',
            commencement_year: 2026,
            study_status: 'active'
        };
    }
}

export async function fetchStudentHistory(id) {
    try {
        const res = await fetch(`${API_BASE}/students/${id}/history`);
        if (!res.ok) throw new Error('Failed to fetch student history');
        return await res.json();
    } catch (err) {
        console.warn('API fetchStudentHistory fallback activated:', err.message);
        return [
            { history_id: 1, student_id: 1, unit_id: 1, unit_code: 'ICT100', unit_title: 'Transition to Computing', status: 'completed', grade: 'D', mark: 78.5, period_id: 1, period_code: 'S1', year_taken: 2026 },
            { history_id: 2, student_id: 1, unit_id: 2, unit_code: 'ICT159', unit_title: 'Foundations of Programming', status: 'completed', grade: 'C', mark: 68.0, period_id: 1, period_code: 'S1', year_taken: 2026 },
            { history_id: 3, student_id: 1, unit_id: 5, unit_code: 'ICT169', unit_title: 'Data Communications & Networks', status: 'attempted', grade: 'F', mark: 42.0, period_id: 1, period_code: 'S1', year_taken: 2026 },
            { history_id: 4, student_id: 1, unit_id: 3, unit_code: 'ICT164', unit_title: 'Discrete Mathematics & Logic', status: 'current', grade: null, mark: null, period_id: 2, period_code: 'S2', year_taken: 2026 },
            { history_id: 5, student_id: 1, unit_id: 4, unit_code: 'ICT111', unit_title: 'Cybersecurity Principles', status: 'current', grade: null, mark: null, period_id: 2, period_code: 'S2', year_taken: 2026 }
        ];
    }
}

export async function fetchCatalogUnits() {
    try {
        const res = await fetch(`${API_BASE}/catalog/units`);
        if (!res.ok) throw new Error('Failed to fetch units catalog');
        return await res.json();
    } catch (err) {
        console.warn('API fetchCatalogUnits fallback activated:', err.message);
        return [
            { unit_id: 1, code: 'ICT100', title: 'Transition to Computing', credit_points: 3, level: 100, prerequisites: [] },
            { unit_id: 2, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, level: 100, prerequisites: [] },
            { unit_id: 3, code: 'ICT164', title: 'Discrete Mathematics & Logic', credit_points: 3, level: 100, prerequisites: [] },
            { unit_id: 4, code: 'ICT111', title: 'Cybersecurity Principles', credit_points: 3, level: 100, prerequisites: [] },
            { unit_id: 5, code: 'ICT169', title: 'Data Communications & Networks', credit_points: 3, level: 100, prerequisites: [] },
            { unit_id: 6, code: 'ICT170', title: 'Computer Systems Architecture', credit_points: 3, level: 100, prerequisites: [] },
            { unit_id: 7, code: 'ICT167', title: 'Data Structures & Algorithms', credit_points: 3, level: 100, prerequisites: [{ prereq_code: 'ICT159' }] },
            { unit_id: 8, code: 'ICT162', title: 'Applied Linear Algebra & Statistics', credit_points: 3, level: 100, prerequisites: [{ prereq_code: 'ICT164' }] },
            { unit_id: 9, code: 'ICT201', title: 'IT Project Management', credit_points: 3, level: 200, prerequisites: [] },
            { unit_id: 10, code: 'ICT202', title: 'Advanced Programming & Software Architecture', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT167' }] },
            { unit_id: 11, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT159' }] },
            { unit_id: 12, code: 'ICT203', title: 'Distributed Systems & Network Security', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT202' }] },
            { unit_id: 13, code: 'ICT285', title: 'Database Systems', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT159' }] },
            { unit_id: 14, code: 'ICT304', title: 'Software Systems Architecture & Design', credit_points: 3, level: 300, prerequisites: [] },
            { unit_id: 15, code: 'ICT302', title: 'Capstone IT Practice Project', credit_points: 3, level: 300, prerequisites: [] }
        ];
    }
}

export async function fetchTeachingPeriods() {
    try {
        const res = await fetch(`${API_BASE}/catalog/periods`);
        if (!res.ok) throw new Error('Failed to fetch teaching periods');
        return await res.json();
    } catch (err) {
        console.warn('API fetchTeachingPeriods fallback activated:', err.message);
        return [
            { period_id: 1, code: 'S1', name: 'Semester 1', period_type: 'semester', sequence_order: 1 },
            { period_id: 2, code: 'S2', name: 'Semester 2', period_type: 'semester', sequence_order: 2 }
        ];
    }
}

export async function fetchPlanByStudent(studentId) {
    const res = await fetch(`${API_BASE}/plans/student/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch study plan');
    return res.json();
}

export async function saveStudyPlan(planData) {
    const res = await fetch(`${API_BASE}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
    });
    if (!res.ok) throw new Error('Failed to save study plan');
    return res.json();
}

export async function validatePlan(validationData) {
    const res = await fetch(`${API_BASE}/validation/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validationData)
    });
    if (!res.ok) throw new Error('Failed to validate study plan');
    return res.json();
}

export async function recommendPlan(planId, recommendedBy) {
    const res = await fetch(`${API_BASE}/plans/${planId}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommended_by: recommendedBy })
    });
    if (!res.ok) throw new Error('Failed to mark plan as recommended');
    return res.json();
}

export async function agreePlan(planId, studentSignature) {
    const res = await fetch(`${API_BASE}/plans/${planId}/agree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_signature: studentSignature })
    });
    if (!res.ok) throw new Error('Failed to record student agreement');
    return res.json();
}

export async function approvePlan(planId) {
    const res = await fetch(`${API_BASE}/plans/${planId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to approve study plan');
    return res.json();
}

export async function recalculatePlan(studentId) {
    const res = await fetch(`${API_BASE}/plans/recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
    });
    if (!res.ok) throw new Error('Failed to recalculate plan');
    return res.json();
}

export async function importSeedData(type, data) {
    const res = await fetch(`${API_BASE}/import/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
    });
    if (!res.ok) throw new Error('Failed to import data');
    return res.json();
}
