# Study Plan Recommender (SPR) - Comprehensive System Diagrams Portfolio
**Author**: Academic Chair & System Architecture Team  
**Institution**: PT3 Solutions Academic Repository  
**Version**: 2.0 (Official Release)  

---

## 19. Entity Relationship Diagram (Crow's Foot Notation)

```mermaid
erDiagram
    COURSES ||--|{ MAJOR_PATHWAYS : "offers"
    COURSES ||--|{ STUDENTS : "enrols"
    MAJOR_PATHWAYS ||--|{ STUDENTS : "specialises"
    STUDENTS ||--|{ STUDY_PLANS : "owns"
    STUDENTS ||--|{ STUDENT_ACADEMIC_HISTORY : "records"
    STUDENTS ||--o| STUDENT_SIGNATURES : "signs"
    STUDENTS ||--|{ AUDIT_LOGS : "triggers"
    
    UNITS ||--o{ UNIT_PREREQUISITES : "requires"
    UNITS ||--o{ UNIT_PREREQUISITES : "is_prereq_for"
    UNITS ||--|{ UNIT_OFFERINGS : "scheduled_in"
    UNITS ||--|{ PLAN_UNITS : "included_in"
    UNITS ||--|{ STUDENT_ACADEMIC_HISTORY : "attempted_in"
    
    STUDY_PLANS ||--|{ PLAN_UNITS : "contains"
    
    COURSES {
        string course_code PK "e.g. PT3-BSIT"
        string course_name "Bachelor of Information Technology"
        int total_credit_points "72 CP"
        int duration_years "3 Years"
    }

    MAJOR_PATHWAYS {
        int pathway_id PK "Auto Increment"
        string course_code FK "e.g. PT3-BSIT"
        string pathway_name "AI / CS / BIS"
        string description "Specialisation Track"
    }

    STUDENTS {
        string student_number PK "ADMIN-CHAIR-01 & 31234561-31234564"
        string role "chair / student"
        string first_name "Dr. Aris / Alex / Sarah / Michael / Emily"
        string last_name "Thorne / Mercer / Jenkins / Chang / Watson"
        string email "academic.chair / student @pt3solutions.edu.sg"
        string course_code FK "PT3-ADMIN / PT3-BSIT (AI, CS, BIS)"
        int pathway_id FK "Administration / AI / CS / BIS Tracks"
        string status "ACTIVE / NEW / ENROLLED"
    }

    UNITS {
        string unit_code PK "e.g. ICT100, ICT158"
        string unit_title "Unit Name"
        int credit_points "3 CP"
        string academic_level "Year 1 / Year 2 / Year 3"
        string pathway_category "Core / AI / CS / BIS / GE"
    }

    UNIT_PREREQUISITES {
        int prereq_id PK "Auto Increment"
        string target_unit_code FK "Target Unit"
        string prereq_unit_code FK "Prerequisite Unit"
        string min_grade "Passing Grade"
    }

    UNIT_OFFERINGS {
        int offering_id PK "Auto Increment"
        string unit_code FK "Unit Code"
        string location_code "Campus Location"
        string period_code "T1, T2, T3, S1, S2"
        int year_version "Academic Year"
    }

    STUDENT_ACADEMIC_HISTORY {
        int history_id PK "Auto Increment"
        string student_number FK "Student Reference (31234561)"
        string unit_code FK "UNIT Attempted"
        string grade "PASSED / FAILED / EXEMPT"
        string status "COMPLETED / ENROLLED"
        string period_code "Term Code"
        int year_completed "Year Attempted"
    }

    STUDY_PLANS {
        int plan_id PK "Auto Increment"
        string student_number FK "Student Reference (31234561)"
        string layout_type "trimester / semester"
        string status "CHAIR_RECOMMENDED / SIGNED_OFF / APPROVED"
        int total_cp "Current Credit Total"
        timestamp created_at "Created Date"
    }

    PLAN_UNITS {
        int plan_unit_id PK "Auto Increment"
        int plan_id FK "Study Plan Reference"
        string unit_code FK "Scheduled Unit"
        int year_level "Year 1 / 2 / 3"
        int period_id "Period Slot (1-3)"
    }

    STUDENT_SIGNATURES {
        int signature_id PK "Auto Increment"
        string student_number FK "Student Reference (31234561)"
        string data_url "base64 PNG Image"
        string verification_hash "SHA256 Hash"
        timestamp signed_at "Timestamp"
    }

    AUDIT_LOGS {
        int log_id PK "Auto Increment"
        string student_number FK "Student Reference (31234561)"
        string actor_role "student / chair"
        string action_type "ADD / REMOVE / MOVE / SIGN / APPROVE"
        string details "Log Details"
        timestamp timestamp "Event Timestamp"
    }
```


