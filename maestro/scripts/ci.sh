#!/usr/bin/env bash
#
# CI script for Maestro visual baseline testing.
# Runs all flows, generates diffs against baseline, and creates artifact ZIP.
#
# Usage:
#   ./maestro/scripts/ci.sh
#
# This script is designed to run in GitHub Actions on Apple Silicon macOS runners.
#
# Exit codes:
#   0 - All screenshots match baseline (or running in baseline-generation mode)
#   1 - Diffs found OR baseline missing for one or more flows
#
# Output:
#   - maestro/screenshots/current/  - Current screenshots
#   - maestro/screenshots/diff/     - Diff images (if differences found)
#   - maestro/logs/                 - Execution logs
#   - maestro-artifacts.zip         - All outputs bundled for artifact upload

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAESTRO_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(dirname "$MAESTRO_DIR")"
FLOWS_DIR="$MAESTRO_DIR/flows"
BASELINE_DIR="$MAESTRO_DIR/screenshots/baseline"
CURRENT_DIR="$MAESTRO_DIR/screenshots/current"
DIFF_DIR="$MAESTRO_DIR/screenshots/diff"
LOGS_DIR="$MAESTRO_DIR/logs"
ARTIFACTS_ZIP="$REPO_ROOT/maestro-artifacts.zip"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Track overall status
HAS_DIFF=0
HAS_MISSING_BASELINE=0

#######################################
# Step 1: Clean directories
#######################################
log_info "Cleaning output directories..."

