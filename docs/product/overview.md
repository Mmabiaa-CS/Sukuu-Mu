## Product Overview

### What is Sukuu-Mu?

Sukuu-Mu is a **school management system** designed to streamline daily school operations for administrators and staff. It centralizes student records, class organization, subject management, staff (teachers) management, and provides the foundation for attendance tracking and school finances.

### Who it’s for

- **Admins**: configure and manage the full system (people, academics, operational data)
- **Managers**: oversee school operations with broad but controlled permissions
- **Teachers**: work with assigned classes, view students, record attendance, and (planned) enter grades
- **Students/Parents (future-facing)**: view relevant information (scope varies by deployment)

### Core problem Sukuu-Mu solves

- Schools often manage critical workflows using spreadsheets and paper forms.
- Data becomes inconsistent and hard to audit.
- Reporting and operational visibility is slow.

Sukuu-Mu provides a **single source of truth** and a consistent UI for managing school data and workflows.

### Key modules (current + planned)

- **Authentication & Roles**
  - Role-based access controls (RBAC) to show/hide features based on user role.
- **Students**
  - Student directory, profiles, enrollment state, and class assignment.
- **Classes**
  - Class definitions (grade level, capacity), enrollment view, and (planned) migrations/promotions.
- **Subjects**
  - Subject catalog and (planned) class/teacher assignments.
- **Teachers**
  - Teacher directory, subject associations, and (planned) class assignments.
- **Attendance (later)**
  - Daily attendance recording and summaries.
- **Finance system (fees)**
  - Fee structures, payments, and receipts (plus future integrations like SMS).

### Data model awareness (frontend perspective)

Even when the frontend is running with mock data, the UI is designed around these entities:

- **Users**
- **Roles**
- **Students**
- **Classes**
- **Subjects**
- **Teachers**
- **Fees**
- **Payments**
- **Attendance**

See also: `docs/product/roadmap.md`.
