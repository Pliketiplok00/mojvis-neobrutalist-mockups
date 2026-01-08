# MOJ VIS — TESTING BIBLE

**Status:** PERMANENT, BINDING REFERENCE
**Effective:** From this commit onward
**Scope:** All implementation work in this repository

This document defines the mandatory testing protocol for the MOJ VIS project.
All developers, AI assistants, and contributors MUST follow these rules.

If any instruction conflicts with this document, STOP and ask for clarification.

---

## A) Testing Philosophy

### Test-first / Test-in-parallel

- Tests are written **before or alongside** implementation, never after.
- Code without tests is considered **incomplete**.
- Untested flows are considered **broken** until proven otherwise.

### Definition of "Done"

A feature, phase, or task is NOT done unless:

1. All required tests exist
2. All tests pass
3. Logs have been inspected with no errors
4. iOS simulator runs the app without crashes or red screens
5. All defined journey paths are navigable
6. No known errors remain

### Zero Tolerance for Silent Failures

- Errors must never be swallowed or ignored.
- Console warnings must be investigated.
- "It seems to work" is not acceptable — it must be verified.

---

## B) Test Types (Explicit)

### 1. Installation & Environment Tests

**Purpose:** Verify the development environment is correctly set up.

**Checks:**
- [ ] All dependencies install without errors (`npm install` / `yarn`)
- [ ] No peer dependency conflicts
- [ ] Build completes successfully (`npm run build`)
- [ ] Development server starts (`npm run dev`)
- [ ] No TypeScript compilation errors
- [ ] No ESLint errors blocking execution

**When to run:** After initial setup, after dependency changes.

---

### 2. Backend Tests

**Purpose:** Verify the API server is functional.

**Checks:**
- [ ] Server starts without errors
- [ ] Health endpoint responds (e.g., `GET /health` returns 200)
- [ ] Database connection is established
- [ ] Environment variables are loaded correctly
- [ ] No unhandled promise rejections on startup

**When to run:** Before any API implementation, after any backend change.

---

### 3. Database Tests

**Purpose:** Verify database connectivity and schema integrity.

**Checks:**
- [ ] Database connection succeeds
- [ ] Migrations run without errors
- [ ] Schema matches expected structure (tables exist, columns correct)
- [ ] Basic CRUD operations work (insert, select, update, delete)
- [ ] Foreign key constraints are enforced
- [ ] Required indexes exist

**When to run:** After schema changes, after migration additions.

---

### 4. API Tests

**Purpose:** Verify API endpoints respond correctly.

**Checks:**
- [ ] Endpoints return expected status codes (200, 201, 400, 404, etc.)
- [ ] Response shapes match expected contracts
- [ ] Validation errors return proper error responses
- [ ] Rate limiting works as specified
- [ ] HR/EN content is returned correctly based on request
- [ ] Authentication (admin endpoints) works correctly

**When to run:** After any endpoint implementation or modification.

---

### 5. Mobile App Tests

**Purpose:** Verify the mobile app boots and runs without errors.

**Checks:**
- [ ] App compiles for iOS and Android
- [ ] iOS simulator launches the app
- [ ] App boots to expected initial screen (onboarding or home)
- [ ] No red error screen appears
- [ ] No console errors in Metro bundler
- [ ] No runtime exceptions in simulator logs

**When to run:** After any mobile code change, before marking any mobile work complete.

---

### 6. Journey / Flow Tests

**Purpose:** Verify user journeys work end-to-end.

**Required Journeys:**

1. **Onboarding Flow**
   - App launch → Language selection → User mode → Municipality (if local) → Home

2. **Inbox Flow**
   - Home → Inbox icon → Inbox list → Message detail → Back to Inbox → Back to Home

3. **Events Flow**
   - Home/Menu → Events → Calendar → Select day → Event list → Event detail → Back

4. **Transport Flow (Road)**
   - Menu → Transport → Road → Line list → Line detail → Expand departure → Back

