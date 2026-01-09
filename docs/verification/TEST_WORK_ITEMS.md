# Test Work Items - MOJ VIS

**Date:** 2025-01-09
**Branch:** `audit/test-strategy`
**Purpose:** Concrete tasks to implement missing tests and fix existing issues

---

## 1. Work Item Categories

| Priority | Meaning |
|----------|---------|
| P0 | Release blocker - must fix before production |
| P1 | High priority - should fix in current sprint |
| P2 | Medium priority - fix in next sprint |
| P3 | Low priority - backlog |

---

## 2. Security Tests (P0 - Release Blockers)

### TWI-001: Add Authentication Enforcement Tests

**Priority:** P0 (RELEASE BLOCKER)
**Depends on:** WI-001 (Auth middleware implementation)

**Description:**
Create integration tests that verify admin endpoints reject unauthenticated requests.

**Files to create:**
- `backend/src/__tests__/auth.test.ts`

**Test cases:**
```typescript
describe('Authentication Enforcement', () => {
  it('GET /admin/inbox returns 401 without token', async () => {});
  it('GET /admin/inbox returns 401 with invalid token', async () => {});
  it('GET /admin/inbox returns 200 with valid token', async () => {});
  it('POST /admin/inbox returns 401 without token', async () => {});
  it('PATCH /admin/inbox/:id returns 401 without token', async () => {});
  it('DELETE /admin/inbox/:id returns 401 without token', async () => {});
  // Repeat for all admin endpoints
});
```

**Acceptance criteria:**
- [ ] All admin routes covered
- [ ] Tests run in CI pipeline
- [ ] No false positives

---

### TWI-002: Add Permission Matrix Validation Tests

**Priority:** P0 (RELEASE BLOCKER)
**Depends on:** WI-006 (Municipality scoping implementation)

**Description:**
Create tests that validate the permission matrix from `docs/verification/PERMISSION_MATRIX.md`.

**Files to create:**
- `backend/src/__tests__/permissions.test.ts`

**Test cases:**
```typescript
describe('Permission Matrix', () => {
  describe('Anonymous', () => {
    it('can access GET /inbox', async () => {});
    it('cannot access GET /admin/inbox', async () => {});
    it('cannot access POST /admin/inbox', async () => {});
  });

  describe('User (with device ID)', () => {
    it('can access GET /inbox', async () => {});
    it('can submit POST /feedback', async () => {});
    it('cannot access GET /admin/inbox', async () => {});
  });

  describe('Admin (with valid token)', () => {
    it('can access GET /admin/inbox', async () => {});
    it('can only see own municipality feedback', async () => {});
    it('cannot see other municipality feedback', async () => {});
  });
});
```

**Acceptance criteria:**
- [ ] All actor types covered
- [ ] All entity types covered
- [ ] Municipality scoping validated

---

## 3. Bug Fixes (P0)

### TWI-003: Fix InboxDetailScreen Tags Crash

**Priority:** P0 (RELEASE BLOCKER)
**Documented in:** `docs/KNOWN_LIMITATIONS.md`

**Description:**
Mobile InboxDetailScreen crashes with `TypeError: message.tags.filter is not a function`.

**Root cause:** `tags` field can be undefined or string instead of array.

**Files to modify:**
- `mobile/src/screens/inbox/InboxDetailScreen.tsx`

**Fix approach:**
```typescript
// Before
const urgentTags = message.tags.filter(t => t === 'hitno');

// After
const urgentTags = (message.tags ?? []).filter(t => t === 'hitno');
```

**Acceptance criteria:**
- [ ] InboxDetailScreen renders without crash
- [ ] Handles undefined tags
- [ ] Handles empty array tags
- [ ] Handles normal array tags

---

### TWI-004: Fix Admin E2E Selector Mismatches

**Priority:** P0 (RELEASE BLOCKER)
**Documented in:** `docs/KNOWN_LIMITATIONS.md`

**Description:**
13/28 Admin Playwright tests fail due to selector mismatches between tests and actual DOM.

**Files to modify:**
- `admin/src/pages/inbox/*.tsx` - Add data-testid attributes
- `admin/src/pages/feedback/*.tsx` - Add data-testid attributes
- `admin/src/pages/click-fix/*.tsx` - Add data-testid attributes
- `admin/src/pages/pages/*.tsx` - Add data-testid attributes
- `admin/e2e/*.spec.ts` - Update selectors if needed

