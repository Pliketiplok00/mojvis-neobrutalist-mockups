#!/usr/bin/env bash
#
# Run Maestro flow and capture screenshots to current/ folder.
#
# Usage:
#   ./maestro/scripts/run.sh [flow_name]
#
# Examples:
#   ./maestro/scripts/run.sh                              # Run all flows
#   ./maestro/scripts/run.sh onboarding_language_selection  # Run specific flow
#
# Prerequisites:
#   - Maestro CLI installed: brew install maestro
#   - iOS Simulator booted with app installed
#   - Run from repo root

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAESTRO_DIR="$(dirname "$SCRIPT_DIR")"
FLOWS_DIR="$MAESTRO_DIR/flows"
OUTPUT_DIR="$MAESTRO_DIR/screenshots/current"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Clean previous current screenshots
rm -f "$OUTPUT_DIR"/*.png

FLOW_NAME="${1:-}"

if [[ -n "$FLOW_NAME" ]]; then
  # Run specific flow
  FLOW_FILE="$FLOWS_DIR/${FLOW_NAME}.yaml"
  if [[ ! -f "$FLOW_FILE" ]]; then
    echo "Error: Flow file not found: $FLOW_FILE"
    exit 1
  fi
  echo "Running flow: $FLOW_NAME"
  maestro test "$FLOW_FILE" --output "$OUTPUT_DIR"
else
  # Run all flows
  echo "Running all flows in $FLOWS_DIR"
  for flow in "$FLOWS_DIR"/*.yaml; do
    if [[ -f "$flow" ]]; then
      echo "Running: $(basename "$flow")"
      maestro test "$flow" --output "$OUTPUT_DIR"
    fi
  done
fi

echo ""
echo "Screenshots saved to: $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"/*.png 2>/dev/null || echo "(no screenshots found)"
