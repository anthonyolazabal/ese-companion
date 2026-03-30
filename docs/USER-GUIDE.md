# ESE Companion v2 -- User Guide

Comprehensive documentation for managing HiveMQ Enterprise Security Extension databases with ESE Companion v2.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Dashboard](#dashboard)
- [Managing Database Connections](#managing-database-connections)
- [ESE Entity Management](#ese-entity-management)
- [User Management (Admin)](#user-management-admin)
- [API Keys](#api-keys)
- [Audit Logs (Admin)](#audit-logs-admin)
- [Settings](#settings)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements

- **Docker** 20.10+ and **Docker Compose** v2 (for containerized deployment)
- **JDK 21** (only for local backend development)
- **Node.js 22** and **pnpm** (only for local frontend development)
- A supported database for the companion application data: PostgreSQL, MySQL, or SQL Server
- One or more HiveMQ ESE databases (PostgreSQL, MySQL, or SQL Server) to manage
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

#### Docker (Recommended)

Pull and run the pre-built image:

```bash
docker run -d --name ese-companion \
  -e ESE_COMPANION_DB_TYPE=postgresql \
  -e ESE_COMPANION_DB_HOST=your-db-host \
  -e ESE_COMPANION_DB_PORT=5432 \
  -e ESE_COMPANION_DB_NAME=companion \
  -e ESE_COMPANION_DB_USER=companion \
  -e ESE_COMPANION_DB_PASSWORD=your-password \
  -e ESE_COMPANION_JWT_SECRET=your-jwt-secret-min-16-chars \
  -e ESE_COMPANION_ENCRYPTION_KEY=your-aes-key-min-16-chars \
  -e ESE_COMPANION_ADMIN_USERNAME=admin \
  -e ESE_COMPANION_ADMIN_PASSWORD=admin \
  -e ESE_COMPANION_ADMIN_EMAIL=admin@example.com \
  -p 8989:8989 -p 9090:9090 \
  anthonyolazabal/ese-companion:2.0.0
```

#### Helm (Kubernetes)

```bash
helm install ese-companion ./helm/ese-companion \
  --set database.type=postgresql \
  --set database.host=your-db-host \
  --set database.port=5432 \
  --set database.name=companion \
  --set database.user=companion \
  --set database.password=your-password \
  --set security.jwtSecret=your-jwt-secret \
  --set security.encryptionKey=your-aes-key \
  --set admin.username=admin \
  --set admin.password=admin \
  --set admin.email=admin@example.com
```

The Helm chart includes templates for Deployment, Service, ConfigMap, Secret, and optional Ingress and HPA. Sensitive values are stored in Kubernetes Secrets. See `helm/ese-companion/values.yaml` for the full list of configurable parameters.

#### Local Development

```bash
# Start companion and ESE databases
docker compose up -d

# Terminal 1 -- Backend
cd backend
export ESE_COMPANION_DB_TYPE=postgresql
export ESE_COMPANION_DB_HOST=localhost
export ESE_COMPANION_DB_PORT=5432
export ESE_COMPANION_DB_NAME=companion
export ESE_COMPANION_DB_USER=companion
export ESE_COMPANION_DB_PASSWORD=companion
export ESE_COMPANION_JWT_SECRET=change-me-min-16-chars
export ESE_COMPANION_ENCRYPTION_KEY=change-me-min-16-chars
export ESE_COMPANION_ADMIN_USERNAME=admin
export ESE_COMPANION_ADMIN_PASSWORD=admin
export ESE_COMPANION_ADMIN_EMAIL=admin@example.com
./gradlew run

# Terminal 2 -- Frontend
cd frontend
pnpm install
pnpm dev
```

### Configuration

All configuration is done via environment variables. The table below lists every variable, whether it is required, and its default value.

#### Required Variables

| Variable | Description |
|---|---|
| `ESE_COMPANION_DB_TYPE` | Companion database type: `postgresql`, `mysql`, or `sqlserver` |
| `ESE_COMPANION_DB_HOST` | Companion database hostname |
| `ESE_COMPANION_DB_PORT` | Companion database port |
| `ESE_COMPANION_DB_NAME` | Companion database name |
| `ESE_COMPANION_DB_USER` | Companion database username |
| `ESE_COMPANION_DB_PASSWORD` | Companion database password |
| `ESE_COMPANION_JWT_SECRET` | JWT signing key (minimum 16 characters) |
| `ESE_COMPANION_ENCRYPTION_KEY` | AES-256-GCM key for encrypting stored ESE database passwords (minimum 16 characters) |

#### Admin Seed Variables (First Run)

| Variable | Description |
|---|---|
| `ESE_COMPANION_ADMIN_USERNAME` | Initial admin username (created on first startup if no users exist) |
| `ESE_COMPANION_ADMIN_PASSWORD` | Initial admin password |
| `ESE_COMPANION_ADMIN_EMAIL` | Initial admin email |

#### Server Variables (Optional)

| Variable | Default | Description |
|---|---|---|
| `ESE_COMPANION_HTTP_PORT` | `8989` | HTTP listen port |
| `ESE_COMPANION_HTTPS_PORT` | `9090` | HTTPS listen port |
| `ESE_COMPANION_HTTPS_JKS_PATH` | -- | Path to JKS keystore for HTTPS. If not set, a self-signed certificate is auto-generated at startup. |
| `ESE_COMPANION_HTTPS_PASSWORD` | -- | JKS keystore password (required when JKS path is set) |
| `ESE_COMPANION_HTTPS_PK_PASSWORD` | -- | Private key password in JKS (required when JKS path is set) |

#### Connection Pool Variables (Optional)

| Variable | Default | Description |
|---|---|---|
| `ESE_COMPANION_POOL_MAX_PER_DB` | `10` | Maximum connections per ESE database pool |
| `ESE_COMPANION_POOL_MAX_TOTAL` | `50` | Maximum total connections across all ESE database pools |
| `ESE_COMPANION_POOL_IDLE_TIMEOUT` | `10` | Idle connection timeout in minutes before eviction |
| `ESE_COMPANION_POOL_ACQUIRE_TIMEOUT` | `5` | Connection acquire timeout in seconds |

#### Operational Variables (Optional)

| Variable | Default | Description |
|---|---|---|
| `ESE_COMPANION_HEALTH_CHECK_INTERVAL` | `60` | Health check interval in seconds |
| `ESE_COMPANION_AUDIT_RETENTION_DAYS` | `90` | Number of days to retain audit log entries |
| `ESE_COMPANION_RATE_LIMIT` | `500` | Global rate limit in requests per minute per IP |
| `ESE_COMPANION_CORS_ORIGINS` | same-origin | Comma-separated list of allowed CORS origins (e.g., `https://admin.example.com`). Set to `*` to allow all origins (not recommended for production). |
| `ESE_COMPANION_MAX_REQUEST_SIZE` | `1MB` | Maximum request body size. Supports KB, MB, GB suffixes. |

### First Login and Initial Setup

1. Open your browser and navigate to `http://localhost:8989` (or your configured host and port).
2. Log in with the admin credentials you set via environment variables (default: `admin` / `admin`).
3. On first login, you land on the Dashboard, which is empty because no ESE database connections have been configured yet.
4. Your first task should be to add at least one ESE database connection (see [Managing Database Connections](#managing-database-connections)).
5. After adding a connection, you can begin managing ESE users, roles, and permissions.

---

## Dashboard

The Dashboard is the landing page after login. It provides an at-a-glance overview of all configured ESE database connections.

### Connection Overview Cards

Each ESE database connection is displayed as a card showing:

- **Connection name** and description
- **Database type** (PostgreSQL, MySQL, or SQL Server)
- **Health status indicator** (colored dot)
- **Entity counts** -- number of users, roles, and permissions across MQTT, Control Center, and REST API domains

### Health Status Indicators

| Color | Status | Meaning |
|---|---|---|
| Green | HEALTHY | The database is reachable and responding to queries |
| Red | UNREACHABLE | The connection failed -- the database is down or credentials are wrong |
| Gray | UNKNOWN | Health has not been checked yet (typically right after adding a connection) |

Health checks run automatically at a configurable interval (default: every 60 seconds). The last check timestamp is displayed on each card.

### Summary Statistics

The dashboard shows aggregate statistics across all connections, including total users, roles, and permissions managed through ESE Companion.

---

## Managing Database Connections

Database connections represent the ESE databases that ESE Companion manages. Only users with the **admin** role can add, edit, or delete connections. All users can view connections and browse ESE entities.

### Adding a New Connection

1. Navigate to **Connections** in the sidebar.
2. Click **Add Connection**.
3. A drawer slides in from the right with the connection form.
4. Fill in the required fields:

   | Field | Description |
   |---|---|
   | Name | A unique display name for this connection |
   | Description | Optional description |
   | Database Type | PostgreSQL, MySQL, or SQL Server |
   | Host | Database server hostname or IP address |
   | Port | Database server port (default: 5432 for PostgreSQL, 3306 for MySQL, 1433 for SQL Server) |
   | Database Name | The name of the ESE database |
   | Username | Database login username |
   | Password | Database login password (encrypted at rest with AES-256-GCM) |
   | SSL Enabled | Toggle to enable SSL/TLS for the database connection |

5. Click **Test Connection** to verify connectivity before saving.
6. Click **Save** to create the connection.

### SSL Configuration and Certificate Validation Bypass

When SSL is enabled, the connection uses TLS encryption to communicate with the database. For environments using self-signed certificates, the connection form provides an **Ignore Certificate Validation** option that bypasses certificate chain verification. This is useful for development and testing but should be avoided in production.

### Testing Connectivity

You can test a connection at any time:

- **During creation/editing** -- Use the **Test Connection** button in the connection drawer.
- **From the connections list** -- Click the test button directly in the connections table row.

A toast notification reports success or failure with error details.

### Editing and Deleting Connections

- **Edit** -- Click a connection in the list to open the edit drawer. Modify any field and save.
- **Delete** -- Click the delete action on a connection. A confirmation modal appears before deletion. Deleting a connection removes it from ESE Companion but does not affect the actual ESE database.

### Health Monitoring

ESE Companion runs periodic health checks on all configured connections. The check interval is configurable via `ESE_COMPANION_HEALTH_CHECK_INTERVAL` (default: 60 seconds). Each check has a 5-second timeout.

Health status is visible:

- On the Dashboard connection cards
- In the Connections list
- In the sidebar next to each connection name
- On the Connection Detail page header

---

## ESE Entity Management

Each ESE database connection contains three security domains, matching the HiveMQ ESE structure:

- **MQTT** -- Users, roles, and topic-based permissions for MQTT clients
- **Control Center** -- Users, roles, and permissions for the HiveMQ Control Center
- **REST API** -- Users, roles, and permissions for the HiveMQ REST API

### Navigating Domains

1. Click on a connection in the sidebar or connections list.
2. On the Connection Detail page, select a domain tab: **MQTT**, **Control Center**, or **REST API**.
3. Within each domain, switch between sub-tabs: **Users**, **Roles**, **Permissions**.

All entity tables support sorting, filtering (case-insensitive search), and pagination.

### Switching Between Entity Tabs

The sub-tabs (Users, Roles, Permissions) appear below the domain tabs. Click a sub-tab to view the corresponding entity list for the selected domain. The active tab is visually highlighted.

---

### MQTT Users

MQTT users authenticate MQTT clients connecting to HiveMQ.

#### Creating Users

1. Navigate to the MQTT Users tab.
2. Click **Create User**.
3. A drawer opens with the following fields:

   | Field | Description |
   |---|---|
   | Username | Unique username for the MQTT user |
   | Password | The user's password (will be hashed before storage) |
   | Algorithm | Hash algorithm to use (see below) |
   | Iterations | Number of hash iterations (pre-filled with a sensible default per algorithm) |
   | Memory (KB) | Memory parameter -- only shown when Argon2id is selected |
   | Roles | Optional -- assign one or more roles during creation |

4. Click **Save**.

#### Supported Algorithms

| Algorithm | Default Iterations | Notes |
|---|---|---|
| PKCS5S2 | 100 | PBKDF2 with SHA-512. **Recommended default.** Secure and widely supported. |
| SHA512 | 100 | Multi-iteration SHA-512 with salt. Acceptable but PKCS5S2 is preferred. |
| BCrypt | 12 (cost factor) | Industry-standard password hashing. Cost factor controls work factor (2^cost rounds). |
| Argon2id | 3 (time cost) | Modern memory-hard algorithm. Requires memory parameter (default: 65536 KB). Best security when configured properly. |
| MD5 | 100 | **Weak algorithm.** A warning badge is displayed when selected. Use only for compatibility with legacy configurations. |
| PLAIN | 1 | **No hashing.** Password stored as-is. A warning badge is displayed. Use only for testing. |

#### Understanding Iterations and Cost Factors

- For **PKCS5S2**, **SHA512**, and **MD5**: the iterations field controls how many times the hash function is applied. Higher values increase security but also increase CPU time during authentication.
- For **BCrypt**: the iterations field is the cost factor. The actual number of rounds is 2^cost. A cost of 12 means 4096 rounds.
- For **Argon2id**: the iterations field is the time cost (number of passes over memory). The memory field (in KB) controls memory hardness. Parallelism is fixed at 1.

#### Algorithm Recommendations and Warnings

The UI displays a warning badge when **PLAIN** or **MD5** is selected, indicating these are weak algorithms. The recommended default is **PKCS5S2**, which provides good security with ESE compatibility. For maximum security, use **Argon2id** or **BCrypt**.

#### Assigning Roles

Roles can be assigned to users in two ways:

- **During creation** -- Select roles in the role assignment section of the create drawer.
- **During editing** -- Open the user edit drawer and modify role assignments.

#### Expandable Rows

In the users table, click on a user row to expand it. The expanded section shows all roles currently assigned to that user without navigating away from the list.

---

### MQTT Roles

Roles group permissions together for easier management. A user inherits all permissions from their assigned roles.

#### Creating Roles

1. Navigate to the MQTT Roles tab.
2. Click **Create Role**.
3. Enter a role name and optional description.
4. Optionally assign permissions during creation.
5. Click **Save**.

#### Assigning Permissions to Roles

Permissions can be assigned to roles:

- **During creation** -- Select permissions in the role creation drawer.
- **During editing** -- Open the role edit drawer and modify permission assignments.

#### Expandable Rows

Click on a role row in the table to expand it and view all permissions currently assigned to that role.

---

### MQTT Permissions

MQTT permissions are topic-based access controls that define what actions a client can perform on specific MQTT topics.

#### Creating Permissions

1. Navigate to the MQTT Permissions tab.
2. Click **Create Permission**.
3. Fill in the permission fields:

   | Field | Description |
   |---|---|
   | Topic | The MQTT topic pattern (e.g., `sensors/#`, `devices/+/telemetry`) |
   | Publish Allowed | Whether clients can publish to this topic |
   | Subscribe Allowed | Whether clients can subscribe to this topic |
   | QoS 0 Allowed | Whether QoS 0 (at most once) is allowed |
   | QoS 1 Allowed | Whether QoS 1 (at least once) is allowed |
   | QoS 2 Allowed | Whether QoS 2 (exactly once) is allowed |
   | Retained Messages Allowed | Whether retained messages are allowed on this topic |
   | Shared Subscriptions Allowed | Whether shared subscriptions are allowed |
   | Shared Group | The shared subscription group name (if shared subscriptions are enabled) |

4. Click **Save**.

#### Permission Flags

Each permission flag is displayed as an **ALLOW** or **DENIED** badge in the permissions table, making it easy to scan permissions at a glance:

- **ALLOW** (green badge) -- The action is permitted
- **DENIED** (red badge) -- The action is not permitted

#### Editing and Deleting Permissions

- Click a permission in the table to open the edit drawer and modify any field.
- Use the delete action to remove a permission. A confirmation modal appears before deletion.

---

### Control Center and REST API

The Control Center and REST API domains follow the same user and role management patterns as MQTT:

- **Users** -- Create, edit, delete users with the same algorithm options.
- **Roles** -- Create, edit, delete roles with permission assignments.
- **Permissions** -- Pre-defined by HiveMQ ESE and **read-only in the UI**.

Unlike MQTT permissions (which are topic-based and user-defined), Control Center and REST API permissions are loaded from HiveMQ's default permission set:

- **Control Center** -- 49 default permissions (e.g., `HIVEMQ_SUPER_ADMIN`, `CLIENT_LIST`, `BACKUP_CREATE`)
- **REST API** -- 47 default permissions (e.g., `HIVEMQ_SUPER_ADMIN`, `CLIENT_LIST`, `TRACE_RECORDING_LIST`)

These permissions use a `permission_string` and `description` format rather than topic-based fields. You cannot create, edit, or delete these permissions -- they are defined by HiveMQ. You can, however, assign them to roles and users.

---

## User Management (Admin)

ESE Companion has its own user system, separate from ESE users. Companion users are the people who log in to the ESE Companion application itself.

Only **admin** users can manage companion users.

### Creating Companion Users

1. Navigate to **Admin > Users** in the sidebar.
2. Click **Create User**.
3. Fill in the form:

   | Field | Description |
   |---|---|
   | Username | Unique username |
   | Email | User's email address |
   | Password | User's password (hashed with BCrypt for storage) |
   | Role | One of: `admin`, `readwrite`, `readonly` |

4. Click **Save**.

### Role Assignment

| Role | ESE Entities | Manage Connections | Manage Users | Audit Logs | API Keys |
|---|---|---|---|---|---|
| `admin` | Full CRUD on all connections | Yes | Yes | Yes | Own keys |
| `readwrite` | Full CRUD on all connections | No | No | No | Own keys |
| `readonly` | Read-only on all connections | No | No | No | Own keys |

Roles are **global** -- they apply across all configured ESE database connections. There is no per-connection role scoping.

#### What Each Role Can Do

- **admin** -- Full access to everything. Can manage ESE entities, database connections, companion users, API keys, and audit logs.
- **readwrite** -- Can create, read, update, and delete ESE entities (users, roles, permissions) across all connections. Cannot manage connections, companion users, or view audit logs.
- **readonly** -- Can only view ESE entities across all connections. Cannot make any changes. Useful for auditors or observers.

All roles can manage their own API keys via the Settings page.

### Password Reset (Admin Only)

There is no self-service password reset. If a user forgets their password, an admin must reset it:

1. Navigate to **Admin > Users**.
2. Click on the user to edit.
3. Set a new password in the edit drawer.
4. Click **Save**.

When an admin resets a user's password, all existing sessions and tokens for that user are revoked.

---

## API Keys

API keys allow programmatic access to the ESE Companion API without using username/password authentication.

### Creating API Keys

1. Navigate to **Settings > API Keys**.
2. Click **Create API Key**.
3. Fill in the form:

   | Field | Description |
   |---|---|
   | Name | A human-readable label for the key (e.g., "CI/CD Pipeline") |
   | Scopes | Select one or more scopes (see below) |
   | Expires At | Mandatory expiration date |

4. Click **Create**.

**IMPORTANT:** The raw API key is displayed only once immediately after creation. Copy it and store it securely. Once you close the dialog, the key cannot be retrieved -- only a BCrypt hash is stored.

### Understanding Scopes

| Scope | Permissions Granted |
|---|---|
| `ese:read` | Read ESE entities (users, roles, permissions) and connection health |
| `ese:write` | Read and write ESE entities (create, update, delete) |
| `ese:admin` | Full access including connection management, user management, and audit logs |

Scopes can only restrict access below the owning user's role -- they cannot grant more access than the user has. For example, a `readwrite` user creating a key with `ese:admin` scope will still be limited to `readwrite` capabilities.

### Setting Expiration Dates

All API keys require an expiration date. Expired keys are automatically rejected by the authentication middleware. There is no option to create non-expiring keys.

### Using API Keys

Pass the API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: esc_a3f8..." \
  http://localhost:8989/api/v1/ese/{connId}/mqtt/users
```

The key prefix (first 8 characters, e.g., `esc_a3f8`) is stored for identification purposes and appears in the API keys list.

---

## Audit Logs (Admin)

The audit log records every create, update, and delete operation performed in ESE Companion. Only **admin** users can view audit logs.

### Viewing Audit Logs

1. Navigate to **Admin > Audit Logs** in the sidebar.
2. The audit log table displays entries sorted by most recent first.

### Filtering

Use the filter controls at the top of the audit log table:

| Filter | Description |
|---|---|
| Domain | Filter by domain: `mqtt`, `cc`, `rest_api`, or `companion` |
| Action | Filter by action: `create`, `read`, `update`, or `delete` |
| Date Range | Filter by start and end date |

### Understanding Audit Entries

Each audit log entry contains:

| Field | Description |
|---|---|
| Timestamp | When the action occurred (displayed in your browser's local timezone, stored as UTC) |
| Actor | The user or API key that performed the action |
| Action | `create`, `read`, `update`, or `delete` |
| Domain | `mqtt`, `cc`, `rest_api`, or `companion` |
| Resource Type | The type of resource affected (e.g., `user`, `role`, `permission`, `connection`) |
| Resource Name | The name or identifier of the affected resource |
| Connection | The ESE database connection (null for companion-level actions) |

### Viewing Full Details

Click on any audit log row to open a detail drawer showing the complete entry, including:

- **Actor type** -- Whether the action was performed by a `user` or an `api_key`
- **Actor name** -- The username or API key name
- **Resource ID** -- The unique identifier of the affected resource
- **Details** -- A JSON object with contextual data about the change (never contains secrets)
- **IP Address** -- The IP address of the client that made the request
- **User Agent** -- The browser or HTTP client user agent string

### Retention Policy

Audit logs are automatically cleaned up after the configured retention period (default: 90 days, configurable via `ESE_COMPANION_AUDIT_RETENTION_DAYS`). The cleanup job runs daily. Audit logs are append-only -- they cannot be edited or deleted through the application.

---

## Settings

The Settings page is accessible to all logged-in users via the sidebar.

### Changing Your Password

1. Navigate to **Settings**.
2. In the Profile section, enter your current password and your new password.
3. Click **Save**.

When you change your password, all existing sessions and tokens for your account are revoked. You will need to log in again.

### Managing Your API Keys

The Settings page also provides access to your API keys:

- View all your API keys with their name, prefix, scopes, expiration date, and last used timestamp
- Create new API keys
- Revoke (delete) existing API keys

See [API Keys](#api-keys) for detailed instructions.

---

## API Reference

ESE Companion exposes a REST API for programmatic access. Full interactive documentation is available via Swagger UI at `/api/v1/docs`, and the OpenAPI 3.0.3 specification is available at `/api/v1/openapi.json`.

### Base URL and Versioning

All API endpoints are prefixed with `/api/v1/`. Future breaking changes will use `/api/v2/`, etc.

```
http://localhost:8989/api/v1/
```

### Authentication

Two authentication methods are supported:

**JWT Bearer Token** (for UI sessions):

```bash
# Obtain a token
curl -X POST http://localhost:8989/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'

# Use the token
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:8989/api/v1/connections
```

**API Key** (for programmatic access):

```bash
curl -H "X-API-Key: esc_a3f8..." \
  http://localhost:8989/api/v1/connections
```

### Key Endpoints

#### Authentication

```bash
# Login
curl -X POST http://localhost:8989/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'

# Refresh token
curl -X POST http://localhost:8989/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'

# Logout
curl -X POST http://localhost:8989/api/v1/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

#### Connections (Admin Only)

```bash
# List connections
curl -H "Authorization: Bearer <token>" \
  http://localhost:8989/api/v1/connections

# Add a connection
curl -X POST http://localhost:8989/api/v1/connections \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production ESE",
    "dbType": "POSTGRESQL",
    "host": "db.example.com",
    "port": 5432,
    "databaseName": "hivemq_ese",
    "username": "ese",
    "password": "secret",
    "sslEnabled": true
  }'

# Test a connection
curl -X POST http://localhost:8989/api/v1/connections/{connId}/test \
  -H "Authorization: Bearer <token>"
```

#### ESE Entities

```bash
# List MQTT users for a connection
curl -H "Authorization: Bearer <token>" \
  http://localhost:8989/api/v1/ese/{connId}/mqtt/users

# Create an MQTT user
curl -X POST http://localhost:8989/api/v1/ese/{connId}/mqtt/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sensor-device-01",
    "password": "secure-password",
    "algorithm": "PKCS5S2",
    "iterations": 100
  }'

# Assign a role to a user
curl -X POST http://localhost:8989/api/v1/ese/{connId}/mqtt/users/{userId}/roles/{roleId} \
  -H "Authorization: Bearer <token>"

# List Control Center permissions
curl -H "Authorization: Bearer <token>" \
  http://localhost:8989/api/v1/ese/{connId}/cc/permissions

# Create an MQTT permission
curl -X POST http://localhost:8989/api/v1/ese/{connId}/mqtt/permissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "sensors/#",
    "publishAllowed": true,
    "subscribeAllowed": true,
    "qos0Allowed": true,
    "qos1Allowed": true,
    "qos2Allowed": false,
    "retainedMsgsAllowed": false,
    "sharedSubAllowed": false
  }'
```

#### Dashboard and Statistics

```bash
# Get dashboard summary
curl -H "Authorization: Bearer <token>" \
  http://localhost:8989/api/v1/dashboard

# Get per-connection entity counts
curl -H "Authorization: Bearer <token>" \
  http://localhost:8989/api/v1/ese/{connId}/stats
```

#### Audit Logs (Admin Only)

```bash
# List audit logs with filters
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8989/api/v1/audit-logs?domain=mqtt&action=create&page=1&size=20"

# Get a single audit log entry
curl -H "Authorization: Bearer <token>" \
  http://localhost:8989/api/v1/audit-logs/{logId}
```

### Pagination and Filtering

All list endpoints support pagination and search:

| Parameter | Description | Default |
|---|---|---|
| `page` | Page number (1-based) | `1` |
| `size` | Number of items per page | `20` |
| `search` | Case-insensitive substring search | -- |

Example:

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8989/api/v1/ese/{connId}/mqtt/users?search=sensor&page=1&size=50"
```

### Common Response Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `204` | Resource deleted (no content) |
| `400` | Bad request -- invalid input or validation error |
| `401` | Unauthorized -- missing or invalid authentication |
| `403` | Forbidden -- insufficient permissions for this action |
| `404` | Resource not found |
| `409` | Conflict -- resource already exists (e.g., duplicate username) |
| `413` | Payload too large -- request body exceeds `ESE_COMPANION_MAX_REQUEST_SIZE` |
| `429` | Too many requests -- rate limit exceeded. Check the `Retry-After` header. |
| `500` | Internal server error |

---

## Troubleshooting

### Common Errors and Solutions

#### "Connection refused" when adding a database connection

- Verify the database host and port are correct.
- Ensure the database server is running and accepting connections.
- If using Docker, make sure the database container is on the same network or the port is exposed to the host.
- Check firewall rules between ESE Companion and the database server.

#### SSL/TLS connection errors

- If using self-signed certificates, enable the **Ignore Certificate Validation** option in the connection settings.
- Verify the database server's SSL configuration is correct.
- Ensure the certificate is not expired.

#### "Invalid credentials" on database connection test

- Double-check the username and password.
- For SQL Server, ensure the `sa` account is enabled or use an appropriate login.
- Special characters in passwords may need to be handled carefully in environment variables (use quotes).

#### SQL Server "LIMIT" syntax errors

SQL Server does not support the `LIMIT` keyword. ESE Companion's ORM handles this automatically, but if you see errors related to SQL syntax, ensure you are using the latest version of ESE Companion, which translates pagination to SQL Server's `OFFSET...FETCH` syntax.

#### Rate Limiting (429 Too Many Requests)

If you receive a `429` response:

- Check the `Retry-After` header for how long to wait before retrying.
- The global rate limit is configurable via `ESE_COMPANION_RATE_LIMIT` (default: 500 requests/minute per IP).
- Authentication endpoints have a stricter limit of 30 requests/minute per IP.
- If you are making many API calls programmatically, implement exponential backoff.

#### Account locked after failed login attempts

After 5 consecutive failed login attempts, the account is temporarily locked:

- First lockout: 15 minutes
- Second lockout: 30 minutes
- Third and subsequent: 60 minutes (capped, never permanent)

An admin can manually unlock an account by editing the user via **Admin > Users**.

#### Browser Cache Issues

If the UI behaves unexpectedly after an upgrade:

- Clear your browser cache and cookies.
- Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R).
- Open the browser developer tools, go to the Application tab, and clear site data.

#### Application fails to start

- Verify all required environment variables are set (especially `ESE_COMPANION_DB_*`, `ESE_COMPANION_JWT_SECRET`, and `ESE_COMPANION_ENCRYPTION_KEY`).
- Ensure `ESE_COMPANION_JWT_SECRET` and `ESE_COMPANION_ENCRYPTION_KEY` are at least 16 characters.
- Check that the companion database is reachable and the credentials are correct.
- Review the application logs for specific error messages.

#### Health probes

Use the health endpoints to diagnose issues:

```bash
# Is the process running?
curl http://localhost:8989/health/live

# Is the companion database connected?
curl http://localhost:8989/health/ready
```

- `/health/live` returns `200` if the Ktor process is running.
- `/health/ready` returns `200` only if the companion database connection is active. If it returns an error, check your companion database configuration.
