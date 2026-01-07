# MOJ VIS – GENERAL APP BUILD BRIEF (Global Rules + Decisions)

This document defines global constraints, UX rules, localization requirements, content governance, and non-functional requirements for the MOJ VIS mobile app and the web-based admin/supervisor editor.

---

## 1) Scope & Scale Targets

- User base: up to **10,000 total users**
- Concurrency: **500–1,000 simultaneous users**
- Mobile app: **no user login**
- Admin/Supervisor: **web editor login required**
- Communication (feedback / click&fix / replies / reminders) happens **inside the app only** (Inbox-based)

---

## 2) Global Formatting & Locale Rules

### Date & time
- All user-facing date/time must use:
  - `DD/MM/YYYY, HH:mm` (24-hour clock)
- Server stores timestamps in **UTC**, client displays in **Europe/Zagreb** timezone.

### Language
- Absolute rule: **every single text string** must be available in **Croatian and English**
  - Includes UI labels, errors, empty states, content pages, event content, notices, and menu labels
- Publish rule: **static pages and events cannot be published unless EN exists**
- Exception: **municipal notices** (Vis/Komiža) may exist in a single language if required

---

## 3) Navigation & UX Guardrails

- App-wide header pattern: **hamburger menu + title + inbox icon** on all main screens
- A “Back” affordance must always exist:
  - visible back link/button where applicable
  - iOS swipe-back enabled across the app (where navigation stack allows)
  - Android hardware back supported everywhere
- Every screen must define:
  - Loading state
  - Empty state
  - Error state (friendly + actionable)

### 3.1 Global Header & Navigation Canon (Non-Negotiable)

The MOJ VIS app uses a **strict, non-contextual header system** to ensure consistency, predictability, and accessibility across all screens.

---

#### Screen classification

Screens are classified into two categories:

**Root screens**
- Examples: Home, Events, Transport (Road / Sea overview), Static content pages
- Entry points via the main menu

**Child / detail screens**
- Examples: Event detail, Road line detail, Inbox message detail, Feedback / Click & Fix forms

---

#### Header rules by screen type

**Root screens**
- Left: **Hamburger menu**
- Center: **App name (“MOJ VIS”)**
- Right: **Inbox icon** (with unread badge if applicable)
- No back button is shown in the header

**Child / detail screens**
- Left: **Back button**
- Center: **App name (“MOJ VIS”)**
- Right: **Inbox icon**
- Back returns to the previous navigation context (stack-based)

---

#### Inbox icon rules (absolute)

- The Inbox icon:
  - is **always visible** on all screens **except Inbox screens themselves**
  - is **never replaced** by any other action (filter, close, confirm, settings, etc.)
- The Inbox icon always opens the Inbox list screen.

---

#### Title rules (absolute)

- The header title is **always the app name (“MOJ VIS”)**.
- Entity names (event titles, line names, routes, dates, etc.):
  - must **never** appear in the header title
  - are displayed within the screen content itself.

---

#### Navigation guarantees

- A back affordance must always exist:
  - visible back button on child / detail screens
  - iOS swipe-back enabled where navigation stack allows
  - Android hardware back button supported everywhere
- Navigation behavior must be consistent regardless of entry point (menu, banner, deep link, notification).

### 3.2 Global List Item Rules (Canonical)

This section defines **non-negotiable rules** for how list items behave across the entire MOJ VIS app.
These rules apply to **all lists**, regardless of content type (transport, events, inbox, forms, static content, etc.).

The goal is to ensure predictability, consistency, and to prevent accidental navigation or UX ambiguity.

---

#### List item types

All list items MUST belong to exactly one of the following types.

---

#### 1) Navigational list item

A navigational list item represents a single entity and leads to a new screen.

**Examples:**
- Transport line (Vis – Komiža – Vis)
- Event in event list
- Inbox message
- Static content page link

**Rules:**
- The **entire item is tappable**
- Tap ALWAYS navigates to another screen
- No inline expand/collapse is allowed
- A clear visual affordance (e.g. chevron / arrow) SHOULD indicate navigation
- Tapping the item MUST NOT trigger any other action

---

#### 2) Expandable list item

An expandable list item reveals additional information **within the same screen**.

**Examples:**
- Departure row that expands to show intermediate stops
- Inline detail sections within an already selected context

**Rules:**
- Tapping the item does NOT navigate to another screen
- Expand/collapse happens inline
- Expanded state MUST NOT change the header or navigation context
- A clear expand/collapse affordance MUST be present
- Multiple expandable items MAY be expanded at the same time

---

#### 3) Action list item

An action list item performs an immediate action.

**Examples:**
- “Call transport operator”
- “Open external website”
- “Send feedback” (entry point)

**Rules:**
- Tap performs an action immediately
- No navigation to a new internal screen
- Action MUST be visually distinguishable from navigational items
- Action items MUST NOT be expandable

---

#### Mixed behavior (explicitly forbidden)

- A list item MUST NOT both navigate AND expand.
- A list item MUST NOT change behavior depending on where it appears.
- Navigation behavior MUST be consistent regardless of entry point (menu, deep link, banner).

---

#### State handling

All list items, regardless of type, must support:
- Loading state (skeleton or placeholder)
- Empty state (friendly explanation)
- Error state (message + retry where applicable)


