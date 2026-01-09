# Kill List - MOJ VIS

**Date:** 2025-01-09
**Source:** `docs/todo/01Post-Audit-Baseline.md`
**Purpose:** Explicit non-goals for the security & stability release

---

## Purpose of This Document

This Kill List defines what is **explicitly forbidden** for the next release cycle. These items are deferred until security and stability are achieved.

**Key Principle:** Everything on this list is frozen until Phases 0-5 are complete and the system is production-ready.

---

## Category 1: New Features (FORBIDDEN)

### KILL-F1: Menu Extras Implementation

**What:** Full implementation of Menu Extras feature (WI-A7)

**Current state:**
- Route files exist but are not wired in `backend/src/index.ts`
- Endpoints return 404
- Feature is effectively disabled

**Why killed:**
- Feature work during security remediation creates scope creep
- Routes can be wired after security is complete
- Zero user impact (feature never worked)

**When reconsidered:** Post-release, after Phase 5 complete

---

### KILL-F2: Transport Admin Tooling

**What:** Admin management of transport metadata (contacts, links, notices)

**Current state:**
- Documented in spec
- Admin route is a placeholder
- No admin transport endpoints exist

**Why killed:**
- New feature development
- Transport data is read-only and currently sufficient
- No user-facing impact

**When reconsidered:** Post-release backlog

---

### KILL-F3: CMS Enhancements

**What:** Any new CMS capabilities beyond current static pages

**Current state:**
- Static pages work end-to-end
- Block types are sufficient for current needs

**Why killed:**
- Feature expansion during security work
- Existing functionality is adequate
- Risk of introducing new attack surface

**When reconsidered:** Post-release backlog

---

### KILL-F4: Push Notification Expansion

**What:** Any changes to push notification system beyond current HITNO flow

**Current state:**
- HITNO messages trigger push correctly
- Push infrastructure works

**Why killed:**
- Works as designed
- Changes risk breaking working system
- Not related to security remediation

**When reconsidered:** Post-release

---

## Category 2: UX Redesign (FORBIDDEN)

### KILL-U1: Admin UI Visual Redesign

**What:** Any visual/design changes to Admin UI beyond functional fixes

**Why killed:**
- Cosmetic changes during security work create merge conflicts
- Current UI is functional
- Test selectors will break if UI restructured

**Allowed:**
- Adding `data-testid` attributes (testing requirement)
- Fixing broken forms (functional)

**Forbidden:**
- Layout changes
- New color schemes
- Component restructuring

**When reconsidered:** Post-release design sprint

---

### KILL-U2: Mobile Navigation Overhaul

**What:** Major restructuring of mobile navigation beyond header fix (WI-A5)

**Why killed:**
- Risk of breaking working flows
- Navigation works via iOS swipe-back
- Major changes require extensive manual testing

**Allowed:**
- Adding back button to GlobalHeader (WI-A5)
- Fixing crashes

**Forbidden:**
- New navigation patterns
- Tab restructuring
- Deep link changes

**When reconsidered:** Post-release UX review

---

### KILL-U3: Onboarding Flow Changes

**What:** Any changes to onboarding flow

**Current state:**
- Onboarding works correctly
- Language selection persists (though not applied - WI-A3)

**Why killed:**
- Working flow
- Changes risk breaking first-run experience
- i18n fix (WI-A3) does not require onboarding changes

**When reconsidered:** Post-release

---

## Category 3: Performance Optimization (DEFERRED)

### KILL-P1: Database Query Optimization

**What:** Query performance improvements, indexing changes

**Why killed:**
- No reported performance issues
- Schema changes during security work are risky
- Optimization without benchmarks is guessing

**When reconsidered:** After performance baseline established post-release

---

### KILL-P2: Bundle Size Optimization

**What:** Frontend bundle analysis and reduction

**Why killed:**
- No reported load time issues
- Risk of breaking working code
- Low priority vs. security

**When reconsidered:** Post-release performance sprint

---

### KILL-P3: API Response Caching

**What:** Adding caching layers to API responses

**Why killed:**
- New infrastructure during security work
- Risk of serving stale data
- Complexity without clear benefit

**When reconsidered:** Post-release infrastructure review

---

## Category 4: Infrastructure Changes (DEFERRED)

### KILL-I1: Database Schema Changes

**What:** Any schema changes beyond admin users table for auth

