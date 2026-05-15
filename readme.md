## Sukuu-Mu — School Management System

Sukuu-Mu is a **school management system** for managing **students, classes, subjects, teachers, attendance, and finances (fees & payments)**. The product is delivered in phases: a strong admin foundation first, then attendance and finance workflows.

This repository is a **small monorepo**: a **Next.js** web app and an **Express** REST API, plus shared documentation.

---

### What’s in this repository

| Path | Description |
|------|-------------|
| **`apps/client/`** | Next.js (App Router) frontend — dashboard, auth UI, mock-backed feature hooks today |
| **`apps/server/`** | Express REST API — MySQL, JWT auth, modular routes under `/api/v1` |
| **`docs/`** | Product and engineering documentation (start at `docs/README.md`) |
| **`contribution.md`** | Contributing guidelines |
| **`License.md`** | License text |

---

### Repository layout (high level)

```
Sukuu-Mu/
├── apps/
│   ├── client/                 # Next.js frontend
│   │   ├── app/                # App Router: pages, layouts, `/dashboard/*`
│   │   ├── components/         # Feature + shared UI (incl. `components/ui/`)
│   │   ├── lib/                # Auth, permissions, types, mock data, feature hooks
│   │   ├── hooks/              # Shared React hooks
│   │   ├── styles/             # Global styles
│   │   └── public/             # Static assets, PWA icons
│   │
│   └── server/                 # Express API
│       ├── server.js           # Entry: dotenv, DB connect, listen
│       ├── package.json
│       └── src/
│           ├── app.js          # Express app, middleware, route mounts
│           ├── config/         # e.g. database config
│           ├── database/       # MySQL pool + connect helper
│           ├── middleware/     # auth, validation, errors, logging
│           ├── modules/        # Domain modules (auth, students, classes, …)
│           │   └── <name>/
│           │       ├── *.routes.js
│           │       ├── *.controller.js
│           │       ├── *.service.js
│           │       └── *.repository.js
│           └── utils/          # JWT, hashing helpers
│
├── docs/                       # Product, frontend, architecture, releases
├── contribution.md
├── License.md
└── README.md
```

Server-only details (environment variables, route list, contributor notes): **`apps/server/README.md`**.

---

### Current implementation note (frontend vs backend)

- **Frontend** (`apps/client`): authentication and most domain data are still **mock / local state** (see `apps/client/lib/auth-context.tsx` and feature hooks under `apps/client/lib/`). This lets the UI ship while the API matures.
- **Backend** (`apps/server`): **production-style** REST API with **MySQL**, **JWT**, and **role-based routes** for students, classes, teachers, subjects, fees, parents, and auth. **Attendance** is modeled in the client types/hooks but **not** yet exposed as a dedicated API module on the server.

Integration direction and RBAC alignment: **`docs/architecture/backend-rbac-and-integration.md`**. Engineering path to production: **`docs/architecture/production-roadmap.md`**.

---

### Current feature scope (high level)

- **Phase 1 (Foundation)**  
  - Authentication (UI + mock session on client; **JWT login/register** on server)  
  - Role-based access (Admin, Manager, Teacher, Student — plus server-side **`user`** on selected class routes)  
  - Student, class, subject, teacher management (CRUD in UI with mocks; **CRUD + search** patterns on server)  
  - Assignments (partially represented in types and server modules)

- **Phase 2 (Attendance)**  
  - Attendance UI and flows on client (**mock**); server endpoints to be added when product locks schema

- **Phase 3 (Finance)**  
  - Fees / payments / receipts in UI (**mock**); **fee structures, ledger, payments** implemented on server — integration pending

---

### Frontend routes (implemented)

- **Public**  
  - `GET /` → redirects to `/dashboard` or `/login`  
  - `GET /login`
- **Protected** (`/dashboard` layout)  
  - `GET /dashboard`  
  - `GET /dashboard/students` and `GET /dashboard/students/[id]`  
  - `GET /dashboard/classes`  
  - `GET /dashboard/subjects`  
  - `GET /dashboard/teachers`  
  - `GET /dashboard/attendance`  
  - `GET /dashboard/finances`  
  - `GET /dashboard/settings`

---

### Quick start — frontend

Prerequisites: **Node.js** (LTS recommended), **pnpm** (recommended; lockfiles live under each app).

```bash
cd apps/client
pnpm install
pnpm dev
```

Open the URL printed in the terminal (default Next.js dev port is shown there).

---

### Quick start — server

Prerequisites: **Node.js ≥ 18**, **MySQL** with a database and schema your deployment expects.

```bash
cd apps/server
pnpm install
```

Create **`apps/server/.env`** (see **`apps/server/README.md`** for variables: `DB_*`, `JWT_SECRET`, `PORT`, etc.).

```bash
pnpm dev
# or: pnpm start
```

API base path: **`/api/v1`** (e.g. `http://localhost:3000/api/v1/auth/login` if `PORT=3000`). Health: **`GET /health`**.

---

### Demo credentials (mock frontend only)

The **client** validates against **mock users** in the repo and persists the session in **`localStorage`** (`school_user`). These do **not** automatically match your MySQL users until login is wired to **`POST /api/v1/auth/login`**.

- **Admin**: `admin@school.com` / `admin123`  
- **Manager**: `manager@school.com` / `manager123`  
- **Teacher**: `teacher@school.com` / `teacher123`

---

### Documentation

- **Docs hub**: `docs/README.md`  
- **Product overview**: `docs/product/overview.md`  
- **Product roadmap**: `docs/product/roadmap.md`  
- **Repo structure (detailed)**: `docs/development/repo-structure.md`  
- **Frontend**: `docs/frontend/overview.md`  
- **RBAC & integration alignment**: `docs/architecture/backend-rbac-and-integration.md`  
- **Production / scale roadmap**: `docs/architecture/production-roadmap.md`  
- **Server env & API**: `apps/server/README.md`

---

### License

See `License.md`.
