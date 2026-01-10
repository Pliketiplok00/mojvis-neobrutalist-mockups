# Admin Web Editor — Decision & Next Steps

**Date**: 2026-01-09
**Status**: READ-ONLY decision document — no code changes made
**Based on**: `docs/ADMIN_WEB_EDITOR_ACCESS_AUDIT.md`

---

## 1. Current Reality

- **Two roles defined** (`admin`, `supervisor`) but **one effective role** — supervisor is hardcoded to `true` in all UI components
- **No authentication** — login page accepts any email/password and navigates to dashboard
- **Role enforcement exists only for Static Pages** — 8 backend routes check `isSupervisor()`, all other admin routes have zero role checks
- **Header-based authorization** — role passed via `x-admin-role` header, trivially spoofable without authentication
- **All editors currently have full access** — Inbox, Events, Feedback, Click-Fix have no role restrictions whatsoever
- **Content/structure locking works independently** — block-level locks enforce editing constraints regardless of role

---

## 2. Risk Assessment

| Risk | Severity | Current Exposure |
|------|----------|------------------|
| Unauthorized admin access | **HIGH** | Anyone with network access can log in with any credentials |
| Role bypass via header spoofing | **HIGH** | No authentication means `x-admin-role: supervisor` can be set by anyone |
| Accidental page deletion | **MEDIUM** | All users see Delete button (supervisor hardcoded) |
| Accidental page publishing | **MEDIUM** | All users see Publish button (supervisor hardcoded) |
| Inconsistent authorization model | **LOW** | Static Pages has role checks, other features don't — confusing but not exploitable beyond the header spoofing issue |

**Bottom line**: The role system provides zero security value until authentication is implemented. The current supervisor/admin distinction is purely conceptual.

---

## 3. Decision Options

### Option A: Collapse to Single Role (Recommended)

**What**: Remove all supervisor-specific restrictions. Every authenticated admin gets full access to all features.

**Changes required**:
1. Remove `isSupervisor()` checks from `admin-static-pages.ts` (8 locations)
2. Remove `isSupervisor` state from `PagesListPage.tsx` and `PageEditPage.tsx`
3. Show all buttons unconditionally (Delete, Publish, Add Block, etc.)
4. Keep content/structure locking as the only edit constraint

**Pros**:
- Matches current reality (everyone is supervisor anyway)
- Simplifies codebase — one less concept to maintain
- Content/structure locks still protect page integrity
- Clear path: add real auth later, then optionally add roles

**Cons**:
- No role-based restrictions even after auth is added
- Would require re-implementing roles if needed later

---

### Option B: Keep Supervisor But Formalize Later

**What**: Leave supervisor code in place but acknowledge it's placeholder. Fix the hardcoded `true` to come from auth context once authentication exists.

**Changes required**:
1. Document current state as intentional placeholder
2. Add TODO comments clarifying auth dependency
3. No functional changes — supervisor remains hardcoded until auth phase

**Pros**:
- Zero code changes now
- Role structure ready when auth is implemented
- Static Pages already has enforcement logic

**Cons**:
- Misleading — code suggests role enforcement that doesn't exist
- Technical debt accumulates
- Other features still have no role checks

---

### Option C: Remove Supervisor Entirely

**What**: Delete all supervisor-related code and use content/structure locks as the only access control mechanism.

**Changes required**:
1. Delete `isSupervisor()` function and all 8 call sites
2. Delete `isSupervisor` state from both page components
3. Remove `x-admin-role` header handling from API service
4. Delete role type from `api.ts`
5. Update capability helpers in `static-page.ts`

**Pros**:
- Cleanest codebase — no dead code
- Content/structure locks remain as meaningful constraints
- Forces explicit decision if roles needed later

**Cons**:
- More code changes than Option A
- Loses role infrastructure entirely
- Would need to rebuild from scratch if roles required

---

## 4. Static Pages Strategy Alignment

The Static Pages feature uses **content/structure locking** to control editing:

| Lock Type | Purpose | Role-Independent |
|-----------|---------|------------------|
| `content_locked` | Prevents text/content edits | YES |
| `structure_locked` | Prevents move/delete of block | YES |

These locks are the **intended protection mechanism** for static pages. The supervisor role was designed as an *additional* layer for structural changes (add/remove blocks, publish/unpublish).

**Key insight**: Content/structure locks work correctly today and provide meaningful protection. The supervisor role adds value only if you want different *people* to have different *capabilities* — which requires authentication first.

**Recommendation alignment**: Option A preserves the working lock system while removing the non-functional role system. This is consistent with the Static Pages strategy because locks are the primary protection, not roles.

---

## 5. Recommendation

**Choose Option A: Collapse to Single Role.**

The supervisor/admin distinction currently provides zero security because authentication doesn't exist. Anyone can access the admin panel with any credentials, and anyone can spoof the supervisor header. The code complexity of maintaining role checks is wasted until real authentication is implemented. By collapsing to a single role now, you simplify the codebase, remove misleading security theater, and retain the content/structure locks that actually protect page integrity. When authentication is implemented in a future phase, you can make an informed decision about whether role-based access is needed based on actual user requirements — and implement it properly with JWT claims rather than spoofable headers.

---

## 6. Next Safe Step

**Single task**: Create a new document `docs/AUTH_REQUIREMENTS.md` that captures:
- What authentication method to use (OAuth, email/password, SSO)
- Where user accounts will be stored (database schema)
- How sessions/tokens will work
- Whether roles are needed post-auth and what they should control

This ensures the authentication decision is made deliberately before any code changes, and provides a foundation for either re-introducing roles properly or confirming single-role is sufficient.

---

## Proof

```bash
$ git status
# Only new file: docs/ADMIN_WEB_EDITOR_NEXT_STEPS.md

$ git diff --name-only
# (no changes to existing files)
```

**Files created by this decision document**:
- `docs/ADMIN_WEB_EDITOR_NEXT_STEPS.md` (this file)

**No code was modified.**
