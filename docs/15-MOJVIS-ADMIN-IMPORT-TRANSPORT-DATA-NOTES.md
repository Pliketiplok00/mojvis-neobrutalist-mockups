# ADMIN & IMPORT – TRANSPORT DATA NOTES

---

## Unified transport model (Road + Sea)

- Road and Sea use the **same data structure**
- Difference is semantic (bus stop vs port), not structural

---

## Stop time rules

- Stop time format: **HH:mm**
- Normalise imports:
  - `07.40` → `07:40`
  - `15.50` → `15:50`
- Missing stop = `null`
- Arrival time only (departure ignored)

---

## Schedule windows

Each departure belongs to a schedule window:

- date_from
- date_to
- season (OFF / LOW / HIGH)
- day_type (MON…SUN / PRAZNIK)
- direction

---

## Import expectations

- Stop sequence defined once per line + direction
- Each departure provides:
  - array of stop times aligned to stop sequence
  - `null` allowed

Example:

```json
{
  "stops": ["Split", "Milna", "Hvar", "Vis"],
  "times": ["15:00", null, "15:50", "16:10"]
}
