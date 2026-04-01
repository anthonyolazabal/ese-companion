#!/bin/bash
set -e

# ============================================================================
# ESE Companion E2E Test — MQTT Broker Connection with All Algorithms
#
# This script:
# 1. Logs into ESE Companion
# 2. Creates a shared role + permission for a test topic
# 3. For each of the 6 ESE hash algorithms:
#    a. Creates an MQTT user with that algorithm
#    b. Assigns the role to the user
#    c. Tests MQTT publish + subscribe with those credentials
#    d. Tests wrong password is rejected
#    e. Cleans up the user
# 4. Cleans up role + permission
#
# Prerequisites:
#   - ESE Companion running (default: http://localhost:8989)
#   - A configured ESE database connection in the companion
#   - A HiveMQ broker running with ESE enabled, pointing to that database
#   - mosquitto_pub / mosquitto_sub (mosquitto-clients package)
#   - curl, jq
#
# Usage:
#   CONNECTION_ID="your-uuid" ./tests/e2e-mqtt-test.sh
#
# Options (via environment variables):
#   COMPANION_URL       ESE Companion base URL (default: http://localhost:8989)
#   COMPANION_USER      Admin username (default: admin)
#   COMPANION_PASS      Admin password (default: admin)
#   CONNECTION_ID       UUID of the ESE database connection to use (required)
#   BROKER_HOST         MQTT broker hostname (default: localhost)
#   BROKER_PORT         MQTT broker port (default: 1883)
#   CLEANUP             Set to "false" to skip cleanup (default: true)
#   ESE_SYNC_WAIT       Seconds to wait for ESE to sync after user creation (default: 3)
# ============================================================================

COMPANION_URL="${COMPANION_URL:-http://localhost:8989}"
COMPANION_USER="${COMPANION_USER:-admin}"
COMPANION_PASS="${COMPANION_PASS:-admin}"
BROKER_HOST="${BROKER_HOST:-localhost}"
BROKER_PORT="${BROKER_PORT:-1883}"
CLEANUP="${CLEANUP:-true}"
ESE_SYNC_WAIT="${ESE_SYNC_WAIT:-3}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}PASS${NC} $1"; PASSES=$((PASSES + 1)); }
fail() { echo -e "  ${RED}FAIL${NC} $1"; FAILURES=$((FAILURES + 1)); }
info() { echo -e "  ${YELLOW}INFO${NC} $1"; }
section() { echo -e "\n${CYAN}=== $1 ===${NC}"; }

FAILURES=0
PASSES=0
TIMESTAMP=$(date +%s)
TEST_PASS="E2eTestP@ss123"
TEST_TOPIC="e2e/test/${TIMESTAMP}"
TEST_ROLE="e2e-role-${TIMESTAMP}"

# Algorithm definitions: name, iterations, extra JSON fields
ALGORITHMS=(
  "PLAIN:0:"
  "MD5:100:"
  "SHA512:100:"
  "PKCS5S2:100:"
  "BCRYPT:10:"
  "ARGON2ID:3:,\"memory\":65536"
)

# Track created entity IDs for cleanup
CREATED_USER_IDS=()
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
  exit 1
fi

echo "============================================"
echo " ESE Companion E2E MQTT Test"
echo " All 6 Hash Algorithms"
echo "============================================"
echo "Companion:   ${COMPANION_URL}"
echo "Connection:  ${CONNECTION_ID}"
echo "Broker:      ${BROKER_HOST}:${BROKER_PORT}"
echo "Test topic:  ${TEST_TOPIC}"
echo "Algorithms:  PLAIN, MD5, SHA512, PKCS5S2, BCRYPT, ARGON2ID"
echo "============================================"

# --------------------------------------------------------------------------
# Login
# --------------------------------------------------------------------------
section "Authentication"
LOGIN_RESPONSE=$(curl -sf -X POST "${COMPANION_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${COMPANION_USER}\",\"password\":\"${COMPANION_PASS}\"}" 2>&1) || {
  fail "Login failed — is ESE Companion running at ${COMPANION_URL}?"
  exit 1
}

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  fail "Failed to extract token"
  exit 1
fi
pass "Logged in as '${COMPANION_USER}'"
AUTH="Authorization: Bearer ${TOKEN}"

