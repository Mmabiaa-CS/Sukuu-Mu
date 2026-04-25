## Contributing to Sukuu-Mu

Thanks for taking the time to contribute. This repository currently focuses on the **frontend (`client/`)** for the Sukuu-Mu School Management System.

### Code of conduct

Be respectful, constructive, and collaborative. Harassment or discrimination is not tolerated.

### Where to start

- Read the docs hub: `docs/README.md`
- Frontend overview: `docs/frontend/overview.md`
- Repo structure: `docs/development/repo-structure.md`

### Development setup (frontend)

Prereqs:
- Node.js (recommended: latest LTS)
- pnpm (recommended)

```bash
cd client
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

- **TypeScript**: prefer strong types over `any`
- **UI**: use existing components in `client/components/ui/` when possible
- **State/data**: follow the established hooks pattern under `client/lib/` (e.g. `use-students`, `use-classes`)
- **Auth/roles**: keep role checks centralized in `client/lib/permissions.ts`

### Linting

```bash
cd client
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
