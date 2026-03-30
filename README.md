# ESE Companion v2

A centralized management tool for [HiveMQ Enterprise Security Extension (ESE)](https://www.hivemq.com/docs/ese/latest/) databases. Manage multiple ESE databases from a single interface with full CRUD support for MQTT, Control Center, and REST API security domains.

## Features

- **Multi-database management** — connect to multiple PostgreSQL, MySQL, and SQL Server ESE databases simultaneously
- **Three ESE domains** — manage users, roles, and permissions for MQTT, Control Center, and REST API
- **6 hash algorithms** — PLAIN, MD5, SHA512, PKCS5S2, BCrypt, Argon2id (compatible with HiveMQ ESE)
- **Local user management** — admin, readwrite, and readonly roles
- **API keys** — scoped and expiring keys for programmatic access
- **Audit logging** — track every action with filterable logs and configurable retention
- **Live health monitoring** — periodic connection checks with dashboard overview
- **OpenAPI documentation** — Swagger UI at `/api/v1/docs`
- **Dark/light mode** — responsive UI with Chakra UI design system
- **Kubernetes-ready** — Helm chart, health probes, graceful shutdown

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Kotlin, Ktor, Exposed ORM, BouncyCastle |
| Frontend | React 19, Chakra UI 3, TanStack Router/Query/Table |
| Build | Gradle (backend), Vite + pnpm (frontend) |
| Runtime | JDK 21, Docker |
| Databases | PostgreSQL, MySQL, SQL Server |

## Quick Start

### Using Docker

```bash
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
  anthonyolazabal/ese-companion:latest
```

Open http://localhost:8989 and log in with the admin credentials.

### Local Development

```bash
# Start databases
docker compose up -d

# Backend (terminal 1)
cd backend && ./gradlew run

# Frontend (terminal 2)
cd frontend && pnpm install && pnpm dev
```

Open http://localhost:5173 — login: `admin` / `admin`

## Configuration

All configuration is done via environment variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `ESE_COMPANION_DB_TYPE` | yes | — | `postgresql`, `mysql`, or `sqlserver` |
| `ESE_COMPANION_DB_HOST` | yes | — | Companion database hostname |
| `ESE_COMPANION_DB_PORT` | yes | — | Companion database port |
| `ESE_COMPANION_DB_NAME` | yes | — | Companion database name |
| `ESE_COMPANION_DB_USER` | yes | — | Companion database username |
| `ESE_COMPANION_DB_PASSWORD` | yes | — | Companion database password |
| `ESE_COMPANION_JWT_SECRET` | yes | — | JWT signing key (min 16 chars) |
| `ESE_COMPANION_ENCRYPTION_KEY` | yes | — | AES key for stored passwords (min 16 chars) |
| `ESE_COMPANION_ADMIN_USER` | first run | — | Initial admin username |
| `ESE_COMPANION_ADMIN_PASSWORD` | first run | — | Initial admin password |
| `ESE_COMPANION_ADMIN_EMAIL` | first run | — | Initial admin email |
| `ESE_COMPANION_PORT` | no | 8989 | HTTP port |
| `ESE_COMPANION_HTTPS_PORT` | no | 9090 | HTTPS port |
| `ESE_COMPANION_RATE_LIMIT` | no | 500 | Global rate limit (requests/min) |
| `ESE_COMPANION_AUDIT_RETENTION_DAYS` | no | 90 | Audit log retention |
| `ESE_COMPANION_HEALTH_CHECK_INTERVAL` | no | 60 | Health check interval (seconds) |

See the [full configuration reference](docs/USER-GUIDE.md) for all options.

## Kubernetes

```bash
helm install ese-companion ./helm/ese-companion \
  --set database.host=your-db-host \
  --set database.password=your-password \
  --set security.jwtSecret=your-jwt-secret \
  --set security.encryptionKey=your-aes-key
```

## Project Structure

```
ese-companion/
  backend/         Kotlin/Ktor backend
  frontend/        React/Chakra UI frontend
  helm/            Kubernetes Helm chart
  references/      ESE database schemas (PostgreSQL, MySQL, SQL Server)
  docs/            Documentation (PRD, user guide, release notes)
  ArchiveVersion1/ Archived v1 application
```

## Documentation

- [Quick Start Guide](docs/QUICKSTART.md)
- [User Guide](docs/USER-GUIDE.md)
- [Release Notes v2.0](docs/RELEASE-NOTES-v2.0.md)
- [PRD](docs/PRD.md)
- [CVE Report](docs/CVE-REPORT.md)

## Building

```bash
# Build backend JAR
cd backend && ./gradlew shadowJar

# Build frontend
cd frontend && pnpm build

# Build Docker image
./build-and-push.sh
```

## Testing

```bash
# Backend tests (123 tests)
cd backend && ./gradlew test

# Frontend tests (34 tests)
cd frontend && pnpm test
```

## License

ISC

---

Built by the community for the community.
