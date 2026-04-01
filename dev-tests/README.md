# ESE Companion — Development Test Environment

Full end-to-end test environment with HiveMQ Enterprise broker, ESE extension, and all 3 database backends.

## Architecture

```
                          ┌─────────────────────────┐
                          │   HiveMQ Enterprise      │
                          │                         │
  Port 1883 ─────────────▶│  postgresql-listener    │──▶ ese-postgresql (5432)
  Port 1884 ─────────────▶│  mysql-listener         │──▶ ese-mysql (3306)
  Port 1885 ─────────────▶│  sqlserver-listener     │──▶ ese-mssql (1433)
  Port 8080 ─────────────▶│  Control Center         │
                          └─────────────────────────┘

  Port 8989 ─────────────▶ ESE Companion (HTTP)
  Port 9090 ─────────────▶ ESE Companion (HTTPS)
                                │
                                ▼
                          companion-db (PostgreSQL 5432)
```

## Quick Start

```bash
# Start everything
cd dev-tests
docker compose up -d

# Wait for all services to be ready (~30 seconds)
# Then run the full test suite
./run-all-tests.sh
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| ese-postgresql | 5432 | PostgreSQL ESE database |
| ese-mysql | 3306 | MySQL ESE database |
| ese-mssql | 1433 | SQL Server ESE database |
| hivemq | 1883 | MQTT listener → PostgreSQL |
| hivemq | 1884 | MQTT listener → MySQL |
| hivemq | 1885 | MQTT listener → SQL Server |
| hivemq | 8080 | HiveMQ Control Center |
| companion-db | 5432 | ESE Companion app database |
| ese-companion | 8989 | ESE Companion (HTTP) |
| ese-companion | 9090 | ESE Companion (HTTPS) |

## Test Scripts

### Full Suite
```bash
./run-all-tests.sh
```
Runs all 6 hash algorithms against all 3 databases (18 connection tests total).

### Single Database
```bash
CONNECTION_ID="<uuid>" BROKER_PORT=1883 ./e2e-mqtt-test.sh
```

## Prerequisites

- Docker and Docker Compose
- `mosquitto-clients` (`brew install mosquitto` on macOS)
- `jq` (`brew install jq` on macOS)
- HiveMQ Enterprise license (place in `hivemq/license/` if required)

## HiveMQ Configuration

- `hivemq/config.xml` — Broker config with 3 TCP listeners
- `hivemq/extensions/hivemq-enterprise-security-extension/enterprise-security-extension.xml` — ESE config with 3 SQL realms and 3 listener pipelines

## Credentials

| Database | User | Password |
|----------|------|----------|
| PostgreSQL | ese | ese |
| MySQL | ese | ese |
| SQL Server | sa | Ese_Comp@nion_2026! |
| ESE Companion | admin | admin |
