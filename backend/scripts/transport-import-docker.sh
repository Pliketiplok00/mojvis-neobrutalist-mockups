#!/bin/bash
# =============================================================================
# MOJ VIS Transport Import - Standardized Docker Runner
# =============================================================================
#
# CANONICAL COMMAND:
#   cd /opt/mojvis && ./src/backend/scripts/transport-import-docker.sh
#
# WHAT IT DOES:
# 1. Pre-flight checks (DB reachable, required files exist)
# 2. Runs transport import in a temporary node:20-alpine container
# 3. Post-flight checks (SEA lines exist, departures returned)
# 4. Writes execution log to docs/transport/import_runs/
#
# ENVIRONMENT:
# - Reads DB credentials from /opt/mojvis/.env (via docker-compose)
# - Uses docker network: mojvis_mojvis_default
# - Mounts backend source into /app
#
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(dirname "$BACKEND_DIR")"
COMPOSE_DIR="${COMPOSE_DIR:-/opt/mojvis}"
DOCKER_NETWORK="${DOCKER_NETWORK:-mojvis_mojvis_default}"
API_BASE="${API_BASE:-http://localhost:3100}"

# Required files
REQUIRED_LINE_FILES=(
  "line-602.json"
  "line-612.json"
  "line-659.json"
  "line-9602.json"
)

# Expected SEA lines after import
EXPECTED_SEA_LINES=("602" "612" "659" "9602")

# Timestamp for logging
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')
TIMEZONE="Europe/Zagreb"
LOG_DIR="$REPO_ROOT/docs/transport/import_runs"
LOG_FILE="$LOG_DIR/IMPORT_${TIMESTAMP}.md"

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[PASS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[FAIL]${NC} $1"
}

log_section() {
  echo ""
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

# =============================================================================
# Pre-flight Checks
# =============================================================================

preflight_checks() {
  log_section "PRE-FLIGHT CHECKS"

  local failed=0

  # Check 1: Docker network exists
  log_info "Checking Docker network: $DOCKER_NETWORK"
  if docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
    log_success "Docker network exists"
  else
    log_error "Docker network '$DOCKER_NETWORK' not found"
    log_info "Hint: Run 'docker-compose up -d postgres' first"
    failed=1
  fi

  # Check 2: Postgres is reachable
  log_info "Checking Postgres connectivity..."
  if docker run --rm --network "$DOCKER_NETWORK" postgres:15-alpine \
    pg_isready -h postgres -p 5432 -U mojvis -d mojvis_staging >/dev/null 2>&1; then
    log_success "Postgres is reachable"
  else
    log_error "Cannot reach Postgres container"
    log_info "Hint: Ensure postgres container is running and healthy"
    failed=1
  fi

  # Check 3: Required line files exist
  log_info "Checking required line JSON files..."
  local lines_dir="$BACKEND_DIR/src/data/lines"
  for file in "${REQUIRED_LINE_FILES[@]}"; do
    if [[ -f "$lines_dir/$file" ]]; then
      log_success "Found: $file"
    else
      log_error "Missing: $file"
      failed=1
    fi
  done

  # Check 4: Holidays file exists
  log_info "Checking holidays data..."
  if [[ -f "$BACKEND_DIR/src/data/holidays-hr-2026.json" ]]; then
    log_success "Found: holidays-hr-2026.json"
  else
    log_warn "Missing: holidays-hr-2026.json (may cause issues with PRAZNIK day types)"
  fi

  # Check 5: Holidays lib exists
  if [[ -f "$BACKEND_DIR/src/lib/holidays.ts" ]]; then
    log_success "Found: src/lib/holidays.ts"
  else
    log_warn "Missing: src/lib/holidays.ts"
  fi

  if [[ $failed -eq 1 ]]; then
    log_section "PRE-FLIGHT FAILED"
    echo "Fix the above issues before running import."
    exit 1
  fi

  log_section "PRE-FLIGHT PASSED"
}

# =============================================================================
# Run Import
# =============================================================================

run_import() {
  log_section "RUNNING TRANSPORT IMPORT"

  local git_sha
  git_sha=$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo "unknown")

  log_info "Git SHA: $git_sha"
  log_info "Backend dir: $BACKEND_DIR"
  log_info "Docker network: $DOCKER_NETWORK"

  # Capture output for logging
  local output
  local exit_code

  output=$(docker run --rm \
    --network "$DOCKER_NETWORK" \
    -e DB_HOST=postgres \
    -e DB_PORT=5432 \
    -e DB_NAME=mojvis_staging \
    -e DB_USER=mojvis \
    -e DB_PASSWORD="$(grep MOJVIS_DB_PASSWORD "$COMPOSE_DIR/.env" 2>/dev/null | cut -d= -f2)" \
    -v "$BACKEND_DIR:/app" \
    -w /app \
    node:20-alpine \
    sh -c 'npm install --legacy-peer-deps 2>/dev/null && npx tsx scripts/transport-import.ts --all --dir src/data/lines' 2>&1) || exit_code=$?

  echo "$output"

  # Extract summary counts
  IMPORT_LINES=$(echo "$output" | grep -oP 'Lines imported: \K\d+' || echo "0")
  IMPORT_ROUTES=$(echo "$output" | grep -oP 'Total routes: \K\d+' || echo "0")
  IMPORT_DEPARTURES=$(echo "$output" | grep -oP 'Total departures: \K\d+' || echo "0")

  if [[ $exit_code -ne 0 ]] || ! echo "$output" | grep -q "Import SUCCESSFUL"; then
    log_error "Import failed"
    IMPORT_STATUS="FAILED"
    return 1
  fi

  log_success "Import completed"
  IMPORT_STATUS="SUCCESS"
  return 0
}

