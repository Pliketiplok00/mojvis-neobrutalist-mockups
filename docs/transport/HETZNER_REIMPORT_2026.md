# Transport Data Re-Import Audit Log: Hetzner Server

## Context

| Field | Value |
|-------|-------|
| **Date/Time** | 2026-02-10 21:15-22:00 CET |
| **Target Host** | `mojvis-hetzner` (91.98.70.43) |
| **Initial Git SHA** | `815995e` (server was behind) |
| **Final Git SHA** | `601c8fb` |
| **API URL** | `https://api.mojvis-test.pliketiplok.com` |

## Why We're Doing This

After merging branch `transport/canonical-reconciliation-2026` to main (commit `8749ad9`), the API showed:
- Only 3 lines (602, 612, 9602) instead of 4 (missing 659)
- 0 departures for all queries
- "Internal server error" on departure endpoints

**Root cause:** The Hetzner backend database was NOT re-imported with the updated JSON line files after the merge.

---

## Step 1: Confirm Backend Host & Service Layout

```bash
$ ssh mojvis-hetzner 'docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"'
NAMES              IMAGE                    STATUS
mojvis-backend     mojvis-backend:staging   Up 10 hours (healthy)
mojvis-postgres    postgres:15-alpine       Up 2 days (healthy)
```

**Setup confirmed:**
- Backend: Docker container `mojvis-backend` from image `mojvis-backend:staging`
- Database: Docker container `mojvis-postgres` (PostgreSQL 15)
- Repo path: `/opt/mojvis/src/`
- Docker compose: `/opt/mojvis/docker-compose.yml`

---

## Step 2: Update Code on Hetzner

```bash
$ ssh mojvis-hetzner 'cd /opt/mojvis/src && git pull --ff-only origin main'
Updating 815995e..6f015b4
Fast-forward
 backend/src/data/lines/line-612.json       |   2 +-
 backend/src/data/lines/line-659.json       | 103 ++++++++++++
 backend/src/data/lines/line-9602.json      |  52 +++---
 docs/transport/9602_CORRECTION_MANIFEST.md | 171 +++++++++++++++++++
 docs/transport/EXECUTION_LOG_2026.md       |  83 +++++++++
 docs/transport/RECONCILIATION_LOG_2026.md  | 259 +++++++++++++++++++++++++++++
 6 files changed, 643 insertions(+), 27 deletions(-)
 create mode 100644 backend/src/data/lines/line-659.json

$ ssh mojvis-hetzner 'cd /opt/mojvis/src && git rev-parse HEAD'
6f015b4970aaf915f9cd0b9e29ac05c69a5764d9
```

---

## Step 3: Identify Transport Import Command

**From `backend/package.json`:**
```json
"transport:import": "tsx scripts/transport-import.ts"
```

**Usage:**
```bash
tsx scripts/transport-import.ts --all --dir /app/dist/data/lines/ [--dry-run]
```

---

## Step 4: Run Transport Import

First, rebuilt Docker image to include new `line-659.json`:

```bash
$ cd /opt/mojvis && docker compose build backend
# ... build output ...
Image mojvis-backend:staging Built

$ docker compose up -d backend
Container mojvis-backend Recreated
Container mojvis-backend Started
```

Verified line-659.json in container:
```bash
$ docker exec mojvis-backend ls /app/dist/data/lines/
line-01.json
line-602.json
line-612.json
line-659.json  # NEW
line-9602.json
```

Installed tsx and ran import:
```bash
$ docker exec mojvis-backend npm install -g tsx
$ docker exec mojvis-backend tsx /app/scripts/transport-import.ts --all --dir /app/dist/data/lines/

============================================================
Transport Import CLI
============================================================

Processing: 659 (Split – Hvar – Vis)
  Action: CREATE
  Routes: 2
  Departures: 32
  New stops: 1

# ... other lines replaced ...

============================================================
Import SUCCESSFUL
  Lines imported: 5
  Total routes: 10
  Total departures: 415
============================================================
```

---

