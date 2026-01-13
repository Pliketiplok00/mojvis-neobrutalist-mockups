#!/bin/bash
# git-gate.sh — Pre-branch safety gate
#
# RUN THIS BEFORE EVERY NEW TASK:
#   bash scripts/git-gate.sh
#
# This script ensures:
# 1. Local main is synced to origin/main
# 2. No remote ui/* or fix/* branches are stranded (not merged to main)
# 3. Safe to start new work
#
# EXIT CODES:
#   0 = SAFE to start new branch
#   1 = BLOCKED — stranded work exists, merge first

set -e

echo "========================================"
echo "  GIT GATE — Pre-branch Safety Check"
echo "========================================"
echo ""

# Step 1: Fetch latest from origin
echo "[1/4] Fetching origin..."
git fetch origin --prune
echo ""

# Step 2: Reset local main to origin/main
echo "[2/4] Syncing local main to origin/main..."
git checkout main 2>/dev/null || git checkout -b main origin/main
git reset --hard origin/main
echo ""

# Step 3: Show current state
echo "[3/4] Current state:"
echo "  Branch: $(git branch --show-current)"
echo "  HEAD:   $(git rev-parse --short HEAD)"
echo "  Commit: $(git log -1 --oneline)"
echo ""

# Step 4: Check for stranded remote branches
echo "[4/4] Checking for stranded remote branches..."
echo ""

STRANDED=()

# Check ui/* and fix/* branches on origin
for BRANCH in $(git branch -r | grep -E "origin/(ui|fix)/" | sed 's/^[[:space:]]*//'); do
  # Skip HEAD references
  if [[ "$BRANCH" == *"HEAD"* ]]; then
    continue
  fi

  # Check if branch is ancestor of origin/main
  if git merge-base --is-ancestor "$BRANCH" origin/main 2>/dev/null; then
    echo "  ✓ $BRANCH (merged)"
  else
    echo "  ✗ $BRANCH (NOT MERGED)"
    STRANDED+=("$BRANCH")
  fi
done

echo ""

# Final verdict
if [ ${#STRANDED[@]} -eq 0 ]; then
  echo "========================================"
  echo "  ✓ GATE PASSED — Safe to start work"
  echo "========================================"
  echo ""
  echo "You may now create a new branch:"
  echo "  git checkout -b <branch-name>"
  echo ""
  exit 0
else
  echo "========================================"
  echo "  ✗ GATE BLOCKED — Stranded work exists"
  echo "========================================"
  echo ""
  echo "The following branches are NOT merged to main:"
  for B in "${STRANDED[@]}"; do
    echo "  - $B"
  done
  echo ""
  echo "ACTION REQUIRED:"
  echo "  1. Create PRs for stranded branches"
  echo "  2. Squash-merge them to main"
  echo "  3. Run this gate again"
  echo ""
  echo "DO NOT start new work until all branches are merged."
  echo ""
  exit 1
fi
