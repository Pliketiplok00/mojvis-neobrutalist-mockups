#!/bin/bash
# =============================================================================
# MOJ VIS Transport Import - Standardized Docker Runner
# =============================================================================
#
# CANONICAL COMMAND:
#   cd /opt/mojvis && ./src/backend/scripts/transport-import-docker.sh
#
# WHAT IT DOES:
# 1. Pre-flight checks (Docker, DB, required files)
# 2. Runs transport import in a temporary node:20-alpine container
# 3. Post-flight API checks with detailed departure verification
# 4. Writes timestamped execution log to docs/transport/import_runs/
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
ENV_LABEL="${ENV_LABEL:-staging}"

# Required files
REQUIRED_LINE_FILES=(
  "line-602.json"
  "line-612.json"
  "line-659.json"
  "line-9602.json"
)

# Timestamp for logging (CET timezone)
TIMEZONE="Europe/Zagreb"
TIMESTAMP=$(TZ="$TIMEZONE" date '+%Y-%m-%d_%H-%M-%S')
LOG_DIR="$REPO_ROOT/docs/transport/import_runs"
LOG_FILE="$LOG_DIR/IMPORT_${TIMESTAMP}_CET.md"

# Host information
HOSTNAME_LABEL=$(hostname 2>/dev/null || echo "unknown")

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

  # Check 0: Docker is available
  log_info "Checking Docker availability..."
  if command -v docker &>/dev/null && docker info &>/dev/null; then
    log_success "Docker is available"
  else
    log_error "Docker is not available or not running"
    log_info "Hint: Ensure Docker daemon is running"
    failed=1
  fi

  # Check 1: Backend directory exists
  log_info "Checking backend directory..."
  if [[ -d "$BACKEND_DIR" ]]; then
    log_success "Backend dir exists: $BACKEND_DIR"
  else
    log_error "Backend directory not found: $BACKEND_DIR"
    failed=1
  fi

  # Check 2: Transport import script exists
  log_info "Checking transport-import.ts script..."
  if [[ -f "$BACKEND_DIR/scripts/transport-import.ts" ]]; then
    log_success "Found: scripts/transport-import.ts"
  else
    log_error "Missing: scripts/transport-import.ts"
    failed=1
  fi

  # Check 3: Lines directory exists with files
  log_info "Checking src/data/lines directory..."
  local lines_dir="$BACKEND_DIR/src/data/lines"
  if [[ -d "$lines_dir" ]]; then
    log_success "Found: src/data/lines/"
  else
    log_error "Missing: src/data/lines/"
    failed=1
  fi

  # Check 4: Required line files exist
  log_info "Checking required line JSON files..."
  for file in "${REQUIRED_LINE_FILES[@]}"; do
    if [[ -f "$lines_dir/$file" ]]; then
      log_success "Found: $file"
    else
      log_error "Missing: $file"
      failed=1
    fi
  done

  # Check 5: Docker network exists
  log_info "Checking Docker network: $DOCKER_NETWORK"
  if docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
    log_success "Docker network exists"
  else
    log_error "Docker network '$DOCKER_NETWORK' not found"
    log_info "Hint: Run 'docker-compose up -d postgres' first"
    failed=1
  fi

  # Check 6: Postgres is reachable
  log_info "Checking Postgres connectivity..."
  if docker run --rm --network "$DOCKER_NETWORK" postgres:15-alpine \
    pg_isready -h postgres -p 5432 -U mojvis -d mojvis_staging >/dev/null 2>&1; then
    log_success "Postgres is reachable"
  else
    log_error "Cannot reach Postgres container"
    log_info "Hint: Ensure postgres container is running and healthy"
    failed=1
  fi

  # Check 7: Holidays file (warning only)
  log_info "Checking holidays data..."
  if [[ -f "$BACKEND_DIR/src/data/holidays-hr-2026.json" ]]; then
    log_success "Found: holidays-hr-2026.json"
  else
    log_warn "Missing: holidays-hr-2026.json (may cause issues with PRAZNIK day types)"
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

  GIT_SHA=$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo "unknown")
  GIT_BRANCH=$(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo "unknown")

  log_info "Host: $HOSTNAME_LABEL"
  log_info "Environment: $ENV_LABEL"
  log_info "Git SHA: $GIT_SHA"
  log_info "Git Branch: $GIT_BRANCH"
  log_info "Backend dir: $BACKEND_DIR"
  log_info "Docker network: $DOCKER_NETWORK"

  # Build the full command for logging
  IMPORT_COMMAND="docker run --rm --network $DOCKER_NETWORK -e DB_HOST=postgres -e DB_PORT=5432 -e DB_NAME=mojvis_staging -e DB_USER=mojvis -e DB_PASSWORD=*** -v $BACKEND_DIR:/app -w /app node:20-alpine sh -c 'npm install --legacy-peer-deps && npx tsx scripts/transport-import.ts --all --dir src/data/lines'"

  # Capture output for logging
  local output
  local exit_code=0

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
  IMPORT_OUTPUT="$output"

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

  # Initialize postflight results for logging
  POSTFLIGHT_RESULTS=""

  # Check 1: SEA lines endpoint returns expected lines
  log_info "Checking SEA lines via API..."
  local lines_response
  lines_response=$(curl -s "$API_BASE/transport/sea/lines" 2>/dev/null || echo "{}")

  local lines_count
  lines_count=$(echo "$lines_response" | jq '.lines | length' 2>/dev/null || echo "0")

  if [[ "$lines_count" -eq 4 ]]; then
    log_success "API returns $lines_count SEA lines (expected exactly 4)"
    POSTFLIGHT_RESULTS+="| SEA Lines Count | $lines_count | PASS |\n"
  else
    log_error "API returns $lines_count SEA lines (expected exactly 4: 602, 612, 659, 9602)"
    POSTFLIGHT_RESULTS+="| SEA Lines Count | $lines_count | FAIL |\n"
    failed=1
  fi

  # Get line IDs
  local line_602_id line_659_id
  line_602_id=$(echo "$lines_response" | jq -r '.lines[] | select(.subtype == "Trajekt") | .id' | head -1)
  line_659_id=$(echo "$lines_response" | jq -r '.lines[] | select(.name | contains("Split – Hvar – Vis")) | .id' | head -1)

  # Check 2: Line 602 - 2026-07-15 (HIGH season) - Both directions - EXPECT EXACTLY 3
  log_info "Checking line 602 departures for 2026-07-15 (HIGH season)..."
  local expected_jul=3
  if [[ -n "$line_602_id" && "$line_602_id" != "null" ]]; then
    for dir in 0 1; do
      local deps_response deps_count deps_times
      deps_response=$(curl -s "$API_BASE/transport/sea/lines/$line_602_id/departures?date=2026-07-15&direction=$dir" 2>/dev/null || echo "{}")
      deps_count=$(echo "$deps_response" | jq '.departures | length' 2>/dev/null || echo "0")
      deps_times=$(echo "$deps_response" | jq -r '.departures[].departure_time' 2>/dev/null | sort | tr '\n' ', ' | sed 's/,$//' || echo "none")

      if [[ "$deps_count" -eq $expected_jul ]]; then
        log_success "Line 602 dir $dir: $deps_count departures (expected $expected_jul) [$deps_times]"
        POSTFLIGHT_RESULTS+="| Line 602 (2026-07-15) dir $dir | $deps_count | $deps_times |\n"
      else
        log_error "Line 602 dir $dir: $deps_count departures (expected exactly $expected_jul)"
        POSTFLIGHT_RESULTS+="| Line 602 (2026-07-15) dir $dir | $deps_count | FAIL (expected $expected_jul) |\n"
        failed=1
      fi

      # Store for log
      if [[ $dir -eq 0 ]]; then
        LINE_602_JUL_DIR0_COUNT=$deps_count
        LINE_602_JUL_DIR0_TIMES=$deps_times
      else
        LINE_602_JUL_DIR1_COUNT=$deps_count
        LINE_602_JUL_DIR1_TIMES=$deps_times
      fi
    done
  else
    log_error "Could not find line 602 ID - FAIL"
    failed=1
  fi

  # Check 3: Line 602 - 2026-10-15 (OFF-B season) - Both directions - EXPECT EXACTLY 2
  log_info "Checking line 602 departures for 2026-10-15 (OFF-B season)..."
  local expected_oct=2
  if [[ -n "$line_602_id" && "$line_602_id" != "null" ]]; then
    for dir in 0 1; do
      local deps_response deps_count deps_times
      deps_response=$(curl -s "$API_BASE/transport/sea/lines/$line_602_id/departures?date=2026-10-15&direction=$dir" 2>/dev/null || echo "{}")
      deps_count=$(echo "$deps_response" | jq '.departures | length' 2>/dev/null || echo "0")
      deps_times=$(echo "$deps_response" | jq -r '.departures[].departure_time' 2>/dev/null | sort | tr '\n' ', ' | sed 's/,$//' || echo "none")

      if [[ "$deps_count" -eq $expected_oct ]]; then
        log_success "Line 602 dir $dir: $deps_count departures (expected $expected_oct) [$deps_times]"
        POSTFLIGHT_RESULTS+="| Line 602 (2026-10-15) dir $dir | $deps_count | $deps_times |\n"
      else
        log_error "Line 602 dir $dir: $deps_count departures (expected exactly $expected_oct)"
        POSTFLIGHT_RESULTS+="| Line 602 (2026-10-15) dir $dir | $deps_count | FAIL (expected $expected_oct) |\n"
        failed=1
      fi

      # Store for log
      if [[ $dir -eq 0 ]]; then
        LINE_602_OCT_DIR0_COUNT=$deps_count
        LINE_602_OCT_DIR0_TIMES=$deps_times
      else
        LINE_602_OCT_DIR1_COUNT=$deps_count
        LINE_602_OCT_DIR1_TIMES=$deps_times
      fi
    done
  fi

  # Check 4: Line 659 - Summer date (2026-07-15) should have departures
  log_info "Checking line 659 departures for 2026-07-15 (summer)..."
  if [[ -n "$line_659_id" && "$line_659_id" != "null" ]]; then
    local deps_response deps_count
    deps_response=$(curl -s "$API_BASE/transport/sea/lines/$line_659_id/departures?date=2026-07-15&direction=0" 2>/dev/null || echo "{}")
    deps_count=$(echo "$deps_response" | jq '.departures | length' 2>/dev/null || echo "0")
    LINE_659_SUMMER_COUNT=$deps_count

    if [[ "$deps_count" -gt 0 ]]; then
      log_success "Line 659 summer (2026-07-15): $deps_count departures"
      POSTFLIGHT_RESULTS+="| Line 659 (2026-07-15) summer | $deps_count | PASS |\n"
    else
      log_error "Line 659 summer: 0 departures (expected > 0)"
      POSTFLIGHT_RESULTS+="| Line 659 (2026-07-15) summer | 0 | FAIL |\n"
      failed=1
    fi
  else
    log_warn "Could not find line 659 ID - skipping"
    LINE_659_SUMMER_COUNT="N/A"
  fi

  # Check 5: Line 659 - Non-summer date (2026-01-15) should have 0 departures
  log_info "Checking line 659 departures for 2026-01-15 (non-summer)..."
  if [[ -n "$line_659_id" && "$line_659_id" != "null" ]]; then
    local deps_response deps_count
    deps_response=$(curl -s "$API_BASE/transport/sea/lines/$line_659_id/departures?date=2026-01-15&direction=0" 2>/dev/null || echo "{}")
    deps_count=$(echo "$deps_response" | jq '.departures | length' 2>/dev/null || echo "0")
    LINE_659_WINTER_COUNT=$deps_count

    if [[ "$deps_count" -eq 0 ]]; then
      log_success "Line 659 winter (2026-01-15): 0 departures (expected)"
      POSTFLIGHT_RESULTS+="| Line 659 (2026-01-15) winter | 0 | PASS (expected 0) |\n"
    else
      log_warn "Line 659 winter: $deps_count departures (expected 0 - seasonal line)"
      POSTFLIGHT_RESULTS+="| Line 659 (2026-01-15) winter | $deps_count | WARN |\n"
    fi
  else
    LINE_659_WINTER_COUNT="N/A"
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

  local tz_timestamp
  tz_timestamp=$(TZ="$TIMEZONE" date '+%Y-%m-%d %H:%M:%S %Z')

  cat > "$LOG_FILE" <<EOF