5. **Transport Flow (Sea)**
   - Menu → Transport → Sea → Line list → Line detail → Expand departure → Back

6. **Feedback Flow**
   - Home/Menu → Feedback → Fill form → Submit → Confirmation → Home

7. **Click & Fix Flow**
   - Menu → Click & Fix → Location → Description → Submit → Confirmation → Home

8. **Static Page Flow**
   - Menu → Static page → Scroll content → Back

**Checks:**
- [ ] Each journey completes without errors
- [ ] Back navigation returns to correct previous screen
- [ ] No dead ends (every screen has a way out)
- [ ] Banners tap through to Inbox detail correctly

**When to run:** After implementing each journey, before phase completion.

---

### 7. Localization Tests

**Purpose:** Verify HR/EN localization is complete and functional.

**Checks:**
- [ ] All UI strings exist in both HR and EN
- [ ] Language switching works (Settings or onboarding)
- [ ] Content displays in selected language
- [ ] No missing string placeholders visible (e.g., "translation.missing")
- [ ] No hardcoded strings in components
- [ ] Empty states have both languages
- [ ] Error messages have both languages

**When to run:** After any UI text addition, before phase completion.

---

### 8. Routing & Linking Tests

**Purpose:** Verify all navigation paths are valid.

**Checks:**
- [ ] All menu items navigate to valid screens
- [ ] All list items navigate or expand as expected
- [ ] All buttons perform their intended action
- [ ] No 404 or "screen not found" errors
- [ ] Deep links resolve to correct screens (when implemented)
- [ ] Banner taps always open Inbox message detail

**When to run:** After navigation changes, before phase completion.

---

## C) Logging Rules

### What Must Be Logged

**Startup:**
- Server start confirmation with port
- Database connection status
- Environment mode (development/production)

**Errors:**
- All caught exceptions with stack traces
- Validation failures with context
- Database query failures
- Rate limit violations
- Authentication failures (admin)

**Critical Flows:**
- Reminder generation runs
- Feedback/Click & Fix submissions
- Static page publish events
- Admin actions (for audit log)

### Log Levels

| Level | Use Case |
|-------|----------|
| `error` | Exceptions, failures, things that need immediate attention |
| `warn` | Recoverable issues, deprecations, suspicious behavior |
| `info` | Normal operations (startup, shutdown, key events) |
| `debug` | Detailed information for troubleshooting (dev only) |

### Log Inspection Requirement

After every run (server start, test suite, simulator launch):

1. **Check the console/terminal output**
2. **Look for any `error` or `warn` level messages**
3. **If errors exist, STOP and fix before proceeding**
4. **Document any warnings that are intentionally ignored (with justification)**

### Log Format

Logs should include:
- Timestamp
- Level
- Message
- Context (request ID, user ID, entity ID where applicable)

---

## D) Error Handling Rules

### Runtime Errors

- Any runtime error MUST be surfaced, not ignored.
- `try/catch` blocks must log errors, not swallow them silently.
- Unhandled promise rejections must crash or log loudly.

### Errors in Logs

- Any error found in logs MUST be fixed immediately.
- Do not proceed to the next task with known errors.
- Do not mark a phase complete with errors in logs.

### No TODOs for Failing Tests

- If a test fails, fix it now.
- Do not add `// TODO: fix this test` and move on.
- Do not skip tests to make the suite pass.

### Error Response Contract

API errors must return structured responses:

```json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Human-readable description",
  "details": {}
}
```

Client errors (4xx) and server errors (5xx) must be distinguishable.

---

## E) iOS Simulator Gate

### Mandatory Checkpoint

Work may ONLY be reported as complete if:

1. **iOS simulator runs** — The simulator launches without Xcode errors
2. **App boots without errors** — No red screen, no crash on launch
3. **All defined journey paths are navigable** — Every flow can be completed
4. **No runtime or console errors remain** — Metro bundler console is clean

