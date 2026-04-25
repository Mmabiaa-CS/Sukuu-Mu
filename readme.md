## Sukuu-Mu — School Management System

Sukuu-Mu is a **school management system** that helps schools manage **students, classes, subjects, teachers, attendance, and finances (fees & payments)**. The product is being built in phases, starting with a solid admin foundation and expanding into attendance and finance workflows.

### What’s in this repository

- **`client/`**: Next.js (App Router) frontend application
- **`docs/`**: Product + engineering documentation (start here)

### Current feature scope (high level)

- **Phase 1 (Foundation)**:
  - Authentication (currently mock/local demo)
  - Role-based access control (Admin, Manager, Teacher, Student)
  - Student, Class, Subject, Teacher management (CRUD)
  - Assignments (planned/partially represented in types)
- **Phase 2 (Attendance)**:
  - Attendance tracking pages and basic flows (currently implemented with mock data)
- **Phase 3 (Finance System)**:
  - Fees, payments, receipts (currently implemented with mock data)

### Frontend routes (implemented)

- **Public**
  - `GET /` → redirects to `/dashboard` or `/login`
  - `GET /login`
- **Protected**
  - `GET /dashboard`
  - `GET /dashboard/students` (+ `GET /dashboard/students/[id]`)
  - `GET /dashboard/classes`
  - `GET /dashboard/subjects`
  - `GET /dashboard/teachers`
  - `GET /dashboard/attendance`
  - `GET /dashboard/finances`

### Quick start (frontend)

Prereqs:
- Node.js (recommended: latest LTS)
- pnpm (recommended, because `client/pnpm-lock.yaml` is present)

Run the app:

```bash
cd client
pnpm install
pnpm dev
```

Then open the dev server URL shown in your terminal.

### Demo credentials (current mock auth)

The current frontend uses **mock users** stored in the codebase and persists the session in `localStorage`.

- **Admin**: `admin@school.com` / `admin123`
- **Manager**: `manager@school.com` / `manager123`
- **Teacher**: `teacher@school.com` / `teacher123`

### Documentation

- **Docs home**: `docs/README.md`
- **Frontend documentation**: `docs/frontend/overview.md`
- **Product roadmap**: `docs/product/roadmap.md`

### License

See `License.md`.
