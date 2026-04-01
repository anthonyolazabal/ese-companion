#!/bin/bash
set -e

# ============================================================================
# ESE Companion E2E Test — MQTT Broker Connection with ESE Credentials
#
# This script:
# 1. Logs into ESE Companion
# 2. Creates an MQTT user with a known password via the API
# 3. Creates a role and permission, assigns them to the user
# 4. Tests MQTT connection to a HiveMQ broker using those credentials
# 5. Publishes and subscribes to verify authorization
# 6. Cleans up created entities
#
# Prerequisites:
#   - ESE Companion running (default: http://localhost:8989)
#   - A configured ESE database connection in the companion
#   - A HiveMQ broker running with ESE enabled, pointing to that database
#   - mosquitto_pub / mosquitto_sub (mosquitto-clients package)
#   - curl, jq
#
# Usage:
#   ./tests/e2e-mqtt-test.sh [OPTIONS]
#
# Options (via environment variables):
#   COMPANION_URL       ESE Companion base URL (default: http://localhost:8989)
#   COMPANION_USER      Admin username (default: admin)
#   COMPANION_PASS      Admin password (default: admin)
#   CONNECTION_ID       UUID of the ESE database connection to use (required)
#   BROKER_HOST         MQTT broker hostname (default: localhost)
#   BROKER_PORT         MQTT broker port (default: 1883)
#   CLEANUP             Set to "false" to skip cleanup (default: true)
# ============================================================================

COMPANION_URL="${COMPANION_URL:-http://localhost:8989}"
COMPANION_USER="${COMPANION_USER:-admin}"
COMPANION_PASS="${COMPANION_PASS:-admin}"
BROKER_HOST="${BROKER_HOST:-localhost}"
BROKER_PORT="${BROKER_PORT:-1883}"
CLEANUP="${CLEANUP:-true}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC} $1"; }
fail() { echo -e "${RED}FAIL${NC} $1"; FAILURES=$((FAILURES + 1)); }
info() { echo -e "${YELLOW}INFO${NC} $1"; }

FAILURES=0
TEST_USER="e2e-test-user-$(date +%s)"
TEST_PASS="E2eTestP@ss123"
TEST_ROLE="e2e-test-role-$(date +%s)"
TEST_TOPIC="e2e/test/$(date +%s)"
CREATED_USER_ID=""
CREATED_ROLE_ID=""
CREATED_PERM_ID=""

# Check prerequisites
for cmd in curl jq mosquitto_pub mosquitto_sub; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "Error: $cmd is required but not installed."
    exit 1
  fi
done

if [ -z "$CONNECTION_ID" ]; then
  echo "Error: CONNECTION_ID environment variable is required."
  echo ""
  echo "Get your connection IDs with:"
  echo "  curl -s ${COMPANION_URL}/api/v1/connections -H 'Authorization: Bearer <token>' | jq '.items[] | {id, name}'"
  echo ""
  exit 1
fi

echo "============================================"
echo " ESE Companion E2E MQTT Test"
echo "============================================"
echo "Companion:   ${COMPANION_URL}"
echo "Connection:  ${CONNECTION_ID}"
echo "Broker:      ${BROKER_HOST}:${BROKER_PORT}"
echo "Test user:   ${TEST_USER}"
echo "Test topic:  ${TEST_TOPIC}"
echo "============================================"
echo ""

# --------------------------------------------------------------------------
# Step 1: Login to ESE Companion
# --------------------------------------------------------------------------
info "Logging in to ESE Companion..."
LOGIN_RESPONSE=$(curl -sf -X POST "${COMPANION_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${COMPANION_USER}\",\"password\":\"${COMPANION_PASS}\"}")

if [ $? -ne 0 ]; then
  fail "Login failed"
  exit 1
fi

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  fail "Failed to extract token from login response"
  exit 1
fi
pass "Logged in successfully"

AUTH_HEADER="Authorization: Bearer ${TOKEN}"

# --------------------------------------------------------------------------
# Step 2: Create MQTT permission (topic-based)
# --------------------------------------------------------------------------
info "Creating MQTT permission for topic '${TEST_TOPIC}'..."
PERM_RESPONSE=$(curl -sf -X POST "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/permissions" \
  -H "${AUTH_HEADER}" \
  -H "Content-Type: application/json" \
  -d "{
    \"topic\": \"${TEST_TOPIC}\",
    \"publishAllowed\": true,
    \"subscribeAllowed\": true,
    \"qos0Allowed\": true,
    \"qos1Allowed\": true,
    \"qos2Allowed\": false,
    \"retainedMsgsAllowed\": false,
    \"sharedSubAllowed\": false
  }")

