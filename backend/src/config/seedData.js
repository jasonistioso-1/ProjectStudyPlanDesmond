// Central Seed Dataset for PT3 Solutions Study Plan Repository (SPR)
// Rich 6-student dataset across multiple campuses, majors, and study statuses

export const mockLocations = [
    { location_id: 1, code: 'PT3-MAIN', name: 'PT3 Solutions Main Campus (Perth)' },
    { location_id: 2, code: 'PT3-SGP', name: 'PT3 Solutions Singapore Campus' },
    { location_id: 3, code: 'PT3-DXB', name: 'PT3 Solutions Dubai Campus' },
    { location_id: 4, code: 'PT3-ONL', name: 'PT3 Solutions Online Portal' }
];

export const mockTeachingPeriods = [
    { period_id: 1, code: 'S1', name: 'Semester 1', period_type: 'semester', sequence_order: 1, start_date: '2026-03-02', end_date: '2026-06-26', date_range: '02 Mar – 26 Jun' },
    { period_id: 2, code: 'S2', name: 'Semester 2', period_type: 'semester', sequence_order: 2, start_date: '2026-07-27', end_date: '2026-11-20', date_range: '27 Jul – 20 Nov' },
    { period_id: 3, code: 'T1', name: 'Trimester 1', period_type: 'trimester', sequence_order: 1, start_date: '2026-01-05', end_date: '2026-04-17', date_range: '05 Jan – 17 Apr' },
    { period_id: 4, code: 'T2', name: 'Trimester 2', period_type: 'trimester', sequence_order: 2, start_date: '2026-05-04', end_date: '2026-08-14', date_range: '04 May – 14 Aug' },
    { period_id: 5, code: 'T3', name: 'Trimester 3', period_type: 'trimester', sequence_order: 3, start_date: '2026-08-31', end_date: '2026-12-11', date_range: '31 Aug – 11 Dec' }
];

export const mockCourses = [
    { course_id: 1, code: 'PT3-BSIT-AI01', name: 'Bachelor of Information Technology (Major: Artificial Intelligence)', degree_level: 'Bachelor', total_credit_points: 72 },
    { course_id: 2, code: 'PT3-BSIT-CS02', name: 'Bachelor of Information Technology (Major: Computer Science)', degree_level: 'Bachelor', total_credit_points: 72 },
    { course_id: 3, code: 'PT3-BSIT-BIS03', name: 'Bachelor of Information Technology (Major: Business Information Systems)', degree_level: 'Bachelor', total_credit_points: 72 },
    { course_id: 4, code: 'PT3-BSIT-AI04', name: 'Bachelor of Information Technology (Major: Artificial Intelligence)', degree_level: 'Bachelor', total_credit_points: 72 }
];

