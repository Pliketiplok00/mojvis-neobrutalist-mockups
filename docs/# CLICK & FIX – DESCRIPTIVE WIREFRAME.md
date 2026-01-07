# CLICK & FIX – DESCRIPTIVE WIREFRAME

---

## SCREEN: Click & Fix – Report Form
ID: CFX_01

### Purpose
Allow users to report a problem on the island by submitting:
- required location (GPS + map picker)
- optional photos (up to 3)
- required description (min 15 characters)

Reports are shown in:
- User Inbox → Sent
- Admin web UI (triage + status + optional reply)

---

## GLOBAL HEADER / NAV
- Standard app header: hamburger menu + app title + inbox icon
- Back returns to previous context

---

## FORM FIELDS

### 1) Location (required)
- Input uses GPS + map picker
- User must confirm a location on map (lat/lng + optional address string)
- User can clear and re-pick location

Validation:
- Location is mandatory; cannot submit without it

Stored as:
- `locationLat`
- `locationLng`
- `locationLabel` (optional, human-readable)

### 2) Photos (optional, max 3)
- User can attach 0–3 photos
- Each photo can be removed before submit

Compression (MVP requirement):
- Client compresses images before upload (reduce size for speed/storage)
- Implementation detail is flexible (resize + quality), as long as output is smaller than original

Soft warning if no photos:
- If user tries to submit with 0 photos, show confirmation dialog:
  - “Are you sure? Reports with photos are more likely to be resolved.”
  - Options: “Add photo” / “Send anyway”

Stored as:
- `photos[]` (0–3 items, uploaded assets)

### 3) Description (required)
- Multiline text input
- Minimum length: 15 characters
- This is the only required text field

Stored as:
- `description`

---

## SUBMIT

### Submit Button
- Sends the report to backend and creates an Inbox message (type: click_and_fix)

Validation before submit:
- location must exist
- description length >= 15

Offline behavior (MVP):
- If no internet / request fails due to connectivity:
  - show error message
  - do not queue
  - user stays on form with inputs preserved

---

## SCREEN: Click & Fix – Confirmation
ID: CFX_02

### Purpose
Confirm the report was received and provide a single action to return.

Behavior:
- Shown after successful submit
- Can be implemented as full screen or modal

Primary action:
- “Return to Home”
  - navigates to Home (not back-to-origin)

---

## INBOX INTEGRATION (User)

### Sent Items
- Submitted report appears in user Inbox → Sent
- Message includes:
  - report type (Click & Fix)
  - timestamp
  - status tag (admin-managed)
  - optional admin reply (if provided)

### Admin Status Tags
Same status system as Feedback (shared inbox workflow), e.g.:
- received
- under review
- accepted
- rejected
(Exact labels per admin UI configuration)

### Admin Reply (optional)
- If admin replies, user can see the reply in the same inbox thread/message detail