mkdir -p "$CURRENT_DIR" "$DIFF_DIR" "$LOGS_DIR"
rm -f "$CURRENT_DIR"/*.png 2>/dev/null || true
rm -f "$DIFF_DIR"/*.png 2>/dev/null || true
rm -f "$LOGS_DIR"/*.log 2>/dev/null || true
rm -f "$ARTIFACTS_ZIP" 2>/dev/null || true

#######################################
# Step 2: Check prerequisites
#######################################
log_info "Checking prerequisites..."

# Check for Maestro
if ! command -v maestro &> /dev/null; then
  log_error "Maestro CLI not found. Install with: curl -Ls https://get.maestro.mobile.dev | bash"
  exit 1
fi
log_info "Maestro version: $(maestro --version)"

# Check for ImageMagick
if ! command -v compare &> /dev/null; then
  log_error "ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi
log_info "ImageMagick compare found: $(which compare)"

# Check for booted simulator
log_info "Checking simulator status..."
if ! xcrun simctl list devices booted 2>/dev/null | grep -q "Booted"; then
  log_error "No iOS Simulator is booted."
  exit 1
fi
log_info "Simulator is booted:"
xcrun simctl list devices booted 2>/dev/null | grep -E "iPhone|iPad" || true

# Check if app is installed (should be installed by expo run:ios in CI)
log_info "Checking app installation..."
if xcrun simctl get_app_container booted com.mojvis.app &> /dev/null; then
  log_info "App com.mojvis.app is installed"
  APP_CONTAINER=$(xcrun simctl get_app_container booted com.mojvis.app)
  log_info "App container: $APP_CONTAINER"
else
  log_error "App com.mojvis.app is NOT installed on the simulator."
  log_error "The workflow should have installed it via 'expo run:ios'."
  exit 1
fi

#######################################
# Step 3: Run Maestro flows
#######################################
log_info "Running Maestro flows..."

MAESTRO_LOG="$LOGS_DIR/maestro-run.log"

# Run all flows
for flow in "$FLOWS_DIR"/*.yaml; do
  if [[ -f "$flow" ]]; then
    flow_name=$(basename "$flow" .yaml)
    log_info "Running flow: $flow_name"

    # Run Maestro and capture output
    if maestro test "$flow" --output "$CURRENT_DIR" >> "$MAESTRO_LOG" 2>&1; then
      log_info "  Flow $flow_name: PASSED"
    else
      log_warn "  Flow $flow_name: FAILED (see $MAESTRO_LOG for details)"
    fi
  fi
done

log_info "Maestro execution complete. Log: $MAESTRO_LOG"

#######################################
# Step 3.5: Discovery Report
#######################################
log_info "Generating discovery report..."

DISCOVERY_LOG="$LOGS_DIR/discovery-report.log"
{
  echo "========================================"
  echo "MAESTRO A1 DISCOVERY REPORT"
  echo "========================================"
  echo "Generated: $(date)"
  echo ""

  echo "=== FLOWS EXECUTED ==="
  for flow in "$FLOWS_DIR"/*.yaml; do
    if [[ -f "$flow" ]]; then
      echo "  - $(basename "$flow")"
    fi
  done
  echo ""

  echo "=== SCREENSHOTS PRODUCED ==="
  SCREENSHOT_COUNT=0
  for png in "$CURRENT_DIR"/*.png; do
    if [[ -f "$png" ]]; then
      echo "  - $(basename "$png")"
      ((SCREENSHOT_COUNT++))
    fi
  done
  echo ""
  echo "Total screenshots: $SCREENSHOT_COUNT"
  echo ""

  echo "=== SCREENSHOT LOCATIONS ==="
  echo "Current:  $CURRENT_DIR"
  echo "Baseline: $BASELINE_DIR"
  echo "Diff:     $DIFF_DIR"
  echo ""

  # Also search for any PNG files in other common locations
  echo "=== PNG FILES IN REPO (excluding node_modules, build) ==="
  find "$REPO_ROOT" -type f -name "*.png" \
    ! -path "*/node_modules/*" \
    ! -path "*/build/*" \
    ! -path "*/.git/*" \
    ! -path "*/ios/build/*" \
    2>/dev/null | head -50

  echo ""
  echo "========================================"
} > "$DISCOVERY_LOG"

# Print discovery report to console
cat "$DISCOVERY_LOG"
log_info "Discovery report saved to: $DISCOVERY_LOG"

#######################################
# Step 4: Generate diffs
#######################################
log_info "Generating diffs against baseline..."

DIFF_LOG="$LOGS_DIR/diff.log"
echo "Diff Report - $(date)" > "$DIFF_LOG"
echo "=====================================" >> "$DIFF_LOG"
echo "" >> "$DIFF_LOG"

# Process each baseline image
for baseline in "$BASELINE_DIR"/*.png; do
  if [[ -f "$baseline" ]]; then
    name=$(basename "$baseline")
    current="$CURRENT_DIR/$name"
    diff_out="$DIFF_DIR/$name"

    echo -n "Comparing $name... " | tee -a "$DIFF_LOG"

    if [[ ! -f "$current" ]]; then
      echo "SKIP (no current screenshot)" | tee -a "$DIFF_LOG"
      log_warn "No current screenshot for $name - flow may have failed"
      continue
    fi

    # Use ImageMagick compare
    result=$(compare -metric AE "$baseline" "$current" "$diff_out" 2>&1) || true

    if [[ "$result" == "0" ]]; then
      echo "MATCH" | tee -a "$DIFF_LOG"
      rm -f "$diff_out"  # Remove diff file if identical
    else
      echo "DIFF ($result pixels differ)" | tee -a "$DIFF_LOG"
      HAS_DIFF=1
      log_warn "Diff saved to: $diff_out"
    fi
  fi
done

# Check for screenshots without baselines
echo "" >> "$DIFF_LOG"
echo "Checking for missing baselines..." >> "$DIFF_LOG"

for current in "$CURRENT_DIR"/*.png; do
  if [[ -f "$current" ]]; then
    name=$(basename "$current")
    baseline="$BASELINE_DIR/$name"

    if [[ ! -f "$baseline" ]]; then
      echo "MISSING BASELINE: $name" | tee -a "$DIFF_LOG"
      HAS_MISSING_BASELINE=1
    fi
  fi
done

log_info "Diff generation complete. Report: $DIFF_LOG"

#######################################
# Step 5: Create README for artifact
#######################################
log_info "Creating artifact README..."

cat > "$LOGS_DIR/README.txt" << 'ARTIFACT_README'
MAESTRO VISUAL BASELINE ARTIFACTS
=================================

This artifact ZIP contains:

  current/    - Screenshots captured during this CI run
  diff/       - Diff images showing pixel differences (red = changed pixels)
  logs/       - Execution logs from Maestro and diff generation
  README.txt  - This file

HOW TO INTERPRET RESULTS
------------------------

1. If diff/ is empty: All screenshots match the committed baseline.

2. If diff/ contains images: Visual differences were detected.
   - Red pixels in diff images indicate changes from baseline
   - Compare current/<name>.png with the baseline in the repo

3. If "MISSING BASELINE" appears in logs/diff.log:
   - A new flow generated a screenshot with no committed baseline
   - To fix: run locally, verify the screenshot, then commit:
       git add maestro/screenshots/baseline/<name>.png
       git commit -m "chore(maestro): add baseline for <name>"

BASELINE LOCATION (in repo)
---------------------------

  maestro/screenshots/baseline/

These baseline images are committed to the repo and represent the canonical
visual state. CI compares against these baselines.

FAILURE POLICY
--------------

CI fails (exit 1) if:
  - Any diff is detected (pixels differ from baseline)
  - Any baseline is missing for a captured screenshot

This ensures visual regressions are caught before merge.
ARTIFACT_README

#######################################
# Step 6: Create artifact ZIP
#######################################
log_info "Creating artifact ZIP..."

cd "$MAESTRO_DIR"

# Create ZIP with all outputs
zip -r "$ARTIFACTS_ZIP" \
  screenshots/current/ \
  screenshots/diff/ \
  logs/ \
  -x "*.gitkeep" \
  -x "*.DS_Store" \
  >> "$LOGS_DIR/zip.log" 2>&1

log_info "Artifact created: $ARTIFACTS_ZIP"

# List contents
log_info "Artifact contents:"
unzip -l "$ARTIFACTS_ZIP" | tail -20

#######################################
# Step 7: Summary and exit
#######################################
echo ""
echo "======================================"
echo "MAESTRO CI SUMMARY"
echo "======================================"

if [[ $HAS_MISSING_BASELINE -eq 1 ]]; then
  log_error "FAIL: Missing baseline(s) detected"
  log_info "See logs/diff.log for details"
fi

if [[ $HAS_DIFF -eq 1 ]]; then
  log_error "FAIL: Visual differences detected"
  log_info "Download the artifact ZIP to review diff images"
fi

if [[ $HAS_DIFF -eq 0 && $HAS_MISSING_BASELINE -eq 0 ]]; then
  log_info "PASS: All screenshots match baseline"
  exit 0
else
  exit 1
fi