### Simulator Test Procedure

1. Start Metro bundler (`npm start` or `yarn start`)
2. Launch iOS simulator (`npm run ios` or via Xcode)
3. Wait for app to fully load
4. Check Metro console for errors
5. Navigate through all implemented journeys
6. Check simulator console (Xcode or `xcrun simctl`) for runtime errors
7. Only if all checks pass, mark work as complete

### Blocking Issues

If the simulator fails to run:
- This is a **blocker**
- Do not proceed with other work
- Fix the simulator issue first
- Report the blocker explicitly if unable to resolve

---

## F) Definition of "Blocked"

### What Constitutes a Blocker

- Dependency that won't install
- Build that won't compile
- Simulator that won't launch
- Test that fails for unknown reasons
- External service unavailable
- Missing credentials or environment variables
- Hardware/platform limitation

### How to Handle Blockers

1. **Stop work on the blocked task**
2. **Document the blocker explicitly:**
   - What you were trying to do
   - What error or failure occurred
   - What you tried to fix it
   - Why it remains unresolved
3. **Do not guess or assume workarounds**
4. **Report the blocker clearly** — "This is blocked because X"
5. **Move to unblocked work if available**, or wait for resolution

### Forbidden Responses to Blockers

- "This should work" — No. Verify it works.
- "I'll fix this later" — No. Fix it now or report it blocked.
- "It's probably fine" — No. Test it.
- Proceeding without acknowledging the blocker — Absolutely not.

---

## G) Continuous Testing Requirement

### During Implementation

While implementing any feature:

1. Write tests alongside implementation
2. Run tests repeatedly (not just once at the end)
3. Inspect logs after each run
4. Extract and read errors
5. Fix errors immediately before continuing

### Forbidden Practices

- Accumulating known errors
- Saying "this should work" without verification
- Deferring failing tests
- Batch-fixing errors at the end

### Test-Fix Loop

```
Write code → Run tests → Check logs → Error found?
  ├── Yes → STOP → Fix → Re-run tests → Repeat
  └── No → Continue to next piece of code
```

---

## H) Reporting Requirements (Every Phase)

### Phase Completion Report

At the end of each phase, provide a Markdown report containing:

1. **What was implemented** — List of features/components
2. **What tests were written** — List of test files/cases
3. **What was tested manually** — Journey paths verified
4. **What logs were checked** — Confirm logs were inspected
5. **Confirmation that no errors remain** — Explicit statement

### Report Template

```markdown
## Phase X Completion Report

### Implemented
- [List items]

### Tests Written
- [List test files]

### Manual Testing
- [x] Journey A verified
- [x] Journey B verified

### Logs Checked
- [x] Server startup logs — no errors
- [x] Metro bundler console — no errors
- [x] iOS simulator console — no errors

### Status
All tests pass. No known errors. Phase complete.
```

### Incomplete Phase

If ANY known error remains:
- The phase is NOT complete
- Do not report it as complete
- Fix the errors or report them as blockers

---

## I) Enforcement

### Immutability

This Testing Bible is **immutable** unless explicitly told to change it.
All future work in this repository must comply with these rules.

### Conflict Resolution

If any instruction conflicts with this Testing Bible:
1. STOP
2. Do not proceed with the conflicting instruction
3. Ask for clarification
4. Only proceed after explicit resolution

### Accountability

Every commit, every PR, every phase completion must demonstrate:
- Tests were written
- Tests were run
- Logs were checked
- No errors remain

---

## J) Quick Reference Checklist

Before marking ANY work complete:

- [ ] All required tests exist
- [ ] All tests pass
- [ ] Logs inspected — no errors
- [ ] iOS simulator runs
- [ ] App boots without errors
- [ ] All journeys navigable
- [ ] No console errors
- [ ] HR/EN strings present
- [ ] No dead-end navigation
- [ ] Phase report written

---

**This document is the law. Follow it.**
