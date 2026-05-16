# Changelog

All notable changes to the **Sukuu Mu** school management platform will be documented in this file.

## [1.2.0] - Integration hardening, profiles, and finance workflows

### Added

- **Class detail page** (`/dashboard/classes/[id]`): view all students in a class (with links to student profiles) and subjects taught in that class with assigned teachers.
- **Teacher profile page** (`/dashboard/teachers/[id]`) and **student profile page** (`/dashboard/students/[id]`) using a shared `EntityProfileView` layout aligned with dashboard typography (Playfair Display + DM Sans).
- **Record payment** flow on the Finances page via `PaymentRecordDialog`: select student, optional fee structure or ad-hoc total, amount, method (cash, bank transfer, mobile money, cheque, other), and notes.
- **Student form**: gender and enrollment date fields (wired to API).
- **Teacher form**: assigned classes (multi-select) in addition to subjects.
- **API error utilities** (`lib/api-errors.ts`): `getApiErrorMessage`, `unwrapListPayload`, and consistent Axios handling in forms and pages.
- **Server request IDs** on every HTTP response (`X-Request-Id`) and structured logging with user id when authenticated.
- **Server `parseIdParam`** validation for class, student, and teacher route ids (returns 400 instead of `NaN` errors).

### Changed

- **Server middleware order**: `morgan` and custom `logger` now run **before** API routes so all requests appear in server logs (previously logging was registered after routes and never ran for API traffic).
- **Teacher create/update** persists `subject_ids` and `class_ids` through `syncSubjects` / `syncClasses` on `teacher_subjects` and `teacher_classes` junction tables; list and detail responses include nested `subjects` and `classes`.
- **Teacher list UI** displays subject names from API data instead of placeholder `Subject #id` labels.
- **`teacherToApiPayload` / `mapTeacherFromApi`**: map `subjectIds` ↔ `subject_ids`, `classIds` ↔ `class_ids`, and nested subject/class arrays.
- **`use-teachers`**, **`use-students`**, **`use-classes`**, **`use-subjects`**: use `unwrapListPayload`, default `limit: 100`, and validated mutation ids.
- **Finances hook** invalidates `student-fees` and fee reports after recording a payment.
- **Student profile** loads a single student from `GET /students/:id` instead of broken mock-only attendance/finance hooks.

### Fixed

- **Finance API 500s**: fee repository SQL aligned with `schema.sql` (removed non-existent `fs.is_active`, `fp.total_fee`, `recorded_by` columns); fee report queries moved into repository (fixes `pool is not defined` in `getFeeReport`); payments now update `student_fees.total_paid` ledger on record.
- **Teacher form**: gender field added (male / female / other), mapped through existing `teacherToApiPayload`.
- **Teacher edit** calling `updateTeacher(editingTeacher.id, data)` instead of `updateTeacher({ id, updates })`, which caused `PUT /teachers/undefined` and server `NaN` errors.
- **Teacher junction SQL**: removed invalid `created_at` inserts and `id` column reads on `teacher_classes` / `teacher_subjects` (composite primary keys only).
- **Class summary view** / **`updated_at`** column mismatch causing `GET /classes` 500 errors (addressed in schema + patches; see 1.0.0 notes).
- **Subject credit hours** persisted as `credit_hours` in MySQL and mapped to `creditHours` in the client.
- **Form dialogs** (class, subject, student, teacher) use `getApiErrorMessage` for user-visible API failures.

---

## [1.0.0] - Full Backend API integration into the frontend

### Added

- **Password Visibility Toggle**: Integrated an interactive `<Eye />` and `<EyeOff />` toggle directly into the main `login` user interface input for revealing/hiding password characters properly during authentication attempts.
- **Server Logging Improvements**: Greatly enhanced the Node.js Express server backend's `logger.middleware.js` to visibly output consistent, readable ANSI color-coded system event streams for incoming traffic metrics. Included specific parameters for `HTTP method status code formatting`, `Response processing duration`, and `Client request IPs`.

### Changed

- **Client Session Persistence Migration**: Fully refactored `@/lib/auth-context.tsx` and underlying state hooks. Token persistence has been explicitly hard-shifted from `localStorage` to the far stricter `sessionStorage` scope.
- **API Authentication Flow**: Eradicated persisted local user caching dependencies limiting session security validation. Standardized `auth-context.tsx` application setups to natively pull fully verified user records synchronously from the backend's `/auth/me` on every reload occurrence instead of relying purely on UI memory states.
- **Backend Login Verification Extensibility**: Broadened Express API configurations allowing authenticating operators (including the `System Administrator`) the capability to log in not exclusively requiring explicit column `email` address formulations, but optionally matching directly against raw configured username strings by remapping the backend to query `u.email = ? OR u.name = ?`.
- **CORS API Adjustments**: Refactored `express-cors` placement directly proceeding standard system preflight implementations inside backend initialization, permitting completely separated Next.JS frontend frameworks to bypass native Helmet browser origin blocks automatically on standard HTTP requests.

