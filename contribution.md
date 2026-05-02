## Contributing to Sukuu-Mu

Thanks for taking the time to contribute. This repository includes the **Next.js frontend** (`apps/client/`) and the **Express API** (`apps/server/`) for the Sukuu-Mu School Management System.

### Code of conduct

Be respectful, constructive, and collaborative. Harassment or discrimination is not tolerated.

### Where to start

- Read the docs hub: `docs/README.md`
- Root overview: `README.md`
- Frontend overview: `docs/frontend/overview.md`
- Server overview: `apps/server/README.md`
- Repo structure: `docs/development/repo-structure.md`

### Development setup (frontend)

Prereqs:
- Node.js (recommended: latest LTS)
- pnpm (recommended)

```bash
cd apps/client
pnpm install
pnpm dev
```

### Development setup (server)

Prereqs: Node.js **≥ 18**, MySQL. Configure `apps/server/.env` (see `apps/server/README.md`).

```bash
cd apps/server
pnpm install
pnpm dev
```

### Branching & workflow

- **Branch from**: `dev` (unless your team uses a different default)
- **Naming**:
  - `feat/<short-name>` (new feature)
  - `fix/<short-name>` (bug fix)
  - `docs/<short-name>` (documentation)
  - `chore/<short-name>` (maintenance)
- **Pull requests**:
  - Keep PRs focused and small
  - Include screenshots for UI changes
  - Describe the “why”, not just the “what”

### Coding standards

- **TypeScript (client)**: prefer strong types over `any`
- **UI**: use existing components in `apps/client/components/ui/` when possible
- **State/data**: follow the established hooks pattern under `apps/client/lib/` (e.g. `use-students`, `use-classes`)
- **Auth/roles**: keep role checks centralized in `apps/client/lib/permissions.ts`; align server `authorize(...)` with documented RBAC (`docs/architecture/backend-rbac-and-integration.md`)
- **Server**: match existing module layout (`routes` → `controller` → `service` → `repository`); use `'use strict'` and existing middleware patterns

### Linting (frontend)

```bash
cd apps/client
pnpm lint
```

### Commit messages

Use a conventional-ish format:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`
- `refactor: ...`

### Reporting issues

When filing a bug, include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (for UI issues)
- Browser + OS

### Security

Do **not** commit secrets (API keys, `.env`, credentials, etc.). If you discover a security issue, report it privately to the maintainers.
