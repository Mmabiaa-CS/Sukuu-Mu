# Sukuu-Mu Documentation Hub

Welcome to the Sukuu-Mu School Management System reference docs. This documentation focuses purely on the current state of the unified frontend-backend architecture for version 1.0.0.

## Core Stack
- **Frontend**: Next.js 16.x (App Router), React Query, UI Components
- **Backend**: Node.js, Express, MySQL 
- **Authentication**: JWT, SessionStorage, Role-Based Access Control (RBAC)
- **API Specification**: Swagger (OpenAPI 3.0.0)

## Component Documentation
Select a topic below for detailed implementation logic and patterns:

- **[Product Overview](product/overview.md)**: Goals and architecture high-level summary
- **[Routing & Pages](frontend/routing-and-pages.md)**: Breakdown of Next.js frontend routes
- **[Auth & Access Control](frontend/auth-and-roles.md)**: API-driven SessionStorage JWT flow
- **[State & Data Layer](frontend/state-and-data.md)**: React Query models and data fetching
- **[UI System](frontend/ui-and-design-system.md)**: Design components overriding definitions
- **[Local Setup Instructions](development/local-setup.md)**: Environment setup for both client and server
- **[Repository Structure](development/repo-structure.md)**: Deep dive into the monorepo layout

### Development Conventions
- **Clean Architecture**: Use direct hooks (`useClasses`, `useSubjects`) for data instead of manipulating complex component state models inline.
- **Backend API Integration**: Ensure frontend dependencies bind safely to `/api/v1` resources. Do not use local storage persistence for highly secure user records.
- **Documentation Standards**: Maintain straightforward overviews representing current configurations. Planned future feature sets will be explicitly isolated or ticketed away from active references.

## Release Notes
- **[Version 1.0.0 (Latest)](releases/v1.0.0.md)**: Full API Backend Integration Release
