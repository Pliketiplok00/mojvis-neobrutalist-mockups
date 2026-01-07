# FEEDBACK – DESCRIPTIVE WIREFRAME

---

## SCREEN: Feedback – Message Form
ID: FB_01

### Purpose
Let users send ideas/suggestions/criticism/praise to the admin team.

Messages must appear in:
- User Inbox → Sent (outbox)
- Admin web UI (triage + tagging/status + optional reply)

---

## GLOBAL HEADER / NAV
- Standard app header: hamburger menu + app title + inbox icon
- Back returns to previous context

---

## FORM FIELDS

### 1) Feedback Type (required)
Single-select:
- New idea
- Suggestion
- Criticism
- Praise

Notes:
- Type is informational only (used for categorization)

Stored as:
- `feedbackType`

### 2) Subject / Title (required)
- Text input

Stored as:
- `subject`

### 3) Message (required)
- Multiline text input

Stored as:
- `messageBody`

### Optional identity fields
- MVP does NOT require name/email
- (If later added, they remain optional; do not block submit)

---

## SUBMIT

### Submit Button
- Sends message to backend and creates an Inbox message (type: feedback)

Rate limit (MVP requirement):
- Max 3 feedback submissions per user per day
- If limit reached:
  - show a clear error state (do not submit)
  - user remains on form

Offline behavior (MVP):
- If no internet / request fails due to connectivity:
  - show error message
  - do not queue
  - user stays on form with inputs preserved

---

## SCREEN: Feedback – Confirmation
ID: FB_02

### Purpose
Confirm the message was sent and provide a single action to return.

Behavior:
- Shown after successful submit
- Can be implemented as full screen or modal

Primary action:
- “Return to Home”
  - navigates to Home (not back-to-origin)

---

## INBOX INTEGRATION (User)

### Sent Items
- Submitted feedback appears in user Inbox → Sent
- Message includes:
  - feedback type
  - timestamp
  - status tag (admin-managed)
  - optional admin reply (if provided)

### Admin Status Tags
Admin can assign a visible tag/status to the message (user can see it), e.g.:
- received
- under review
- accepted
- rejected
(Exact labels per admin UI configuration)

### Admin Reply (optional)
- If admin replies, user can see the reply in the same inbox thread/message detail