if [ $? -ne 0 ]; then
  fail "Failed to create permission"
  exit 1
fi

CREATED_PERM_ID=$(echo "$PERM_RESPONSE" | jq -r '.id')
pass "Permission created (ID: ${CREATED_PERM_ID})"

# --------------------------------------------------------------------------
# Step 3: Create MQTT role
# --------------------------------------------------------------------------
info "Creating MQTT role '${TEST_ROLE}'..."
ROLE_RESPONSE=$(curl -sf -X POST "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/roles" \
  -H "${AUTH_HEADER}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"${TEST_ROLE}\", \"description\": \"E2E test role\"}")

if [ $? -ne 0 ]; then
  fail "Failed to create role"
  exit 1
fi

CREATED_ROLE_ID=$(echo "$ROLE_RESPONSE" | jq -r '.id')
pass "Role created (ID: ${CREATED_ROLE_ID})"

# --------------------------------------------------------------------------
# Step 4: Assign permission to role
# --------------------------------------------------------------------------
info "Assigning permission to role..."
curl -sf -X POST "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/roles/${CREATED_ROLE_ID}/permissions/${CREATED_PERM_ID}" \
  -H "${AUTH_HEADER}" > /dev/null

if [ $? -ne 0 ]; then
  fail "Failed to assign permission to role"
else
  pass "Permission assigned to role"
fi

# --------------------------------------------------------------------------
# Step 5: Create MQTT user
# --------------------------------------------------------------------------
info "Creating MQTT user '${TEST_USER}'..."
USER_RESPONSE=$(curl -sf -X POST "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/users" \
  -H "${AUTH_HEADER}" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${TEST_USER}\",
    \"password\": \"${TEST_PASS}\",
    \"algorithm\": \"PKCS5S2\",
    \"iterations\": 100
  }")

if [ $? -ne 0 ]; then
  fail "Failed to create user"
  exit 1
fi

CREATED_USER_ID=$(echo "$USER_RESPONSE" | jq -r '.id')
pass "User created (ID: ${CREATED_USER_ID})"

# --------------------------------------------------------------------------
# Step 6: Assign role to user
# --------------------------------------------------------------------------
info "Assigning role to user..."
curl -sf -X POST "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/users/${CREATED_USER_ID}/roles/${CREATED_ROLE_ID}" \
  -H "${AUTH_HEADER}" > /dev/null

if [ $? -ne 0 ]; then
  fail "Failed to assign role to user"
else
  pass "Role assigned to user"
fi

# --------------------------------------------------------------------------
# Step 7: Wait for ESE to pick up the changes
# --------------------------------------------------------------------------
info "Waiting 3 seconds for ESE to sync..."
sleep 3

# --------------------------------------------------------------------------
# Step 8: Test MQTT subscribe + publish
# --------------------------------------------------------------------------
info "Testing MQTT connection..."

# Start subscriber in background
RECEIVED_MSG=""
mosquitto_sub \
  -h "${BROKER_HOST}" \
  -p "${BROKER_PORT}" \
  -u "${TEST_USER}" \
  -P "${TEST_PASS}" \
  -t "${TEST_TOPIC}" \
  -C 1 \
  -W 10 \
  > /tmp/e2e-mqtt-msg.txt 2>/tmp/e2e-mqtt-sub-err.txt &
SUB_PID=$!

sleep 1

# Publish a message
TEST_PAYLOAD="e2e-test-$(date +%s)"
info "Publishing message to '${TEST_TOPIC}'..."
mosquitto_pub \
  -h "${BROKER_HOST}" \
  -p "${BROKER_PORT}" \
  -u "${TEST_USER}" \
  -P "${TEST_PASS}" \
  -t "${TEST_TOPIC}" \
  -m "${TEST_PAYLOAD}" \
  -q 1 2>/tmp/e2e-mqtt-pub-err.txt

if [ $? -ne 0 ]; then
  fail "MQTT publish failed: $(cat /tmp/e2e-mqtt-pub-err.txt)"
else
  pass "MQTT publish succeeded"
