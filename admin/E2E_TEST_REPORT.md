# Admin E2E Test Report

## Overview

Playwright E2E tests for the MOJ VIS Admin panel with `data-testid` selector migration.

## Test Results

```
Total: 28 tests
Passed: 28
Skipped: 0
Failed: 0
```

**Run command:**
```bash
cd admin && npx playwright test
```

## Test Coverage

### Navigation (`navigation.spec.ts`)
| Test | Status |
|------|--------|
| should load dashboard page | PASS |
| should have all sidebar navigation links | PASS |
| should navigate to Messages (Inbox) page | PASS |
| should navigate to Events page | PASS |
| should navigate to Pages page | PASS |
| should navigate to Feedback page | PASS |
| should navigate to Click & Fix page | PASS |
| should have logout button | PASS |

### Inbox CRUD (`inbox.spec.ts`)
| Test | Status |
|------|--------|
| should display messages list | PASS |
| should navigate to new message form | PASS |
| should create a new message | PASS |
| should edit an existing message | PASS |
| should delete a message | PASS |
| should show locked state for pushed messages | PASS |
| should prevent editing locked message | PASS |

### Feedback (`feedback-clickfix.spec.ts`)
| Test | Status |
|------|--------|
| should display feedback list | PASS |
| should open feedback detail | PASS |
| should change feedback status | PASS |
| should add reply to feedback | PASS |

### Click & Fix (`feedback-clickfix.spec.ts`)
| Test | Status |
|------|--------|
| should display click-fix list | PASS |
| should open click-fix detail | PASS |
| should display photos in click-fix detail | PASS |
| should have map link in click-fix detail | PASS |
| should change click-fix status | PASS |
| should add reply to click-fix | PASS |

### Static Pages (`feedback-clickfix.spec.ts`)
| Test | Status |
|------|--------|
| should display pages list | PASS |
| should open page editor | PASS |
| should show placeholder for unimplemented block editors | PASS |

## Configuration

Tests run serially (`workers: 1`) to prevent API contention issues that occur in parallel execution. This provides deterministic, reliable results.

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
- `clickfix-photo-{index}` - Individual photo
- `clickfix-map-link` - Map link
- `clickfix-reply-input` - Reply textarea
- `clickfix-reply-submit` - Reply submit button
- `clickfix-status-{status}` - Status change buttons
- `clickfix-reply-{id}` - Reply card
- `clickfix-reply-body` - Reply text

### Static Pages
- `pages-list` - Table container
- `pages-row-{id}` - Table row
- `pages-view-{id}` - View button

## Fixes Applied

### 1. Test Isolation via Data Strategy
Each test that needs existing data creates its own entities via API:
- Inbox edit: Creates unique message with `e2e-edit-${Date.now()}`
- Feedback reply: Creates unique feedback with `e2e-reply-${Date.now()}`
- Click-fix reply: Creates unique click-fix with `e2e-clickfix-reply-${Date.now()}`

### 2. API Response Status Fix
Reply endpoints return HTTP 201 (Created), not 200:
```typescript
// Before (incorrect)
page.waitForResponse(resp => resp.url().includes('/reply') && resp.status() === 200)

// After (correct)
page.waitForResponse(resp => resp.url().includes('/reply') && resp.status() === 201)
```

### 3. Frontend State Update Fix
Reply submission now refetches full detail after adding reply:
```typescript
// Before (bug: API returns only reply, not full detail)
const updated = await api.addReply(id, { body });
setFeedback(updated); // Corrupts state!

// After (correct: refetch full detail)
await api.addReply(id, { body });
const updated = await api.getFeedbackDetail(id);
setFeedback(updated);
```

### 4. `isNew` Detection Fix
**Files:** `InboxEditPage.tsx`, `PageEditPage.tsx`
```typescript
// Before (bug: id is undefined for /messages/new route)
const isNew = id === 'new';

// After (correct)
const isNew = !id || id === 'new';
```

### 5. Tags Normalization
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

### 6. FeedbackListResponse Type Fix
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
