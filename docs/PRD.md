# ESE Companion v2 — Product Requirements Document

## Overview

ESE Companion v2 is a complete rewrite of the HiveMQ Enterprise Security Extension (ESE) database management tool. It replaces the Node.js/Vue.js v1 application with a Kotlin (Ktor) backend and React (Chakra UI) frontend, adding multi-database management, local user management, API key access, and audit logging.

The application is a single deployable monolith — Ktor serves both the REST API and the React SPA as static files from a single Docker image.

## Goals

- Centrally manage multiple HiveMQ ESE databases from a single UI
- Support PostgreSQL, MySQL, and SQL Server ESE databases out of the box
- Provide a dedicated companion database for users, connections, API keys, and audit logs
- Expose a fully documented REST API with OpenAPI spec and API key authentication
- Deploy easily on Kubernetes via Helm chart

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Kotlin, Ktor, Exposed ORM |
| Frontend | React 19, Chakra UI 3, TanStack Router/Query/Table |
| Crypto | BouncyCastle (JVM) |
| Build | Gradle (backend), Vite + pnpm (frontend) |
| OpenAPI | Code-first via Kompendium (Ktor plugin) |
| Container | Docker multi-stage build |
| Orchestration | Helm chart for Kubernetes |
| Runtime | JDK 21 (eclipse-temurin) |

## Starting Points

