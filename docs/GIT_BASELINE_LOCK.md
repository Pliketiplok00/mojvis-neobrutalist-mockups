# Git Baseline Lock

## Purpose

This document establishes the canonical baseline for all design and skin system work in MOJ VIS mobile.

## Previous Failure Mode

Multiple phase branches (2A, 2B, 3A, 3B, 3CD, 4A) were created independently from `main`, each containing partial design work:

- Phase 2A: GlobalHeader skin migration
- Phase 2B: MenuOverlay migration
- Phase 2C: Banner migration
- Phase 2D: DepartureItem migration
- Phase 3A: SeaTransportScreen
- Phase 3B: RoadTransportScreen
- Phase 3CD: TransportHub + LineDetail
- Phase 4A: Inbox screens

**Problem:** These branches were never merged to `main`. Each new phase branched from `main`, losing previous phase work.

**Result:** Users saw "old fonts + emoji icons" despite phase work being "complete" on isolated branches.

## Canonical Baseline

**Branch:** `integration/design-baseline-final`

**Base Commit:** `59bc36b` (docs: add transport restore integration report)

**Status:** This branch integrates ALL design infrastructure and migrated screens.

## Rules (Effective Immediately)

1. **NO new phase branches** - All design work derives from main after this PR merges
2. **Main is source of truth** - Never create branches from old/stale commits
3. **Merge promptly** - Each feature branch must be merged before starting the next
4. **Verify ancestry** - Before starting work, confirm your branch contains the baseline

## Verification Command

```bash
git log --oneline | grep "restore skin fonts/icons"
# Must show commit 776b1ba or descendant
```

## Enforcement

Any design work that:
- Creates emoji icons
- Uses hardcoded hex colors in migrated screens
- Bypasses the Icon primitive

...is considered a regression and must be rejected.

---

**Lock Date:** 2026-01-10
**Lock Commit:** `59bc36b`
