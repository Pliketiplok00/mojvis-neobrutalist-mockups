# Banner Phase 1: Facts and Questions

**Date**: 2026-01-09
**Type**: READ-ONLY audit (no code changes)
**Purpose**: Document current banner implementation and identify open decisions

---

## A. Tag Taxonomy

### A1. Where is tag taxonomy defined?

| Layer | File Path | Export |
|-------|-----------|--------|
| Backend | `backend/src/types/inbox.ts:18-26` | `INBOX_TAGS` (const array) + `InboxTag` (type) |
| Admin | `admin/src/types/inbox.ts:11-19` | `INBOX_TAGS` (const array) + `InboxTag` (type) |
| Mobile | `mobile/src/types/inbox.ts:10-17` | `InboxTag` (union type only, no const array) |
| Database | `backend/src/db/migrations/001_inbox_messages.sql:12-20` | `inbox_tag` (PostgreSQL ENUM) |

**Finding**: Tags are defined in 4 places. Backend, admin, and DB are synchronized. Mobile only has the type union (no runtime const).

### A2. Full tag list (7 tags)

```typescript
export const INBOX_TAGS = [
  'cestovni_promet',  // road transport
  'pomorski_promet',  // sea transport
  'kultura',          // culture
  'opcenito',         // general
  'hitno',            // emergency/urgent
  'komiza',           // municipal - Komiža
  'vis',              // municipal - Vis
] as const;
```

### A3. Is tag order meaningful?

**No.** Tags are stored as an unordered PostgreSQL array (`inbox_tag[]`). Order in the constant is for documentation only.

### A4. Max 2 tags enforcement

| Location | Enforcement | Mechanism |
|----------|-------------|-----------|
| **Database** | YES | `CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 2)` |
| **Backend types** | YES | `validateTags()` function in `backend/src/types/inbox.ts:159-163` |
| **Admin UI** | YES | `handleTagToggle()` replaces oldest when > 2 in `admin/src/pages/inbox/InboxEditPage.tsx:76-87` |
| **Mobile** | N/A | Mobile doesn't create messages |

---

## B. Banner Flags & Time Window Semantics

### B5. Does a message need `is_banner=true`?

**NO.** There is NO `is_banner` field in the database schema or types.

Banner eligibility is **derived** at runtime from:
1. Having an active time window (`active_from` and/or `active_to` set)
2. Being within that time window
3. User eligibility (municipal filtering)
4. Screen context (tag-to-screen matching)

**Source**: `backend/src/lib/eligibility.ts:63-81` (`isBannerEligible()`)

The previous BANNER_RULES_AUDIT.md incorrectly referenced `is_banner`. This field does not exist.

### B6. Active window rules

**Current behavior** (from `isWithinActiveWindow()` at `backend/src/lib/eligibility.ts:90-113`):

| active_from | active_to | Banner Eligible? |
|-------------|-----------|------------------|
| NULL | NULL | **NO** (line 98-100) |
| NULL | set | **YES** (if now <= active_to) |
| set | NULL | **YES** (if now >= active_from) |
| set | set | **YES** (if active_from <= now <= active_to) |

**Comparison operators**:
- `active_from`: Exclusive (`now < active_from` → reject) - line 103-105
- `active_to`: Exclusive (`now > active_to` → reject) - line 108-110

This means boundaries are **inclusive**: message is eligible when `active_from <= now <= active_to`.

### B7. Timezone handling

| Aspect | Value |
|--------|-------|
| Database storage | `TIMESTAMPTZ` (UTC with timezone) |
| Server "now" | `new Date()` - server's local time (typically UTC in production) |
| Admin input | `datetime-local` input → converted to ISO string via `new Date().toISOString()` |
| Comparison | JavaScript Date objects (UTC milliseconds internally) |

**Source**:
- Schema: `backend/src/db/migrations/001_inbox_messages.sql:36-37`
- Eligibility: `backend/src/lib/eligibility.ts:66` uses `now: Date = new Date()`

**Risk**: Server "now" depends on server timezone configuration. No explicit UTC enforcement in eligibility.ts.

---

## C. Screen Contexts and Placement

### C8. Backend screen contexts

```typescript
export type ScreenContext = 'home' | 'transport_road' | 'transport_sea';
```

**Source**: `backend/src/lib/eligibility.ts:148`

### C9. Mobile screens that render banners

| Screen | File | API Call | Screen Context |
|--------|------|----------|----------------|
| HomeScreen | `mobile/src/screens/home/HomeScreen.tsx:48` | `getActiveBanners(ctx, 'home')` | `home` |
| TransportHubScreen | `mobile/src/screens/transport/TransportHubScreen.tsx:42-50` | Both `transport_road` + `transport_sea`, deduplicated | Both |
| RoadTransportScreen | `mobile/src/screens/transport/RoadTransportScreen.tsx:68` | `getActiveBanners(ctx, 'transport_road')` | `transport_road` |
| SeaTransportScreen | `mobile/src/screens/transport/SeaTransportScreen.tsx:68` | `getActiveBanners(ctx, 'transport_sea')` | `transport_sea` |

### Tag-to-Screen Mapping (from `isBannerForScreen()`)

| Tag | home | transport_road | transport_sea |
|-----|------|----------------|---------------|
| `hitno` | YES | YES | YES |
| `opcenito` | YES | NO | NO |
| `vis` | YES | NO | NO |
| `komiza` | YES | NO | NO |
| `cestovni_promet` | NO | YES | NO |
| `pomorski_promet` | NO | NO | YES |
| `kultura` | **NO** | NO | NO |

