# Baseline Recovery Audit Report

**Date:** 2026-01-11
**Branch:** `chore/baseline-recovery-audit`
**Auditor:** Claude Code (CLI)

---

## What Was Broken

### Admin Web Editor Regressions

1. **Menu Extras Not Loading**
   - Route `/menu/extras` returned 404
   - Route `/admin/menu/extras` not registered
   - Cause: Routes were defined but never registered in `backend/src/index.ts`

2. **Feedback Section Errors**
   - Admin feedback list failed with SQL error
   - Error: `could not determine data type of parameter $1`
   - Cause: Count query used `$3` placeholder but only received 1 parameter

3. **Admin Login Redirect Loop**
   - Users had to login twice before reaching dashboard
   - Cause: Auth context not refreshed after successful login

---

## Root Cause

Fixes were implemented on branch `fix/flight-test-admin-mobile-blockers` but **never merged to main**.

The fixes existed and were tested, but remained isolated on a feature branch while main continued to be deployed with the bugs.

---

## Recovered Commits

| Order | Commit | Message | Files Changed |
|-------|--------|---------|---------------|
| 1 | `985aea6` → `29d95c0` | fix(admin): refresh auth after login (no double login) | `admin/src/pages/LoginPage.tsx` |
| 2 | `18f372a` → `7f53ab9` | fix(backend): register menu-extras routes + fix feedback query | `backend/src/index.ts`, `backend/src/repositories/feedback.ts` |

---

## Files Changed Summary

```
admin/src/pages/LoginPage.tsx          | 3 +++
backend/src/index.ts                   | 6 ++++++
backend/src/repositories/feedback.ts  | 5 +++--
```

**Total:** 3 files changed, 12 insertions, 2 deletions

---

## Verification Results

| Check | Result |
|-------|--------|
| Backend typecheck | PASSED |
| Backend lint | PASSED (0 errors) |
| Admin typecheck | PASSED |
| Admin lint | PASSED (0 errors, 2 pre-existing warnings) |
| Backend startup | PASSED (all routes registered) |
| Menu Extras route | PASSED (`GET /menu/extras` returns `{"extras":[]}`) |
| Feedback route | PASSED (POST requires X-Device-ID as expected) |

---

## Route Registration Verification

After recovery, backend startup logs show:

```
[Server] Menu Extras: http://0.0.0.0:3000/menu/extras
[Server] Admin Menu Extras: http://0.0.0.0:3000/admin/menu/extras
```

These lines were **missing** before the fix.

---

## How To Avoid Recurrence

### Policy: Nothing is "done" until merged to main

1. **Definition of Done** must include "merged to main"
2. Feature branches containing fixes must be merged promptly
3. Before deploying/testing, always verify fixes are on the deployed branch
4. Use PR-based workflow for all fixes (not just features)
5. CI should run on main after every merge

### Recommended Workflow

```
[Fix Created] → [PR Opened] → [CI Passes] → [Review] → [Merge to Main] → [Deploy]
                                                              ↑
                                                    Fix is only "done" here
```

---

## Recovery Branch

- **Branch:** `chore/baseline-recovery-audit`
- **Base:** `origin/main` (commit `8549e0c`)
- **Commits applied:** 2
- **Ready for merge:** YES

---

## Appendix: Original Commit Details

### Commit 985aea6

```
fix(admin): refresh auth after login (no double login)

After successful login, call refreshAuth() before navigating to dashboard.
This ensures the auth context is updated immediately, preventing the
redirect loop that previously required a second login attempt.
```

### Commit 18f372a

```
fix(backend): register menu-extras routes + fix feedback query

- Import and register menuExtrasRoutes and adminMenuExtrasRoutes
- Fix parameter index mismatch in feedback count query (was using $3 where
  only $1 was passed, causing 'could not determine data type of parameter $1')
```
