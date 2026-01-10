# Admin Web Editor Access Model Audit

**Date**: 2026-01-09
**Status**: READ-ONLY audit - no code changes made

---

## 1. Roles That Exist

### Defined Roles

The system defines **two roles**:
1. **admin** - Regular editor with limited permissions
2. **supervisor** - Higher-level editor with full permissions

### Source of Truth Files

| File | Purpose |
|------|---------|
| `admin/src/services/api.ts:230` | Role type definition: `role: 'admin' \| 'supervisor'` |
| `backend/src/routes/admin-static-pages.ts:63-67` | `isSupervisor()` function checks `x-admin-role` header |
| `admin/src/pages/pages/PagesListPage.tsx:24` | UI state: `const [isSupervisor] = useState(true)` |
| `admin/src/pages/pages/PageEditPage.tsx:55` | UI state: `const [isSupervisor] = useState(true)` |

### Database Storage

**NO database storage for roles exists.**

- No `admin_users` or `users` table in any migration
- No role field stored anywhere in the database
- The `created_by` fields in various tables (inbox_messages, static_pages, etc.) store a string ID placeholder but there is no users table to reference

**Migrations checked** (none contain user/role tables):
- `001_inbox_messages.sql` - `009_push_notifications.sql`

---

## 2. Authentication vs Authorization

### Authentication Status

**NO REAL AUTHENTICATION IMPLEMENTED**

The login page (`admin/src/pages/LoginPage.tsx`) is a **UI skeleton only**:

```typescript
// Line 26-35
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();

  // TODO: Implement actual authentication
  console.info('Login attempt:', { email });

  // Phase 0: Just navigate to dashboard
  if (email && password) {
    setError(null);
    navigate('/dashboard');
  }
};
```

Any email/password combination works - there is no server-side verification.

### Authorization Mechanism

Authorization uses a **header-based placeholder system**:

```typescript
// backend/src/routes/admin-static-pages.ts:63-67
function isSupervisor(request: FastifyRequest): boolean {
  // For now, check header for role
  // In production, this would verify JWT token claims
  const role = request.headers['x-admin-role'] as string | undefined;
  return role === 'supervisor';
}
```

**Where Authorization Happens:**

| Location | Type | Implementation |
|----------|------|----------------|
| Backend: `admin-static-pages.ts` | Server enforcement | `isSupervisor()` function, returns 403 |
| Admin UI: `PagesListPage.tsx` | Client gating | Hides buttons based on `isSupervisor` state |
| Admin UI: `PageEditPage.tsx` | Client gating | Hides publish/delete/add-block based on state |
| Backend: Other routes | **NONE** | No role checks whatsoever |

---

## 3. Capability Matrix

### Static Pages (ONLY feature with role enforcement)

| Feature | Action | Admin | Supervisor | Enforced Where | Notes |
|---------|--------|-------|------------|----------------|-------|
| Static Pages | List pages | YES | YES | None | `GET /admin/pages` |
| Static Pages | View page | YES | YES | None | `GET /admin/pages/:id` |
| Static Pages | Edit draft content | YES | YES | Backend lock check | Respects `content_locked` |
| Static Pages | Edit block content | YES | YES | Backend lock check | Respects `content_locked` |
| Static Pages | **Create page** | NO | YES | Backend 403 | `POST /admin/pages` |
| Static Pages | **Delete page** | NO | YES | Backend 403 | `DELETE /admin/pages/:id` |
| Static Pages | **Publish page** | NO | YES | Backend 403 | `POST /admin/pages/:id/publish` |
| Static Pages | **Unpublish page** | NO | YES | Backend 403 | `POST /admin/pages/:id/unpublish` |
| Static Pages | **Add block** | NO | YES | Backend 403 | `POST /admin/pages/:id/blocks` |
| Static Pages | **Remove block** | NO | YES | Backend 403 | `DELETE /admin/pages/:id/blocks/:blockId` |
| Static Pages | **Update block structure** | NO | YES | Backend 403 | `PATCH /admin/pages/:id/blocks/:blockId/structure` |
| Static Pages | **Reorder blocks** | NO | YES | Backend 403 | `PUT /admin/pages/:id/blocks/reorder` |

