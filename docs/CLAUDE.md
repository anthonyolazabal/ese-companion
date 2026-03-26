# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ESE Companion v2 is a full-stack application for centrally managing multiple HiveMQ Enterprise Security Extension (ESE) databases. Kotlin/Ktor backend with React/Chakra UI frontend, deployed as a single Docker image.

## Commands

### Backend (backend/)
```bash
cd backend && ./gradlew build          # Build + test
cd backend && ./gradlew test           # Run tests only
cd backend && ./gradlew run            # Start dev server (HTTP:8989, HTTPS:9090)
cd backend && ./gradlew shadowJar      # Build fat JAR
```

### Frontend (frontend/)
```bash
cd frontend && pnpm install            # Install dependencies
cd frontend && pnpm dev                # Vite dev server with HMR
cd frontend && pnpm build              # Production build (outputs to dist/)
cd frontend && pnpm lint:check         # Biome lint check
cd frontend && pnpm lint:check:write   # Biome auto-fix
```

### Docker
```bash
docker compose up -d                   # Start companion DB + ESE DB for local dev
docker build -t ese-companion:v2 .     # Build production image
```

### Environment Variables (Required)
- `ESE_COMPANION_DB_TYPE` — postgresql, mysql, or sqlserver
- `ESE_COMPANION_DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `ESE_COMPANION_JWT_SECRET` — JWT signing key
- `ESE_COMPANION_ENCRYPTION_KEY` — AES key for stored DB passwords
- `ESE_COMPANION_ADMIN_USER`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` — initial admin (first run)

## Architecture

### Backend (Kotlin/Ktor)
- **`backend/src/main/kotlin/com/hivemq/companion/`**
  - `Application.kt` — Entry point, startup sequence, route registration
  - `config/AppConfig.kt` — All env var loading with defaults
  - `auth/` — JWT service, auth middleware (JWT + API key), brute force protection
  - `service/` — UserService, ConnectionService, ApiKeyService, AuditLogService, HealthCheckService
  - `routes/` — REST routes for users, connections, API keys, audit logs, dashboard
  - `ese/` — ESE database integration: tables, service, routes, dynamic connection pool manager
  - `crypto/` — CryptoService (6 ESE hash algorithms), AES encryption for stored passwords
  - `db/` — CompanionDatabase, Exposed table definitions, Flyway migrations
  - `plugins/` — Security (rate limiting, CORS, headers), HTTPS, OpenAPI

### Frontend (React/Chakra UI)
- **`frontend/src/`**
  - `routes/` — TanStack Router file-based routes (login, dashboard, connections, admin, settings)
  - `components/` — Reusable UI: Sidebar, HealthDot, ConnectionCard, ESE tables/drawers, admin drawers
  - `api/` — Typed API client modules for all endpoints
  - `auth/` — AuthContext, useAuth hook, JWT token management

### Key Patterns
- ESE routes scoped by `:connId` and `:domain` (mqtt/cc/rest-api)
- Drawers for all create/edit forms, Modals only for delete confirmations
- App-level roles: admin, readwrite, readonly (no per-connection scoping)
- API keys: scoped + expiring, inherit owner's role
- All timestamps UTC, ISO 8601
- API versioned at /api/v1/
