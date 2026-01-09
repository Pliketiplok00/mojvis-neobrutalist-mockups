# Implementation Risks - MOJ VIS

**Date:** 2025-01-09
**Source:** `docs/todo/01Post-Audit-Baseline.md`
**Purpose:** High-risk items and sequencing constraints

---

## Purpose

This document identifies areas where partial implementation is dangerous, dependencies that invalidate later phases if broken, and sequencing constraints that must be respected.

---

## Risk Category 1: Partial Security Implementation

### RISK-S1: Half-Implemented Auth (CRITICAL)

**Danger:** Implementing backend auth without UI integration, or vice versa.

**Failure mode:**
- Backend has auth middleware but UI bypasses it
- UI has login form but backend accepts all requests
- Result: False sense of security

**Mitigation:**
- Phase 1 must complete atomically
- All auth components implemented together
- Manual verification: anonymous request → 401

**Indicator of violation:**
- "Auth mostly works" statements
- UI navigating without valid token
- Tests passing without auth headers

---

### RISK-S2: Header Trust Removal Incomplete (CRITICAL)

**Danger:** Removing some header trust but not all.

**Current headers that MUST NOT be trusted:**
- `X-Admin-Role` - identity claim
- `X-Admin-Municipality` - scope claim
- `X-Device-ID` - device claim (must be validated)

**Failure mode:**
- Auth middleware added but role still from header
- Municipality scoping still trusts header
- Result: Privilege escalation possible

**Mitigation:**
- WI-S-004 spans Phase 1 and Phase 2
- All header trust removed before Phase 2 exits
- No "partial trust removal"

**Indicator of violation:**
- Code checking `request.headers['x-admin-*']`
- Session not being used for identity
- Tests passing different headers

---

### RISK-S3: Supervisor Logic Partially Removed (HIGH)

**Danger:** Removing supervisor from UI but not backend, or vice versa.

**Current supervisor code locations:**
- `admin/src/pages/pages/PageEditPage.tsx` - `isSupervisor = true`
- `backend/src/routes/admin-static-pages.ts` - `isSupervisor()` function
- `admin/src/services/api.ts` - `x-admin-role: supervisor` header

**Failure mode:**
- UI no longer shows supervisor controls
- Backend still checks for supervisor role
- Result: Features silently broken

**Mitigation:**
- WI-S-003 removes ALL supervisor references
- Search codebase for "supervisor" before Phase 2 exit
- Verify: all authenticated admins have equal access

**Indicator of violation:**
- `grep -r "supervisor" src/` returns results
- Some admin actions work, others fail
- 403 errors for authenticated admins

---

## Risk Category 2: Test Infrastructure Gaps

### RISK-T1: Security Tests Created Before Auth Exists (HIGH)

**Danger:** Writing security tests that pass because auth doesn't exist.

**Failure mode:**
- Tests check for 401 but get 200 (because no middleware)
- Tests written to "current behavior" not "correct behavior"
- Result: Tests give false confidence

**Mitigation:**
- WI-T-001 is Phase 3, AFTER Phase 1-2 complete
- Tests must fail before auth, pass after
- No "skip auth in test mode"

**Indicator of violation:**
- Security tests passing on unauthenticated codebase
- Tests mocking auth instead of testing it
- "Auth tests will be added later"

---

### RISK-T2: E2E Tests Break During Security Work (MEDIUM)

**Danger:** Admin E2E tests fail because they assume no auth.

**Current state:**
- Playwright tests navigate directly to admin routes
- No login step in test setup
- Auth would break all tests

**Mitigation:**
- E2E test fixes (WI-T-002) in Phase 5
- During Phases 1-3, E2E tests may fail
- Backend unit tests remain primary gate

**Indicator of violation:**
- Blocking on E2E test failures during auth work
- Disabling auth "to make tests pass"
- Reverting security work for test compatibility

---

### RISK-T3: Mobile Crash Blocks Manual Testing (MEDIUM)

**Danger:** InboxDetailScreen crash prevents manual verification flows.

**Current state:**
- `message.tags.filter is not a function` crash
- Affects inbox detail viewing
- Blocks manual testing of banner → detail flow

**Mitigation:**
- WI-T-003 should be early in Phase 4
- Small, isolated fix
- Does not depend on auth work

**Indicator of violation:**
- Manual testing skipped due to crash
- "Works except for that one screen"
- Crash fix deferred indefinitely

---

## Risk Category 3: Dependency Chains

### RISK-D1: Phase 3 Blocked by Incomplete Phase 1-2 (CRITICAL)

**Dependency chain:**
```
Phase 1 (Auth) → Phase 2 (Permissions) → Phase 3 (Security Tests)
```

**Danger:** Starting Phase 3 before 1-2 complete.

**Failure mode:**
- Security tests written against partial implementation
- Tests pass but security not complete
- Result: False confidence, actual vulnerability

**Mitigation:**
- Strict phase gating
- Exit criteria verification
- No "parallel" work on Phase 3 during Phase 1-2

**Indicator of violation:**
- "Let's start writing security tests now"
- Phase 3 PR opened before Phase 2 merged
- Tests that check for auth patterns that don't exist yet

---

### RISK-D2: i18n Implementation Blocks UX Work (LOW)

**Dependency chain:**
```
i18n strategy chosen → strings extracted → translations added → UI verified
```

**Danger:** Starting string extraction before strategy decided.

**Failure mode:**
- Multiple i18n approaches in codebase
- Inconsistent translation keys
- Rework when strategy changes

**Mitigation:**
- i18n strategy decision documented first
- Single approach for entire codebase
- All i18n work in Phase 4

