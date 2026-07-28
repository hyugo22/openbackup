# OpenBackup

[![CI](https://github.com/hyugo22/openbackup/actions/workflows/ci.yml/badge.svg)](https://github.com/hyugo22/openbackup/actions/workflows/ci.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)

Open source web application for managing backups: create and track backup
jobs, with execution history.

> **Project status**: MVP. Authentication, job management and execution
> history are functional. Automatic scheduling (cron), notifications, cloud
> storage and backup encryption will be added in future versions.

## About this project

OpenBackup is largely **vibe-coded**: most of the code was generated with
AI assistance ([Claude Code](https://claude.com/claude-code)), under human
direction and review at each step (architecture decisions, code review,
and manual verification that build/lint/tests/Docker all actually work).
This is disclosed here for transparency. If you plan to run OpenBackup in
production or with sensitive data, please read the code yourself and
consider an independent review first — see [Security](#security) below.

## Tech stack

- **Frontend**: React + TypeScript, Vite
- **Backend**: Node.js + TypeScript, Express
- **Database**: PostgreSQL, using the [`pg`](https://node-postgres.com/)
  driver (hand-written parameterized SQL queries, no ORM), versioned
  migrations via [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate)
- **Monorepo**: `npm workspaces` (`frontend/`, `backend/`), no additional
  monorepo tooling

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [PostgreSQL](https://www.postgresql.org/) 14+ (unless you use Docker)
- [Docker](https://www.docker.com/) and Docker Compose (optional, for the containerized mode)

## Installation and startup

Three startup modes are supported.

### 1. Docker (recommended for a quick start)

```bash
git clone https://github.com/hyugo22/openbackup.git
cd openbackup
cp .env.example .env
# Edit .env and set at least JWT_SECRET (a strong random value)
docker compose up
```

The application (frontend + backend + PostgreSQL) is available at
`http://localhost:3001`. PostgreSQL data is persisted in a named Docker
volume.

### 2. Linux service (systemd)

See [`deploy/openbackup.service`](deploy/openbackup.service) for a full,
commented systemd unit example (installation, build, migrations, enabling
the service). PostgreSQL must be reachable (local or remote) via
`DATABASE_URL`.

### 3. Windows (native or as a service)

See [`deploy/windows-service.md`](deploy/windows-service.md): native
startup with Node.js installed, and optional registration as a Windows
service via [NSSM](https://nssm.cc/). PostgreSQL must also be reachable via
`DATABASE_URL`.

### Local development (without Docker)

```bash
npm install
cp .env.example .env
# DATABASE_URL must point to a local or remote PostgreSQL instance
npm run migrate:up
npm run dev
```

`npm run dev` starts the backend (`http://localhost:3001`) and the frontend
(`http://localhost:5173`) simultaneously, with hot reload.

## Environment variables

See [`.env.example`](.env.example) for the full file to copy to `.env`.

| Variable       | Description                                                    |
| -------------- | ---------------------------------------------------------------- |
| `PORT`         | Backend listening port (default: `3001`)                       |
| `DATABASE_URL` | PostgreSQL connection URL (`postgresql://user:pass@host:port/db`) |
| `JWT_SECRET`   | Secret used to sign session JWTs. Generate a random value.      |
| `CORS_ORIGIN`  | Origin allowed to call the API (frontend URL)                   |
| `NODE_ENV`     | `development`, `production` or `test`                           |
| `VITE_API_URL` | API URL used by the frontend (empty = relative paths)           |

## Project structure

```
openbackup/
├── frontend/             # React + TypeScript (Vite)
│   └── src/
│       ├── pages/          # Screens: login, jobs, history
│       ├── components/     # Shared components (layout, protected route)
│       ├── context/         # Authentication context
│       └── api/             # Typed HTTP client for the backend
├── backend/               # Node.js + TypeScript (Express)
│   ├── src/
│   │   ├── routes/           # Express routes (auth, jobs)
│   │   ├── db/                # Parameterized SQL queries (pg)
│   │   ├── services/          # Business logic (hashing, JWT)
│   │   ├── middleware/         # Auth, error handling
│   │   └── validation/         # Zod schemas
│   ├── migrations/          # Versioned SQL migrations (node-pg-migrate)
│   └── tests/               # Unit tests (vitest)
├── deploy/                # Deployment examples (systemd, Windows)
├── .github/workflows/     # CI pipeline (GitHub Actions)
├── Dockerfile              # Multi-stage build (backend + frontend)
└── docker-compose.yml      # App + PostgreSQL in a single command
```

## Tests and quality

```bash
npm run lint    # ESLint (frontend + backend)
npm run test    # Backend unit tests (vitest)
npm run build   # Verifies TypeScript compiles (frontend + backend)
```

TypeScript is configured in strict mode on both workspaces. User input is
systematically validated on the backend with Zod, and passwords are hashed
with bcrypt before storage.

## CI/CD

The [GitHub Actions](.github/workflows/ci.yml) pipeline runs, in order:
`build` (TypeScript compilation) → `test` (lint + unit tests) → `docker`
(image build) → `push` (publish to GHCR, only on `main` or on a tag).

## Security

### Current measures

- **Input validation**: all API input is validated with [Zod](https://zod.dev/) on the backend; nothing from the client is trusted as-is.
- **SQL injection**: no ORM — all queries are hand-written, parameterized SQL via [`pg`](https://node-postgres.com/) (no string concatenation of user input into SQL).
- **Passwords**: hashed with bcrypt (12 rounds) before storage, never logged.
- **Sessions**: JWT stored in an `httpOnly`, `SameSite=Lax` cookie (not readable from JavaScript, mitigating XSS-based token theft), `secure` in production.
- **HTTP headers**: [helmet.js](https://helmetjs.github.io/) sets standard security headers on every response.
- **CORS**: restricted to the configured frontend origin (`CORS_ORIGIN`), not wide open.
- **Rate limiting**: login/register endpoints are throttled ([`express-rate-limit`](https://github.com/express-rate-limit/express-rate-limit)) to slow down brute-force attempts.
- **Error handling**: stack traces and internal error details are never sent to the client in production.
- **Dependency scanning**: [Dependabot](.github/dependabot.yml) opens weekly update PRs for npm, Docker base images and GitHub Actions; `npm audit` also runs in CI (see [`ci.yml`](.github/workflows/ci.yml)) and is currently informational (`continue-on-error`) while a couple of dev-tooling-only findings are tracked.

### Planned / roadmap

These are **not implemented yet** — listed here so expectations are clear:

- Making the CI `npm audit` step blocking once the remaining dev-only findings are resolved.
- Static analysis / SAST (e.g. [CodeQL](https://codeql.github.com/)) wired into CI.
- Container image vulnerability scanning (e.g. Trivy) for the published Docker image.
- A `SECURITY.md` with a responsible-disclosure process for reporting vulnerabilities.
- An independent security review before recommending production use with sensitive data.

If you find a security issue, please open an issue (or, once available, follow `SECURITY.md`) rather than a public pull request describing the exploit.

## Personal data (GDPR)

OpenBackup collects the minimum data required for it to work:

- **Account**: email address and password (hashed, never stored or logged
  in plaintext).
- **Backup jobs**: job name and source/destination paths that you
  configure.
- **Execution history**: status, dates, size and basic logs of backup
  executions.

None of this data is shared with third parties, and no third-party
analytics/tracking tool is integrated. You can permanently delete your
account and all associated data from the application (the "Account"
section on the jobs page).

## Contributing

Contributions are welcome. Before opening a pull request:

1. Open an issue to discuss the intended change.
2. Make sure `npm run lint`, `npm run test` and `npm run build` pass.
3. Keep changes concise and aligned with the spirit of the project: no
   over-engineering, no unjustified dependency.

## License

Distributed under the [AGPLv3](LICENSE) license.
