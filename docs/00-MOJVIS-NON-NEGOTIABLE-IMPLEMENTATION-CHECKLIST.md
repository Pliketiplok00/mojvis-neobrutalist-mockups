# MOJ VIS — NON-NEGOTIABLE IMPLEMENTATION CHECKLIST
_(This document is binding. If something here is violated, the implementation is considered incorrect.)_

---

## 1. Scope & Architecture (DO NOT OVERENGINEER)
- [ ] Single backend API
- [ ] Single database
- [ ] No end-user accounts, no login, no personal data
- [ ] Anonymous user ID generated on device
- [ ] No microservices, no queues, no realtime infra
- [ ] Designed for ~10k users, ~500–1k concurrent
- [ ] Local civic app, not a general platform

---

## 2. Inbox Is the Single Source of Truth
- [ ] **ALL user-facing messages are Inbox messages**
- [ ] There is **NO separate “notice” entity**
- [ ] Banners are **derived from Inbox messages**
- [ ] Clicking any banner **always opens Inbox → message detail**
- [ ] “hitno” tag = urgent notice
- [ ] Reminders are system-generated Inbox messages

---

## 3. Message Taxonomy (FINAL & HARD-LIMITED)
- [ ] Each Inbox message has **MAX 2 tags**
- [ ] Tags must be chosen from a **fixed taxonomy only**
- [ ] No free-text or custom tags
- [ ] Tag list is treated as FINAL unless docs change

---

## 4. Banner & Active Window Rules
- [ ] Inbox messages may define `active_from` / `active_to`
- [ ] **Only messages active in the current window can appear as banners**
- [ ] No active window → no banner
- [ ] Home / Transport banners are always backed by Inbox messages
- [ ] Banner visibility logic lives server-side or in shared logic

---

## 5. Global UI Header Rules (ABSOLUTE)
- [ ] App title is **ALWAYS “MOJ VIS”**
- [ ] Root screens:
  - Hamburger (left)
  - Title: MOJ VIS (center)
  - Inbox icon (right)
- [ ] Child screens:
  - Back button (left)
  - Title: MOJ VIS (center)
  - Inbox icon (right)
- [ ] Inbox screens:
  - **Inbox icon MUST be hidden**
- [ ] These rules are enforced at layout/component level

---

## 6. List Item Behavior Rules (NO MIXING)
Each list item must be **exactly ONE** of the following:
- [ ] Navigational (opens a new screen)
- [ ] Expandable (expands inline)
- [ ] Action (immediate action, no navigation)

❌ Mixing behaviors in a single list item is NOT allowed  
❌ “Tap opens + arrow expands” is NOT allowed

---

## 7. Localization (MANDATORY)
- [ ] Every user-facing string exists in **HR + EN**
- [ ] Publishing is BLOCKED if EN is missing
- [ ] Exception: municipal emergency notices (explicitly allowed)
- [ ] DB schema stores HR and EN separately
- [ ] No silent fallback logic (except explicit QA/debug tools)

---

## 8. Time & Formatting
- [ ] All timestamps stored in UTC
- [ ] Displayed in Europe/Zagreb timezone
- [ ] Date format: `DD/MM/YYYY`
- [ ] Time format: `HH:mm`
- [ ] Event reminders fire at **00:01 on the event day**

---

## 9. Feedback & Click & Fix
- [ ] Anonymous submissions only
- [ ] Rate-limited (max 3/day per anonymous ID)
- [ ] Click & Fix requires:
  - Location (mandatory)
  - Description (min length enforced)
  - 0–3 images max
- [ ] Images only, with size + compression limits
- [ ] No offline queues or background retries

---

## 10. Transport Rules (Road & Sea)
- [ ] Transport notices are Inbox messages
- [ ] Transport banners deep-link to Inbox detail
- [ ] Road transport overview shows:
  - Stop names (no times)
  - Truncated if >5 stops
- [ ] Contextual transport notices must be supported
  (tag-based or explicit association — but must exist)

---

## 11. Admin / Supervisor Governance
- [ ] End users have NO login
- [ ] Admin & Supervisor login is required
- [ ] Roles:
  - Admin: edit content
  - Supervisor: publish, lock, structural changes
- [ ] Static pages:
  - Draft → Publish flow
  - Supervisor approval required
- [ ] Messages & events:
  - Live on save
- [ ] Municipal scope restrictions enforced

---

## 12. Static Pages CMS Constraints
- [ ] Fixed layout with defined block types
- [ ] Block limits enforced (maps, images, headers, etc.)
- [ ] Locked blocks cannot be edited by Admins
- [ ] HR + EN validation enforced before publish

---

## 13. Reliability & Definition of Done (HARD GATE)
A feature is NOT done unless:
- [ ] HR + EN content complete
- [ ] Loading state implemented
- [ ] Empty state implemented
- [ ] Error state implemented
- [ ] Back navigation works correctly
- [ ] Validation enforced on client AND server
- [ ] UI rules above are not violated

---

## 14. Performance (Minimal, Intentional)
- [ ] Static pages cached locally
- [ ] Inbox & Events paginated
- [ ] No premature optimization
- [ ] No speculative infra

---

## Final Rule
If implementation conflicts with this checklist,  
**the checklist wins** — not assumptions, not convenience, not tooling defaults.
