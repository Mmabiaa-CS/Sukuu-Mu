## Repository Structure

### Top level

- **`apps/client/`** — Next.js frontend application  
- **`apps/server/`** — Express REST API (MySQL, JWT)  
- **`docs/`** — documentation (product + engineering + architecture)  
- **`README.md`** — project entry point (overview + quick start)  
- **`License.md`** — license text  
- **`contribution.md`** — contributing guidelines  

### Frontend (`apps/client/`)

Key folders:

- **`apps/client/app/`**  
  - Next.js App Router pages and layouts  
  - `apps/client/app/dashboard/*` — protected dashboard pages  
- **`apps/client/components/`**  
  - App and feature components (e.g. sidebar, dialogs)  
- **`apps/client/components/ui/`**  
  - Reusable UI primitives (shadcn/ui style)  
- **`apps/client/lib/`**  
  - Auth, permissions, domain types, mock data, feature hooks  
- **`apps/client/hooks/`**  
  - Shared React hooks  
- **`apps/client/styles/`**  
  - Global styles  
- **`apps/client/public/`**  
  - Static assets, PWA manifest/icons  

### Backend (`apps/server/`)

Key folders:

- **`apps/server/server.js`** — process entry: `dotenv`, DB connect, HTTP listen  
- **`apps/server/src/app.js`** — Express instance, global middleware, route mounts, `/health`  
- **`apps/server/src/config/`** — configuration (e.g. DB from env)  
- **`apps/server/src/database/`** — MySQL pool and connection helper  
- **`apps/server/src/middleware/`** — auth, validation, errors, logging  
- **`apps/server/src/modules/<domain>/`** — routes, controllers, services, repositories per feature  
- **`apps/server/src/utils/`** — JWT, password hashing  

See **`apps/server/README.md`** for environment variables and API overview.

### Important files (frontend)

- **`apps/client/lib/auth-context.tsx`** — auth provider + login/logout (mock today)  
- **`apps/client/lib/permissions.ts`** — centralized role permissions and access filtering  
- **`apps/client/lib/types.ts`** — TypeScript domain types used across the UI  