### Fixed

- **Order Loading Race Conditions (TypeScript Error)**: Discovered critical NextJS crash sequence throwing `TypeError: Cannot read properties of undefined (reading 'reduce')` tied specifically to missing UI properties inside the `useClasses()` and `useSubjects()` data models rendering loop. Initialized fallback logic onto UI computations guarding cached metrics preventing frontend crash loops.
- **Type Mismatch Inaccuracies**: Safely rewired numerical mismatch typings tied to core update parameters natively mapped on the `Teacher` and `Class` interfaces. Resolved specific issues concerning:
  - Teacher forms explicitly requiring array formulations of `subjectIds`.
  - Class instances lacking standard structured `code`, `level`, `capacity` parameters on post.
  - Active toggle identifiers mapping against raw numbers instead of null strings properly inside `app\dashboard\classes\page.tsx`.
- **Global Logout Infinite Recursion Redirection Bugs**: Re-orchestrated HTTP-level token expiration intercepts from standard `api-client` endpoints avoiding strict `window.location.href = '/login'` hard browser page reloads previously locking API users out of the native un-mounted NextJS client router state sequences. Explicitly implemented dispatching standard react-query `cache clear()` commands preventing lingering, in-flight token verification components kicking off race conditions immediately after user log out sequences.
- **Database Password Consistency Sync Bugs**: Isolated mismatched bcrypt hash states embedded manually into the system during stale seeding workflows preventing matching configurations derived from current dot-environment standard credentials. Re-processed internal SQL table data forcing database alignments to perfectly coordinate the expected backend seed `Admin@2026!` configurations seamlessly.
- **Form Error Handling and 409 Conflicts**: Re-engineered all NextJs form submittal mechanisms across `Classes`, `Subjects`, `Teachers`, and `Students` dashboard components. Changed synchronous `onSubmit` callbacks to `async/await` Promises catching explicit server-returned `409 Conflict` database responses (e.g., duplicated records or unique constraint issues) properly. Rendered UI-level alert banners preventing silent failing modals dismissing and discarding user inputs on background server crashes.
- **MySQL Strict Mode Data Types Compliance**: Prevented backend node processes from crashing completely during `INSERT/UPDATE` mechanisms. Updated `student`, `teacher`, and `fee` repositories forcing empty string values (`""`) coming from the frontend (such as unassigned employee IDs or dates) to coerce properly into standard `NULL` values recognized perfectly by MySQL engine architectures.
- **Missing Employee ID Fields**: Sourced missing `employee_id` HTML inputs into the frontend's `TeacherFormDialog` ensuring `axios` operations complete safely without hitting specific required field column validation rejections in Express.
- **NaN Input Casting Exceptions**: Debugged `<Input>` elements reacting and throwing native React errors specifically reading `Received NaN for the value attribute` associated directly with empty numeric structures in subjects, automatically safely casting and stripping out invalid instances utilizing zero placeholders natively on render.
- **Database Schema Deviations**: Fixed 500 error outputs occurring abruptly during core Class fetching routing. Appended necessary runtime schema updates mapping `updated_at` parameter instances directly into SQL `class_summary` definitions and implemented default mapping for the `is_active` constraint explicitly within `subjects` table arrays.
- **Stale Form Render States**: Corrected destructive React component lifecycle bugs where internal `useState` hooks natively retained default empty states causing blank modal rendering dynamically upon users clicking "Edit" components. Engineered dynamic `useEffect` binding listeners directly onto all Subject, Class, and Teacher `<Dialog>` containers synchronizing payload resets instantly upon `isOpen` transitions alongside native `initialData` loads ensuring explicit data editing workflows consistently display active entity values.
- **Unified Action Menu Architecture**: Standardized the UI/UX across all core management lists (`Subjects`, `Classes`, `Teachers`, and `Students`). Migrated legacy, brittle custom CSS dropdown implementations to the robust `@radix-ui/react-dropdown-menu` standard. Optimized client-side performance by removing redundant `activeMenu` state listeners and manual click-outside event handlers, consistently providing interactive "Edit" and "Delete" capabilities within a unified modern "three-dots" interface.