---

## 20. Overall SPR Process Flow

```mermaid
flowchart TD
    Start([System Initialization & Student Onboarding]) --> Intake[Import Course Catalog & Student Enrolment Records]
    Intake --> CheckRole{User Role}
    
    CheckRole -->|Academic Chair| ChairStart[Access Academic Chair Governance Portal]
    CheckRole -->|Student| StudentStart[Access Student Degree Plan Portal]
    
    ChairStart --> BuildPreset[Configure Pathway Presets: AI, CS, BIS]
    BuildPreset --> RecommendPlan[Generate Recommended 72 CP Study Plan]
    RecommendPlan --> SaveDraft[Save Plan as Chair Recommended]
    
    StudentStart --> LoadPlan[Load Recommended Study Plan]
    SaveDraft --> LoadPlan
    
    LoadPlan --> ToggleLayout{Toggle Layout View}
    ToggleLayout -->|Trimester| ViewTri[View 3 Terms / Year Grid]
    ToggleLayout -->|Semester| ViewSem[View 2 Semesters / Year Grid]
    
    ViewTri --> ValidateRules[Run Rule Engine: Prereq & Term Offering Check]
    ViewSem --> ValidateRules
    
    ValidateRules --> CheckErrors{Rule Errors Found?}
    CheckErrors -->|Yes| HighlightError[Highlight Prerequisites & Availability Conflict]
    HighlightError --> ChairOverride[Chair Override / Waiver Applied]
    ChairOverride --> ValidateRules
    
    CheckErrors -->|No| SignOff[Student Digital Sign-Off & Verification Hash]
    SignOff --> ChairCertify[Academic Chair Final Certification & Approval]
    ChairCertify --> ExportDoc[Export Certified Plan: PDF / CSV / PNG / JPG]
    ExportDoc --> End([Degree Plan Completed & Archived])
```

---

## 21. New-Student Plan Generation Flow

```mermaid
flowchart TD
    A([Incoming New Student Registration]) --> B[Extract Student Program: IT AI / CS / BIS]
    B --> C[Fetch Degree Core Units: 24 CP]
    C --> D[Fetch Major Specialisation Core Units: 36 CP]
    D --> E[Fetch General Elective Units: 12 CP]
    E --> F[Combine Total 72 CP Course Unit Portfolio]
    F --> G[Sequence Units by Academic Year: Year 1 ➔ Year 2 ➔ Year 3]
    G --> H[Check Unit Prerequisites & Term Availability]
    H --> I[Distribute Units into 3-Year Trimester / Semester Slots]
    I --> J[Generate Baseline Study Plan Preview]
    J --> K([Publish Recommended Study Plan to Student Portal])
```

---

## 22. Existing-Student Plan Revision Flow

```mermaid
flowchart TD
    A([Existing Student Access Plan]) --> B[Fetch Completed Academic History Records]
    B --> C[Identify Passed Units, Failed Units & Exemptions]
    C --> D{Any Failed or Deferred Units?}
    
    D -->|No| E[Retain Standard Study Sequence]
    D -->|Yes| F[Flag Outstanding Prerequisite Units]
    
    F --> G[Find Next Available Teaching Period: T1, T2, T3 or S1, S2]
    G --> H[Shift Subsequent Dependent Units Forward]
    H --> I[Re-evaluate Prerequisite & Co-requisite Validation Engine]
    I --> J{Validation Passed?}
    
    J -->|No| K[Academic Chair Re-routes Schedule / Applies Waiver]
    K --> I
    J -->|Yes| L[Update Revised Study Plan Grid]
    L --> E
    E --> M([Submit Revised Plan for Sign-Off])
```

---

## 23. Study-Plan State-Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> DRAFT : System / Chair Initializes Plan
    
    DRAFT --> CHAIR_RECOMMENDED : Chair Finalizes Unit Placement
    
    CHAIR_RECOMMENDED --> STUDENT_REVIEWING : Student Opens Degree Portal
    
    STUDENT_REVIEWING --> REVISION_REQUESTED : Student Requests Adjustments
    REVISION_REQUESTED --> DRAFT : Chair Modifies Schedule
    
    STUDENT_REVIEWING --> STUDENT_SIGNED_OFF : Student Agrees & Signs Off
    
    STUDENT_SIGNED_OFF --> APPROVED_CERTIFIED : Chair Grants Final Approval & Seal
    
    APPROVED_CERTIFIED --> [*] : Plan Archived & Locked
