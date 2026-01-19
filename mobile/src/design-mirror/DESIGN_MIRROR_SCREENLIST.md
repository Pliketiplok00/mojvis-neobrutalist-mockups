# Design Mirror - Canonical Screen List

> Generated: 2026-01-19
> Source of truth: `mobile/src/navigation/types.ts` + `mobile/src/navigation/AppNavigator.tsx`
> Branch: `chore/design-mirror-phase3-inventory`

---

## Canonical Routed Screens

This is the **single source of truth** for all mobile routed screens.

### Onboarding Stack (3 routes)

| # | RouteName | AppScreenFile | MirrorExists | MirrorScreenFile | Family |
|---|-----------|---------------|--------------|------------------|--------|
| 1 | LanguageSelection | `screens/onboarding/LanguageSelectionScreen.tsx` | N | - | Onboarding |
| 2 | UserModeSelection | `screens/onboarding/UserModeSelectionScreen.tsx` | N | - | Onboarding |
| 3 | MunicipalitySelection | `screens/onboarding/MunicipalitySelectionScreen.tsx` | N | - | Onboarding |

### Main Stack (19 routes)

| # | RouteName | AppScreenFile | MirrorExists | MirrorScreenFile | Family |
|---|-----------|---------------|--------------|------------------|--------|
| 4 | Home | `screens/home/HomeScreen.tsx` | N | - | Home |
| 5 | TransportHub | `screens/transport/TransportHubScreen.tsx` | N | - | Transport |
| 6 | RoadTransport | `screens/transport/RoadTransportScreen.tsx` | Y | `MirrorTransportRoadScreen.tsx` | Transport |
| 7 | RoadLineDetail | `screens/transport/RoadLineDetailScreen.tsx` | N | - | Transport |
| 8 | SeaTransport | `screens/transport/SeaTransportScreen.tsx` | Y | `MirrorTransportSeaScreen.tsx` | Transport |
| 9 | SeaLineDetail | `screens/transport/SeaLineDetailScreen.tsx` | N | - | Transport |
| 10 | Events | `screens/events/EventsScreen.tsx` | N | - | Events |
| 11 | EventDetail | `screens/events/EventDetailScreen.tsx` | N | - | Events |
| 12 | Inbox | `screens/inbox/InboxListScreen.tsx` | N | - | Inbox |
| 13 | InboxDetail | `screens/inbox/InboxDetailScreen.tsx` | N | - | Inbox |
| 14 | FeedbackForm | `screens/feedback/FeedbackFormScreen.tsx` | N | - | Feedback |
| 15 | FeedbackConfirmation | `screens/feedback/FeedbackConfirmationScreen.tsx` | N | - | Feedback |
| 16 | FeedbackDetail | `screens/feedback/FeedbackDetailScreen.tsx` | N | - | Feedback |
| 17 | ClickFixForm | `screens/click-fix/ClickFixFormScreen.tsx` | N | - | ClickFix |
| 18 | ClickFixConfirmation | `screens/click-fix/ClickFixConfirmationScreen.tsx` | N | - | ClickFix |
| 19 | ClickFixDetail | `screens/click-fix/ClickFixDetailScreen.tsx` | N | - | ClickFix |
| 20 | StaticPage | `screens/pages/StaticPageScreen.tsx` | N | - | Static |
| 21 | Settings | `screens/settings/SettingsScreen.tsx` | N | - | Settings |
| 22 | UiInventory | `screens/dev/UiInventoryScreen.tsx` | N | - | Dev |

---

## Summary Totals

| Metric | Count |
|--------|-------|
| **Total routed screens** | 22 |
| Onboarding stack | 3 |
| Main stack | 19 |
| **Mirror screens (app routes)** | 2 |
| **Coverage %** | 9.1% (2/22) |

---

## Mirror Screens Inventory

| Mirror Screen | File | Mirrors Route | Status |
|---------------|------|---------------|--------|
| MirrorHomeScreen | `design-mirror/screens/MirrorHomeScreen.tsx` | (entry point) | Phase 1 |
| MirrorMenuOverlayScreen | `design-mirror/screens/MirrorMenuOverlayScreen.tsx` | (component) | Phase 1 |
| MirrorTransportRoadScreen | `design-mirror/screens/MirrorTransportRoadScreen.tsx` | RoadTransport | Phase 1 |
| MirrorTransportSeaScreen | `design-mirror/screens/MirrorTransportSeaScreen.tsx` | SeaTransport | Phase 1 |

Note: MirrorHomeScreen is the Design Mirror entry point (not mirroring an app screen).
Note: MirrorMenuOverlayScreen mirrors a component, not a routed screen.

---

## Family Breakdown

| Family | Routes | Mirrored | Coverage |
|--------|--------|----------|----------|
| Onboarding | 3 | 0 | 0% |
| Home | 1 | 0 | 0% |
| Transport | 5 | 2 | 40% |
| Events | 2 | 0 | 0% |
| Inbox | 2 | 0 | 0% |
| Feedback | 3 | 0 | 0% |
| ClickFix | 3 | 0 | 0% |
| Static | 1 | 0 | 0% |
| Settings | 1 | 0 | 0% |
| Dev | 1 | 0 | 0% |
| **Total** | **22** | **2** | **9.1%** |

---

## Verification Commands

```bash
# Count routes in types.ts (excluding comments and type definitions)
grep -E "^\s+\w+:" mobile/src/navigation/types.ts | grep -v "//" | wc -l

# Count screen imports in AppNavigator.tsx
grep -c "import.*Screen.*from" mobile/src/navigation/AppNavigator.tsx

# List mirror screen files
ls mobile/src/design-mirror/screens/*.tsx 2>/dev/null | wc -l
```