**Finding**: `kultura` tag NEVER appears as a banner on any screen.

---

## D. Ordering and Limits

### D10. Ordering

**Yes.** Repository queries order by `created_at DESC` (newest first).

**Source**: `backend/src/repositories/inbox.ts:128`
```sql
ORDER BY created_at DESC
```

### D11. Cap/Limit

**NO cap.** All matching banners are returned and rendered.

- Repository: Returns all messages matching criteria (no LIMIT)
- API route: No limit applied after filtering
- Mobile BannerList: Renders all banners in array

**Source**: `mobile/src/components/Banner.tsx:84-95` - maps all banners without slice/limit

---

## E. Open Questions / Decisions Needed

### Critical Decisions Required

1. **Remove `kultura` from tags or add to a screen?**
   - Currently: `kultura` messages NEVER show as banners
   - Options: Add to home screen filter, or deprecate the tag

2. **Should we add a banner cap/limit?**
   - Currently: No limit - could flood UI
   - Recommendation: Max 3-5 banners per screen

3. **Should we add priority ordering?**
   - Currently: Newest first (`created_at DESC`)
   - Should `hitno` always appear first regardless of creation date?

4. **Single-boundary window behavior - is this correct?**
   - Currently: `active_from` only OR `active_to` only makes banner eligible
   - Original BANNER_RULES_AUDIT.md said "both required" but code allows one
   - Need product decision: Is open-ended window intentional?

5. **Server timezone consistency**
   - Currently: `new Date()` uses server local time
   - Should we explicitly use UTC or Europe/Zagreb?

### Secondary Questions

6. **TransportHub deduplication logic**
   - Currently: Road banners shown first, then unique sea banners
   - Is this the desired order?

7. **Municipal banner filtering in Inbox list**
   - Currently: Municipal messages hidden from wrong-municipality users
   - Is this also intended for banner display? (Seems yes per eligibility.ts)

---

## Risks / Edge Cases

### Known Risks

| Risk | Severity | Description |
|------|----------|-------------|
| No banner limit | Medium | Many active banners could overwhelm UI |
| `kultura` orphaned | Low | Tag exists but never surfaces as banner |
| Timezone drift | Medium | Server using local time, not explicit UTC |
| Open-ended windows | Medium | Single boundary allows indefinite display |
| No `is_banner` flag | Info | Spec may have expected explicit flag, implementation derives from window |

### Edge Cases to Test

1. Message with `active_from` in future, `active_to` = NULL → should NOT show (only from-boundary set)
2. Message with both NULL → should NOT show (confirmed in tests)
3. Message with `active_from` = NOW exactly → boundary inclusive, should show
4. Multiple tags on one message (e.g., `['hitno', 'cestovni_promet']`) → appears on multiple screens

---

## PROOF: No Code Changes

### git status (at audit completion)

```
M mobile/App.tsx                              # Prior: Menu alignment
M mobile/src/components/MenuOverlay.tsx       # Prior: Menu alignment
M mobile/src/screens/home/HomeScreen.tsx      # Prior: SKIN_TEST_MODE
M mobile/src/screens/inbox/InboxListScreen.tsx # Prior: SKIN_TEST_MODE
M mobile/src/screens/pages/StaticPageScreen.tsx # Prior: Menu alignment
?? backend/scripts/seed-menu-pages.ts         # Prior: Menu alignment
?? docs/BANNER_RULES_AUDIT.md                 # Prior: Banner audit
?? docs/MENU_ALIGNMENT_REPORT.md              # Prior: Menu alignment
?? docs/MOJVIS-NEOBRUT2-DESIGNSYSTEM.md       # Prior: Design system
```

### git diff --name-only (this audit)

**This audit creates only one new file:**
- `docs/BANNER_PHASE1_FACTS_AND_QUESTIONS.md`

All other modifications are from prior tasks. Zero code changes made during this audit.

---

## Files Reviewed

| File | Lines | Purpose |
|------|-------|---------|
| `backend/src/types/inbox.ts` | 187 | Tag taxonomy, message types, validation |
| `admin/src/types/inbox.ts` | 103 | Admin tag taxonomy, labels |
| `mobile/src/types/inbox.ts` | 70 | Mobile types including ScreenContext |
| `backend/src/db/migrations/001_inbox_messages.sql` | 74 | Schema, constraints, indexes |
| `backend/src/lib/eligibility.ts` | 256 | Core eligibility logic |
| `backend/src/routes/inbox.ts` | 255 | API endpoints for banners |
| `backend/src/repositories/inbox.ts` | 360 | Database queries |
| `admin/src/pages/inbox/InboxEditPage.tsx` | 552 | Admin message editor |
| `mobile/src/screens/home/HomeScreen.tsx` | 166 | Home screen with banners |
| `mobile/src/screens/transport/TransportHubScreen.tsx` | 187 | Transport hub with banners |
| `mobile/src/screens/transport/RoadTransportScreen.tsx` | 398 | Road transport screen |
| `mobile/src/screens/transport/SeaTransportScreen.tsx` | 398 | Sea transport screen |
| `mobile/src/components/Banner.tsx` | 151 | Banner UI component |
| `backend/src/__tests__/eligibility.test.ts` | 368 | Eligibility test coverage |