```

---

## 24. Prerequisite Validation and Waiver Flow

```mermaid
flowchart TD
    A([Unit Dragged or Scheduled into Slot]) --> B[Extract Target Unit Prerequisite Requirements]
    B --> C{Has Prerequisite Units?}
    
    C -->|No| D[Validation Passed: Allow Placement]
    C -->|Yes| E[Scan Prior Completed Terms & Academic History]
    
    E --> F{All Prerequisites Passed in Prior Terms?}
    F -->|Yes| D
    F -->|No| G{Is Concurrent Enrolment Allowed?}
    
    G -->|Yes & Scheduled In Same Term| D
    G -->|No| H[Flag Rule Violation: Missing Prerequisite]
    
    H --> I{Academic Chair Waiver Override Granted?}
    I -->|Yes| J[Apply Chair Waiver Badge: Override Approved]
    J --> D
    I -->|No| K[Block Unit Placement & Show Red Alert Warning]
    K --> L([Placement Rejected])
```

---

## 25. Unit Offering Validation Flow

```mermaid
flowchart TD
    A([Select Teaching Period Slot: e.g. Year 2 - Tri 2]) --> B[Check Layout Mode: Trimester vs Semester]
    
    B -->|Trimester| C[Fetch Unit Trimester Offerings: T1, T2, T3]
    B -->|Semester| D[Fetch Unit Semester Offerings: S1, S2]
    
    C --> E{Unit Offered in Selected Term?}
    D --> E
    
    E -->|Yes| F[Mark Slot Valid: Green Status Indicator]
    E -->|No| G[Mark Slot Invalid: Warning Alert Banner]
    
    G --> H[Suggest Alternative Available Teaching Periods]
    F --> I([Unit Schedule Confirmed])
    H --> I
```

---

## 26. Three-Tier Architecture Diagram

```mermaid
graph TD
    subgraph Tier1["1. Presentation Layer (Client Browser)"]
        UI[React 18 SPA + Vite]
        Tailwind[Vanilla Tailwind CSS Styling]
        DND[Dnd-Kit Drag & Drop Engine]
        DocumentModal[Official Study Plan Preview & Multi-Format Exporter]
    end

    subgraph Tier2["2. Application / Business Logic Layer (Express API)"]
        API[Node.js + Express REST API Server]
        Auth[Role-Based Authorization System]
        RuleEngine[Validation Engine: Prerequisite & Offering Rules]
        ExportEngine[PDF / CSV / PNG / JPG Generation Engine]
    end

    subgraph Tier3["3. Data Access & Storage Layer"]
        MySQL[(MySQL Relational Database)]
        Seed[Seed Data & Schema Repository]
        AuditStorage[Audit Log & Signature Verification Store]
    end

    UI <-->|HTTP / REST JSON APIs| API
    DocumentModal <-->|Export Data Stream| ExportEngine
    API <-->|SQL Queries / Connection Pool| MySQL
    RuleEngine <-->|Verify History & Requirements| MySQL
```

---

## 27. Academic Chair Navigation / Screen Map

```mermaid
graph TD
    ChairPortal[Academic Chair Master Workspace] --> Dashboard[Governance Overview Dashboard]
    
    ChairPortal --> CatalogTab[Course Catalog Management]
    CatalogTab --> MasterDirectory[Master Unit Directory]
    CatalogTab --> MajorTabs[AI / CS / BIS Pathway Tabs]
    CatalogTab --> GeneralElectives[General Electives Tab]
    CatalogTab --> ImportEngine[Universal Dataset Import Engine CSV/Excel]
    CatalogTab --> AddUnitModal[Add / Edit Unit Modal]
    
    ChairPortal --> StudentTab[Student Roster & Degree Plans]
    StudentTab --> StudentSelector[Student Selector & Search Bar]
    StudentTab --> StudentHistory[Academic History & Transcripts]
    
    ChairPortal --> CanvasTab[Study Plan Builder Canvas]
    CanvasTab --> LayoutSwitcher[Trimester / Semester Layout Switcher]
    CanvasTab --> YearNav[Year Slide Navigation: Year 1 / 2 / 3]
    CanvasTab --> PresetBtn[Auto-Fill Major Presets]
    CanvasTab --> ExportBtn[Export Official Document PDF/CSV/PNG/JPG]
    
    ChairPortal --> AuditTab[Audit Log & Change Tracking]
    AuditTab --> RoleFilter[Filter by Student / Chair Actions]
