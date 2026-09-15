-- Study Plan Repository (SPR) - Seed Data
-- PT3 Solutions Dataset (PT3-BSIT-01 IT Major)

USE spr_db;

-- Clear existing data (in dependency order)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE StudyPlanVersion;
TRUNCATE TABLE StudyPlanUnit;
TRUNCATE TABLE StudyPlan;
TRUNCATE TABLE StudentUnitHistory;
TRUNCATE TABLE Student;
TRUNCATE TABLE Prerequisite;
TRUNCATE TABLE UnitOffering;
TRUNCATE TABLE Unit;
TRUNCATE TABLE Course;
TRUNCATE TABLE TeachingPeriod;
TRUNCATE TABLE Location;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Seed Locations (PT3 Campuses)
INSERT INTO Location (location_id, code, name) VALUES
(1, 'PT3-MAIN', 'PT3 Solutions Main Campus (Perth)'),
(2, 'PT3-SGP', 'PT3 Solutions Singapore Campus'),
(3, 'PT3-DXB', 'PT3 Solutions Dubai Campus'),
(4, 'PT3-ONL', 'PT3 Solutions Online Portal');

-- 2. Seed Teaching Periods (Semester & Trimester options supported)
INSERT INTO TeachingPeriod (period_id, code, name, period_type, sequence_order) VALUES
(1, 'S1', 'Semester 1', 'semester', 1),
(2, 'S2', 'Semester 2', 'semester', 2),
(3, 'T1', 'Trimester 1', 'trimester', 1),
(4, 'T2', 'Trimester 2', 'trimester', 2),
(5, 'T3', 'Trimester 3', 'trimester', 3),
(6, 'WINT', 'Winter Term', 'winter', 4),
(7, 'SUMM', 'Summer Term', 'summer', 5);

-- 3. Seed Courses
INSERT INTO Course (course_id, code, name, degree_level, total_credit_points) VALUES
(1, 'PT3-BSIT-01', 'Bachelor of Information Technology (Major: Software & Systems)', 'Bachelor', 72),
(2, 'PT3-BSIT-DS02', 'Bachelor of Data Analytics & Business Intelligence', 'Bachelor', 72),
(3, 'PT3-MSIT-03', 'Master of Information Technology (Data Analytics & Cloud)', 'Master', 48);

-- 4. Seed Units (Standard Curriculum Dataset)
INSERT INTO Unit (unit_id, code, title, credit_points, level) VALUES
(1, 'ICT100', 'Transition to Computing', 3, 100),
(2, 'ICT159', 'Foundations of Programming', 3, 100),
(3, 'ICT164', 'Discrete Mathematics & Logic', 3, 100),
(4, 'ICT111', 'Cybersecurity Principles', 3, 100),
(5, 'ICT169', 'Data Communications & Networks', 3, 100),
(6, 'ICT170', 'Computer Systems Architecture', 3, 100),
(7, 'ICT167', 'Data Structures & Algorithms', 3, 100),
(8, 'ICT162', 'Applied Linear Algebra & Statistics', 3, 100),
(9, 'ICT171', 'Web & Mobile Computing Basics', 3, 100),
(10, 'ICT172', 'Fundamentals of Game Design', 3, 100),
(11, 'ICT201', 'IT Project Management', 3, 200),
(12, 'ICT202', 'Advanced Programming & Software Architecture', 3, 200),
(13, 'ICT284', 'Systems Analysis & Design', 3, 200),
(14, 'ICT203', 'Distributed Systems & Network Security', 3, 200),
(15, 'ICT285', 'Database Systems', 3, 200),
(16, 'ICT206', 'Web Programming & Frameworks', 3, 200),
(17, 'ICT209', 'Artificial Intelligence Foundations', 3, 200),
(18, 'ICT218', 'Cyber Forensics & IT', 3, 200),
(19, 'ICT304', 'Software Systems Architecture & Design', 3, 300),
(20, 'ICT302', 'Capstone IT Practice Project', 3, 300),
(21, 'ICT303', 'Advanced Database Applications', 3, 300),
(22, 'ICT310', 'Mobile Application Development', 3, 300),
(23, 'ICT311', 'Cloud Computing & DevOps', 3, 300);

-- 5. Seed Unit Offerings (Year 2026 PT3 Main Campus offerings)
INSERT INTO UnitOffering (unit_id, location_id, period_id, year_version, delivery_mode, is_active) VALUES
(1, 1, 1, 2026, 'internal', TRUE),
(2, 1, 1, 2026, 'internal', TRUE),
(3, 1, 1, 2026, 'internal', TRUE),
(4, 1, 1, 2026, 'internal', TRUE),
(5, 1, 2, 2026, 'internal', TRUE),
(6, 1, 2, 2026, 'internal', TRUE),
(7, 1, 2, 2026, 'internal', TRUE),
(8, 1, 2, 2026, 'internal', TRUE),
(9, 1, 1, 2026, 'internal', TRUE),
(10, 1, 1, 2026, 'internal', TRUE),
(11, 1, 1, 2026, 'internal', TRUE),
(12, 1, 2, 2026, 'internal', TRUE),
(13, 1, 2, 2026, 'internal', TRUE),
(1, 2, 3, 2026, 'internal', TRUE),
(2, 2, 3, 2026, 'internal', TRUE);

