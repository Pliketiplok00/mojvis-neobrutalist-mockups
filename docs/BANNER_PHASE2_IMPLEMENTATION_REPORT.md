# Banner Phase 2 Implementation Report

**Date:** 2026-01-09
**Status:** Complete

## Summary of Changes

Phase 2 implements the FINAL banner rules for Inbox messages. Key changes:

1. **Tag Taxonomy Update**: Merged deprecated `cestovni_promet` and `pomorski_promet` into unified `promet` tag
2. **Banner Eligibility Rules**: Only `hitno` + exactly one context tag can be banners
3. **Time Window Enforcement**: Both `active_from` AND `active_to` are now REQUIRED for hitno messages
4. **Screen Context Consolidation**: Replaced `transport_road`/`transport_sea` with unified `transport`
5. **Added Events Screen Banners**: Events screen now displays `hitno + kultura` banners
6. **Banner Cap**: Max 3 banners per screen
7. **Banner Ordering**: `active_from DESC`, then `created_at DESC`

## Final Banner Rules

### Tag Requirements
- ONLY messages with `hitno` tag can be banners
- `hitno` MUST be paired with exactly one context tag
- `hitno` alone is INVALID
- Valid context tags: `promet`, `kultura`, `opcenito`, `vis`, `komiza`
- Tags must total exactly 2 (hitno + context)

### Time Window Requirements
- `active_from` AND `active_to` are BOTH REQUIRED for hitno messages
- Banner visible when: `active_from <= now <= active_to` (inclusive)
- Time comparisons use UTC

### Screen Placement Rules
| Context Tag | Screens |
|------------|---------|
| `hitno + kultura` | home, events |
| `hitno + promet` | home, transport |
| `hitno + opcenito` | home only |
| `hitno + vis` | home only (with municipality check) |
| `hitno + komiza` | home only (with municipality check) |

### Cap & Ordering
- Max 3 banners per screen
- Order: `active_from DESC`, then `created_at DESC`

## Tag Migration/Compatibility Strategy

**Approach:** Runtime normalization (no database mutation)

The `normalizeTags()` function converts deprecated tags at runtime:
- `cestovni_promet` → `promet`
- `pomorski_promet` → `promet`

Deprecated tags remain valid in the database for backward compatibility. The admin UI shows deprecated tags with "(zastarjelo)" suffix and excludes them from new message creation via `ACTIVE_INBOX_TAGS`.

## Files Changed + Rationale

### Backend

| File | Changes | Rationale |
|------|---------|-----------|
| `backend/src/types/inbox.ts` | Added `promet` tag, `DEPRECATED_TRANSPORT_TAGS`, `BANNER_CONTEXT_TAGS`, `normalizeTags()` | Tag taxonomy expansion and normalization |
| `backend/src/lib/eligibility.ts` | Complete rewrite with Phase 2 rules | New banner eligibility, placement, cap, ordering logic |
| `backend/src/routes/inbox.ts` | Updated screen context types, added `getUtcNow` import | API alignment with new screen contexts |
| `backend/src/__tests__/eligibility.test.ts` | Complete rewrite with 61 tests | Comprehensive coverage of Phase 2 rules |
| `backend/src/__tests__/inbox.test.ts` | Updated banner test to use valid Phase 2 tags | Test was using `['hitno']` which is now invalid |

### Admin

| File | Changes | Rationale |
|------|---------|-----------|
| `admin/src/types/inbox.ts` | Added `promet` tag, `ACTIVE_INBOX_TAGS`, deprecated labels | UI reflects new taxonomy, hides deprecated from new messages |

### Mobile

| File | Changes | Rationale |
|------|---------|-----------|
| `mobile/src/types/inbox.ts` | Added `promet` tag, updated `ScreenContext` type | Type alignment with backend |
| `mobile/src/services/api.ts` | Updated comment documenting new rules | API documentation |
| `mobile/src/screens/transport/TransportHubScreen.tsx` | Changed to unified `transport` context | Consolidated transport banner fetching |
| `mobile/src/screens/transport/RoadTransportScreen.tsx` | Changed to `transport` context | Screen context alignment |
| `mobile/src/screens/transport/SeaTransportScreen.tsx` | Changed to `transport` context | Screen context alignment |
| `mobile/src/screens/events/EventsScreen.tsx` | Added banner fetching with `events` context | New feature: events screen banners |

### Pre-existing Changes (unrelated to Phase 2)
| File | Notes |
|------|-------|
| `mobile/App.tsx` | Pre-existing SKIN_TEST_MODE changes |
| `mobile/src/components/MenuOverlay.tsx` | Pre-existing menu changes |
| `mobile/src/screens/home/HomeScreen.tsx` | Pre-existing changes |
| `mobile/src/screens/inbox/InboxListScreen.tsx` | Pre-existing changes |
| `mobile/src/screens/pages/StaticPageScreen.tsx` | Pre-existing changes |

