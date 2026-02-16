# Date Parity Checklist 2026

Verification checklist for transport schedule dates. Run these curl commands after any data or code fix to confirm parity with canonical schedule.

## API Base URL

```
BASE=https://api.mojvis-test.pliketiplok.com
```

## Line IDs

| Line | UUID | Name |
|------|------|------|
| 602 | `ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8` | Trajekt Vis-Split |
| 9602 | `e8fb699d-6ddc-5562-be14-57b6a29494f1` | Katamaran Krilo |
| 659 | `1fe9e29f-3e9e-55d8-aa87-1f34287c8abe` | Katamaran Jadrolinija |
| 612 | `ea884ee0-9c2e-5c0b-a1c9-3ec1197ffa0b` | Brod Biševo |

---

## Line 602 (Trajekt Vis-Split) - CRITICAL

Ferry operates EVERY day. Must have departures for ALL dates.

### OFF Season Period A (01.01 - 28.05)

| Date | Day | Expected | Canonical Reference | Check |
|------|-----|----------|---------------------|-------|
| 2026-01-15 | THU | 2+2 | IZVANSEZONA PON-SAT | [ ] |
| 2026-02-15 | SUN | 2+2 | IZVANSEZONA NED/BLAG | [ ] |
| 2026-03-15 | SUN | 1+1 | IZVANSEZONA NED (winter 16:30) | [ ] |
| 2026-04-15 | WED | 2+2 | IZVANSEZONA PON-SAT | [ ] |
| 2026-05-15 | FRI | 2+2 | IZVANSEZONA PETAK | [ ] |

### PRE Season (29.05 - 02.07)

| Date | Day | Expected | Canonical Reference | Check |
|------|-----|----------|---------------------|-------|
| 2026-06-01 | MON | 2+2 | NISKA SEZONA PON-ČET | [ ] |
| 2026-06-15 | MON | 2+2 | NISKA SEZONA PON-ČET | [ ] |
| 2026-06-28 | SUN | 3+3 | NISKA SEZONA PET,SUB,NED | [ ] |

### HIGH Season (03.07 - 20.09)

| Date | Day | Expected | Canonical Reference | Check |
|------|-----|----------|---------------------|-------|
| 2026-07-15 | WED | 3+3 | VISOKA SEZONA (3 polaska) | [ ] |
| 2026-08-15 | SAT | 3+3 | VISOKA SEZONA (3 polaska) | [ ] |
| 2026-09-15 | TUE | 2+2 | VISOKA SEZONA UTORAK | [ ] |

### POST Season (21.09 - 27.09)

| Date | Day | Expected | Canonical Reference | Check |
|------|-----|----------|---------------------|-------|
| 2026-09-25 | FRI | 3+3 | NISKA SEZONA PET,SUB,NED | [ ] |

### OFF Season Period B (28.09 - 31.12) - PREVIOUSLY FAILING

| Date | Day | Expected | Canonical Reference | Check |
|------|-----|----------|---------------------|-------|
| **2026-10-15** | **THU** | **2+2** | **IZVANSEZONA PON-SAT** | [ ] |
| **2026-10-20** | **TUE** | **2+2** | **IZVANSEZONA PON-SAT** | [ ] |
| **2026-11-15** | **SUN** | **1+1** | **IZVANSEZONA NED** | [ ] |
| **2026-12-01** | **TUE** | **2+2** | **IZVANSEZONA PON-SAT** | [ ] |
| **2026-12-15** | **TUE** | **2+2** | **IZVANSEZONA PON-SAT** | [ ] |
| **2026-12-25** | **THU (Božić)** | **0+0** | **25.12 ne održava se** | [ ] |

---

## Line 9602 (Katamaran Krilo)

### OFF Season Period B (28.09 - 31.12) - PREVIOUSLY FAILING

| Date | Day | Expected | Canonical Reference | Check |
|------|-----|----------|---------------------|-------|
| **2026-10-15** | **THU** | **1+1** | **IZVANSEZONA ČET** | [ ] |
| **2026-11-15** | **SUN** | **1+1** | **IZVANSEZONA NED** | [ ] |
| **2026-12-15** | **TUE** | **1+1** | **IZVANSEZONA UTO** | [ ] |

