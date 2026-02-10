# Transport Import Runbook

## Overview

This document describes the **canonical procedure** for importing transport schedule data into MOJ VIS staging/production environments.

**Why a standardized procedure?**
- The production backend container does not include `tsx` or dev dependencies
- Host Node.js version may be too old (requires Node >= 18)
- Import must be deterministic, repeatable, and auditable
- We use a Docker-based runner to avoid host/node version drift

---

## When to Run Import

Run the import command in these scenarios:

| Scenario | Action |
|----------|--------|
| After merging transport JSON changes | Run import to apply schedule changes |
| After deploying new backend code | Run import if transport logic changed |
| After database reset/migration | Run import to repopulate transport data |
| After modifying line files locally | Run import to apply to staging/prod |
| Debugging transport issues | Run import to ensure data is fresh |

**Do NOT run import:**
- On every deploy (only when transport data/logic changed)
- Without verifying preflight checks pass

---

## The ONE Canonical Command

```bash
cd /opt/mojvis && ./src/backend/scripts/transport-import-docker.sh
```

That's it. This script handles everything:
1. Pre-flight checks (DB, files)
2. Import execution (in temporary container)
3. Post-flight verification (API checks)
4. Execution logging (writes to `docs/transport/import_runs/`)

---

## What the Script Does

### Pre-flight Checks
- Verifies Docker network `mojvis_mojvis_default` exists
- Verifies Postgres is reachable via `pg_isready`
- Checks required line files exist:
  - `line-602.json` (Trajekt Vis-Split)
  - `line-612.json` (Brod Komiza-Bisevo)
  - `line-659.json` (Katamaran Split-Hvar-Vis)
  - `line-9602.json` (Katamaran Krilo)
- Checks holidays file exists (`holidays-hr-2026.json`)

### Import Execution

**IMPORTANT: The import is a FULL REPLACE operation.**

1. **DELETE**: All existing transport data is deleted from the database (lines, routes, departures)
2. **INSERT**: Fresh data is inserted from JSON files in `src/data/lines/`

This ensures the database always matches the JSON source files exactly. There is no incremental update - every import is a clean slate.

**Technical details:**
- Runs in a temporary `node:20-alpine` container
- Mounts backend source from `/opt/mojvis/src/backend`
- Connects to Docker network for DB access
- Installs dependencies (`npm install --legacy-peer-deps`)
- Runs: `npx tsx scripts/transport-import.ts --all --dir src/data/lines`

### Post-flight Checks (Verification Gate)

The script performs **exact count verification** to ensure data integrity:

| Check | Expected | Description |
|-------|----------|-------------|
| SEA lines count | **exactly 4** | Lines 602, 612, 659, 9602 |
| Line 602 (2026-07-15) | **exactly 3 per direction** | HIGH season departures |
| Line 602 (2026-10-15) | **exactly 2 per direction** | OFF-B season departures |
| Line 659 (2026-07-15) | **> 0** | Summer (seasonal line should have departures) |
| Line 659 (2026-01-15) | **== 0** | Winter (seasonal line should have no departures) |

If any check fails, the script exits with FAIL verdict.

### Execution Logging
- Writes log file to `docs/transport/import_runs/IMPORT_<timestamp>_CET.md`
- Records: git SHA, command, summary counts, detailed API checks, PASS/FAIL verdict

---

## How to Verify Manually

If you need to verify the import independently of the script:

