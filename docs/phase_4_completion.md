# Phase 4: Transport (Road & Sea Timetables) - Completion Report

## Overview

Phase 4 implements READ-ONLY transport timetables for road (bus) and sea (ferry/catamaran) transport. This is informational content only - no booking, tickets, real-time tracking, or admin editing.

## Implementation Status: COMPLETE

All planned features have been implemented and tested.

---

## Architecture

### Data Flow

```
Mobile App → Backend API → PostgreSQL Database
                ↓
         Seed Data (JSON)
```

### Key Concepts

| Concept | Implementation |
|---------|----------------|
| Day Types | Explicit MON-SUN + PRAZNIK (no generic WEEKDAY) |
| Direction | Resolved via route_id (0 or 1), not free-form strings |
| Seasons | Non-overlapping date ranges (OFF, PRE, HIGH, POST) |
| Stop Times | JSONB array with null for skipped stops |
| Contacts | BY LINE, not global by transport type |
| Holidays | Static JSON from neradni-dani.com (2026) |

---

## Files Created

### Backend

| File | Purpose |
|------|---------|
| `src/data/holidays-hr-2026.json` | Croatian public holidays for 2026 |
| `src/lib/holidays.ts` | `isHoliday()` and `getDayType()` functions |
| `src/db/migrations/006_transport.sql` | Database schema (7 tables, 3 enums) |
| `src/types/transport.ts` | TypeScript types and validation |
| `src/repositories/transport.ts` | Database access layer |
| `src/routes/transport.ts` | API route handlers |
| `src/data/seed/transport-seed.json` | Test seed data |
| `scripts/seed-transport.ts` | Database seeder script |
| `src/__tests__/transport-validation.test.ts` | Validation tests (20 tests) |

### Mobile

| File | Purpose |
|------|---------|
| `src/types/transport.ts` | TypeScript types for API responses |
| `src/services/api.ts` | Added `transportApi` methods |
| `src/navigation/types.ts` | Navigation params |
| `src/navigation/AppNavigator.tsx` | Screen registration |
| `src/components/DepartureItem.tsx` | Expandable departure with timeline |
| `src/screens/transport/TransportHubScreen.tsx` | Entry point ("Vozni red") |
| `src/screens/transport/RoadTransportScreen.tsx` | Road lines list |
| `src/screens/transport/SeaTransportScreen.tsx` | Sea lines list |
| `src/screens/transport/LineDetailScreen.tsx` | Shared detail component |
| `src/screens/transport/RoadLineDetailScreen.tsx` | Road detail wrapper |
| `src/screens/transport/SeaLineDetailScreen.tsx` | Sea detail wrapper |

---

## Database Schema

### Tables

```sql
transport_stops          -- Bus stops / ports
transport_lines          -- Named routes (road/sea)
transport_line_contacts  -- Operator contacts (BY LINE)
transport_routes         -- Directional stop sequences (2 per line)
transport_route_stops    -- Ordered stops per route
transport_seasons        -- Date ranges (OFF/PRE/HIGH/POST)
transport_departures     -- Service times with stop_times JSONB
```

### Enums

```sql
transport_type  -- 'road', 'sea'
season_type     -- 'OFF', 'PRE', 'HIGH', 'POST'
day_type        -- 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'PRAZNIK'
```

---

## API Endpoints

All endpoints are public (no authentication required).

### Road Transport

```
GET /transport/road/lines                    -- List all road lines
GET /transport/road/lines/:id                -- Line detail with routes/contacts
GET /transport/road/lines/:id/departures     -- Departures for date/direction
GET /transport/road/lines/:id/contacts       -- Contacts for line
GET /transport/road/today                    -- Today's departures (aggregated)
```

### Sea Transport

```
GET /transport/sea/lines                     -- List all sea lines
GET /transport/sea/lines/:id                 -- Line detail with routes/contacts
GET /transport/sea/lines/:id/departures      -- Departures for date/direction
GET /transport/sea/lines/:id/contacts        -- Contacts for line
GET /transport/sea/today                     -- Today's departures (aggregated)
```

### Query Parameters

| Endpoint | Parameter | Description |
|----------|-----------|-------------|
| `/departures` | `date` | YYYY-MM-DD format (default: today) |
| `/departures` | `direction` | 0 or 1 (required) |
| `/today` | `date` | YYYY-MM-DD format (default: today) |

---

## Mobile Screens

### Navigation Flow

```
TransportHub
    ├── RoadTransport
    │       └── RoadLineDetail
    └── SeaTransport
            └── SeaLineDetail
```

### TransportHubScreen

