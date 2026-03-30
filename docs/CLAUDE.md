# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ESE Companion v2 is a full-stack application for centrally managing multiple HiveMQ Enterprise Security Extension (ESE) databases. It pairs a Kotlin/Ktor backend with a React/Chakra UI frontend, deployed as a single Docker image.

## Tech Stack

### Backend
- **Language/Framework:** Kotlin with Ktor
- **ORM:** Exposed (Jetbrains)
- **Schema management:** `SchemaUtils.createMissingTablesAndColumns()` -- no Flyway, no migration files
- **Crypto:** BouncyCastle for 6 ESE hash algorithms, AES encryption for stored DB passwords
- **Database support:** PostgreSQL, MySQL, SQL Server (set via `ESE_COMPANION_DB_TYPE` with explicit dialect)
- **Build:** Gradle with Shadow plugin producing a fat JAR

### Frontend
- **Framework:** React 19
- **UI library:** Chakra UI 3
- **Routing:** TanStack Router (file-based)
- **Data fetching:** TanStack Query
- **Tables:** TanStack Table
- **Bundler:** Vite
- **Package manager:** pnpm

## Commands

### Backend (backend/)
```bash
cd backend && ./gradlew build          # Build + test
cd backend && ./gradlew test           # Run tests only
cd backend && ./gradlew run            # Start dev server (HTTP:8989, HTTPS:9090)
cd backend && ./gradlew shadowJar      # Build fat JAR (output: build/libs/*-all.jar)
```

### Frontend (frontend/)
```bash
cd frontend && pnpm install            # Install dependencies
cd frontend && pnpm dev                # Vite dev server with HMR
cd frontend && pnpm build              # Production build (outputs to dist/)
cd frontend && pnpm test               # Run tests
cd frontend && pnpm lint:check         # Biome lint check
cd frontend && pnpm lint:check:write   # Biome auto-fix
```

### Docker
```bash
docker compose up -d                   # Start companion DB + ESE DB for local dev
docker build -t ese-companion:v2 .     # Build production image (multi-stage)
```

The Dockerfile uses three stages:
1. `gradle:8-jdk21` -- backend build (`gradle shadowJar --no-daemon`)
2. `node:22-slim` -- frontend build (`corepack enable && pnpm install --frozen-lockfile && pnpm build`)
3. `eclipse-temurin:21-jre-alpine` -- runtime (ports 8989 HTTP, 9090 HTTPS)

## Environment Variables

### Required
| Variable | Description |
|---|---|
| `ESE_COMPANION_DB_TYPE` | `postgresql`, `mysql`, or `sqlserver` |
| `ESE_COMPANION_DB_HOST` | Database hostname |
| `ESE_COMPANION_DB_PORT` | Database port |
| `ESE_COMPANION_DB_NAME` | Database name |
| `ESE_COMPANION_DB_USER` | Database user |
| `ESE_COMPANION_DB_PASSWORD` | Database password |
| `ESE_COMPANION_JWT_SECRET` | JWT signing key (min 16 chars) |
| `ESE_COMPANION_ENCRYPTION_KEY` | AES key for stored DB passwords (min 16 chars) |

### Optional -- Server
| Variable | Default | Description |
|---|---|---|
| `ESE_COMPANION_HTTP_PORT` | `8989` | HTTP listen port |
| `ESE_COMPANION_HTTPS_PORT` | `9090` | HTTPS listen port |
| `ESE_COMPANION_HTTPS_JKS_PATH` | -- | Path to JKS keystore for HTTPS |
| `ESE_COMPANION_HTTPS_PASSWORD` | -- | JKS keystore password |
| `ESE_COMPANION_HTTPS_PK_PASSWORD` | -- | Private key password |

### Optional -- Admin Seed (first run)
| Variable | Default | Description |
|---|---|---|
| `ESE_COMPANION_ADMIN_USERNAME` | -- | Initial admin username |
| `ESE_COMPANION_ADMIN_PASSWORD` | -- | Initial admin password |
| `ESE_COMPANION_ADMIN_EMAIL` | -- | Initial admin email |

### Optional -- Connection Pool
| Variable | Default | Description |
|---|---|---|
| `ESE_COMPANION_POOL_MAX_PER_DB` | `10` | Max connections per ESE database |
| `ESE_COMPANION_POOL_MAX_TOTAL` | `50` | Max total connections across all ESE databases |
| `ESE_COMPANION_POOL_IDLE_TIMEOUT` | `10` | Idle connection timeout in minutes |
| `ESE_COMPANION_POOL_ACQUIRE_TIMEOUT` | `5` | Connection acquire timeout in seconds |

### Optional -- Operational
| Variable | Default | Description |
|---|---|---|
| `ESE_COMPANION_HEALTH_CHECK_INTERVAL` | `60` | Health check interval in seconds |
| `ESE_COMPANION_AUDIT_RETENTION_DAYS` | `90` | Days to retain audit log entries |
| `ESE_COMPANION_RATE_LIMIT` | `500` | Rate limit (requests per minute) |
| `ESE_COMPANION_CORS_ORIGINS` | -- | Comma-separated list of allowed CORS origins |
| `ESE_COMPANION_MAX_REQUEST_SIZE` | `1MB` | Maximum request body size (supports KB, MB, GB suffixes) |

## Architecture

### Backend (Kotlin/Ktor)
**`backend/src/main/kotlin/com/hivemq/companion/`**
- `Application.kt` -- Entry point, startup sequence, route registration
- `config/AppConfig.kt` -- All env var loading with defaults
- `auth/` -- JWT service, auth middleware (JWT + API key), brute force protection
- `service/` -- UserService, ConnectionService, ApiKeyService, AuditLogService, HealthCheckService
- `routes/` -- REST routes for users, connections, API keys, audit logs, dashboard
- `ese/` -- ESE database integration: tables, service, routes, dynamic connection pool manager
- `crypto/` -- CryptoService (6 ESE hash algorithms: PLAIN, SHA512, BCRYPT, PKCS5S2, SHA512_SALTED, ARGON2ID), AES encryption for stored passwords
- `db/` -- CompanionDatabase, Exposed table definitions (schema auto-created via SchemaUtils)
- `plugins/` -- Security (rate limiting, CORS, headers), HTTPS, OpenAPI

### Frontend (React/Chakra UI)
**`frontend/src/`**
- `routes/` -- TanStack Router file-based routes (login, dashboard, connections, admin, settings)
- `components/` -- Reusable UI: Sidebar, HealthDot, ConnectionCard, ESE tables/drawers, admin drawers
- `api/` -- Typed API client modules for all endpoints
- `auth/` -- AuthContext, useAuth hook, JWT token management

### Key Patterns
- ESE routes scoped by `:connId` and `:domain` (mqtt/cc/rest-api)
- Drawers for all create/edit forms (including role/permission assignment)
- Modals used only for delete/action confirmations
- Yellow color palette throughout the UI
- Toast notifications for user feedback
- Expandable table rows for detail views
- App-level roles: admin, readwrite, readonly (no per-connection scoping)
- API keys: scoped + expiring, inherit owner's role
- All timestamps UTC, ISO 8601
- API versioned at /api/v1/
