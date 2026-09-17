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

-- 3. Seed Courses (Bachelor of Information Technology Majors: AI, CS, BIS)
INSERT INTO Course (course_id, code, name, degree_level, total_credit_points) VALUES
(1, 'PT3-BSIT-AI01', 'Bachelor of Information Technology (Major: Artificial Intelligence)', 'Bachelor', 72),
(2, 'PT3-BSIT-CS02', 'Bachelor of Information Technology (Major: Computer Science)', 'Bachelor', 72),
(3, 'PT3-BSIT-BIS03', 'Bachelor of Information Technology (Major: Business Information Systems)', 'Bachelor', 72),
(4, 'PT3-BSIT-AI04', 'Bachelor of Information Technology (Major: Artificial Intelligence)', 'Bachelor', 72);

-- 4. Seed Units (Standard Curriculum Dataset)
INSERT INTO Unit (unit_id, code, title, credit_points, level) VALUES
(1, 'ICT100', 'Transition to IT', 3, 100),
(2, 'ICT158', 'Introduction to Computer Systems', 3, 100),
(3, 'ICT159', 'Foundations of Programming', 3, 100),
(4, 'ICT167', 'Principles of Computer Science', 3, 100),
(5, 'ICT169', 'Foundations of Data Communications', 3, 100),
(6, 'ICT170', 'Foundations of Computer Systems', 3, 100),
(7, 'ICT145', 'Python Programming', 3, 100),
(8, 'ICT201', 'IT Project Management', 3, 200),
(9, 'ICT202', 'Machine Learning', 3, 200),
(10, 'ICT203', 'Artificial Intelligence', 3, 200),
(11, 'ICT206', 'Intelligent Systems', 3, 200),
(12, 'ICT283', 'Data Structures & Algorithms', 3, 200),
(13, 'ICT284', 'Systems Analysis & Design', 3, 200),
(14, 'ICT285', 'Databases', 3, 200),
(15, 'ICT292', 'Information Systems Architecture', 3, 200),
(16, 'BSC203', 'Intro to ICT Research Methods', 3, 200),
(17, 'MAS162', 'Discrete Mathematics', 3, 100),
(18, 'MAS164', 'Fundamentals of Mathematics', 3, 100),
(19, 'MAS183', 'Statistical Data Analysis', 3, 100),
(20, 'ICT301', 'Enterprise Architecture', 3, 300),
(21, 'ICT302', 'IT Professional Practice (Capstone)', 3, 300),
(22, 'ICT303', 'Advanced Machine Learning', 3, 300),
(23, 'ICT304', 'AI System Design', 3, 300),
(24, 'ICT305', 'Data Visualisation', 3, 300),
(25, 'ICT373', 'Software Architecture', 3, 300),
(26, 'ICT374', 'Operating Systems', 3, 300),
(27, 'ICT393', 'Advanced Business Intelligence', 3, 300),
(28, 'ICT394', 'Business Intelligence & Analytics', 3, 300);

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
(10, 1, 1, 2026, 'internal', TRUE);

-- 6. Seed Prerequisites
INSERT INTO Prerequisite (unit_id, prereq_unit_id, min_grade, is_concurrent_allowed) VALUES
((SELECT unit_id FROM Unit WHERE code = 'ICT167'), (SELECT unit_id FROM Unit WHERE code = 'ICT159'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT201'), (SELECT unit_id FROM Unit WHERE code = 'ICT158'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT202'), (SELECT unit_id FROM Unit WHERE code = 'ICT159'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT203'), (SELECT unit_id FROM Unit WHERE code = 'ICT167'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT206'), (SELECT unit_id FROM Unit WHERE code = 'ICT167'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT283'), (SELECT unit_id FROM Unit WHERE code = 'ICT167'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT284'), (SELECT unit_id FROM Unit WHERE code = 'ICT158'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT285'), (SELECT unit_id FROM Unit WHERE code = 'ICT159'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT292'), (SELECT unit_id FROM Unit WHERE code = 'ICT158'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'BSC203'), (SELECT unit_id FROM Unit WHERE code = 'ICT158'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT301'), (SELECT unit_id FROM Unit WHERE code = 'ICT292'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT302'), (SELECT unit_id FROM Unit WHERE code = 'ICT201'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT303'), (SELECT unit_id FROM Unit WHERE code = 'ICT202'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT304'), (SELECT unit_id FROM Unit WHERE code = 'ICT203'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT305'), (SELECT unit_id FROM Unit WHERE code = 'ICT202'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT373'), (SELECT unit_id FROM Unit WHERE code = 'ICT283'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT374'), (SELECT unit_id FROM Unit WHERE code = 'ICT283'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT393'), (SELECT unit_id FROM Unit WHERE code = 'ICT284'), 'P', FALSE),
((SELECT unit_id FROM Unit WHERE code = 'ICT394'), (SELECT unit_id FROM Unit WHERE code = 'ICT285'), 'P', FALSE);

