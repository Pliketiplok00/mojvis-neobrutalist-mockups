# Transport Data Re-Import Audit Log: Hetzner Server

## Context

| Field | Value |
|-------|-------|
| **Date/Time** | 2026-02-10 ~21:15 CET |
| **Target Host** | `mojvis-hetzner` (91.98.70.43) |
| **Expected Git SHA** | `6f015b4970aaf915f9cd0b9e29ac05c69a5764d9` |
| **API URL** | `https://api.mojvis-test.pliketiplok.com` |

## Why We're Doing This

After merging branch `transport/canonical-reconciliation-2026` to main (commit `8749ad9`), the API still shows:
- Only 3 lines (602, 612, 9602) instead of 4 (missing 659)
- 0 departures for all queries
- "Internal server error" on departure endpoints

**Root cause:** The Hetzner backend database was NOT re-imported with the updated JSON line files after the merge.

---

## Step 1: Confirm Backend Host & Service Layout

_Output to be recorded below_

---

## Step 2: Update Code on Hetzner

_Output to be recorded below_

---

## Step 3: Identify Transport Import Command

**Discovered from `backend/package.json`:**
```json
"transport:import": "tsx scripts/transport-import.ts"
```

**Command to run:** `npm run transport:import` (or `pnpm run transport:import`)

---

## Step 4: Run Transport Import

_Output to be recorded below_

---

## Step 5: Restart Backend Service

_Output to be recorded below_

---

## Step 6: HTTP Verification

_Output to be recorded below_

---

## Close-Out

_To be completed after verification_
