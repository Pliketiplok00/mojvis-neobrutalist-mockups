# Design Mirror Coverage Matrix

> Generated: 2026-01-19
> Updated: 2026-01-19 (Phase 3 - canonical inventory)
> Scope: Mobile only (iOS + Android)
> Canonical source: See `DESIGN_MIRROR_SCREENLIST.md` for single source of truth

---

## A) App Screens Inventory

| Area | Screen name (app) | File path | Route name | Has mirror? | Mirror file path | Data source | Notes |
|------|-------------------|-----------|------------|-------------|------------------|-------------|-------|
| Home | HomeScreen | `mobile/src/screens/home/HomeScreen.tsx` | Home | N | - | api | Main app entry, uses GlobalHeader |
| Transport | TransportHubScreen | `mobile/src/screens/transport/TransportHubScreen.tsx` | TransportHub | N | - | api | Hub with sea/road links |
| Transport | RoadTransportScreen | `mobile/src/screens/transport/RoadTransportScreen.tsx` | RoadTransport | Y | `mobile/src/design-mirror/screens/MirrorTransportRoadScreen.tsx` | api | Lines list + today departures |
| Transport | RoadLineDetailScreen | `mobile/src/screens/transport/RoadLineDetailScreen.tsx` | RoadLineDetail | N | - | api | Uses shared LineDetailScreen |
| Transport | SeaTransportScreen | `mobile/src/screens/transport/SeaTransportScreen.tsx` | SeaTransport | Y | `mobile/src/design-mirror/screens/MirrorTransportSeaScreen.tsx` | api | Lines list + today departures |
| Transport | SeaLineDetailScreen | `mobile/src/screens/transport/SeaLineDetailScreen.tsx` | SeaLineDetail | N | - | api | Uses shared LineDetailScreen |
| Transport | LineDetailScreen | `mobile/src/screens/transport/LineDetailScreen.tsx` | - | N | - | api | Shared component (not direct route) |
| Events | EventsScreen | `mobile/src/screens/events/EventsScreen.tsx` | Events | N | - | api | Events list |
| Events | EventDetailScreen | `mobile/src/screens/events/EventDetailScreen.tsx` | EventDetail | N | - | api | Single event view |
| Inbox | InboxListScreen | `mobile/src/screens/inbox/InboxListScreen.tsx` | Inbox | N | - | api | Messages list |
| Inbox | InboxDetailScreen | `mobile/src/screens/inbox/InboxDetailScreen.tsx` | InboxDetail | N | - | api | Single message view |
| Feedback | FeedbackFormScreen | `mobile/src/screens/feedback/FeedbackFormScreen.tsx` | FeedbackForm | N | - | api | Submit feedback form |
| Feedback | FeedbackConfirmationScreen | `mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx` | FeedbackConfirmation | N | - | mixed | Confirmation after submit |
| Feedback | FeedbackDetailScreen | `mobile/src/screens/feedback/FeedbackDetailScreen.tsx` | FeedbackDetail | N | - | api | View submitted feedback |
| Click & Fix | ClickFixFormScreen | `mobile/src/screens/click-fix/ClickFixFormScreen.tsx` | ClickFixForm | N | - | api | Report problem form |
| Click & Fix | ClickFixConfirmationScreen | `mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx` | ClickFixConfirmation | N | - | mixed | Confirmation after submit |
| Click & Fix | ClickFixDetailScreen | `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx` | ClickFixDetail | N | - | api | View submitted report |
| Static | StaticPageScreen | `mobile/src/screens/pages/StaticPageScreen.tsx` | StaticPage | N | - | api | CMS-driven static pages |
| Settings | SettingsScreen | `mobile/src/screens/settings/SettingsScreen.tsx` | Settings | N | - | mixed | User settings, dev tools entry |
| Onboarding | LanguageSelectionScreen | `mobile/src/screens/onboarding/LanguageSelectionScreen.tsx` | LanguageSelection | N | - | unknown | First-launch language picker |
| Onboarding | UserModeSelectionScreen | `mobile/src/screens/onboarding/UserModeSelectionScreen.tsx` | UserModeSelection | N | - | unknown | Visitor vs local selection |
| Onboarding | MunicipalitySelectionScreen | `mobile/src/screens/onboarding/MunicipalitySelectionScreen.tsx` | MunicipalitySelection | N | - | unknown | Vis vs Komiza selection |
| Dev | UiInventoryScreen | `mobile/src/screens/dev/UiInventoryScreen.tsx` | UiInventory | N | - | unknown | Dev-only UI token viewer |

---

## B) Mirror Screens Inventory

| Mirror screen | File path | Mirrors app screen | Parity intent | Fixture file(s) | Notes |
|---------------|-----------|-------------------|---------------|-----------------|-------|
| MirrorHomeScreen | `mobile/src/design-mirror/screens/MirrorHomeScreen.tsx` | - | N/A (index) | - | Entry point for design mirror, lists available mirrors |
| MirrorMenuOverlayScreen | `mobile/src/design-mirror/screens/MirrorMenuOverlayScreen.tsx` | MenuOverlay (component) | 1:1 | `fixtures/transport.ts` (menuItemsFixture) | Mirrors menu overlay in static full-screen view |
| MirrorTransportSeaScreen | `mobile/src/design-mirror/screens/MirrorTransportSeaScreen.tsx` | SeaTransportScreen | partial | `fixtures/transport.ts` (seaLinesFixture, seaTodayDeparturesFixture) | Missing: BannerList, loading/error states, refresh control |
| MirrorTransportRoadScreen | `mobile/src/design-mirror/screens/MirrorTransportRoadScreen.tsx` | RoadTransportScreen | partial | `fixtures/transport.ts` (roadLinesFixture, roadTodayDeparturesFixture) | Missing: BannerList, loading/error states, refresh control |

