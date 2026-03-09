# CLAUDE.md — OSA Management Suite

## Project Overview

Internal management tool with three domains: Projects, Licenses, and Certificates. Monorepo with a Flask backend and React frontend, deployed to Kubernetes via Helm.

## Repository Structure

```
backend/              Python Flask API
  app/
    auth/             Session-based auth (login_required decorator)
    projects/         Project CRUD with row-level filtering stub
    licenses/         License CRUD with file upload/download
    certs/            Cert CRUD with encrypted key storage, format conversion
    dashboard/        Stats, expiring items, audit log
    crypto.py         Fernet encrypt/decrypt helpers
    audit.py          AuditLog model + log_audit() helper
  config.py           All config via env vars
  run.py              Entry point

frontend/             React + TypeScript
  src/
    pages/            One file per route (login, dashboard, projects-list, etc.)
    components/
      ui/             shadcn/ui primitives (do not edit manually)
      shared/         Reusable components (data-table, stat-card, status-badge, etc.)
      projects/       Project-specific components
      licenses/       License-specific components
      certs/          Cert-specific components
      dashboard/      Dashboard widgets
      layout/         App shell, sidebar, topbar, protected-route
    hooks/            React Query hooks (use-projects, use-licenses, use-certs)
    contexts/         Auth context provider
    lib/              API client (axios), utils, constants

chart/osa-suite/      Helm chart for Kubernetes deployment
```

## Running Locally

```bash
./dev.sh              # Starts backend (:5000) + frontend (:5173)
```

Login: `admin` / `admin`

## Building & Deploying

```bash
./build.sh            # Builds Docker containers
helm install osa ./chart/osa-suite --set secrets.fernetKey=... --set secrets.secretKey=...
```

## Development Commands

```bash
# Backend
cd backend && source .venv/bin/activate && python run.py

# Frontend
cd frontend && npm run dev          # Dev server
cd frontend && npm run build        # Production build (also runs tsc)
```

## Architecture Conventions

### Backend
- Flask blueprints: one per domain (auth, projects, licenses, certs, dashboard)
- All API routes prefixed with `/api/`
- All list endpoints return wrapped objects: `{"projects": [...]}`, `{"licenses": [...]}`, etc.
- Single-item endpoints return: `{"project": {...}}`, etc.
- `@login_required` decorator on all routes except POST /api/auth/login
- Models use SQLAlchemy portable types only (no SQLite-specific features) for Postgres compatibility
- Audit logging via `log_audit()` on all CRUD and export operations
- Cert private keys encrypted at rest with Fernet; cert PEM stored unencrypted (public data)
- License and cert status computed via hybrid properties, not stored columns

### Frontend
- React Query (TanStack Query) for all server state — no Redux/Zustand
- TanStack Table for all data tables via shared `DataTable` component
- shadcn/ui components in `components/ui/` — installed via CLI, do not hand-edit
- Hooks pattern: `use-projects.ts` exports `useProjects()`, `useCreateProject()`, etc.
- Axios client in `lib/api.ts` with `withCredentials: true` and 401 interceptor
- Vite proxies `/api` to backend in dev; nginx proxies in production
- Toast notifications (sonner) for all mutations
- Status badges color-coded: green (active/valid), amber (expiring_soon), red (expired), indigo (perpetual)

### Naming
- Backend: snake_case for Python, kebab-case for URL paths
- Frontend: PascalCase for components, camelCase for hooks/utils, kebab-case for filenames
- Database columns: snake_case, matching the JSON API field names exactly

## Key Design Decisions

- **SQLite now, Postgres later** — just change `DATABASE_URL`. All types are portable.
- **Single admin user for MVP** — `config.py` stores hashed password. Keycloak SSO planned.
- **Row-level filtering** — stubbed via `Project.for_user()`, returns all for now.
- **Cert encryption** — Fernet key persists to `.fernet_key` file in dev, env var in production. Changing the key makes existing encrypted data unrecoverable.
- **PKCS12 exported without passphrase** — explicit product decision.
- **Backend replicas must stay at 1** while using SQLite (no concurrent writes). Scale freely after Postgres migration.

## Stubs (Not Yet Implemented)

- `components/projects/keycloak-stub.tsx` — Keycloak user/group management
- `components/certs/aws-secrets-stub.tsx` — AWS Secrets Manager sync
- `Project.for_user()` in `backend/app/projects/models.py` — row-level access control

## Security Notes

- Never commit `.env`, `.fernet_key`, or `*.db` files
- `SECRET_KEY` uses random bytes in dev; must be set via env var in production for session persistence
- All error responses use generic messages; details logged server-side only
- File uploads validated by extension allowlist (licenses) and size limit (50MB global)
- Security headers set via `@app.after_request`: nosniff, frame deny, referrer policy
