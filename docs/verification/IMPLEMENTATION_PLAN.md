# Implementation Plan - MOJ VIS

**Date:** 2025-01-09
**Source:** `docs/todo/01Post-Audit-Baseline.md`
**Status:** CANONICAL IMPLEMENTATION REFERENCE

---

## Executive Summary

This plan organizes all work items from the Post-Audit Baseline into logical implementation phases. The ordering minimizes rework and ensures security is implemented atomically before any release.

**Key Principle:** Security cannot be split across phases. Authentication and authorization are implemented together in Phase 1, then validated in Phase 2. No partial security.

---

## Phase Overview

| Phase | Name | Purpose | Blocking? |
|-------|------|---------|-----------|
| 0 | Code Freeze & Reality Lock | Establish stable baseline | YES |
| 1 | Authentication & Identity | Implement admin auth end-to-end | YES |
| 2 | Authorization & Permissions | Enforce permission model | YES |
| 3 | Security Test Enablement | Validate security implementation | YES |
| 4 | UX & i18n Stabilization | Fix mobile crashes and localization | NO |
| 5 | CI & Release Hardening | Automation and release gates | NO |

---

## Phase 0: Code Freeze & Reality Lock

### Purpose

Establish a stable, known baseline before any implementation begins. Prevent scope creep and ensure all parties share the same understanding of current state.

### Entry Conditions

- Post-Audit Baseline document is complete and reviewed
- All stakeholders acknowledge current system state
- No active feature development in progress

### Exit Criteria

- [ ] All branches rebased onto main
- [ ] `docs/todo/01Post-Audit-Baseline.md` committed and tagged
- [ ] Feature development explicitly paused
- [ ] Kill List agreed and documented

### Work Items INCLUDED

| WI | Description | Notes |
|----|-------------|-------|
| WI-A8 | Documentation Drift Consolidation | Mark unimplemented features in docs |

### Work Items EXCLUDED

All implementation work. Phase 0 is documentation and agreement only.

---

## Phase 1: Authentication & Identity

### Purpose

Implement complete admin authentication from backend to UI. This phase delivers a working login flow with session management. No partial auth allowed.

### Entry Conditions

- Phase 0 complete
- Backend and Admin UI codebases ready for modification
- Auth mechanism decided (session tokens)

### Exit Criteria

- [ ] `POST /auth/login` validates credentials and returns token
- [ ] `POST /auth/logout` invalidates session
- [ ] All `/admin/*` routes reject requests without valid token (401)
- [ ] Admin UI login form connects to real auth endpoint
- [ ] Token persisted in UI (localStorage/sessionStorage)
- [ ] Manual verification: anonymous admin access returns 401

### Work Items INCLUDED

| WI | Description | Severity | Notes |
|----|-------------|----------|-------|
| WI-S-002 | Implement Real Admin Login Flow | CRITICAL | Backend + UI |
| WI-S-001 | Enforce Admin Authentication | CRITICAL | Middleware |
| WI-S-004 | Stop Trusting Client Headers | CRITICAL | Partial: auth headers only |
| WI-A1 | Admin Authentication & Authorization | CRITICAL | Systemic gap closure |

### Work Items EXCLUDED

| WI | Reason |
|----|--------|
| WI-A2 | Role enforcement is Phase 2 |
| WI-S-003 | Supervisor removal is Phase 2 |
| All UX items | Not security-related |
| All testing items | Cannot test until auth exists |

### Implementation Order (Within Phase)

1. **Backend: Auth service & routes**
   - Create `backend/src/services/auth.ts`
   - Create `backend/src/routes/auth.ts` (login/logout)
   - Add admin users table migration

2. **Backend: Auth middleware**
   - Create `backend/src/middleware/auth.ts`
   - Apply to all `/admin/*` routes
   - Remove header trust for auth

3. **Admin UI: Login integration**
   - Connect LoginPage to `/auth/login`
   - Store token in auth context
   - Remove navigation bypass

4. **Admin UI: Route guards**
   - Create ProtectedRoute component
   - Apply to all admin routes
   - Redirect unauthenticated to /login