-- 7. Seed Students (6 Students across 6 Distinct Majors)
INSERT INTO Student (student_id, student_number, first_name, last_name, email, course_id, location_id, commencement_year, study_status) VALUES
(1, 'PT3-2026-001', 'Alex', 'Mercer', 'alex.mercer@student.pt3solutions.edu.sg', 1, 2, 2026, 'active'),
(2, 'PT3-2026-002', 'Sarah', 'Jenkins', 'sarah.jenkins@student.pt3solutions.edu.sg', 2, 2, 2026, 'active'),
(3, 'PT3-2026-003', 'Michael', 'Chang', 'm.chang@student.pt3solutions.edu.sg', 3, 2, 2026, 'active'),
(4, 'PT3-2026-004', 'Emily', 'Watson', 'e.watson@student.pt3solutions.edu.sg', 4, 2, 2026, 'part-time');

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

-- 9. Seed Sample Study Plans (Distinct per Student)
INSERT INTO StudyPlan (plan_id, student_id, title, status, total_credit_points, created_by, recommended_at, agreed_at, approved_at) VALUES
(1, 1, 'PT3-BSIT Artificial Intelligence Plan 2026', 'approved', 72, 'Academic Chair', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY, NOW()),
(2, 2, 'PT3-BSIT Computer Science Plan 2026', 'agreed', 72, 'Academic Chair', NOW() - INTERVAL 1 DAY, NOW(), NULL),
(3, 3, 'PT3-BSIT Business Info Systems Plan 2026', 'recommended', 69, 'Academic Chair', NOW(), NULL, NULL),
(4, 4, 'PT3-BSIT Artificial Intelligence Plan 2026', 'draft', 72, 'Academic Chair', NULL, NULL, NULL);

-- 10. Seed Study Plan Units (Plan 1 - Alex Mercer - AI Major - 72 CP)
INSERT INTO StudyPlanUnit (plan_id, unit_id, period_id, year_level, sequence_order, credit_points) VALUES
(1, 1, 1, 1, 1, 3), (1, 3, 1, 1, 2, 3), (1, 17, 1, 1, 3, 3), (1, 2, 1, 1, 4, 3),
(1, 5, 2, 1, 1, 3), (1, 6, 2, 1, 2, 3), (1, 4, 2, 1, 3, 3), (1, 7, 2, 1, 4, 3),
(1, 8, 1, 2, 1, 3), (1, 9, 1, 2, 2, 3), (1, 10, 1, 2, 3, 3), (1, 14, 1, 2, 4, 3),
(1, 11, 2, 2, 1, 3), (1, 16, 2, 2, 2, 3), (1, 12, 2, 2, 3, 3), (1, 13, 2, 2, 4, 3),
(1, 21, 1, 3, 1, 3), (1, 22, 1, 3, 2, 3), (1, 23, 1, 3, 3, 3), (1, 24, 1, 3, 4, 3),
(1, 20, 2, 3, 1, 3), (1, 25, 2, 3, 2, 3), (1, 26, 2, 3, 3, 3), (1, 15, 2, 3, 4, 3);

