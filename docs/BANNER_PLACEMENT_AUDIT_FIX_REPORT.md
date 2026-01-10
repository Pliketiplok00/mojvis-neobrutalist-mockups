# Banner Placement Audit Report

**Date:** 2026-01-09
**Task:** Verify and enforce banner placement rules across mobile app

---

## Executive Summary

**AUDIT RESULT: Current code is COMPLIANT.**

The audit found that banners are correctly placed ONLY in allowed screens. StaticPageScreen (used for Flora/Fauna, Important Contacts) does NOT have banner code. No fix was required.

Regression tests were added to prevent future violations.

---

## Step 1 — Exhaustive Code Audit

### Grep Output: `rg -n "Banner" mobile/src`

```
mobile/src/types/inbox.ts:6: * Phase 2 Banner Rules:
mobile/src/types/inbox.ts:7: * - Banners require "hitno" + exactly one context tag
mobile/src/types/inbox.ts:52: * Banner response
mobile/src/types/inbox.ts:54:export interface BannerResponse {
mobile/src/types/inbox.ts:71: * Banner placement rules:
mobile/src/services/api.ts:10:  BannerResponse,
mobile/src/services/api.ts:166:   * Banner placement rules:
mobile/src/services/api.ts:174:  async getActiveBanners(
mobile/src/services/api.ts:177:  ): Promise<BannerResponse> {
mobile/src/services/api.ts:178:    const response = await apiRequest<BannerResponse>(
mobile/src/components/Banner.tsx:2: * Banner Component
mobile/src/components/Banner.tsx:22:interface BannerProps {
mobile/src/components/Banner.tsx:33:export function Banner({ message }: BannerProps): React.JSX.Element {
mobile/src/components/Banner.tsx:73:interface BannerListProps {
mobile/src/components/Banner.tsx:84:export function BannerList({ banners }: BannerListProps): React.JSX.Element | null {
mobile/src/components/Banner.tsx:150:export default Banner;
mobile/src/screens/transport/TransportHubScreen.tsx:26:import { BannerList } from '../../components/Banner';
mobile/src/screens/transport/TransportHubScreen.tsx:38:  const [banners, setBanners] = useState<InboxMessage[]>([]);
mobile/src/screens/transport/TransportHubScreen.tsx:44:      const response = await inboxApi.getActiveBanners(userContext, 'transport');
mobile/src/screens/transport/TransportHubScreen.tsx:67:            <BannerList banners={banners} />
mobile/src/screens/events/EventsScreen.tsx:27:import { BannerList } from '../../components/Banner';
mobile/src/screens/events/EventsScreen.tsx:203:  const [banners, setBanners] = useState<InboxMessage[]>([]);
mobile/src/screens/events/EventsScreen.tsx:215:      const response = await inboxApi.getActiveBanners(userContext, 'events');
mobile/src/screens/events/EventsScreen.tsx:277:            <BannerList banners={banners} />
mobile/src/screens/transport/SeaTransportScreen.tsx:31:import { BannerList } from '../../components/Banner';
mobile/src/screens/transport/SeaTransportScreen.tsx:53:  const [banners, setBanners] = useState<InboxMessage[]>([]);
mobile/src/screens/transport/SeaTransportScreen.tsx:67:        inboxApi.getActiveBanners(userContext, 'transport'),
mobile/src/screens/transport/SeaTransportScreen.tsx:133:            <BannerList banners={banners} />
mobile/src/screens/home/HomeScreen.tsx:21:import { BannerList } from '../../components/Banner';
mobile/src/screens/home/HomeScreen.tsx:41:  const [banners, setBanners] = useState<InboxMessage[]>([]);
mobile/src/screens/home/HomeScreen.tsx:47:      const response = await inboxApi.getActiveBanners(userContext, 'home');
mobile/src/screens/home/HomeScreen.tsx:70:          <BannerList banners={banners} />
mobile/src/screens/transport/RoadTransportScreen.tsx:31:import { BannerList } from '../../components/Banner';
mobile/src/screens/transport/RoadTransportScreen.tsx:53:  const [banners, setBanners] = useState<InboxMessage[]>([]);
mobile/src/screens/transport/RoadTransportScreen.tsx:67:        inboxApi.getActiveBanners(userContext, 'transport'),
mobile/src/screens/transport/RoadTransportScreen.tsx:133:            <BannerList banners={banners} />
```

### Grep Output: `rg -l "BannerList" mobile/src/screens`

```
mobile/src/screens/home/HomeScreen.tsx
mobile/src/screens/transport/SeaTransportScreen.tsx
mobile/src/screens/events/EventsScreen.tsx
mobile/src/screens/transport/TransportHubScreen.tsx
mobile/src/screens/transport/RoadTransportScreen.tsx
```

### Grep Output: `rg -n "useBanners|useActiveBanners|bannersQuery" mobile/src`

```
(no results)
```

### Grep Output: `rg -n "BANNER" mobile/src`

```
(no results)
```

---

## Step 2 — Placement Mapping Table