## Step 5: Restart Backend Service

```bash
$ docker compose restart backend
Container mojvis-backend Restarting
Container mojvis-backend Started

$ docker ps --filter name=mojvis-backend
mojvis-backend: Up 10 seconds (healthy)
```

---

## Step 6: HTTP Verification

### Issue Discovered: Empty Departures

After import, lines showed but departures were still empty:
```bash
$ curl ".../transport/sea/lines/ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8/departures?date=2026-02-10"
{"departures": []}
```

**Root cause:** API bug - `getDeparturesForRouteAndDate()` used `LIMIT 1` to get a single global season, but different lines had different season definitions with overlapping dates.

### Fix Applied

Changed `backend/src/repositories/transport.ts`:
- Before: Query used `getSeasonForDate()` returning one season, then `WHERE season_id = $2`
- After: Query JOINs on `transport_seasons` and filters by `$date BETWEEN s.date_from AND s.date_to`

Committed fix: `601c8fb`

### Final Verification

```bash
# Line 602 (Trajekt) - Winter 2026-02-10
$ curl ".../transport/sea/lines/ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8/departures?date=2026-02-10&direction=0"
{
  "departures": [
    {"departure_time": "05:30:00", "destination": "Split", ...},
    {"departure_time": "15:30:00", "destination": "Split", ...}
  ]
}
# PASS: 2 departures

# Line 9602 (Krilo) - Winter 2026-02-10
$ curl ".../transport/sea/lines/e8fb699d-6ddc-5562-be14-57b6a29494f1/departures?date=2026-02-10&direction=0"
{
  "departures": [
    {
      "departure_time": "07:00:00",
      "stop_times": [
        {"stop_name": "Vis", "arrival_time": "07:00"},
        {"stop_name": "Hvar", "arrival_time": "07:45"},   # Correct TUE pattern
        {"stop_name": "Milna", "arrival_time": "08:00"},  # Correct TUE pattern
        {"stop_name": "Split", "arrival_time": "08:35"}
      ]
    }
  ]
}
# PASS: Correct stop pattern for TUE

# Line 659 (Summer catamaran) - Summer 2026-07-10
$ curl ".../transport/sea/lines/1fe9e29f-3e9e-55d8-aa87-1f34287c8abe/departures?date=2026-07-10&direction=0"
{
  "departures": [
    {"departure_time": "07:30:00", "marker": "I", "notes": "Ne staje u Bolu", ...},
    {"departure_time": "15:30:00", "marker": "III", "notes": "Sve stanice", ...}
  ]
}
# PASS: Line 659 visible in summer

# Today endpoint
$ curl ".../transport/sea/today"
{
  "date": "2026-02-10",
  "day_type": "TUE",
  "departures": [5 island-origin departures]
}
# PASS: Departures returned
```

---

## Close-Out

### Root Cause

Two issues:
1. **Data sync:** Hetzner backend wasn't updated after transport reconciliation merge
2. **API bug:** `getDeparturesForRouteAndDate()` assumed a single global season per date

### Fix Applied

1. Pulled latest code to Hetzner
2. Rebuilt Docker image with new line data
3. Ran `transport:import` to import all 5 lines (415 departures)
4. Fixed API to use date-based season matching via JOIN

### Commits

| Commit | Description |
|--------|-------------|
| `6f015b4` | Transport reconciliation merge (data) |
| `601c8fb` | API fix: date-based season matching |

### Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Lines endpoint includes 659 | 4 lines | 4 lines | PASS |
| Line 602 departures Feb 10 | >0 | 2 | PASS |
| Line 9602 TUE stop pattern | HVAR 07:45, MILNA 08:00 | Correct | PASS |
| Line 659 departures Jul 10 | >0 | 2 | PASS |
| Today endpoint | >0 | 5 | PASS |
| No 500 errors | TRUE | TRUE | PASS |

### Follow-ups

1. Add CI/CD step to auto-import transport data when `backend/src/data/lines/*.json` changes
2. Consider consolidating season definitions to avoid per-line differences
