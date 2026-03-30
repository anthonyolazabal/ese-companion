# ESE Companion v2.0 — Release Notes

**Release Date:** March 2026

ESE Companion v2.0 is a complete rewrite of the HiveMQ Enterprise Security Extension database management tool. The application has been rebuilt from the ground up with a new tech stack, new architecture, and significantly expanded capabilities.

---

## What's New

### Multi-Database Management
- **Manage multiple ESE databases** from a single interface — no more one-app-per-database
- Add, edit, test, and monitor connections to PostgreSQL, MySQL, and SQL Server ESE databases
- **Live health monitoring** with periodic connectivity checks and status indicators
- Dynamic connection pooling with lazy initialization and idle eviction

### Complete Tech Stack Rewrite
- **Backend:** Migrated from Node.js/Express to **Kotlin/Ktor** with Exposed ORM
- **Frontend:** Migrated from Vue 3/Vuetify to **React 19** with Chakra UI 3 and TanStack Router/Query/Table
- **Crypto:** All 6 ESE hash algorithms (PLAIN, MD5, SHA512, PKCS5S2, BCrypt, Argon2id) reimplemented natively in Kotlin using BouncyCastle — no more external Java JAR dependency
- **Schema management:** Exposed SchemaUtils auto-creates and updates tables on startup — no migration files to manage

### Local User Management
- Dedicated companion database for application data (users, connections, API keys, audit logs)
- Three app-level roles: **admin**, **readwrite**, **readonly**
- Admin user seeded automatically on first startup via environment variables
- BCrypt password hashing for companion user accounts
- Single session enforcement — new login invalidates previous session

### API Key System
- Create scoped, expiring API keys for programmatic access
- Keys inherit the owning user's role with optional further scope restriction
- Scopes: `ese:read`, `ese:write`, `ese:admin`
- Raw key shown once at creation, only BCrypt hash stored
- Authenticate via `X-API-Key` header alongside JWT

### Audit Logging
- Every create, update, and delete operation is logged with actor, connection, domain, resource, IP, and user agent
- Admin-only audit log viewer with filtering by domain, action, and date range
- Detail drawer showing full entry including JSON details
- Configurable retention with automatic daily cleanup (default: 90 days)

### Security
- **JWT authentication** with 60-minute access tokens and 7-day refresh tokens
- **Brute force protection** — account lockout after 5 failed attempts with exponential backoff (15/30/60 min cap)
- **Rate limiting** — 500 requests/min global, 30/min on auth endpoints
- **Security headers** — CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy
- **AES-256-GCM encryption** for stored database connection passwords
- **HTTPS** with auto-generated self-signed certificate or user-provided JKS keystore
- **CORS** configurable via environment variable
- **Request size limits** to prevent payload abuse
- Minimum 16-character enforcement on JWT secret and encryption key

### OpenAPI Documentation
- Auto-generated OpenAPI 3.0.3 specification at `/api/v1/openapi.json`
- Swagger UI at `/api/v1/docs`
- All endpoints documented with request/response schemas

### Kubernetes-Ready
- **Helm chart** for Kubernetes deployment with configurable values
- Liveness probe (`/health/live`) and readiness probe (`/health/ready`)
- Graceful shutdown on SIGTERM
- All configuration via environment variables (ConfigMap/Secret friendly)
- Optional HPA and Ingress

---

## ESE Domain Management

Full CRUD support for all three HiveMQ ESE security domains:

### MQTT
- Users — create with configurable hash algorithm and iterations, assign roles
- Roles — create and assign permissions (topic-based)
- Permissions — topic, publish/subscribe flags, QoS levels, retained messages, shared subscriptions

### Control Center
- Users — create with configurable hash algorithm
- Roles — manage with permission assignments
- Permissions — read-only view of HiveMQ CC permission strings (49 default permissions auto-loaded)

### REST API
- Users — create with configurable hash algorithm
- Roles — manage with permission assignments
- Permissions — read-only view of HiveMQ REST API permission strings (47 default permissions auto-loaded)

