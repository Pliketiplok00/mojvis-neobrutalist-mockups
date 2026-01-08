# MOJ VIS — Full Development Roadmap

This document provides a complete, linear overview of the MOJ VIS application
development lifecycle, from initial foundations to final hardening and release.

All phases strictly follow the finalized MOJ VIS specifications.
No phase introduces concepts not defined in the documentation.

Inbox remains the SINGLE source of truth for all user-facing communication
throughout the entire system.

---

## Phase 0 — Project Foundations ✅ COMPLETED

**Status:** COMPLETE  
**Completion Date:** 2026-01-07  

### Goal
Establish a clean, minimal, and testable project skeleton across all layers.

### Scope
- Repository structure (`backend`, `mobile`, `admin`, `docs`)
- Backend: Fastify + TypeScript + PostgreSQL connection + health endpoints
- Mobile: Expo React Native skeleton, navigation, onboarding screens
- Admin: React (Vite) skeleton with layout and placeholder routes
- Tooling: ESLint, TypeScript strict mode
- Documentation and Testing Bible

### Explicitly Out of Scope
- Business logic
- Auth / login
- CRUD features
- API integrations

### Gate
- TypeScript compiles
- Lint passes
- iOS Simulator boots without crash

---

## Phase 1 — Inbox Core & Banners ✅ COMPLETED (COMPLIANCE VERIFIED)

**Status:** COMPLETE  
**Completion Date:** 2026-01-07  

### Goal
Establish Inbox as the SINGLE source of truth for all user-facing communication.

### Scope
- Inbox message data model with fixed tag taxonomy
- HR/EN bilingual content handling (no fallbacks)
- Eligibility logic (visitor/local, municipality)
- Soft delete only (no hard deletes)
- Banner derivation from Inbox messages
- Screen-context banner filtering (home / road / sea)
- Mobile Inbox UI + Banner component
- Admin Inbox CRUD (HR-only UI)

### Explicitly Out of Scope
- Feedback
- Events
- Replies
- Push notifications
- Auth / user accounts

### Gate
- Banners always open Inbox detail
- Screen-specific banner filtering enforced
- iOS Simulator verified
- All tests passing

---

## Phase 2 — Events & Reminders ✅ COMPLETED

**Status:** COMPLETE  
**Completion Date:** 2026-01-07  

### Goal
Introduce admin-managed events and reminder subscriptions,
with reminders delivered exclusively via Inbox messages.

### Scope
- Event data model (HR + EN REQUIRED)
- Event CRUD (admin)
- Anonymous per-device reminder subscriptions
- Daily backend job (00:01 Europe/Zagreb) generating Inbox reminders
- Mobile Events calendar + Event detail screen
- Reminder toggle (mobile → backend)
- Admin Event CRUD UI

### Explicitly Out of Scope
- Push notifications
- Event registration or ticketing
- Event categories or recurrence
- Mobile-side scheduling
- User accounts

### Gate
- Reminder Inbox message generated correctly
- Events render in calendar and detail views
- iOS Simulator verified
- All tests passing

---

## Phase 3 — Static Content Pages (CMS) ⏳ IN PROGRESS

### Goal
Deliver a governed, block-based CMS with strict layout rules
and supervisor-controlled publishing.

### Scope
- Static page model with draft/published states
- Exactly 8 block types (no more, no less)
- Mandatory header, max 1 map block
- HR + EN required for publish
- Block-level structure and content locking
- Supervisor-only publish/unpublish
- Mobile rendering engine for all block types
- System-injected Notice blocks (Inbox-driven)

### Explicitly Out of Scope
- Custom HTML
- User-generated content
- Flexible layouts
- Auto-translation
- Auth systems

### Gate
- Admin cannot break layout
- Supervisor publish enforced
- Notice blocks open Inbox detail
- iOS Simulator verified

---

## Phase 4 — Transport (Road & Sea)

### Goal
Provide read-only, reliable transport information with contextual notices.

### Scope
- Unified transport data model
- Import pipelines (road + sea)
- Precomputed departures
- Contextual Inbox notice association
- Mobile transport screens (road / sea)
- Admin contacts and external links

### Explicitly Out of Scope
- Booking
- Ticket sales
- Real-time delays
- Manual timetable editing

### Gate
- Correct banner visibility per transport type
- Time formatting correct
- Inbox remains source of notices

---

## Phase 5 — Feedback

### Goal
Enable anonymous user feedback routed through Inbox workflows.

### Scope
- Feedback submission endpoint
- Rate limiting (per device)
- Inbox message creation
- Admin reply support
- Mobile feedback form + confirmation
- Sent messages visible in Inbox

### Explicitly Out of Scope
- Email
- Attachments
- Offline queueing

### Gate
- Feedback appears in Sent
- Admin reply visible to user
- Rate limits enforced

---

## Phase 6 — Click & Fix

### Goal
Enable anonymous issue reporting with location and photos.

### Scope
- Click & Fix submission endpoint
- Location storage
- Image upload (0–3, compressed)
- Inbox integration
- Admin triage and replies
- Mobile map picker and photo capture

### Explicitly Out of Scope
- Public issue map
- Offline queueing
- User profiles

### Gate
- Location required
- Inbox replies visible
- Rate limits enforced

---

## Phase 7 — Push Notifications (Emergency Only)

### Goal
Add push notifications as a DELIVERY layer for urgent Inbox messages.

### Scope
- Push ONLY for `hitno` messages
- Backend-triggered only
- Push always opens Inbox detail
- No content duplication

### Explicitly Out of Scope
- Push for events or reminders
- Push as content source

### Gate
- Inbox message exists before push
- Push routing verified on device

---

## Phase 8 — Hardening, QA & Release

### Goal
Stabilize, audit, and prepare the system for production release.

### Scope
- Full journey testing
- Localization audit
- Log inspection
- Performance sanity checks
- Edge cases (empty states, expired notices, no connectivity)

### Deliverables
- Final completion report
- Zero known errors
- Clean iOS simulator run

---

## Global Non-Negotiables (All Phases)

- Inbox is always the SINGLE source of truth
- HR/EN rules strictly enforced
- No silent fallbacks
- No feature creep
- If unclear → update documentation first, not code

---

**End of Roadmap**
