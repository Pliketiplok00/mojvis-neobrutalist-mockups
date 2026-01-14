# Post-Mortem: Phase Branch Fragmentation

## Incident Summary

Design system work spanning Phases 2-4 (fonts, icons, skin tokens, screen migrations) was effectively "lost" due to unmerged phase branches. Users reported seeing old fonts and emoji icons despite work being marked complete.

## Timeline

| Phase | Branch | Status |
|-------|--------|--------|
| 2A | `feat/mobile-skin-globalheader-phase2a` | Created, never merged |
| 2B | `feat/mobile-skin-menuoverlay-phase2b` | Created, never merged |
| 2C | `feat/mobile-skin-banner-phase2c` | Created, never merged |
| 2D | `feat/mobile-skin-departureitem-phase2d` | Created, never merged |
| 3A | `feat/mobile-skin-sea-transport-screen-phase3a` | Created, never merged |
| 3B | `feat/mobile-skin-road-transport-screen-phase3b` | Created, never merged |
| 3CD | `feat/mobile-skin-transport-hub-and-line-detail-phase3cd` | Created, never merged |
| 4A | `feat/mobile-skin-inbox-screens-phase4a` | Created, never merged |

## What Went Wrong

1. **Independent Branching**
   - Each phase branch was created from `main`
   - `main` never received the previous phase's work
   - Each new branch lost all previous phase work

2. **No Merge Discipline**
   - Branches were completed but not merged
   - PRs were not created or merged
   - Work existed only in isolated branches

3. **No Integration Testing**
   - No verification that work accumulated correctly
   - Build passed on each branch individually
   - Full integration was never tested

## Root Cause

The phase-based workflow assumed each phase would merge before the next started. When this didn't happen, work fragmented across multiple orphan branches.

## Resolution

1. Created integration branch `integration/skin-migration-transport-restore`
2. Cherry-picked all phase work in correct order
3. Resolved conflicts (Icon.tsx had additions from multiple phases)
4. Created final branch `integration/design-baseline-final`

## Why It Won't Happen Again

### New Rules

1. **Single Branch Policy**
   - No more "phase branches"
   - All work derives from and merges to `main`

2. **Merge-Before-Proceed**
   - Each feature must be merged before starting the next
   - No accumulating unmerged branches

3. **Baseline Verification**
   - Before starting work, verify ancestry includes baseline
   - Use: `git log --oneline | grep "59bc36b"`

4. **PR Requirement**
   - All design work requires a PR
   - PRs must be merged, not just created

### Enforcement

- Documented in `docs/GIT_BASELINE_LOCK.md`
- Baseline contents in `docs/DESIGN_BASELINE_CONTENTS.md`
- This post-mortem for historical record

## Lessons Learned

1. Git branches are not backups - work must merge
2. Phase-based development requires merge discipline
3. Integration testing catches what unit tests miss
4. Documentation of git strategy prevents repeating mistakes

---

**Date:** 2026-01-10
**Resolution Commit:** `59bc36b`