```bash
# Set base URL (adjust for your environment)
BASE=http://localhost:3100  # or https://api.mojvis-test.pliketiplok.com

# 1. Check SEA lines count (expect exactly 4)
curl -s "$BASE/transport/sea/lines" | jq '.lines | length'

# 2. Get line 602 ID
LINE_602=$(curl -s "$BASE/transport/sea/lines" | jq -r '.lines[] | select(.subtype == "Trajekt") | .id' | head -1)
echo "Line 602 ID: $LINE_602"

# 3. Line 602 - HIGH season (2026-07-15) - expect 3 departures per direction
curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-07-15&direction=0" | jq '.departures | length'
curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-07-15&direction=1" | jq '.departures | length'

# 4. Line 602 - OFF-B season (2026-10-15) - expect 2 departures per direction
curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-10-15&direction=0" | jq '.departures | length'
curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-10-15&direction=1" | jq '.departures | length'

# 5. Get line 659 ID and check seasonality
LINE_659=$(curl -s "$BASE/transport/sea/lines" | jq -r '.lines[] | select(.name | contains("Split – Hvar – Vis")) | .id' | head -1)
echo "Line 659 ID: $LINE_659"

# Line 659 - summer (expect > 0)
curl -s "$BASE/transport/sea/lines/$LINE_659/departures?date=2026-07-15&direction=0" | jq '.departures | length'

# Line 659 - winter (expect 0)
curl -s "$BASE/transport/sea/lines/$LINE_659/departures?date=2026-01-15&direction=0" | jq '.departures | length'
```

---

## Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `MOJVIS_DB_NAME` | `/opt/mojvis/.env` | Database name (default: `mojvis_staging`) |
| `MOJVIS_DB_USER` | `/opt/mojvis/.env` | Database user (default: `mojvis`) |
| `MOJVIS_DB_PASSWORD` | `/opt/mojvis/.env` | Database password (required) |
| `COMPOSE_DIR` | Script default | Path to docker-compose dir (default: `/opt/mojvis`) |
| `DOCKER_NETWORK` | Script default | Docker network name (default: `mojvis_mojvis_default`) |
| `API_BASE` | Script default | API base URL (default: `http://localhost:3100`) |

The script reads credentials from `/opt/mojvis/.env` automatically. **Never hardcode secrets.**

---

## Example Successful Output

```
============================================================
MOJ VIS Transport Import - Standardized Docker Runner
============================================================

============================================================
PRE-FLIGHT CHECKS
============================================================
[INFO] Checking Docker network: mojvis_mojvis_default
[PASS] Docker network exists
[INFO] Checking Postgres connectivity...
[PASS] Postgres is reachable
[INFO] Checking required line JSON files...
[PASS] Found: line-602.json
[PASS] Found: line-612.json
[PASS] Found: line-659.json
[PASS] Found: line-9602.json
[INFO] Checking holidays data...
[PASS] Found: holidays-hr-2026.json
[PASS] Found: src/lib/holidays.ts

============================================================
PRE-FLIGHT PASSED
============================================================

============================================================
RUNNING TRANSPORT IMPORT
============================================================
[INFO] Git SHA: ae5683f
[INFO] Backend dir: /opt/mojvis/src/backend
[INFO] Docker network: mojvis_mojvis_default

============================================================
Transport Import CLI
============================================================

Loading all lines from: src/data/lines
Found 5 line files

Processing: 602 (Vis – Split)
...
Import SUCCESSFUL
  Lines imported: 5
  Total routes: 10
  Total departures: 415

[PASS] Import completed

============================================================
POST-FLIGHT CHECKS
============================================================
[INFO] Checking SEA lines via API...
[PASS] API returns 4 SEA lines (expected exactly 4)
[INFO] Checking line 602 departures for 2026-07-15 (HIGH season)...
[PASS] Line 602 dir 0: 3 departures (expected 3) [05:30:00,12:00:00,18:00:00]
[PASS] Line 602 dir 1: 3 departures (expected 3) [09:00:00,15:00:00,21:00:00]
[INFO] Checking line 602 departures for 2026-10-15 (OFF-B season)...
[PASS] Line 602 dir 0: 2 departures (expected 2) [05:30:00,15:30:00]
[PASS] Line 602 dir 1: 2 departures (expected 2) [11:00:00,18:30:00]
[INFO] Checking line 659 departures for 2026-07-15 (summer)...
[PASS] Line 659 summer (2026-07-15): 2 departures
[INFO] Checking line 659 departures for 2026-01-15 (non-summer)...
[PASS] Line 659 winter (2026-01-15): 0 departures (expected)

============================================================
POST-FLIGHT PASSED
============================================================

============================================================
FINAL RESULT
============================================================
[PASS] VERDICT: PASS
[INFO] Lines: 5 | Routes: 10 | Departures: 415
```

