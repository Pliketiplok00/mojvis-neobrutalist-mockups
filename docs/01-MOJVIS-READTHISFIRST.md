# READ THIS FIRST — MOJ VIS app
(Design & Implementation Guardrails)

This document is mandatory reading for anyone designing or implementing MOJ VIS.
It defines **non-negotiable system rules** that override screen-level interpretation.

If a design conflicts with this document, **the design is wrong**.

---

## 1. Mental Model (Read This Carefully)

MOJ VIS is a **calm, system-driven civic app**, not a marketing product.

Key principles:
- Predictability over expressiveness
- System rules over screen-by-screen invention
- Inbox as the single source of truth for communication
- Headers, lists, and banners are **functional**, not contextual

---

## 2. Header Rules (ABSOLUTE)

### Screen types

**Root screens**
- Home
- Events (calendar overview)
- Transport overview (Road / Sea)
- Static content pages

**Child / detail screens**
- Event detail
- Transport line detail
- Inbox message detail
- Forms (Feedback, Click & Fix)

---

### Header layout (NON-NEGOTIABLE)

**Root screens**
- Left: **Hamburger menu**
- Center: **App name — MOJ VIS**
- Right: **Inbox icon**
- ❌ No back button

**Child / detail screens**
- Left: **Back button**
- Center: **App name — MOJ VIS**
- Right: **Inbox icon**

**Inbox screens**
- ❌ Inbox icon is NOT shown

---

### Title rule (critical)

- The header title is **always “MOJ VIS”**
- Never show:
  - event titles
  - line names
  - dates
  - routes
in the header

All context belongs **inside the screen content**, never in the header.

---

## 3. Inbox = Single Source of Truth

There is no separate “notice” content type.

- **Every notice is an Inbox message**
- A message with the tag **`hitno` (emergency)** behaves as a notice
- Banners and notice blocks:
  - never contain their own content
  - always reference an Inbox message
  - tap → Inbox message detail

If it is visible to users, it exists in the Inbox.

---

## 4. Banner Rules (Click Behavior)

- All banners are **clickable**
- Clicking a banner ALWAYS opens:
  - the Inbox message detail for that message
- Banners never open:
  - external links
  - filtered lists
  - custom screens

---

## 5. List Item Rules (Global)

Every list item MUST be exactly one of the following types:

### Navigational list item
- Entire item is tappable
- Tap navigates to a new screen
- No inline expand
- Visual affordance required (arrow / chevron)

Examples:
- Events
- Transport lines
- Inbox messages

---

### Expandable list item
- Expands inline
- Does NOT navigate
- Header does NOT change
- Multiple items may be expanded at once

Examples:
- Departures with intermediate stops

---

### Action list item
- Performs an immediate action
- Does NOT navigate
- Is visually distinct

Examples:
- “Call transport operator”
- “Open external website”

---

### Forbidden
- A list item must NOT both expand and navigate
- A list item must NOT change behavior based on context

---

## 6. Transport-Specific Clarifications

### Road & Sea transport

- Transport overview screens are **root screens**
  - hamburger menu, not back
- Line detail screens are **child screens**
  - back button required

### Multi-stop lines

- Stops MUST be visible:
  - on line overview (names only, no times)
  - on line detail (with times)
- Time handling:
  - departure times are primary
  - stop times are derived from offsets

---

## 7. Localization Rules (No Exceptions)

- Every user-facing string exists in **HR and EN**
- This includes:
  - UI labels
  - empty states
  - errors
  - events
  - static pages
- Publish is blocked if EN is missing

**Exception:**
- Municipal messages (Vis / Komiža) may be single-language

---

## 8. Admin vs Supervisor (High-Level)

- **Admin**
  - edits content
  - sends messages
  - replies to users
- **Supervisor**
  - controls structure
  - publishes static pages
  - owns final responsibility

Static pages:
- Admin edits draft
- Supervisor publishes

Everything else:
- Live on save

---

## 9. If You Are Unsure

Do NOT invent a solution.

Check, in this order:
1. `READ_THIS_FIRST.md`
2. `MOJ VIS – GENERAL APP BUILD BRIEF`
3. Screen-specific descriptive wireframe

If still unclear:
- ask before designing
- ask before implementing

---

## 10. Final Rule

Consistency beats creativity.

If something feels “too strict”, it is probably correct.
