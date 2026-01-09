# MOJ VIS – Work Items Register (Post-Audit Baseline)

**Date:** 2026-01-09  
**Sources:**  
- Static audit (Codex)  
- Runtime verification (Claude)  
- Docs drift report  
- Risk register  
- Test gaps report  
- Runtime API probes  

This document is a **consolidated register of all critical findings** identified so far.
It is **not a test report** and **not a fix plan**.

Its purpose is to:
- preserve shared understanding of the system’s real state
- document known gaps, risks, and inconsistencies
- serve as a reference before entering the next testing and implementation phases

❗ No fixes were applied. Everything below is observational.

---

## 1. CRITICAL BLOCKERS (SECURITY & DATA INTEGRITY)

### 1.1. Admin API is completely unauthenticated (CRITICAL)

**Status:** CONFIRMED at runtime  
**Description:**  
All `/admin/*` backend endpoints are publicly accessible without authentication or authorization.

**Impact:**
- Any anonymous user can:
  - read all admin data (inbox messages, feedback, click & fix, CMS pages)
  - create inbox messages visible to all app users
  - trigger reminder generation
- This is **actively exploitable**, not theoretical.

**Evidence:**
- `ADMIN_API_EXPOSURE_REPORT.md`
- `RUNTIME_API_PROBES.md`
- `RUNTIME_FINDINGS_ADDENDUM.md`

**Note:**  
This must be addressed **before any public testing or deployment**.

---

### 1.2. Test data can be written directly into the database

**Status:** CONFIRMED  
**Description:**  
Admin write endpoints (POST/PATCH) persist data without any auth barrier.

**Impact:**
- Database pollution
- No separation between test and real data
- In production, this would constitute a serious incident

---

## 2. FUNCTIONAL GAPS (CODE EXISTS, FEATURE DOES NOT WORK)

### 2.1. Menu Extras routes are not wired

**Status:** CONFIRMED at runtime  
**Description:**  
Route files exist (`menu-extras.ts`, `admin-menu-extras.ts`) but are **not imported in `backend/src/index.ts`**.

**Runtime behavior:**
- `GET /menu/extras` → 404
- `GET /admin/menu/extras` → 404

**Impact:**
- Mobile menu extras cannot load
- Admin cannot manage menu extras
- Feature appears implemented but is effectively disabled

**Evidence:**
- `RUNTIME_API_PROBES.md`
- `RUNTIME_BACKEND_REPORT.md`

---

### 2.2. Reminder scheduler exists but is not automatically wired

**Status:** PARTIALLY CONFIRMED  
**Description:**  
Reminder generation logic exists and works when triggered manually via API, but **automatic scheduling at 00:01 Europe/Zagreb is not wired**.

**Impact:**
- System appears to support reminders
- In reality, reminders will not be sent unless manually triggered
- High risk of “silent failure” in production

---

## 3. API & ERROR-HANDLING ISSUES

### 3.1. Click & Fix returns 500 instead of validation error

**Status:** CONFIRMED  
**Description:**  
Submitting JSON instead of multipart/form-data to `POST /click-fix` results in a 500 Internal Server Error, although the underlying error is a 406 validation issue.

**Impact:**
- Misleading error responses
- Harder debugging
- Incorrect monitoring alerts

**Evidence:**
- `RUNTIME_API_PROBES.md`
- `RUNTIME_FINDINGS_ADDENDUM.md`

---

## 4. SPECIFICATION DRIFT (DOCS ≠ IMPLEMENTATION)

### 4.1. Header navigation rules violated (HIGH)

**Spec says:**  
Child/detail screens must show a **back button**, not a hamburger menu.

**Reality:**  
`GlobalHeader` always renders a hamburger and explicitly disables back navigation.

**Impact:**  
- Inconsistent UX
- Violates documented navigation contract

---

### 4.2. Admin authentication required by spec but missing in reality (HIGH)

**Spec says:**  
Admin and supervisor roles must be authenticated and enforced.

**Reality:**  
- Admin login UI is a placeholder
- Backend relies on TODO comments or headers
- No enforcement exists

---

### 4.3. Supervisor-only publish workflow is bypassed (MED)

**Spec says:**  
Only supervisors can publish static pages.

**Reality:**  
Admin UI assumes supervisor role internally and sends supervisor headers without validation.

---

### 4.4. Localization completeness requirement violated (HIGH)

**Spec says:**  
All user-facing strings must exist in HR and EN.

**Reality:**  
Multiple mobile screens contain HR-only strings.

---

### 4.5. Transport admin tooling exists in spec but not in implementation (MED)