-- 6. Seed Prerequisites
INSERT INTO Prerequisite (unit_id, prereq_unit_id, min_grade, is_concurrent_allowed) VALUES
((SELECT unit_id FROM Unit WHERE code = 'ICT167'), (SELECT unit_id FROM Unit WHERE code = 'ICT159'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT162'), (SELECT unit_id FROM Unit WHERE code = 'ICT164'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT202'), (SELECT unit_id FROM Unit WHERE code = 'ICT167'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT203'), (SELECT unit_id FROM Unit WHERE code = 'ICT202'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT284'), (SELECT unit_id FROM Unit WHERE code = 'ICT159'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT285'), (SELECT unit_id FROM Unit WHERE code = 'ICT159'), 'P', FALSE);

-- 7. Seed Students
INSERT INTO Student (student_id, student_number, first_name, last_name, email, course_id, location_id, commencement_year, study_status) VALUES
(1, 'PT3-2026-001', 'Alex', 'Mercer', 'alex.mercer@student.pt3solutions.edu.au', 1, 1, 2026, 'active'),
(2, 'PT3-2026-002', 'Sarah', 'Chen', 's.chen@student.pt3solutions.edu.au', 2, 2, 2026, 'active'),
(3, 'PT3-2025-003', 'David', 'Tan', 'd.tan@student.pt3solutions.edu.au', 1, 1, 2025, 'at-risk'),
(4, 'PT3-2026-004', 'Emily', 'Watson', 'e.watson@student.pt3solutions.edu.au', 3, 3, 2026, 'part-time'),
(5, 'PT3-2024-005', 'Michael', 'Rahardjo', 'm.rahardjo@student.pt3solutions.edu.au', 1, 1, 2024, 'graduating'),
(6, 'PT3-2026-006', 'Jessica', 'Taylor', 'j.taylor@student.pt3solutions.edu.au', 2, 1, 2026, 'active');

-- 8. Seed Student Unit History
INSERT INTO StudentUnitHistory (student_id, unit_id, status, grade, mark, period_id, year_taken) VALUES
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT100'), 'completed', 'D', 78.50, 1, 2026),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT159'), 'completed', 'C', 68.00, 1, 2026),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT169'), 'attempted', 'F', 42.00, 1, 2026),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT164'), 'current', NULL, NULL, 2, 2026),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT111'), 'current', NULL, NULL, 2, 2026),

(3, (SELECT unit_id FROM Unit WHERE code = 'ICT100'), 'completed', 'P', 55.00, 1, 2025),
(3, (SELECT unit_id FROM Unit WHERE code = 'ICT159'), 'completed', 'P', 52.00, 1, 2025),
(3, (SELECT unit_id FROM Unit WHERE code = 'ICT167'), 'attempted', 'F', 38.00, 2, 2025),

(5, (SELECT unit_id FROM Unit WHERE code = 'ICT100'), 'completed', 'HD', 86.00, 1, 2024),
(5, (SELECT unit_id FROM Unit WHERE code = 'ICT159'), 'completed', 'D', 81.00, 1, 2024),
(5, (SELECT unit_id FROM Unit WHERE code = 'ICT167'), 'completed', 'D', 79.00, 2, 2024),
(5, (SELECT unit_id FROM Unit WHERE code = 'ICT202'), 'completed', 'HD', 89.00, 1, 2025);

-- 9. Seed Sample Study Plan
INSERT INTO StudyPlan (plan_id, student_id, title, status, total_credit_points, created_by, recommended_at, agreed_at, approved_at) VALUES
(1, 1, 'PT3-BSIT-01 Standard Study Plan 2026', 'recommended', 24, 'Academic Chair', NOW(), NULL, NULL);

-- 10. Seed Study Plan Units
INSERT INTO StudyPlanUnit (plan_id, unit_id, period_id, year_level, sequence_order, credit_points) VALUES
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT100'), 1, 1, 1, 3),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT159'), 1, 1, 2, 3),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT164'), 1, 1, 3, 3),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT111'), 1, 1, 4, 3),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT169'), 2, 1, 1, 3),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT170'), 2, 1, 2, 3),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT167'), 2, 1, 3, 3),
(1, (SELECT unit_id FROM Unit WHERE code = 'ICT162'), 2, 1, 4, 3);

-- 11. Seed Version History
INSERT INTO StudyPlanVersion (plan_id, version_number, amendment_reason, snapshot_json, created_by) VALUES
(1, 1, 'Initial study plan created for PT3 Solutions BSIT intake', 
'{"plan_id": 1, "student_number": "PT3-2026-001", "total_cp": 24, "status": "recommended"}', 
'Academic Chair');