# --------------------------------------------------------------------------
# Create shared permission
# --------------------------------------------------------------------------
section "Setup — Permission"
PERM_RESPONSE=$(curl -sf -X POST "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/permissions" \
  -H "${AUTH}" \
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
  }" 2>&1) || { fail "Failed to create permission"; exit 1; }

CREATED_PERM_ID=$(echo "$PERM_RESPONSE" | jq -r '.id')
pass "Permission created for topic '${TEST_TOPIC}' (ID: ${CREATED_PERM_ID})"

# --------------------------------------------------------------------------
# Create shared role + assign permission
# --------------------------------------------------------------------------
section "Setup — Role"
ROLE_RESPONSE=$(curl -sf -X POST "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/roles" \
  -H "${AUTH}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"${TEST_ROLE}\", \"description\": \"E2E test role for all algorithms\"}" 2>&1) || {
  fail "Failed to create role"; exit 1;
}

CREATED_ROLE_ID=$(echo "$ROLE_RESPONSE" | jq -r '.id')
pass "Role '${TEST_ROLE}' created (ID: ${CREATED_ROLE_ID})"

curl -sf -X POST "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/roles/${CREATED_ROLE_ID}/permissions/${CREATED_PERM_ID}" \
  -H "${AUTH}" > /dev/null 2>&1 || { fail "Failed to assign permission to role"; }
pass "Permission assigned to role"

# --------------------------------------------------------------------------
# Test each algorithm
# --------------------------------------------------------------------------
test_algorithm() {
  local ALGO_NAME="$1"
  local ITERATIONS="$2"
  local EXTRA_JSON="$3"
  local USERNAME="e2e-${ALGO_NAME,,}-${TIMESTAMP}"

  section "Algorithm: ${ALGO_NAME} (iterations: ${ITERATIONS})"

  # Create user
  info "Creating user '${USERNAME}' with ${ALGO_NAME}..."
  USER_RESPONSE=$(curl -sf -X POST "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/users" \
    -H "${AUTH}" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"${USERNAME}\",
      \"password\": \"${TEST_PASS}\",
      \"algorithm\": \"${ALGO_NAME}\",
      \"iterations\": ${ITERATIONS}
      ${EXTRA_JSON}
    }" 2>&1)

  if [ $? -ne 0 ]; then
    fail "Failed to create user with ${ALGO_NAME}"
    return
  fi

  USER_ID=$(echo "$USER_RESPONSE" | jq -r '.id')
  STORED_ALGO=$(echo "$USER_RESPONSE" | jq -r '.algorithm')
  CREATED_USER_IDS+=("$USER_ID")
  pass "User created (ID: ${USER_ID}, stored algorithm: ${STORED_ALGO})"

  # Assign role
  curl -sf -X POST "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/users/${USER_ID}/roles/${CREATED_ROLE_ID}" \
    -H "${AUTH}" > /dev/null 2>&1
  if [ $? -ne 0 ]; then
    fail "Failed to assign role to user"
    return
  fi
  pass "Role assigned"

  # Wait for ESE sync
  info "Waiting ${ESE_SYNC_WAIT}s for ESE to sync..."
  sleep "$ESE_SYNC_WAIT"

  # Test publish
  info "Testing MQTT publish..."
  mosquitto_pub \
    -h "${BROKER_HOST}" \
    -p "${BROKER_PORT}" \
    -u "${USERNAME}" \
    -P "${TEST_PASS}" \
    -t "${TEST_TOPIC}" \
    -m "${ALGO_NAME}-test-${TIMESTAMP}" \
    -q 1 2>/tmp/e2e-pub-err.txt

  if [ $? -eq 0 ]; then
    pass "MQTT publish succeeded with ${ALGO_NAME}"
  else
    fail "MQTT publish failed with ${ALGO_NAME}: $(cat /tmp/e2e-pub-err.txt 2>/dev/null)"
  fi

  # Test subscribe (with timeout)
  info "Testing MQTT subscribe..."
  EXPECTED_MSG="${ALGO_NAME}-sub-${TIMESTAMP}"

  mosquitto_sub \
    -h "${BROKER_HOST}" \
    -p "${BROKER_PORT}" \
    -u "${USERNAME}" \
    -P "${TEST_PASS}" \
    -t "${TEST_TOPIC}" \
    -C 1 \
    -W 5 \
    > /tmp/e2e-sub-msg.txt 2>/tmp/e2e-sub-err.txt &
  SUB_PID=$!

  sleep 1

  mosquitto_pub \
    -h "${BROKER_HOST}" \
    -p "${BROKER_PORT}" \
    -u "${USERNAME}" \
    -P "${TEST_PASS}" \
    -t "${TEST_TOPIC}" \
    -m "${EXPECTED_MSG}" \
    -q 1 2>/dev/null

  wait $SUB_PID 2>/dev/null
  RECEIVED=$(cat /tmp/e2e-sub-msg.txt 2>/dev/null)

  if [ "$RECEIVED" = "$EXPECTED_MSG" ]; then
    pass "MQTT subscribe received correct message with ${ALGO_NAME}"
  else
    if [ -z "$RECEIVED" ]; then
      fail "MQTT subscribe timed out with ${ALGO_NAME}"
    else
      fail "MQTT subscribe got '${RECEIVED}', expected '${EXPECTED_MSG}'"
    fi
  fi

  # Test wrong password
  info "Testing wrong password..."
  mosquitto_pub \
    -h "${BROKER_HOST}" \
    -p "${BROKER_PORT}" \
    -u "${USERNAME}" \
    -P "wrong-password-123" \
    -t "${TEST_TOPIC}" \
    -m "should-fail" \
    -q 1 2>/tmp/e2e-wrongpw-err.txt

  if [ $? -ne 0 ]; then
    pass "Wrong password correctly rejected for ${ALGO_NAME}"
  else
    fail "Wrong password was NOT rejected for ${ALGO_NAME}"
  fi
}

