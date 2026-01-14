# Git Gate — Pre-Branch Safety Protocol

## The Problem

UI work gets stranded on feature branches that are never merged to main.
This causes "regression" when switching branches — features disappear.

## The Solution

**RUN THIS COMMAND BEFORE EVERY NEW TASK:**

```bash
bash scripts/git-gate.sh
```

## What It Does

1. **Fetches** latest from origin
2. **Syncs** local main to origin/main (hard reset)
3. **Shows** current branch and HEAD
4. **Checks** for stranded remote branches (ui/* and fix/*)
5. **Blocks** if any branch is NOT merged to main

## Exit Codes

- `0` = SAFE — no stranded work, proceed with new branch
- `1` = BLOCKED — stranded branches exist, merge first

## When Gate Blocks

If the gate exits with code 1, you MUST:

1. Create PRs for all listed stranded branches
2. Squash-merge them to main (in correct order if dependent)
3. Run the gate again
4. Only proceed when gate passes

## Example Output

### Passed:
```
========================================
  GIT GATE — Pre-branch Safety Check
========================================

[1/4] Fetching origin...
[2/4] Syncing local main to origin/main...
[3/4] Current state:
  Branch: main
  HEAD:   428be46
  Commit: 428be46 Merge pull request #12 from ...
[4/4] Checking for stranded remote branches...

========================================
  ✓ GATE PASSED — Safe to start work
========================================
```

### Blocked:
```
========================================
  ✗ GATE BLOCKED — Stranded work exists
========================================

The following branches are NOT merged to main:
  - origin/ui/inbox-banner-list-parity
  - origin/ui/inbox-tabs-bold-and-unread-badge

ACTION REQUIRED:
  1. Create PRs for stranded branches
  2. Squash-merge them to main
  3. Run this gate again
```

## Non-Negotiable Rules

1. **ONE branch = ONE PR = ONE task**
2. **No parallel UI branches** — merge current work before starting new
3. **If not in main, it does not exist** — branches are temporary
4. **Always squash-merge** — clean history
5. **Delete branch after merge** — no stale branches

## Quick Reference

```bash
# Before any new work
bash scripts/git-gate.sh

# Start new branch (only if gate passed)
git checkout -b ui/my-new-feature

# After work is done
git add . && git commit -m "ui(scope): description"
git push -u origin ui/my-new-feature
# Create PR → Squash merge → Delete branch
```
