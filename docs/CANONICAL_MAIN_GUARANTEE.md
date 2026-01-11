# CANONICAL MAIN GUARANTEE

**Date:** 2026-01-11
**Status:** ENFORCED

---

## The One Rule

**`main` is the ONLY source of truth.**

---

## Guarantees

### 1. Nothing is Done Until It's in Main

A fix, feature, or migration is NOT considered complete unless:
- It has been merged to `main`
- It passes all CI checks (typecheck, lint, design:guard)
- It is verified to work at runtime

Work that exists only on feature branches does NOT exist in the canonical system.

### 2. Design Work Depends ONLY on Main

All design implementation (skin tokens, UI primitives, screen migrations) must be:
- Based on `main` branch
- Verified against `main`
- Merged back to `main` promptly

Never start new design work from a feature branch.

### 3. Parallel Phase Branches Are Forbidden

The previous workflow of creating Phase 2A, 2B, 2C, etc. branches independently from `main` led to:
- Fragmented work that never integrated
- Lost fixes (fonts, icons, safe area)
- Multiple conflicting implementations

**New workflow:**
1. Create a single branch from `main`
2. Complete the work
3. Merge to `main`
4. Delete the branch
5. Start next phase from updated `main`

### 4. Prompt Merging

Feature branches should be merged within the same session or day they are created.
Long-lived feature branches are a code smell.

---

## Verification Commands

Before any merge to main, run:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm --dir backend lint
pnpm --dir admin lint

# Design guardrails
pnpm design:guard
```

All must pass with zero errors.

---

## Branch Cleanup Policy

After merge to main:
1. Delete the local feature branch: `git branch -D <branch-name>`
2. Delete the remote branch if pushed: `git push origin --delete <branch-name>`

Do not accumulate feature branches.

---

## What Was Recovered (2026-01-11)

The following fixes were cherry-picked into canonical main:

| Commit | Description |
|--------|-------------|
| `f2bff36` | fix(admin): refresh auth after login |
| `36278dd` | fix(backend): register menu-extras routes + fix feedback query |
| `41378cf` | chore(repo): add root typecheck script |
| `e89154c` | chore(ci): add design guardrails |
| `c1e2660` | chore(mobile): integrate design baseline ui skin |
| `244e5f9` | fix(mobile): add Settings to menu |
| `b75155f` | fix(mobile): respect safe area on Settings screen |
| `176fb52` | fix(mobile): replace deprecated SafeAreaView |
| `f5741a4` | fix(mobile): repair Icon mapping |
| `a8abf4e` | feat(mobile): migrate SeaTransportScreen |
| `6a8c208` | feat(mobile): migrate RoadTransportScreen |
| `9c54fce` | feat(mobile): migrate TransportHub and LineDetail |
| `2fb0d02` | feat(mobile): migrate inbox screens (Phase 4A) |
| `19a1407` | fix(mobile): restore skin fonts/icons infra |

19 stale feature/fix branches were deleted.

---

## Enforcement

This document serves as the canonical reference for branch policy.
Any deviation from these rules risks regression to the previous chaos.

**When in doubt: merge to main.**
