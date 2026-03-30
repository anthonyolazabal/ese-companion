# ESE Companion v2 -- Quick Start Guide

Get up and running in 5 minutes.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed
- Git installed
- Ports 5432, 5433, 3306, 1433, 8989, and 9090 available on your machine

---

## 1. Clone the Repository

```bash
git clone https://github.com/anthonyolazabal/ese-companion.git
cd ese-companion
```

---

## 2. Start the Databases

The included `docker-compose.yaml` starts four containers:

- **companion-db** -- PostgreSQL 16 for ESE Companion application data (port 5432)
- **ese-postgresql** -- PostgreSQL 16 as a sample ESE database (port 5433)
- **ese-mysql** -- MySQL 8.4 as a sample ESE database (port 3306)
- **ese-mssql** -- Azure SQL Edge as a sample ESE database (port 1433)

```bash
docker compose up -d
```

Wait for all containers to be healthy:

```bash
docker compose ps
```

You should see all services in the `running` state with `(healthy)` status. The SQL Server init container (`ese-mssql-init`) will exit after loading the schema -- that is expected.

---

## 3. Start ESE Companion

You have two options: run the pre-built Docker image, or run locally for development.

### Option A: Docker Image (Recommended)

```bash
docker run -d --name ese-companion \
  --network host \
  -e ESE_COMPANION_DB_TYPE=postgresql \
  -e ESE_COMPANION_DB_HOST=localhost \
  -e ESE_COMPANION_DB_PORT=5432 \
  -e ESE_COMPANION_DB_NAME=companion \
  -e ESE_COMPANION_DB_USER=companion \
  -e ESE_COMPANION_DB_PASSWORD=companion \
  -e ESE_COMPANION_JWT_SECRET=change-me-min-16-chars \
  -e ESE_COMPANION_ENCRYPTION_KEY=change-me-min-16-chars \
  -e ESE_COMPANION_ADMIN_USERNAME=admin \
  -e ESE_COMPANION_ADMIN_PASSWORD=admin \
  -e ESE_COMPANION_ADMIN_EMAIL=admin@example.com \
  anthonyolazabal/ese-companion:2.0.0
```

The application is available at:

- **HTTP:** http://localhost:8989
- **HTTPS:** https://localhost:9090 (self-signed certificate)

### Option B: Local Development

Start the backend and frontend in separate terminals.

**Terminal 1 -- Backend:**

```bash
cd backend
./gradlew run
```

The backend requires the following environment variables (set them before running, or use a `.env` file):

```bash
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
```

**Terminal 2 -- Frontend:**

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend dev server starts at http://localhost:5173 and proxies API requests to the backend on port 8989.

---

## 4. Log In

Open your browser and navigate to the application URL.

- **Username:** `admin`
- **Password:** `admin`

You will see the login page with the ESE Companion logo and a simple username/password form. Enter the default credentials and click **Login**.

After login, you land on the **Dashboard**. Since no ESE database connections are configured yet, the dashboard displays an empty state with a prompt to add your first connection.

---

## 5. Add Your First Database Connection

1. In the sidebar, click **Connections** (or use the quick action on the dashboard if available).
2. Click the **Add Connection** button.
3. A drawer slides in from the right with a connection form. Fill in the details for the sample PostgreSQL ESE database:

   | Field | Value |
   |---|---|
   | Name | My ESE PostgreSQL |
   | Description | Local dev ESE database |
   | Database Type | PostgreSQL |
   | Host | localhost |
   | Port | 5433 |
   | Database Name | hivemq_ese |
   | Username | ese |
   | Password | ese |
   | SSL Enabled | Off |

4. Click **Test Connection** to verify connectivity. A success toast notification confirms the connection works.
5. Click **Save**. The new connection appears in the connections list with a green health dot indicating it is reachable.

You can repeat this for the MySQL and SQL Server sample databases using the credentials from `docker-compose.yaml`:

| Database | Host | Port | DB Name | User | Password |
|---|---|---|---|---|---|
| PostgreSQL | localhost | 5433 | hivemq_ese | ese | ese |
| MySQL | localhost | 3306 | hivemq_ese | ese | ese |
| SQL Server | localhost | 1433 | hivemq_ese | sa | Ese_Comp@nion_2026! |

---

## 6. Browse ESE Entities

1. Click on a connection name (e.g., **My ESE PostgreSQL**) in the sidebar or connections list.
2. You land on the **Connection Detail** page. At the top, you see the connection health status and entity count statistics.
3. Three domain tabs are displayed: **MQTT**, **Control Center**, and **REST API**.
4. Each domain tab contains sub-tabs for **Users**, **Roles**, and **Permissions**.

By default, the MQTT domain is selected. You will see:

- **Users tab** -- An empty table (no ESE users created yet). Click **Create User** to add your first MQTT user. A drawer opens where you pick a username, password, hash algorithm (default: PKCS5S2), and iterations.
- **Roles tab** -- An empty table. Click **Create Role** to add a role with a description.
- **Permissions tab** -- An empty table. Click **Create Permission** to add a topic-based permission with publish/subscribe flags, QoS levels, retained message, and shared subscription settings.

Switch to the **Control Center** or **REST API** tabs to see their pre-loaded default permissions (49 for CC, 47 for REST API). These permissions are read-only and defined by HiveMQ ESE.

---

## 7. Next Steps

- **Create ESE users** -- Add MQTT, Control Center, or REST API users with secure password hashing.
- **Set up roles and permissions** -- Define roles, assign permissions to roles, then assign roles to users.
- **Manage companion users** -- Go to **Admin > Users** to create additional ESE Companion users with `admin`, `readwrite`, or `readonly` roles.
- **Generate API keys** -- Go to **Settings > API Keys** to create scoped API keys for programmatic access.
- **Explore the API** -- Visit http://localhost:8989/api/v1/docs for the interactive Swagger UI.
- **Review audit logs** -- Go to **Admin > Audit Logs** to see a record of all actions performed in the application.

---

## Stopping Everything

```bash
# Stop ESE Companion (if running via Docker)
docker stop ese-companion && docker rm ese-companion

# Stop the databases
docker compose down

# To also remove database volumes (all data will be lost):
docker compose down -v
```
