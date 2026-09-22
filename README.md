# 🎓 PT3 Solutions User Guide & Study Plan Repository (SPR)

> **ICT302 Outsource Development Final Deliverable & System Handover**  
> **Target Campus**: PT3 Solutions Singapore Campus  
> **Tech Stack**: React 18 (Vite) + Node.js (Express REST API) + MySQL 8.0 / PostgreSQL 15 + Docker  

---

## 📌 Executive Summary

The **Study Plan Repository (SPR)** is an executive web application designed for **PT3 Solutions Academic Chairs** and **Students** to construct, validate, recommend, digitally sign, approve, and archive multi-year university study plans.

### Core Business Rules Enforced
- **BR-01 (Unit Offering Validation)**: Verifies whether proposed units are officially offered at the selected campus (Singapore Campus) and teaching period (e.g. Capstone `ICT302` restricted from Tri-Semester 3).
- **BR-02 (Prerequisite Validation)**: Ensures students have satisfied prerequisite units with passing grades (`P`, `C`, `D`, `HD`) before enrolling in advanced units.
- **Credit Point Load Control**: Enforces maximum **12 Credit Points per teaching period** limit with dynamic meter bars and warning banners.

---

## 🎓 Official Degree Majors & Course Codes

According to the Section 8 curriculum specification, the system supports 3 official degree majors under the Bachelor of Information Technology degree program:

1. **`PT3-BSIT-AI01`**: Bachelor of Information Technology (Major: Artificial Intelligence)
2. **`PT3-BSIT-CS02`**: Bachelor of Information Technology (Major: Computer Science)
3. **`PT3-BSIT-BIS03`**: Bachelor of Information Technology (Major: Business Information Systems)

---

## 🚀 Quick Start & Installation

### Option 1: One-Command Docker Launch (Recommended)
Make sure Docker Desktop is installed and running, then execute:
```bash
docker-compose up -d --build
```
Access the application at: **`http://localhost:3000`** (Backend API at `http://localhost:5000`).

### Option 2: Local Development Setup

#### 1. Backend Server
```bash
cd backend
npm install
cp ../.env.example .env
npm run dev
```

#### 2. Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 📁 Environment Configuration Template (`.env.example`)

```env
# Application Server Port
PORT=5000
NODE_ENV=production

# Database Connection (MySQL 8.0 / PostgreSQL 15)
DB_HOST=localhost
DB_PORT=3306
DB_USER=spr_user
DB_PASSWORD=your_secure_password_here
DB_NAME=spr_db

# Frontend Client Origin (CORS Configuration)
CLIENT_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

---

## 🏗️ Architecture & System Structure

```
+-----------------------------------------------------------------------+
|                             USER INTERFACE                            |
|             React 18 + Vite + TailwindCSS + @dnd-kit                  |
|   Navbar | PlanBuilder | AcademicHistory | StoredPlans | GuideModal   |
+-----------------------------------------------------------------------+
                                   |
                                REST API
                                   |
+-----------------------------------------------------------------------+
|                            BACKEND SERVICES                           |
|                       Node.js + Express.js API                        |
|  /api/students | /api/units | /api/periods | /api/validate | /api/plans |
+-----------------------------------------------------------------------+
                                   |
                                SQL DB
                                   |