- **Frontend**: based on the `hivemq-template-ui` React template (React 19 + Chakra UI 3 + TanStack Router/Query/Table + Vite)
- **Crypto**: Kotlin reimplementation of `hivemq-ese-helper` BouncyCastle algorithms (no external JAR dependency)
- **ESE schemas**: reference SQL scripts in `references/` folder (MySQL, PostgreSQL, SQL Server DDL + default inserts)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Ktor Application                      │
│                                                         │
│  ┌──────────────┐  ┌────────────────────────────────┐   │
│  │ Static Files  │  │         API Routes             │   │
│  │ (React SPA)   │  │                                │   │
│  │ GET /*         │  │  /api/v1/auth/*    (login, token)│  │
│  └──────────────┘  │  /api/v1/users/*    (companion)  │  │
│                     │  /api/v1/keys/*     (API keys)   │  │
│                     │  /api/v1/connections/* (DB conns)│  │
│                     │  /api/v1/ese/:connId/* (ESE CRUD)│  │
│                     │  /api/v1/openapi.json            │  │
│                     │  /api/v1/docs      (Swagger UI)  │  │
│                     └────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Service Layer                        │   │
│  │  AuthService │ UserService │ ConnectionService    │   │
│  │  ApiKeyService │ EseService │ CryptoService       │   │
│  │  HealthCheckService │ AuditLogService             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Data Access (Exposed ORM)              │   │
│  │                                                   │   │
│  │  Companion DB Pool          ESE DB Pools          │   │
│  │  (always active)       (lazy, per connection)     │   │
│  │       │                   │       │       │       │   │
│  └───────┼───────────────────┼───────┼───────┼───────┘   │
└──────────┼───────────────────┼───────┼───────┼───────────┘
           │                   │       │       │
           ▼                   ▼       ▼       ▼
    ┌────────────┐      ┌─────┐ ┌─────┐ ┌──────────┐
    │ Companion  │      │ ESE │ │ ESE │ │   ESE    │
    │     DB     │      │ PG  │ │MySQL│ │SQL Server│
    └────────────┘      └─────┘ └─────┘ └──────────┘
```

- Single Ktor process serves React static files and the API
- Exposed ORM handles both the companion DB and ESE databases
- ESE routes are scoped by `:connId` — the connection ID determines which dynamic pool to use
- CryptoService implements all 6 BouncyCastle algorithms natively in Kotlin
- HealthCheckService runs periodic pings on configured ESE connections
- Auth middleware validates JWT tokens or API keys on every protected route

### Connection Pool Management

- **Companion DB**: always-active connection pool, established at startup
- **ESE databases**: lazy/dynamic pools created on first access, evicted after idle timeout
- Pools are created per connection configuration and cached
- Idle eviction keeps resource usage proportional to actual usage

**Pool defaults (all configurable via env vars):**

| Setting | Default | Env Var |
|---|---|---|
| Max connections per ESE pool | 10 | `ESE_COMPANION_POOL_MAX_PER_DB` |
| Max total ESE connections | 50 | `ESE_COMPANION_POOL_MAX_TOTAL` |
| Idle timeout before eviction | 10 minutes | `ESE_COMPANION_POOL_IDLE_TIMEOUT` |
| Connection acquire timeout | 5 seconds | `ESE_COMPANION_POOL_ACQUIRE_TIMEOUT` |

### Health Checks

- Periodic health check scheduler pings all configured ESE connections
- Health status stored in `database_connections.health_status`: `HEALTHY`, `UNREACHABLE`, `UNKNOWN`
- Live status visible in dashboard and connection lists
- Manual "test connection" also available via API
- **Check interval**: every 60 seconds (configurable via `ESE_COMPANION_HEALTH_CHECK_INTERVAL`)
- **Check timeout**: 5 seconds per connection

---

## 2. Companion Database

### Configuration

The companion database is configured exclusively via environment variables. It supports PostgreSQL, MySQL, and SQL Server — the same engines supported for ESE databases.

### Schema

#### companion_users

| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| username | VARCHAR, unique | |
| email | VARCHAR | |
| password_hash | VARCHAR | BCrypt hashed (companion auth only) |
| role | ENUM | `admin`, `readwrite`, `readonly` |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### database_connections

| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| name | VARCHAR, unique | Display name |
| description | TEXT, nullable | |
| db_type | ENUM | `POSTGRESQL`, `MYSQL`, `SQLSERVER` |
| host | VARCHAR | |
| port | INTEGER | |
| database_name | VARCHAR | |
| username | VARCHAR | |
| password | VARCHAR | AES-encrypted at rest (key from env var) |
| ssl_enabled | BOOLEAN | |
| connection_params | JSON, nullable | Extra JDBC params |
| health_status | ENUM | `HEALTHY`, `UNREACHABLE`, `UNKNOWN` |
| last_health_check | TIMESTAMP, nullable | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### App-Level Roles

| Role | ESE Entities | Manage Connections | Manage Users | Audit Logs | API Keys |
|---|---|---|---|---|---|
| `admin` | full CRUD | yes | yes | yes | own keys |
| `readwrite` | full CRUD on all connections | no | no | no | own keys |
| `readonly` | read only on all connections | no | no | no | own keys |

Roles are global — they apply across all configured ESE database connections. There is no per-connection role scoping.

#### api_keys

| Column | Type | Notes |
|---|---|---|
| id | UUID, PK | |
| user_id | UUID, FK → companion_users | Owner |
| name | VARCHAR | Human-readable label |
| key_hash | VARCHAR | BCrypt hash of the raw key |
| key_prefix | CHAR(8) | First 8 chars for identification (e.g., `esc_a3f8`) |
| scopes | JSON | Allowed operations: `["ese:read", "ese:write", "ese:admin"]` |
| expires_at | TIMESTAMP | Mandatory expiration |
| last_used_at | TIMESTAMP, nullable | |
| created_at | TIMESTAMP | |

- Raw key shown once at creation, only hash stored
- API key inherits the owning user's role (`admin`, `readwrite`, `readonly`)
- Scopes can further restrict below the user's role (e.g., a `readwrite` user can create a key with `["ese:read"]` only)
- Expired keys are rejected at auth middleware level

#### audit_logs

| Column | Type | Notes |
|---|---|---|
| id | BIGINT, PK, auto-increment | |
| timestamp | TIMESTAMP | |
| actor_type | ENUM | `user`, `api_key` |
| actor_id | UUID | |
| actor_name | VARCHAR | Denormalized for readability after deletion |
| connection_id | UUID, FK, nullable | Null for companion-level actions |
| connection_name | VARCHAR, nullable | Denormalized |
| domain | ENUM | `mqtt`, `cc`, `rest_api`, `companion` |
| action | ENUM | `create`, `read`, `update`, `delete` |
| resource_type | VARCHAR | e.g., `user`, `role`, `permission`, `connection` |
| resource_id | VARCHAR | |
| resource_name | VARCHAR, nullable | |
| details | JSON, nullable | Contextual data (never contains secrets) |
| ip_address | VARCHAR | |
| user_agent | VARCHAR | |

- Append-only table — no updates or deletes via the application
- `read` actions logged only for sensitive operations (e.g., viewing connection passwords), not routine list/detail views
- `domain=companion` for companion-level actions (login, user management, API key CRUD, connection CRUD)
- **Retention**: automatic cleanup of logs older than 90 days (configurable via `ESE_COMPANION_AUDIT_RETENTION_DAYS`). Cleanup runs daily.

### Schema Migrations

Managed automatically at startup via Flyway or Exposed's built-in migration support. The companion database schema is created/updated before the application starts accepting requests.

### Initial Admin Seeding

On first startup, if the `companion_users` table is empty, an admin account is created from `ESE_COMPANION_ADMIN_USER`, `ESE_COMPANION_ADMIN_PASSWORD`, and `ESE_COMPANION_ADMIN_EMAIL` environment variables.

---

## 3. Authentication & Authorization

### Authentication Methods

1. **JWT tokens** — for UI sessions. Obtained via `POST /api/v1/auth/login`. Access token: 60 minutes, refresh token: 7 days. Single session enforced (new login invalidates previous session).
2. **API keys** — for programmatic access. Passed via `X-API-Key` header. Scoped by operation type with mandatory expiration. Keys inherit the owning user's role.

### Authorization Model

**App-level roles** (global, not per-connection):

| Role | ESE Entities | Manage Connections | Manage Users | Audit Logs | API Keys |
|---|---|---|---|---|---|
| `admin` | full CRUD | yes | yes | yes | own keys |
| `readwrite` | full CRUD on all connections | no | no | no | own keys |
| `readonly` | read only on all connections | no | no | no | own keys |

- Auth middleware checks the user's role on every request
- API keys inherit the owning user's role, further restricted by key scopes
- Audit logs are admin-only — non-admin users cannot access `/api/v1/audit-logs`

### API Security

#### Rate Limiting

- Global rate limiter on all API endpoints (configurable via `ESE_COMPANION_RATE_LIMIT`, default: 100 requests/minute per IP)
- Stricter rate limit on authentication endpoints (`/api/v1/auth/login`): 10 attempts/minute per IP
- Returns `429 Too Many Requests` with `Retry-After` header when exceeded

#### Brute Force Login Protection

- After 5 consecutive failed login attempts for a given username, the account is temporarily locked for 15 minutes
- Lock duration increases exponentially on repeated lockouts (15min, 30min, 60min max — capped, never permanent)
- Lockout state stored in companion database
- Admin can manually unlock accounts via `PUT /api/v1/users/:userId` (reset lockout)
- Failed attempts logged in audit log

#### JWT Token Lifecycle

- Access token expiry: **60 minutes**
- Refresh token expiry: **7 days**
- **Single session enforced** — new login invalidates the previous session's tokens
- On logout (`POST /api/v1/auth/logout`), the token is added to a revocation list
- On password change, all existing tokens for that user are revoked
- Revocation list stored in companion database, cleaned up hourly (expired tokens removed)
- Auth middleware checks revocation list on every request

#### CORS Configuration

- Configurable via `ESE_COMPANION_CORS_ORIGINS` environment variable
- Default: same-origin only (no cross-origin requests allowed)
- Supports comma-separated list of allowed origins (e.g., `https://admin.example.com,https://internal.example.com`)
- Set to `*` to allow all origins (not recommended for production)

#### Security Headers

Ktor configured to send security headers on all responses:
- `Content-Security-Policy` — restricts resource loading to same origin
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Strict-Transport-Security` — enforces HTTPS (when HTTPS is enabled)
- `X-XSS-Protection: 0` — defers to CSP (modern best practice)
- `Referrer-Policy: strict-origin-when-cross-origin`

#### Request Size Limits

- Maximum request body size: 1 MB (configurable via `ESE_COMPANION_MAX_REQUEST_SIZE`)
- Returns `413 Payload Too Large` when exceeded
- Prevents denial-of-service via oversized payloads

#### CSRF Protection

- API uses JWT in `Authorization` header (not cookies), so CSRF is not applicable for API requests
- Any cookies used (e.g., refresh token) use `SameSite=Strict` attribute

#### Password Reset

- Admin-only reset — only admins can reset another user's password via `PUT /api/v1/users/:userId`
- No self-service password reset (no email dependency)
- Password change by the user themselves via `/settings` page (requires current password)

---

## 4. API Routes

### Authentication

```
POST   /api/v1/auth/login                    # username/password → JWT
POST   /api/v1/auth/refresh                  # refresh JWT token
POST   /api/v1/auth/logout                   # invalidate token
```

### Companion Users (admin only)

```
GET    /api/v1/users                          # list users
GET    /api/v1/users/:userId                  # get user details
POST   /api/v1/users                          # create user
PUT    /api/v1/users/:userId                  # update user
DELETE /api/v1/users/:userId                  # delete user
```

### API Keys (own keys, or admin manages all)

```
GET    /api/v1/keys                           # list own API keys (admin: all)
POST   /api/v1/keys                           # create key → returns raw key once
GET    /api/v1/keys/:keyId                    # get key metadata
PUT    /api/v1/keys/:keyId                    # update name/scopes/expiry
DELETE /api/v1/keys/:keyId                    # revoke key
```

### Database Connections (admin only)

```
GET    /api/v1/connections                    # list all connections
POST   /api/v1/connections                    # add connection
GET    /api/v1/connections/:connId            # get connection details
PUT    /api/v1/connections/:connId            # update connection
DELETE /api/v1/connections/:connId            # delete connection
POST   /api/v1/connections/:connId/test       # test connectivity
GET    /api/v1/connections/:connId/health     # current health status
```

### ESE Management (scoped by connection)

All three domains (MQTT, Control Center, REST API) follow the same CRUD pattern. The domain segment selects which tables to query on the target ESE database.

#### MQTT Domain

```
GET    /api/v1/ese/:connId/mqtt/users                              # list users
GET    /api/v1/ese/:connId/mqtt/users/:id                          # get user (with roles/permissions)
POST   /api/v1/ese/:connId/mqtt/users                              # create user (hashes password)
PUT    /api/v1/ese/:connId/mqtt/users/:id                          # update user
DELETE /api/v1/ese/:connId/mqtt/users/:id                          # delete user

GET    /api/v1/ese/:connId/mqtt/roles                              # list roles
POST   /api/v1/ese/:connId/mqtt/roles                              # create role
PUT    /api/v1/ese/:connId/mqtt/roles/:id                          # update role
DELETE /api/v1/ese/:connId/mqtt/roles/:id                          # delete role

GET    /api/v1/ese/:connId/mqtt/permissions                        # list permissions
POST   /api/v1/ese/:connId/mqtt/permissions                        # create permission
PUT    /api/v1/ese/:connId/mqtt/permissions/:id                    # update permission
DELETE /api/v1/ese/:connId/mqtt/permissions/:id                    # delete permission

POST   /api/v1/ese/:connId/mqtt/users/:id/roles/:roleId           # assign role to user
DELETE /api/v1/ese/:connId/mqtt/users/:id/roles/:roleId           # revoke role from user
POST   /api/v1/ese/:connId/mqtt/users/:id/permissions/:permId     # assign direct permission
DELETE /api/v1/ese/:connId/mqtt/users/:id/permissions/:permId     # revoke direct permission
POST   /api/v1/ese/:connId/mqtt/roles/:id/permissions/:permId     # assign permission to role
DELETE /api/v1/ese/:connId/mqtt/roles/:id/permissions/:permId     # revoke permission from role
```

#### Control Center Domain

Same pattern as MQTT at `/api/v1/ese/:connId/cc/...`

CC permissions use `permission_string` + `description` fields (not topic-based).

#### REST API Domain

Same pattern as MQTT at `/api/v1/ese/:connId/rest-api/...`

REST API permissions use `permission_string` + `description` fields (not topic-based).

### Dashboard & Analytics

```
GET    /api/v1/dashboard                      # all connections summary + health
GET    /api/v1/ese/:connId/stats              # per-connection entity counts per domain
                                           #   (user/role/permission counts for MQTT, CC, REST API)
```

### Audit Logs

```
GET    /api/v1/audit-logs                     # filterable by actor, connection,
                                           #   domain, action, date range
                                           # admin only
GET    /api/v1/audit-logs/:logId              # single entry with full details
                                           # admin only
```

### Health & OpenAPI

```
GET    /health/live                         # liveness probe
GET    /health/ready                        # readiness probe (companion DB connected)
GET    /api/v1/openapi.json                    # auto-generated OpenAPI spec
GET    /api/v1/docs                            # Swagger UI
```

### API Conventions

- **Versioning**: all routes prefixed with `/api/v1/`. Future breaking changes will use `/api/v2/`, etc.
- **Pagination**: `?page=1&size=20` query params on all list endpoints
- **Search/filter**: `?search=term` — case-insensitive substring match on user/role/permission lists
- **Auth**: JWT via `Authorization: Bearer <token>` or API key via `X-API-Key: <key>`
- **Timestamps**: all timestamps stored and returned as UTC (ISO 8601 format). Frontend converts to user's browser locale for display.
- MQTT permissions have topic-specific fields (topic, publish_allowed, subscribe_allowed, qos_0/1/2_allowed, retained_msgs_allowed, shared_sub_allowed, shared_group)
- CC and REST API permissions have `permission_string` and `description` fields

---

## 5. Frontend

### Tech Stack

Based on the `hivemq-template-ui` React template:
- React 19, TypeScript
- Chakra UI 3 (with HiveMQ theme)
- TanStack Router (file-based routing, type-safe)
- TanStack Query (data fetching, caching, invalidation)
- TanStack Table (sortable, filterable, paginated tables)
- Vite + pnpm
- Biome for linting/formatting

### Pages & Routes

```
/login                          → Login page

/                               → Dashboard
                                  ├── Connection cards (health, stats)
                                  ├── Quick actions (add connection — admin only)
                                  └── Recent audit log entries (admin only)

/connections/new                → Add connection form
/connections/:connId            → Connection detail
                                  ├── Tabs: MQTT | Control Center | REST API
                                  ├── Per-tab: Users | Roles | Permissions sub-tabs
                                  └── Connection health + stats header

/connections/:connId/settings   → Connection settings (admin only)
                                  ├── Edit connection params
                                  └── Danger zone (delete)

/connections/:connId/mqtt/users/:id          → MQTT user detail
/connections/:connId/cc/users/:id            → CC user detail
/connections/:connId/rest-api/users/:id      → REST API user detail
  (same pattern for role and permission detail pages)

/admin/users                    → Companion user management (admin)
/admin/users/new                → Create companion user
/admin/users/:userId            → Edit companion user

/settings                       → Personal settings
  ├── Profile (change password)
  └── API Keys management
      ├── List own keys
      ├── Create key (shows raw key once)
      └── Revoke key

/admin/audit-logs               → Audit log viewer (admin only, filterable)
                                  └── Click row → drawer with full entry details
                                      (actor, resource, JSON details, IP, user agent)
```

### Navigation Structure

```
Sidebar (always visible when logged in):
┌──────────────────────┐
│ ESE Companion logo   │
├──────────────────────┤
│ ◉ Dashboard          │
│ ◉ Connections        │
│   └─ (listed inline  │
│      with health dot)│
├──────────────────────┤
│ ADMIN (if admin)     │
│ ◉ Users              │
│ ◉ Connections Mgmt   │
│ ◉ Audit Logs         │
├──────────────────────┤
│ ◉ Settings           │
└──────────────────────┘
```

### UI Patterns

- **Drawers** (Chakra UI Drawer) for all create/edit forms (users, roles, permissions, connections, API keys, access grants) and for audit log entry detail view (click a row to see full details: actor, resource, JSON details, IP, user agent)
- **Modals** (Chakra UI Modal) only for deletion confirmations, warnings, and brief messages
- **TanStack Table** for all list views with sorting, filtering, pagination
- **Toast notifications** for action feedback (success/error)
- **Health dots** (green/red/gray) shown everywhere connections appear
- **Dark/light mode** toggle (persisted via next-themes)

### ESE User Forms

When creating/editing ESE users (MQTT, CC, REST API), the form includes:
- Username field
- Password field
- Algorithm picker dropdown (PLAIN, MD5, SHA512, PKCS5S2, BCRYPT, ARGON2ID) — default: PKCS5S2
- Iterations field — pre-filled with sensible default per algorithm (100 for PKCS5S2/SHA512/MD5, cost for BCrypt, time cost for Argon2id), fully editable
- Memory field (KB) — shown only when Argon2id is selected, editable
- Warning badge displayed when PLAIN or MD5 is selected

---

## 6. Crypto Service

Pure Kotlin implementation replicating the `hivemq-ese-helper` BouncyCastle-based hashing. No external JAR dependency.

### Interface

```kotlin
CryptoService.hashPassword(password, algorithm, iterations, salt?) → HashedPassword
CryptoService.generateSalt() → ByteArray  // 16 bytes, SecureRandom
CryptoService.verifyPassword(password, storedHash, salt, algorithm, iterations) → Boolean

data class HashedPassword(
    val hash: String,       // Base64-encoded
    val salt: String,       // Base64-encoded
    val algorithm: String,
    val iterations: Int
)
```

### Supported Algorithms

| Algorithm | Digest | Output Size | Salt Handling | Notes |
|---|---|---|---|---|
| PLAIN | none | raw bytes | empty | Testing only, UI shows warning |
| MD5 | MD5 | 16 bytes | prepended to input | Multi-iteration: hash fed back N times |
| SHA512 | SHA-512 | 64 bytes | prepended to input | Same iteration pattern as MD5 |
| PKCS5S2 | PBKDF2-SHA512 | 32 bytes (256 bit) | standard PBKDF2 | Via BouncyCastle `PKCS5S2ParametersGenerator` |
| BCRYPT | BCrypt | 64 bytes | MD5(salt) → 16 bytes | Secret pre-hashed with SHA-512 before BCrypt |
| ARGON2ID | Argon2id | 32 bytes | configurable | Parallelism=1 (hardcoded), memory parsed from algo name |

### Implementation Details

- BouncyCastle (`bcpkix-jdk18on`) used directly as a Kotlin/Gradle dependency
- MD5/SHA512 multi-iteration: `digest(salt + password)` then feed output back through digest for `iterations - 1` more rounds
- BCrypt two-stage: salt hashed with MD5 to 16 bytes, password hashed with SHA-512 to 64 bytes, then `BCrypt.generate()`
- Argon2id algorithm name format: `ARGON2ID_<memory>KB` — memory parsed and validated (1 to 9,999,999 KiB)
- All Base64 encoding/decoding via BouncyCastle's `Base64` codec for ESE compatibility
- Default for new users: PKCS5S2 with 100 iterations (matching ESE defaults)

---

## 7. Docker & Deployment

### Dockerfile

Multi-stage build:

1. **backend-build** (`gradle:8-jdk21`): compile Ktor fat JAR with BouncyCastle
2. **frontend-build** (`node:22-slim`): `pnpm install` + `vite build` → static files
3. **runtime** (`eclipse-temurin:21-jre-alpine`): copy fat JAR + static files, expose ports

### Ports

- HTTP: **8989** (default, configurable via `ESE_COMPANION_PORT`)
- HTTPS: **9090** (default, configurable via `ESE_COMPANION_HTTPS_PORT`)

### HTTPS

- If `ESE_COMPANION_HTTPS_JKS_PATH` is set: use the provided JKS keystore with `ESE_COMPANION_HTTPS_PASSWORD` and `ESE_COMPANION_HTTPS_PK_PASSWORD`
- If not set: auto-generate a self-signed certificate at startup (in-memory, regenerated on each restart)

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ESE_COMPANION_DB_TYPE` | yes | `postgresql`, `mysql`, or `sqlserver` |
| `ESE_COMPANION_DB_HOST` | yes | Database hostname |
| `ESE_COMPANION_DB_PORT` | yes | Database port |
| `ESE_COMPANION_DB_NAME` | yes | Database name |
| `ESE_COMPANION_DB_USER` | yes | Database username |
| `ESE_COMPANION_DB_PASSWORD` | yes | Database password |
| `ESE_COMPANION_ADMIN_USER` | first run | Initial admin username (seed) |
| `ESE_COMPANION_ADMIN_PASSWORD` | first run | Initial admin password (seed) |
| `ESE_COMPANION_ADMIN_EMAIL` | first run | Initial admin email (seed) |
| `ESE_COMPANION_JWT_SECRET` | yes | JWT signing key |
| `ESE_COMPANION_ENCRYPTION_KEY` | yes | AES key for encrypting stored DB passwords |
| `ESE_COMPANION_PORT` | no | HTTP port (default: 8989) |
| `ESE_COMPANION_HTTPS_PORT` | no | HTTPS port (default: 9090) |
| `ESE_COMPANION_HTTPS_JKS_PATH` | no | Path to JKS keystore (auto-generates self-signed if absent) |
| `ESE_COMPANION_HTTPS_PASSWORD` | no | JKS keystore password (required if JKS path set) |
| `ESE_COMPANION_HTTPS_PK_PASSWORD` | no | Private key password in JKS (required if JKS path set) |
| `ESE_COMPANION_RATE_LIMIT` | no | Global rate limit per IP (default: 100 req/min) |
| `ESE_COMPANION_CORS_ORIGINS` | no | Comma-separated allowed origins (default: same-origin) |
| `ESE_COMPANION_MAX_REQUEST_SIZE` | no | Max request body size (default: 1MB) |
| `ESE_COMPANION_POOL_MAX_PER_DB` | no | Max connections per ESE pool (default: 10) |
| `ESE_COMPANION_POOL_MAX_TOTAL` | no | Max total ESE connections (default: 50) |
| `ESE_COMPANION_POOL_IDLE_TIMEOUT` | no | Pool idle timeout in minutes (default: 10) |
| `ESE_COMPANION_POOL_ACQUIRE_TIMEOUT` | no | Pool connection acquire timeout in seconds (default: 5) |
| `ESE_COMPANION_HEALTH_CHECK_INTERVAL` | no | Health check interval in seconds (default: 60) |
| `ESE_COMPANION_AUDIT_RETENTION_DAYS` | no | Audit log retention period in days (default: 90) |

### Startup Sequence

1. Read and validate environment variables
2. Connect to companion database
3. Run schema migrations automatically
4. If `companion_users` table is empty, seed admin from env vars
5. Start health check scheduler for existing ESE connections
6. Start Ktor HTTP server on configured ports (HTTP + HTTPS)

### Health Probes

- `GET /health/live` — liveness (process running)
- `GET /health/ready` — readiness (companion DB connected)
- Graceful shutdown on SIGTERM (drain connections, stop health checks)

### Helm Chart

```
helm/ese-companion/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── ingress.yaml          (optional, disabled by default)
│   ├── serviceaccount.yaml
│   ├── hpa.yaml              (optional, disabled by default)
│   └── _helpers.tpl
└── README.md
```

**values.yaml key sections:**
- `image.repository`, `image.tag` — container image reference
- `database.*` — companion DB connection (type, host, port, name, user, password)
- `admin.*` — initial admin credentials (user, password, email)
- `security.jwtSecret`, `security.encryptionKey`
- `https.jksPath`, `https.password`, `https.pkPassword` — optional, mounted from a Secret
- `service.httpPort` (8989), `service.httpsPort` (9090)
- `ingress.*` — optional ingress config with TLS termination
- `resources.*` — CPU/memory requests and limits
- `autoscaling.*` — HPA config (disabled by default)
- `nodeSelector`, `tolerations`, `affinity` — scheduling constraints
- Sensitive values sourced from Kubernetes Secrets

---

## 8. ESE Database Schemas (Reference)

The application connects to existing ESE databases. These schemas are not managed by the companion — they are created by HiveMQ ESE. The companion reads and writes to these tables.

### Three Domains

Each ESE database contains three parallel table groups:

**MQTT** (`users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `user_permissions`)
- Permissions are topic-based: topic, publish_allowed, subscribe_allowed, qos_0/1/2_allowed, retained_msgs_allowed, shared_sub_allowed, shared_group

**Control Center** (`cc_users`, `cc_roles`, `cc_permissions`, `cc_user_roles`, `cc_role_permissions`, `cc_user_permissions`)
- Permissions use permission_string + description

**REST API** (`rest_api_users`, `rest_api_roles`, `rest_api_permissions`, `rest_api_user_roles`, `rest_api_role_permissions`, `rest_api_user_permissions`)
- Permissions use permission_string + description

### User Table Schema (common across all three domains)

| Column | Type | Notes |
|---|---|---|
| id | INTEGER, PK, auto-increment | |
| username | VARCHAR, unique | |
| password | TEXT | Base64-encoded hash |
| password_iterations | INTEGER | |
| password_salt | TEXT | Base64-encoded |
| algorithm | VARCHAR(32) | PLAIN, MD5, SHA512, PKCS5S2, BCRYPT, ARGON2ID_*KB |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### Database Dialect Differences

| Feature | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|
| Auto-increment | SERIAL | AUTO_INCREMENT | IDENTITY |
| Timestamps | TIMESTAMPTZ | TIMESTAMP | DATETIME2 |
| Boolean | BOOLEAN | BOOLEAN | BIT |
| Text | TEXT | TEXT | VARCHAR(MAX) |
| Updated_at trigger | PL/pgSQL function + trigger | `ON UPDATE NOW()` | FOR UPDATE trigger |

The companion's ESE service layer uses Exposed ORM to abstract these differences.
