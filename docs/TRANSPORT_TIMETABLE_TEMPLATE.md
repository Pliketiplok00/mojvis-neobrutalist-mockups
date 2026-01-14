# Transport Timetable Template

This document defines the canonical schema and format for transport timetable seed data (road + sea).

## 1. File Locations

| Purpose | Path |
|---------|------|
| **Seed data** | `backend/src/data/seed/transport-seed.json` |
| **TypeScript types** | `backend/src/types/transport.ts` |
| **Database schema** | `backend/src/db/migrations/006_transport.sql` |
| **API response types** | `mobile/src/types/transport.ts` |

## 2. File Naming Conventions

The transport seed data lives in a **single unified file**:

```
backend/src/data/seed/transport-seed.json
```

Both road and sea transport data are combined in this one file. There are no separate files per transport type or per line.

## 3. Canonical Schema

### 3.1 Root Structure (`TransportSeedData`)

```typescript
interface TransportSeedData {
  version: string;     // Format version, e.g. "1.0"
  stops: SeedStop[];   // All stops (bus stations, ferry ports)
  seasons: SeedSeason[]; // Season date ranges
  lines: SeedLine[];   // All transport lines with routes and departures
}
```

### 3.2 Enums

| Enum | Values | Notes |
|------|--------|-------|
| `TransportType` | `'road'`, `'sea'` | Bus vs ferry |
| `SeasonType` | `'OFF'`, `'PRE'`, `'HIGH'`, `'POST'` | Off-season, Pre-season, High-season, Post-season |
| `DayType` | `'MON'`, `'TUE'`, `'WED'`, `'THU'`, `'FRI'`, `'SAT'`, `'SUN'`, `'PRAZNIK'` | Individual days + holidays. **NO generic WEEKDAY** |

### 3.3 Stop Schema (`SeedStop`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier (e.g., `"stop-vis-town"`) |
| `name_hr` | `string` | ✅ | Croatian name |
| `name_en` | `string` | ✅ | English name |
| `transport_type` | `TransportType` | ✅ | `'road'` or `'sea'` |
| `latitude` | `number` | ❌ | GPS latitude |
| `longitude` | `number` | ❌ | GPS longitude |

### 3.4 Season Schema (`SeedSeason`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier (e.g., `"season-2025-off"`) |
| `season_type` | `SeasonType` | ✅ | One of: `OFF`, `PRE`, `HIGH`, `POST` |
| `year` | `number` | ✅ | Calendar year (e.g., `2025`) |
| `date_from` | `string` | ✅ | Start date in `YYYY-MM-DD` format |
| `date_to` | `string` | ✅ | End date in `YYYY-MM-DD` format |
| `label_hr` | `string` | ✅ | Croatian display label |
| `label_en` | `string` | ✅ | English display label |

### 3.5 Line Schema (`SeedLine`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier (e.g., `"line-bus-vis-komiza"`) |
| `transport_type` | `TransportType` | ✅ | `'road'` or `'sea'` |
| `name_hr` | `string` | ✅ | Croatian line name |
| `name_en` | `string` | ✅ | English line name |
| `subtype_hr` | `string` | ❌ | Croatian subtype (e.g., "Autobusna linija") |
| `subtype_en` | `string` | ❌ | English subtype (e.g., "Bus line") |
| `display_order` | `number` | ✅ | Sort order in UI |
| `contacts` | `SeedContact[]` | ✅ | Contact info **per line** |
| `routes` | `SeedRoute[]` | ✅ | Route directions with departures |

### 3.6 Contact Schema (`SeedContact`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `'phone'` \| `'email'` \| `'website'` | ✅ | Contact type |
| `value` | `string` | ✅ | Contact value |
| `label_hr` | `string` | ❌ | Croatian label |
| `label_en` | `string` | ❌ | English label |

