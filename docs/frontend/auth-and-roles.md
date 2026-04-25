## Authentication & Roles (RBAC)

### Current auth approach (mock)

The current frontend implements **mock authentication**:

- Credentials are validated against in-repo mock data (demo users)
- The “logged in user” is persisted in `localStorage` under the key `school_user`
- App-level provider: `client/lib/auth-context.tsx`

This design allows the UI/flows to be built now, while backend integration can be introduced later.

### Login flow

- User submits email/password on `/login`
- `AuthProvider.login(email, password)` tries to find a matching mock user
- On success:
  - user is saved to state
  - user is saved to `localStorage`
  - app redirects to `/dashboard`
- On failure:
  - UI displays “Invalid email or password”

### Protected routes

Routes under `/dashboard` are protected by `client/lib/use-protected-route.ts` (used in `client/app/dashboard/layout.tsx`).

Expected behavior:
- If not authenticated, redirect to `/login`
- If authenticated, render dashboard layout and content

### Roles

Roles are defined as `UserRole` in `client/lib/types.ts`:

- `admin`
- `manager`
- `teacher`
- `student`

### Permissions model (RBAC)

Role-based behavior is centralized in `client/lib/permissions.ts`.

Examples:
- **Admin/Manager**: broad management access (students/classes/subjects/teachers/finances)
- **Teacher**: limited access to assigned classes/students and attendance flows
- **Student**: view-only access to their own information (future expansion)

### UI behavior influenced by roles

- Sidebar navigation shows/hides menu entries based on role permissions
- Page actions (e.g., “Add Student”, “Delete”, “Edit”) are gated by permission checks
- Data visibility can be filtered (e.g., teachers see only students in their classes)

### Planned evolution (backend-integrated auth)

When integrating a real backend:
- Replace mock user lookup with API login
- Store auth tokens securely (HTTP-only cookies recommended)
- Replace mock permission checks with server-validated authorization
- Keep the same “single source of truth” for UI gating (permissions module) but align with backend rules