**Required data-testid attributes:**
```
inbox-list
inbox-row-{id}
inbox-create
inbox-title-hr
inbox-body-hr
inbox-submit
inbox-delete-{id}
inbox-locked-badge
inbox-hitno-{id}

feedback-list
feedback-row-{id}
feedback-status-section
feedback-status-{status}
feedback-reply-input
feedback-reply-submit

click-fix-list
click-fix-row-{id}
click-fix-photo-{index}
click-fix-map-link
```

**Acceptance criteria:**
- [ ] All 28 Admin E2E tests pass
- [ ] data-testid attributes follow consistent naming
- [ ] No hardcoded selectors in test files

---

## 4. CI/CD Setup (P1)

### TWI-005: Configure GitHub Actions CI Pipeline

**Priority:** P1
**Effort:** Medium

**Description:**
Create CI pipeline that runs all test gates on every PR.

**Files to create:**
- `.github/workflows/ci.yml`

**Pipeline stages:**
```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install backend deps
        run: cd backend && npm ci
      - name: Run backend tests
        run: cd backend && npm test

  admin-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - name: Install admin deps
        run: cd admin && npm ci
      - name: Build admin
        run: cd admin && npm run build

  admin-e2e:
    runs-on: ubuntu-latest
    needs: [backend-tests, admin-build]
    steps:
      - uses: actions/checkout@v4
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: cd admin && npm run test:e2e
    continue-on-error: true  # WARNING level
```

**Acceptance criteria:**
- [ ] Pipeline runs on every PR
- [ ] Backend tests are BLOCKING
- [ ] Admin E2E is WARNING (non-blocking for now)
- [ ] Clear failure messages

---

### TWI-006: Add API Smoke Test to CI

**Priority:** P1
**Effort:** Medium
**Depends on:** TWI-005

**Description:**
Run API smoke tests in CI with PostgreSQL service container.

**Files to modify:**
- `.github/workflows/ci.yml`

**Additional job:**
```yaml
api-smoke:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_USER: test
        POSTGRES_PASSWORD: test
        POSTGRES_DB: mojvis_test
      ports:
        - 5432:5432
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
  steps:
    - uses: actions/checkout@v4
    - name: Setup DB
      run: cd backend && npm run db:migrate
    - name: Start server
      run: cd backend && npm run dev &
    - name: Wait for server
      run: sleep 5
    - name: Run smoke tests
      run: cd backend && npx tsx scripts/api-e2e-smoke.ts
```

**Acceptance criteria:**
- [ ] Smoke tests run in CI
- [ ] DB migrations applied
- [ ] All 40 tests pass
- [ ] Report artifact uploaded

---

## 5. Mobile Testing (P2)

### TWI-007: Configure Detox for Mobile E2E

**Priority:** P2
**Effort:** Large

**Description:**
Set up Detox testing framework for automated mobile E2E tests.

**Files to create:**
- `mobile/.detoxrc.js`
- `mobile/e2e/config.json`
- `mobile/e2e/firstTest.spec.js`

**Initial test cases:**
```javascript
describe('Mobile App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show onboarding on first launch', async () => {
    await expect(element(by.id('onboarding-screen'))).toBeVisible();
  });

  it('should complete onboarding flow', async () => {
    await element(by.id('language-hr')).tap();
    await element(by.id('user-mode-local')).tap();
    await element(by.id('municipality-vis')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show inbox list', async () => {
    await element(by.id('inbox-tab')).tap();
    await expect(element(by.id('inbox-list'))).toBeVisible();
  });
});
```

**Acceptance criteria:**
- [ ] Detox configured for iOS
- [ ] At least 5 critical journey tests
- [ ] Can run locally
- [ ] Documentation for setup

---

### TWI-008: Add Mobile testID Attributes

**Priority:** P2
**Depends on:** TWI-007

**Description:**
Add testID props to all touchable components for Detox testing.

**Files to modify:**
- `mobile/src/screens/**/*.tsx`
- `mobile/src/components/**/*.tsx`

**Required testIDs:**
```
onboarding-screen
language-hr, language-en
user-mode-local, user-mode-visitor
municipality-vis, municipality-komiza
home-screen
inbox-tab, events-tab, menu-tab
inbox-list
inbox-item-{id}
banner-card
feedback-form
click-fix-form
```

**Acceptance criteria:**
- [ ] All interactive elements have testID
- [ ] Consistent naming convention
- [ ] No duplicate IDs

---

## 6. Test Infrastructure (P2)

### TWI-009: Add Test Database Isolation

**Priority:** P2
**Effort:** Medium

**Description:**
Create isolated test database setup with automatic cleanup.

**Files to create:**
- `backend/src/__tests__/setup.ts`
- `backend/src/__tests__/teardown.ts`

