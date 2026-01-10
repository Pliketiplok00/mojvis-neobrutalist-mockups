# MOJ VIS — ADMIN & INBOX SYSTEM  
## CANONICAL SPEC (POST–PHASE 3 LOCK)

**Status:** FINAL / LOCKED  
**Lock tag:** `admin-archive-restore-locked-2026-01-10`  
**Scope:** This document REPLACES all previous admin, inbox and auth documentation.

---

## 0. META RULE (GLOBAL)

If something is **not explicitly defined in this document**:
- ❌ it does not exist
- ❌ it must not be implemented
- ❌ it must not be revived from older docs
- ❌ it must not be debated again

This file is the **single source of truth**.

---

## 1. AUTH & ROLES

### 1.1 Admin role
- There is **only one role**: `admin`
- There are NO:
  - supervisors
  - editors
  - viewers
  - municipality-specific roles

All admins are equal **except where explicitly restricted below**.

---

### 1.2 Session payload  
`GET /admin/auth/me`

```json
{
  "admin": {
    "id": "uuid",
    "username": "string",
    "municipality": "vis | komiza",
    "notice_municipality_scope": "vis | komiza | null",
    "is_breakglass": true | false
  }
}
Field meaning:

municipality → informational only (legacy / UI context)

notice_municipality_scope → ONLY permission-relevant field

is_breakglass → absolute bypass of all municipal restrictions

2. MUNICIPAL NOTICE SCOPE
2.1 Definition
A municipal notice is an inbox message that contains:

tag vis OR

tag komiza

2.2 Scope rules
notice_municipality_scope	Allowed actions
"vis"	only vis notices
"komiza"	only komiza notices
null	❌ no municipal notices
is_breakglass = true	✅ all notices

⚠️ Non-municipal messages are always allowed for all admins.

3. TAG RULES (LOCKED)
3.1 Forbidden combination
A message MUST NOT contain both:

nginx
Copy code
vis + komiza
Enforced on:

POST /admin/inbox

PATCH /admin/inbox/:id

Error response:

json
Copy code
{
  "code": "DUAL_MUNICIPAL_TAGS"
}
4. DELETE, ARCHIVE & RESTORE
4.1 Hard delete
❌ Hard delete is permanently forbidden
❌ No admin endpoint exists for hard delete

4.2 Archive (soft delete)
Endpoint

bash
Copy code
DELETE /admin/inbox/:id
Behavior

Sets deleted_at = NOW()

Message becomes archived

Message remains in database

Authorization

Uses the same municipal auth guard as create/update

Breakglass bypass applies

4.3 Restore
Endpoint

bash
Copy code
POST /admin/inbox/:id/restore
Behavior

Allowed only if deleted_at IS NOT NULL

Sets deleted_at = NULL

Errors

Case	Status
Message not found	404
Message not archived	400 NOT_ARCHIVED
Unauthorized	403

Authorization

Same guard as archive

Breakglass bypass applies

5. ADMIN LISTING
5.1 Endpoint
pgsql
Copy code
GET /admin/inbox
5.2 Query params
Param	Default	Meaning
archived=false	yes	active messages
archived=true	—	archived messages

❌ No UI mode shows active + archived together

6. ADMIN UI SEMANTICS
6.1 Inbox list
Tabs:

Aktivne

Arhivirane

Active tab
Buttons:

Uredi

Arhiviraj

Disabled when unauthorized.

Archived tab
Buttons:

Vrati

Disabled when unauthorized.

6.2 Breakglass UI behavior
If:

ts
Copy code
user.is_breakglass === true
Then:

no disabled actions

all municipal tags allowed

edit / archive / restore allowed for all messages

7. AUTH GUARANTEE
All write operations use:

nginx
Copy code
checkMunicipalNoticeAuthFromRequest
Applies to:

create

update

archive

restore

❌ No exceptions
❌ No legacy fallbacks

8. TEST COVERAGE
Explicitly tested:

dual municipal tag rejection

create/update/delete/restore authorization

null scope behavior

breakglass bypass

NOT_ARCHIVED restore case

Total:

311 tests

all passing

9. DEPRECATED (DO NOT REVIVE)
The following concepts are permanently removed:

supervisor role

hard delete

backend-only restore

implicit municipality permissions

dual municipal tagging

draft inbox messages

admin.municipality == permission

10. FINAL STATEMENT
Any future question starting with:

“But previously…”

“What if admin accidentally deletes…”

“Can we just add…”

Is answered with:

NO. THIS IS LOCKED.

Lock tag:
admin-archive-restore-locked-2026-01-10

yaml
Copy code
