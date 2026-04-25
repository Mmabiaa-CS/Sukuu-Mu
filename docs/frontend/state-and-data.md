## State & Data Layer

### Current state approach

The frontend currently uses **client-side state** and **mock data** to simulate backend-backed CRUD workflows.

Key locations:

- **Types**: `client/lib/types.ts`
- **Mock data**: `client/lib/mock-data.ts`
- **Feature hooks** (CRUD-like logic):
  - `client/lib/use-students.ts`
  - `client/lib/use-classes.ts`
  - `client/lib/use-subjects.ts`
  - `client/lib/use-teachers.ts`
  - `client/lib/use-attendance.ts`
  - `client/lib/use-finances.ts`
- **Permissions**: `client/lib/permissions.ts`

### Hook pattern (what it provides)

Most feature hooks provide:
- A source list (e.g. `students`, `classes`)
- Derived/search-filtered lists
- Mutations such as `add*`, `update*`, `delete*`
- Helper functions like `getClassName`, `getStudentsInClass`, `getStudentBalance`

This keeps page components focused on UI composition and user interactions.

### Important limitations (today)

- Data is not persisted to a server (refresh resets most lists unless stored locally)
- Authentication is mock and stored in `localStorage`
- Attendance update-in-place is UI-simulated (not yet a full persistence model)

### Planned (backend integration)

When a backend API is introduced, the recommended direction is:

- Replace `mock-data.ts` with an **API service layer** (e.g. `client/lib/api/*`)
- Keep “feature hooks” but refactor them to:
  - fetch data from API
  - update via API mutations
  - handle caching and revalidation (e.g. React Query / SWR, or Next.js patterns)
- Maintain role permissions in a single module, but align with server authorization.

### Data model awareness (frontend)

The UI is already designed around these entities:

- Users, Roles
- Students, Classes, Subjects, Teachers
- Fees, Payments, Receipts
- Attendance

These types live in `client/lib/types.ts` and should remain the contract reference for frontend work.
