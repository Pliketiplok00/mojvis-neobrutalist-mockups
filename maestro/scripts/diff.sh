#!/usr/bin/env bash
#
# Compare current screenshots against baseline using ImageMagick.
# Generates diff images showing pixel differences.
#
# Usage:
#   ./maestro/scripts/diff.sh [screenshot_name]
#
# Examples:
#   ./maestro/scripts/diff.sh                                    # Diff all screenshots
#   ./maestro/scripts/diff.sh onboarding_language_selection.png  # Diff specific screenshot
#
# Prerequisites:
#   - ImageMagick installed: brew install imagemagick
#   - Baseline screenshots exist
#   - Current screenshots exist (run ./maestro/scripts/run.sh first)
#
# Output:
#   - Diff images in maestro/screenshots/diff/
#   - Exit code 0 if identical, 1 if differences found

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAESTRO_DIR="$(dirname "$SCRIPT_DIR")"
BASELINE_DIR="$MAESTRO_DIR/screenshots/baseline"
CURRENT_DIR="$MAESTRO_DIR/screenshots/current"
DIFF_DIR="$MAESTRO_DIR/screenshots/diff"

# Check for ImageMagick
if ! command -v compare &> /dev/null; then
  echo "Error: ImageMagick not installed."
  echo "Install with: brew install imagemagick"
  exit 1
fi

# Ensure diff directory exists
mkdir -p "$DIFF_DIR"

# Clean previous diff outputs
rm -f "$DIFF_DIR"/*.png

SCREENSHOT_NAME="${1:-}"
HAS_DIFF=0

diff_screenshot() {
  local name="$1"
  local baseline="$BASELINE_DIR/$name"
  local current="$CURRENT_DIR/$name"
  local diff_out="$DIFF_DIR/$name"

  if [[ ! -f "$baseline" ]]; then
    echo "SKIP: No baseline for $name"
    return 0
  fi

  if [[ ! -f "$current" ]]; then
    echo "SKIP: No current screenshot for $name"
    return 0
  fi

  echo -n "Comparing $name... "

  # Use ImageMagick compare to create diff image
  # AE (Absolute Error) metric returns number of different pixels
  local result
  result=$(compare -metric AE "$baseline" "$current" "$diff_out" 2>&1) || true

  if [[ "$result" == "0" ]]; then
    echo "MATCH"
    rm -f "$diff_out"  # Remove diff file if identical
  else
    echo "DIFF ($result pixels differ)"
    HAS_DIFF=1
    echo "  Diff saved to: $diff_out"
  fi
}

if [[ -n "$SCREENSHOT_NAME" ]]; then
  # Diff specific screenshot
  diff_screenshot "$SCREENSHOT_NAME"
else
  # Diff all baseline screenshots
  for baseline in "$BASELINE_DIR"/*.png; do
    if [[ -f "$baseline" ]]; then
      name=$(basename "$baseline")
      diff_screenshot "$name"
    fi
  done
fi

echo ""
if [[ $HAS_DIFF -eq 1 ]]; then
  echo "Differences found! Check diff images in: $DIFF_DIR"
  exit 1
else
  echo "All screenshots match baseline."
  exit 0
fi
