# GROUP 2.5: Design Guard Scope Expansion Report

**Date:** 2026-01-11
**Branch:** `chore/design-guard-scope-expansion-group25`
**Status:** COMPLETE

---

## Summary

Expanded design-guard enforcement scope to cover all mobile screen folders. This prevents reintroducing hex colors, raw lucide imports, and emoji icons outside the previous guard scope as we migrate remaining screen groups.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `scripts/design-guard.mjs` | Expanded targetRoots array |
| `docs/design-guard-baseline.json` | Regenerated for new scope |

---

## What Changed

### Previous Scope (3 paths)
```
mobile/src/components
mobile/src/screens/transport
mobile/src/screens/inbox
```

### New Scope (10 paths)
```
mobile/src/components
mobile/src/screens/click-fix
mobile/src/screens/events
mobile/src/screens/feedback
mobile/src/screens/home
mobile/src/screens/inbox
mobile/src/screens/onboarding
mobile/src/screens/pages
mobile/src/screens/settings
mobile/src/screens/transport
```

### Folders Added
| Folder | Files Scanned | Status |
|--------|---------------|--------|
| `screens/click-fix` | 3 | Unmigrated (pending GROUP 3+) |
| `screens/events` | 2 | Unmigrated (pending GROUP 3+) |
| `screens/feedback` | 3 | Unmigrated (pending GROUP 3+) |
| `screens/home` | 1 | Already clean |
| `screens/onboarding` | 3 | Migrated (GROUP 1) |
| `screens/pages` | 1 | Unmigrated (pending GROUP 3+) |
| `screens/settings` | 1 | Migrated (GROUP 2) |

---

## Why This Was Necessary Now

1. **Prevent Regression**: GROUP 0-2 migrations are complete. Expanding guard scope now ensures no new violations slip in during GROUP 3+ work.

2. **Early Detection**: Developers will see immediate feedback if they introduce hardcoded colors in any screen folder.

3. **Baseline Accuracy**: The old baseline contained stale violations from Banner.tsx and DepartureItem.tsx (fixed in GROUP 0). Regenerating captures actual current state.

---

## Baseline Changes

**Justification**: Baseline update was required because:
1. Old baseline (23 violations) referenced files that have been fixed (Banner.tsx, DepartureItem.tsx)
2. New scope includes 7 additional folders with 213 known violations in unmigrated screens
3. Without baseline update, CI would fail on every build

**Baseline Statistics:**
- Previous violations: 23 (stale, from fixed files)
- Current violations: 213 (from unmigrated screens)
- New baseline scope: 10 folders

All 213 violations are in screens pending migration (click-fix, events, feedback, pages). They will be removed as each GROUP is completed.

---

## Verification Results

### 1. TypeScript Check

```bash
$ pnpm -r typecheck
Scope: all 4 projects
. typecheck$ pnpm --dir backend typecheck && pnpm --dir admin exec tsc -b --noEmit && pnpm --dir mobile exec tsc --noEmit
backend typecheck: Done
. typecheck: Done
```

**Result:** PASS

### 2. Design Guardrails

```bash
$ pnpm design:guard
Design guard passed.
```

**Result:** PASS

### 3. Scope Verification (Files Scanned Per Folder)

```bash
$ for folder in click-fix events feedback home onboarding pages settings; do
    echo "$folder: $(find mobile/src/screens/$folder -name '*.tsx' -o -name '*.ts' | wc -l) files"
  done

click-fix: 3 files
events: 2 files
feedback: 3 files
home: 1 files
onboarding: 3 files
pages: 1 files
settings: 1 files
```

**Result:** All folders are being scanned.

### 4. Baseline Scope Confirmation

```bash
$ head -15 docs/design-guard-baseline.json
{
  "version": 1,
  "generatedAt": "2026-01-11T14:49:27.974Z",
  "scope": [
    "mobile/src/components",
    "mobile/src/screens/click-fix",
    "mobile/src/screens/events",
    "mobile/src/screens/feedback",
    "mobile/src/screens/home",
    "mobile/src/screens/inbox",
    "mobile/src/screens/onboarding",
    "mobile/src/screens/pages",
    "mobile/src/screens/settings",
    "mobile/src/screens/transport"
  ],
```

**Result:** All 10 folders in scope.

---

## Remaining Work (Outside Scope)

The following screens have baselined violations that will be fixed in future GROUPs:

| Screen Folder | Violation Count | Target GROUP |
|---------------|-----------------|--------------|
| `click-fix` | ~70 hex colors | GROUP 3+ |
| `events` | ~45 hex colors | GROUP 3+ |
| `feedback` | ~60 hex colors | GROUP 3+ |
| `pages` | ~38 hex colors | GROUP 3+ |

---

## Commit

```
chore(ci): expand design-guard scope to all mobile screens (group2.5)

- Add 7 screen folders to targetRoots: click-fix, events, feedback,
  home, onboarding, pages, settings
- Regenerate baseline for expanded scope (213 known violations)
- Remove stale baseline entries from already-fixed files

Scope now covers all mobile/src/screens/** and mobile/src/components/**

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