**Implementation:**
```typescript
// setup.ts
export async function setupTestDB() {
  // Create test schema
  await db.query('CREATE SCHEMA IF NOT EXISTS test');
  // Run migrations
  await runMigrations('test');
}

// teardown.ts
export async function teardownTestDB() {
  await db.query('DROP SCHEMA test CASCADE');
}
```

**Acceptance criteria:**
- [ ] Tests use isolated schema
- [ ] Automatic cleanup after tests
- [ ] No interference between test runs

---

### TWI-010: Add Test Data Factories

**Priority:** P2
**Effort:** Small

**Description:**
Create factory functions for generating test data.

**Files to create:**
- `backend/src/__tests__/factories/inbox.ts`
- `backend/src/__tests__/factories/events.ts`
- `backend/src/__tests__/factories/feedback.ts`

**Example:**
```typescript
// factories/inbox.ts
export function createInboxMessage(overrides = {}) {
  return {
    title_hr: 'Test Message',
    title_en: 'Test Message',
    body_hr: 'Test body',
    body_en: 'Test body',
    tags: ['opcenito'],
    ...overrides,
  };
}

export function createHitnoMessage(overrides = {}) {
  return createInboxMessage({
    tags: ['hitno', 'opcenito'],
    active_from: new Date(),
    active_to: new Date(Date.now() + 3600000),
    ...overrides,
  });
}
```

**Acceptance criteria:**
- [ ] Factories for all entities
- [ ] Override support
- [ ] Type-safe

---

## 7. Documentation (P3)

### TWI-011: Add Test Running Guide

**Priority:** P3
**Effort:** Small

**Description:**
Create comprehensive guide for running all test types.

**Files to create:**
- `docs/RUNNING_TESTS.md`

**Contents:**
- Prerequisites (Node, PostgreSQL, etc.)
- Backend unit tests
- API smoke tests
- Admin E2E tests
- Mobile manual testing checklist
- CI pipeline status

**Acceptance criteria:**
- [ ] All test types documented
- [ ] Copy-paste commands work
- [ ] Troubleshooting section

---

### TWI-012: Add Doc Drift Prevention

**Priority:** P3
**Effort:** Small

**Description:**
Add script to detect documentation drift (docs don't match implementation).

**Files to create:**
- `scripts/check-doc-drift.ts`

**Checks:**
- API endpoints in docs match actual routes
- Permission matrix matches middleware
- Test counts match actual test files

**Acceptance criteria:**
- [ ] Script runs without errors
- [ ] Clear output on drift detected
- [ ] Can run in CI

---

## 8. Work Item Summary

| ID | Description | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| TWI-001 | Auth enforcement tests | P0 | Medium | BLOCKED (no auth) |
| TWI-002 | Permission matrix tests | P0 | Medium | BLOCKED (no auth) |
| TWI-003 | Fix tags crash | P0 | Small | TODO |
| TWI-004 | Fix E2E selectors | P0 | Medium | TODO |
| TWI-005 | GitHub Actions CI | P1 | Medium | TODO |
| TWI-006 | API smoke in CI | P1 | Medium | TODO |
| TWI-007 | Detox setup | P2 | Large | TODO |
| TWI-008 | Mobile testIDs | P2 | Medium | TODO |
| TWI-009 | Test DB isolation | P2 | Medium | TODO |
| TWI-010 | Test factories | P2 | Small | TODO |
| TWI-011 | Test running guide | P3 | Small | TODO |
| TWI-012 | Doc drift check | P3 | Small | TODO |

---

## 9. Implementation Order

```
Phase 1 (Pre-Release - P0):
TWI-003 (tags fix) → TWI-004 (E2E selectors)

Phase 2 (CI Setup - P1):
TWI-005 (GitHub Actions) → TWI-006 (API smoke CI)

Phase 3 (When Auth Ready - P0):
TWI-001 (auth tests) → TWI-002 (permission tests)

Phase 4 (Mobile E2E - P2):
TWI-008 (testIDs) → TWI-007 (Detox)

Phase 5 (Infrastructure - P2):
TWI-009 (DB isolation) → TWI-010 (factories)

Phase 6 (Documentation - P3):
TWI-011 (guide) → TWI-012 (drift check)
```

---

## 10. Related Documents

- `docs/verification/TEST_STRATEGY_REPORT.md` - Testing philosophy
- `docs/verification/MINIMUM_TEST_MATRIX.md` - Required coverage
- `docs/verification/RELEASE_GATES.md` - GO/NO-GO criteria
- `docs/TESTING_BIBLE.md` - Mandatory testing protocol
- `docs/KNOWN_LIMITATIONS.md` - Current issues