**Indicator of violation:**
- "I'll just use this i18n library for now"
- Different screens using different approaches
- Translation keys named inconsistently

---

### RISK-D3: CI Setup Before Tests Stable (MEDIUM)

**Dependency chain:**
```
Security tests passing → E2E tests stable → CI configured
```

**Danger:** CI configured with unstable tests.

**Failure mode:**
- CI fails on every PR
- Team ignores CI
- CI becomes noise, not signal

**Mitigation:**
- CI (WI-Q-001) is Phase 5
- Only after security and E2E tests stable
- CI starts with high-confidence tests only

**Indicator of violation:**
- "Just mark that test as skipped"
- CI PRs merged despite failures
- `continue-on-error: true` everywhere

---

## Risk Category 4: Data & State Risks

### RISK-DATA-1: Auth Migration on Populated Database (MEDIUM)

**Danger:** Adding admin users table to production database with existing data.

**Failure mode:**
- Migration fails due to constraint
- Data loss during migration
- Rollback not possible

**Mitigation:**
- Auth tables are new (no existing data)
- Migration is additive, not destructive
- Test migration on copy of production data

**Indicator of violation:**
- Migrations altering existing tables
- DROP statements in migration
- Migration without rollback plan

---

### RISK-DATA-2: Session Storage Choice (MEDIUM)

**Decision required:** Where to store sessions.

**Options:**
1. Database (PostgreSQL) - simpler, works now
2. Redis - faster, requires new infra
3. JWT (stateless) - no storage, harder to revoke

**Recommendation:** Database for Phase 1 (matches existing infra).

**Danger:** Wrong choice requires rework.

**Mitigation:**
- Document decision in Phase 1 entry
- Abstract session storage interface
- Keep migration path to Redis open

**Indicator of violation:**
- Session approach undecided in Phase 1
- Multiple session storage implementations
- "We'll switch to Redis later" without interface

---

## Risk Category 5: Coordination Risks

### RISK-C1: Parallel Work Creates Merge Conflicts (MEDIUM)

**Danger:** Multiple developers working on same files.

**High-conflict areas:**
- `backend/src/index.ts` (route registration)
- `admin/src/App.tsx` (route guards)
- `backend/src/middleware/*` (new files)

**Mitigation:**
- Sequential phases preferred
- Clear file ownership during phases
- Frequent rebases

**Indicator of violation:**
- Large merge conflicts
- "I'll fix the conflicts later"
- Divergent branches

---

### RISK-C2: Miscommunication on Phase Exit (LOW)

**Danger:** Team disagreement on whether phase is complete.

**Failure mode:**
- Some believe Phase 1 done, others don't
- Work starts on Phase 2 prematurely
- Incomplete auth in production path

**Mitigation:**
- Exit criteria are explicit and verifiable
- Sign-off required from team lead
- Phase completion announced explicitly

**Indicator of violation:**
- "I think Phase 1 is done"
- Checklist items skipped
- No formal sign-off

---

## Risk Matrix Summary

| Risk | Category | Severity | Phase Affected | Mitigation |
|------|----------|----------|----------------|------------|
| RISK-S1 | Security | CRITICAL | 1 | Atomic implementation |
| RISK-S2 | Security | CRITICAL | 1-2 | Complete header removal |
| RISK-S3 | Security | HIGH | 2 | Full supervisor removal |
| RISK-T1 | Testing | HIGH | 3 | Phase ordering |
| RISK-T2 | Testing | MEDIUM | 1-3 | Accept E2E failures |
| RISK-T3 | Testing | MEDIUM | 4 | Early crash fix |
| RISK-D1 | Dependency | CRITICAL | 1-3 | Strict gating |
| RISK-D2 | Dependency | LOW | 4 | Strategy first |
| RISK-D3 | Dependency | MEDIUM | 5 | Stable tests first |
| RISK-DATA-1 | Data | MEDIUM | 1 | Additive migration |
| RISK-DATA-2 | Data | MEDIUM | 1 | Document decision |
| RISK-C1 | Coordination | MEDIUM | All | Sequential work |
| RISK-C2 | Coordination | LOW | All | Explicit sign-off |

---

## Atomic Work Units

The following work MUST be completed as indivisible units:

### Atomic Unit 1: Authentication (Phase 1)

```
MUST complete together:
- Backend auth service
- Backend auth routes
- Backend auth middleware
- Admin UI login integration
- Admin UI route guards
- Admin UI token storage
```

**Cannot ship:**
- Auth service without middleware
- Middleware without UI integration
- UI integration without route guards

---

### Atomic Unit 2: Supervisor Removal (Phase 2)

```
MUST complete together:
- Remove backend isSupervisor()
- Remove backend X-Admin-Role handling
- Remove UI isSupervisor state
- Remove UI supervisor conditionals
- Remove API supervisor headers
```

**Cannot ship:**
- Backend removal without UI removal
- UI removal without API header removal
- Any "supervisor" string remaining

---

### Atomic Unit 3: Security Test Suite (Phase 3)

```
MUST complete together:
- Anonymous rejection tests
- Invalid token tests
- Permission matrix tests
- All tests passing
```

**Cannot ship:**
- Tests that skip auth
- Tests that pass without auth existing
- Partial test coverage

---

## Related Documents

- `docs/verification/IMPLEMENTATION_PLAN.md` - Phase structure
- `docs/verification/FREEZE_RULES.md` - Prevention measures
- `docs/verification/KILL_LIST.md` - Scope protection
- `docs/todo/01Post-Audit-Baseline.md` - Source findings