export const mockUnits = [
    { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, level: 100 },
    { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, level: 100 },
    { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, level: 100 },
    { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, level: 100 },
    { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, level: 100 },
    { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, level: 100 },
    { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, level: 100 },
    { unit_id: 8, code: 'ICT201', title: 'IT Project Management', credit_points: 3, level: 200 },
    { unit_id: 9, code: 'ICT202', title: 'Machine Learning', credit_points: 3, level: 200 },
    { unit_id: 10, code: 'ICT203', title: 'Artificial Intelligence', credit_points: 3, level: 200 },
    { unit_id: 11, code: 'ICT206', title: 'Intelligent Systems', credit_points: 3, level: 200 },
    { unit_id: 12, code: 'ICT283', title: 'Data Structures & Algorithms', credit_points: 3, level: 200 },
    { unit_id: 13, code: 'ICT284', title: 'Systems Analysis & Design', credit_points: 3, level: 200 },
    { unit_id: 14, code: 'ICT285', title: 'Databases', credit_points: 3, level: 200 },
    { unit_id: 15, code: 'ICT292', title: 'Information Systems Architecture', credit_points: 3, level: 200 },
    { unit_id: 16, code: 'BSC203', title: 'Intro to ICT Research Methods', credit_points: 3, level: 200 },
    { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, level: 100 },
    { unit_id: 18, code: 'MAS164', title: 'Fundamentals of Mathematics', credit_points: 3, level: 100 },
    { unit_id: 19, code: 'MAS183', title: 'Statistical Data Analysis', credit_points: 3, level: 100 },
    { unit_id: 20, code: 'ICT301', title: 'Enterprise Architecture', credit_points: 3, level: 300 },
    { unit_id: 21, code: 'ICT302', title: 'IT Professional Practice', credit_points: 3, level: 300 },
    { unit_id: 22, code: 'ICT303', title: 'Advanced Machine Learning', credit_points: 3, level: 300 },
    { unit_id: 23, code: 'ICT304', title: 'AI System Design', credit_points: 3, level: 300 },
    { unit_id: 24, code: 'ICT305', title: 'Data Visualisation', credit_points: 3, level: 300 },
    { unit_id: 25, code: 'ICT373', title: 'Software Architecture', credit_points: 3, level: 300 },
    { unit_id: 26, code: 'ICT374', title: 'Operating Systems', credit_points: 3, level: 300 },
    { unit_id: 27, code: 'ICT393', title: 'Advanced Business Analysis', credit_points: 3, level: 300 },
    { unit_id: 28, code: 'ICT394', title: 'Business Intelligence', credit_points: 3, level: 300 }
];

export const mockStudents = [
    {
        student_id: 0,
        student_number: 'ADMIN-CHAIR-01',
        first_name: 'Dr. Aris',
        last_name: 'Thorne (Academic Chair)',
        email: 'academic.chair@pt3solutions.edu.sg',
        course_id: 1,
        course_code: 'PT3-ADMIN',
        course_name: 'Academic Chair',
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
        course_id: 1,
        course_code: 'PT3-BSIT-AI04',
        course_name: 'Bachelor of Information Technology (Major: Artificial Intelligence)',
        location_id: 2,
        location_name: 'PT3 Solutions Singapore Campus',
        commencement_year: 2026,
        study_status: 'part-time',
        account_category: 'new_student'
    }
];