```

---

## 28. Student Navigation / Screen Map

```mermaid
flowchart LR
    %% Subgraph 1: Student View (Restricted Context)
    subgraph S_View["4. Student View (Restricted Context)"]
        direction TB
        S_Context["Student Account Security Context:<br/>Locked to Enrolled Major Track<br/>(Cross-Student Switching Blocked)"]
        S_Nav["Filtered Navigation Bar"]
        S_Header["Dynamic Header Profile:<br/>Name, Student ID, Major & Status"]
        S_Notif["Student Notifications & Chair Updates"]
        S_LayoutActions["Layout Actions:<br/>Chair Session & Bypass"]
        S_SingleClass["Single Permanent Class Demonstration"]

        S_Nav --> S_Header
        S_Nav --> S_Notif
        S_Nav --> S_LayoutActions
        S_Nav --> S_SingleClass
        S_Context --> S_Nav
    end

    %% Subgraph 2: Multi-User Authentication Flow
    subgraph S_Auth["1. Multi-User Authentication"]
        direction TB
        A_SSO["PT3 Solutions<br/>SSO Login Portal"]
        A_Creds["Input Student Credentials:<br/>• <b>Alex Mercer</b> (31234561 / alex123) [AI]<br/>• <b>Sarah Jenkins</b> (31234562 / sarah123) [CS]<br/>• <b>Michael Chang</b> (31234563 / michael123) [BIS]<br/>• <b>Emily Watson</b> (31234564 / emily123) [AI]"]
        A_Valid["Access Public Session<br/>Validation"]
        A_Portal["Student Study Plan Portal<br/>(Restricted to Authenticated Student)"]

        A_SSO --> A_Creds
        A_Creds --> A_Valid
        A_Valid --> A_Portal
    end

    %% Subgraph 3: Interactive Study Plan Canvas
    subgraph S_Canvas["2. Interactive Study Plan Canvas"]
        direction TB
        C_Palette["Course Unit Palette"]
        C_Filter["Unit Search &<br/>Category Filter"]
        C_Drag["Draggable Unit Cards"]
        C_Switcher{"Layout Switcher"}
        C_TriGrid["3 Terms / 1 Year<br/>Canvas Grid (Trimester)"]
        C_SemGrid["2 Semesters / 1 Year<br/>Canvas Grid (Semester)"]

        C_Palette --> C_Filter
        C_Palette --> C_Drag
        C_Drag --> C_TriGrid
        C_Drag --> C_SemGrid
        C_Switcher -->|Trimester| C_TriGrid
        C_Switcher -->|Semester| C_SemGrid
    end

    %% Subgraph 4: Student Action Bar & Document Export
    subgraph S_Actions["3. Student Action Bar & Document Export"]
        direction TB
        ACT_Toolbar["Student Action Toolbar"]
        ACT_NewReq["Submit Plan Request to Chair<br/>(New Students: Michael / Emily)"]
        ACT_Signature["Digital Signature Pad:<br/>Agree, Sign & Generate Hash<br/>(Existing Students: Alex / Sarah)"]
        ACT_Export["Export Document & Preview Modal"]
        ACT_Revise["Submit Revised Plan to Chair:<br/>View Audit Log / Academic History"]
        
        ACT_Format{"Format Selector"}
        EXP_PDF["Official Accreditation Print (PDF)"]
        EXP_CSV["CSV Spreadsheet Export Data"]
        EXP_IMG["High-Res Degree Map (PNG / JPG)"]

        ACT_Toolbar --> ACT_NewReq
        ACT_Toolbar --> ACT_Signature
        ACT_Toolbar --> ACT_Export
        ACT_Toolbar --> ACT_Revise
        ACT_Export --> ACT_Format
        ACT_Format -->|PDF| EXP_PDF
        ACT_Format -->|CSV| EXP_CSV
        ACT_Format -->|PNG / JPG| EXP_IMG
    end

    %% Inter-subgraph Transitions
    A_Portal --> S_Context
    A_Portal --> C_Palette
    A_Portal --> C_Switcher
    S_LayoutActions --> C_Switcher

    C_TriGrid --> ACT_Toolbar
    C_SemGrid --> ACT_Toolbar

    %% Aesthetic Class Definitions
    classDef navStyle fill:#0a192f,stroke:#38bdf8,stroke-width:1.5px,color:#ffffff;
    classDef authStyle fill:#1e1b4b,stroke:#c026d3,stroke-width:2px,color:#ffffff;
    classDef canvasStyle fill:#0f172a,stroke:#38bdf8,stroke-width:1.5px,color:#ffffff;
    classDef switchStyle fill:#0369a1,stroke:#38bdf8,stroke-width:2px,color:#ffffff;
    classDef actionStyle fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ffffff;
    classDef formatStyle fill:#065f46,stroke:#34d399,stroke-width:2px,color:#ffffff;
    classDef exportStyle fill:#1f2937,stroke:#64748b,stroke-width:1.5px,color:#ffffff;

    class S_Context,S_Nav,S_Header,S_Notif,S_LayoutActions,S_SingleClass navStyle;
    class A_SSO,A_Creds,A_Valid,A_Portal authStyle;
    class C_Palette,C_Filter,C_Drag,C_TriGrid,C_SemGrid canvasStyle;
    class C_Switcher switchStyle;
    class ACT_Toolbar,ACT_NewReq,ACT_Signature,ACT_Export,ACT_Revise actionStyle;
    class ACT_Format formatStyle;
    class EXP_PDF,EXP_CSV,EXP_IMG exportStyle;

    style S_View fill:#f0fdfa,stroke:#0d9488,stroke-width:2px;
    style S_Auth fill:#fdf4ff,stroke:#d946ef,stroke-width:2px;
    style S_Canvas fill:#fff7ed,stroke:#f97316,stroke-width:2px;
    style S_Actions fill:#f0fdf4,stroke:#06b6d4,stroke-width:2px;