---

## 4) Identity, Privacy & Data Minimization (No Login)

### Core decision
- No login for end users. The app must avoid collecting personal data.

### User identification (minimal)
To support rate limits, inbox “sent”, and reminders without accounts:
- Use a **random, app-generated anonymous device/user ID** stored locally (e.g., UUID).
- Do **not** collect name/email for feedback or click&fix (anonymous communication).

### Location & photos (Click & Fix)
- Location is required for Click & Fix. This is sensitive data.
- Policy:
  - Only store what is needed to process the report.
  - Do not attempt to identify the person.
  - Provide clear in-app copy explaining why location is required.

---

## 5) Inbox as the Single Source of Truth

### Inbox contains
- Notices (system/admin)
- Event reminders (system-generated at 00:01 on event day)
- Feedback submissions (user → admin)
- Click & Fix reports (user → admin)
- Admin replies + admin status tags

### Behaviors
- Banners (Home, Timetables subpages, etc.) always deep-link to the relevant Inbox message detail.
- Inbox supports:
  - **Inbox** (received/system)
  - **Sent** (user submissions: feedback + click&fix)
- Messages support:
  - status tag (admin-managed; user-visible)
  - optional admin reply (user-visible)
  - read/unread state (recommended: local-only for MVP)

---

## 6) Notices & Active Banner Rules (Time-Bound)

### Notice model
Admin creates notices with:
- category (Emergency / General / Municipal Vis / Municipal Komiža / Transport-related)
- message content (HR/EN where applicable)
- active window: `from` → `to`

### Banner behavior
If at least one relevant notice is active:
- show banner at the top of:
  - Home screen (Emergency / General / Municipal relevant to user)
  - Transport type screens (Road/Sea) regardless of specific line relevance
- banner click opens Inbox detail for that notice

---

## 7) Events Rules (Recap)

- Events are content-managed (HR/EN required to publish)
- Calendar defaults to **today** on landing
- Event lists show all events for selected day, sorted by start time
- Reminder:
  - available to all users
  - creates an Inbox reminder message at **00:01** on the day the event starts
- Share:
  - OS-level share sheet (generic link or internal deep link)

---

## 8) Static Content Pages (CMS Contract)

Static pages are built from:
- mandatory header (simple or media carousel, up to 5 images)
- body blocks (1+)
- strict layout guardrails

Roles:
- Admin: edits content in unlocked blocks
- Supervisor: everything admin can + add/remove/reorder blocks + lock structure/content + publish

Notice blocks on pages:
- system-injected
- read-only (no one edits)

(See separate “Static Content Pages – CMS & Layout Spec” for block types and limits.)

---

## 9) Feedback & Click & Fix Rules (Recap)

### Feedback
- Required: type + subject + message
- No email required
- Rate limit: **max 3 submissions/day per anonymous user ID**
- Appears in Inbox → Sent
- Admin can tag status + reply inside the app

### Click & Fix
- Required:
  - GPS + map-picked location
  - description min 15 characters
- Photos optional (0–3)
  - if 0 photos on submit: confirm dialog (“are you sure?”)
  - client-side compression required
- Rate limit: align with feedback (recommended): **max 3/day**
- Appears in Inbox → Sent
- Admin can tag status + reply inside the app

### Offline behavior (MVP decision)
- Submissions require connectivity:
  - if offline, show error and keep form data
  - no background queueing in MVP

---

## 10) Performance & Data Delivery (Given Scope)

- Static pages:
  - cache locally for fast repeat viewing
  - refresh on app start or pull-to-refresh (implementation choice)
- Lists (events, inbox):
  - pagination (e.g., 20 items per fetch)
- Transport timetables:
  - must be indexed/cached server-side
  - “Today’s departures” is precomputed or efficiently queryable
- Images:
  - use CDN or optimized asset hosting
  - enforce size limits and compression (especially for user uploads)

---

## 11) Admin/Supervisor Web Editor Requirements

- Auth required for admin/supervisor access
- Roles:
  - Admin
  - Supervisor (superset permissions)
- Features:
  - Edit HR and EN in parallel
  - Validation before publish (EN required, required fields present, max 1 map block, max 5 header images, etc.)
  - Preview mode (mobile-like)
  - Audit log (who changed what, when) — recommended

---

## 12) Security & Abuse Prevention (MVP Practical)

- Rate limiting:
  - feedback: 3/day/user
  - click&fix: 3/day/user
- Upload validation:
  - allow only images
  - enforce max file size post-compression
- No custom HTML in CMS inputs
- Basic server protections:
  - request size limits
  - input sanitization
  - logging for submission endpoints

---

## 13) Deep Links (Recommended)

Support deep-link routes for:
- Inbox message detail
- Event detail
- Timetable type (road/sea) and optionally line + date

Deep links must open the correct screen and preserve back navigation.

---

## 14) Definition of Done (Global)

A feature is complete only if:
- HR + EN strings exist for all UI and content (except municipal notice exception)
- Loading/empty/error states exist
- Back navigation works (button + swipe/hardware)
- Data is validated server-side and client-side where relevant
- The change does not break layout guardrails or CMS publish rules

---
