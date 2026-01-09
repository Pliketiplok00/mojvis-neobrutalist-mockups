# Permission Matrix - MOJ VIS

**Date:** 2025-01-09
**Branch:** `audit/security-model`
**Status:** CANONICAL REFERENCE

---

## Canonical Role Model

Per specification, MOJ VIS has **exactly three actors**:

| Role | Description | Scope |
|------|-------------|-------|
| **Anonymous** | Unauthenticated user | Public endpoints only |
| **User** | Mobile app user (Local or Visitor) | Device-scoped operations, municipality filtering |
| **Admin** | Authenticated admin panel user | Full admin access, municipality-scoped |

**Note:** The codebase mentions "supervisor" in places, but this is NOT a canonical role. All admin users have full administrative privileges.

---

## Permission Matrix by Entity

### Inbox Messages

| Operation | Anonymous | User (Mobile) | Admin |
|-----------|-----------|---------------|-------|
| List published messages | READ | READ (filtered by eligibility) | - |
| Read single message | - | READ (if eligible) | - |
| Mark as read | - | WRITE (own device) | - |
| List all messages | - | - | READ |
| Create message | - | - | WRITE |
| Update message | - | - | WRITE |
| Delete message | - | - | WRITE |

### Events

| Operation | Anonymous | User (Mobile) | Admin |
|-----------|-----------|---------------|-------|
| List events | READ | READ | - |
| Read single event | READ | READ | - |
| List all events | - | - | READ |
| Create event | - | - | WRITE |
| Update event | - | - | WRITE |
| Delete event | - | - | WRITE |

### Static Pages

| Operation | Anonymous | User (Mobile) | Admin |
|-----------|-----------|---------------|-------|
| List published pages | READ | READ | - |
| Read published page | READ | READ | - |
| List all pages (incl. draft) | - | - | READ |
| Read any page | - | - | READ |
| Create page | - | - | WRITE |
| Update draft content | - | - | WRITE |
| Update block content | - | - | WRITE |
| Add/remove blocks | - | - | WRITE |
| Reorder blocks | - | - | WRITE |
| Toggle block locks | - | - | WRITE |
| Publish page | - | - | WRITE |
| Unpublish page | - | - | WRITE |
| Delete page | - | - | WRITE |

### Feedback

| Operation | Anonymous | User (Mobile) | Admin |
|-----------|-----------|---------------|-------|
| Submit feedback | - | WRITE | - |
| List feedback | - | - | READ (municipality-scoped) |
| Read feedback detail | - | - | READ (municipality-scoped) |
| Update status | - | - | WRITE |
| Add reply | - | - | WRITE |

### Click & Fix

| Operation | Anonymous | User (Mobile) | Admin |
|-----------|-----------|---------------|-------|
| Submit issue | - | WRITE | - |
| List issues | - | - | READ (municipality-scoped) |
| Read issue detail | - | - | READ (municipality-scoped) |
| Update status | - | - | WRITE |
| Add reply | - | - | WRITE |

### Menu Extras

| Operation | Anonymous | User (Mobile) | Admin |
|-----------|-----------|---------------|-------|
| List extras | READ | READ | - |
| List all extras | - | - | READ |
| Create extra | - | - | WRITE |
| Update extra | - | - | WRITE |
| Delete extra | - | - | WRITE |

---

## Municipality Scoping Rules

| Entity | Scoping Rule |
|--------|--------------|
| Inbox Messages | `audience` field: `all`, `locals`, `visitors`, or specific municipality |
| Events | `municipality` field: `vis`, `komiza`, or `all` |
| Feedback | `municipality` field from submission, admin sees own municipality |
| Click & Fix | `municipality` field from submission, admin sees own municipality |
| Static Pages | Global (no municipality scoping) |
| Menu Extras | Global (no municipality scoping) |

---

## Mobile User Context

Mobile users are identified by:

| Attribute | Source | Persistence |
|-----------|--------|-------------|
| Device ID | `X-Device-ID` header | Generated per app session |
| User Status | Local/Visitor | User selection, stored locally |
| Municipality | User location context | Determined by app |

---

## Authentication Requirements (Target State)

| Actor | Auth Method | Token Location |
|-------|-------------|----------------|
| Anonymous | None | N/A |
| User (Mobile) | Device ID | `X-Device-ID` header |
| Admin | Session token (future) | `Authorization: Bearer <token>` |

---

## Current Implementation Status

| Permission Check | Implemented? | Notes |
|------------------|--------------|-------|
| Public endpoint access | YES | Open by design |
| User device-based access | PARTIAL | Header required, not authenticated |
| Admin authentication | NO | No middleware exists |
| Admin authorization | NO | No role/permission checks |
| Municipality scoping | PARTIAL | Trusts header without verification |