**Allowed:**
- Admin users table (auth requirement)
- Sessions table (auth requirement)

**Forbidden:**
- New entity tables
- Column additions to existing tables
- Index changes (except for auth tables)

**Why killed:**
- Schema changes require migration testing
- Risk of data loss
- Merge conflicts with security work

**When reconsidered:** Post-release

---

### KILL-I2: Third-Party Service Integration

**What:** Adding any new external service dependencies

**Why killed:**
- New attack surface
- Integration complexity during security work
- Dependency risk

**When reconsidered:** Post-release architecture review

---

### KILL-I3: File Storage Migration

**What:** Moving Click & Fix uploads to cloud storage

**Current state:**
- Files stored on local filesystem
- Works but not production-scale

**Why killed:**
- Infrastructure change during security work
- Requires credential management
- Can be addressed post-release

**When reconsidered:** Production infrastructure planning

---

## Category 5: Lower-Priority Verification (DEFERRED)

### KILL-V1: Mobile Banner Deep Link Verification (WI-B1)

**What:** Full mobile runtime verification of banner tap → detail flow

**Current state:**
- API verified to return correct data
- Mobile UI behavior not runtime-tested

**Why killed:**
- API-level flow works
- Full mobile verification requires device testing
- Lower priority than security

**When reconsidered:** Phase 5 or post-release QA

---

### KILL-V2: Mobile Sent Tab Composition (WI-B2)

**What:** Full verification of Feedback + Click & Fix merge in Sent tab

**Current state:**
- APIs work correctly
- UI composition not runtime-verified

**Why killed:**
- Functional at API level
- UI verification is lower priority
- Manual testing can catch issues

**When reconsidered:** Post-release QA

---

### KILL-V3: Event Reminder Discoverability (WI-B3)

**What:** UX audit of subscription toggle visibility

**Current state:**
- Reminder system works
- UX discoverability unaudited

**Why killed:**
- Functional feature
- UX polish, not blocking issue
- Lower priority

**When reconsidered:** Post-release UX review

---

## Category 6: Documentation (DEFERRED EXCEPT CRITICAL)

### KILL-D1: Comprehensive Documentation Rewrite

**What:** Full rewrite of all specification documents

**Allowed:**
- WI-A8: Mark unimplemented features as "Planned"
- Update docs when implementation changes them

**Forbidden:**
- Rewriting specs that describe working features
- Adding new feature specifications
- Documentation-driven development

**Why killed:**
- Doc work during implementation creates drift
- Docs should follow implementation, not lead
- Risk of conflicting truth sources

**When reconsidered:** Post-release documentation sprint

---

## Kill List Summary

| ID | Item | Category | Reconsider When |
|----|------|----------|-----------------|
| KILL-F1 | Menu Extras | Feature | Post-release |
| KILL-F2 | Transport Admin | Feature | Post-release |
| KILL-F3 | CMS Enhancements | Feature | Post-release |
| KILL-F4 | Push Expansion | Feature | Post-release |
| KILL-U1 | Admin Visual Redesign | UX | Post-release |
| KILL-U2 | Mobile Nav Overhaul | UX | Post-release |
| KILL-U3 | Onboarding Changes | UX | Post-release |
| KILL-P1 | DB Optimization | Performance | Post-release |
| KILL-P2 | Bundle Size | Performance | Post-release |
| KILL-P3 | API Caching | Performance | Post-release |
| KILL-I1 | Schema Changes | Infrastructure | Post-release |
| KILL-I2 | Third-Party Services | Infrastructure | Post-release |
| KILL-I3 | File Storage | Infrastructure | Post-release |
| KILL-V1 | Banner Deep Link | Verification | Phase 5 |
| KILL-V2 | Sent Tab Composition | Verification | Post-release |
| KILL-V3 | Reminder UX | Verification | Post-release |
| KILL-D1 | Doc Rewrite | Documentation | Post-release |

---

## Enforcement

Any attempt to work on killed items during Phases 0-5 must be:

1. Explicitly justified in writing
2. Approved by team lead
3. Documented as exception with risk acknowledgment

The default answer to "can we add X?" during security remediation is **NO**.

---

## Related Documents

- `docs/verification/IMPLEMENTATION_PLAN.md` - What IS being done
- `docs/verification/FREEZE_RULES.md` - How to prevent scope creep
- `docs/todo/01Post-Audit-Baseline.md` - Source of truth
