# ONBOARDING FLOW – DESCRIPTIVE WIREFRAME

---

## SCREEN 0: Splash / Language Selection
ID: ONBOARD_LANG_00

### Purpose
Initial app entry screen where the user selects the application language for their own app experience.

### Key Notes
- Language selection applies **only to the end user (mobile app)**.
- Admin users use a separate web interface and **always have access to both languages in parallel**.
- Language choice does not affect admin views or admin content editing.

### UI Elements
- App logo
- Title and subtitle
- Language selection buttons (e.g. Croatian, English)

### User Actions
- User selects one language

### Rules & Logic
- Language selection is mandatory
- Selected language:
  - Is stored locally
  - Is applied immediately to all user-facing screens and content
- Language can be changed later in Settings

### Navigation
- Entry: App launch
- Exit: After language selection → `ONBOARD_ROLE_01`

---

## SCREEN 1: User Mode Selection
ID: ONBOARD_ROLE_01

### Purpose
Determine whether the user is using the app as a local resident or as a visitor.  
This choice affects notification categories, inbox content, and default subscriptions.

### UI Elements
- Screen title
- Two selectable options:
  - Visitor
  - Local resident
- Helper text explaining that the choice can be changed later

### User Actions
- User selects one of the two modes

### Rules & Logic
- Selection is mandatory
- Selected value is stored as `userMode`:
  - `visitor`
  - `local`

#### Visitor (default behavior)
- Receives:
  - General notifications
  - Cultural events
  - Emergency / urgent notifications
- Does NOT receive:
  - Municipal notifications
  - Municipal inbox messages

#### Local resident
- Receives:
  - All visitor notifications
  - Municipal notifications
  - Municipal inbox messages
- Requires municipality selection in the next step

### Navigation
- If Visitor selected → `HOME`
- If Local selected → `ONBOARD_MUNICIPALITY_02`

---

## SCREEN 2: Municipality Selection (Local users only)
ID: ONBOARD_MUNICIPALITY_02

### Purpose
Allow local users to choose which municipality’s official notifications and inbox messages they want to receive.

### UI Elements
- Screen title and subtitle
- Two selectable municipality options:
  - Komiža
  - Vis
- Back navigation option

### User Actions
- User selects exactly one municipality
- User may go back to the previous screen

### Rules & Logic
- Municipality selection is required for local users
- Selected value is stored as `municipality`:
  - `komiza`
  - `vis`
- Municipality determines:
  - Which municipal push notifications are delivered
  - Which municipal inbox messages are shown
- Only one municipality can be active at a time
- Municipality can be changed later in Settings

### Navigation
- Entry: From `ONBOARD_ROLE_01` (local selected)
- Exit: After municipality selection → `HOME`

---

## GLOBAL ONBOARDING NOTES

- Onboarding flow is shown on first app launch or after app reset
- Completion of onboarding defines:
  - `language`
  - `userMode`
  - `municipality` (if applicable)
- These values must be:
  - Persisted locally
  - Communicated to the backend for notification targeting
