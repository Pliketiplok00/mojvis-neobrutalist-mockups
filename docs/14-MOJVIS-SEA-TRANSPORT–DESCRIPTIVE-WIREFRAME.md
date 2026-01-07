# SEA TRANSPORT – DESCRIPTIVE WIREFRAME (FERRIES / CATAMARANS)
UNIFIED TIME MODEL VERSION

---

## DATA MODEL (assumed)

Hierarchy:

transport_type (sea)  
→ line  
→ direction  
→ stop_sequence  
→ schedule_window  
→ departures[]

---

### Key properties

- Each city has **exactly one port**.
- Lines are bidirectional.
- Routes may be direct or multi-stop.
- **Each departure defines explicit planned arrival time per port**.
- Arrival time is used; departure difference is ignored.
- Stops may be optional per departure (`null`).
- Schedule data is provided via backend/import.
- Contacts are admin-editable.
- Service notices use the global notice system.
- Clicking any notice banner opens the **Inbox message detail**.

---

## Stop sequences (sea)

Example (Split → Vis):

1. Split (luka)  
2. Milna (Brač)  
3. Hvar  
4. Vis  

Rules:
- Stop order is fixed per direction.
- All departures reference the same stop sequence.
- A departure may skip intermediate ports via `null`.

---

## GLOBAL HEADER RULES (Sea Transport)

Same as Road Transport.

---

## SCREEN: Sea Transport – Lines Overview
**ID:** SEA_01  
**Screen type:** Root

### UI structure
- Header
- Section A: Lines list
- Section B: Today’s departures
- Section C: Contacts

---

### Section A: Lines list
- Shows all sea lines
- Displays:
  - line name
  - ordered list of port names (no times)
- If more than 5 ports:
  - truncate + “+X stops”
- Tap → `SEA_LINE_02`

---

### Section B: Today’s departures
- Aggregated departures
- Only today
- Ordered chronologically
- Each item shows:
  - first stop time
  - line name
  - direction
  - final port

---

## SCREEN: Sea Line Detail
**ID:** SEA_LINE_02  
**Screen type:** Child

### Controls
- Date selector
- Direction toggle

---

### Departures list
- Ordered chronologically
- Each row expandable

---

### Expanded departure
- Ordered list of ports
- Explicit arrival times
- `null` → skipped port
- “(+1 day)” if crossing midnight

Example:

- Split — 15:00  
- Milna — —  
- Hvar — 15:50  
- Vis — 16:10  

---

## ADMIN / BACKEND NOTES (Sea)

- Schedule data imported
- Mobile UI is read-only
- Contacts editable per operator or line
