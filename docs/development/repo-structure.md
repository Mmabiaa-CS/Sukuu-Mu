## Repository Structure

### Top level

- `client/`: Next.js frontend application
- `docs/`: documentation (product + engineering)
- `readme.md`: project entry point
- `License.md`: license text
- `contribution.md`: contributing guidelines

### Frontend (`client/`)

Key folders:

- `client/app/`
  - Next.js App Router pages and layouts
  - `client/app/dashboard/*` contains the protected dashboard pages
- `client/components/`
  - App and feature components (e.g., sidebar, dialogs)
- `client/components/ui/`
  - Reusable UI primitives (shadcn/ui style)
- `client/lib/`
  - App logic and domain hooks (auth, permissions, feature hooks, mock data)
- `client/styles/`
  - global styles

### Important files

- `client/lib/auth-context.tsx`: auth provider + login/logout
- `client/lib/permissions.ts`: centralized role permissions and access filtering
- `client/lib/types.ts`: TypeScript domain types used across the UI
