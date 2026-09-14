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

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS + `@dnd-kit/core` & `@dnd-kit/sortable` + `lucide-react` icons.
- **Backend API**: Node.js + Express (ES Modules) + MySQL2 connection pool.
- **Database**: MySQL 8.0 (11 relational tables with foreign keys and sample seed data).
- **Containerization**: Docker Compose orchestrating `spr-db`, `spr-backend`, and `spr-frontend`.

---

## 🚀 Running on Localhost (Standard Ports)

### Method 1: Running via Docker Compose (Recommended)

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

1. **Select Student**: Search student (e.g. `Alex Johnson` or `34001001`) at **PT3 Solutions**.
2. **Review Academic History**: View passed units (green), enrolled units (amber), and failed units (red).
3. **Build Plan**: Drag units from palette into Year 1, 2, 3 semester slots (S1/S2 or T1/T2/T3).
4. **Real-time Validation**: Check `ValidationPanel` for BR-01 (offering mismatch), BR-02 (prerequisite violation), or CP overload (>12 CP).
5. **Recommend Plan**: Switch role to Academic Chair and click **Recommend Plan for Student Review**.
6. **Student Sign**: Switch role to Student and click **Review & Sign Student Agreement**.
7. **Final Approval & Certificate**: Switch role back to Academic Chair and click **Final Approve & Issue Certificate**. Official **Certificate of Entitlement** issued by PT3 Solutions displays with print support.
