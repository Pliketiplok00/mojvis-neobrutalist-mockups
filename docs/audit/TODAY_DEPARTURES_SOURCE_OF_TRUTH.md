# Today Departures Source of Truth Audit

**Date**: 2026-02-14
**Issue**: "Danasnji polasci s otoka Visa" includes Porat (Bisevo), which must NEVER happen.

---

## 1. Mobile Screen / Component

**Section: "Danasnji polasci s otoka Visa"**

| Property | Value |
|----------|-------|
| File | `mobile/src/screens/transport/SeaTransportScreen.tsx` |
| Component | `SeaTransportScreen` |
| Render location | Lines 300-345 (Section B: Today's Departures) |
| Translation key | `transport.todaysDepartures` |
| HR text | "Danasnji polasci s otoka Visa" |

**Render tree:**
```
SeaTransportScreen
  └── ScrollView
        └── View (styles.section) [line 299]
              └── Label: t('transport.todaysDepartures') [line 300]
              └── {todaysDepartures.map(...)} [line 302+]
```

**Also applies to:**
- `mobile/src/screens/transport/RoadTransportScreen.tsx` (lines 261-298)

---

## 2. Data Source

### API Endpoint

| Property | Value |
|----------|-------|
| Mobile API call | `transportApi.getTodaysDepartures('sea')` |
| File | `mobile/src/services/api.ts:462` |
| HTTP endpoint | `GET /transport/sea/today` |

### Backend Route

| Property | Value |
|----------|-------|
| File | `backend/src/routes/transport.ts:355` |
| Handler | Calls `getTodaysDepartures(transportType, dateStr)` |

### Backend Repository Method

| Property | Value |
|----------|-------|
| File | `backend/src/repositories/transport.ts` |
| Function | `getTodaysDepartures()` (line 437) |
| SQL query | Lines 479-523 |

### Client-side Filtering

**None.** The mobile app displays whatever the API returns without additional filtering.

---

## 3. Bisevo Exclusion Logic

### Current Exclusion List

**File**: `backend/src/repositories/transport.ts`
**Line**: 426

```typescript
const MAINLAND_STOP_NAMES = ['Split'];
```

### SQL Filter

**Line 520:**
```sql
AND origin.name_hr NOT IN (${MAINLAND_STOP_NAMES.map((_, i) => `$${i + 4}`).join(', ')})
```

This expands to:
```sql
AND origin.name_hr NOT IN ('Split')
```

### Is "Porat (Bisevo)" Excluded?

**NO.** The exclusion list contains only `'Split'`.

The following Bisevo-related stops are NOT excluded:
- `Porat (Bisevo)` - NOT in exclusion list
- `Mezuporat` - NOT in exclusion list
- `Salbunara` - NOT in exclusion list

---

## 4. Method Verification

### Does the UI use the same query path?

**YES.** The flow is:

```
SeaTransportScreen.tsx
  → transportApi.getTodaysDepartures('sea')
    → GET /transport/sea/today
      → routes/transport.ts handler
        → getTodaysDepartures('sea', dateStr)
          → repositories/transport.ts:437
            → SQL query with MAINLAND_STOP_NAMES filter
```

The exclusion logic at line 520 is the ONLY filter for origin stops.

---

## 5. Test Coverage

### Existing Tests

**File**: `backend/src/__tests__/transport-today-direction.test.ts`

| Test | Line | Assertion | Status |
|------|------|-----------|--------|
| "should ACCEPT Porat (Bisevo) origin" | 79-80 | `isIslandOrigin('Porat (Bisevo)')` returns `true` | **WRONG** |

The test explicitly asserts that "Porat (Bisevo)" IS a valid island origin. This contradicts the business requirement.

### Missing Test (NOW ADDED)

Added failing test at line 93:
```typescript
it('should REJECT Porat (Biševo) origin - Biševo is not Vis island', () => {
  expect(isIslandOrigin('Porat (Biševo)')).toBe(false);
});
```

**Test result**: FAILS (as expected - documents required behavior)

---

## 6. Root Cause

The design assumes "exclude mainland = include islands" but Bisevo is a SEPARATE island from Vis. The current logic:

- Excludes: Split (mainland)
- Includes: Everything else

Should be:

- Excludes: Split (mainland), Porat (Bisevo), Mezuporat, Salbunara (Bisevo stops)
- Includes: Vis, Komiza (Vis island stops only)

---

## 7. Recommended Fix (NOT implemented yet)

**Option A**: Add Bisevo stops to exclusion list
```typescript
const EXCLUDED_ORIGINS = ['Split', 'Porat (Bisevo)', 'Mezuporat', 'Salbunara'];
```

**Option B**: Use allowlist instead of denylist
```typescript
const VIS_ISLAND_ORIGINS = ['Vis', 'Komiza'];
// SQL: AND origin.name_hr IN (...)
```

---

## 8. Action Required

1. Add ONE failing test that asserts "Porat (Bisevo)" must be excluded
2. Fix the exclusion logic (separate PR)
3. Update existing test that incorrectly accepts Bisevo
