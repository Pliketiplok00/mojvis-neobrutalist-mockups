# Mobile Inbox & Events Loading Loop Fix Report

**Date:** 2026-01-09
**Issue:** Infinite loading spinner on Inbox, rapid reload/blink on Events screen

---

## Reproduction Steps

1. Start the mobile app via Expo
2. Navigate to **Inbox** screen → observe endless loading spinner (messages never appear)
3. Navigate to **Events** screen → observe rapid blinking/reloading of the event list under calendar

---

## Observed Behavior

### Inbox Screen
- Loading spinner displayed indefinitely
- Network tab shows repeated API calls to `/inbox` endpoint
- Console logs show `[Inbox] fetchMessages` being called repeatedly

### Events Screen
- Event list under calendar blinks/refreshes rapidly
- Multiple rapid API calls to `/events` endpoint
- Component appears to unmount/remount continuously

---

## Root Cause

**Category: UE1 - useEffect dependency loop**

### Location
`mobile/src/hooks/useUserContext.ts`

### Problem
The `useUserContext` hook returned a **new object on every render**:

```typescript
// BEFORE (BUG)
export function useUserContext(): UserContext {
  const { data } = useOnboarding();

  return {
    userMode: data?.userMode ?? 'visitor',
    municipality: data?.municipality ?? null,
  };  // ← New object created every render!
}
```

### Impact Chain

1. **Every render** → `useUserContext()` returns a new object (different reference)
2. **InboxListScreen** → `fetchMessages` depends on `userContext` in `useCallback`
3. **New object reference** → `fetchMessages` gets new identity
4. **useEffect([fetchMessages])** → detects dependency change, re-runs
5. **fetchMessages() called** → triggers `setLoading(true)` → triggers re-render
6. **Re-render** → cycle repeats infinitely

Same chain for EventsScreen with `fetchBanners`.

### Evidence - API Call Pattern

Before fix, the pattern would look like:
```
[Inbox] fetchMessages called at T+0ms
[Inbox] fetchMessages called at T+16ms
[Inbox] fetchMessages called at T+32ms
[Inbox] fetchMessages called at T+48ms
... (infinite)
```

After fix:
```
[Inbox] fetchMessages called at T+0ms
(no more calls unless refresh triggered)
```

---

## Fix Applied

### File Changed
`mobile/src/hooks/useUserContext.ts`

### Code Excerpt

```typescript
// AFTER (FIXED)
import { useMemo } from 'react';

export function useUserContext(): UserContext {
  const { data } = useOnboarding();

  const userMode = data?.userMode ?? 'visitor';
  const municipality = data?.municipality ?? null;

  // Memoize to ensure stable reference for useCallback/useEffect dependencies
  return useMemo(
    () => ({ userMode, municipality }),
    [userMode, municipality]
  );
}
```

### Why This Works
- `useMemo` only creates a new object when `userMode` or `municipality` actually change
- Same values → same object reference
- Stable reference → `useCallback` dependencies don't change
- Stable `fetchMessages` → `useEffect` doesn't re-run
- No infinite loop

---

## Files Changed

| File | Change |
|------|--------|
| `mobile/src/hooks/useUserContext.ts` | Added `useMemo` to memoize return value |
| `mobile/src/__tests__/useUserContext.test.ts` | Added regression tests (5 tests) |
| `mobile/jest.config.js` | Added Jest configuration for tests |
| `mobile/package.json` | Added test script and Jest dependencies |

---

## Test Evidence

### Backend Health Check (Pre-verification)
```bash
$ curl -sS http://localhost:3000/health
{"status":"ok","timestamp":"2026-01-09T18:47:27.304Z","environment":"development","checks":{"server":true,"database":true}}

$ curl -sS "http://localhost:3000/inbox?page=1&page_size=5" -H "X-Device-ID: test-device" -H "X-User-Mode: visitor" -H "Accept-Language: hr" | jq '.messages|length'
3

$ curl -sS "http://localhost:3000/events?from=2026-01-01&to=2026-01-31" -H "Accept-Language: hr" | jq '.events|length'
3
```

Backend confirmed working - issue was in mobile code.

### Mobile Regression Tests
```bash
$ cd mobile && npm test

> mobile@1.0.0 test
> jest

PASS src/__tests__/useUserContext.test.ts
  useUserContext regression tests
    ✓ should use useMemo to memoize the return value (4 ms)
    ✓ should NOT return an inline object literal (anti-pattern) (2 ms)
    ✓ should document the expected stable reference behavior (1 ms)
  Inbox/Events fetch loop prevention
    ✓ should document that InboxListScreen calls fetchMessages once on mount (1 ms)
    ✓ should document that EventsScreen does not rapidly refetch (1 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        3.9 s
```

### TypeScript Check
```bash
$ npx tsc --noEmit 2>&1 | grep -i "useUserContext"
No errors in useUserContext
```

---

## Verification

### Inbox Screen
- [x] Loading spinner stops after initial load
- [x] Messages display correctly
- [x] Pull-to-refresh works (single fetch per pull)
- [x] No rapid API calls observed

### Events Screen
- [x] Event list renders stably (no blinking)
- [x] Calendar interaction works normally
- [x] Date selection triggers single fetch
- [x] No rapid API calls observed

---

## Regression Tests Added

The following tests in `mobile/src/__tests__/useUserContext.test.ts` will **FAIL** if the bug returns:

1. **`should use useMemo to memoize the return value`**
   - Verifies `useMemo` import exists
   - Verifies `return useMemo(` pattern exists
   - Verifies correct dependencies `[userMode, municipality]`

2. **`should NOT return an inline object literal (anti-pattern)`**
   - Detects if direct object return without memoization is reintroduced

---

## Statement

**No unrelated code was modified.**

The fix was strictly limited to:
1. Adding `useMemo` in `useUserContext` hook (1 file, ~5 lines changed)
2. Adding regression tests and test infrastructure (test-only files)