+-----------------------------------------------------------------------+
|                           DATABASE LAYER                              |
|                    MySQL 8.0 / PostgreSQL 15                          |
|        11 Core Entities (Student, Course, Unit, StudyPlan, etc.)       |
+-----------------------------------------------------------------------+
```

---

## 🗄️ Relational Database Model (11 Core Entities)

The system implements **exactly 11 core database tables** matching Section 5 Data Model requirements:

| # | Database Entity | Description & Purpose | Primary Key & Attributes |
|---|---|---|---|
| **1** | **`Student`** | Student profile records, student number (e.g. `PT3-2026-001`), course_id, and campus location. | `student_id (PK)`, `student_number`, `first_name`, `last_name`, `email`, `course_id (FK)`, `location_id (FK)` |
| **2** | **`Course`** | Official degree programs and majors (AI, CS, BIS) with 72 credit point target. | `course_id (PK)`, `code`, `name`, `degree_level`, `total_credit_points` |
| **3** | **`Unit`** | Course catalog of academic units, titles, credit points (3 CP), and level details. | `unit_id (PK)`, `code`, `title`, `credit_points`, `level` |
| **4** | **`UnitOffering`** | Campus location, year version, and teaching period availability (Semester vs Trimester). | `offering_id (PK)`, `unit_id (FK)`, `location_id (FK)`, `period_id (FK)`, `year_version` |
| **5** | **`Prerequisite`** | Subject prerequisite rules enforced by the validation engine (BR-02). | `prereq_id (PK)`, `unit_id (FK)`, `prereq_unit_id (FK)`, `min_grade` |
| **6** | **`StudentUnitHistory`** | Student academic history, completed subjects, grades, marks, and current enrollments. | `history_id (PK)`, `student_id (FK)`, `unit_id (FK)`, `status`, `grade`, `mark` |
| **7** | **`StudyPlan`** | Active multi-year study plans and approval workflow status (`Draft`, `Recommended`, `Agreed`, `Approved`). | `plan_id (PK)`, `student_id (FK)`, `title`, `status`, `total_credit_points`, `created_by` |
| **8** | **`StudyPlanUnit`** | Scheduled subjects mapped to specific study years (Year 1..3) and teaching periods. | `plan_unit_id (PK)`, `plan_id (FK)`, `unit_id (FK)`, `period_id (FK)`, `year_level` |
| **9** | **`StudyPlanVersion`** | NFR-07 Audit Trail recording version history whenever a plan status changes. | `version_id (PK)`, `plan_id (FK)`, `version_number`, `plan_status`, `amendment_reason` |
| **10** | **`TeachingPeriod`** | Academic study terms (Semester 1 & 2, Trimester 1, 2 & 3, Winter, Summer). | `period_id (PK)`, `code`, `name`, `period_type`, `sequence_order` |
| **11** | **`Location`** | Campus locations (Singapore, Perth, Dubai, Online). | `location_id (PK)`, `code`, `name` |

### Mermaid ERD Diagram (11 Tables)
```mermaid
erDiagram
    COURSE ||--o{ STUDENT : "enrolls"
    LOCATION ||--o{ STUDENT : "assigned_to"
    STUDENT ||--o{ STUDY_PLAN : "owns"
    STUDENT ||--o{ STUDENT_UNIT_HISTORY : "has"
    STUDY_PLAN ||--o{ STUDY_PLAN_UNIT : "contains"
    STUDY_PLAN ||--o{ STUDY_PLAN_VERSION : "tracks"
    UNIT ||--o{ STUDY_PLAN_UNIT : "scheduled_in"
    UNIT ||--o{ UNIT_OFFERING : "offered_as"
    UNIT ||--o{ PREREQUISITE : "requires"
    LOCATION ||--o{ UNIT_OFFERING : "located_at"
    TEACHING_PERIOD ||--o{ UNIT_OFFERING : "offered_in"
    TEACHING_PERIOD ||--o{ STUDY_PLAN_UNIT : "occurs_in"
```

### SQL Migrations & Schema Files
- **Database Schema**: [`database/schema.sql`](file:///d:/ProjectDesmondandTeam/database/schema.sql)
- **Seed Data**: [`database/seed.sql`](file:///d:/ProjectDesmondandTeam/database/seed.sql)

---

## 📊 Pre-Loaded Premade Test Accounts (5 Accounts)

The system comes pre-seeded with 5 accounts for testing and demonstration:

| Account Type | Account ID | User / Student Name | Course & Major | Category / Scope | Location |
|---|---|---|---|---|---|
| **1 x Administrator** | `ADMIN-CHAIR-01` | **Dr. Aris Thorne** | Academic Chair & Administrator | System Admin & Governance | Singapore Campus |
| **2 x Existing Student** | `PT3-2026-001` | **Alex Mercer** | PT3-BSIT-AI01 (Artificial Intelligence) | Existing Student (Active Plan & History) | Singapore Campus |
| **2 x Existing Student** | `PT3-2026-002` | **Sarah Jenkins** | PT3-BSIT-CS02 (Computer Science) | Existing Student (Agreed Plan & History) | Singapore Campus |
| **2 x New Student** | `PT3-2026-003` | **Michael Chang** | PT3-BSIT-BIS03 (Business Info Systems) | New Student (Fresh Enrolment) | Singapore Campus |
| **2 x New Student** | `PT3-2026-004` | **Emily Watson** | PT3-BSIT-AI04 (Artificial Intelligence) | New Student (Fresh Enrolment) | Singapore Campus |

### 🇸🇬 Singapore Campus Scope & Trimester-Only Focus
- **Trimester Focus**: Singapore enrolment operates strictly on **Trimesters (T1, T2, T3)**. Trimester layout is the default and fully active operational view.
- **Semester Layout**: Preserved as an inactive layout option in the UI for future scalability (Perth Main Campus compatibility).
- **Specializations**: Subjects and offerings are strictly mapped to 3 IT majors: **Artificial Intelligence**, **Computer Science**, and **Business Information Systems**.

---

## 🧪 Requirements Verification & Test Matrix

| Test Case | Description | Requirement | Expected Result | Pass/Fail |
|---|---|---|---|---|
| **TC-01** | Drag capstone `ICT302` into Trimester 3 | BR-01 Offering | Warning banner: Unit not offered in T3 | **PASS** |
| **TC-02** | Add `ICT283` without completing `ICT167` | BR-02 Prerequisite | Warning banner: Prerequisite ICT167 unmet | **PASS** |
| **TC-03** | Schedule 5 units (15 CP) in single period | Max 12 CP Limit | Alert banner: Exceeds 12 CP limit | **PASS** |
| **TC-04** | Switch between Semester & Trimester mode | FR-05 Period Switch | Canvas updates grid layout smoothly | **PASS** |
| **TC-05** | Student Digital Sign-Off | FR-10 Sign-Off | Plan status updates to `STUDENT AGREED` | **PASS** |
| **TC-06** | Export Official Study Plan Document | FR-15 Document Export | Clean formatted document modal opens | **PASS** |
| **TC-07** | Parse binary Excel (.xlsx) / CSV file | FR-12 Data Import | Parses rows without binary corruption | **PASS** |
| **TC-08** | NFR-07 Audit Trail Logging | NFR-07 Audit | Version record saved in StudyPlanVersion | **PASS** |

---

## 🚢 Deployment & Server Handover

1. **Clone Codebase**:
   ```bash
   git clone https://github.com/jasonistioso-1/ProjectStudyPlanDesmond.git
   cd ProjectStudyPlanDesmond
   ```
2. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
3. **Deploy Docker Containers**:
   ```bash
   docker-compose up -d --build
   ```
4. **Verify Application Status**: Open `http://localhost:3000` to confirm live application availability.