**Spec says:**  
Admin can manage transport metadata (contacts, links, notices).

**Reality:**  
- Admin `/transport` route is a placeholder
- No admin transport endpoints exist

---

## 5. TESTING GAPS (STRUCTURAL, NOT BUGS)

### 5.1. Backend
- No integration tests against real Postgres
- No tests verifying route wiring (missing imports would go unnoticed)

### 5.2. Admin
- Playwright exists but not yet part of enforced verification
- No auth/role regression tests

### 5.3. Mobile
- No automated tests at all
- No navigation contract tests
- No localization completeness checks

(See `TEST_GAPS_REPORT.md` for full list.)

---

## 6. ARCHITECTURAL & FUTURE RISKS

### 6.1. Time & timezone logic
- High risk of off-by-one errors
- Scheduler behavior depends on correct wiring and timezone handling

### 6.2. Role & permission logic
- Currently scattered between UI assumptions and backend TODOs
- High likelihood of security regressions if not centralized

### 6.3. CMS dynamic navigation
- Static page blocks can link to arbitrary screen names
- No validation of navigation targets

### 6.4. File uploads & storage
- Click & Fix stores files on local filesystem
- No cleanup, quota, or permission safeguards

---

## 7. CURRENT STATE SUMMARY

**What works reliably:**
- Backend starts cleanly
- Health checks are correct
- Public read APIs generally behave as expected
- Validation exists for many inputs

**What is unsafe or incomplete:**
- Admin security (CRITICAL)
- Menu extras wiring
- Automatic reminder scheduling
- Mobile localization completeness
- CMS permission enforcement

---

## 8. NEXT PHASE (OUT OF SCOPE FOR THIS DOCUMENT)

This document intentionally does NOT:
- propose fixes
- define implementation steps
- prioritize timelines

It exists to ensure that **no known issue is forgotten or re-discovered later**.

Next phases may include:
- Admin E2E runtime verification
- Mobile journey smoke testing
- Security hardening
- Implementation planning

---

## Addendum A — Admin & Mobile Runtime Audit (Prompts 2 & 3)

**Audit period:** 2026-01-09  
**Sources:**  
- Admin UI Runtime Verification  
- Admin UI Security Findings  
- Admin UI Drift Addendum  
- Mobile UX Contract Verification  
- Mobile i18n Findings  
- Mobile Journey Verification  

This addendum consolidates all findings from runtime verification of the Admin UI and Mobile App.  
It translates audit results into actionable work items and risk-aware priorities.

---

## A.1 CRITICAL WORK ITEMS (Must be resolved before public release)

### WI-A1 — Admin Authentication & Authorization (SYSTEMIC GAP)
**Severity:** CRITICAL  
**Area:** Admin UI + Backend  

**Finding Summary:**
- Admin UI has **no enforced login**
- Backend accepts **all admin requests without auth**
- Role model (admin vs supervisor) exists in docs but not in reality
- UI does not send role headers; backend does not check them

**Impact:**
- Anyone can create, edit, delete inbox messages, events, pages
- Anyone can publish content to all users
- No audit trail or accountability

**Required Work:**
- Implement mandatory authentication for all `/admin/*` routes (backend)
- Add route guards in Admin UI (React Router)
- Define and enforce RBAC (admin vs supervisor)
- Decide canonical auth mechanism (token / session / header-based)
- Introduce audit logging for write operations

**Blocking:** YES — blocks any real deployment

---

### WI-A2 — Admin Role Enforcement (Supervisor vs Admin)
**Severity:** CRITICAL  
**Area:** Admin UI + Backend  

**Finding Summary:**
- Supervisor-only actions are visible and usable by everyone:
  - Publish / unpublish pages
  - Add blocks
- No role checks exist at UI or backend level

**Required Work:**
- Explicitly define supervisor-only actions
- Enforce role checks in backend first, UI second
- Hide or disable supervisor controls for non-supervisors
- Align documentation with actual behavior

---

## A.2 HIGH PRIORITY WORK ITEMS

### WI-A3 — Mobile Internationalization (i18n Not Implemented)
**Severity:** HIGH  
**Area:** Mobile App  

**Finding Summary:**
- Language selection exists and is persisted
- **Language is never applied**
- ~70 UI strings are hardcoded in Croatian
- English exists only as onboarding secondary text

**Impact:**
- App is effectively Croatian-only post-onboarding
- Visitor user experience is broken for non-Croatian speakers

