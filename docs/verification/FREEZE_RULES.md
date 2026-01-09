# Freeze Rules - MOJ VIS

**Date:** 2025-01-09
**Source:** `docs/todo/01Post-Audit-Baseline.md`
**Purpose:** Non-negotiable rules during implementation phases

---

## Purpose

These rules prevent scope creep, rework, and security regressions during the security remediation phases. They are **non-negotiable** until Phase 5 is complete.

---

## Rule Categories

| Category | Applies From | Applies Until |
|----------|--------------|---------------|
| Feature Freeze | Phase 0 | Phase 5 complete |
| Schema Freeze | Phase 1 | Phase 5 complete |
| Security Atomicity | Phase 1 | Phase 2 complete |
| Test Gate | Phase 3 | Permanent |
| UI Freeze | Phase 1 | Phase 4 complete |

---

## Rule 1: No New Features

**Rule:** No new user-facing features may be added until Phase 5 is complete.

**Applies:** Phase 0 → Phase 5

**Definition of "new feature":**
- Any functionality not in current production code
- Any endpoint not currently implemented
- Any UI capability not currently working

**Allowed:**
- Bug fixes
- Security implementation
- Test additions
- Documentation updates that reflect reality

**Enforcement:**
- PRs adding new features will be rejected
- Feature requests go to post-release backlog
- No exceptions without written justification and team lead approval

---

## Rule 2: No Schema Changes (Except Auth)

**Rule:** No database schema changes except those required for authentication.

**Applies:** Phase 1 → Phase 5

**Allowed schema changes:**
- `admin_users` table (Phase 1)
- `sessions` table (Phase 1)
- Indexes on auth-related tables

**Forbidden schema changes:**
- New entity tables
- Column additions to existing tables
- Relationship changes
- Enum modifications

**Enforcement:**
- Migration files reviewed for auth-only changes
- Non-auth migrations rejected
- Existing migration files frozen

---

## Rule 3: Security Implementation is Atomic

**Rule:** Authentication and authorization must be implemented completely before any other work proceeds.

**Applies:** Phase 1 → Phase 2

**Atomic unit includes:**
- Backend auth middleware
- Login/logout endpoints
- Session management
- Admin UI auth integration
- Route guards
- Header trust removal
- Permission enforcement

**Forbidden:**
- Partial auth (e.g., middleware without UI)
- Auth bypass for "testing"
- Temporary security holes
- "We'll add tests later"

**Enforcement:**
- Phase 1 cannot exit until all auth components work
- Phase 2 cannot exit until permissions enforced
- No work on Phase 4/5 until Phase 3 security tests pass

---

## Rule 4: No Endpoint Without Test

**Rule:** Any new endpoint must have corresponding test coverage before merge.

**Applies:** Phase 1 → Permanent

**Required for new endpoints:**
- Unit test for happy path
- Unit test for auth rejection (401)
- Integration test if DB-touching

**Enforcement:**
- PRs without tests rejected
- Test coverage verified in code review
- CI will block (once configured in Phase 5)

---

## Rule 5: No UI Redesign

**Rule:** No visual or structural UI changes except functional fixes.

**Applies:** Phase 1 → Phase 4

**Allowed:**
- Adding `data-testid` attributes
- Fixing broken form fields
- Removing supervisor-specific UI (Phase 2)
- i18n string extraction (Phase 4)

**Forbidden:**
- Layout restructuring
- New components
- Style changes
- Navigation pattern changes (except WI-A5)

**Enforcement:**
- UI PRs reviewed for scope creep
- Changes limited to specific WI items
- Cosmetic-only PRs rejected

---

## Rule 6: Documentation Follows Implementation

**Rule:** Documentation changes must reflect implementation reality, not aspirational features.

**Applies:** Phase 0 → Phase 5

**Allowed:**
- Marking unimplemented features as "Planned"
- Updating docs when implementation changes them
- Adding "Current State" sections

