-- Study Plan Repository (SPR) - Database Schema
-- Target RDBMS: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS spr_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spr_db;

-- 1. Location Table (Campuses / Offshore / Online)
CREATE TABLE IF NOT EXISTS Location (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TeachingPeriod Table (Semester vs Trimester support)
CREATE TABLE IF NOT EXISTS TeachingPeriod (
    period_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g., S1, S2, T1, T2, T3, Winter, Summer
    name VARCHAR(50) NOT NULL,
    period_type ENUM('semester', 'trimester', 'term', 'winter', 'summer') NOT NULL DEFAULT 'semester',
    sequence_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Course Table (Degree programs)
CREATE TABLE IF NOT EXISTS Course (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g., B1390, B1375, M1220
    name VARCHAR(150) NOT NULL,
    degree_level VARCHAR(50) NOT NULL DEFAULT 'Bachelor',
    total_credit_points INT NOT NULL DEFAULT 72, -- Standard AbcD degree CP
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Unit Table (Individual subject definitions)
CREATE TABLE IF NOT EXISTS Unit (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g., ICT100, ICT159, ICT167, ICT285
    title VARCHAR(150) NOT NULL,
    credit_points INT NOT NULL DEFAULT 3, -- Standard AbcD unit is 3 CP
    level INT NOT NULL DEFAULT 100, -- 100, 200, 300 level
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. UnitOffering Table (Location & Teaching Period availability)
CREATE TABLE IF NOT EXISTS UnitOffering (
    offering_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    location_id INT NOT NULL,
    period_id INT NOT NULL,
    year_version INT NOT NULL DEFAULT 2026,
    delivery_mode ENUM('internal', 'external', 'online') NOT NULL DEFAULT 'internal',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES Location(location_id) ON DELETE RESTRICT,
    FOREIGN KEY (period_id) REFERENCES TeachingPeriod(period_id) ON DELETE RESTRICT,
    UNIQUE KEY uq_unit_offering (unit_id, location_id, period_id, year_version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Prerequisite Table (Unit dependencies)
CREATE TABLE IF NOT EXISTS Prerequisite (
    prereq_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL, -- Target unit requiring the prerequisite
    prereq_unit_id INT NOT NULL, -- The prerequisite unit that must be passed
    min_grade VARCHAR(10) DEFAULT 'P', -- Minimum pass grade required (Pass / 50%)
    is_concurrent_allowed BOOLEAN NOT NULL DEFAULT FALSE, -- Co-requisite flag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE CASCADE,
    FOREIGN KEY (prereq_unit_id) REFERENCES Unit(unit_id) ON DELETE CASCADE,
    UNIQUE KEY uq_unit_prereq (unit_id, prereq_unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Student Table (Student master data)
CREATE TABLE IF NOT EXISTS Student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(20) NOT NULL UNIQUE, -- e.g., 34001234
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    course_id INT NOT NULL,
    location_id INT NOT NULL,
    commencement_year INT NOT NULL DEFAULT 2026,
    study_status ENUM('active', 'inactive', 'graduated', 'suspended') NOT NULL DEFAULT 'active',
    account_category ENUM('admin', 'existing_student', 'new_student') NOT NULL DEFAULT 'existing_student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE RESTRICT,
    FOREIGN KEY (location_id) REFERENCES Location(location_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. StudentUnitHistory Table (Tracks completed, current, and attempted units)
CREATE TABLE IF NOT EXISTS StudentUnitHistory (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    unit_id INT NOT NULL,
    status ENUM('completed', 'current', 'enrolled', 'attempted') NOT NULL, -- completed=passed, current/enrolled=in progress, attempted=failed
    grade VARCHAR(10) NULL, -- e.g., HD, D, C, P, F, N
    mark DECIMAL(5,2) NULL,
    period_id INT NOT NULL,
    year_taken INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE RESTRICT,
    FOREIGN KEY (period_id) REFERENCES TeachingPeriod(period_id) ON DELETE RESTRICT,
    UNIQUE KEY uq_student_unit_taken (student_id, unit_id, year_taken, period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. StudyPlan Table (Main study plan metadata & workflow states)
CREATE TABLE IF NOT EXISTS StudyPlan (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(150) NOT NULL DEFAULT 'Standard Study Plan',
    status ENUM('draft', 'recommended', 'agreed', 'approved') NOT NULL DEFAULT 'draft',
    total_credit_points INT NOT NULL DEFAULT 0,
    created_by VARCHAR(100) NOT NULL DEFAULT 'Academic Chair',
    recommended_at TIMESTAMP NULL,
    agreed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. StudyPlanUnit Table (Units mapped into semesters/trimesters within a plan)
CREATE TABLE IF NOT EXISTS StudyPlanUnit (
    plan_unit_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    unit_id INT NOT NULL,
    period_id INT NOT NULL,
    year_level INT NOT NULL DEFAULT 1, -- Year 1, Year 2, Year 3
    sequence_order INT NOT NULL DEFAULT 1,
    credit_points INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES StudyPlan(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES Unit(unit_id) ON DELETE RESTRICT,
    FOREIGN KEY (period_id) REFERENCES TeachingPeriod(period_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. StudyPlanVersion Table (Plan versioning / amendment audit trail)
CREATE TABLE IF NOT EXISTS StudyPlanVersion (
    version_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    amendment_reason TEXT NULL,
    snapshot_json JSON NULL, -- JSON snapshot of the study plan structure at version time
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES StudyPlan(plan_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
