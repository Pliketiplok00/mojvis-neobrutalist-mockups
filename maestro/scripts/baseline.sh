#!/usr/bin/env bash
#
# Generate baseline screenshots by running Maestro flows.
# Screenshots are saved to baseline/ folder and should be committed.
#
# Usage:
#   ./maestro/scripts/baseline.sh [flow_name]
#
# Examples:
#   ./maestro/scripts/baseline.sh                              # Run all flows
#   ./maestro/scripts/baseline.sh onboarding_language_selection  # Run specific flow
#
# Prerequisites:
#   - Maestro CLI installed: brew install maestro
#   - iOS Simulator booted with app installed
#   - Run from repo root

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAESTRO_DIR="$(dirname "$SCRIPT_DIR")"
FLOWS_DIR="$MAESTRO_DIR/flows"
BASELINE_DIR="$MAESTRO_DIR/screenshots/baseline"

# Ensure baseline directory exists
mkdir -p "$BASELINE_DIR"

FLOW_NAME="${1:-}"

if [[ -n "$FLOW_NAME" ]]; then
  # Run specific flow
  FLOW_FILE="$FLOWS_DIR/${FLOW_NAME}.yaml"
  if [[ ! -f "$FLOW_FILE" ]]; then
    echo "Error: Flow file not found: $FLOW_FILE"
    exit 1
  fi
  echo "Generating baseline for: $FLOW_NAME"
  maestro test "$FLOW_FILE" --output "$BASELINE_DIR"
else
  # Run all flows
  echo "Generating baselines for all flows in $FLOWS_DIR"
  for flow in "$FLOWS_DIR"/*.yaml; do
    if [[ -f "$flow" ]]; then
      echo "Running: $(basename "$flow")"
      maestro test "$flow" --output "$BASELINE_DIR"
    fi
  done
fi

echo ""
echo "Baseline screenshots saved to: $BASELINE_DIR"
ls -la "$BASELINE_DIR"/*.png 2>/dev/null || echo "(no screenshots found)"
echo ""
echo "Remember to commit baseline screenshots:"
echo "  git add maestro/screenshots/baseline/"
echo "  git commit -m 'chore(maestro): update baseline screenshots'"