**Required Work:**
- Choose i18n strategy (custom hook or library)
- Extract all hardcoded strings
- Wire onboarding language to runtime UI
- Implement EN translations for all user-facing text

---

### WI-A4 — Admin API Exposure (Defense-in-Depth Missing)
**Severity:** HIGH  
**Area:** Backend  

**Finding Summary:**
- All admin endpoints accessible without auth
- UI findings confirm backend openness
- No CSRF, no rate limiting, no role verification

**Required Work:**
- Protect admin endpoints at backend level
- Reject unauthenticated requests by default
- Add basic abuse protection (rate limits at minimum)

---

## A.3 MEDIUM PRIORITY WORK ITEMS

### WI-A5 — Mobile Header UX Contract Violation
**Severity:** MEDIUM  
**Area:** Mobile UX  

**Finding Summary:**
- All screens show hamburger menu
- Child screens should show back button per spec
- Navigation relies on iOS swipe-back (non-discoverable)
- Android UX likely broken or confusing

**Required Work:**
- Update GlobalHeader behavior based on `type` prop
- Implement explicit back navigation for child screens
- Document final UX contract clearly

---

### WI-A6 — Admin UI Form & Selector Drift
**Severity:** MEDIUM  
**Area:** Admin UI  

**Finding Summary:**
- Inbox date fields missing or implicit
- Event form selectors inconsistent
- Feedback status controls not clearly exposed
- Tests pass but reveal UX ambiguity

**Required Work:**
- Decide canonical form structures
- Align UI with documentation OR update docs
- Normalize selectors for long-term test stability

---

### WI-A7 — Menu Extras Feature (Dead Feature)
**Severity:** MEDIUM  
**Area:** Admin + Backend  

**Finding Summary:**
- Routes documented but return 404
- Feature appears partially wired but unusable

**Required Work (Decision Needed):**
- Either fully implement menu extras
- Or explicitly deprecate and remove from docs/UI

---

## A.4 LOW PRIORITY / DOCUMENTATION CLEANUP

### WI-A8 — Documentation Drift Consolidation
**Severity:** LOW  
**Area:** Docs  

**Finding Summary:**
- Docs describe features that do not exist (auth, roles)
- Runtime reality differs significantly from spec

**Required Work:**
- Update docs to reflect current baseline
- Mark unimplemented features clearly
- Introduce “Planned / Not Implemented” labels

---

## A.5 SYSTEMIC RISKS IDENTIFIED

| Risk | Description |
|-----|------------|
| False sense of security | Login page exists but provides no protection |
| Spec-driven illusion | Docs imply systems that do not exist |
| Late auth integration | Retrofitting auth later will be costly |
| UX debt compounding | Mobile UX inconsistencies will grow |
| Public misuse risk | Admin misuse is trivial without auth |

---

## A.6 POST-AUDIT BASELINE STATEMENT

As of this audit:
- **Admin system is functionally complete but entirely unsecured**
- **Mobile journeys are logically sound but UX/i18n incomplete**
- **System is NOT production-ready**
- Audit findings are consistent across UI, backend, and mobile


## Addendum B — Cross-System Flow Verification (Prompt 4)

**Audit period:** 2026-01-09  
**Source:** Cross-System Flow Verification (Admin + Backend + Mobile)  
**Branch:** audit/cross-system-flows  

This addendum records the results of full end-to-end verification across all core system flows.
Unlike previous sections, this audit validates **actual runtime behavior across system boundaries**.

---

## B.1 EXECUTIVE SUMMARY

All six critical cross-system flows **PASS end-to-end** at the API and data level.

This confirms that:
- Core domain logic is correctly implemented
- Data persistence is consistent
- Backend APIs correctly serve both Admin and Mobile clients
- There are **no functional blockers** preventing a working application

However:
- All flows currently succeed **without security enforcement**
- Several UI-level behaviors remain **unverified at runtime** (mobile simulator/device)

---

## B.2 VERIFIED FLOWS (FUNCTIONAL BASELINE CONFIRMED)

The following flows were executed successfully from creation to consumption:

| Flow | Description | Result |
|-----|------------|--------|
| Flow 1 | Inbox → Banner → Mobile Inbox Detail | PASS |
| Flow 2 | Feedback → Admin Reply → Mobile Sent | PASS |
| Flow 3 | Click & Fix → Admin → Mobile Sent | PASS |
| Flow 4 | Events → Mobile Calendar → Event Detail | PASS |
| Flow 5 | Static Page → Publish → Mobile Render | PASS |
| Flow 6 | Event Reminder → Inbox → Mobile | PASS |