### All Other Features (NO role enforcement)

| Feature | Action | Admin | Supervisor | Enforced Where | Notes |
|---------|--------|-------|------------|----------------|-------|
| Inbox Messages | List/View/Create/Edit/Delete | YES | YES | None | All routes open |
| Inbox Messages | Hitno validation | YES | YES | Backend validation | Enforces hitno rules, not roles |
| Events | List/View/Create/Edit/Delete | YES | YES | None | All routes open |
| Feedback | List/View | YES | YES | None | Municipality scope only |
| Feedback | Update status/Reply | YES | YES | None | Municipality scope only |
| Click & Fix | List/View | YES | YES | None | Municipality scope only |
| Click & Fix | Update status/Reply | YES | YES | None | Municipality scope only |
| Transport | No admin routes | N/A | N/A | N/A | Data imported via scripts |
| Media/Uploads | No admin routes | N/A | N/A | N/A | Not implemented |
| User Management | No admin routes | N/A | N/A | N/A | Not implemented |

### Special Constraints (Not Role-Based)

| Constraint | Feature | Logic | Enforced Where |
|------------|---------|-------|----------------|
| Municipality scope | Feedback, Click-Fix | Admin can only see their municipality's items | Backend: `x-admin-municipality` header |
| Content lock | Static Pages | Blocks with `content_locked: true` can't be edited | Backend |
| Structure lock | Static Pages | Blocks with `structure_locked: true` can't be moved/deleted | Backend |
| Message lock | Inbox | Messages with push notifications are locked | Backend |
| Hitno rules | Inbox | Requires context tag + active window | Backend validation |

---

## 4. Differences That Matter

### Current Reality: Single Effective Role

**In practice, there is currently ONE role** because:

1. The UI **hardcodes** `isSupervisor = true` for all users:
   ```typescript
   // admin/src/pages/pages/PagesListPage.tsx:24
   const [isSupervisor] = useState(true); // TODO: Get from auth context
   ```

2. No authentication means anyone can set `x-admin-role: supervisor` header

3. All non-static-pages features have **zero role enforcement**

### What the Single Role Can Do

When logged in (any credentials), a user can:

1. **Inbox Messages**: Full CRUD - create, edit, delete (soft), restore
2. **Events**: Full CRUD - create, edit, delete
3. **Static Pages**: Full access (as supervisor is hardcoded)
4. **Feedback**: View and respond to all feedback (respects municipality header)
5. **Click & Fix**: View and respond to all reports (respects municipality header)
6. **Push Notifications**: Trigger automatically when creating hitno messages

### Limitations of Current Single Role

1. **No user management** - Cannot create/edit admin accounts
2. **No transport admin** - Transport data imported via scripts, no admin UI
3. **No media management** - No standalone media/upload management
4. **No audit logs** - `created_by`/`updated_by` fields exist but always null
5. **No real authentication** - Anyone with network access can access admin

### If Two Roles Were Properly Implemented (Design Intent)

Based on the code structure, the INTENDED differences are:

| # | Supervisor Can | Admin Cannot |
|---|---------------|--------------|
| 1 | Create new static pages | Create new static pages |
| 2 | Delete static pages | Delete static pages |
| 3 | Publish pages (draft → live) | Publish pages |
| 4 | Unpublish pages | Unpublish pages |
| 5 | Add blocks to pages | Add blocks to pages |
| 6 | Remove blocks from pages | Remove blocks from pages |
| 7 | Reorder blocks on pages | Reorder blocks on pages |
| 8 | Update block structure/locks | Update block structure/locks |
| 9 | Edit content-locked blocks | Edit content-locked blocks |
| 10 | Move structure-locked blocks | Move structure-locked blocks |

---

## 5. Proof

### Grep Results for Role Checks

```bash
$ grep -rn "isSupervisor\|x-admin-role" backend/src admin/src --include="*.ts" --include="*.tsx"
```

