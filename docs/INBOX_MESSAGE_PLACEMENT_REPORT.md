# InboxMessage Placement Report

**Date:** 2026-01-09
**Task:** Correct InboxMessage placement across mobile app

---

## Statement of Fact

**There is exactly ONE message type in this app: InboxMessage.**

"Banner", "Notice", "Alert" are **UI names only**, not different domain concepts. Any component that renders InboxMessage data is subject to placement rules, regardless of its name.

---

## Product Owner Confirmation

**Question asked:** For each screen where InboxMessage renders, is this ALLOWED or FORBIDDEN?

**Answer received:** Home, Events, Transport ONLY

**Interpretation:**
- InboxMessage renders on Home, Events, Transport screens
- InboxMessage is FORBIDDEN on all static pages (Flora, Fauna, Important Contacts, etc.)

---

## Investigation Results

### All Render Paths for InboxMessage

| Render Path | Component | Data Source | File |
|-------------|-----------|-------------|------|
| InboxListScreen | Direct list | `/inbox` API | `screens/inbox/InboxListScreen.tsx` |
| InboxDetailScreen | Detail view | `/inbox/:id` API | `screens/inbox/InboxDetailScreen.tsx` |
| HomeScreen | BannerList | `/banners/active?context=home` | `screens/home/HomeScreen.tsx:47` |
| EventsScreen | BannerList | `/banners/active?context=events` | `screens/events/EventsScreen.tsx:215` |
| TransportHubScreen | BannerList | `/banners/active?context=transport` | `screens/transport/TransportHubScreen.tsx:44` |
| RoadTransportScreen | BannerList | `/banners/active?context=transport` | `screens/transport/RoadTransportScreen.tsx:67` |
| SeaTransportScreen | BannerList | `/banners/active?context=transport` | `screens/transport/SeaTransportScreen.tsx:67` |
| StaticPageScreen | NoticeBlock | `/pages/:slug` (injected) | `screens/pages/StaticPageScreen.tsx` |

### Critical Finding: NoticeBlock Data Source

**BEFORE this fix**, the backend `static-pages.ts` route injected InboxMessage data into static pages:

```typescript
// backend/src/routes/static-pages.ts (REMOVED CODE)
const potentialBanners = await getPotentialBannerMessages();
const eligibleBanners = filterBannerEligibleMessages(potentialBanners, userContext, now);
const activeNotices = filterBannersByScreen(eligibleBanners, 'home');

if (activeNotices.length > 0) {
  localizedBlocks.unshift({
    id: 'system-notice',
    type: 'notice',
    content: {
      notices: activeNotices.map((notice) => ({
        id: notice.id,
        title: ...,
        is_urgent: notice.tags.includes('hitno'),
      })),
    },
  });
}
```

This means **NoticeBlock was rendering InboxMessage data** - the same data source as BannerList. This was incorrect per the placement rules.

---

## Placement Table (Final)

| Screen | Renders InboxMessage? | ALLOWED? | Status |
|--------|----------------------|----------|--------|
| Home | YES (BannerList) | YES | Correct |
| Events | YES (BannerList) | YES | Correct |
| TransportHub | YES (BannerList) | YES | Correct |
| RoadTransport | YES (BannerList) | YES | Correct |
| SeaTransport | YES (BannerList) | YES | Correct |
| Flora (StaticPage) | ~~YES~~ → NO | NO | **FIXED** |
| Fauna (StaticPage) | ~~YES~~ → NO | NO | **FIXED** |
| Important Contacts (StaticPage) | ~~YES~~ → NO | NO | **FIXED** |
| Any StaticPage | ~~YES~~ → NO | NO | **FIXED** |
| InboxList | NO (source) | N/A | Correct |
| InboxDetail | NO (detail) | N/A | Correct |

---

## Fix Applied

### File Changed

`backend/src/routes/static-pages.ts`

### Change Description

Removed InboxMessage injection from static pages API response.

### Before (lines 230-264)

```typescript
// Inject notice block if there are active notices
const deviceId = request.headers['x-device-id'] as string | undefined;
// ... 30+ lines of notice injection code
```

### After

```typescript
// NOTE: Static pages do NOT show InboxMessages (per product owner confirmation 2026-01-09)
// InboxMessage placement is restricted to: Home, Events, Transport screens only
const localizedBlocks = page.published_blocks
  .filter((b) => b.type !== 'notice')
  .map((block) => ({ ... }));
```

---

## Runtime Verification

### Before Fix (19:14-19:15)

```
[STATICPAGE_RENDER] {"slug": "visitor-info"...}
[NOTICEBLOCK_RENDER] {"noticeCount": 3, "noticeIds": ["058f8cb8", ...]}  ← InboxMessage on static page
```

### After Fix (19:28-19:30)

```
[STATICPAGE_RENDER] {"slug": "visitor-info"...}
[STATICPAGE_RENDER] {"slug": "flora-fauna"...}
← NO NoticeBlock render (CORRECT)
```

### API Verification

```bash
# Static page - NO notices
$ curl -s "http://localhost:3000/pages/flora-fauna" | jq '.blocks[] | select(.type == "notice")'
(empty - CORRECT)

# Home banners - YES notices
$ curl -s "http://localhost:3000/banners/active?context=home" | jq '.banners | length'
2 (CORRECT)
```

---

## Regression Tests

### Backend Test Added

`backend/src/__tests__/static-pages.test.ts`

```typescript
describe('InboxMessage Placement (REGRESSION)', () => {
  it('static pages route should NOT inject InboxMessage (notice blocks)', async () => {
    const routeFile = fs.readFileSync(
      path.join(__dirname, '../routes/static-pages.ts'),
      'utf-8'
    );

    // Verify notice injection code is NOT present
    expect(routeFile).not.toMatch(/getPotentialBannerMessages/);
    expect(routeFile).not.toMatch(/filterBannerEligibleMessages/);
    expect(routeFile).not.toMatch(/filterBannersByScreen/);
    expect(routeFile).not.toMatch(/activeNotices\s*=/);
    expect(routeFile).not.toMatch(/type:\s*['"]notice['"]/);
  });
});
```

### Mobile Tests Updated

`mobile/src/__tests__/bannerPlacements.test.ts`

Updated documentation to reflect the correct domain understanding:

```typescript
/**
 * IMPORTANT: There is exactly ONE message type in this app: InboxMessage.
 * "Banner", "Notice", "Alert" are UI names only, not different domain concepts.
 */
```

### Test Results

```
Backend: 294 tests passed
Mobile: 18 tests passed
```

---

## Files Changed

| File | Change |
|------|--------|
| `backend/src/routes/static-pages.ts` | Removed InboxMessage injection (30+ lines) |
| `backend/src/__tests__/static-pages.test.ts` | Added regression test |
| `mobile/src/__tests__/bannerPlacements.test.ts` | Updated documentation |

---

## Statement

**No architectural assumptions were made beyond confirmed facts.**

The fix is:
- Minimal: Only removed the notice injection code
- Local: Only changed `static-pages.ts` route
- Placement-based: Did not introduce new message types or split InboxMessage

---

## Cleanup Note

The mobile `NoticeBlock` component and dev logging in `StaticPageScreen.tsx` can remain in place. They are harmless because:
1. The backend no longer sends notice data to static pages
2. The mobile component will never receive data to render
3. Dev logging only runs in `__DEV__` mode

Alternatively, these can be removed in a future cleanup task.