**Forbidden:**
- Writing specs for unbuilt features
- Removing documentation of working features
- Documentation-driven development

**Enforcement:**
- Doc PRs reviewed for accuracy
- Discrepancies between docs and code flagged
- Post-implementation doc updates required

---

## Rule 7: No Third-Party Additions

**Rule:** No new external dependencies or services.

**Applies:** Phase 1 → Phase 5

**Forbidden:**
- New npm packages (except testing utilities)
- External API integrations
- Cloud service additions
- Auth provider integrations (build in-house first)

**Allowed:**
- Testing libraries (Jest, Playwright, etc.)
- Dev tooling (linters, formatters)

**Enforcement:**
- `package.json` changes reviewed
- New dependencies require justification
- Preference for zero-dependency solutions

---

## Rule 8: Branch Discipline

**Rule:** All implementation work branches from and merges to defined integration points.

**Applies:** Phase 0 → Phase 5

**Branch structure:**
```
main (stable)
├── security/phase-1 (auth work)
├── security/phase-2 (permissions work)
├── security/phase-3 (tests)
├── ux/phase-4 (i18n, fixes)
└── ci/phase-5 (automation)
```

**Rules:**
- Phase branches merge to main only when phase complete
- No cross-phase merges
- No direct commits to main
- Rebase before merge

**Enforcement:**
- Branch protection on main
- PR required for all changes
- Phase lead approves merges

---

## Rule 9: Exit Criteria are Non-Negotiable

**Rule:** A phase is not complete until ALL exit criteria are verified.

**Applies:** All phases

**Verification required:**
- Checklist items completed
- Manual verification performed
- Tests passing (where applicable)
- Documentation updated

**Forbidden:**
- "Good enough" exits
- Partial phase completion
- Skipping criteria for speed

**Enforcement:**
- Exit criteria checklist in PR
- Team lead sign-off required
- No phase advancement without completion

---

## Rule 10: Security Bypass is Forbidden

**Rule:** No code that bypasses security for convenience.

**Applies:** Phase 1 → Permanent

**Forbidden patterns:**
```typescript
// FORBIDDEN: Auth bypass
if (process.env.NODE_ENV === 'development') {
  // skip auth
}

// FORBIDDEN: Hardcoded credentials
const ADMIN_PASSWORD = 'admin123';

// FORBIDDEN: Trusted headers
const role = request.headers['x-admin-role']; // Don't trust this

// FORBIDDEN: Auth comments
// TODO: Add auth later
```

**Enforcement:**
- Code review catches bypasses
- Static analysis for patterns
- Security review required for auth code

---

## Summary Table

| Rule | Short Name | Phase Range | Enforcement |
|------|------------|-------------|-------------|
| 1 | No New Features | 0-5 | PR rejection |
| 2 | Schema Freeze | 1-5 | Migration review |
| 3 | Security Atomic | 1-2 | Phase gates |
| 4 | Tests Required | 1+ | PR rejection |
| 5 | No UI Redesign | 1-4 | PR rejection |
| 6 | Docs Follow Code | 0-5 | PR review |
| 7 | No Third-Party | 1-5 | Dependency review |
| 8 | Branch Discipline | 0-5 | Branch protection |
| 9 | Exit Criteria | All | Team lead sign-off |
| 10 | No Security Bypass | 1+ | Code review |

---

## Exception Process

Exceptions to freeze rules are possible but require:

1. **Written justification** explaining why rule must be broken
2. **Risk assessment** of breaking the rule
3. **Team lead approval** before work begins
4. **Documentation** of exception in PR description
5. **Commitment** to address technical debt post-release

Exceptions are rare. The default is **NO**.

---

## Related Documents

- `docs/verification/IMPLEMENTATION_PLAN.md` - Phase definitions
- `docs/verification/KILL_LIST.md` - Explicit non-goals
- `docs/verification/IMPLEMENTATION_RISKS.md` - Why these rules exist