### 3.7 Route Schema (`SeedRoute`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier |
| `direction_hr` | `string` | ✅ | Croatian direction name (e.g., "Vis → Komiža") |
| `direction_en` | `string` | ✅ | English direction name |
| `stops` | `string[]` | ✅ | Ordered array of stop IDs |
| `departures` | `SeedDeparture[]` | ✅ | All departures for this route |

### 3.8 Departure Schema (`SeedDeparture`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `day_type` | `DayType` | ✅ | Day this departure runs |
| `season_type` | `SeasonType` | ✅ | Season this departure runs |
| `departure_time` | `string` | ✅ | Departure time in `HH:MM` format |
| `stop_times` | `(string \| null)[]` | ✅ | Arrival times at each stop (see below) |
| `notes_hr` | `string` | ❌ | Croatian notes |
| `notes_en` | `string` | ❌ | English notes |

#### Stop Times Array

The `stop_times` array is **aligned with the route's `stops` array**:
- Each index corresponds to the same index in `route.stops`
- Value is `"HH:MM"` string for the arrival time at that stop
- Value is `null` if the bus/ferry **skips** that stop

Example:
```json
{
  "stops": ["stop-vis", "stop-rukavac", "stop-plisko", "stop-komiza"],
  "departures": [{
    "stop_times": ["07:00", null, "07:25", "07:40"]
  }]
}
```
This means: departs Vis at 07:00, SKIPS Rukavac, arrives Plisko 07:25, arrives Komiža 07:40.

## 4. Minimal Working Example

```json
{
  "version": "1.0",
  "stops": [
    {
      "id": "stop-vis-town",
      "name_hr": "Vis (grad)",
      "name_en": "Vis (town)",
      "transport_type": "road"
    },
    {
      "id": "stop-komiza",
      "name_hr": "Komiža",
      "name_en": "Komiža",
      "transport_type": "road"
    }
  ],
  "seasons": [
    {
      "id": "season-2025-off",
      "season_type": "OFF",
      "year": 2025,
      "date_from": "2025-01-01",
      "date_to": "2025-05-31",
      "label_hr": "Izvansezona 2025",
      "label_en": "Off-season 2025"
    }
  ],
  "lines": [
    {
      "id": "line-bus-vis-komiza",
      "transport_type": "road",
      "name_hr": "Vis – Komiža",
      "name_en": "Vis – Komiža",
      "display_order": 1,
      "contacts": [
        { "type": "phone", "value": "+385 21 123 456" }
      ],
      "routes": [
        {
          "id": "route-vis-komiza",
          "direction_hr": "Vis → Komiža",
          "direction_en": "Vis → Komiža",
          "stops": ["stop-vis-town", "stop-komiza"],
          "departures": [
            {
              "day_type": "MON",
              "season_type": "OFF",
              "departure_time": "07:00",
              "stop_times": ["07:00", "07:30"]
            }
          ]
        }
      ]
    }
  ]
}
```

## 5. Full Template (with placeholders)

```json
{
  "version": "1.0",
  "stops": [
    {
      "id": "<unique-stop-id>",
      "name_hr": "<Croatian stop name>",
      "name_en": "<English stop name>",
      "transport_type": "<road|sea>",
      "latitude": "<optional-latitude>",
      "longitude": "<optional-longitude>"
    }
  ],
  "seasons": [
    {
      "id": "<unique-season-id>",
      "season_type": "<OFF|PRE|HIGH|POST>",
      "year": "<YYYY>",
      "date_from": "<YYYY-MM-DD>",
      "date_to": "<YYYY-MM-DD>",
      "label_hr": "<Croatian season label>",
      "label_en": "<English season label>"
    }
  ],
  "lines": [
    {
      "id": "<unique-line-id>",
      "transport_type": "<road|sea>",
      "name_hr": "<Croatian line name>",
      "name_en": "<English line name>",
      "subtype_hr": "<optional Croatian subtype>",
      "subtype_en": "<optional English subtype>",
      "display_order": "<number for sorting>",
      "contacts": [
        {
          "type": "<phone|email|website>",
          "value": "<contact value>",
          "label_hr": "<optional Croatian label>",
          "label_en": "<optional English label>"
        }
      ],
      "routes": [
        {
          "id": "<unique-route-id>",
          "direction_hr": "<Croatian direction, e.g. A → B>",
          "direction_en": "<English direction>",
          "stops": ["<stop-id-1>", "<stop-id-2>", "..."],
          "departures": [
            {
              "day_type": "<MON|TUE|WED|THU|FRI|SAT|SUN|PRAZNIK>",
              "season_type": "<OFF|PRE|HIGH|POST>",
              "departure_time": "<HH:MM>",
              "stop_times": ["<HH:MM>", "<HH:MM or null if skipped>", "..."],
              "notes_hr": "<optional Croatian notes>",
              "notes_en": "<optional English notes>"
            }
          ]
        }
      ]
    }
  ]
}
```

