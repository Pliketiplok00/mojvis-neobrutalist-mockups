# Test Strategy Report - MOJ VIS

**Date:** 2025-01-09
**Branch:** `audit/test-strategy`
**Status:** CANONICAL REFERENCE

---

## 1. Executive Summary

This document defines the testing philosophy and layered approach for MOJ VIS. The strategy prioritizes:

1. **Security regression prevention** - Authentication and permission enforcement
2. **Civic flow integrity** - Core user journeys cannot silently break
3. **Doc-code alignment** - Tests validate what docs describe
4. **Meaningful CI failures** - Actionable, not noisy

---

## 2. Testing Philosophy

### 2.1 Test-First Mindset

Per `docs/TESTING_BIBLE.md`:
- Tests written **before or alongside** implementation
- Code without tests is considered **incomplete**
- "It seems to work" is **not acceptable** - must be verified

### 2.2 Zero Tolerance for Silent Failures

- Errors must never be swallowed
- Console warnings must be investigated
- No TODOs for failing tests - fix now or document blocker

### 2.3 Definition of Done

A feature is NOT done unless:
1. All required tests exist
2. All tests pass
3. Logs inspected with no errors
4. iOS simulator runs without crashes
5. All journey paths navigable

---

## 3. Layered Test Architecture

```
                        ┌─────────────────────┐
                        │    E2E Journeys     │  ← Cross-system flows
                        │  (Manual / Smoke)   │     Admin→Backend→Mobile
                        └─────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │                         │
           ┌────────┴────────┐       ┌────────┴────────┐
           │   Admin E2E     │       │   API Smoke     │
           │  (Playwright)   │       │  (api-e2e.ts)   │
           └────────┬────────┘       └────────┬────────┘
                    │                         │
           ┌────────┴────────┐       ┌────────┴────────┐
           │  Component      │       │   Backend       │
           │  (Future)       │       │   Unit/Int      │
           └─────────────────┘       │  (Vitest)       │
                                     └─────────────────┘
```

### 3.1 Backend Layer (Strongest)

**Framework:** Vitest
**Location:** `backend/src/__tests__/*.test.ts`
**Current State:** 280 tests, 11 files, ALL PASSING

| Test File | Coverage |
|-----------|----------|
| `inbox.test.ts` | Inbox routes, eligibility, tags regression |
| `events.test.ts` | Events CRUD, subscriptions |
| `feedback.test.ts` | Feedback submission, status, replies |
| `click-fix.test.ts` | Click & Fix with photos, status |
| `static-pages.test.ts` | Pages list, detail, blocks |
| `push.test.ts` | Push token management, opt-in |
| `eligibility.test.ts` | User eligibility rules (61 tests) |
| `reminder-generation.test.ts` | Reminder job logic |
| `menu-extras.test.ts` | Menu extras CRUD |
| `transport-validation.test.ts` | Transport data validation |
| `health.test.ts` | Health endpoint |

**Strength:** Comprehensive route coverage
**Gap:** Uses mocks - not true integration tests against DB

### 3.2 API Smoke Layer

**Framework:** Custom TypeScript script
**Location:** `backend/scripts/api-e2e-smoke.ts`
**Current State:** 40 tests, requires running backend + DB

| Phase | Tests |
|-------|-------|
| Health | DB connection gate |
| Inbox | CRUD + HITNO lock flow |
| Events | CRUD lifecycle |
| Pages | List, detail, public access |
| Feedback | Submit → Admin → Reply flow |
| Click & Fix | Multipart upload → Admin flow |
| Transport | Read-only verification |
| Public | Endpoint accessibility |

**Strength:** Real DB integration, full lifecycle tests
**Gap:** Manual execution only, no CI integration

### 3.3 Admin UI E2E Layer

**Framework:** Playwright
**Location:** `admin/e2e/*.spec.ts`
**Current State:** 28 tests, 13 FAILING (selector mismatch)

| Spec File | Status | Issue |
|-----------|--------|-------|
| `navigation.spec.ts` | 8 PASS | Navigation links work |
| `inbox.spec.ts` | ~5 FAIL | data-testid selectors |
| `feedback-clickfix.spec.ts` | ~8 FAIL | data-testid selectors |

**Strength:** Real browser testing, UI workflow coverage
**Gap:** Selector mismatches need fixing (documented in KNOWN_LIMITATIONS.md)

### 3.4 Mobile Layer

**Framework:** NONE CONFIGURED
**Current State:** Zero automated tests

**Manual Testing Required:**
- iOS Simulator boot check
- Journey path navigation
- Banner tap → Inbox detail
- Feedback/Click & Fix submission