# Transport Import Execution Log

**Timestamp**: $tz_timestamp
**Host**: $HOSTNAME_LABEL
**Environment**: $ENV_LABEL
**Git Branch**: $GIT_BRANCH
**Git SHA**: $GIT_SHA

---

## Command Executed

\`\`\`bash
$IMPORT_COMMAND
\`\`\`

---

## Import Summary

| Metric | Count |
|--------|-------|
| Lines | $IMPORT_LINES |
| Routes | $IMPORT_ROUTES |
| Departures | $IMPORT_DEPARTURES |

---

## Post-flight API Verification

### Line 602 (Trajekt Vis-Split)

| Date | Direction | Count | Departure Times |
|------|-----------|-------|-----------------|
| 2026-07-15 (HIGH) | 0 | ${LINE_602_JUL_DIR0_COUNT:-N/A} | ${LINE_602_JUL_DIR0_TIMES:-N/A} |
| 2026-07-15 (HIGH) | 1 | ${LINE_602_JUL_DIR1_COUNT:-N/A} | ${LINE_602_JUL_DIR1_TIMES:-N/A} |
| 2026-10-15 (OFF-B) | 0 | ${LINE_602_OCT_DIR0_COUNT:-N/A} | ${LINE_602_OCT_DIR0_TIMES:-N/A} |
| 2026-10-15 (OFF-B) | 1 | ${LINE_602_OCT_DIR1_COUNT:-N/A} | ${LINE_602_OCT_DIR1_TIMES:-N/A} |

### Line 659 (Katamaran Split-Hvar-Vis)

| Date | Count | Notes |
|------|-------|-------|
| 2026-07-15 (summer) | ${LINE_659_SUMMER_COUNT:-N/A} | Should have departures |
| 2026-01-15 (winter) | ${LINE_659_WINTER_COUNT:-N/A} | Should be 0 (seasonal) |

---

## Status Summary

| Check | Status |
|-------|--------|
| Pre-flight | PASSED |
| Import | $IMPORT_STATUS |
| Post-flight | $POSTFLIGHT_STATUS |

---

## Final Verdict

**${FINAL_VERDICT}**

---

*Generated by transport-import-docker.sh at $tz_timestamp*
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

  # Initialize status variables
  IMPORT_STATUS="NOT_RUN"
  POSTFLIGHT_STATUS="NOT_RUN"
  IMPORT_LINES=0
  IMPORT_ROUTES=0
  IMPORT_DEPARTURES=0
  FINAL_VERDICT="UNKNOWN"
  GIT_SHA="unknown"
  GIT_BRANCH="unknown"
  IMPORT_COMMAND=""
  LINE_602_JUL_DIR0_COUNT=""
  LINE_602_JUL_DIR0_TIMES=""
  LINE_602_JUL_DIR1_COUNT=""
  LINE_602_JUL_DIR1_TIMES=""
  LINE_602_OCT_DIR0_COUNT=""
  LINE_602_OCT_DIR0_TIMES=""
  LINE_602_OCT_DIR1_COUNT=""
  LINE_602_OCT_DIR1_TIMES=""
  LINE_659_SUMMER_COUNT=""
  LINE_659_WINTER_COUNT=""

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
    log_info "Log: $LOG_FILE"
    exit 0
  else
    log_error "VERDICT: $FINAL_VERDICT"
    log_info "Log: $LOG_FILE"
    exit 1
  fi
}

# Run main
main "$@"
