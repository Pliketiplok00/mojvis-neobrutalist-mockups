# Disjoint Seasons Fix 2026 - Audit Report

## Status: PENDING DEPLOYMENT

The code fix is complete and pushed, but SSH access to Hetzner is currently unavailable. Manual deployment required.

---

## Executive Summary

**Issue**: Transport departures for October-December 2026 returned 0 results for lines 602 and 9602.

**Root Cause**: Import script uses `LIMIT 1` when linking departures to seasons, combined with API query filtering by season date ranges. For disjoint seasons (OFF: Jan-May AND Sep-Dec), departures were only linked to the first period.

**Fix Applied**: Modified API query to use EXISTS subquery that checks if ANY season of the same type AND same line covers the requested date.

---

## Timeline

| Step | Status | Notes |
|------|--------|-------|
| BEFORE evidence gathered | DONE | API returns 0 for Oct/Dec dates |
| Root cause confirmed | DONE | LIMIT 1 + date filter combination |
| Initial fix deployed | DONE | EXISTS subquery for disjoint seasons |
| Duplicate issue found | DONE | Returns 4 instead of 2 departures |
| Line restriction fix | DONE | Added SPLIT_PART to match line ID |
| Final deployment | PENDING | SSH port 22 timeout - manual deploy needed |

---

## Technical Details

### Issue 1: Missing Departures (FIXED)

**File**: `backend/src/repositories/transport.ts`

**Original query**:
```sql
FROM transport_departures d
JOIN transport_seasons s ON d.season_id = s.id
WHERE d.route_id = $1
  AND d.day_type = $2
  AND $date BETWEEN s.date_from AND s.date_to
```

**Problem**: Departures linked to OFF season Jan-May (via LIMIT 1 in import) failed the date check for October-December dates.

### Issue 2: Duplicate Departures (FIXED)

After fixing Issue 1, the API returned 4 departures instead of 2 for October 15.

**Root Cause**: Different lines have different season definitions:
- Line 9602 PRE: May 29 - Jul 2
- Line 612 PRE: Sep 28 - Oct 31

The EXISTS subquery matched ANY season of the same type from ANY line, so line 602's PRE departures (linked to 9602's PRE) incorrectly matched line 612's PRE season for October dates.

**Fix**: Added line restriction to EXISTS:
```sql
AND SPLIT_PART(any_season.id::TEXT, '-', 2) = SPLIT_PART(linked.id::TEXT, '-', 2)
```

This extracts the line number from the deterministic season UUID (e.g., `season-9602-2026-off-a` → `9602`) and ensures seasons are matched only within the same line.

---

## Full Fix Applied (transport.ts)

Both `getDeparturesForRouteAndDate` and `getTodaysDepartures` now use:

```sql
AND EXISTS (
  SELECT 1 FROM transport_seasons any_season
  WHERE any_season.season_type = linked.season_type
    AND any_season.year = linked.year
    AND $date BETWEEN any_season.date_from AND any_season.date_to
    -- Only match seasons from the same line (by ID prefix)
    AND SPLIT_PART(any_season.id::TEXT, '-', 2) = SPLIT_PART(linked.id::TEXT, '-', 2)
)
```

---

## Commits

1. `ec28421` - Initial EXISTS subquery fix (deployed)
2. `b23cef5` - Line restriction fix (pending deployment)

**Branch**: `fix/transport-disjoint-seasons-2026`

---

## Manual Deployment Required

SSH port 22 is currently timing out. To deploy the fix:

```bash
ssh root@65.109.156.73

# Once connected:
cd /root/mojvis-neobrutalist-mockups
git pull origin fix/transport-disjoint-seasons-2026
cd backend
docker build -t mojvis-backend .
docker stop mojvis-backend
docker rm mojvis-backend
docker run -d --name mojvis-backend \
  --network mojvis-net \
  -p 3001:3001 \
  -e DATABASE_URL='postgresql://mojvis:mojvis@mojvis-postgres:5432/mojvis_staging' \
  mojvis-backend
```

---

## Verification Checklist

After deployment, run these checks:

### Line 602 (Trajekt)

```bash
BASE=https://api.mojvis-test.pliketiplok.com
LINE=ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8

# October 15 (THU) - should return 2 departures, not 4
curl -s "$BASE/transport/sea/lines/$LINE/departures?date=2026-10-15&direction=0" | jq '.departures | length'
# Expected: 2

# December 15 (TUE) - should return 2 departures
curl -s "$BASE/transport/sea/lines/$LINE/departures?date=2026-12-15&direction=0" | jq '.departures | length'
# Expected: 2

# June 15 (MON) - should return 2 departures (PRE season)
curl -s "$BASE/transport/sea/lines/$LINE/departures?date=2026-06-15&direction=0" | jq '.departures | length'
# Expected: 2
```

### Line 9602 (Katamaran)

```bash
LINE=e8fb699d-6ddc-5562-be14-57b6a29494f1

# October 15 (THU) - should return 1 departure
curl -s "$BASE/transport/sea/lines/$LINE/departures?date=2026-10-15&direction=0" | jq '.departures | length'
# Expected: 1
```

---

## Current API State (Pre-Deployment)

| Date | Line | Direction | Expected | Actual | Status |
|------|------|-----------|----------|--------|--------|
| 2026-05-15 | 602 | 0 | 2 | 2 | PASS |
| 2026-06-15 | 602 | 0 | 2 | 0 | FAIL (needs deploy) |
| 2026-10-15 | 602 | 0 | 2 | 4 | FAIL (duplicates) |
| 2026-12-15 | 602 | 0 | 2 | 4 | FAIL (duplicates) |

---

## Related Documents

- [QUERY_ROOT_CAUSE_REPORT_2026.md](./QUERY_ROOT_CAUSE_REPORT_2026.md) - Initial analysis
- [DATE_PARITY_CHECKLIST_2026.md](./DATE_PARITY_CHECKLIST_2026.md) - Verification checklist
- [MONTHLY_SCHEDULE_SNAPSHOT_2026.md](./MONTHLY_SCHEDULE_SNAPSHOT_2026.md) - Full schedule data

---

## Files Modified

| File | Lines Changed | Purpose |
|------|---------------|---------|
| `backend/src/repositories/transport.ts` | 346-353, 449-456 | EXISTS subquery with line restriction |

---

## Date

2026-02-10

## Author

Automated fix applied by Claude Code assistant.
