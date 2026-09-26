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
                student_id: 0,
                student_number: 'ADMIN-CHAIR-01',
                first_name: 'Dr. Aris',
                last_name: 'Thorne (Academic Chair)',
                email: 'academic.chair@pt3solutions.edu.sg',
                course_id: 1,
                course_code: 'PT3-ADMIN',
                course_name: 'Academic Chair & System Administrator',
                location_id: 2,
                location_name: 'PT3 Solutions Singapore Campus',
                commencement_year: 2026,
                study_status: 'active',
                account_category: 'admin'
            },
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
                study_status: 'active',
                account_category: 'existing_student'
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
                study_status: 'active',
                account_category: 'existing_student'
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
                study_status: 'active',
                account_category: 'new_student'
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
                study_status: 'part-time',
                account_category: 'new_student'
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
        if (id == 0 || id == 3 || id == 4) {
            // New Students (Michael Chang, Emily Watson) - 0 prior history recorded (Fresh Enrolment)
            return [];
        }
        if (id == 2) {
            // Sarah Jenkins (Existing Student - CS Major: 14 Passed, 2 Enrolled, 1 Failed)
            return [
                // 2026 Trimester 1 (T1) - Passed
                { history_id: 6, student_id: 2, unit_id: 1, unit_code: 'ICT100', unit_title: 'Transition to IT', status: 'completed', grade: 'HD', mark: 92.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
                { history_id: 7, student_id: 2, unit_id: 2, unit_code: 'ICT158', unit_title: 'Introduction to Computer Systems', status: 'completed', grade: 'D', mark: 81.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
                { history_id: 8, student_id: 2, unit_id: 3, unit_code: 'ICT159', unit_title: 'Foundations of Programming', status: 'completed', grade: 'HD', mark: 89.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
                { history_id: 9, student_id: 2, unit_id: 17, unit_code: 'MAS162', unit_title: 'Discrete Mathematics', status: 'completed', grade: 'C', mark: 69.0, period_id: 3, period_code: 'T1', year_taken: 2026 },

                // 2026 Trimester 2 (T2) - Passed
                { history_id: 10, student_id: 2, unit_id: 4, unit_code: 'ICT167', unit_title: 'Principles of Computer Science', status: 'completed', grade: 'D', mark: 77.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
                { history_id: 11, student_id: 2, unit_id: 5, unit_code: 'ICT169', unit_title: 'Foundations of Data Communications', status: 'completed', grade: 'HD', mark: 88.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
                { history_id: 12, student_id: 2, unit_id: 7, unit_code: 'ICT145', unit_title: 'Python Programming', status: 'completed', grade: 'HD', mark: 94.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
                { history_id: 13, student_id: 2, unit_id: 18, unit_code: 'MAS164', unit_title: 'Fundamentals of Mathematics', status: 'completed', grade: 'D', mark: 76.0, period_id: 4, period_code: 'T2', year_taken: 2026 },

                // 2026 Trimester 3 (T3) - 3 Passed, 1 Failed
                { history_id: 14, student_id: 2, unit_id: 6, unit_code: 'ICT170', unit_title: 'Foundations of Computer Systems', status: 'completed', grade: 'HD', mark: 95.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
                { history_id: 15, student_id: 2, unit_id: 14, unit_code: 'ICT285', unit_title: 'Databases', status: 'completed', grade: 'HD', mark: 91.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
                { history_id: 16, student_id: 2, unit_id: 9, unit_code: 'ICT202', unit_title: 'Machine Learning', status: 'completed', grade: 'D', mark: 79.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
                { history_id: 17, student_id: 2, unit_id: 12, unit_code: 'ICT283', unit_title: 'Data Structures & Algorithms', status: 'attempted', grade: 'F', mark: 42.0, period_id: 5, period_code: 'T3', year_taken: 2026 },

                // 2027 Trimester 1 (T1) - Passed
                { history_id: 18, student_id: 2, unit_id: 8, unit_code: 'ICT201', unit_title: 'IT Project Management', status: 'completed', grade: 'D', mark: 75.0, period_id: 3, period_code: 'T1', year_taken: 2027 },
                { history_id: 19, student_id: 2, unit_id: 13, unit_code: 'ICT284', unit_title: 'Systems Analysis & Design', status: 'completed', grade: 'D', mark: 79.0, period_id: 3, period_code: 'T1', year_taken: 2027 },
                { history_id: 20, student_id: 2, unit_id: 15, unit_code: 'ICT292', unit_title: 'Information Systems Architecture', status: 'completed', grade: 'D', mark: 78.0, period_id: 3, period_code: 'T1', year_taken: 2027 },
                { history_id: 21, student_id: 2, unit_id: 16, unit_code: 'BSC203', unit_title: 'Intro to ICT Research Methods', status: 'completed', grade: 'HD', mark: 87.0, period_id: 3, period_code: 'T1', year_taken: 2027 },

                // 2027 Trimester 2 (T2) - Currently Enrolled
                { history_id: 22, student_id: 2, unit_id: 11, unit_code: 'ICT206', unit_title: 'Intelligent Systems', status: 'enrolled', grade: null, mark: null, period_id: 4, period_code: 'T2', year_taken: 2027 },
                { history_id: 23, student_id: 2, unit_id: 19, unit_code: 'MAS183', unit_title: 'Statistical Data Analysis', status: 'enrolled', grade: null, mark: null, period_id: 4, period_code: 'T2', year_taken: 2027 }
            ];
        }
        // Alex Mercer (Existing Student - AI Major: 12 Units across 2026 T1, T2, T3)
        return [
            // 2026 Trimester 1 (T1) - PASSED
            { history_id: 1, student_id: 1, unit_id: 1, unit_code: 'ICT100', unit_title: 'Transition to IT', status: 'completed', grade: 'HD', mark: 88.5, period_id: 3, period_code: 'T1', year_taken: 2026 },
            { history_id: 2, student_id: 1, unit_id: 2, unit_code: 'ICT158', unit_title: 'Introduction to Computer Systems', status: 'completed', grade: 'D', mark: 78.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
            { history_id: 3, student_id: 1, unit_id: 3, unit_code: 'ICT159', unit_title: 'Foundations of Programming', status: 'completed', grade: 'HD', mark: 85.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
            { history_id: 4, student_id: 1, unit_id: 17, unit_code: 'MAS162', unit_title: 'Discrete Mathematics', status: 'completed', grade: 'HD', mark: 90.0, period_id: 3, period_code: 'T1', year_taken: 2026 },

            // 2026 Trimester 2 (T2) - 3 PASSED, 1 FAILED
            { history_id: 5, student_id: 1, unit_id: 4, unit_code: 'ICT167', unit_title: 'Principles of Computer Science', status: 'completed', grade: 'C', mark: 68.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
            { history_id: 6, student_id: 1, unit_id: 6, unit_code: 'ICT170', unit_title: 'Foundations of Computer Systems', status: 'completed', grade: 'D', mark: 75.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
            { history_id: 7, student_id: 1, unit_id: 7, unit_code: 'ICT145', unit_title: 'Python Programming', status: 'attempted', grade: 'F', mark: 42.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
            { history_id: 8, student_id: 1, unit_id: 18, unit_code: 'MAS164', unit_title: 'Fundamentals of Mathematics', status: 'completed', grade: 'D', mark: 76.0, period_id: 4, period_code: 'T2', year_taken: 2026 },

            // 2026 Trimester 3 (T3) - PASSED
            { history_id: 9, student_id: 1, unit_id: 5, unit_code: 'ICT169', unit_title: 'Foundations of Data Communications', status: 'completed', grade: 'HD', mark: 86.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
            { history_id: 10, student_id: 1, unit_id: 13, unit_code: 'ICT284', unit_title: 'Systems Analysis & Design', status: 'completed', grade: 'D', mark: 77.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
            { history_id: 11, student_id: 1, unit_id: 14, unit_code: 'ICT285', unit_title: 'Databases', status: 'completed', grade: 'HD', mark: 89.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
            { history_id: 12, student_id: 1, unit_id: 9, unit_code: 'ICT202', unit_title: 'Machine Learning', status: 'completed', grade: 'D', mark: 79.0, period_id: 5, period_code: 'T3', year_taken: 2026 }
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
            { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, level: 100, prerequisites: [{ prereq_code: 'ICT159' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT158' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 9, code: 'ICT202', title: 'Machine Learning', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT159' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 10, code: 'ICT203', title: 'Artificial Intelligence', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT167' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 11, code: 'ICT206', title: 'Intelligent Systems', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT167' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT167' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT158' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT159' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT158' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, level: 200, prerequisites: [{ prereq_code: 'ICT158' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 18, code: 'MAS164', title: 'Fundamentals of Mathematics', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 19, code: 'MAS183', title: 'Statistical Data Analysis', credit_points: 3, level: 100, prerequisites: [], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT292' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT201' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 22, code: 'ICT303', title: 'Advanced Machine Learning', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT202' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 23, code: 'ICT304', title: 'AI System Design', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT203' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT202' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT283' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 26, code: 'ICT374', title: 'Operating Systems', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT283' }], offerings: ['T1', 'T2', 'T3'] },
            { unit_id: 27, code: 'ICT393', title: 'Advanced Business Intelligence', credit_points: 3, level: 300, prerequisites: [{ prereq_code: 'ICT284' }], offerings: ['T1', 'T2', 'T3'] },
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

export const mockClientStudentPlans = {
    1: {
        plan: { plan_id: 1, student_id: 1, title: 'PT3-BSIT Artificial Intelligence Plan 2026', status: 'approved', total_credit_points: 36 },
        units: [
            // Year 1 Trimester 1 (period_id: 3) - 12 CP
            { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, year_level: 1, period_id: 3, sequence_order: 1 },
            { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, year_level: 1, period_id: 3, sequence_order: 2 },
            { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, year_level: 1, period_id: 3, sequence_order: 3 },
            { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, year_level: 1, period_id: 3, sequence_order: 4 },

            // Year 1 Trimester 2 (period_id: 4) - 12 CP
            { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, year_level: 1, period_id: 4, sequence_order: 1 },
            { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, year_level: 1, period_id: 4, sequence_order: 2 },
            { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, year_level: 1, period_id: 4, sequence_order: 3 },
            { unit_id: 18, code: 'MAS164', title: 'Fundamentals of Mathematics', credit_points: 3, year_level: 1, period_id: 4, sequence_order: 4 },

            // Year 1 Trimester 3 (period_id: 5) - 12 CP
            { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, year_level: 1, period_id: 5, sequence_order: 1 },
            { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, year_level: 1, period_id: 5, sequence_order: 2 },
            { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, year_level: 1, period_id: 5, sequence_order: 3 },
            { unit_id: 9, code: 'ICT202', title: 'Machine Learning', credit_points: 3, year_level: 1, period_id: 5, sequence_order: 4 }
        ]
    },
    2: {
        plan: { plan_id: 2, student_id: 2, title: 'PT3-BSIT Computer Science Plan 2026', status: 'draft', total_credit_points: 72 },
        units: [
            // Year 1 - Trimester 1 (period_id: 3) - 12 CP
            { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, year_level: 1, period_id: 3, sequence_order: 1 },
            { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, year_level: 1, period_id: 3, sequence_order: 2 },
            { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, year_level: 1, period_id: 3, sequence_order: 3 },
            { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, year_level: 1, period_id: 3, sequence_order: 4 },

            // Year 1 - Trimester 2 (period_id: 4) - 12 CP
            { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, year_level: 1, period_id: 4, sequence_order: 1 },
            { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, year_level: 1, period_id: 4, sequence_order: 2 },
            { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, year_level: 1, period_id: 4, sequence_order: 3 },
            { unit_id: 18, code: 'MAS164', title: 'Fundamentals of Mathematics', credit_points: 3, year_level: 1, period_id: 4, sequence_order: 4 },

            // Year 1 - Trimester 3 (period_id: 5) - 12 CP
            { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, year_level: 1, period_id: 5, sequence_order: 1 },
            { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, year_level: 1, period_id: 5, sequence_order: 2 },
            { unit_id: 9, code: 'ICT202', title: 'Machine Learning', credit_points: 3, year_level: 1, period_id: 5, sequence_order: 3 },
            { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, year_level: 1, period_id: 5, sequence_order: 4 },

            // Year 2 - Trimester 1 (period_id: 3) - 12 CP
            { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, year_level: 2, period_id: 3, sequence_order: 1 },
            { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, year_level: 2, period_id: 3, sequence_order: 2 },
            { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, year_level: 2, period_id: 3, sequence_order: 3 },
            { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, year_level: 2, period_id: 3, sequence_order: 4 },

            // Year 2 - Trimester 2 (period_id: 4) - 12 CP
            { unit_id: 11, code: 'ICT206', title: 'Intelligent Systems', credit_points: 3, year_level: 2, period_id: 4, sequence_order: 1 },
            { unit_id: 19, code: 'MAS183', title: 'Statistical Data Analysis', credit_points: 3, year_level: 2, period_id: 4, sequence_order: 2 },
            { unit_id: 26, code: 'ICT374', title: 'Operating Systems', credit_points: 3, year_level: 2, period_id: 4, sequence_order: 3 },
            { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, year_level: 2, period_id: 4, sequence_order: 4 },

            // Year 2 - Trimester 3 (period_id: 5) - 12 CP
            { unit_id: 10, code: 'ICT203', title: 'Artificial Intelligence', credit_points: 3, year_level: 2, period_id: 5, sequence_order: 1 },
            { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, year_level: 2, period_id: 5, sequence_order: 2 },
            { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, year_level: 2, period_id: 5, sequence_order: 3 },
            { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice', credit_points: 3, year_level: 2, period_id: 5, sequence_order: 4 }
        ]
    },
    3: {
        plan: { plan_id: 3, student_id: 3, title: 'PT3-BSIT Business Info Systems Plan 2026', status: 'draft', total_credit_points: 0 },
        units: []
    },
    4: {
        plan: { plan_id: 4, student_id: 4, title: 'PT3-BSIT Artificial Intelligence Plan 2026', status: 'draft', total_credit_points: 0 },
        units: []
    }
};

export const mockArchivedStudentPlans = {
    1: {
        plan: { plan_id: 1, student_id: 1, title: 'PT3-BSIT Artificial Intelligence Plan 2026', status: 'approved', total_credit_points: 72 },
        units: [
            { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 1 },
            { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 2 },
            { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 3 },
            { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 4 },
            { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 1 },
            { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 2 },
            { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 3 },
            { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 4 },
            { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 1 },
            { unit_id: 9, code: 'ICT202', title: 'Machine Learning', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 2 },
            { unit_id: 10, code: 'ICT203', title: 'Artificial Intelligence', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 3 },
            { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 4 },
            { unit_id: 11, code: 'ICT206', title: 'Intelligent Systems', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 1 },
            { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 2 },
            { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 3 },
            { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 4 },
            { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 1 },
            { unit_id: 22, code: 'ICT303', title: 'Advanced Machine Learning', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 2 },
            { unit_id: 23, code: 'ICT304', title: 'AI System Design', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 3 },
            { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 4 },
            { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 1 },
            { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 2 },
            { unit_id: 26, code: 'ICT374', title: 'Operating Systems', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 3 },
            { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 4 }
        ]
    },
    2: {
        plan: { plan_id: 2, student_id: 2, title: 'PT3-BSIT Computer Science Plan 2026', status: 'agreed', total_credit_points: 72 },
        units: [
            { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 1 },
            { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 2 },
            { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 3 },
            { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 4 },
            { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 1 },
            { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 2 },
            { unit_id: 18, code: 'MAS164', title: 'Fundamentals of Mathematics', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 3 },
            { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 4 },
            { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 1 },
            { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 2 },
            { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 3 },
            { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 4 },
            { unit_id: 26, code: 'ICT374', title: 'Operating Systems', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 1 },
            { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 2 },
            { unit_id: 19, code: 'MAS183', title: 'Statistical Data Analysis', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 3 },
            { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 4 },
            { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 1 },
            { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 2 },
            { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 3 },
            { unit_id: 10, code: 'ICT203', title: 'Artificial Intelligence', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 4 },
            { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 1 },
            { unit_id: 11, code: 'ICT206', title: 'Intelligent Systems', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 2 },
            { unit_id: 23, code: 'ICT304', title: 'AI System Design', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 3 },
            { unit_id: 28, code: 'ICT394', title: 'Business Intelligence & Analytics', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 4 }
        ]
    },
    3: {
        plan: { plan_id: 3, student_id: 3, title: 'PT3-BSIT Business Info Systems Plan 2026', status: 'recommended', total_credit_points: 69 },
        units: [
            { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 1 },
            { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 2 },
            { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 3 },
            { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 4 },
            { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 1 },
            { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 2 },
            { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 3 },
            { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 4 },
            { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 1 },
            { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 2 },
            { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 3 },
            { unit_id: 19, code: 'MAS183', title: 'Statistical Data Analysis', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 4 },
            { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 1 },
            { unit_id: 28, code: 'ICT394', title: 'Business Intelligence & Analytics', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 2 },
            { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 3 },
            { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 4 },
            { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 1 },
            { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 2 },
            { unit_id: 27, code: 'ICT393', title: 'Advanced Business Intelligence', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 3 },
            { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 4 },
            { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 1 },
            { unit_id: 9, code: 'ICT202', title: 'Machine Learning', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 2 },
            { unit_id: 23, code: 'ICT304', title: 'AI System Design', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 3 }
        ]
    },
    4: {
        plan: { plan_id: 4, student_id: 4, title: 'PT3-BSIT Artificial Intelligence Plan 2026', status: 'draft', total_credit_points: 72 },
        units: [
            { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 1 },
            { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 2 },
            { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 3 },
            { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 4 },
            { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 1 },
            { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 2 },
            { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 3 },
            { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 4 },
            { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 1 },
            { unit_id: 9, code: 'ICT202', title: 'Machine Learning', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 2 },
            { unit_id: 10, code: 'ICT203', title: 'Artificial Intelligence', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 3 },
            { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, year_level: 2, period_id: 1, sequence_order: 4 },
            { unit_id: 11, code: 'ICT206', title: 'Intelligent Systems', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 1 },
            { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 2 },
            { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 3 },
            { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, year_level: 2, period_id: 2, sequence_order: 4 },
            { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice (Capstone)', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 1 },
            { unit_id: 22, code: 'ICT303', title: 'Advanced Machine Learning', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 2 },
            { unit_id: 23, code: 'ICT304', title: 'AI System Design', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 3 },
            { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, year_level: 3, period_id: 1, sequence_order: 4 },
            { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 1 },
            { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 2 },
            { unit_id: 26, code: 'ICT374', title: 'Operating Systems', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 3 },
            { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, year_level: 3, period_id: 2, sequence_order: 4 }
        ]
    }
};

export async function fetchPlanByStudent(studentId) {
    try {
        const res = await fetch(`${API_BASE}/plans/student/${studentId}`);
        if (!res.ok) throw new Error('Failed to fetch study plan');
        const data = await res.json();
        return data;
    } catch (err) {
        console.warn('API fetchPlanByStudent fallback activated:', err.message);
        return mockClientStudentPlans[Number(studentId)] || mockClientStudentPlans[1];
    }
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

export async function fetchAuditLog() {
    try {
        const res = await fetch(`${API_BASE}/plans/audit-log`);
        if (!res.ok) throw new Error('Failed to fetch audit log');
        return await res.json();
    } catch (err) {
        console.warn('API fetchAuditLog fallback activated:', err.message);
        return [
            {
                version_id: 106,
                plan_id: 2,
                version_number: 'LOG',
                student_number: 'PT3-2026-002',
                first_name: 'Sarah',
                last_name: 'Jenkins',
                plan_title: 'PT3-BSIT-CS02 Account Session',
                amendment_reason: 'Account Profile Switch: Loaded profile for Sarah Jenkins (EXISTING STUDENT)',
                created_by: 'Academic Chair',
                created_at: '2026-09-17T12:00:00.000Z',
                plan_status: 'logged_in'
            },
            {
                version_id: 105,
                plan_id: 1,
                version_number: 5,
                student_number: 'PT3-2026-001',
                first_name: 'Alex',
                last_name: 'Mercer',
                plan_title: 'PT3-BSIT-AI01 Study Plan',
                amendment_reason: 'Study Plan officially APPROVED & finalized by Academic Chair',
                created_by: 'Academic Chair',
                created_at: '2026-09-17T11:45:00.000Z',
                plan_status: 'approved'
            },
            {
                version_id: 104,
                plan_id: 1,
                version_number: 4,
                student_number: 'PT3-2026-001',
                first_name: 'Alex',
                last_name: 'Mercer',
                plan_title: 'PT3-BSIT-AI01 Study Plan',
                amendment_reason: 'Student agreed and digitally signed proposed study plan (72 CP)',
                created_by: 'Student: Alex Mercer',
                created_at: '2026-09-17T11:30:00.000Z',
                plan_status: 'agreed'
            },
            {
                version_id: 103,
                plan_id: 1,
                version_number: 3,
                student_number: 'PT3-2026-001',
                first_name: 'Alex',
                last_name: 'Mercer',
                plan_title: 'PT3-BSIT-AI01 Study Plan',
                amendment_reason: 'Study plan marked as RECOMMENDED to student for review',
                created_by: 'Academic Chair',
                created_at: '2026-09-17T11:15:00.000Z',
                plan_status: 'recommended'
            },
            {
                version_id: 102,
                plan_id: 2,
                version_number: 2,
                student_number: 'PT3-2026-002',
                first_name: 'Sarah',
                last_name: 'Jenkins',
                plan_title: 'PT3-BSIT-CS02 Study Plan',
                amendment_reason: 'Amended Computer Science unit sequence (Added ICT283 Data Structures)',
                created_by: 'Academic Chair',
                created_at: '2026-09-17T10:45:00.000Z',
                plan_status: 'draft'
            },
            {
                version_id: 101,
                plan_id: 1,
                version_number: 1,
                student_number: 'PT3-2026-001',
                first_name: 'Alex',
                last_name: 'Mercer',
                plan_title: 'PT3-BSIT-AI01 Study Plan',
                amendment_reason: 'Initial study plan creation and unit placement (Year 1 S1 & S2)',
                created_by: 'Academic Chair',
                created_at: '2026-09-17T10:00:00.000Z',
                plan_status: 'draft'
            }
        ];
    }
}
