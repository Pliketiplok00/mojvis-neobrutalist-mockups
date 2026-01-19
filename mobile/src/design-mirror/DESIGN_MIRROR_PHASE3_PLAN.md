# Design Mirror Phase 3 - Implementation Plan

> Created: 2026-01-19
> Based on: `DESIGN_MIRROR_SCREENLIST.md` (canonical source)
> Rule: Max 3 screens per implementation PR

---

## Current State

| Metric | Value |
|--------|-------|
| Total routed screens | 22 |
| Currently mirrored | 2 (RoadTransport, SeaTransport) |
| Coverage | 9.1% |
| Remaining to mirror | 20 |

---

## Implementation Strategy

### Priority Order
1. **Static/Info screens** - Simple, low-complexity, good for establishing patterns
2. **Settings** - Dev entry point, verifies navigation works
3. **Lists (Events, Inbox)** - List patterns, API data shapes
4. **Transport (remaining)** - Complete transport family
5. **Forms (Feedback, ClickFix)** - Complex forms, lower priority
6. **Home** - After all sections mirrored, mirror home last
7. **Onboarding** - Excluded (one-time flow, low audit value)
8. **Dev** - Excluded (UiInventory is already a dev tool)

---

## Batch Plan

### Batch A - Static & Settings (3 screens)

**PR: `feat/design-mirror-batch-a`**

| # | Route | Screen | Fixture needs |
|---|-------|--------|---------------|
| 1 | StaticPage | StaticPageScreen | Static page content fixture |
| 2 | Settings | SettingsScreen | User prefs fixture (optional) |
| 3 | TransportHub | TransportHubScreen | None (static links) |

**Goal:** Establish patterns for simple screens, verify Settings dev entry.

---

### Batch B - Events (2 screens)

**PR: `feat/design-mirror-batch-b`**

| # | Route | Screen | Fixture needs |
|---|-------|--------|---------------|
| 1 | Events | EventsScreen | Events list fixture |
| 2 | EventDetail | EventDetailScreen | Single event fixture |

**Goal:** List + detail pattern for events.

---

### Batch C - Inbox (2 screens)

**PR: `feat/design-mirror-batch-c`**

| # | Route | Screen | Fixture needs |
|---|-------|--------|---------------|
| 1 | Inbox | InboxListScreen | Messages list fixture |
| 2 | InboxDetail | InboxDetailScreen | Single message fixture |

**Goal:** List + detail pattern for inbox.

---

### Batch D - Transport Detail (2 screens)

**PR: `feat/design-mirror-batch-d`**

| # | Route | Screen | Fixture needs |
|---|-------|--------|---------------|
| 1 | RoadLineDetail | RoadLineDetailScreen | Line detail fixture, departures |
| 2 | SeaLineDetail | SeaLineDetailScreen | Line detail fixture, departures |

**Goal:** Complete transport family coverage.

---

### Batch E - Feedback (3 screens)

**PR: `feat/design-mirror-batch-e`**

| # | Route | Screen | Fixture needs |
|---|-------|--------|---------------|
| 1 | FeedbackForm | FeedbackFormScreen | Form state fixtures |
| 2 | FeedbackConfirmation | FeedbackConfirmationScreen | Submission response fixture |
| 3 | FeedbackDetail | FeedbackDetailScreen | Single feedback fixture |

**Goal:** Form + confirmation + detail pattern.

---

### Batch F - ClickFix (3 screens)

**PR: `feat/design-mirror-batch-f`**

| # | Route | Screen | Fixture needs |
|---|-------|--------|---------------|
| 1 | ClickFixForm | ClickFixFormScreen | Form state fixtures |
| 2 | ClickFixConfirmation | ClickFixConfirmationScreen | Submission response fixture |
| 3 | ClickFixDetail | ClickFixDetailScreen | Single report fixture |

**Goal:** Form + confirmation + detail pattern.

---

### Batch G - Home (1 screen)

**PR: `feat/design-mirror-batch-g`**

| # | Route | Screen | Fixture needs |
|---|-------|--------|---------------|
| 1 | Home | HomeScreen | Combined fixtures (all sections) |

**Goal:** Mirror home screen with all section summaries.

---

## Excluded from Mirroring

| Route | Reason |
|-------|--------|
| LanguageSelection | Onboarding - one-time flow |
| UserModeSelection | Onboarding - one-time flow |
| MunicipalitySelection | Onboarding - one-time flow |
| UiInventory | Already a dev tool |

---

## Summary

| Batch | Screens | Cumulative | Coverage % |
|-------|---------|------------|------------|
| Current | 2 | 2 | 9.1% |
| Batch A | 3 | 5 | 22.7% |
| Batch B | 2 | 7 | 31.8% |
| Batch C | 2 | 9 | 40.9% |
| Batch D | 2 | 11 | 50.0% |
| Batch E | 3 | 14 | 63.6% |
| Batch F | 3 | 17 | 77.3% |
| Batch G | 1 | 18 | 81.8% |
| **Final** | **18** | **18** | **81.8%** |

Note: 4 screens excluded (3 onboarding + 1 dev) = 18/22 max coverage.

---

## Fixture File Plan

| Fixture file | Batches using | Contents |
|--------------|---------------|----------|
| `fixtures/transport.ts` | (existing) | Sea/road lines, departures, menu items |
| `fixtures/static.ts` | A | Static page content samples |
| `fixtures/events.ts` | B | Events list, single event |
| `fixtures/inbox.ts` | C | Messages list, single message |
| `fixtures/transport-detail.ts` | D | Line detail, route stops, departures |
| `fixtures/feedback.ts` | E | Form state, submission response |
| `fixtures/clickfix.ts` | F | Form state, submission response |
| `fixtures/home.ts` | G | Home section summaries |

---

## Implementation Rules (per batch)

1. Create fixture file(s) first
2. Create mirror screen(s) using only fixtures (no API calls)
3. Mirror must use skin tokens only (no hardcoded values)
4. Run typecheck + design-guard before PR
5. Update DESIGN_MIRROR_SCREENLIST.md coverage status
6. Max 3 screens per PR