---

## Phase 2: Authorization & Permissions

### Purpose

Enforce the canonical permission model. Remove supervisor role concept. Implement municipality scoping.

### Entry Conditions

- Phase 1 complete (auth working end-to-end)
- All admin requests require valid token
- Login flow verified

### Exit Criteria

- [ ] Supervisor role concept removed from codebase
- [ ] All authenticated admins have equal privileges
- [ ] Municipality scoping resolved from session, not headers
- [ ] Admin can only see feedback/click-fix from own municipality
- [ ] Device ID validation implemented for mobile users

### Work Items INCLUDED

| WI | Description | Severity | Notes |
|----|-------------|----------|-------|
| WI-S-003 | Remove Supervisor Concept | HIGH | Canonical role cleanup |
| WI-A2 | Admin Role Enforcement | CRITICAL | Aligned to single Admin role |
| WI-S-004 | Stop Trusting Client Headers | CRITICAL | Complete: all headers |
| WI-A4 | Admin API Exposure | HIGH | Defense-in-depth |

### Work Items EXCLUDED

| WI | Reason |
|----|--------|
| All UX items | Not authorization-related |
| All testing items | Phase 3 |
| Menu Extras | Feature work, not security |

### Implementation Order (Within Phase)

1. **Backend: Remove supervisor logic**
   - Delete `isSupervisor()` function
   - Remove `X-Admin-Role` header handling
   - Flatten all admin permissions

2. **Admin UI: Remove supervisor UI**
   - Remove hardcoded `isSupervisor = true`
   - Remove supervisor-only conditional rendering
   - Ensure all controls visible to authenticated admin

3. **Backend: Municipality scoping**
   - Extract municipality from session token
   - Filter feedback/click-fix by admin's municipality
   - Remove `X-Admin-Municipality` header trust

4. **Backend: Device validation**
   - Implement device registration endpoint
   - Validate `X-Device-ID` against registered devices
   - Reject unknown device IDs

---

## Phase 3: Security Test Enablement

### Purpose

Create and run security tests that validate Phase 1 and Phase 2 implementation. This phase cannot proceed until security is fully implemented.

### Entry Conditions

- Phase 1 complete (auth working)
- Phase 2 complete (permissions enforced)
- No known security gaps remaining

### Exit Criteria

- [ ] Security test suite exists and passes
- [ ] Anonymous admin access test: returns 401
- [ ] Invalid token test: returns 401
- [ ] Permission matrix test: enforced
- [ ] Municipality scoping test: cross-access blocked

### Work Items INCLUDED

| WI | Description | Priority | Notes |
|----|-------------|----------|-------|
| WI-T-001 | Authentication Test Suite | P0 | Now unblocked |

### Work Items EXCLUDED

| WI | Reason |
|----|--------|
| WI-T-002 | Admin E2E tests are Phase 5 |
| WI-Q-001 | CI setup is Phase 5 |

### Implementation Order (Within Phase)

1. **Create auth test file**
   - `backend/src/__tests__/auth.test.ts`

2. **Implement security tests**
   - Anonymous rejection tests
   - Token validation tests
   - Municipality scoping tests

3. **Run and verify**
   - All security tests must pass
   - No false positives

---

## Phase 4: UX & i18n Stabilization

### Purpose

Fix mobile crashes, implement internationalization, and resolve UX contract violations. This phase is non-blocking but important for user experience.

### Entry Conditions

- Phase 3 complete (security validated)
- Security tests passing
- No known security gaps

### Exit Criteria

- [ ] InboxDetailScreen tags crash fixed
- [ ] i18n implemented: language selection applies to UI
- [ ] EN translations exist for all user-facing strings
- [ ] Header navigation contract honored (back button on child screens)

### Work Items INCLUDED

| WI | Description | Severity | Notes |
|----|-------------|----------|-------|
| WI-T-003 | Mobile Crash: InboxDetailScreen Tags | P0 | Runtime crash fix |
| WI-A3 | Mobile Internationalization | HIGH | i18n not implemented |
| WI-A5 | Mobile Header UX Contract | MEDIUM | Navigation violation |
| WI-A6 | Admin UI Form & Selector Drift | MEDIUM | UX consistency |

