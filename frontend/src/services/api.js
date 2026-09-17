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
                email: 'alex.mercer@student.pt3solutions.edu.sg',
                course_id: 1,
                course_code: 'PT3-BSIT-AI01',
                course_name: 'Bachelor of Information Technology (Major: Artificial Intelligence)',
                location_id: 2,
                location_name: 'PT3 Solutions Singapore Campus',
                commencement_year: 2026,
                study_status: 'active'
            },
            {
                student_id: 2,
                student_number: 'PT3-2026-002',
                first_name: 'Sarah',
                last_name: 'Jenkins',
                email: 'sarah.jenkins@student.pt3solutions.edu.sg',
                course_id: 2,
                course_code: 'PT3-BSIT-CS02',
                course_name: 'Bachelor of Information Technology (Major: Computer Science)',
                location_id: 2,
                location_name: 'PT3 Solutions Singapore Campus',
                commencement_year: 2026,
                study_status: 'active'
            },
            {
                student_id: 3,
                student_number: 'PT3-2026-003',
                first_name: 'Michael',
                last_name: 'Chang',
                email: 'm.chang@student.pt3solutions.edu.sg',
                course_id: 3,
                course_code: 'PT3-BSIT-BIS03',
                course_name: 'Bachelor of Information Technology (Major: Business Information Systems)',
                location_id: 2,
                location_name: 'PT3 Solutions Singapore Campus',
                commencement_year: 2026,
                study_status: 'active'
            },
            {
                student_id: 4,
                student_number: 'PT3-2026-004',
                first_name: 'Emily',
                last_name: 'Watson',
                email: 'e.watson@student.pt3solutions.edu.sg',
                course_id: 4,
                course_code: 'PT3-BSIT-AI04',
                course_name: 'Bachelor of Information Technology (Major: Artificial Intelligence)',
                location_id: 2,
                location_name: 'PT3 Solutions Singapore Campus',
                commencement_year: 2026,
                study_status: 'part-time'
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
            location_name: 'PT3 Solutions Singapore Campus',
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
            { history_id: 1, student_id: 1, unit_id: 1, unit_code: 'ICT100', unit_title: 'Transition to IT', status: 'completed', grade: 'D', mark: 78.5, period_id: 1, period_code: 'S1', year_taken: 2026 },
            { history_id: 2, student_id: 1, unit_id: 3, unit_code: 'ICT159', unit_title: 'Foundations of Programming', status: 'completed', grade: 'C', mark: 68.0, period_id: 1, period_code: 'S1', year_taken: 2026 },
            { history_id: 3, student_id: 1, unit_id: 5, unit_code: 'ICT169', unit_title: 'Foundations of Data Communications', status: 'attempted', grade: 'F', mark: 42.0, period_id: 1, period_code: 'S1', year_taken: 2026 },
            { history_id: 4, student_id: 1, unit_id: 17, unit_code: 'MAS162', unit_title: 'Discrete Mathematics', status: 'current', grade: null, mark: null, period_id: 2, period_code: 'S2', year_taken: 2026 },
            { history_id: 5, student_id: 1, unit_id: 2, unit_code: 'ICT158', unit_title: 'Introduction to Computer Systems', status: 'current', grade: null, mark: null, period_id: 2, period_code: 'S2', year_taken: 2026 }
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
            { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T3'] },
            { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, level: 100, prerequisites: [{ prereq_code: 'ICT159' }], offerings: ['T1', 'T2'] },
            { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2'] },
            { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T3'] },
            { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT158' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 9, code: 'ICT202', title: 'Machine Learning', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT159' }], offerings: ['T2', 'T3'] },
            { unit_id: 10, code: 'ICT203', title: 'Artificial Intelligence', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT167' }], offerings: ['T1', 'T3'] },
            { unit_id: 11, code: 'ICT206', title: 'Intelligent Systems', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT167' }], offerings: ['T2', 'T3'] },
            { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT167' }], offerings: ['T1', 'T2'] },
            { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT158' }], offerings: ['T1', 'T2'] },
            { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT159' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT158' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT158' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 18, code: 'MAS164', title: 'Fundamentals of Mathematics', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 19, code: 'MAS183', title: 'Statistical Data Analysis', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T3'] },
            { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT292' }], offerings: ['T1', 'T2'] },
            { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT201' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 22, code: 'ICT303', title: 'Advanced Machine Learning', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT202' }], offerings: ['T2', 'T3'] },
            { unit_id: 23, code: 'ICT304', title: 'AI System Design', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT203' }], offerings: ['T1', 'T3'] },
            { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT202' }], offerings: ['T2', 'T3'] },
            { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT283' }], offerings: ['T1', 'T3'] },
            { unit_id: 26, code: 'ICT374', title: 'Operating Systems', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT283' }], offerings: ['T2', 'T3'] },
            { unit_id: 27, code: 'ICT393', title: 'Advanced Business Intelligence', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT284' }], offerings: ['T1', 'T3'] },
            { unit_id: 28, code: 'ICT394', title: 'Business Intelligence & Analytics', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT285' }], offerings: ['T1', 'T2', 'T3'] }
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
