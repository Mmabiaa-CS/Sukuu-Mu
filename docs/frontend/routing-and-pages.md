## Frontend Routes & Pages

This project uses **Next.js App Router**, so routes are created by folders under `client/app/`.

### Public routes

- **`/`**
  - Redirects based on auth state:
    - If logged in: goes to `/dashboard`
    - Otherwise: goes to `/login`
- **`/login`**
  - Email/password form
  - Displays error messages for invalid credentials
  - On success, redirects to `/dashboard`

### Protected routes (Dashboard area)

Protected routes live under `client/app/dashboard/` and share a common layout:

- **Layout**: `client/app/dashboard/layout.tsx`
  - Uses `useProtectedRoute` to enforce login
  - Renders sidebar + main content area

Routes:

- **`/dashboard`**
  - Overview cards (students/classes/subjects/teachers)
  - Quick actions (role-based)
- **`/dashboard/students`**
  - Students list + search
  - Add/edit student dialog
  - Role-based filtering of visible students (teacher access restrictions)
  - View profile action → `/dashboard/students/[id]`
- **`/dashboard/students/[id]`**
  - Student profile page (details view)
- **`/dashboard/classes`**
  - Classes list + search
  - Create/edit class dialog
  - Enrollment/capacity indicators
- **`/dashboard/subjects`**
  - Subject list + search
  - Create/edit subject dialog
- **`/dashboard/teachers`**
  - Teachers list + search
  - Create/edit teacher dialog
  - Subject badges rendered from teacher’s subject IDs
- **`/dashboard/attendance`**
  - Select class + date
  - Record present/absent/late per student
  - Bulk “mark all present”
  - Summary dialog
- **`/dashboard/finances`**
  - Fees table and totals
  - Record payment dialog, receipt number generation

### Navigation rules

Navigation is rendered by `client/components/dashboard-sidebar.tsx` and is **role-aware**:

- Everyone sees: Dashboard, Students
- Admin/Manager sees additional items: Classes, Subjects, Teachers, Finances
- Teacher sees Attendance (and other items depending on permissions)

See: `docs/frontend/auth-and-roles.md`.