fi

# Wait for subscriber
wait $SUB_PID 2>/dev/null
RECEIVED_MSG=$(cat /tmp/e2e-mqtt-msg.txt 2>/dev/null)

if [ "$RECEIVED_MSG" = "$TEST_PAYLOAD" ]; then
  pass "MQTT subscribe received correct message: '${RECEIVED_MSG}'"
else
  if [ -z "$RECEIVED_MSG" ]; then
    fail "MQTT subscribe timed out — no message received"
    info "Subscriber error: $(cat /tmp/e2e-mqtt-sub-err.txt 2>/dev/null)"
  else
    fail "MQTT subscribe received unexpected message: '${RECEIVED_MSG}' (expected '${TEST_PAYLOAD}')"
  fi
fi

# --------------------------------------------------------------------------
# Step 9: Test unauthorized topic (should fail)
# --------------------------------------------------------------------------
info "Testing unauthorized topic (should be rejected)..."
mosquitto_pub \
  -h "${BROKER_HOST}" \
  -p "${BROKER_PORT}" \
  -u "${TEST_USER}" \
  -P "${TEST_PASS}" \
  -t "unauthorized/topic" \
  -m "should-fail" \
  -q 1 2>/tmp/e2e-mqtt-unauth-err.txt

# Note: Whether this fails depends on the broker's ESE configuration
# Some brokers disconnect, others silently drop the message
info "Unauthorized publish completed (check broker logs for rejection)"

# --------------------------------------------------------------------------
# Step 10: Test wrong password (should fail)
# --------------------------------------------------------------------------
info "Testing wrong password (should be rejected)..."
mosquitto_pub \
  -h "${BROKER_HOST}" \
  -p "${BROKER_PORT}" \
  -u "${TEST_USER}" \
  -P "wrong-password" \
  -t "${TEST_TOPIC}" \
  -m "should-fail" \
  -q 1 2>/tmp/e2e-mqtt-wrongpw-err.txt

if [ $? -ne 0 ]; then
  pass "Wrong password correctly rejected"
else
  fail "Wrong password was not rejected"
fi

# --------------------------------------------------------------------------
# Step 11: Cleanup
# --------------------------------------------------------------------------
if [ "$CLEANUP" = "true" ]; then
  info "Cleaning up test entities..."

  # Remove role from user
  curl -sf -X DELETE "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/users/${CREATED_USER_ID}/roles/${CREATED_ROLE_ID}" \
    -H "${AUTH_HEADER}" > /dev/null 2>&1

  # Remove permission from role
  curl -sf -X DELETE "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/roles/${CREATED_ROLE_ID}/permissions/${CREATED_PERM_ID}" \
    -H "${AUTH_HEADER}" > /dev/null 2>&1

  # Delete user
  curl -sf -X DELETE "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/users/${CREATED_USER_ID}" \
    -H "${AUTH_HEADER}" > /dev/null 2>&1

  # Delete role
  curl -sf -X DELETE "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/roles/${CREATED_ROLE_ID}" \
    -H "${AUTH_HEADER}" > /dev/null 2>&1

  # Delete permission
  curl -sf -X DELETE "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/permissions/${CREATED_PERM_ID}" \
    -H "${AUTH_HEADER}" > /dev/null 2>&1

  pass "Cleanup complete"
else
  info "Skipping cleanup (CLEANUP=false)"
  info "Created entities:"
  info "  User: ${CREATED_USER_ID} (${TEST_USER})"
  info "  Role: ${CREATED_ROLE_ID} (${TEST_ROLE})"
  info "  Permission: ${CREATED_PERM_ID} (${TEST_TOPIC})"
fi

# Clean temp files
rm -f /tmp/e2e-mqtt-msg.txt /tmp/e2e-mqtt-sub-err.txt /tmp/e2e-mqtt-pub-err.txt /tmp/e2e-mqtt-unauth-err.txt /tmp/e2e-mqtt-wrongpw-err.txt

# --------------------------------------------------------------------------
# Summary
# --------------------------------------------------------------------------
echo ""
echo "============================================"
if [ $FAILURES -eq 0 ]; then
  echo -e " ${GREEN}ALL TESTS PASSED${NC}"
else
  echo -e " ${RED}${FAILURES} TEST(S) FAILED${NC}"
fi
echo "============================================"

exit $FAILURES