# Run tests for each algorithm
for ALGO_DEF in "${ALGORITHMS[@]}"; do
  IFS=':' read -r ALGO_NAME ITERATIONS EXTRA_JSON <<< "$ALGO_DEF"
  test_algorithm "$ALGO_NAME" "$ITERATIONS" "$EXTRA_JSON"
done

# --------------------------------------------------------------------------
# Cleanup
# --------------------------------------------------------------------------
if [ "$CLEANUP" = "true" ]; then
  section "Cleanup"

  for UID in "${CREATED_USER_IDS[@]}"; do
    # Remove role from user
    curl -sf -X DELETE "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/users/${UID}/roles/${CREATED_ROLE_ID}" \
      -H "${AUTH}" > /dev/null 2>&1
    # Delete user
    curl -sf -X DELETE "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/users/${UID}" \
      -H "${AUTH}" > /dev/null 2>&1
  done
  info "Deleted ${#CREATED_USER_IDS[@]} test users"

  # Remove permission from role
  curl -sf -X DELETE "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/roles/${CREATED_ROLE_ID}/permissions/${CREATED_PERM_ID}" \
    -H "${AUTH}" > /dev/null 2>&1

  # Delete role
  curl -sf -X DELETE "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/roles/${CREATED_ROLE_ID}" \
    -H "${AUTH}" > /dev/null 2>&1
  info "Deleted role '${TEST_ROLE}'"

  # Delete permission
  curl -sf -X DELETE "${COMPANION_URL}/api/v1/ese/${CONNECTION_ID}/mqtt/permissions/${CREATED_PERM_ID}" \
    -H "${AUTH}" > /dev/null 2>&1
  info "Deleted permission for '${TEST_TOPIC}'"

  pass "Cleanup complete"
else
  section "Skipping Cleanup"
  info "Created entities still in database:"
  for i in "${!CREATED_USER_IDS[@]}"; do
    info "  User ID: ${CREATED_USER_IDS[$i]}"
  done
  info "  Role ID: ${CREATED_ROLE_ID}"
  info "  Permission ID: ${CREATED_PERM_ID}"
fi

# Clean temp files
rm -f /tmp/e2e-pub-err.txt /tmp/e2e-sub-msg.txt /tmp/e2e-sub-err.txt /tmp/e2e-wrongpw-err.txt

# --------------------------------------------------------------------------
# Summary
# --------------------------------------------------------------------------
TOTAL=$((PASSES + FAILURES))
echo ""
echo "============================================"
echo " Results: ${PASSES} passed, ${FAILURES} failed (${TOTAL} total)"
echo " Algorithms tested: PLAIN, MD5, SHA512, PKCS5S2, BCRYPT, ARGON2ID"
if [ $FAILURES -eq 0 ]; then
  echo -e " ${GREEN}ALL TESTS PASSED${NC}"
else
  echo -e " ${RED}${FAILURES} TEST(S) FAILED${NC}"
fi
echo "============================================"

exit $FAILURES