## 6. Edge Cases and Validation Notes

### Validation Rules

1. **Unique IDs**: All `id` fields must be unique within their category (stops, seasons, lines, routes)

2. **Stop times array length**: Must match the length of the route's `stops` array exactly

3. **Stop references**: All stop IDs in `route.stops` must exist in the top-level `stops` array

4. **Season date ranges**: Seasons should **not overlap** for the same year

5. **Time format**: All times must be `HH:MM` in 24-hour format (e.g., `"07:00"`, `"14:30"`)

6. **Date format**: All dates must be `YYYY-MM-DD` (e.g., `"2025-01-01"`)

### Edge Cases

| Case | Handling |
|------|----------|
| Stop is skipped | Use `null` in `stop_times` array |
| Holiday schedule | Use `day_type: "PRAZNIK"` |
| No departures on a day | Simply don't include departures for that day_type |
| Same route, different seasons | Create separate departure entries with different `season_type` |
| Bidirectional route | Create two separate routes (e.g., A→B and B→A) |

### Common Mistakes to Avoid

- ❌ Using `"WEEKDAY"` as a day_type (not supported - use individual days)
- ❌ Mismatched `stop_times` and `stops` array lengths
- ❌ Referencing non-existent stop IDs
- ❌ Using 12-hour time format (use 24-hour)
- ❌ Forgetting to include contacts (they're per-line, not global)

## 7. How to Test Locally

### 1. Validate JSON syntax

```bash
# Check JSON is valid
cat backend/src/data/seed/transport-seed.json | jq .
```

### 2. Run TypeScript type check

```bash
# From repo root
pnpm typecheck
```

### 3. Seed the database

```bash
# Start backend in dev mode (will auto-seed)
cd backend
pnpm dev
```

### 4. Verify in mobile app

```bash
# Start mobile app
cd mobile
pnpm start

# Navigate to Transport tab and verify:
# - Lines appear correctly
# - Departures show for current day/season
# - Stop times are accurate
```

### 5. API verification

```bash
# Check transport lines endpoint
curl http://localhost:3000/api/transport/lines

# Check departures for a specific line
curl http://localhost:3000/api/transport/lines/<line-id>/departures
```

## 8. Quick Reference

### Day Types
| Value | Meaning |
|-------|---------|
| `MON` | Monday |
| `TUE` | Tuesday |
| `WED` | Wednesday |
| `THU` | Thursday |
| `FRI` | Friday |
| `SAT` | Saturday |
| `SUN` | Sunday |
| `PRAZNIK` | Holiday |

### Season Types
| Value | Meaning |
|-------|---------|
| `OFF` | Off-season (winter) |
| `PRE` | Pre-season (spring) |
| `HIGH` | High-season (summer) |
| `POST` | Post-season (fall) |

### Transport Types
| Value | Meaning |
|-------|---------|
| `road` | Bus/road transport |
| `sea` | Ferry/catamaran |