---

## Line 659 (Katamaran Jadrolinija - Summer Only)

### Summer Season (19.06 - 13.09)

| Date | Day | Expected | Canonical Reference | Check |
|------|-----|----------|---------------------|-------|
| 2026-06-18 | THU | 0+0 | Before season starts | [ ] |
| 2026-06-19 | FRI | 2+2 | SVAKI DAN 19.06–13.09 | [ ] |
| 2026-07-15 | WED | 2+2 | SVAKI DAN | [ ] |
| 2026-08-15 | SAT | 2+2 | SVAKI DAN | [ ] |
| 2026-09-13 | SUN | 2+2 | Last day of season | [ ] |
| 2026-09-14 | MON | 0+0 | After season ends | [ ] |

---

## Line 612 (Brod Biševo)

### Various Seasons with Different Patterns

| Date | Day | Expected | Canonical Reference | Check |
|------|-----|----------|---------------------|-------|
| 2026-02-15 | SUN | 1+1 | IZVANSEZONA 1 NED | [ ] |
| 2026-05-15 | FRI | 2+2 | IZVANSEZONA 2 PET (2 polaska) | [ ] |
| 2026-07-15 | WED | 1+1 | VISOKA SEZONA SRI | [ ] |
| 2026-12-27 | SUN | 1+1 | 27.12 exception: 13:00 | [ ] |

---

## Curl Test Commands

```bash
BASE=https://api.mojvis-test.pliketiplok.com

# Line 602 - October 15 (should have 2 departures direction 0)
curl -s "$BASE/transport/sea/lines/ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8/departures?date=2026-10-15&direction=0" | jq '.departures | length'

# Line 602 - December 15 (should have 2 departures direction 0)
curl -s "$BASE/transport/sea/lines/ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8/departures?date=2026-12-15&direction=0" | jq '.departures | length'

# Line 602 - June 15 (should have 2 departures direction 0)
curl -s "$BASE/transport/sea/lines/ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8/departures?date=2026-06-15&direction=0" | jq '.departures | length'

# Line 9602 - October 15 (should have 1 departure direction 0)
curl -s "$BASE/transport/sea/lines/e8fb699d-6ddc-5562-be14-57b6a29494f1/departures?date=2026-10-15&direction=0" | jq '.departures | length'

# Today endpoint - October 15 (should include 602 and 9602)
curl -s "$BASE/transport/sea/today?date=2026-10-15" | jq '.departures | length'
```

---

## Batch Verification Script

```bash
#!/bin/bash
BASE=https://api.mojvis-test.pliketiplok.com
LINE_602=ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8

echo "Line 602 Verification"
echo "====================="

for date in 2026-06-15 2026-10-15 2026-10-20 2026-11-15 2026-12-01 2026-12-15; do
  count=$(curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=$date&direction=0" | jq '.departures | length')
  if [ "$count" -gt 0 ]; then
    echo "PASS: $date = $count departures"
  else
    echo "FAIL: $date = $count departures"
  fi
done
```

---

## Pass Criteria

All checkboxes must be checked. A date is considered PASS when:

1. API returns expected number of departures (>0 unless specified)
2. Departure times match canonical schedule
3. Stop times are correctly populated
4. Day type matches the date's actual day of week

---

## Known Exceptions

| Date | Line | Expected Behavior | Reason |
|------|------|-------------------|--------|
| 2026-12-25 | 602 | 0 departures 11:00/16:30 | Christmas - partial service |
| 2026-12-25 | 612 | 0 departures | Christmas - no service |
| 2026-04-05 | 612 | 0 departures | Easter Sunday - no service |

---

## Related Documents

- [QUERY_ROOT_CAUSE_REPORT_2026.md](./QUERY_ROOT_CAUSE_REPORT_2026.md) - Technical root cause analysis
- [MONTHLY_SCHEDULE_SNAPSHOT_2026.md](./MONTHLY_SCHEDULE_SNAPSHOT_2026.md) - Full snapshot data
- [HETZNER_REIMPORT_2026.md](./HETZNER_REIMPORT_2026.md) - Import audit log