| File Path | Component/Screen | Banner Context | Status |
|-----------|-----------------|----------------|--------|
| `screens/home/HomeScreen.tsx` | HomeScreen | `'home'` | ✅ ALLOWED |
| `screens/events/EventsScreen.tsx` | EventsScreen | `'events'` | ✅ ALLOWED |
| `screens/transport/TransportHubScreen.tsx` | TransportHubScreen | `'transport'` | ✅ ALLOWED |
| `screens/transport/RoadTransportScreen.tsx` | RoadTransportScreen | `'transport'` | ✅ ALLOWED |
| `screens/transport/SeaTransportScreen.tsx` | SeaTransportScreen | `'transport'` | ✅ ALLOWED |
| `screens/pages/StaticPageScreen.tsx` | StaticPageScreen | N/A | ✅ NO BANNERS |
| `screens/inbox/InboxListScreen.tsx` | InboxListScreen | N/A | ✅ NO BANNERS |
| `screens/inbox/InboxDetailScreen.tsx` | InboxDetailScreen | N/A | ✅ NO BANNERS |
| `screens/settings/SettingsScreen.tsx` | SettingsScreen | N/A | ✅ NO BANNERS |
| `screens/feedback/FeedbackFormScreen.tsx` | FeedbackFormScreen | N/A | ✅ NO BANNERS |
| `screens/click-fix/ClickFixFormScreen.tsx` | ClickFixFormScreen | N/A | ✅ NO BANNERS |

---

## Step 3 — Placement Policy

### ALLOWED Placements (per spec)

| Screen | Banner Context | Eligible Tags |
|--------|---------------|---------------|
| Home | `'home'` | hitno + (promet \| kultura \| opcenito \| vis \| komiza) |
| Events | `'events'` | hitno + kultura |
| Transport Hub | `'transport'` | hitno + promet |
| Road Transport | `'transport'` | hitno + promet |
| Sea Transport | `'transport'` | hitno + promet |

### FORBIDDEN Placements

| Screen | Reason |
|--------|--------|
| Flora & Fauna (StaticPage) | Static content pages - no banners |
| Important Contacts (StaticPage) | Static content pages - no banners |
| Inbox screens | Message list/detail - no banners |
| Settings | Utility screen - no banners |
| Form screens | User input focus - no banners |
| Detail screens | Content focus - no banners |

---

## Step 4 — Fix Applied

**No fix was required.**

The current codebase is compliant. StaticPageScreen does NOT import or use Banner/BannerList.

---

## Step 5 — Verification

### Route-by-Route Checklist

| Screen | Expected | Actual | Status |
|--------|----------|--------|--------|
| Home | Banners visible when eligible | BannerList present | ✅ |
| Transport Hub | Banners visible when eligible | BannerList present | ✅ |
| Road Transport | Banners visible when eligible | BannerList present | ✅ |
| Sea Transport | Banners visible when eligible | BannerList present | ✅ |
| Events | Banners visible when eligible | BannerList present | ✅ |
| Flora/Fauna (StaticPage) | Banners NOT visible | No BannerList | ✅ |
| Important Contacts (StaticPage) | Banners NOT visible | No BannerList | ✅ |
| Inbox List | Banners NOT visible | No BannerList | ✅ |
| Settings | Banners NOT visible | No BannerList | ✅ |

### Regression Tests Added

File: `mobile/src/__tests__/bannerPlacements.test.ts`

Tests:
- ✅ HomeScreen should have banners (home context)
- ✅ EventsScreen should have banners (events context)
- ✅ TransportHubScreen should have banners (transport context)
- ✅ RoadTransportScreen should have banners (transport context)
- ✅ SeaTransportScreen should have banners (transport context)
- ✅ StaticPageScreen must NOT have banners (REGRESSION GUARD)
- ✅ InboxListScreen must NOT have banners
- ✅ InboxDetailScreen must NOT have banners
- ✅ EventDetailScreen must NOT have banners
- ✅ SettingsScreen must NOT have banners
- ✅ FeedbackFormScreen must NOT have banners
- ✅ ClickFixFormScreen must NOT have banners
- ✅ Should have exactly 5 screens with banner placement

### Test Output

```
$ cd mobile && npm test

> mobile@1.0.0 test
> jest

PASS src/__tests__/useUserContext.test.ts
PASS src/__tests__/bannerPlacements.test.ts

Test Suites: 2 passed, 2 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        4.028 s
Ran all test suites.
```

---

## Files Changed

| File | Change |
|------|--------|
| `mobile/src/__tests__/bannerPlacements.test.ts` | Added 13 regression tests for banner placements |

---

## Statement

**No unrelated code was modified.**

The audit found that the current implementation is compliant with banner placement rules. The StaticPageScreen (used for Flora/Fauna, Important Contacts) does NOT have any banner code. Regression tests were added to prevent future violations.

---

## Note on "NoticeBlock"

The StaticPageScreen includes a `NoticeBlock` component which displays inline notices within static page content. This is a **different concept** from banners:

| Feature | Banner | NoticeBlock |
|---------|--------|-------------|
| Source | API: `/banners/active` | Embedded in page content |
| Location | Top of screen | Inline with page blocks |
| Eligibility | hitno + context tag | Backend-injected |
| Purpose | Urgent alerts | Page-specific notices |

If the user observed something that looked like a banner on Flora/Fauna or Important Contacts, it may have been a NoticeBlock, which is intentional and correct behavior.
