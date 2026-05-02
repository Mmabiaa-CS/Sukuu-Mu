# Production roadmap — Sukuu-Mu (startup / schools)

This document is the **engineering and delivery path** from today’s codebase to a **production-grade school management product**: simple to operate, safe for real institutions, and able to grow with more schools without premature complexity.

It complements **`docs/product/roadmap.md`** (feature phases). Product roadmap describes *what* modules matter; this document describes *how* to ship them reliably.

---

## Principles (non-negotiable)

1. **Production standard** means correct auth, data integrity, backups, and observable failures — not the largest possible tech stack.
2. **KISS** — one deployable API (`apps/server`), one primary database (MySQL), one web client (`apps/client`). Add pieces only when a measured problem appears (slow queries, traffic, compliance).
3. **School systems at scale** — hundreds to thousands of concurrent users across tenants is still routinely served by **stateless monoliths + a relational DB** with pooling, indexes, and horizontal API replicas. Microservices are optional later, not a Day‑1 requirement.

---

## Target architecture (feasible and professional)

What you are building toward — **no over-engineering**:

```
[Tenant schools / browsers]
        │
        ▼
   HTTPS edge (TLS termination)
        │
        ▼
   Stateless API instance(s)  ← Node / Express (apps/server)
        │
        ▼
   Managed MySQL (+ backups)   ← single source of truth
```

**Why this is appropriate for school management**

- Strong consistency for enrollment, fees, and attendance matters more than exotic distribution patterns early.
- Operational burden stays low for a small team: deploy API, migrate schema, monitor, backup.

**Scale path (when clients grow — in order)**

| Stage | Typical signal | Response (still simple) |
|-------|----------------|-------------------------|
| Early production | Single school, low traffic | Single API instance, tuned pool, indexes on FK/search columns |
| Growth | Multiple schools, predictable load | Multiple API instances behind a load balancer; **same** DB; session-less JWT |
| Read pressure | Heavy reporting / dashboards | MySQL **read replica** or cached aggregates — measure first |
| Compliance / isolation | Strict tenant separation | Row-level tenant id + strict queries, or separate DB per large district — product decision |

Avoid splitting into many services until **team size** or **deployment independence** forces it.

---

## Roadmap to success (phases)

Each phase has **exit criteria** so you know when to move on without gold-plating.

### Phase 0 — Decide once, implement once (short)

**Goal:** Stop ad hoc integration and permission drift.

| Deliverable | Why |
|-------------|-----|
| **RBAC matrix** (who can list/create/update/delete what) | Align `authorize(...)` on server with `permissions.ts` and real school policy |
| **API ↔ UI contract notes** | e.g. `name` vs `firstName`/`lastName`, numeric vs string IDs — one adapter layer on the client |
| **Environments** | `development` / `staging` / `production` — separate DB credentials and `JWT_SECRET` |

**Exit:** Written decisions merged or linked from `docs/architecture/backend-rbac-and-integration.md`; no ambiguous “we’ll fix RBAC later” for fees and student lists.

---

### Phase 1 — Production foundation (backend + ops baseline)

**Goal:** Anything deployed to a real school can survive audits and incidents.

| Area | Action |
|------|--------|
| **Secrets** | Never commit `.env`; use host/env injection in production |
| **Schema** | Introduce **versioned migrations** (tool of your choice: raw SQL, Flyway-style, etc.) — repos today assume tables exist without tracked migration history |
| **HTTPS** | TLS at reverse proxy or platform (Render, Railway, AWS ALB, nginx) |
| **Process** | Graceful handling of listen errors; optional graceful shutdown on SIGTERM |
| **Logging** | Structured enough to trace `request id + user id + route + latency` (incremental is fine) |
| **Backups** | Automated DB backups + documented restore drill |

**Exit:** Staging deploy exists; restore tested once; migrations apply cleanly from empty DB to current schema.

---

### Phase 2 — Vertical integration (client ↔ API)

**Goal:** Replace mock data with real flows **incrementally** — one domain at a time.

Recommended order (dependency-aware):

1. **Authentication** — `POST /auth/login`, store JWT (prefer **HTTP-only cookie** for browser apps when same-site deployment allows; otherwise secure storage pattern + XSS discipline), `GET /auth/me`, logout behavior defined  
2. **Students + classes** — highest overlap with existing UI  
3. **Teachers + subjects** — matches dashboard modules  
4. **Fees** — backend already rich; align **visibility** with RBAC matrix before exposing teachers widely  

Implementation pattern (KISS):

- Add **`apps/client/lib/api/*`** thin clients (base URL, auth header, error parsing)  
- Refactor existing hooks to call API instead of mocks; **keep hook signatures** stable for pages  

**Exit:** Demo school can perform daily admin tasks only against API + DB (no mock reliance for those flows).

---

### Phase 3 — Policy enforcement (security effectiveness)

**Goal:** The system behaves correctly for **malicious or mistaken** clients, not only the happy-path UI.

| Gap type | Example direction |
|----------|-------------------|
| **Data scope** | Teachers see students/fees only where policy allows — enforced in **services/repositories**, not only UI |
| **Role semantics** | Resolve **`user`** role vs frontend enum; document or remove ambiguity |
| **List endpoints** | Add **pagination** when real row counts exceed comfortable defaults |
| **Tokens** | Document rotation/expiry; optional denylist on password change / role change if policy requires |

**Exit:** RBAC matrix and implementation match; spot-check with manual API calls (not only clicking the UI).

---

### Phase 4 — Product completeness vs `docs/product/roadmap.md`

**Goal:** Match promised modules without speculative extras.

| Module | Note |
|--------|------|
| **Attendance** | Backend module missing today — minimal schema + CRUD + queries by class/date; bulk “mark present” can follow |
| **Parents** | Server API exists — product chooses admin-only vs guardian portal before building UI |
| **Finance** | Backend ahead of integrated UI — prioritize reporting filters and receipt flows schools actually need |

**Exit:** Phase 1–3 product goals in `docs/product/roadmap.md` are either integrated or explicitly deferred with dates.

---

### Phase 5 — Growth readiness (efficiency at scale)

**Goal:** First large customer does not force a panic rewrite.

| Measure | Action |
|---------|--------|
| Slow endpoints | EXPLAIN + indexes; fix N+1 queries in repositories |
| Connection exhaustion | Tune pool size vs DB `max_connections`; avoid long-held connections |
| Availability | Health check used by orchestrator; uptime monitoring |
| Abuse | Rate limit login and sensitive writes at edge |

**Exit:** Load test or rehearsal with realistic row counts; documented bottlenecks and fixes.

---

## What we deliberately defer

- Microservices, event buses, and multi-repo proliferation until **team** and **traffic** justify them  
- Complex caching layers until profiling shows repeated expensive reads  
- Building every integration (SMS, accounting exports) before core workflows are stable  

---

## Success definition (honest)

You have succeeded for v1 production when:

1. Real schools run on **API + DB + client** with **no mock auth** for operational roles.  
2. **RBAC** matches policy and holds under direct API use.  
3. **Backups and restores** work.  
4. You can **deploy** and **roll back** without manual SQL on production.  
5. The architecture diagram above still fits — possibly with **more API replicas**, not more arbitrary services.

---

## Related documents

- **RBAC + frontend gaps:** `docs/architecture/backend-rbac-and-integration.md`  
- **Product features by phase:** `docs/product/roadmap.md`  
- **Server env and routes:** `apps/server/README.md`  
- **Frontend auth/data direction:** `docs/frontend/auth-and-roles.md`, `docs/frontend/state-and-data.md`  