-- Plan 2 - Sarah Jenkins - CS Major - 72 CP
INSERT INTO StudyPlanUnit (plan_id, unit_id, period_id, year_level, sequence_order, credit_points) VALUES
(2, 1, 1, 1, 1, 3), (2, 3, 1, 1, 2, 3), (2, 17, 1, 1, 3, 3), (2, 2, 1, 1, 4, 3),
(2, 4, 2, 1, 1, 3), (2, 6, 2, 1, 2, 3), (2, 18, 2, 1, 3, 3), (2, 7, 2, 1, 4, 3),
(2, 12, 1, 2, 1, 3), (2, 13, 1, 2, 2, 3), (2, 14, 1, 2, 3, 3), (2, 8, 1, 2, 4, 3),
(2, 26, 2, 2, 1, 3), (2, 16, 2, 2, 2, 3), (2, 19, 2, 2, 3, 3), (2, 15, 2, 2, 4, 3),
(2, 25, 1, 3, 1, 3), (2, 21, 1, 3, 2, 3), (2, 20, 1, 3, 3, 3), (2, 10, 1, 3, 4, 3),
(2, 24, 2, 3, 1, 3), (2, 11, 2, 3, 2, 3), (2, 23, 2, 3, 3, 3), (2, 28, 2, 3, 4, 3);

-- Plan 3 - Michael Chang - BIS Major - 69 CP
INSERT INTO StudyPlanUnit (plan_id, unit_id, period_id, year_level, sequence_order, credit_points) VALUES
(3, 1, 1, 1, 1, 3), (3, 3, 1, 1, 2, 3), (3, 17, 1, 1, 3, 3), (3, 2, 1, 1, 4, 3),
(3, 5, 2, 1, 1, 3), (3, 6, 2, 1, 2, 3), (3, 13, 2, 1, 3, 3), (3, 7, 2, 1, 4, 3),
(3, 8, 1, 2, 1, 3), (3, 14, 1, 2, 2, 3), (3, 15, 1, 2, 3, 3), (3, 19, 1, 2, 4, 3),
(3, 16, 2, 2, 1, 3), (3, 28, 2, 2, 2, 3), (3, 12, 2, 2, 3, 3), (3, 4, 2, 2, 4, 3),
(3, 20, 1, 3, 1, 3), (3, 21, 1, 3, 2, 3), (3, 27, 1, 3, 3, 3), (3, 24, 1, 3, 4, 3),
(3, 25, 2, 3, 1, 3), (3, 9, 2, 3, 2, 3), (3, 23, 2, 3, 3, 3);

-- Plan 4 - Emily Watson - AI Major Part-Time - 72 CP
INSERT INTO StudyPlanUnit (plan_id, unit_id, period_id, year_level, sequence_order, credit_points) VALUES
(4, 1, 1, 1, 1, 3), (4, 3, 1, 1, 2, 3), (4, 17, 1, 1, 3, 3), (4, 2, 1, 1, 4, 3),
(4, 5, 2, 1, 1, 3), (4, 6, 2, 1, 2, 3), (4, 4, 2, 1, 3, 3), (4, 7, 2, 1, 4, 3),
(4, 8, 1, 2, 1, 3), (4, 9, 1, 2, 2, 3), (4, 10, 1, 2, 3, 3), (4, 14, 1, 2, 4, 3),
(4, 11, 2, 2, 1, 3), (4, 16, 2, 2, 2, 3), (4, 12, 2, 2, 3, 3), (4, 13, 2, 2, 4, 3),
(4, 21, 1, 3, 1, 3), (4, 22, 1, 3, 2, 3), (4, 23, 1, 3, 3, 3), (4, 24, 1, 3, 4, 3),
(4, 20, 2, 3, 1, 3), (4, 25, 2, 3, 2, 3), (4, 26, 2, 3, 3, 3), (4, 15, 2, 3, 4, 3);

-- 11. Seed Version History
INSERT INTO StudyPlanVersion (plan_id, version_number, amendment_reason, snapshot_json, created_by) VALUES
(1, 5, 'Study Plan officially APPROVED & finalized by Academic Chair', '{"plan_id": 1, "student_number": "PT3-2026-001", "total_cp": 72, "status": "approved"}', 'Academic Chair'),
(2, 4, 'Student agreed and digitally signed proposed study plan (72 CP)', '{"plan_id": 2, "student_number": "PT3-2026-002", "total_cp": 72, "status": "agreed"}', 'Student: Sarah Jenkins'),
(3, 3, 'Study plan marked as RECOMMENDED to student for review', '{"plan_id": 3, "student_number": "PT3-2026-003", "total_cp": 69, "status": "recommended"}', 'Academic Chair'),
(4, 1, 'Initial study plan creation and unit placement', '{"plan_id": 4, "student_number": "PT3-2026-004", "total_cp": 72, "status": "draft"}', 'Academic Chair');