---

## UI Highlights

- **Dashboard** with connection cards showing health status and entity counts
- **Skeleton loaders** for fast perceived loading
- **Expandable table rows** — click a user to see assigned roles, click a role to see assigned permissions
- **Unified edit drawers** — role assignment integrated into user edit drawer, permission assignment into role edit drawer
- **Role/permission selection on creation** — assign during create, not just after
- **Toast notifications** for all operations (success and error)
- **Dark/light mode** toggle
- **Responsive design** with collapsible sidebar on mobile
- **ALLOW/DENIED badges** for MQTT permission flags
- **Algorithm picker** with weak algorithm warnings and BCrypt cost factor guidance
- **SSL configuration** with "Ignore Certificate Validation" option for self-signed certificates
- **Connection test button** directly in the connections table

---

## API

All endpoints versioned at `/api/v1/`:

| Group | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `/auth/refresh`, `/auth/logout` |
| Users | CRUD at `/users` (admin only) |
| API Keys | CRUD at `/keys` |
| Connections | CRUD at `/connections` (admin only) |
| ESE Entities | CRUD at `/ese/{connId}/{domain}/users\|roles\|permissions` |
| Associations | `POST\|DELETE` for user-role, role-permission, user-permission |
| Dashboard | `GET /dashboard`, `GET /ese/{connId}/stats` |
| Audit Logs | `GET /audit-logs` (admin only) |
| Health | `GET /health/live`, `GET /health/ready` |
| Docs | `GET /openapi.json`, `GET /docs` |

---

## Deployment

### Docker

```bash
docker pull anthonyolazabal/ese-companion:2.0.0
docker run \
  -e ESE_COMPANION_DB_TYPE=postgresql \
  -e ESE_COMPANION_DB_HOST=your-db-host \
  -e ESE_COMPANION_DB_PORT=5432 \
  -e ESE_COMPANION_DB_NAME=companion \
  -e ESE_COMPANION_DB_USER=companion \
  -e ESE_COMPANION_DB_PASSWORD=your-password \
  -e ESE_COMPANION_JWT_SECRET=your-jwt-secret-min-16-chars \
  -e ESE_COMPANION_ENCRYPTION_KEY=your-aes-key-min-16-chars \
  -e ESE_COMPANION_ADMIN_USER=admin \
  -e ESE_COMPANION_ADMIN_PASSWORD=admin \
  -e ESE_COMPANION_ADMIN_EMAIL=admin@example.com \
  -p 8989:8989 -p 9090:9090 \
  anthonyolazabal/ese-companion:2.0.0
```

### Helm

```bash
helm install ese-companion ./helm/ese-companion \
  --set database.host=your-db-host \
  --set database.password=your-password \
  --set security.jwtSecret=your-jwt-secret \
  --set security.encryptionKey=your-aes-key
```

### Local Development

```bash
docker compose up -d          # Start PostgreSQL, MySQL, SQL Server
cd backend && ./gradlew run   # Start backend on :8989
cd frontend && pnpm dev       # Start frontend on :5173
```

---

## Breaking Changes from v1

- **Complete rewrite** — no migration path from v1 data
- **New tech stack** — Kotlin/Ktor backend replaces Node.js/Express, React replaces Vue 3
- **Separate companion database** — application no longer stores users in ESE databases
- **New authentication** — local user management replaces ESE `rest_api_users` login
- **API versioning** — all endpoints now at `/api/v1/`
- **New ports** — HTTP 8989 (was 3001), HTTPS 9090 (was 4001)
- **Environment variables** — all prefixed with `ESE_COMPANION_` (was `DATABASE_URL` and `TOKEN_KEY`)

---

## Known Limitations

- OIDC/SSO authentication is not yet supported (planned for a future release)
- Prometheus metrics endpoint is not included
- Batch import/export of ESE entities is not supported
- Per-connection role scoping is not implemented (roles are global)

---

## Credits

Built by the community for the community.
