## Product Roadmap (Phased Delivery)

This document describes the intended delivery phases. Some Phase 2/3 screens already exist in the frontend as **mock-backed UI**, even if the “production backend integration” is not yet in place.

### Phase 1 — Foundation (Core Admin System)

**Goals**
- Build a working admin system
- Manage students, classes, teachers, and subjects
- Implement authentication and roles (Admin, Manager, Teacher, Student)

**Features**
- **Authentication**
  - Login page with validation, error handling, redirect to dashboard
- **Role management**
  - Show/hide navigation and actions based on role
- **Student management**
  - Create, list, view profile, edit, delete
  - Assign student to class (Planned: dedicated “move student / migrate” UI)
- **Teacher management**
  - Create, list, edit, delete
  - Subject associations (currently stored on teacher record)
- **Class management**
  - Create, list, edit, delete
  - Capacity & enrollment visibility
  - Migrate students between classes (Planned)
- **Subject management**
  - Create, list, edit, delete
  - Assign subjects to classes (Planned)
  - Assign teachers to subjects (Planned)

### Phase 2 — Attendance (Later)

**Goal**
- Introduce attendance tracking and daily recording workflows.

**Suggested features**
- Daily attendance per class (present/absent/late)
- Bulk actions (e.g. “mark all present”)
- Attendance summary per day and per class
- Filtering by class/date and reporting (Planned)

### Phase 3 — Finance System (Fees & Payments)

**Goal**
- Manage school fees and payments with receipts and basic reporting.

**Features**
- Fee structure management (Planned)
  - Define fee categories (tuition, exam fees, etc.)
  - Assign fees to students
- Payments
  - Record payments
  - Filter by student/class/date (Planned)
- Receipts
  - Generate receipt numbers
  - Download/print receipts (Planned)
- Notifications (Planned)
  - SMS message to parent’s phone number for receipts and balances
