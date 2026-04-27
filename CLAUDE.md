# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ESE Companion v2 is a full-stack application for centrally managing multiple HiveMQ Enterprise Security Extension (ESE) databases. It pairs a Kotlin/Ktor backend with a React/Chakra UI frontend, deployed as a single Docker image.

## Tech Stack

### Backend
- **Language/Framework:** Kotlin 2.1 with Ktor 3.1
- **ORM:** Exposed 0.58 (Jetbrains) — schema auto-created via `SchemaUtils.createMissingTablesAndColumns()`, no Flyway or migration files
- **Crypto:** BouncyCastle for 6 ESE hash algorithms, AES encryption for stored DB passwords
- **Database support:** PostgreSQL, MySQL, SQL Server (set via `ESE_COMPANION_DB_TYPE`)
- **Build:** Gradle 8 with Shadow plugin producing a fat JAR; JDK 21 required
- **API docs:** Kompendium (OpenAPI/Swagger) at `/api/v1/docs`

### Frontend
- **Framework:** React 19 with Chakra UI 3
- **Routing:** TanStack Router (file-based, auto-generated `routeTree.gen.ts`)
- **Data fetching:** TanStack Query
- **Tables:** TanStack Table
- **Bundler:** Vite 8; **Package manager:** pnpm; **Linter:** Biome
- **Node:** 22+ required

## Commands

### Backend (run from `backend/`)
```bash
./gradlew build                    # Build + test
./gradlew test                     # Run all tests (H2 in-memory DB)
./gradlew test --tests "*.CryptoServiceTest"  # Run a single test class
./gradlew run                      # Start dev server (HTTP:8989, HTTPS:9090)
./gradlew shadowJar                # Build fat JAR (output: build/libs/*-all.jar)
```

### Frontend (run from `frontend/`)
```bash
pnpm install                       # Install dependencies
pnpm dev                           # Vite dev server with HMR (port 5173, proxies /api to :8989)
pnpm build                         # Production build (outputs to dist/)
pnpm test                          # Run all tests (vitest)
pnpm test -- src/api/__tests__/connections.test.ts  # Run a single test file
pnpm lint:check                    # Biome lint check
pnpm lint:check:write              # Biome auto-fix
```

### Local Dev Environment
```bash
docker compose up -d               # Start companion-db (PostgreSQL:5432) + ESE test DBs (PG:5433, MySQL:3306, MSSQL:1433)
cd backend && ./gradlew run        # Terminal 1
cd frontend && pnpm dev            # Terminal 2 — open http://localhost:5173, login: admin/admin
```

### Docker
```bash
docker build -t ese-companion:v2 . # Build production image (3-stage: gradle→node→temurin-alpine)
```

## Architecture

### Backend (`backend/src/main/kotlin/com/hivemq/companion/`)
- `Application.kt` — Entry point, startup sequence, route registration
- `config/AppConfig.kt` — All env var loading with defaults and validation
- `auth/` — JWT service, auth middleware (JWT + API key dual-auth), brute force protection
- `service/` — UserService, ConnectionService, ApiKeyService, AuditLogService, HealthCheckService
- `routes/` — REST routes versioned at `/api/v1/` for users, connections, API keys, audit logs, dashboard
- `ese/` — ESE database integration: Exposed table definitions, EseService, ESE routes, dynamic connection pool manager (HikariCP)
- `crypto/` — CryptoService (PLAIN, SHA512, BCRYPT, PKCS5S2, SHA512_SALTED, ARGON2ID), AES encryption for stored passwords
- `db/` — CompanionDatabase, Exposed table definitions (schema auto-created, no migrations)
- `plugins/` — Security (rate limiting, CORS, headers), HTTPS, OpenAPI/Kompendium

### Frontend (`frontend/src/`)
- `routes/` — TanStack Router file-based routes (login, dashboard, connections, admin, settings)
- `components/` — Reusable UI: Sidebar, HealthDot, ConnectionCard, ESE tables/drawers, admin drawers
- `api/` — Typed API client modules for all endpoints
- `auth/` — AuthContext, useAuth hook, JWT token management

### Key Patterns
- ESE routes scoped by `:connId` (connection ID) and `:domain` (mqtt, cc, rest-api)
- Drawers for all create/edit forms; modals only for delete/action confirmations
- App-level roles: admin, readwrite, readonly (no per-connection scoping)
- API keys: scoped + expiring, inherit owner's role
- All timestamps UTC, ISO 8601
- Backend tests use H2 in-memory database via Ktor test host
- Frontend dev server proxies `/api` requests to backend at `localhost:8989`

### Reference Schemas
`references/` contains the ESE database schemas for PostgreSQL, MySQL, and SQL Server — these define the tables the app manages in external ESE databases.

## Environment Variables

### Required
| Variable | Description |
|---|---|
| `ESE_COMPANION_DB_TYPE` | `postgresql`, `mysql`, or `sqlserver` |
| `ESE_COMPANION_DB_HOST` | Companion database hostname |
| `ESE_COMPANION_DB_PORT` | Companion database port |
| `ESE_COMPANION_DB_NAME` | Companion database name |
| `ESE_COMPANION_DB_USER` | Companion database user |
| `ESE_COMPANION_DB_PASSWORD` | Companion database password |
| `ESE_COMPANION_JWT_SECRET` | JWT signing key (min 16 chars) |
| `ESE_COMPANION_ENCRYPTION_KEY` | AES key for stored DB passwords (min 16 chars) |

### Optional (with defaults)
| Variable | Default | Description |
|---|---|---|
| `ESE_COMPANION_HTTP_PORT` | `8989` | HTTP listen port |
| `ESE_COMPANION_ADMIN_USERNAME` | — | Initial admin user (first run only) |
| `ESE_COMPANION_ADMIN_PASSWORD` | — | Initial admin password |
| `ESE_COMPANION_ADMIN_EMAIL` | — | Initial admin email |
| `ESE_COMPANION_POOL_MAX_PER_DB` | `10` | Max connections per ESE database |
| `ESE_COMPANION_POOL_MAX_TOTAL` | `50` | Max total connections across all ESE databases |
| `ESE_COMPANION_HEALTH_CHECK_INTERVAL` | `60` | Health check interval (seconds) |
| `ESE_COMPANION_AUDIT_RETENTION_DAYS` | `90` | Audit log retention (days) |
| `ESE_COMPANION_RATE_LIMIT` | `500` | Rate limit (requests/minute) |

## CI/CD

GitHub Actions (`.github/workflows/release.yml`) triggers on `v*` tags:
1. Runs backend tests (`./gradlew test`) and frontend tests (`pnpm test`)
2. Builds multi-platform Docker image (amd64 + arm64) and pushes to Docker Hub
3. Creates a GitHub Release

## Deployment

Helm chart in `helm/ese-companion/` for Kubernetes deployment. See `helm/ese-companion/values.yaml` for all configuration options.
