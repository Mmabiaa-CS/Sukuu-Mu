## Frontend Overview

### Purpose

The frontend is a **school management system UI** built to support administrators and staff in managing:

- Students
- Classes
- Subjects
- Teachers
- Attendance (currently mock-backed UI)
- Finances (fees & payments; currently mock-backed UI)

### Tech stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui (Radix primitives)

### Current architecture (important)

The current app uses **mock data** and client-side state hooks to simulate a real system:

- Authentication uses mock users and persists session in `localStorage`
- Data hooks under `client/lib/` (e.g. `use-students`, `use-classes`) provide CRUD-like operations
- Role-based behavior is centralized in `client/lib/permissions.ts`

This means the app already demonstrates:
- Page structure and layout
- Role-based navigation + action gating
- CRUD workflows and dialogs

But it is **not yet integrated with a real backend API**.

### Primary user flows

- **Login** → redirect to dashboard on success
- **Dashboard** → overview cards + quick actions
- **Students** → list/search, add/edit/delete, view profile
- **Classes** → list/search, add/edit/delete, see capacity/enrollment
- **Subjects** → list/search, add/edit/delete
- **Teachers** → list/search, add/edit/delete, subject badges
- **Attendance** → select class/date, mark present/absent/late, bulk “mark all present”
- **Finances** → list fees, record payment, compute totals

### Key documents

- Routes & pages: `docs/frontend/routing-and-pages.md`
- Auth & roles: `docs/frontend/auth-and-roles.md`
- State & data layer: `docs/frontend/state-and-data.md`
- UI components: `docs/frontend/ui-and-design-system.md`
