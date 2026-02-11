# Holiday Schedule Fix 2026

**Created**: 2026-02-11
**Branch**: `fix/holiday-schedule-bugs-2026`
**Status**: Implementation Complete (Pending Test)

---

## Problem Summary

Parity checking revealed 3 bugs in holiday schedule handling:

| Bug | Line | Description | Impact |
|-----|------|-------------|--------|
| 1 | 612 | 0 departures on ALL holidays | Should only be 0 on Uskrs (05.04) and Bozic (25.12) |
| 2 | 9602 | 0 departures on Aug 5 & Aug 15 | HIGH season holidays have no PRAZNIK entries |
| 3 | 602 | 4 departures instead of 3 on summer holidays (dir1) | Ghost 11:00 from OFF season appearing in HIGH |

---

## Root Cause Analysis

### Core Issue
`getDayType()` in `holidays.ts` returns `PRAZNIK` for ALL holidays. If a line has no PRAZNIK entries for the current season, query returns 0 results.

### Per-Line Issues

**Line 612**: No PRAZNIK entries at all. Needs:
- NO_SERVICE EXCEPTION for Uskrs and Bozic (actual no-service days)
- Fallback mechanism for other holidays

**Line 9602**: Missing HIGH season PRAZNIK entries. Has PRAZNIK for OFF, PRE, POST but not HIGH.

**Line 602**: 11:00 OFF PRAZNIK entries have year-wide date ranges (`2026-01-01` to `2026-12-24`) which incorrectly include HIGH season.

---

## Fix Plan

### Fix 1: line-612.json - NO_SERVICE entries (IMPLEMENTED)

Added PRAZNIK entries with `marker: "NO_SERVICE"` for dates when line 612 has no service:

```json
// Direction 0 (Komiza -> Bisevo)
{ "day_type": "PRAZNIK", "season_type": "PRE", "departure_time": "00:00", "date_from": "2026-04-05", "date_to": "2026-04-05", "stop_times": [null, null, null, null], "marker": "NO_SERVICE" }
{ "day_type": "PRAZNIK", "season_type": "OFF", "departure_time": "00:00", "date_from": "2026-12-25", "date_to": "2026-12-25", "stop_times": [null, null, null, null], "marker": "NO_SERVICE" }

// Direction 1 (Bisevo -> Komiza) - same entries
```

### Fix 2: line-9602.json - HIGH PRAZNIK entries (IMPLEMENTED)

Added HIGH season PRAZNIK entries with direct route (no intermediate stops):

```json
// Direction 0 (Vis -> Split)
{ "day_type": "PRAZNIK", "season_type": "HIGH", "departure_time": "07:00", "stop_times": ["07:00", null, null, "08:10"], "marker": null }

// Direction 1 (Split -> Vis)
{ "day_type": "PRAZNIK", "season_type": "HIGH", "departure_time": "18:00", "stop_times": ["18:00", null, null, "19:10"], "marker": null }
```

### Fix 3: line-602.json - Split 11:00 entries (IMPLEMENTED)

Replaced year-wide 11:00 entries with period-specific:

**BEFORE** (problematic):
```json
{"day_type": "PRAZNIK", "season_type": "OFF", "departure_time": "11:00", "date_from": "2026-01-01", "date_to": "2026-12-24"}
{"day_type": "PRAZNIK", "season_type": "OFF", "departure_time": "11:00", "date_from": "2026-12-26", "date_to": "2026-12-31"}
```

**AFTER** (correct):
```json
{"day_type": "PRAZNIK", "season_type": "OFF", "departure_time": "11:00", "date_from": "2026-01-01", "date_to": "2026-05-28"}
{"day_type": "PRAZNIK", "season_type": "OFF", "departure_time": "11:00", "date_from": "2026-09-28", "date_to": "2026-12-24"}
{"day_type": "PRAZNIK", "season_type": "OFF", "departure_time": "11:00", "date_from": "2026-12-26", "date_to": "2026-12-31"}
```

### Fix 4: transport.ts - Fallback mechanism (IMPLEMENTED)

Added `getActualWeekday()` to holidays.ts and refactored `getDeparturesForRouteAndDate()`:

