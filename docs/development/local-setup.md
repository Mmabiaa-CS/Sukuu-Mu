## Local Development Setup

### Prerequisites

- Node.js (recommended: latest LTS)
- pnpm (recommended)

### Install dependencies

```bash
cd client
pnpm install
```

### Run the frontend

```bash
cd client
pnpm dev
```

### Lint

```bash
cd client
pnpm lint
```

### Notes about “mock mode”

The current frontend ships with mock users and mock domain data. This is intentional to enable UI development before backend integration.

- Login credentials are shown on the login page (`/login`)
- Auth session is persisted in `localStorage`
