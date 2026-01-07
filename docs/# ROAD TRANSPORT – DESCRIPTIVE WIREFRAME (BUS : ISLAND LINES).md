# ROAD TRANSPORT – DESCRIPTIVE WIREFRAME (BUS / ISLAND LINES)
UPDATED VERSION

---

## DATA MODEL (assumed)

Hierarchy:

transport_type (road)  
→ line  
→ pattern  
→ direction  
→ date  
→ departures[]

---

### Key properties

- Line is bidirectional (two directions).
- Lines may be multi-stop or single-stop.
- A line may define **one or more stop patterns** (variants).
- Each departure references a pattern.
- Schedule data is provided via backend/import.
- Contacts are admin-editable.
- Service notices use the global notice system (active within from → to).
- Clicking any notice banner opens the **Inbox message detail**.

---

### Stop patterns (multi-stop support)

- A **pattern** defines the ordered list of stops for a line.
- Each stop has a relative time offset from the departure time.

Pattern example:

- Vis (luka) — offset 0 min  
- Rukavac — offset +8 min  
- Podšpilje — offset +15 min  
- Komiža (centar) — offset +25 min  

Rules:
- Offsets are **relative**, not absolute times.
- Offsets are stored **once per pattern**, not per departure.
- A departure references one pattern (default: `base`).

---

## GLOBAL HEADER RULES (Road Transport)

Applies to all Road Transport screens unless explicitly stated otherwise.

### Header layout

- Left: Hamburger menu (opens main menu)
- Center: App name (**MOJ VIS**)
- Right: Inbox icon (with unread badge if applicable)

**Exception:**  
Inbox screens themselves do **not** display the Inbox icon.

---

## SCREEN: Timetables – Transport Type Selection
**ID:** TIMETABLES_01

### Purpose

Entry point for all timetables. Lets users choose between:
- Sea transport (ferries / catamarans)
- Road transport (buses)

### Behavior

- Selecting **Road transport** navigates to `ROAD_01`.
- If a relevant active notice exists (emergency / general / municipal / transport-related):
  - show notice banner at top of the screen
  - banner is clickable and opens Inbox message detail

---

## SCREEN: Road Transport – Lines Overview
**ID:** ROAD_01

### Screen type

Root-level screen (accessed from main menu).

### Purpose

Show available bus lines and provide a quick overview of **today’s departures** across all road lines.

### UI structure

- Header (global rules apply)
- Section A: Lines list
- Section B: Today’s departures (aggregated)
- Section C: Contacts

---

### Section A: Lines List

- Displays all available road lines.
- Each line item:
  - shows route name (e.g. `Vis – Komiža – Vis`)
  - may indicate if the line is multi-stop
- Tapping a line opens `ROAD_LINE_02`.

---

### Section B: Today’s Departures (Aggregated)

Definition:
- Shows **all departures** (across all road lines) that run **to or from Vis** for **today only**.

Rules:
- Date is fixed to today (no user date selection on this screen).
- Departures are ordered chronologically.
- Each item shows:
  - departure time
  - line name
  - direction
  - final destination

---

### Section C: Contacts

- Displays one or more road transport contacts.
- Fields:
  - name
  - phone number
- Clicking initiates a phone call.

---

### Notices

- If a relevant active notice exists:
  - show banner at top of the screen
  - banner click opens Inbox message detail

---

## SCREEN: Road Line Detail (Bidirectional)
**ID:** ROAD_LINE_02  
**Example:** Vis – Komiža – Vis

### Screen type

Child screen within the Transport stack.

---

### Purpose

Allow user to:
- select a date
- select a direction
- view departures for a specific road line

---

### Default state

On screen load:
- Selected date = today
- Selected direction:
  - default: Vis → destination
  - app may remember last selected direction per line (optional)

---

### Header

- Left: Back button (returns to previous context)
- Center: App name (**MOJ VIS**)
- Right: Inbox icon

---

### Inputs / Controls

#### Date selector

- Rendered as a single date field.
- Default value: today’s date.
- On tap:
  - opens calendar picker overlay.
- User cannot select past dates.
- No “Today / Tomorrow” shortcuts.
- Date selection is a filter, not primary navigation.

#### Direction toggle

- Binary toggle control:
  - Direction A (e.g. `Vis → Komiža`)
  - Direction B (e.g. `Komiža → Vis`)
- Changing direction keeps the currently selected date.

---

### Departures list

Shows all departures for:
- selected line
- selected date
- selected direction

Rules:
- Ordered chronologically.
- Each departure row shows:
  - departure time
  - final destination
  - total duration
  - indicator if the line is multi-stop
- Each row is **expandable**.

---

### Expanded departure (multi-stop)

When expanded, show ordered list of stops with **planned times**:

- Planned time is calculated as:
  departure time + stop offset.
- No distinction between arrival/departure times.
- If a stop time crosses into the next calendar day:
  - indicate with “(+1 day)” or equivalent visual marker.

Example:

- Vis (luka) — 06:30  
- Rukavac — 06:38  
- Podšpilje — 06:45  
- Komiža (centar) — 06:55  

---

### Empty state

If no departures exist for selected date/direction:

No departures for the selected date.

---

### Duration display

- Duration is fixed per pattern or per line.
- For multi-stop patterns:
  - duration refers to total trip duration to final stop.

---

### Contacts (Line / Transport)

- Displays one or more contacts.
- Admin-editable.
- Clicking initiates a phone call.

---

### Notices

- If a relevant active notice exists:
  - show banner at top of the screen
  - banner click opens Inbox message detail

---

## ADMIN / BACKEND NOTES (Road)

### Schedule data source

- Line definitions, patterns and schedules are managed via backend/import.
- Not editable via mobile UI.

---

### Admin-editable data

- Contacts:
  - may be defined per transport type and/or per line
  - fields: name, phone number
- Optional external links per line.

---

### Optional: External links (per line)

- Example: ticket purchase or operator website.
- Opens in external browser.
- May be admin-editable or fixed via config.

### Lines Overview – Stop Visibility

- On the road lines overview screen, each line item should display the ordered list of stop names (without times) to clearly communicate route coverage.
- If a line has more than 5 stops, truncate the list and indicate remaining stops with “+X stops”.
- Detailed stop times are shown only on the line detail screen.