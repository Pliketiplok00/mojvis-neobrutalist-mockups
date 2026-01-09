# Minimum Test Matrix - MOJ VIS

**Date:** 2025-01-09
**Branch:** `audit/test-strategy`
**Purpose:** Define absolute minimum test coverage required before any release

---

## 1. Mandatory Test Categories

### Legend

| Symbol | Meaning |
|--------|---------|
| BLOCKING | Must pass - release blocked if fails |
| WARNING | Should pass - release allowed with documented exception |
| Unit | Fast, isolated, mocked dependencies |
| Int | Integration with real database |
| E2E | End-to-end browser/app tests |
| Smoke | Quick verification of critical paths |

---

## 2. Security Tests (CRITICAL - NOT YET IMPLEMENTED)

These tests MUST exist before production deployment.

| Test | Type | Blocking | Current | Required |
|------|------|----------|---------|----------|
| Admin endpoints reject anonymous | Int | BLOCKING | NO | YES |
| Admin endpoints reject invalid token | Int | BLOCKING | NO | YES |
| Admin endpoints accept valid token | Int | BLOCKING | NO | YES |
| User endpoints require device ID | Int | BLOCKING | YES | YES |
| Municipality scoping enforced | Int | BLOCKING | NO | YES |
| Rate limiting on submissions | Int | WARNING | NO | YES |

### Security Test Specifications

```
TEST: Admin endpoints reject anonymous
GIVEN: No Authorization header
WHEN: GET /admin/inbox
THEN: Response status 401
AND: Response body contains error message

TEST: User endpoints require device ID
GIVEN: No X-Device-ID header
WHEN: GET /inbox
THEN: Response status 400
AND: Response body contains "Device ID required"
```

---

## 3. Inbox Tests (CORE CIVIC FLOW)

| Test | Type | Blocking | Current | Required |
|------|------|----------|---------|----------|
| List inbox messages | Unit | BLOCKING | YES | YES |
| Filter by eligibility (visitor) | Unit | BLOCKING | YES | YES |
| Filter by eligibility (local) | Unit | BLOCKING | YES | YES |
| Tags returned as array (regression) | Unit | BLOCKING | YES | YES |
| Banner active window filtering | Unit | BLOCKING | YES | YES |
| Admin CRUD - create | Int | BLOCKING | YES | YES |
| Admin CRUD - update | Int | BLOCKING | YES | YES |
| Admin CRUD - delete | Int | BLOCKING | YES | YES |
| HITNO message triggers push | Int | BLOCKING | YES | YES |
| HITNO message locks after push | Int | BLOCKING | YES | YES |
| Locked message rejects edit (409) | Int | BLOCKING | YES | YES |

---

## 4. Feedback Tests (CITIZEN ENGAGEMENT)

| Test | Type | Blocking | Current | Required |
|------|------|----------|---------|----------|
| Submit feedback (public) | Int | BLOCKING | YES | YES |
| List user's sent feedback | Int | BLOCKING | YES | YES |
| Admin sees feedback in list | Int | BLOCKING | YES | YES |
| Admin changes status | Int | BLOCKING | YES | YES |
| Admin adds reply | Int | BLOCKING | YES | YES |
| User sees status change | Int | BLOCKING | YES | YES |
| User sees admin reply | Int | BLOCKING | YES | YES |
| Rate limit (3/day) | Int | WARNING | NO | YES |

---

## 5. Click & Fix Tests (CITIZEN REPORTING)

| Test | Type | Blocking | Current | Required |
|------|------|----------|---------|----------|
| Submit with photo (multipart) | Int | BLOCKING | YES | YES |
| Location stored correctly | Int | BLOCKING | YES | YES |
| Photo accessible via static URL | Int | BLOCKING | YES | YES |
| Admin sees report with photo | Int | BLOCKING | YES | YES |
| Admin changes status | Int | BLOCKING | YES | YES |
| Admin adds reply | Int | BLOCKING | YES | YES |
| User sees status change | Int | BLOCKING | YES | YES |

---

## 6. Events Tests (COMMUNITY CALENDAR)

| Test | Type | Blocking | Current | Required |
|------|------|----------|---------|----------|
| List events | Unit | BLOCKING | YES | YES |
| Filter by date range | Unit | BLOCKING | YES | YES |
| Admin CRUD - create | Int | BLOCKING | YES | YES |
| Admin CRUD - update | Int | BLOCKING | YES | YES |
| Admin CRUD - delete | Int | BLOCKING | YES | YES |
| Subscribe to reminder | Unit | BLOCKING | YES | YES |
| Unsubscribe from reminder | Unit | BLOCKING | YES | YES |
| Reminder generation job | Unit | BLOCKING | YES | YES |

---

## 7. Static Pages Tests (INFORMATION PUBLISHING)

