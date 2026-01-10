# Flaky Test Fix Report

**Date**: 2026-01-09
**Status**: FIXED

---

## What Was Flaky

**Test**: `filterBannerEligibleMessages (Phase 2) > should only return messages with valid hitno + context tag`

**File**: `backend/src/__tests__/eligibility.test.ts:475-492`

**Symptom**: Test intermittently failed with:
```
AssertionError: expected [ '4', '1' ] to deeply equal [ '1', '4' ]
```

---

## Why It Was Flaky

The test created two messages that both had:
- Same `active_from` value (yesterday)
- No explicit `created_at` value

The `createMessage` helper defaults `created_at: new Date()` for each call. When messages are created in rapid succession (microseconds apart), their `created_at` timestamps are nearly identical.

The sort function uses `active_from DESC, created_at DESC`. With identical/near-identical values, the result order became non-deterministic.

---

## Exact Change Made

**File**: `backend/src/__tests__/eligibility.test.ts`

**Before**:
```typescript
it('should only return messages with valid hitno + context tag', () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const messages = [
    createMessage({ id: '1', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow }),
    createMessage({ id: '2', tags: ['opcenito'], active_from: yesterday, active_to: tomorrow }), // No hitno
    createMessage({ id: '3', tags: ['hitno'], active_from: yesterday, active_to: tomorrow }), // No context
    createMessage({ id: '4', tags: ['hitno', 'kultura'], active_from: yesterday, active_to: tomorrow }),
  ];

  const result = filterBannerEligibleMessages(messages, createContext(), now);
  expect(result.map(m => m.id)).toEqual(['1', '4']);
});
```

**After**:
```typescript
it('should only return messages with valid hitno + context tag', () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  // Explicit created_at to ensure deterministic sort order (active_from DESC, created_at DESC)
  const createdNewer = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
  const createdOlder = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

  const messages = [
    createMessage({ id: '1', tags: ['hitno', 'promet'], active_from: yesterday, active_to: tomorrow, created_at: createdNewer }),
    createMessage({ id: '2', tags: ['opcenito'], active_from: yesterday, active_to: tomorrow }), // No hitno
    createMessage({ id: '3', tags: ['hitno'], active_from: yesterday, active_to: tomorrow }), // No context
    createMessage({ id: '4', tags: ['hitno', 'kultura'], active_from: yesterday, active_to: tomorrow, created_at: createdOlder }),
  ];

  // Order: active_from DESC (same), then created_at DESC → '1' (newer) before '4' (older)
  const result = filterBannerEligibleMessages(messages, createContext(), now);
  expect(result.map(m => m.id)).toEqual(['1', '4']);
});
```

**Key Changes**:
1. Added explicit `created_at` timestamps with 1 hour difference
2. Message '1' has `createdNewer` (1 hour ago)
3. Message '4' has `createdOlder` (2 hours ago)
4. Sort rule `created_at DESC` now deterministically places '1' before '4'
5. Added comments explaining the sort order logic

---

## Verification: 3 Consecutive Test Runs

```bash
cd backend && npm test
```

### Run 1
```
Test Files  12 passed (12)
     Tests  292 passed (292)
  Duration  1.55s
```

### Run 2
```
Test Files  12 passed (12)
     Tests  292 passed (292)
  Duration  1.79s
```

### Run 3
```
Test Files  12 passed (12)
     Tests  292 passed (292)
  Duration  1.82s
```

**All 3 runs passed consistently.**

---

## git diff --name-only

```
backend/src/__tests__/eligibility.test.ts
docs/FLAKY_TEST_FIX_REPORT.md
```

---

## Conclusion

The flaky test is now deterministic. The fix:
- Does NOT change production logic in `eligibility.ts`
- Only updates test data to have explicit timestamps
- Ensures the expected order matches the documented sort rule
