# Release Gates - MOJ VIS

**Date:** 2025-01-09
**Branch:** `audit/test-strategy`
**Purpose:** Define explicit GO/NO-GO criteria for releases

---

## 1. Gate Categories

| Category | Impact |
|----------|--------|
| **HARD BLOCK** | Release CANNOT proceed under any circumstances |
| **SOFT BLOCK** | Release blocked unless explicitly overridden by team lead |
| **WARNING** | Release allowed but issue must be documented and tracked |

---

## 2. Security Gates (HARD BLOCK)

These conditions MUST be met. No exceptions.

### Gate S1: Authentication Enforcement

| Condition | Check | Tool |
|-----------|-------|------|
| `/admin/*` returns 401 without token | Automated | API smoke test |
| `/admin/*` returns 401 with invalid token | Automated | API smoke test |
| `/admin/*` returns 200 with valid token | Automated | API smoke test |

**Verification:**
```bash
# Must return 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/inbox
# Expected: 401

# Must return 200 with valid token
curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer <valid>" http://localhost:3000/admin/inbox
# Expected: 200
```

**Status:** NOT IMPLEMENTED (auth not yet built)
**Release Impact:** Production release blocked until auth implemented

### Gate S2: Permission Matrix Compliance

| Condition | Check | Tool |
|-----------|-------|------|
| Anonymous cannot access admin endpoints | Automated | API smoke test |
| User (device ID only) cannot access admin | Automated | API smoke test |
| Municipality scoping prevents cross-access | Automated | API smoke test |

**Status:** NOT TESTABLE (auth not yet built)

### Gate S3: Data Integrity

| Condition | Check | Tool |
|-----------|-------|------|
| Locked messages reject edits (409) | Automated | Backend tests |
| Soft-deleted items excluded from lists | Automated | Backend tests |
| Device ID required for user submissions | Automated | Backend tests |

**Status:** PASSING (existing tests cover this)

---

## 3. Functional Gates (SOFT BLOCK)

### Gate F1: Backend Tests

| Condition | Threshold | Current |
|-----------|-----------|---------|
| All backend unit tests pass | 100% | 100% (280/280) |
| No test files skipped | 0 skipped | 0 skipped |

**Verification:**
```bash
cd backend && npm test
# Expected: All tests pass
```

**Override Conditions:**
- Only if failure is in non-critical path AND documented

### Gate F2: API Smoke Tests

| Condition | Threshold | Current |
|-----------|-----------|---------|
| All smoke tests pass | 100% | 100% (40/40) |
| Health check passes (DB connected) | Required | PASS |

**Verification:**
```bash
cd backend && npx tsx scripts/api-e2e-smoke.ts
# Expected: 40/40 pass
```

**Override Conditions:**
- Only if failing test is for feature not in release scope

### Gate F3: Admin UI E2E

| Condition | Threshold | Current |
|-----------|-----------|---------|
| Navigation tests pass | 100% | 100% (8/8) |
| CRUD tests pass | 80%+ | 46% (failing) |

**Verification:**
```bash
cd admin && npm run test:e2e
```

**Override Conditions:**
- Navigation must always pass
- CRUD failures allowed if due to known selector issues (documented)

### Gate F4: Cross-System Flows

| Condition | Check | Tool |
|-----------|-------|------|
| Inbox → Banner → Mobile works | Manual | Checklist |
| Feedback submit → Admin → Reply works | Manual | Checklist |
| Click & Fix → Admin → Status works | Manual | Checklist |

**Override Conditions:**
- None - these are core civic flows

---

## 4. Quality Gates (WARNING)

### Gate Q1: Mobile App Stability

| Condition | Check |
|-----------|-------|
| iOS Simulator boots without crash | Manual |
| No red error screens | Manual |
| All journey paths navigable | Manual |

**Current Issues:**
- InboxDetailScreen crashes on undefined tags

**Override:** Allowed if crash isolated to edge case AND workaround documented

