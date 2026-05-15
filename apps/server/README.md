# Sukuu-Mu Server

REST API for the Sukuu-Mu school management system. This service is an **Express** application backed by **MySQL** (via `mysql2` connection pooling), with **JWT** authentication, **role-based access**, and modular feature routes under `/api/v1`.

---

## Stack

| Piece | Technology |
|-------|------------|
| Runtime | Node.js **≥ 18** |
| Framework | Express 4 |
| Database | MySQL 8 (recommended) / compatible MariaDB |
| Auth | `jsonwebtoken` + `bcryptjs` |
| Validation | `express-validator` |
| Security | `helmet`, `cors` |
| Config | `dotenv` |

---

## Quick start

From this directory (`apps/server`):

```bash
pnpm install
# or: npm install
```

Create a `.env` file (see [Environment variables](#environment-variables)). Ensure MySQL is running and the target database exists with the schema your repositories expect.

```bash
pnpm dev
# or: npm run dev   (nodemon)
```

```bash
pnpm start
# or: npm start     (plain node)
```

The process loads `dotenv` in `server.js` before importing the app or connecting to the database. The server verifies the DB pool on startup (`connectDB`); if the connection fails, the process exits with code `1`.

---

## Environment variables

Configuration is read from **`process.env`**. Defaults are applied in code where noted; secrets must always be supplied via the environment.

### How configuration is loaded

1. **`server.js`** calls `require('dotenv').config()` first. That reads a **`.env` file from the current working directory** (typically `apps/server` when you run scripts from here).
2. **`src/config/db.config.js`** also calls `dotenv.config()` when the module is evaluated. That is redundant when the app starts via `server.js` but harmless (second load is a no-op for already-set vars).
3. **`NODE_ENV`** is not set by the app; you set it in your shell or `.env`. If unset, `server.js` treats the environment label as **`development`**.

### Variable reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PORT` | No | `3000` | HTTP listen port (`server.js`). |
| `NODE_ENV` | No | _(see below)_ | Logging and error responses. Used as `'development'` in `server.js` when unset for the startup log label; **`error.middleware`** and **`app.js`** compare to `'development'` and `'test'` explicitly. |
| `DB_HOST` | No | `localhost` | MySQL host (`db.config.js`). |
| `DB_PORT` | No | `3306` | MySQL port. Parsed with `parseInt`; invalid values fall through to pool defaults—prefer a numeric string. |
| `DB_USER` | No | `root` | MySQL user. |
| `DB_PASSWORD` | No | `''` (empty string) | MySQL password. |
| `DB_NAME` | No | `school_management` | Database name. |
| **`JWT_SECRET`** | **Yes** for auth | _(none)_ | Shared secret for signing and verifying tokens. **`jwt.util`** throws if it is missing when `signToken` / `verifyToken` run—login, register, and any protected route will fail without it. |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime passed to `jwt.sign` (`jsonwebtoken` duration string). |

#### `NODE_ENV` behavior in this codebase

- **`NODE_ENV === 'test'`** — **`morgan`** request logging is not registered (`src/app.js`).
- **`NODE_ENV === 'development'`** — **`error.middleware`** includes `stack` in JSON error responses (useful locally; avoid in production secrets exposure).
- **`/health`** returns `environment: process.env.NODE_ENV` (may be `undefined` if unset).

### Example `.env`

Do **not** commit real secrets. `.env` is listed in `.gitignore`.

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_management

JWT_SECRET=use_a_long_random_string_in_production
JWT_EXPIRES_IN=7d
```

---

## Project layout & implementation

### Entry flow

```
server.js
  └── dotenv.config()
  ├── src/app.js          → Express instance, middleware, routes, health, 404, error handler
  └── src/database/connection.js
        └── connectDB() + mysql2 pool (config from src/config/db.config.js)
```

### Middleware (global)

- **`helmet`**, **`cors`**, **`express.json()`**, **`express.urlencoded({ extended: true })`**
- **`morgan('dev')`** — skipped when `NODE_ENV === 'test'`
- **`logger`** (`src/middleware/logger.middleware.js`) — timing/status logging on `res.finish`
- **`errorHandler`** — central JSON errors; stacks only in **`development`**

### Feature modules

Each domain follows a layered layout: **`*.routes.js`** → **`*.controller.js`** → **`*.service.js`** → **`*.repository.js`**. Auth uses **`auth.repository`** plus **`utils/jwt.util`** and **`utils/hash.util`**.

Shared middleware:

- **`authenticate`** — `Authorization: Bearer <token>`; attaches `req.user` (`id`, `name`, `email`, `role`)
- **`authorize('role1', 'role2')`** — must run after **`authenticate`**
- **`validate`** (`validate.middleware.js`) — runs **`express-validator`** schemas and responds with **422** + field errors when invalid

### API surface (prefix `api/v1`)

Base URL shape: **`http://<host>:<PORT>/api/v1/...`**  
Public auth routes (no token): **`POST /auth/login`**, **`POST /auth/register`**.  
All other **`/parents`**, **`/fees`**, **`/teachers`**, **`/subjects`**, **`/classes`**, **`/students`** mounts use **`authenticate`** on the router (Bearer token required).

| Mount | Highlights |
|-------|------------|
| **`/auth`** | `GET /me`, `PATCH /change-password` (authenticated); **`GET /users`** — **`admin`** only |
| **`/parents`** | Search, CRUD (**admin** for writes/linking), lookups by student/parent |
| **`/fees`** | Structures, assignments, ledger, payments; **admin**/ **teacher** for selected actions (**see `fee.routes.js`**) |
| **`/teachers`** | CRUD (**admin**), class/subject assignments (**admin**) |
| **`/subjects`** | CRUD; **manager** may update (**see `subject.routes.js`**) |
| **`/classes`** | Search/read for authenticated users; create allows **admin**, **manager**, **user**; mutate/migrate restricted (**see `class.routes.js`**) |
| **`/students`** | Reads for any authenticated role; create/update **admin**/**teacher**; delete **admin** |

**`GET /health`** (root, not under `api/v1`) — liveness payload with `status`, `environment`, `timestamp`.

### Database connection pool

Defined in **`src/config/db.config.js`** and **`src/database/connection.js`**:

- `waitForConnections: true`, **`connectionLimit: 10`**, `queueLimit: 0`
- **`timezone: '+00:00'`** (UTC)

Repositories should import **`pool`** from **`src/database/connection.js`** for queries.

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node server.js` | Production-style run |
| `dev` | `nodemon server.js` | Reload on file changes |
| `migrate` | `pnpm run migrate` | Initialize database schema |

---

## API Documentation

Interactive API documentation is available via Swagger UI:
- **URL**: `http://localhost:3001/api-docs` (when server is running)
- Provided details: Endpoints, request bodies, success/error models, and authentication.

---

---

## Developer contribution guidelines

These align with the repository’s general expectations in **`contribution.md`** at the repo root, scoped to **this server**.

### Principles

- Be respectful and constructive; do not commit secrets (`.env`, credentials, production **`JWT_SECRET`**).
- Prefer **small, focused** branches and PRs with a clear “why”.
- Branch from **`dev`** unless your team uses another default (`feat/...`, `fix/...`, `docs/...`, `chore/...`).

### Server-specific conventions

- **Language**: CommonJS (`require` / `module.exports`), **`'use strict'`** at the top of modules (match existing files).
- **Layers**: Keep HTTP concerns in controllers, orchestration in services, SQL in repositories. Avoid mixing raw SQL into route files.
- **Auth**: Use **`authenticate`** for any protected router; gate privileged actions with **`authorize(...)`** using role names consistent with your database (e.g. **`admin`**, **`teacher`**, **`manager`**, **`user`**, **`student`** as used in routes).
- **Validation**: Prefer **`express-validator`** chains wired through **`validate`** for request bodies/query params rather than ad hoc checks scattered in controllers.
- **Errors**: Throw **`Error`** with **`err.status`** where appropriate so **`error.middleware`** returns the right HTTP code; rely on the global handler instead of duplicate try/catch in every controller when possible.

### Commit messages

Same conventional style as the rest of the repo: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.

### Before you open a PR

- Smoke-test **`POST /auth/login`** and at least one protected **`GET`** with a Bearer token.
- Confirm **`GET /health`** and DB connectivity against your local MySQL instance.
- If you introduce new configuration, update this **README**’s env table so operators stay in sync.

---

## Related documentation

- Repository-wide contributing notes: **`contribution.md`** (repo root).
- Frontend and wider docs may live under **`docs/`**; this server README is the source of truth for **`apps/server`** runtime and env behavior.