# =============================================================================
# Post-flight Checks
# =============================================================================

postflight_checks() {
  log_section "POST-FLIGHT CHECKS"

  local failed=0

  # Check 1: SEA lines endpoint returns expected lines
  log_info "Checking SEA lines via API..."
  local lines_response
  lines_response=$(curl -s "$API_BASE/transport/sea/lines" 2>/dev/null || echo "{}")

  local lines_count
  lines_count=$(echo "$lines_response" | jq '.lines | length' 2>/dev/null || echo "0")

  if [[ "$lines_count" -ge 4 ]]; then
    log_success "API returns $lines_count SEA lines (expected >= 4)"
  else
    log_error "API returns only $lines_count SEA lines (expected >= 4)"
    failed=1
  fi

  # Check 2: Line 602 returns departures for a known-good date
  log_info "Checking line 602 departures for 2026-07-15..."
  local line_602_id
  line_602_id=$(echo "$lines_response" | jq -r '.lines[] | select(.name | contains("Trajekt") or contains("Vis – Split")) | .id' | head -1)

  if [[ -n "$line_602_id" && "$line_602_id" != "null" ]]; then
    local deps_response
    deps_response=$(curl -s "$API_BASE/transport/sea/lines/$line_602_id/departures?date=2026-07-15&direction=0" 2>/dev/null || echo "{}")
    local deps_count
    deps_count=$(echo "$deps_response" | jq '.departures | length' 2>/dev/null || echo "0")

    if [[ "$deps_count" -gt 0 ]]; then
      log_success "Line 602 returns $deps_count departures for 2026-07-15"
    else
      log_error "Line 602 returns 0 departures for 2026-07-15 (expected > 0)"
      failed=1
    fi
  else
    log_warn "Could not find line 602 ID - skipping departure check"
  fi

  # Check 3: Previously failing date (2026-10-15)
  if [[ -n "$line_602_id" && "$line_602_id" != "null" ]]; then
    log_info "Checking line 602 departures for 2026-10-15 (previously failing)..."
    local oct_response
    oct_response=$(curl -s "$API_BASE/transport/sea/lines/$line_602_id/departures?date=2026-10-15&direction=0" 2>/dev/null || echo "{}")
    local oct_count
    oct_count=$(echo "$oct_response" | jq '.departures | length' 2>/dev/null || echo "0")

    if [[ "$oct_count" -gt 0 ]]; then
      log_success "Line 602 returns $oct_count departures for 2026-10-15 (OFF-B season)"
    else
      log_error "Line 602 returns 0 departures for 2026-10-15 (expected > 0)"
      failed=1
    fi
  fi

  if [[ $failed -eq 1 ]]; then
    log_section "POST-FLIGHT FAILED"
    POSTFLIGHT_STATUS="FAILED"
    return 1
  fi

  log_section "POST-FLIGHT PASSED"
  POSTFLIGHT_STATUS="PASSED"
  return 0
}

# =============================================================================
# Write Execution Log
# =============================================================================

write_execution_log() {
  log_section "WRITING EXECUTION LOG"

  mkdir -p "$LOG_DIR"

  local git_sha
  git_sha=$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo "unknown")
  local git_branch
  git_branch=$(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo "unknown")

  local tz_timestamp
  tz_timestamp=$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M:%S %Z')

  cat > "$LOG_FILE" <<EOF
# Transport Import Execution Log

**Timestamp**: $tz_timestamp
**Git Branch**: $git_branch
**Git SHA**: $git_sha

## Command Executed

\`\`\`bash
cd /opt/mojvis && ./src/backend/scripts/transport-import-docker.sh
\`\`\`

## Import Summary

| Metric | Count |
|--------|-------|
| Lines | $IMPORT_LINES |
| Routes | $IMPORT_ROUTES |
| Departures | $IMPORT_DEPARTURES |

## Status

| Check | Status |
|-------|--------|
| Pre-flight | PASSED |
| Import | $IMPORT_STATUS |
| Post-flight | $POSTFLIGHT_STATUS |

## Final Verdict

**${FINAL_VERDICT}**

---
*Generated by transport-import-docker.sh*
EOF

  log_success "Log written to: $LOG_FILE"
}

# =============================================================================
# Main
# =============================================================================

main() {
  echo ""
  echo "============================================================"
  echo "MOJ VIS Transport Import - Standardized Docker Runner"
  echo "============================================================"
  echo ""

  # Initialize status
  IMPORT_STATUS="NOT_RUN"
  POSTFLIGHT_STATUS="NOT_RUN"
  IMPORT_LINES=0
  IMPORT_ROUTES=0
  IMPORT_DEPARTURES=0
  FINAL_VERDICT="UNKNOWN"

  # Run pre-flight
  preflight_checks

  # Run import
  if run_import; then
    # Run post-flight only if import succeeded
    if postflight_checks; then
      FINAL_VERDICT="PASS"
    else
      FINAL_VERDICT="FAIL (post-flight checks failed)"
    fi
  else
    FINAL_VERDICT="FAIL (import failed)"
  fi

  # Write log
  write_execution_log

  # Final summary
  log_section "FINAL RESULT"
  if [[ "$FINAL_VERDICT" == "PASS" ]]; then
    log_success "VERDICT: $FINAL_VERDICT"
    log_info "Lines: $IMPORT_LINES | Routes: $IMPORT_ROUTES | Departures: $IMPORT_DEPARTURES"
    exit 0
  else
    log_error "VERDICT: $FINAL_VERDICT"
    exit 1
  fi
}

# Run main
main "$@"