### Gate Q2: Localization

| Condition | Check |
|-----------|-------|
| All UI strings exist in HR | Manual spot-check |
| Critical strings exist in EN | Manual spot-check |

**Override:** Allowed for non-critical strings

### Gate Q3: Error Handling

| Condition | Check |
|-----------|-------|
| API errors return structured JSON | Automated |
| No unhandled promise rejections | Log inspection |

**Override:** Allowed for edge cases with low user impact

---

## 5. GO/NO-GO Decision Matrix

### RELEASE BLOCKED IF:

| ID | Condition | Current Status |
|----|-----------|----------------|
| S1 | Admin endpoints accessible anonymously | BLOCKED (no auth) |
| S2 | Permission matrix violated | BLOCKED (no auth) |
| S3 | Locked messages can be edited | PASS |
| F1 | Backend tests failing | PASS |
| F2 | Health check fails (DB down) | PASS |
| F3 | Admin navigation broken | PASS |
| F4 | Core civic flows broken | PASS |

### RELEASE ALLOWED WITH WARNINGS IF:

| ID | Condition | Current Status |
|----|-----------|----------------|
| Q1 | Minor mobile UI issues | WARNING (tags crash) |
| Q2 | Non-critical translations missing | N/A |
| Q3 | Admin E2E selectors mismatched | WARNING (13 tests) |
| Q4 | Performance below target | N/A (no benchmarks) |

---

## 6. Release Checklist

### Pre-Release (Required)

- [ ] Backend tests: `cd backend && npm test` → All pass
- [ ] API smoke: `npx tsx scripts/api-e2e-smoke.ts` → 40/40 pass
- [ ] Admin navigation: `cd admin && npm run test:e2e` → Navigation pass
- [ ] Health endpoint: `curl http://localhost:3000/health` → 200 OK
- [ ] iOS Simulator: App boots without crash
- [ ] Journey test: Inbox → Banner tap → Detail (manual)
- [ ] Journey test: Feedback submit → Admin sees (manual)

### Pre-Production (When Auth Implemented)

- [ ] Security test: Anonymous admin access → 401
- [ ] Security test: Valid token admin access → 200
- [ ] Security test: Municipality scoping → Enforced
- [ ] Permission matrix: All roles validated

---

## 7. Escalation Process

### If HARD BLOCK Condition Met:

1. Document the failure in GitHub issue
2. Tag with `release-blocker` label
3. Assign to responsible team member
4. No merge to main until resolved

### If SOFT BLOCK Override Requested:

1. Document justification in PR description
2. Get explicit approval from team lead
3. Create follow-up issue for fix
4. Add to release notes as known issue

### If WARNING Condition:

1. Document in release notes
2. Create issue for future sprint
3. Proceed with release

---

## 8. Automated Gate Checks

Future CI pipeline should include:

```yaml
# .github/workflows/release-gates.yml
name: Release Gates

on:
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd backend && npm ci && npm test
    # BLOCKING if fails

  api-smoke:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
    steps:
      - run: npx tsx scripts/api-e2e-smoke.ts
    # BLOCKING if fails

  admin-e2e:
    runs-on: ubuntu-latest
    steps:
      - run: cd admin && npm run test:e2e
    # WARNING if fails (non-blocking for now)
```

---

## 9. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-09 | Initial release gates definition |

---

## 10. Summary

**Current Release Status: BLOCKED**

| Gate | Status | Blocker |
|------|--------|---------|
| Security | BLOCKED | No authentication implemented |
| Backend | PASS | 280/280 tests |
| API Smoke | PASS | 40/40 tests |
| Admin E2E | WARNING | 13/28 failing (selectors) |
| Mobile | WARNING | Tags crash on detail |
| Cross-System | PASS | Manual verification |

**Action Required for Production:**
1. Implement authentication middleware
2. Add security enforcement tests
3. Fix Admin E2E selectors
4. Fix InboxDetailScreen tags handling
