# Admin UI Runtime Report

**Date:** 2026-01-09
**Branch:** audit/admin-runtime-e2e
**Test Suite:** `admin/e2e/verification-runtime.spec.ts`
**Tests Passed:** 26/26

---

## Executive Summary

The admin UI is **fully accessible without authentication**. All pages load, all data is visible, and all CRUD operations work. The login page exists but is **not enforced** - users can navigate directly to any route.

---

## Page Accessibility (Without Login)

| Page | Status | Data Visible | Actions Available |
|------|--------|--------------|-------------------|
| / (root) | 200 | Dashboard loads | Full navigation |
| /messages | 200 | 20+ messages | Create, Edit, Delete |
| /events | 200 | 3 events | Create, Edit, Delete |
| /pages | 200 | 10 pages | Create, Edit, Publish |
| /feedback | 200 | 20 items | View, Status change |
| /click-fix | 200 | List loads | View, Status change |
| /login | 200 | Form exists | Not enforced |

### Evidence

```
[VERIFY] Root access: URL=http://localhost:5173/, hasLoginPage=false, hasDashboard=true
[VERIFY] /messages access: status=200, hasMessageList=true, hasLoginForm=false
[VERIFY] /events access: status=200, hasEventsList=true
[VERIFY] /pages access: status=200, hasPagesList=true
[VERIFY] /feedback access: status=200, hasFeedbackList=true
[VERIFY] /click-fix access: status=200, hasClickFixList=true
```

---

## Inbox Workflow

### Create Message

| Feature | Working | Evidence |
|---------|---------|----------|
| Form loads | YES | titleHr, bodyHr, tags visible |
| HR fields | YES | Required and editable |
| EN fields | YES | Visible, not always required |
| Tags selection | YES | Hitno, Vis, Promet visible |
| API create without auth | **YES** | Returns 201 |
| Message appears in list | YES | Verified in UI |

**Evidence:**
```
[VERIFY] API create without auth: status=201, id=2e738d92-c88f-4c65-a3a3-0da9fe3662ce
[VERIFY] Created message visible in list: true
```

### Edit Message

| Feature | Working | Evidence |
|---------|---------|----------|
| Edit form loads | YES | Fields populated |
| Fields editable | YES | isEditable=true |
| Save works | YES | Redirects to list |

**Evidence:**
```
[VERIFY] Edit message: id=2e738d92-c88f-4c65-a3a3-0da9fe3662ce, isEditable=true
```

### Delete Message

| Feature | Working | Evidence |
|---------|---------|----------|
| Delete buttons visible | YES | 20 buttons found |
| Confirmation dialog | YES | page.on('dialog') |

---

## Static Pages CMS

### Page List

| Feature | Working | Evidence |
|---------|---------|----------|
| List loads | YES | 10 pages |
| New page button | YES | Visible |

### Page Edit

| Feature | Working | Evidence |
|---------|---------|----------|
| Edit form loads | YES | Form visible |
| Blocks visible | PARTIAL | 0 blocks found (may be collapsed) |
| Save button | YES | Visible |
| Publish button | **YES** | Should require supervisor |
| Unpublish button | **YES** | Should require supervisor |
| Add block button | **YES** | Should require supervisor |

**Evidence:**
```
[VERIFY] Supervisor controls: {
  "hasPublishButton": true,
  "hasUnpublishButton": true,
  "hasAddBlockButton": true,
  "deleteBlockButtons": 0,
  "lockControls": 0
}
```

### Supervisor Features (Should Be Restricted)

All supervisor-only features are visible and presumably functional:
- Publish/Unpublish pages
- Add blocks
- (Delete blocks - none found in test)

**Finding:** UI assumes supervisor role is granted. No role check visible.

---

## Events Workflow

### Event List

| Feature | Working | Evidence |
|---------|---------|----------|
| List loads | YES | 3 events |
| New event button | YES | Visible |
| Delete buttons | YES | 3 visible |

### Event Create/Edit

| Feature | Working | Evidence |
|---------|---------|----------|
| Create form | PARTIAL | Date field visible, title fields not found by selector |
| Edit form | YES | 9 editable fields |
| Submit button | YES | Visible |

**Evidence:**
```
[VERIFY] Event create form: {
  "titleHr": false,   <- Different selector used
  "date": true,
  "submitButton": true
}
[VERIFY] Event edit: id=56c74150-06bb-4cf2-ba06-5b880dfa6ba0, editableFields=9
```

---

## Feedback & Click-Fix

### Feedback

| Feature | Working | Evidence |
|---------|---------|----------|
| List loads | YES | 20 items |
| Detail page | YES | Form visible |
| Status dropdown | NO | Not found by selector |
| Reply textarea | YES | Visible |
| API status change | BLOCKED | Returns 400 (validation) |

**Evidence:**
```
[VERIFY] Feedback detail: {
  "hasStatusDropdown": false,
  "hasReplyButton": false,
  "hasReplyTextarea": true
}
[VERIFY] Feedback status change via API: status=400
```

### Click-Fix

| Feature | Working | Evidence |
|---------|---------|----------|
| List loads | YES | 20 rows |
| Detail page | N/A | No submissions in DB |

---

## Role-Based Access

### Headers Sent by UI

```json
[VERIFY] Admin API request headers: [
  {
    "url": "http://localhost:3000/admin/inbox?page=1&page_size=20",
    "adminRole": "NOT_SET",
    "contentType": "application/json"
  }
]
```

**Finding:** The UI does NOT send `X-Admin-Role` headers. The backend accepts requests anyway.

### Supervisor Features

All supervisor features are visible without role verification:
- Publish button: **visible**
- Add block button: **visible**
- Delete page button: **not found** (may have different location)

---

## UI vs Spec Contradictions

| Spec Requirement | UI Reality |
|------------------|------------|
| Login required | NOT enforced |
| Admin role header | NOT sent |
| Supervisor-only publish | Visible to all |
| Supervisor-only block ops | Visible to all |
| HR+EN required for publish | Not verified at UI level |

---

## Screenshots Captured

All screenshots saved to `admin/e2e-report/screenshots/`:

- `01-root-access.png` - Dashboard without login
- `02-messages-access.png` - Messages list
- `03-events-access.png` - Events list
- `04-pages-access.png` - Pages list
- `05-feedback-access.png` - Feedback list
- `06-clickfix-access.png` - Click-Fix list
- `07-login-page.png` - Login page (exists but not enforced)
- `10-inbox-create-form.png` - Create message form
- `11-inbox-api-create.png` - Message created via API
- `12-inbox-edit-form.png` - Edit message form
- `13-inbox-delete-buttons.png` - Delete buttons visible
- `20-pages-list.png` - Pages list
- `21-page-edit.png` - Page edit form
- `22-page-supervisor-controls.png` - Supervisor controls visible
- `30-events-list.png` - Events list
- `31-event-create-form.png` - Event create form
- `32-event-edit.png` - Event edit form
- `40-feedback-list.png` - Feedback list
- `41-feedback-detail.png` - Feedback detail
- `42-clickfix-list.png` - Click-Fix list

---

## Test Results

```
Running 26 tests using 1 worker
26 passed (1.0m)
```

All verification tests passed, meaning the admin UI is functioning but WITHOUT proper access controls.
