const API_BASE = 'http://localhost:5000/api';

export async function fetchStudents(search = '') {
    const res = await fetch(`${API_BASE}/students?search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
}

export async function fetchStudentById(id) {
    const res = await fetch(`${API_BASE}/students/${id}`);
    if (!res.ok) throw new Error('Failed to fetch student details');
    return res.json();
}

export async function fetchStudentHistory(id) {
    const res = await fetch(`${API_BASE}/students/${id}/history`);
    if (!res.ok) throw new Error('Failed to fetch student history');
    return res.json();
}

export async function fetchCatalogUnits() {
    const res = await fetch(`${API_BASE}/catalog/units`);
    if (!res.ok) throw new Error('Failed to fetch units catalog');
    return res.json();
}

export async function fetchTeachingPeriods() {
    const res = await fetch(`${API_BASE}/catalog/periods`);
    if (!res.ok) throw new Error('Failed to fetch teaching periods');
    return res.json();
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
