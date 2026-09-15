# Study Plan Repository (SPR) — PT3 Solutions

> **ICT302 - PT03 Development Handover Specification**  
> Full-stack application for **PT3 Solutions** designed for Academic Chairs and Students to create, validate, recommend, digitally sign, store, and retrieve student study plans while enforcing unit offering rules, prerequisite dependencies, and credit point limits.

---

## 📋 Table of Contents
1. [Architecture & Tech Stack](#-architecture--tech-stack)
2. [Project Directory Structure](#-project-directory-structure)
3. [Running on Localhost](#-running-on-localhost)
4. [User Workflow & Governance Guide](#-user-workflow--governance-guide)
5. [Business Rules & Validation Engine](#-business-rules--validation-engine)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Acceptance Test Matrix](#-acceptance-test-matrix)
8. [Change Log & Approval Log](#-change-log--approval-log)

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS + `@dnd-kit/core` & `@dnd-kit/sortable` + `lucide-react` icons.
- **Backend API**: Node.js + Express (ES Modules) + MySQL2 connection pool.
- **Database**: MySQL 8.0 (11 relational tables with foreign keys and sample seed data).
- **Containerization**: Docker Compose orchestrating `spr-db`, `spr-backend`, and `spr-frontend`.

---

## 🚀 Running on Localhost (Standard Ports)

### Running via Docker Compose (Recommended)

1. Open project directory:
   ```bash
   cd d:/ProjectDesmondandTeam
   ```
2. Build and start containers:
   ```bash
   docker-compose up --build -d
   ```
3. Open browser:
   - 🌐 **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
   - ⚡ **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
   - 🗄️ **MySQL Database**: `localhost:3306` (`spr_db`)

---

## 👥 User Workflow & Governance Guide

```
[Academic Chair]          [System Validation]           [Student]           [Academic Chair]
Search & Select Student  ──>  Check Prerequisites  ──>  Review & Sign  ──>  Final Approval &
Build/Edit Study Plan         & Unit Offerings        Digital Agreement    Issue Certificate
```

1. **Select Student**: Search student (e.g. `Alex Mercer` or `PT3-2026-001`) at **PT3 Solutions**.
2. **Review Academic History**: View passed units (green), enrolled units (amber), and failed units (red).
3. **Build Plan**: Drag units from palette into Year 1, 2, 3 semester slots (S1/S2 or T1/T2/T3).
4. **Real-time Validation**: Check `ValidationPanel` for BR-01 (offering mismatch), BR-02 (prerequisite violation), or CP overload (>12 CP).
5. **Recommend Plan**: Switch role to Academic Chair and click **Step 5: Recommend Plan**.
6. **Student Sign**: Switch role to Student View and click **Step 6: Sign & Agree to Study Plan**.
7. **Final Approval & Certificate**: Switch role back to Academic Chair and click **Step 7: Approve & Finalise**.
8. **Stored Plan Repository**: Plan saved to database and retrieved in **Stored Plans Repository (FR-16, FR-17)**.

---

## 📜 Change Log & Approval Log (Log Perubahan & Persetujuan)

| Version | Date | Description / Summary of Changes | Author / Stakeholder |
|---|---|---|---|
| **v0.1** | 9 Sep 2026 | Initial outsourced development requirements based on first client meeting with PT03 team. | PT3 Solutions & Peter |
| **v1.0** | 14 Sep 2026 | Full-stack core release: 11 MySQL tables, Express API endpoints, validation engine (BR-01, BR-02), and React drag & drop plan builder. | Development Team |
| **v1.1** | 15 Sep 2026 | **ICT302 Workflow Alignment Release**: Added Step 1 center screen student selector, 8-step workflow progress bar, Stored Plans Repository table (`StoredPlansView.jsx`), PDF export, and version audit trail log. | PT3 Solutions Dev Team |

---
