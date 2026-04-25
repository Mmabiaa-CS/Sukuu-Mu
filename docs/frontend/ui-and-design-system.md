## UI & Design System

### Approach

The frontend uses **Tailwind CSS** and a component library pattern based on **shadcn/ui** (Radix UI primitives wrapped with Tailwind styling).

### Where UI components live

- **Base UI components**: `client/components/ui/*`
  - Buttons, inputs, dialogs, tables, badges, etc.
- **Feature components**: `client/components/*`
  - Domain components like dialogs/forms for students/classes/subjects/teachers

### Common UI patterns

- **Tables** for lists (students, classes, subjects, teachers, fees)
- **Dialogs/Modals** for create/edit actions (e.g., add student)
- **Search inputs** to filter large lists
- **Badges** for status display (active/inactive, fee paid/pending, etc.)
- **Role-aware navigation** via the dashboard sidebar

### Layout

- Global layout wraps the app with `AuthProvider` in `client/app/layout.tsx`
- Dashboard routes share a protected layout in `client/app/dashboard/layout.tsx`
  - Sidebar: `client/components/dashboard-sidebar.tsx`
  - Main content area: scrollable, padded container

### Accessibility

Radix components provide good baseline accessibility, but contributors should ensure:
- Proper label usage for form fields
- Keyboard navigation for dialogs and menus
- Visible focus styles remain enabled
