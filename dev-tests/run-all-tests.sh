#!/bin/bash
set -e

# ============================================================================
# ESE Companion — Full E2E Test Suite
#
# Runs the MQTT connection test against all 3 database backends via HiveMQ ESE.
#
# Prerequisites:
#   - docker compose up -d (from this directory)
#   - mosquitto-clients installed
#   - jq installed
#
# This script:
#   1. Waits for ESE Companion to be ready
#   2. Creates database connections in ESE Companion for all 3 backends
#   3. Runs the E2E MQTT test for each database/listener combination
# ============================================================================

COMPANION_URL="${COMPANION_URL:-http://localhost:8989}"
COMPANION_USER="${COMPANION_USER:-admin}"
COMPANION_PASS="${COMPANION_PASS:-admin}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${YELLOW}INFO${NC} $1"; }
section() { echo -e "\n${CYAN}══════════════════════════════════════════════${NC}"; echo -e "${CYAN} $1${NC}"; echo -e "${CYAN}══════════════════════════════════════════════${NC}"; }

TOTAL_FAILURES=0

# --------------------------------------------------------------------------
# Wait for ESE Companion
# --------------------------------------------------------------------------
info "Waiting for ESE Companion at ${COMPANION_URL}..."
for i in $(seq 1 30); do
  if curl -sf "${COMPANION_URL}/health/live" > /dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Error: ESE Companion did not start within 60 seconds"
    exit 1
  fi
  sleep 2
done
info "ESE Companion is ready"

# --------------------------------------------------------------------------
# Login
# --------------------------------------------------------------------------
info "Logging in..."
TOKEN=$(curl -sf -X POST "${COMPANION_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${COMPANION_USER}\",\"password\":\"${COMPANION_PASS}\"}" | jq -r '.accessToken')

AUTH="Authorization: Bearer ${TOKEN}"

# --------------------------------------------------------------------------
# Create connections (if they don't exist)
# --------------------------------------------------------------------------
create_connection() {
  local NAME="$1"
  local DB_TYPE="$2"
  local HOST="$3"
  local PORT="$4"
  local DB_NAME="$5"
  local DB_USER="$6"
  local DB_PASS="$7"

  # Check if connection already exists
  EXISTING=$(curl -sf "${COMPANION_URL}/api/v1/connections?page=1&size=100" \
    -H "${AUTH}" | jq -r ".items[] | select(.name==\"${NAME}\") | .id")

  if [ -n "$EXISTING" ]; then
    info "Connection '${NAME}' already exists (ID: ${EXISTING})"
    echo "$EXISTING"
    return
  fi

  RESPONSE=$(curl -sf -X POST "${COMPANION_URL}/api/v1/connections" \
    -H "${AUTH}" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"${NAME}\",
      \"dbType\": \"${DB_TYPE}\",
      \"host\": \"${HOST}\",
      \"port\": ${PORT},
      \"databaseName\": \"${DB_NAME}\",
      \"username\": \"${DB_USER}\",
      \"password\": \"${DB_PASS}\"
    }")

  local CONN_ID=$(echo "$RESPONSE" | jq -r '.id')
  info "Created connection '${NAME}' (ID: ${CONN_ID})"
  echo "$CONN_ID"
}

section "Creating Database Connections"

PG_CONN_ID=$(create_connection "Test PostgreSQL" "POSTGRESQL" "ese-postgresql" 5432 "hivemq_ese" "ese" "ese")
MYSQL_CONN_ID=$(create_connection "Test MySQL" "MYSQL" "ese-mysql" 3306 "hivemq_ese" "ese" "ese")
MSSQL_CONN_ID=$(create_connection "Test SQL Server" "SQLSERVER" "ese-mssql" 1433 "hivemq_ese" "sa" "Ese_Comp@nion_2026!")

# --------------------------------------------------------------------------
# Run tests for each database
# --------------------------------------------------------------------------

run_test() {
  local DB_NAME="$1"
  local CONN_ID="$2"
  local BROKER_PORT="$3"

  section "Testing ${DB_NAME} (broker port ${BROKER_PORT})"

  CONNECTION_ID="${CONN_ID}" \
  COMPANION_URL="${COMPANION_URL}" \
  BROKER_HOST="${BROKER_HOST:-localhost}" \
  BROKER_PORT="${BROKER_PORT}" \
  ESE_SYNC_WAIT="${ESE_SYNC_WAIT:-5}" \
  bash "${SCRIPT_DIR}/e2e-mqtt-test.sh" || TOTAL_FAILURES=$((TOTAL_FAILURES + $?))
}

run_test "PostgreSQL" "$PG_CONN_ID" 1883
run_test "MySQL" "$MYSQL_CONN_ID" 1884
run_test "SQL Server" "$MSSQL_CONN_ID" 1885

# --------------------------------------------------------------------------
# Summary
# --------------------------------------------------------------------------
echo ""
echo "============================================"
echo " Full E2E Test Suite — Summary"
echo "============================================"
echo " PostgreSQL (port 1883): tested all 6 algorithms"
echo " MySQL      (port 1884): tested all 6 algorithms"
echo " SQL Server (port 1885): tested all 6 algorithms"
echo ""
if [ $TOTAL_FAILURES -eq 0 ]; then
  echo -e " ${GREEN}ALL TESTS PASSED${NC}"
else
  echo -e " ${RED}${TOTAL_FAILURES} FAILURE(S) ACROSS ALL DATABASES${NC}"
fi
echo "============================================"

exit $TOTAL_FAILURES