## Tests Added/Updated

### New Test File: `eligibility.test.ts` (61 tests)

```
describe('Tag Normalization') - 6 tests
  - normalizes cestovni_promet to promet
  - normalizes pomorski_promet to promet
  - normalizes both transport tags to single promet
  - preserves non-transport tags
  - handles promet directly
  - handles empty tags

describe('isValidBannerTagCombination') - 7 tests
  - valid: hitno + promet
  - valid: hitno + kultura
  - valid: hitno + opcenito
  - valid: hitno + vis
  - valid: hitno + komiza
  - invalid: hitno alone
  - invalid: more than 2 tags
  - invalid: no hitno
  - invalid: hitno + non-context tag

describe('isMessageEligible') - 5 tests
  - municipal message visibility for visitors
  - municipal message visibility for matching locals
  - municipal message visibility for non-matching locals
  - general message visibility

describe('isWithinActiveWindow') - 6 tests
  - both boundaries set, currently within
  - both boundaries set, before window
  - both boundaries set, after window
  - missing active_from (invalid)
  - missing active_to (invalid)
  - both missing (invalid)

describe('isBannerEligible') - 8 tests
  - valid banner (hitno + context + active window)
  - invalid: hitno alone
  - invalid: outside active window
  - invalid: missing active_to
  - visitor + municipal banner
  - local + matching municipal banner
  - local + non-matching municipal banner

describe('isBannerForScreen') - 9 tests
  - home shows all context types
  - events shows only kultura
  - transport shows only promet
  - deprecated tags normalized correctly

describe('filterBannersByScreen') - 3 tests
  - caps at 3 banners
  - filters by screen context
  - returns empty for wrong context

describe('getBannersForScreen') - 5 tests
  - full pipeline: eligible, sorted, capped
  - ordering by active_from DESC

describe('Backward Compatibility') - 4 tests
  - cestovni_promet messages work as promet
  - pomorski_promet messages work as promet
  - mixed deprecated tags consolidated
```

### Updated Test: `inbox.test.ts`
- Fixed `should return active banners only` test to use valid Phase 2 tags (`['hitno', 'opcenito']`)

### Commands Run
```bash
npm run typecheck   # Backend TypeScript check - PASS
npm test -- --run   # 259 tests - ALL PASS
```

## Manual Verification Checklist

| Check | Status |
|-------|--------|
| Backend TypeScript compiles | PASS |
| All 259 backend tests pass | PASS |
| Tag normalization handles deprecated tags | PASS |
| `hitno` alone is rejected as banner | PASS |
| `hitno + context` is valid banner | PASS |
| Both `active_from` and `active_to` required | PASS |
| Home screen shows all banner types | PASS |
| Events screen shows only kultura banners | PASS |
| Transport screen shows only promet banners | PASS |
| Banner cap of 3 enforced | PASS |
| Banners ordered by active_from DESC | PASS |
| Municipal filtering still works | PASS |

## git diff --name-only Output

```
admin/src/types/inbox.ts
backend/src/__tests__/eligibility.test.ts
backend/src/__tests__/inbox.test.ts
backend/src/lib/eligibility.ts
backend/src/routes/inbox.ts
backend/src/types/inbox.ts
mobile/App.tsx
mobile/src/components/MenuOverlay.tsx
mobile/src/screens/events/EventsScreen.tsx
mobile/src/screens/home/HomeScreen.tsx
mobile/src/screens/inbox/InboxListScreen.tsx
mobile/src/screens/pages/StaticPageScreen.tsx
mobile/src/screens/transport/RoadTransportScreen.tsx
mobile/src/screens/transport/SeaTransportScreen.tsx
mobile/src/screens/transport/TransportHubScreen.tsx
mobile/src/services/api.ts
mobile/src/types/inbox.ts
```

## Key Design Decisions

1. **Runtime normalization over DB migration**: Deprecated tags are normalized at runtime rather than migrating existing database records. This preserves data integrity and allows rollback if needed.

2. **Server as single source of truth**: All banner eligibility logic lives on the server. Mobile clients simply request banners for a screen context and receive pre-filtered, pre-sorted, pre-capped results.

3. **Unified transport context**: Rather than maintaining separate `transport_road` and `transport_sea` contexts, a single `transport` context simplifies the API and ensures consistent banner behavior across transport screens.

4. **Strict tag validation**: The requirement for exactly 2 tags (hitno + context) prevents ambiguous or invalid banner states.

5. **UTC time handling**: All time comparisons use UTC to ensure consistent behavior regardless of server or client timezone.
