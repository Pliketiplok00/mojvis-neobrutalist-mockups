# EVENTS – DESCRIPTIVE WIREFRAME

---

## SCREEN: Events – Calendar Overview
ID: EVENTS_01

### Purpose
Allow users to explore events on the island through a calendar-based interface and view events for a selected day.

---

## GLOBAL HEADER
- Uses standard app header:
  - Hamburger menu (opens main menu)
  - App title
  - Inbox icon (opens Inbox)

---

## SECTION 1: Events Header

### Content
- Section title (e.g. “Events”)
- Subtitle describing the section (admin-editable, language-specific)

---

## SECTION 2: Calendar Preview

### Purpose
Provide a monthly overview of days with scheduled events.

### Default State
- On screen load:
  - The selected day is always **today**
  - Events for today are automatically shown (if any)

### Calendar Behavior
- Days that contain one or more events are visually marked
- User can navigate between months (previous / next)
- User can tap any day to select it

### Selection Rules
- Only one day can be selected at a time
- Selecting a day updates the event list below
- If a selected day has no events:
  - An empty state message is shown

---

## SECTION 3: Selected Day Event List

### Purpose
Display all events happening on the selected day.

### Content Rules
- Shows **all events** for the selected day
- Events are ordered chronologically:
  - Earlier → later (by start time)

### Behavior
- Each event is displayed as a clickable list item
- Clicking an event opens the Event Detail screen

### Empty State
- If no events exist for the selected day:
  - Display a placeholder message (e.g. “No events for this day”)

---

## SCREEN: Event Detail
ID: EVENTS_02

### Purpose
Provide full information about a single event and allow user interaction (reminder, sharing).

---

## Navigation
- Entry:
  - From Events calendar list
  - From Home (upcoming events section)
- Exit:
  - Back action always returns to the **previous context** (not a fixed screen)

---

## SECTION 1: Event Media (Optional)

### Rules
- Event may have:
  - No image
  - One image
- Image is optional and not required for event creation

---

## SECTION 2: Event Core Information

### Required Fields
- Event title
- Event date
- Event start and end time
- Event location (name + address)
- Event description
- Organizer name

### Optional Fields
- Capacity (numeric, informational only)

---

## SECTION 3: Event Description

### Content
- Free text description of the event
- Language-specific
- Admin-managed

---

## SECTION 4: Reminder ("Remind Me")

### Purpose
Allow users to receive a reminder on the day of the event.

### Behavior
- Available to **all users** (visitor and local)
- When activated:
  - User subscribes to a reminder for this event
  - A reminder Inbox message is delivered at **00:01 Europe/Zagreb on the day the event starts**

### Rules
- One reminder subscription per user per event
- Reminder creation does not depend on push notification permissions
- Reminder appears as a standard Inbox message

### Reminder generation (backend responsibility)
- The **mobile app NEVER generates reminder messages**
- The mobile app may only **subscribe or unsubscribe** to event reminders
- Reminder Inbox messages are generated **exclusively by the backend**
- The mobile app fetches and displays reminders via the standard Inbox API

---

## SECTION 5: Share Event

### Purpose
Allow users to share the event externally.

### Behavior
- Uses OS-level share sheet
- Shared content:
  - Generic event link (deep link or web fallback, implementation-defined)
- No custom share logic required

---

## ADMIN CONTENT RULES (Events)

### Required Fields
- Title
- Date
- Start time
- End time
- Location
- Description
- Organizer

### Optional Fields
- Image
- Capacity

### General Rules
- Events without images must still render correctly
- Capacity is informational only (no booking or availability logic)