---

## Troubleshooting

### "tsx: not found"

**Cause**: You tried to run import inside the production backend container, which only has production dependencies.

**Solution**: Use the canonical command which runs in a temporary container:
```bash
cd /opt/mojvis && ./src/backend/scripts/transport-import-docker.sh
```

### "npm: command not found" on host

**Cause**: You tried to run `npm run transport:import` directly on the host, which may not have Node.js installed.

**Solution**: Use the canonical command. We **never** use host Node.js - the script runs everything in Docker.

### "Cannot reach Postgres container"

**Cause**: Postgres container is not running or not healthy.

**Solution**:
```bash
cd /opt/mojvis
docker-compose up -d postgres
docker-compose ps  # Verify postgres is healthy
```

### "Docker network 'mojvis_mojvis_default' not found"

**Cause**: Docker network hasn't been created yet (happens on fresh deployments).

**Solution**:
```bash
cd /opt/mojvis
docker-compose up -d postgres  # This creates the network
```

### "API returns only 0 SEA lines"

**Cause**: Backend container needs restart after import, OR import failed silently.

**Solution**:
```bash
docker-compose restart backend
# Then re-run the import script
```

### Import succeeds but post-flight fails

**Cause**: API might be cached or container needs restart.

**Solution**:
```bash
docker-compose restart backend
# Wait 10 seconds for healthcheck
sleep 10
# Manually verify
curl -s http://localhost:3100/transport/sea/lines | jq '.lines | length'
```

### "scripts/transport-import.ts not found" in prod container

**Cause**: You tried to run import inside the production backend container. The prod image only includes compiled `dist/` files, not TypeScript sources or dev scripts.

**Solution**: Use the canonical command which mounts the source directory into a temporary Node 20 container:
```bash
cd /opt/mojvis && ./src/backend/scripts/transport-import-docker.sh
```

### "Docker is not available or not running"

**Cause**: Docker daemon is not running or the current user doesn't have Docker permissions.

**Solution**:
```bash
# Check if Docker is running
systemctl status docker

# If not running, start it
sudo systemctl start docker

# Verify
docker info
```

---

## Manual Import (Fallback)

If the script fails and you need to run import manually:

```bash
cd /opt/mojvis

# Get DB password from .env
DB_PASS=$(grep MOJVIS_DB_PASSWORD .env | cut -d= -f2)

# Run import in temporary container
docker run --rm \
  --network mojvis_mojvis_default \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=mojvis_staging \
  -e DB_USER=mojvis \
  -e DB_PASSWORD="$DB_PASS" \
  -v $(pwd)/src/backend:/app \
  -w /app \
  node:20-alpine \
  sh -c 'npm install --legacy-peer-deps && npx tsx scripts/transport-import.ts --all --dir src/data/lines'
```

---

## Execution Logs

All import runs are logged to:
```
docs/transport/import_runs/IMPORT_<YYYY-MM-DD_HH-mm-ss>_CET.md
```

Each log contains:
- Timestamp (Europe/Zagreb / CET)
- Hostname and environment label
- Git branch and SHA
- Full command executed (with secrets redacted)
- Summary counts (lines, routes, departures)
- Detailed postflight API checks:
  - Line 602: both directions, with departure times
  - Line 659: summer vs winter verification
- Pre-flight, import, post-flight status
- Final PASS/FAIL verdict

---

## Related Documents

- [602_SEASONS_FIX_STAGING_VERIFY_2026.md](./602_SEASONS_FIX_STAGING_VERIFY_2026.md) - Verification of seasons fix
- [SEASONS_PERMANENT_FIX_2026.md](./SEASONS_PERMANENT_FIX_2026.md) - Root cause and fix design

---

## Author

Created 2026-02-10 by Claude Code assistant.
