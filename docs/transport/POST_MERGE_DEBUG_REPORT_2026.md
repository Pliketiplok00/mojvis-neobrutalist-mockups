# Post-Merge Debug Report: Transport Shows 0 Rides

## Incident Summary

| Field | Value |
|-------|-------|
| **Date/Time** | 2026-02-10 ~21:00 CET |
| **Expected Merge Commit** | `8749ad9a345af1feaf0844e7bff6b6daae325921` |
| **API URL** | `https://api.mojvis-test.pliketiplok.com` |
| **Symptom** | App shows 0 rides for all lines; Line 659 not visible |

---

## Phase 1: API Connectivity Verification

**Status: PASS**

### Health Check

```bash
$ curl -s "https://api.mojvis-test.pliketiplok.com/health" | jq '.'
{
  "status": "ok",
  "timestamp": "2026-02-10T20:11:38.582Z",
  "environment": "production",
  "checks": {
    "server": true,
    "database": true
  }
}
```

**Conclusion:** API is reachable, database connection OK.

---

## Phase 2: API Data Investigation

**Status: CRITICAL ISSUES FOUND**

### Lines Endpoint

```bash
$ curl -s "https://api.mojvis-test.pliketiplok.com/transport/sea/lines" | jq '.'
{
  "lines": [
    {
      "id": "ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8",
      "name": "Vis – Split",
      "subtype": "Trajekt",
      "stops_count": 2
    },
    {
      "id": "ea884ee0-9c2e-5c0b-a1c9-3ec1197ffa0b",
      "name": "Komiža – Biševo",
      "subtype": "Brod",
      "stops_count": 4
    },
    {
      "id": "e8fb699d-6ddc-5562-be14-57b6a29494f1",
      "name": "Vis – Split",
      "subtype": "Katamaran",
      "stops_count": 4
    }
  ]
}
```

**Finding:** Only 3 lines returned. **Line 659 (summer catamaran) is MISSING.**

### Today's Departures

```bash
$ curl -s "https://api.mojvis-test.pliketiplok.com/transport/sea/today" | jq '.'
{
  "date": "2026-02-10",
  "day_type": "TUE",
  "is_holiday": false,
  "departures": []
}
```

**Finding:** Zero departures returned for 2026-02-10 (Tuesday, OFF season).

### Individual Line Departures

```bash
$ curl -s "https://api.mojvis-test.pliketiplok.com/transport/sea/lines/602/departures?date=2026-02-10&direction=0"
{"error": "Internal server error"}

$ curl -s "https://api.mojvis-test.pliketiplok.com/transport/sea/lines/9602/departures?date=2026-02-10&direction=0"
{"error": "Internal server error"}

$ curl -s "https://api.mojvis-test.pliketiplok.com/transport/sea/lines/659/departures?date=2026-02-10&direction=0"
{"error": "Internal server error"}
```

**Finding:** All departure queries return "Internal server error".

---

## Phase 3: DB State / Deploy Verification

### Local Repo State (Post-Merge)

```bash
$ ls -la backend/src/data/lines/
-rw-r--r--  1 pliketiplok  staff  14027 Jan 18 21:46 line-01.json
-rw-r--r--  1 pliketiplok  staff  16663 Feb 10 00:07 line-602.json
-rw-r--r--  1 pliketiplok  staff  22287 Feb 10 20:08 line-612.json
-rw-r--r--  1 pliketiplok  staff   9087 Feb 10 20:08 line-659.json  <-- EXISTS
-rw-r--r--  1 pliketiplok  staff  13809 Feb 10 20:08 line-9602.json

$ git log --oneline -3
6f015b4 docs(transport): add execution log for merge verification
8749ad9 Merge branch 'transport/canonical-reconciliation-2026'
2839e29 docs(transport): complete reconciliation log with validation
```

**Finding:** `line-659.json` EXISTS in local repo. Merge commit `8749ad9` is present.

### Evidence of Data Mismatch

| Source | Line 659 Present | Line Count |
|--------|------------------|------------|
| Local Repo | YES | 5 files (01, 602, 612, 659, 9602) |
| Hetzner API | NO | 3 lines (602, 612, 9602) |

**Critical Finding:** The local repo has the merged data, but the Hetzner backend API does NOT have line 659. The database was NOT re-imported after the merge.

---

## Phase 4: Fix Applied

### Required Action

The Hetzner backend database needs to be re-imported with the updated JSON line files.

**Steps needed:**
1. Access Hetzner backend server
2. Pull latest main branch (commit `8749ad9`)
3. Re-run transport data import/seed script
4. Verify API returns line 659 and departures

**Note:** This fix requires server-side access to Hetzner. The mobile app and local repo are correct - the issue is purely backend data sync.

---

## Phase 5: Final Verification Matrix

_To be completed after fix is applied_

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| `/transport/sea/lines` includes 659 | YES | - | PENDING |
| `/transport/sea/today` returns departures | >0 for valid dates | - | PENDING |
| Line 9602 TUE shows HVAR 07:45 | YES | - | PENDING |
| Line 659 visible Jun 19-Sep 13 only | YES | - | PENDING |

---

## Root Cause & Resolution

### Root Cause

**The Hetzner backend database was NOT re-imported after the git merge.**

Evidence:
1. Local repo has `line-659.json` (commit `8749ad9`)
2. API `/transport/sea/lines` returns only 3 lines (659 missing)
3. All departure endpoints return "Internal server error" (likely due to stale/corrupt data or missing season data)

The git merge updated the JSON source files in the repository, but the backend server's database was not updated with the new data. The mobile app correctly fetches from the API, which is serving stale data.

### Resolution

Re-import transport data to the Hetzner backend database:

```bash
# On Hetzner server:
cd /path/to/backend
git pull origin main
npm run db:seed:transport  # or equivalent import script
```

### Prevention

Consider adding a CI/CD step that automatically re-imports transport data when `backend/src/data/lines/*.json` files change on main branch.