**Conclusion:**  
From a pure *systems integration* standpoint, MOJ VIS works as intended.

---

## B.3 KEY CONFIRMATIONS (IMPORTANT POSITIVE FINDINGS)

### B.3.1 Domain logic is coherent
- Entity lifecycles (create → update → read) behave consistently
- No data mismatches were observed between Admin, API, and Mobile
- ID propagation across layers works correctly

### B.3.2 Backend API design is solid
- Endpoints return mobile-compatible shapes
- No unexpected response mutations between flows
- Filtering (banners by context, events by date) works correctly

### B.3.3 Reminder mechanism is functionally correct
- Subscription model works
- Reminder generation creates valid inbox messages
- Mobile inbox fetch includes reminders correctly

---

## B.4 KNOWN LIMITATIONS & NON-BLOCKING GAPS

These are **not functional blockers**, but must be tracked.

### WI-B1 — Mobile Banner Tap Deep Link (UI runtime verification missing)
**Severity:** MEDIUM  
**Status:** API verified, Mobile UI not verified  

While the API returns correct banner payloads and message IDs,
the actual **mobile runtime behavior when tapping a banner** was not verified in a simulator/device.

**Risk:**  
Incorrect deep-link handling could break a key emergency communication flow.

**Required Follow-up:**  
- Verify banner tap → InboxDetail navigation in mobile runtime

---

### WI-B2 — Mobile “Sent” Tab Composition (UI runtime verification missing)
**Severity:** MEDIUM  
**Status:** API verified, Mobile UI not verified  

The backend correctly exposes:
- `/feedback/sent`
- `/click-fix/sent`

However, the mobile UI logic that:
- merges
- sorts
- labels
these items was not runtime-verified.

**Required Follow-up:**  
- Verify Sent tab in mobile simulator/device

---

### WI-B3 — Event Reminder Subscription Discoverability
**Severity:** LOW  
**Status:** Functional but UX-dependent  

Reminder delivery requires explicit user subscription.
This is **by design**, but UI discoverability was not audited.

**Risk:**  
Users may never receive reminders if subscription affordance is unclear.

**Required Follow-up:**  
- Review EventDetail UI for subscription toggle clarity

---

## B.5 SECURITY CONTEXT (RECONFIRMED, NOT NEW)

Cross-system verification reconfirms (but does not newly introduce):

- Admin endpoints operate without authentication
- Role-based enforcement exists in code but is not active
- All successful flows currently rely on implicit trust

➡️ These findings map directly to **CRITICAL security work items** already listed in Addendum A.

---

## B.6 POST-PROMPT-4 BASELINE STATEMENT

As of this audit stage:

- **The MOJ VIS system is functionally complete**
- **All core civic workflows work end-to-end**
- **There are no architectural blockers**
- **Security and UX enforcement remain the gating factors for release**

This establishes a clear and important truth:

> The project does not suffer from broken logic —  
> it suffers from missing enforcement and polish.

## Addendum: Security & Quality Audit Findings (Prompts 5 & 6)

**Audit sources:**
- `audit/security-model`
- `audit/test-strategy`

**Status date:** 2025-01-09  
**Overall system state:** ❌ **RELEASE BLOCKED**

This addendum consolidates all findings and required work items identified in Prompts 5 and 6,
covering security, permissions, testing strategy, and release readiness.

---

## A. Critical Security Work Items (P0 – BLOCKING)

These items **must be completed before any production deployment**.
They override all feature development priorities.

---

### WI-S-001 — Enforce Admin Authentication (Backend)

**Severity:** CRITICAL  
**Status:** NOT IMPLEMENTED  
**Sources:** `SECURITY_MODEL_REPORT.md`, `ENDPOINT_EXPOSURE_REPORT.md`

All `/admin/*` endpoints are currently accessible without authentication.

**Required actions:**
- Implement authentication middleware for all `/admin/*` routes
- Reject unauthenticated requests with `401 Unauthorized`
- Remove all logic trusting client-sent headers:
  - `X-Admin-Role`
  - `X-Admin-Municipality`

**Acceptance criteria:**
- Anonymous request to `/admin/*` → `401`
- Valid session token → `200`
- Invalid or expired token → `401`

---

### WI-S-002 — Implement Real Admin Login Flow (UI + Backend)

**Severity:** CRITICAL  
**Status:** NOT IMPLEMENTED  
**Source:** `SECURITY_MODEL_REPORT.md`

Admin login currently exists only visually and bypasses authentication.

**Required actions:**
- Backend:
  - Implement `/auth/login` and `/auth/logout`
  - Persist sessions/tokens with expiry
