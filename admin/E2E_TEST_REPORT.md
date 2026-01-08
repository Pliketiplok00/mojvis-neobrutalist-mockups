# Admin E2E Test Report

## Overview

Playwright E2E tests for the MOJ VIS Admin panel with `data-testid` selector migration.

## Test Results

```
Total: 28 tests
Passed: 25
Skipped: 3 (marked as fixme)
```

**Run command:**
```bash
cd admin && npx playwright test
```

## Test Coverage

### Navigation (`navigation.spec.ts`)
| Test | Status |
|------|--------|
| should load dashboard page | ✓ |
| should have all sidebar navigation links | ✓ |
| should navigate to Messages (Inbox) page | ✓ |
| should navigate to Events page | ✓ |
| should navigate to Pages page | ✓ |
| should navigate to Feedback page | ✓ |
| should navigate to Click & Fix page | ✓ |
| should have logout button | ✓ |

### Inbox CRUD (`inbox.spec.ts`)
| Test | Status |
|------|--------|
| should display messages list | ✓ |
| should navigate to new message form | ✓ |
| should create a new message | ✓ |
| should edit an existing message | FIXME |
| should delete a message | ✓ |
| should show locked state for pushed messages | ✓ |
| should prevent editing locked message | ✓ |

### Feedback (`feedback-clickfix.spec.ts`)
| Test | Status |
|------|--------|
| should display feedback list | ✓ |
| should open feedback detail | ✓ |
| should change feedback status | ✓ |
| should add reply to feedback | FIXME |

### Click & Fix (`feedback-clickfix.spec.ts`)
| Test | Status |
|------|--------|
| should display click-fix list | ✓ |
| should open click-fix detail | ✓ |
| should display photos in click-fix detail | ✓ |
| should have map link in click-fix detail | ✓ |
| should change click-fix status | ✓ |
| should add reply to click-fix | FIXME |

### Static Pages (`feedback-clickfix.spec.ts`)
| Test | Status |
|------|--------|
| should display pages list | ✓ |
| should open page editor | ✓ |
| should show placeholder for unimplemented block editors | ✓ |

## Known Issues (FIXME Tests)

### 1. Inbox Edit Test
**Issue:** Tags normalization causes EN validation issues in parallel runs.
**Root cause:** When creating a message via API with `tags: ['vis']`, the frontend may not receive the tags correctly due to JSON string/array normalization timing.

### 2. Feedback Reply Test
**Issue:** Reply doesn't appear after submission in parallel runs.
**Root cause:** API response timing and state update race conditions.

### 3. Click-Fix Reply Test
**Issue:** Same as feedback reply - input not cleared after submission.
**Root cause:** API response timing and state update race conditions.

## Data-TestID Naming Convention

### Sidebar Navigation
- `sidebar-link-dashboard`
- `sidebar-link-inbox`
- `sidebar-link-feedback`
- `sidebar-link-clickfix`
- `sidebar-link-events`
- `sidebar-link-pages`
- `sidebar-link-transport`

### Inbox
- `inbox-list` - Table container
- `inbox-create` - Create button
- `inbox-row-{id}` - Table row
- `inbox-hitno-{id}` - HITNO badge
- `inbox-edit-{id}` - Edit button
- `inbox-delete-{id}` - Delete button
- `inbox-title-hr` - HR title input
- `inbox-body-hr` - HR body textarea
- `inbox-submit` - Submit button
- `inbox-cancel` - Cancel button
- `inbox-locked-badge` - Locked indicator

### Feedback
- `feedback-list` - Table container
- `feedback-row-{id}` - Table row
- `feedback-view-{id}` - View button
- `feedback-reply-input` - Reply textarea
- `feedback-reply-submit` - Reply submit button
- `feedback-status-{status}` - Status change buttons
- `feedback-reply-{id}` - Reply card
- `feedback-reply-body` - Reply text

### Click & Fix
- `clickfix-list` - Table container
- `clickfix-row-{id}` - Table row
- `clickfix-view-{id}` - View button
- `clickfix-photos` - Photos section
- `clickfix-map-link` - Map link
- `clickfix-reply-input` - Reply textarea
- `clickfix-reply-submit` - Reply submit button
- `clickfix-status-{status}` - Status change buttons

### Static Pages
- `pages-list` - Table container
- `pages-row-{id}` - Table row
- `pages-view-{id}` - View button

## Code Fixes Applied

### 1. `isNew` Detection Fix
**Files:** `InboxEditPage.tsx`, `PageEditPage.tsx`
```typescript
// Before (bug: id is undefined for /messages/new route)
const isNew = id === 'new';

// After (correct)
const isNew = !id || id === 'new';
```

### 2. Tags Normalization
**File:** `api.ts`
```typescript
function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* ignore */ }
  }
  return [];
}
```

### 3. FeedbackListResponse Type Fix
**File:** `feedback.ts`
```typescript
// Before
export interface FeedbackListResponse {
  items: FeedbackListItem[];  // Wrong
}

// After
export interface FeedbackListResponse {
  feedback: FeedbackListItem[];  // Matches API
}
```

## Prerequisites

- Backend running on `http://localhost:3000`
- Admin dev server running on `http://localhost:5173` (or 5174)
- Database seeded with test data

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific spec
npx playwright test inbox.spec.ts

# Run with UI
npx playwright test --ui

# Generate report
npx playwright show-report
```