### Parity Details

**MirrorTransportSeaScreen - partial parity:**
- Included: Header slab, lines list (2-part cards), today departures list
- Not included: BannerList component, loading spinner, error state, RefreshControl, navigation to line detail

**MirrorTransportRoadScreen - partial parity:**
- Included: Header slab, lines list (2-part cards), today departures list
- Not included: BannerList component, loading spinner, error state, RefreshControl, navigation to line detail

---

## C) Component/Primitive Inventory

### Shared Components (`mobile/src/components/`)

| Component | File path | Used in screens | Mirrored explicitly? | Notes |
|-----------|-----------|-----------------|---------------------|-------|
| Banner | `mobile/src/components/Banner.tsx` | SeaTransportScreen, RoadTransportScreen, EventsScreen | N | Alert banners, not in mirror |
| DepartureItem | `mobile/src/components/DepartureItem.tsx` | LineDetailScreen | N | Departure row component |
| GlobalHeader | `mobile/src/components/GlobalHeader.tsx` | All main screens | N | Top nav header with menu button |
| MenuOverlay | `mobile/src/components/MenuOverlay.tsx` | App-wide (via HomeScreen) | Y | Slide-in menu, mirrored as MirrorMenuOverlayScreen |

### UI Primitives (`mobile/src/ui/`)

| Primitive | File path | Used in mirrors? | Notes |
|-----------|-----------|-----------------|-------|
| Badge | `mobile/src/ui/Badge.tsx` | Y | Transport subtype badges |
| Button | `mobile/src/ui/Button.tsx` | N | Not used in current mirrors |
| Card | `mobile/src/ui/Card.tsx` | N | Not used in current mirrors |
| Header | `mobile/src/ui/Header.tsx` | N | Not used in current mirrors |
| Icon | `mobile/src/ui/Icon.tsx` | Y | Icons throughout all mirrors |
| Input | `mobile/src/ui/Input.tsx` | N | Form input, not in current mirrors |
| ListRow | `mobile/src/ui/ListRow.tsx` | N | Not used in current mirrors |
| MicroPrimitives | `mobile/src/ui/MicroPrimitives.tsx` | N | NotificationBadge, Hairline, Dot, IconBox |
| Screen | `mobile/src/ui/Screen.tsx` | N | Screen wrapper, mirrors use SafeAreaView directly |
| Section | `mobile/src/ui/Section.tsx` | N | Not used in current mirrors |
| States | `mobile/src/ui/States.tsx` | N | LoadingState, EmptyState, ErrorState |
| Text | `mobile/src/ui/Text.tsx` | Y | H1, H2, Label, Body, Meta used in all mirrors |

### Fixture Files (`mobile/src/design-mirror/fixtures/`)

| Fixture file | Exports | Used by |
|--------------|---------|---------|
| transport.ts | seaLinesFixture, roadLinesFixture, seaTodayDeparturesFixture, roadTodayDeparturesFixture, fixtureDayType, fixtureIsHoliday, menuItemsFixture, MirrorTodayDepartureItem (type) | MirrorTransportSeaScreen, MirrorTransportRoadScreen, MirrorMenuOverlayScreen |

---

## D) Coverage Summary

### Counts

| Metric | Count |
|--------|-------|
| Total app screens found | 23 |
| Total screens with routes | 22 |
| Screens without routes (shared) | 1 (LineDetailScreen) |
| Total mirror screens found | 4 |
| Mirror screens that mirror app screens | 2 (Sea, Road) |
| Mirror screens that mirror components | 1 (MenuOverlay) |
| Mirror index/entry screens | 1 (MirrorHomeScreen) |

### Coverage Calculation

- **App screens with mirrors:** 2 / 22 routed screens = **9.1%**
- **Components with mirrors:** 1 / 4 components = **25%**
- **UI primitives used in mirrors:** 4 / 12 primitives = **33%**

### Unmirored Screens (by priority area)

| Priority | Area | Screens not mirrored |
|----------|------|---------------------|
| High | Transport | TransportHubScreen, RoadLineDetailScreen, SeaLineDetailScreen |
| Medium | Home | HomeScreen |
| Medium | Events | EventsScreen, EventDetailScreen |
| Medium | Inbox | InboxListScreen, InboxDetailScreen |
| Low | Feedback | FeedbackFormScreen, FeedbackConfirmationScreen, FeedbackDetailScreen |
| Low | Click & Fix | ClickFixFormScreen, ClickFixConfirmationScreen, ClickFixDetailScreen |
| Low | Static | StaticPageScreen |
| Low | Settings | SettingsScreen |
| Excluded | Onboarding | LanguageSelectionScreen, UserModeSelectionScreen, MunicipalitySelectionScreen |
| Excluded | Dev | UiInventoryScreen |

---

## E) Navigation Structure Reference

```
RootStack
├── Onboarding (OnboardingStack)
│   ├── LanguageSelection
│   ├── UserModeSelection
│   └── MunicipalitySelection
└── Main (MainStack)
    ├── Home
    ├── TransportHub
    ├── RoadTransport
    ├── RoadLineDetail
    ├── SeaTransport
    ├── SeaLineDetail
    ├── Events
    ├── EventDetail
    ├── Inbox
    ├── InboxDetail
    ├── FeedbackForm
    ├── FeedbackConfirmation
    ├── FeedbackDetail
    ├── ClickFixForm
    ├── ClickFixConfirmation
    ├── ClickFixDetail
    ├── StaticPage
    ├── Settings
    └── UiInventory (DEV)
```

Note: Design Mirror routes (DesignMirror, MirrorMenuOverlay, MirrorTransportSea, MirrorTransportRoad) are defined in Phase 1 navigation changes but not yet merged to main.
