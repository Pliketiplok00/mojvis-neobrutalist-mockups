# ROAD TRANSPORT – DESCRIPTIVE WIREFRAME (BUS / ISLAND LINES)

---

## DATA MODEL (assumed)
Hierarchy:
transport_type (road)
  → line
    → date
      → departures[] (bidirectional; filtered by direction)

Key properties:
- line is bidirectional (two directions)
- line is mostly multi-stop, but some are one-stop
- schedule is provided via backend/import
- contacts are admin-editable
- service notices use the same notice system (active within from→to) and open Inbox detail on click

---

## SCREEN: Timetables – Transport Type Selection
ID: TIMETABLES_01

### Purpose
Entry point for timetables. Lets users choose between:
- Sea transport (ferries/catamarans)
- Road transport (buses)

### Behavior
- Selecting "Road transport" navigates to `ROAD_01`
- If an active notice relevant to timetables exists (emergency/general/municipal/transport-related):
  - show banner on top of this screen
  - banner click opens Inbox detail for that notice

---

## SCREEN: Road Transport – Lines Overview
ID: ROAD_01

### Purpose
Show available bus lines and provide quick view of today’s departures across all road lines.

### UI Structure
- Header area with screen title/subtitle
- Section A: Lines list
- Section B: "Today’s departures" aggregated list
- Section C: Contacts

### Section A: Lines List (Road)
- Displays all available road lines
- Each line item opens the line detail screen `ROAD_LINE_02`

### Section B: Today’s Departures (aggregated)
Definition:
- shows ALL departures (across all road lines) that run **to/from Vis** for the current day

Rules:
- Uses today’s date only (not user-selected date, because this is the overview screen)
- Ordered chronologically

### Section C: Contacts
- Displays one or more contacts relevant to road transport
- Contacts are admin-editable (name + phone)
- Clicking a contact initiates a phone call (device default)

### Notices
- If a relevant active notice exists (same notice system: active within from→to):
  - show banner at top of the screen
  - clicking banner opens Inbox detail

---

## SCREEN: Road Line Detail (Bidirectional)
ID: ROAD_LINE_02

Example: Vis–Komiža–Vis

### Purpose
Allow user to select a date and direction for a specific road line and view departures.

### Default State
- On screen load:
  - selected date = today
  - selected direction:
    - recommended default: Vis → destination
    - app should store and reuse last selected direction per line (optional but recommended)

### Inputs / Controls
- Date selector:
  - opens calendar picker
  - user cannot select dates in the past
- Direction toggle (two options):
  - Direction A (e.g., Vis → Komiža)
  - Direction B (e.g., Komiža → Vis)

Rules:
- Changing direction keeps the same selected date
- Date + direction filters the departures list

### Departures List
- Shows all departures for:
  - selected line
  - selected date
  - selected direction
- Ordered chronologically (earlier → later)

Empty State
- If no departures exist for selected date/direction:
  - show message: "No departures for the selected date"

### Duration Display
- Duration is fixed per line (e.g. ~25 min)
- (Implementation note) For cases where duration varies (e.g. catamaran stop patterns):
  - prefer storing duration per departure or allow duration override ranges
  - for road lines, default is fixed per line

### Contacts (Line / Transport Contacts)
- Displays one or more contacts (name + phone)
- Contacts are admin-editable
- Clicking initiates a call

### Navigation
- Back returns to the previous context

### Notices
- If a relevant active notice exists:
  - show banner at top of screen (regardless of which line it references)
  - clicking banner opens Inbox detail

---

## ADMIN / BACKEND NOTES (Road)

### Schedule Data Source
- Line definitions and schedules are managed via backend/import (not edited manually by admin in the mobile UI)

### Admin-Editable Data
- Contacts:
  - one or more contacts per transport type and/or per line (implementation choice)
  - fields: name, phone number
- Optional: external ticket links per line (see below)

### Optional: External Links (per line)
- Links (e.g., operator website) are line-specific
- Open in external browser
- May be admin-editable or fixed in config