### Work Items EXCLUDED

| WI | Reason |
|----|--------|
| WI-A7 | Menu Extras is feature work |
| WI-B1, B2, B3 | Lower priority UI verification |

### Implementation Order (Within Phase)

1. **Fix mobile crash (immediate)**
   - Fix `message.tags.filter is not a function`
   - Add defensive null handling

2. **Implement i18n (sequential)**
   - Choose i18n library/approach
   - Extract hardcoded strings
   - Wire language context to UI
   - Add EN translations

3. **Fix header navigation (parallel)**
   - Update GlobalHeader behavior
   - Implement back button for child screens

4. **Admin form cleanup (parallel)**
   - Normalize selectors
   - Add missing data-testid attributes

---

## Phase 5: CI & Release Hardening

### Purpose

Establish automated testing gates and release readiness. This phase enables sustainable development.

### Entry Conditions

- Phases 1-4 complete
- Security tests passing
- Mobile app stable

### Exit Criteria

- [ ] CI pipeline configured (GitHub Actions)
- [ ] Backend tests run on every PR (blocking)
- [ ] API smoke tests run with PostgreSQL (blocking)
- [ ] Admin E2E tests run (warning until stable)
- [ ] Mobile test foundation defined

### Work Items INCLUDED

| WI | Description | Priority | Notes |
|----|-------------|----------|-------|
| WI-T-002 | Fix Admin E2E Test Failures | P1 | Selector fixes |
| WI-Q-001 | CI Pipeline Setup | P1 | Automation |
| WI-Q-002 | Mobile Test Coverage | P2 | Foundation only |

### Work Items EXCLUDED

| WI | Reason |
|----|--------|
| WI-A7 | Menu Extras deferred to post-release |
| WI-B1, B2, B3 | Lower priority verification |

### Implementation Order (Within Phase)

1. **Fix Admin E2E selectors**
   - Add data-testid attributes
   - Update Playwright selectors
   - Verify all tests pass

2. **Configure CI pipeline**
   - Create `.github/workflows/ci.yml`
   - Backend tests (blocking)
   - API smoke tests (blocking)
   - Admin E2E (warning)

3. **Define mobile test scope**
   - Choose framework (Detox/manual)
   - Document critical journey tests
   - Implement at least banner → detail flow

---

## WI Mapping Summary

| WI | Phase | Status |
|----|-------|--------|
| WI-A1 | 1 | Authentication systemic fix |
| WI-A2 | 2 | Role enforcement |
| WI-A3 | 4 | i18n implementation |
| WI-A4 | 2 | API exposure defense |
| WI-A5 | 4 | Header UX fix |
| WI-A6 | 4 | Admin form cleanup |
| WI-A7 | KILLED | Menu Extras deferred |
| WI-A8 | 0 | Doc drift cleanup |
| WI-B1 | KILLED | Deferred verification |
| WI-B2 | KILLED | Deferred verification |
| WI-B3 | KILLED | Deferred verification |
| WI-S-001 | 1 | Auth enforcement |
| WI-S-002 | 1 | Login flow |
| WI-S-003 | 2 | Supervisor removal |
| WI-S-004 | 1+2 | Header trust removal |
| WI-T-001 | 3 | Security tests |
| WI-T-002 | 5 | E2E fixes |
| WI-T-003 | 4 | Mobile crash fix |
| WI-Q-001 | 5 | CI setup |
| WI-Q-002 | 5 | Mobile tests |

---

## Timeline Independence

This plan does NOT include time estimates. Phases must be completed in order, but scheduling is a team decision. Each phase is gated by objective exit criteria, not calendar dates.

---

## Related Documents

- `docs/todo/01Post-Audit-Baseline.md` - Source of truth
- `docs/verification/KILL_LIST.md` - Explicit non-goals
- `docs/verification/FREEZE_RULES.md` - Implementation constraints
- `docs/verification/IMPLEMENTATION_RISKS.md` - Sequencing risks