- Admin UI:
  - Connect login form to backend auth
  - Store token securely
  - Remove navigation bypass on submit

**Blocking note:**  
No security testing or release is possible until this is implemented.

---

### WI-S-003 — Remove Supervisor Concept (Canonical Role Cleanup)

**Severity:** HIGH  
**Status:** PARTIALLY IMPLEMENTED (incorrect)  
**Sources:** `PERMISSION_MATRIX.md`, `SECURITY_MODEL_REPORT.md`

The "supervisor" role is **not part of the canonical model**.

**Required actions:**
- Remove `isSupervisor = true` hardcoding in Admin UI
- Remove supervisor-based logic in backend
- Align all permissions to a single **Admin** role

**Outcome:**  
All authenticated admins have equal privileges.

---

### WI-S-004 — Stop Trusting Client-Sent Security Headers

**Severity:** CRITICAL  
**Status:** NOT IMPLEMENTED  
**Source:** `ENDPOINT_EXPOSURE_REPORT.md`

Backend currently trusts unverified headers:
- `X-Admin-Role`
- `X-Admin-Municipality`
- `X-Device-ID`

**Required actions:**
- Resolve admin identity and municipality from session only
- Implement device registration and validation for mobile users
- Reject forged or unknown device IDs

---

## B. Test Strategy & Quality Gates (P0–P1)

---

### WI-T-001 — Authentication & Authorization Test Suite

**Priority:** P0  
**Status:** BLOCKED (auth missing)  
**Sources:** `TEST_STRATEGY_REPORT.md`, `TEST_WORK_ITEMS.md`

No security tests exist because authentication is not implemented.

**Required tests (minimum):**
- Anonymous admin access rejection
- Invalid / expired token rejection
- Municipality scoping enforcement
- Permission matrix enforcement

**Release gate:**  
Security test suite must exist and pass.

---

### WI-T-002 — Fix Admin E2E Test Failures

**Priority:** P1  
**Status:** PARTIALLY FAILING  
**Source:** `TEST_STRATEGY_REPORT.md`

Admin Playwright E2E tests currently have selector mismatches.

**Required actions:**
- Fix `data-testid` selectors
- Restore failing Inbox, Feedback, and Click & Fix tests

**Target state:**
- Admin E2E tests fully passing
- Non-blocking until auth implemented

---

### WI-T-003 — Mobile Crash: InboxDetailScreen Tags

**Priority:** P0  
**Status:** FAILING  
**Source:** `TEST_STRATEGY_REPORT.md`

Runtime crash when accessing Inbox detail due to incorrect tag handling.

**Required actions:**
- Fix `message.tags.filter is not a function`
- Add regression test (manual or automated)

**Release impact:**  
Blocks mobile reliability.

---

## C. Test Infrastructure & CI (P1–P2)

---

### WI-Q-001 — CI Pipeline Setup

**Priority:** P1  
**Status:** NOT IMPLEMENTED  
**Source:** `RELEASE_GATES.md`

**Required actions:**
- Run backend unit tests on every PR (blocking)
- Run API smoke tests with PostgreSQL (blocking)
- Run Admin E2E tests (warning-level until selectors fixed)

---

### WI-Q-002 — Mobile Test Coverage (Foundational)

**Priority:** P2  
**Status:** NOT IMPLEMENTED  
**Source:** `TEST_STRATEGY_REPORT.md`

**Required actions:**
- Define minimal mobile test scope (Detox/Appium or manual gates)
- Automate at least one critical journey:
  - Banner → Inbox Detail
  - Feedback submission

---

## D. Release Status Summary

| Area | Status |
|-----|--------|
| Admin authentication | ❌ Missing |
| Admin authorization | ❌ Missing |
| Endpoint protection | ❌ Missing |
| Backend tests | ✅ Strong |
| API smoke tests | ✅ Present |
| Admin E2E tests | ⚠️ Partial |
| Mobile automated tests | ❌ None |
| CI/CD | ❌ Not configured |

**Overall release status:** ❌ **BLOCKED**

---

## E. Implementation Order (Mandatory)

1. WI-S-002 — Admin login + sessions  
2. WI-S-001 — Backend auth middleware  
3. WI-S-004 — Header trust removal  
4. WI-S-003 — Supervisor removal  
5. WI-T-001 — Security test suite  
6. WI-T-003 — Mobile crash fix  
7. WI-T-002 — Admin E2E stabilization  
8. WI-Q-001 — CI pipeline  
9. WI-Q-002 — Mobile test foundation