**Critical Gap:** No automated mobile E2E (Detox/Appium not configured)

---

## 4. Current Test Coverage Analysis

### 4.1 What IS Covered

| Area | Test Type | Status |
|------|-----------|--------|
| Backend routes | Unit (mocked) | 280 tests PASS |
| API lifecycle flows | Integration (DB) | 40 tests PASS |
| Admin navigation | E2E (Playwright) | 8 tests PASS |
| Inbox CRUD | E2E (Playwright) | Partial (selector issues) |
| Feedback flow | E2E (Playwright) | Partial (selector issues) |
| Eligibility rules | Unit | 61 tests PASS |
| Push notifications | Unit | 45 tests PASS |
| Reminder generation | Unit | 7 tests PASS |
| Transport validation | Unit | 20 tests PASS |

### 4.2 What is NOT Covered

| Area | Gap Type | Severity |
|------|----------|----------|
| Authentication | No tests exist | CRITICAL |
| Permission enforcement | No tests exist | CRITICAL |
| Anonymous admin access | No rejection tests | CRITICAL |
| Mobile app | Zero automated tests | HIGH |
| Cross-system flows | Manual only | HIGH |
| Admin CRUD completion | Selector mismatch | MEDIUM |
| Visual regression | Not configured | LOW |
| Performance/load | Not configured | LOW |
| Accessibility | Not configured | LOW |

---

## 5. Critical Flows Lacking Automation

### 5.1 Security (CRITICAL - No Tests)

1. **Admin auth rejection** - Verify `/admin/*` returns 401 without token
2. **Permission checks** - Admin vs User vs Anonymous
3. **Municipality scoping** - Cross-municipality access blocked
4. **Device ID validation** - Invalid device rejected

### 5.2 Civic Flows (HIGH - Manual Only)

1. **Inbox → Banner → Mobile** - Message appears as banner, tap opens detail
2. **Feedback lifecycle** - Submit → Admin review → Reply → User sees
3. **Click & Fix lifecycle** - Report → Photo upload → Admin → Status
4. **Event reminders** - Subscribe → Reminder generated → Inbox

### 5.3 Static Pages (MEDIUM)

1. **Draft → Publish → Mobile render**
2. **Block content editing**
3. **Block lock enforcement**

---

## 6. Test Execution Guide

### 6.1 Backend Unit Tests

```bash
cd backend && npm test
```

**Expected:** 280 tests pass, ~1.5s runtime

### 6.2 API Smoke Tests

```bash
# Requires: PostgreSQL running, backend started
cd backend && npx tsx scripts/api-e2e-smoke.ts
```

**Expected:** 40 tests pass, generates `docs/API_E2E_REPORT.md`

### 6.3 Admin E2E Tests

```bash
# Requires: Admin UI running on localhost:5173, backend on localhost:3000
cd admin && npm run test:e2e
```

**Expected:** 15/28 pass (13 failing due to selector mismatch)

### 6.4 Manual Mobile Verification

1. Start Metro: `cd mobile && npm start`
2. Launch iOS: `npm run ios`
3. Navigate all journey paths (see TESTING_BIBLE.md section 6)

---

## 7. Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| CI/CD Pipeline | NOT CONFIGURED | All tests manual |
| Test Database | Local PostgreSQL | No test isolation |
| Test Data Seeding | Via scripts | `seed-dev-data.ts` |
| Test Data Cleanup | Manual | No automatic teardown |
| Detox/Appium | NOT CONFIGURED | Mobile E2E blocked |
| Visual Regression | NOT CONFIGURED | UI changes not caught |

---

## 8. Recommendations Summary

### Immediate (Pre-Release Blockers)

1. Add authentication tests (when auth implemented)
2. Fix Admin E2E selector mismatches
3. Create security enforcement smoke tests

### Short-Term

1. Configure CI pipeline (GitHub Actions)
2. Add mobile Detox tests for critical paths
3. Create permission matrix validation tests

### Medium-Term

1. Add visual regression testing
2. Configure test database with isolation
3. Add performance benchmarks

---

## 9. Related Documents

- `docs/TESTING_BIBLE.md` - Mandatory testing protocol
- `docs/KNOWN_LIMITATIONS.md` - Current test failures
- `docs/API_E2E_REPORT.md` - Latest smoke test results
- `docs/verification/MINIMUM_TEST_MATRIX.md` - Required test coverage
- `docs/verification/RELEASE_GATES.md` - GO/NO-GO criteria
- `docs/verification/TEST_WORK_ITEMS.md` - Implementation tasks