export const mockStudentHistory = [
    // Alex Mercer (Existing Student - AI Major: 12 Units across 2026 T1, T2, T3)
    { history_id: 1, student_id: 1, unit_id: 1, unit_code: 'ICT100', unit_title: 'Transition to IT', status: 'completed', grade: 'HD', mark: 88.5, period_id: 3, period_code: 'T1', year_taken: 2026 },
    { history_id: 2, student_id: 1, unit_id: 2, unit_code: 'ICT158', unit_title: 'Introduction to Computer Systems', status: 'completed', grade: 'D', mark: 78.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
    { history_id: 3, student_id: 1, unit_id: 3, unit_code: 'ICT159', unit_title: 'Foundations of Programming', status: 'completed', grade: 'HD', mark: 85.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
    { history_id: 4, student_id: 1, unit_id: 17, unit_code: 'MAS162', unit_title: 'Discrete Mathematics', status: 'completed', grade: 'HD', mark: 90.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
    { history_id: 5, student_id: 1, unit_id: 4, unit_code: 'ICT167', unit_title: 'Principles of Computer Science', status: 'completed', grade: 'C', mark: 68.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
    { history_id: 6, student_id: 1, unit_id: 6, unit_code: 'ICT170', unit_title: 'Foundations of Computer Systems', status: 'completed', grade: 'D', mark: 75.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
    { history_id: 7, student_id: 1, unit_id: 7, unit_code: 'ICT145', unit_title: 'Python Programming', status: 'attempted', grade: 'F', mark: 42.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
    { history_id: 8, student_id: 1, unit_id: 18, unit_code: 'MAS164', unit_title: 'Fundamentals of Mathematics', status: 'completed', grade: 'D', mark: 76.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
    { history_id: 9, student_id: 1, unit_id: 5, unit_code: 'ICT169', unit_title: 'Foundations of Data Communications', status: 'completed', grade: 'HD', mark: 86.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
    { history_id: 10, student_id: 1, unit_id: 13, unit_code: 'ICT284', unit_title: 'Systems Analysis & Design', status: 'completed', grade: 'D', mark: 77.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
    { history_id: 11, student_id: 1, unit_id: 14, unit_code: 'ICT285', unit_title: 'Databases', status: 'completed', grade: 'HD', mark: 89.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
    { history_id: 12, student_id: 1, unit_id: 9, unit_code: 'ICT202', unit_title: 'Machine Learning', status: 'completed', grade: 'D', mark: 79.0, period_id: 5, period_code: 'T3', year_taken: 2026 },

    // Sarah Jenkins (Existing Student - CS Major: 14 Passed, 2 Enrolled, 1 Failed)
    { history_id: 13, student_id: 2, unit_id: 1, unit_code: 'ICT100', unit_title: 'Transition to IT', status: 'completed', grade: 'HD', mark: 92.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
    { history_id: 14, student_id: 2, unit_id: 2, unit_code: 'ICT158', unit_title: 'Introduction to Computer Systems', status: 'completed', grade: 'D', mark: 81.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
    { history_id: 15, student_id: 2, unit_id: 3, unit_code: 'ICT159', unit_title: 'Foundations of Programming', status: 'completed', grade: 'HD', mark: 89.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
    { history_id: 16, student_id: 2, unit_id: 17, unit_code: 'MAS162', unit_title: 'Discrete Mathematics', status: 'completed', grade: 'C', mark: 69.0, period_id: 3, period_code: 'T1', year_taken: 2026 },
    { history_id: 17, student_id: 2, unit_id: 4, unit_code: 'ICT167', unit_title: 'Principles of Computer Science', status: 'completed', grade: 'D', mark: 77.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
    { history_id: 18, student_id: 2, unit_id: 5, unit_code: 'ICT169', unit_title: 'Foundations of Data Communications', status: 'completed', grade: 'HD', mark: 88.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
    { history_id: 19, student_id: 2, unit_id: 7, unit_code: 'ICT145', unit_title: 'Python Programming', status: 'completed', grade: 'HD', mark: 94.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
    { history_id: 20, student_id: 2, unit_id: 18, unit_code: 'MAS164', unit_title: 'Fundamentals of Mathematics', status: 'completed', grade: 'D', mark: 76.0, period_id: 4, period_code: 'T2', year_taken: 2026 },
    { history_id: 21, student_id: 2, unit_id: 6, unit_code: 'ICT170', unit_title: 'Foundations of Computer Systems', status: 'completed', grade: 'HD', mark: 95.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
    { history_id: 22, student_id: 2, unit_id: 14, unit_code: 'ICT285', unit_title: 'Databases', status: 'completed', grade: 'HD', mark: 91.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
    { history_id: 23, student_id: 2, unit_id: 9, unit_code: 'ICT202', unit_title: 'Machine Learning', status: 'completed', grade: 'D', mark: 79.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
    { history_id: 24, student_id: 2, unit_id: 12, unit_code: 'ICT283', unit_title: 'Data Structures & Algorithms', status: 'attempted', grade: 'F', mark: 42.0, period_id: 5, period_code: 'T3', year_taken: 2026 },
    { history_id: 25, student_id: 2, unit_id: 8, unit_code: 'ICT201', unit_title: 'IT Project Management', status: 'completed', grade: 'D', mark: 75.0, period_id: 3, period_code: 'T1', year_taken: 2027 },
    { history_id: 26, student_id: 2, unit_id: 13, unit_code: 'ICT284', unit_title: 'Systems Analysis & Design', status: 'completed', grade: 'D', mark: 79.0, period_id: 3, period_code: 'T1', year_taken: 2027 },
    { history_id: 27, student_id: 2, unit_id: 15, unit_code: 'ICT292', unit_title: 'Information Systems Architecture', status: 'completed', grade: 'D', mark: 78.0, period_id: 3, period_code: 'T1', year_taken: 2027 },
    { history_id: 28, student_id: 2, unit_id: 16, unit_code: 'BSC203', unit_title: 'Intro to ICT Research Methods', status: 'completed', grade: 'HD', mark: 87.0, period_id: 3, period_code: 'T1', year_taken: 2027 },
    { history_id: 29, student_id: 2, unit_id: 11, unit_code: 'ICT206', unit_title: 'Intelligent Systems', status: 'enrolled', grade: null, mark: null, period_id: 4, period_code: 'T2', year_taken: 2027 },
    { history_id: 30, student_id: 2, unit_id: 19, unit_code: 'MAS183', unit_title: 'Statistical Data Analysis', status: 'enrolled', grade: null, mark: null, period_id: 4, period_code: 'T2', year_taken: 2027 }
];

export const mockPrerequisites = [
    { target_code: 'ICT167', prereq_code: 'ICT159' },
    { target_code: 'ICT201', prereq_code: 'ICT158' },
    { target_code: 'ICT202', prereq_code: 'ICT159' },
    { target_code: 'ICT203', prereq_code: 'ICT167' },
    { target_code: 'ICT206', prereq_code: 'ICT167' },
    { target_code: 'ICT283', prereq_code: 'ICT167' },
    { target_code: 'ICT284', prereq_code: 'ICT158' },
    { target_code: 'ICT285', prereq_code: 'ICT159' },
    { target_code: 'ICT292', prereq_code: 'ICT158' },
    { target_code: 'BSC203', prereq_code: 'ICT158' },
    { target_code: 'ICT301', prereq_code: 'ICT292' },
    { target_code: 'ICT302', prereq_code: 'ICT201' },
    { target_code: 'ICT303', prereq_code: 'ICT202' },
    { target_code: 'ICT304', prereq_code: 'ICT203' },
    { target_code: 'ICT305', prereq_code: 'ICT202' },
    { target_code: 'ICT373', prereq_code: 'ICT283' },
    { target_code: 'ICT374', prereq_code: 'ICT283' },
    { target_code: 'ICT393', prereq_code: 'ICT284' },
    { target_code: 'ICT394', prereq_code: 'ICT285' }
];

export const mockDefaultPlanUnits = [
    { unit_id: 1, code: 'ICT100', title: 'Transition to IT', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 1 },
    { unit_id: 3, code: 'ICT159', title: 'Foundations of Programming', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 2 },
    { unit_id: 17, code: 'MAS162', title: 'Discrete Mathematics', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 3 },
    { unit_id: 2, code: 'ICT158', title: 'Introduction to Computer Systems', credit_points: 3, year_level: 1, period_id: 1, sequence_order: 4 },
    { unit_id: 5, code: 'ICT169', title: 'Foundations of Data Communications', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 5 },
    { unit_id: 6, code: 'ICT170', title: 'Foundations of Computer Systems', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 6 },
    { unit_id: 4, code: 'ICT167', title: 'Principles of Computer Science', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 7 },
    { unit_id: 7, code: 'ICT145', title: 'Python Programming', credit_points: 3, year_level: 1, period_id: 2, sequence_order: 8 }
];

export const mockStudentPlans = {
    1: {
        plan: {
            plan_id: 1,
            student_id: 1,
            title: 'PT3-BSIT Artificial Intelligence Plan 2026',
            status: 'draft',
            total_credit_points: 0
        },
        units: []
    },
    2: {
        plan: {
            plan_id: 2,
            student_id: 2,
            title: 'PT3-BSIT Computer Science Plan 2026',
            status: 'draft',
            total_credit_points: 0
        },
        units: []
    },
    3: {
        plan: {
            plan_id: 3,
            student_id: 3,
            title: 'PT3-BSIT Business Info Systems Plan 2026',
            status: 'draft',
            total_credit_points: 0
        },
        units: []
    },
    4: {
        plan: {
            plan_id: 4,
            student_id: 4,
            title: 'PT3-BSIT Artificial Intelligence Plan 2026',
            status: 'draft',
            total_credit_points: 0
        },
        units: []
    }
};

export const mockAuditLog = [
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
