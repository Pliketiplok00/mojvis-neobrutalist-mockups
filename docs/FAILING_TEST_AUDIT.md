# Failing Test Audit Report

**Date**: 2026-01-09
**Status**: ROOT CAUSE IDENTIFIED

---

## Failing Test Identifier

| Field | Value |
|-------|-------|
| **File** | `backend/src/__tests__/eligibility.test.ts` |
| **Test Suite** | `filterBannerEligibleMessages (Phase 2)` |
| **Test Name** | `should only return messages with valid hitno + context tag` |
| **Line** | 488 |

---

## Command Used

```bash
npm test -- --reporter=verbose
```

---

## Failure Output

```
FAIL  src/__tests__/eligibility.test.ts > filterBannerEligibleMessages (Phase 2) > should only return messages with valid hitno + context tag
AssertionError: expected [ '4', '1' ] to deeply equal [ '1', '4' ]

- Expected
+ Received

  Array [
-   "1",
    "4",
+   "1",
  ]

 ❯ src/__tests__/eligibility.test.ts:488:35
    486|
    487|     const result = filterBannerEligibleMessages(messages, createContex…
    488|     expect(result.map(m => m.id)).toEqual(['1', '4']);
       |                                   ^
    489|   });

Test Files  1 failed | 11 passed (12)
     Tests  1 failed | 291 passed (292)
```

---

## Root Cause Analysis

### The Bug: Non-Deterministic Sort Order

The test creates two messages that pass banner eligibility:

```typescript
createMessage({ id: '1', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow }),
createMessage({ id: '4', tags: ['hitno', 'kultura'], active_from: yesterday, active_to: tomorrow }),
```

**Problem**: Both messages have:
- Same `active_from` value (yesterday)
- No explicit `created_at` value

The `createMessage` helper defaults `created_at: new Date()` for each call. When messages are created in rapid succession (microseconds apart), their `created_at` timestamps are nearly identical.

### The Sort Logic

From `backend/src/lib/eligibility.ts:289-300`:

```typescript
eligible.sort((a, b) => {
  // active_from DESC (newer urgency first)
  const aFrom = a.active_from?.getTime() ?? 0;
  const bFrom = b.active_from?.getTime() ?? 0;
  if (bFrom !== aFrom) {
    return bFrom - aFrom;
  }

  // created_at DESC (fallback)
  const aCreated = a.created_at.getTime();
  const bCreated = b.created_at.getTime();
  return bCreated - aCreated;
});
```

When `active_from` is identical and `created_at` differs by microseconds, the sort result becomes non-deterministic due to:
1. JavaScript sort stability not guaranteed across all engines
2. Timestamp resolution (milliseconds) may round to same value

---

## Is This Related to Menu Extras?

**NO** - This test is unrelated to the menu extras feature.

| Factor | Evidence |
|--------|----------|
| Test file | `eligibility.test.ts` - tests banner eligibility logic |
| Menu extras files | `menu-extras.ts`, `menu-extras.test.ts` - completely separate |
| Code overlap | Zero overlap - menu extras has no interaction with banner eligibility |
| Git history | Test modified as part of **Phase 2 banner rules** changes (uncommitted) |

The test failure is related to **Phase 2 banner rule refactoring** that rewrote eligibility tests to match new banner logic (`hitno` + context tag requirement).

---

## Why It Passes Sometimes

The test is **flaky** (non-deterministic):
- Sometimes message '1' is created with slightly later `created_at` than '4' → passes
- Sometimes message '4' is created with slightly later `created_at` than '1' → fails

This explains the "pre-existing failure" note: it fails intermittently.

---

## Recommendation

**FIX NOW** (before committing Phase 2 changes)

### Option A: Set Explicit `created_at` Values (Recommended)

```typescript
const now = new Date();
const createdFirst = new Date(now.getTime() - 2000); // 2 seconds ago
const createdSecond = new Date(now.getTime() - 1000); // 1 second ago

const messages = [
  createMessage({ id: '1', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow, created_at: createdFirst }),
  createMessage({ id: '2', tags: ['opcenito'], active_from: yesterday, active_to: tomorrow }),
  createMessage({ id: '3', tags: ['hitno'], active_from: yesterday, active_to: tomorrow }),
  createMessage({ id: '4', tags: ['hitno', 'kultura'], active_from: yesterday, active_to: tomorrow, created_at: createdSecond }),
];

// Now order is deterministic: message '4' (newer created_at) comes before '1'
expect(result.map(m => m.id)).toEqual(['4', '1']);
```

### Option B: Use Unordered Assertion

If the test only cares about which messages are included (not order):

```typescript
expect(result.map(m => m.id)).toEqual(expect.arrayContaining(['1', '4']));
expect(result).toHaveLength(2);
```

### Why Fix Now?

1. **Flaky tests erode CI trust** - developers ignore failures
2. **This test validates Phase 2 banner rules** - critical business logic
3. **Simple fix** - 2-minute change with no risk

---

## Verification

After applying fix, run:

```bash
cd backend && npm test -- --reporter=verbose
```

Expected: `Tests: 292 passed (292)`