```typescript
// New helper function in holidays.ts
export function getActualWeekday(date: Date): DayType {
  return jsDayToDayType(date.getDay());
}

// Fallback logic in getDeparturesForRouteAndDate()
if (isHoliday) {
  const praznikDepartures = await queryDeparturesForDayType(routeId, 'PRAZNIK', dateStr);

  // Check for NO_SERVICE marker
  if (praznikDepartures.some(dep => dep.marker === 'NO_SERVICE')) {
    return { departures: [], dayType, isHoliday };
  }

  // Use PRAZNIK if exists, otherwise fallback to weekday
  if (praznikDepartures.length > 0) {
    departures = praznikDepartures;
  } else {
    const actualWeekday = getActualWeekday(date);
    departures = await queryDeparturesForDayType(routeId, actualWeekday, dateStr);
  }
}
```

---

## Regression Test Plan

### Test Suite A: Line 612

| Date | Holiday | Day | Expected | Reason |
|------|---------|-----|----------|--------|
| 2026-04-05 | Uskrs | SUN | 0 departures | NO_SERVICE EXCEPTION |
| 2026-12-25 | Bozic | FRI | 0 departures | NO_SERVICE EXCEPTION |
| 2026-01-01 | Nova godina | THU | 0 departures | fallback THU, no THU schedule |
| 2026-01-06 | Bogojavljenje | TUE | dir0 08:00 / dir1 13:00 | fallback TUE |
| 2026-06-22 | Dan antifasisticke borbe | MON | dir0 08:00 / dir1 16:00 | fallback MON |
| 2026-12-24 | Badnjak | THU | dir0: 08:00,14:30 / dir1: 09:30,16:00 | EXCEPTION |
| 2026-12-31 | Silvestrovo | THU | dir0: 09:00 / dir1: 14:00 | EXCEPTION |

### Test Suite B: Line 9602

#### B1. Bugfixes (NEW HIGH PRAZNIK)

| Date | Holiday | Season | Expected dir0/dir1 |
|------|---------|--------|---------------------|
| 2026-08-05 | Dan pobjede | HIGH | 07:00 / 18:00 |
| 2026-08-15 | Velika Gospa | HIGH | 07:00 / 18:00 |

#### B2. Already Working

| Date | Holiday | Season | Expected dir0/dir1 |
|------|---------|--------|---------------------|
| 2026-01-01 | Nova godina | OFF | 18:00 / 20:30 |
| 2026-05-01 | Praznik rada | OFF | 18:00 / 19:30 |
| 2026-06-22 | Dan antifasisticke borbe | PRE | 19:00 / 20:30 |
| 2026-06-25 | Dan drzavnosti | PRE | 19:00 / 20:30 |

### Test Suite C: Line 602

| Date | Holiday | Season | Expected dir1 | Check |
|------|---------|--------|---------------|-------|
| 2026-01-01 | Nova godina | OFF | 11:00, 19:00 (2) | 11:00 OK |
| 2026-06-22 | Dan antifasisticke borbe | PRE | 09:00, 15:00, 21:00 (3) | NO 11:00 |
| 2026-08-05 | Dan pobjede | HIGH | 09:00, 15:00, 21:00 (3) | NO 11:00 |
| 2026-12-25 | Bozic | OFF | 19:00 (1) | Single departure |

### Test Suite D: Line 659

| Date | Holiday | Expected |
|------|---------|----------|
| 2026-06-22 | Dan antifasisticke borbe | dir0: 07:30,15:30 / dir1: 10:10,19:35 |
| 2026-01-01 | Nova godina | 0 departures |

---

## Files Modified

| File | Change |
|------|--------|
| `backend/src/data/lines/line-612.json` | Add 4 NO_SERVICE PRAZNIK entries (2 per direction) |
| `backend/src/data/lines/line-9602.json` | Add 2 HIGH PRAZNIK entries (1 per direction) |
| `backend/src/data/lines/line-602.json` | Split 2 year-wide 11:00 entries into 3 period-specific |
| `backend/src/lib/holidays.ts` | Add `getActualWeekday()` export |
| `backend/src/repositories/transport.ts` | Add `queryDeparturesForDayType()` helper, refactor `getDeparturesForRouteAndDate()` with fallback logic |

---

## Changelog

- 2026-02-11: Initial documentation created
- 2026-02-11: Implementation complete - all JSON and TS files updated, TypeScript compiles successfully