| Test | Type | Blocking | Current | Required |
|------|------|----------|---------|----------|
| List published pages | Int | BLOCKING | YES | YES |
| Get page by slug | Int | BLOCKING | YES | YES |
| Page includes blocks | Int | BLOCKING | YES | YES |
| Admin list includes drafts | Int | BLOCKING | YES | YES |
| Admin update block content | Int | WARNING | NO | YES |
| Publish/unpublish toggle | Int | WARNING | NO | YES |
| Block lock enforcement | Int | WARNING | NO | YES |

---

## 8. Transport Tests (READ-ONLY DATA)

| Test | Type | Blocking | Current | Required |
|------|------|----------|---------|----------|
| Road lines list | Unit | BLOCKING | YES | YES |
| Sea lines list | Unit | BLOCKING | YES | YES |
| Line detail with stops | Unit | BLOCKING | YES | YES |
| Departures for date | Unit | WARNING | YES | YES |
| Null stops handled | Unit | WARNING | YES | YES |

---

## 9. Admin UI Tests (E2E)

| Test | Type | Blocking | Current | Required |
|------|------|----------|---------|----------|
| Dashboard loads | E2E | BLOCKING | YES | YES |
| All navigation links work | E2E | BLOCKING | YES | YES |
| Inbox list renders | E2E | BLOCKING | NO* | YES |
| Inbox create works | E2E | BLOCKING | NO* | YES |
| Inbox edit works | E2E | WARNING | NO* | YES |
| Feedback list renders | E2E | BLOCKING | NO* | YES |
| Feedback status change | E2E | WARNING | NO* | YES |
| Click & Fix list renders | E2E | BLOCKING | NO* | YES |

*Currently failing due to selector mismatch - fix required

---

## 10. Mobile Tests (MANUAL UNTIL DETOX)

| Test | Type | Blocking | Current | Required |
|------|------|----------|---------|----------|
| App boots without crash | Manual | BLOCKING | YES | YES |
| Onboarding flow completes | Manual | BLOCKING | YES | YES |
| Home screen renders | Manual | BLOCKING | YES | YES |
| Inbox list loads | Manual | BLOCKING | YES | YES |
| Inbox detail renders | Manual | BLOCKING | NO** | YES |
| Banner tap opens detail | Manual | BLOCKING | YES | YES |
| Events calendar loads | Manual | BLOCKING | YES | YES |
| Feedback form submits | Manual | BLOCKING | YES | YES |
| Click & Fix with photo | Manual | BLOCKING | YES | YES |
| Transport schedules load | Manual | WARNING | YES | YES |
| Static pages render | Manual | WARNING | YES | YES |

**InboxDetailScreen has tags crash - fix required

---

## 11. Cross-System Flow Tests

| Flow | Test Type | Blocking | Current | Required |
|------|-----------|----------|---------|----------|
| Admin creates inbox → Mobile sees | Smoke | BLOCKING | YES | YES |
| Admin creates HITNO → Banner shows | Smoke | BLOCKING | YES | YES |
| Banner tap → Inbox detail | Smoke | BLOCKING | YES | YES |
| User submits feedback → Admin sees | Smoke | BLOCKING | YES | YES |
| Admin replies → User sees reply | Smoke | BLOCKING | YES | YES |
| User submits Click&Fix → Admin sees | Smoke | BLOCKING | YES | YES |
| Admin creates event → Mobile shows | Smoke | WARNING | YES | YES |
| User subscribes → Reminder in inbox | Smoke | WARNING | YES | YES |
| Static page publish → Mobile renders | Smoke | WARNING | YES | YES |

---

## 12. Test Count Summary

| Category | Required Tests | Current Passing | Gap |
|----------|----------------|-----------------|-----|
| Security | 6 | 0 | 6 (CRITICAL) |
| Inbox | 11 | 11 | 0 |
| Feedback | 8 | 7 | 1 |
| Click & Fix | 7 | 7 | 0 |
| Events | 8 | 8 | 0 |
| Static Pages | 7 | 4 | 3 |
| Transport | 5 | 5 | 0 |
| Admin UI E2E | 8 | 2 | 6 |
| Mobile Manual | 11 | 10 | 1 |
| Cross-System | 9 | 9 | 0 |
| **TOTAL** | **80** | **63** | **17** |

---

## 13. Pre-Release Checklist

Before ANY release to production:

- [ ] All BLOCKING tests pass
- [ ] Security tests implemented and passing
- [ ] Admin E2E selector issues fixed
- [ ] InboxDetailScreen tags crash fixed
- [ ] Cross-system flows manually verified
- [ ] `docs/API_E2E_REPORT.md` shows 40/40 pass
- [ ] iOS Simulator tested for all journeys