```

---

## 29. Sequence Diagram for Recommend ➔ Student Review ➔ Final Approval

```mermaid
sequenceDiagram
    autonumber
    actor Chair as Academic Chair
    participant Frontend as React Single Page App
    participant Backend as Express REST API
    participant DB as MySQL Database
    actor Student as Student

    %% Step 1: Chair Generates & Recommends Plan
    Chair->>Frontend: Select Student & Click "Auto-Fill Preset Plan"
    Frontend->>Backend: POST /api/plans/recommend (student_id, pathway_id)
    Backend->>DB: Fetch Course Requirements & Prerequisites
    DB-->>Backend: Return Unit Catalog Data
    Backend->>Backend: Execute Placement & Offering Rule Engine
    Backend->>DB: INSERT INTO study_plans & plan_units (status: 'CHAIR_RECOMMENDED')
    DB-->>Backend: Plan Created Confirmation
    Backend-->>Frontend: 200 OK (Return Recommended Study Plan Payload)
    Frontend-->>Chair: Display Recommended Plan on Canvas

    %% Step 2: Student Reviews & Signs Off
    Student->>Frontend: Access Portal (Role: Student)
    Frontend->>Backend: GET /api/plans/student/:student_number
    Backend->>DB: SELECT * FROM study_plans WHERE student_number = ?
    DB-->>Backend: Return Plan & Unit Placement Data
    Backend-->>Frontend: 200 OK (Render Student Plan)
    Student->>Frontend: Review Plan & Click "Agree & Sign-Off Study Plan"
    Frontend->>Backend: POST /api/plans/sign-off (plan_id, signature_hash, data_url)
    Backend->>DB: UPDATE study_plans SET status = 'STUDENT_SIGNED_OFF'
    Backend->>DB: INSERT INTO student_signatures & audit_logs
    DB-->>Backend: Signature Verified
    Backend-->>Frontend: 200 OK (Signed-Off Status Update)

    %% Step 3: Academic Chair Final Approval & Export
    Chair->>Frontend: Open Student Plan & Verify Sign-Off
    Chair->>Frontend: Click "Grant Final Certification & Official Approval"
    Frontend->>Backend: POST /api/plans/approve (plan_id)
    Backend->>DB: UPDATE study_plans SET status = 'APPROVED_CERTIFIED'
    Backend->>DB: Status Updated
    Backend-->>Frontend: 200 OK (Plan Certified)
    Chair->>Frontend: Click "Export Document"
    Frontend->>Frontend: Render Multi-Format Preview Modal (PDF, CSV, PNG, JPG)
    Frontend-->>Chair: Download Certified Official 72 CP Study Plan File
```