**Backend (server enforcement):**
```
backend/src/routes/admin-static-pages.ts:63:function isSupervisor(request: FastifyRequest): boolean {
backend/src/routes/admin-static-pages.ts:66:  const role = request.headers['x-admin-role'] as string | undefined;
backend/src/routes/admin-static-pages.ts:303:      if (!isSupervisor(request)) {
backend/src/routes/admin-static-pages.ts:384:      if (!isSupervisor(request)) {
backend/src/routes/admin-static-pages.ts:431:      if (!isSupervisor(request)) {
backend/src/routes/admin-static-pages.ts:481:      if (!isSupervisor(request)) {
backend/src/routes/admin-static-pages.ts:528:      if (!isSupervisor(request)) {
backend/src/routes/admin-static-pages.ts:595:      if (!isSupervisor(request)) {
backend/src/routes/admin-static-pages.ts:651:      if (!isSupervisor(request)) {
backend/src/routes/admin-static-pages.ts:705:      if (!isSupervisor(request)) {
```

**Admin UI (client gating):**
```
admin/src/pages/pages/PagesListPage.tsx:24:  const [isSupervisor] = useState(true);
admin/src/pages/pages/PagesListPage.tsx:70:          {isSupervisor && (
admin/src/pages/pages/PagesListPage.tsx:137:                      {isSupervisor && (
admin/src/pages/pages/PageEditPage.tsx:55:  const [isSupervisor] = useState(true);
admin/src/pages/pages/PageEditPage.tsx:303:            {!isNew && isSupervisor && page?.published_at && (
admin/src/pages/pages/PageEditPage.tsx:311:            {!isNew && isSupervisor && (
admin/src/pages/pages/PageEditPage.tsx:430:              {isSupervisor && !isNew && (
admin/src/pages/pages/PageEditPage.tsx:566:        {isSupervisor && (
admin/src/pages/pages/PageEditPage.tsx:589:        {!isSupervisor && (
admin/src/pages/pages/PageEditPage.tsx:622:        {isSupervisor && !block.structure_locked && (
```

**Other admin routes (NO role checks):**
```
$ grep -n "isSupervisor\|x-admin-role" backend/src/routes/admin-inbox.ts
(no results)

$ grep -n "isSupervisor\|x-admin-role" backend/src/routes/admin-events.ts
(no results)

$ grep -n "isSupervisor\|x-admin-role" backend/src/routes/admin-feedback.ts
(no results)

$ grep -n "isSupervisor\|x-admin-role" backend/src/routes/admin-click-fix.ts
(no results)
```

### Key File Paths

| Purpose | File Path |
|---------|-----------|
| Login UI (no auth) | `admin/src/pages/LoginPage.tsx` |
| Role check function | `backend/src/routes/admin-static-pages.ts:63-67` |
| Static pages with role enforcement | `backend/src/routes/admin-static-pages.ts` |
| Inbox admin (no role check) | `backend/src/routes/admin-inbox.ts` |
| Events admin (no role check) | `backend/src/routes/admin-events.ts` |
| Feedback admin (no role check) | `backend/src/routes/admin-feedback.ts` |
| Click-Fix admin (no role check) | `backend/src/routes/admin-click-fix.ts` |
| UI supervisor state (hardcoded) | `admin/src/pages/pages/PagesListPage.tsx:24` |
| API role header usage | `admin/src/services/api.ts:230-360` |
| Role capability helpers | `admin/src/types/static-page.ts:262-273` |

### Git Status

```bash
$ git status
On branch reset/map-block-editor
Your branch is up to date with 'origin/reset/map-block-editor'.

Changes not staged for commit:
  (modifications from previous work - NOT from this audit)

Untracked files:
  docs/ADMIN_WEB_EDITOR_ACCESS_AUDIT.md  <-- This report (only new file)
```

### Git Diff (New Files Only)

```bash
$ git diff --name-only
(no changes from this audit - all listed are pre-existing)
```

**New file created by this audit:**
- `docs/ADMIN_WEB_EDITOR_ACCESS_AUDIT.md`

---

## Summary

| Question | Answer |
|----------|--------|
| How many access levels? | **2 defined** (admin, supervisor), but **1 effective** (supervisor hardcoded) |
| Is authentication real? | **NO** - login page is UI-only skeleton |
| Where is role enforced? | **Backend: Static Pages only**. All other routes have no role checks. |
| Is supervisor stored in DB? | **NO** - passed via `x-admin-role` header |
| Can admin be bypassed? | **YES** - anyone can set supervisor header in API calls |
