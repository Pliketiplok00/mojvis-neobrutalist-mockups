# MOJ VIS V3 – CONTEXT, SCOPE & LEGACY ADAPTATION

This document adapts the V2 technical/UX rules to MOJ VIS V3.
All previously written V3 `.md` documents are the **ultimate source of truth**.
This file exists to:
- explain what was intentionally removed
- clarify what patterns are still valid
- prevent overengineering beyond project scope

---

## 1 & 2. PROJECT SCOPE (NON-NEGOTIABLE)

### User scale
- Total users: **up to 10,000**
- Concurrent users: **500–1,000**
- This is a **local / island-scale public utility app**, not a global SaaS.

### Explicit constraints
- ❌ No user login
- ❌ No personal user accounts
- ❌ No email / phone collection from users
- ❌ No multi-region infrastructure
- ❌ No complex auth, token refresh, or identity systems
- ❌ No heavy real-time engines or multi-DB architectures

### Design philosophy
> Prefer **simple, explicit systems** over abstract, generic frameworks.

If a solution requires:
- multiple databases
- heavy state machines
- user identity management
- background job orchestration at scale  

…it is **out of scope** unless explicitly justified.

---

## 3. USER IDENTITY MODEL (V3)

### Anonymous user identity
- App generates a **random anonymous device/user ID** on first launch
- Stored locally on device
- Used only for:
  - rate limiting
  - inbox “sent” messages
  - event reminders
- This ID is **not personally identifiable**

There is no concept of:
- user profiles
- accounts
- login state

---

## 4. NAVIGATION & UX (ADAPTED FROM V2)

### Navigation model
- Stack-based navigation remains valid
- No auth gate
- Onboarding replaces login:
  - Language selection
  - User mode (visitor / local)
  - Municipality (if local)
  - Home

### Global UX rules (still valid)
- Every screen has:
  - loading state
  - empty state
  - error state with retry (where applicable)
- Back navigation is mandatory:
  - visible “Back” affordance
  - iOS swipe-back enabled
  - Android hardware back supported

---

## 5. LOCALIZATION (STRENGTHENED FROM V2)

### Languages
- Croatian (HR)
- English (EN)

### Absolute rule
- **Every single string must exist in both languages**
  - UI
  - static pages
  - events
  - notices
  - errors
  - empty states

### Publishing rule
- Content **cannot be published** unless EN exists
- Exception:
  - Municipal notices (Vis / Komiža) may exist in one language only

### Implementation (carried over from V2)
- HR / EN fields in DB (`titleHr`, `titleEn`, etc.)
- No runtime reliance on fallback
- Fallback may exist only as a QA safety net, not a product feature

---

## 6. CONTENT GOVERNANCE (CONTINUES FROM V2, REFINED)

### Still valid concepts
- Time-bound notices (`from` → `to`)
- Admin-managed events
- Slug-based static content pages
- Admin-curated content

### Updated structure
- Flora / Fauna / Info content:
  - now implemented as **static pages with content blocks**
  - not necessarily first-class DB entities

### Notices
- One unified notice system:
  - emergency
  - general
  - municipal (Vis / Komiža)
  - transport-related
- Notice banners always link to Inbox detail

---

## 7. INBOX AS THE SINGLE SOURCE OF TRUTH (V3 CORE PRINCIPLE)

Inbox contains:
- System notices
- Event reminders
- Feedback submissions
- Click & Fix reports
- Admin replies
- Admin status tags

This replaces multiple messaging channels from V2.

Unread state:
- May be local-only for MVP
- No cross-device sync required

---

## 8. FEEDBACK & CLICK & FIX (ADAPTED FROM V2 REPORTS)

### Feedback
- Anonymous
- No email
- Rate limit: **3/day per anonymous ID**
- Appears in Inbox → Sent
- Admin can:
  - assign status tag
  - reply in-app

### Click & Fix
- Anonymous
- Required:
  - GPS + map-picked location
  - description (min 15 chars)
- Optional:
  - up to 3 photos (client-side compressed)
- Same rate limit as feedback
- Appears in Inbox → Sent

Offline:
- No queueing in MVP
- Requires connectivity

---

## 9. IMAGES & UPLOADS (CARRIED OVER, SIMPLIFIED)

### Upload rules
- Max 3 images per submission
- Client-side compression required
- Reasonable file size limits (few MB after compression)
- Only image formats

SVG:
- Allowed for admin-managed content
- Not required for user uploads

---

## 10. RATE LIMITING & ABUSE PREVENTION

Still valid from V2, adapted to anonymous IDs:

- Read: ~100/min
- Write: ~30/min
- Upload: ~10/min

Applied per:
- anonymous user ID
- IP (as secondary guard)

No captcha required in MVP.

---

## 11. OFFLINE & CACHING (UNCHANGED PHILOSOPHY)

- No offline-first architecture
- Connectivity required for submissions
- Static content may be cached for performance
- No background sync required

---

## 12. ADMIN / SUPERVISOR WEB EDITOR

### Roles
- Admin:
  - edits content within unlocked blocks
- Supervisor:
  - full control
  - layout control
  - block locking
  - publish/unpublish

### Municipality scoping (from V2)
- Admin may have scope:
  - Vis
  - Komiža
  - Both
- Supervisor always has full scope

### Audit & validation
- Validation on publish:
  - EN required
  - required fields present
  - CMS constraints respected
- Audit log is recommended but not required for MVP

---

## 13. INFRASTRUCTURE EXPECTATIONS (IMPORTANT FOR NEW DEV)

This project does **not** require:
- microservices
- multiple databases
- complex queues
- event streaming
- real-time sockets
- user auth frameworks

A **single API + single database** is sufficient.

Focus should be on:
- clarity
- maintainability
- correctness
- content governance

---

## 14. FINAL NOTE TO DEVELOPERS

If you are unsure whether something belongs in scope, ask:

> “Does this help a visitor or local on Vis, today?”

If the answer is “not really” or “maybe in the future” —  
it is probably **out of scope for V3**.
