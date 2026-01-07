# ROAD TRANSPORT – DESCRIPTIVE WIREFRAME (BUS / ISLAND LINES)
UNIFIED TIME MODEL VERSION

---

## DATA MODEL (assumed)

Hierarchy:

transport_type (road)  
→ line  
→ direction  
→ stop_sequence  
→ schedule_window  
→ departures[]

---

### Key properties

- Line is bidirectional (two directions).
- Each direction defines a **fixed ordered list of stops**.
- Lines may be multi-stop or single-stop.
- **Each departure defines explicit planned arrival time per stop**.
- Stop times are **absolute (HH:mm)**.
- Stops may be optional per departure (`null`).
- Schedule data is provided via backend/import.
- Contacts are admin-editable.
- Service notices use the global notice system.
- Clicking any notice banner opens the **Inbox message detail**.

---

## Stop sequences (road)

- A **stop sequence** defines the ordered list of stops for:
  - one line
  - one direction

Example (Vis → Komiža):

1. Vis (luka)  
2. Rukavac  
3. Podšpilje  
4. Komiža (centar)

Rules:
- Stop order is fixed per direction.
- All departures reference the same stop sequence.
- A departure may skip a stop by providing `null` arrival time.

---

## GLOBAL HEADER RULES (Road Transport)

- Left: Hamburger menu
- Center: **MOJ VIS**
- Right: Inbox icon

Inbox screens do NOT show Inbox icon.

---

## SCREEN: Timetables – Transport Type Selection
**ID:** TIMETABLES_01

### Purpose
Entry point for all timetables.

### Behavior
- Road transport → `ROAD_01`
- Sea transport → SEA overview
- Active notices show as banners (tap → Inbox detail)

---

## SCREEN: Road Transport – Lines Overview
**ID:** ROAD_01  
**Screen type:** Root

### UI structure
- Header
- Section A: Lines list
- Section B: Today’s departures
- Section C: Contacts

---

### Section A: Lines list
- Shows all road lines
- Displays:
  - line name
  - ordered list of stop names (no times)
- If more than 5 stops:
  - truncate + “+X stops”
- Tap → `ROAD_LINE_02`

---

### Section B: Today’s departures
- Aggregated departures across all road lines
- Only today
- Ordered chronologically
- Each item shows:
  - first stop time
  - line name
  - direction
  - final destination

---

### Section C: Contacts
- Name + phone
- Tap initiates call

---

## SCREEN: Road Line Detail
**ID:** ROAD_LINE_02  
**Screen type:** Child

### Purpose
View departures for a single road line.

---

### Controls
- Date selector (no past dates)
- Direction toggle

---

### Departures list
- Ordered chronologically
- Each departure row shows:
  - departure time (first stop)
  - final destination
  - total duration
- Rows are **expandable**

---

### Expanded departure
Shows ordered list of stops with **explicit arrival times**.

Rules:
- Arrival time may be `null` → stop skipped
- If time crosses midnight:
  - show “(+1 day)”

Example:

- Vis (luka) — 06:30  
- Rukavac — —  
- Podšpilje — 06:45  
- Komiža (centar) — 06:55  

---

### Empty state
No departures for the selected date.

---

### Notices
- Active notices appear as banners
- Banner tap opens Inbox message detail

---

## ADMIN / BACKEND NOTES (Road)

- Schedules imported via backend
- Mobile UI is read-only
- Contacts editable per transport type or line