- Title: "Vozni red"
- Two option cards: Road / Sea
- Shows transport banners (deduplicated)
- Root screen (hamburger menu)

### RoadTransportScreen / SeaTransportScreen

- Lines list with name, subtype, stops summary, duration
- Today's departures section (aggregated, max 10)
- Tap line → navigate to detail
- Banner section (transport-specific + hitno)

### LineDetailScreen

- Line header with name and subtype badge
- Date selector (< date >) with day type display
- Direction toggle (two buttons)
- Route info (origin → destination, duration)
- Departures list with expandable items
- Contacts section (phone, email, website)

### DepartureItem

- Collapsed: time, destination, duration
- Expanded: vertical timeline with stop times
- Only shows stops where vessel STOPS (no null times)

---

## Key Design Decisions

### 1. Explicit Day Types

NO generic "WEEKDAY" - schedules can vary by specific weekday.

```typescript
type DayType = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' | 'PRAZNIK';
```

### 2. Direction as Integer

Direction is 0 or 1, resolved via route_id. Not free-form strings.

```sql
direction INTEGER NOT NULL CHECK (direction IN (0, 1))
```

### 3. Stop Times as JSONB

Array aligned to route stops. Null = stop is skipped.

```json
["06:30", null, "07:15", "07:45"]
```

### 4. Contacts BY LINE

Contacts are associated with specific lines, not globally by transport type.

```sql
transport_line_contacts.line_id REFERENCES transport_lines(id)
```

### 5. Non-Overlapping Seasons

Enforced via validation function with failing tests.

```typescript
validateSeasonsNoOverlap(seasons) // Returns errors if overlap detected
```

### 6. Holidays from Static JSON

No runtime fetching. Hardcoded from neradni-dani.com for 2026.

```json
{
  "holidays": [
    { "date": "2026-01-01", "name_hr": "Nova godina" },
    ...
  ]
}
```

---

## Seed Data

### Location

`backend/src/data/seed/transport-seed.json`

### Content

- One multi-stop sea line: Split - Milna - Hvar - Vis (katamaran)
- Both directions (Split→Vis and Vis→Split)
- All 4 seasons (OFF, PRE, HIGH, POST)
- Stops skipped on some days (null times)
- PRAZNIK cases included

### Running the Seeder

```bash
cd backend
npx tsx scripts/seed-transport.ts
```

### Note

Seed data is for TESTING ONLY. Format matches final import format 1:1. Replace with real imported datasets before production.

---

## Testing

### Test File

`backend/src/__tests__/transport-validation.test.ts`

### Test Coverage

- Transport type validation (road/sea)
- Day type validation (MON-SUN, PRAZNIK, rejects WEEKDAY)
- Season type validation (OFF, PRE, HIGH, POST)
- Season overlap detection (MUST FAIL on overlap)
- Seed data validation (no overlapping seasons)

### Running Tests

```bash
cd backend
npm test -- --run src/__tests__/transport-validation.test.ts
```

### Results

```
 ✓ src/__tests__/transport-validation.test.ts  (20 tests) 26ms

 Test Files  1 passed (1)
      Tests  20 passed (20)
```

---

## Banner Integration

Transport screens display relevant banners:

| Screen | Banner Tags |
|--------|-------------|
| TransportHub | cestovni_promet, pomorski_promet, hitno (deduplicated) |
| RoadTransport | cestovni_promet, hitno |
| SeaTransport | pomorski_promet, hitno |

NO opcenito, kultura, or municipal-only messages on transport screens.

---

## Out of Scope

Per specification, the following are NOT implemented:

- Booking / tickets
- Seat availability
- Real-time tracking / delays
- Push notifications for transport
- User favorites
- Search / filtering
- Admin editing of transport data

---

## Phase Gate Criteria

| Criteria | Status |
|----------|--------|
| Multi-stop rendering: only shows stops where vessel stops | PASS |
| Transport banners: only cestovni_promet/pomorski_promet/hitno | PASS |
| Date + direction logic works correctly | PASS |
| Holiday handling matches hardcoded source | PASS |
| No UI allows editing transport data | PASS |
| Season overlap validation with failing tests | PASS |
| Explicit day types (no WEEKDAY) | PASS |
| Contacts BY LINE | PASS |

---

## Future Considerations

1. **Real Data Import**: Replace seed data with actual timetables
2. **Multi-Year Holidays**: Add 2027+ holiday data when available
3. **Localization**: Currently supports HR/EN via Accept-Language header
4. **Performance**: Consider caching for frequently accessed routes

---

## Completion Date

2026-01-07
