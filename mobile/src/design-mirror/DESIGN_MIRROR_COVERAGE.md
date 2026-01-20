# Design Mirror Coverage Matrix

> **Status: COMPLETE**
> Generated: 2026-01-20
> Scope: Mobile only (iOS + Android)
> Branch: `main`

---

## Design Mirror Baseline Lock

**Date:** 2026-01-20
**Commit:** `1c860a488cb9e7b44f983e83635ae80e949df91c`
**Status:** COMPLETE

### Lock Statement

The Design Mirror baseline is now **complete and authoritative**. All production screens have corresponding mirror screens with deterministic fixtures.

**Rules going forward:**
1. Mirrors are the **canonical visual reference** for the app
2. Production screens must match mirrors, not the other way around
3. Any future UI change **requires updating the mirror first**
4. Mirrors are design-only and **never shipped** to production

---

## A) Production Screen Coverage

| Area | Production Screen | Mirror Screen | Fixture File | Status |
|------|-------------------|---------------|--------------|--------|
| Home | HomeScreen | MirrorHomeCompositeScreen | home.ts | Complete |
| Transport | TransportHubScreen | MirrorTransportHubScreen | transport.ts | Complete |
| Transport | RoadTransportScreen | MirrorTransportRoadScreen | transport.ts | Complete |
| Transport | SeaTransportScreen | MirrorTransportSeaScreen | transport.ts | Complete |
| Transport | RoadLineDetailScreen | MirrorRoadLineDetailScreen | transportDetail.ts | Complete |
| Transport | SeaLineDetailScreen | MirrorSeaLineDetailScreen | transportDetail.ts | Complete |
| Transport | LineDetailScreen | MirrorLineDetailScreen | transportDetail.ts | Complete |
| Events | EventsScreen | MirrorEventsScreen | events.ts | Complete |
| Events | EventDetailScreen | MirrorEventDetailScreen | events.ts | Complete |
| Inbox | InboxListScreen | MirrorInboxListScreen | inbox.ts | Complete |
| Inbox | InboxDetailScreen | MirrorInboxDetailScreen | inbox.ts | Complete |
| Feedback | FeedbackFormScreen | MirrorFeedbackFormScreen | feedback.ts | Complete |
| Feedback | FeedbackConfirmationScreen | MirrorFeedbackConfirmationScreen | feedback.ts | Complete |
| Feedback | FeedbackDetailScreen | MirrorFeedbackDetailScreen | feedback.ts | Complete |
| Click & Fix | ClickFixFormScreen | MirrorClickFixFormScreen | clickfix.ts | Complete |
| Click & Fix | ClickFixConfirmationScreen | MirrorClickFixConfirmationScreen | clickfix.ts | Complete |
| Click & Fix | ClickFixDetailScreen | MirrorClickFixDetailScreen | clickfix.ts | Complete |
| Static | StaticPageScreen | MirrorStaticPageScreen | static.ts | Complete |
| Settings | SettingsScreen | MirrorSettingsScreen | settings.ts | Complete |
| Onboarding | LanguageSelectionScreen | MirrorLanguageSelectionScreen | onboarding.ts | Complete |
| Onboarding | UserModeSelectionScreen | MirrorUserModeSelectionScreen | onboarding.ts | Complete |
| Onboarding | MunicipalitySelectionScreen | MirrorMunicipalitySelectionScreen | onboarding.ts | Complete |
| Dev | UiInventoryScreen | - | - | Excluded (dev-only) |

---

## B) Component Coverage

| Component | Mirror Screen | Status |
|-----------|---------------|--------|
| MenuOverlay | MirrorMenuOverlayScreen | Complete |
| GlobalHeader | Implicit in all mirrors | Complete |
| Banner | Implicit in transport mirrors | Complete |

---

## C) Future Screens (Prepared)

These mirrors exist for planned production screens:

| Mirror Screen | Fixture File | Status |
|---------------|--------------|--------|
| MirrorInfoHubScreen | info.ts | Ready |
| MirrorContactsListScreen | contacts.ts | Ready |
| MirrorContactDetailScreen | contacts.ts | Ready |

---

## D) Coverage Summary

| Metric | Count |
|--------|-------|
| Total production screens | 23 |
| Screens with mirrors | 22 |
| Excluded screens (dev-only) | 1 |
| **Mirror coverage** | **100%** |
| Total fixture files | 12 |
| Mirror routes in MirrorStackParamList | 26 |

---

## E) Fixture Files Inventory

| Fixture File | Exports | Used By |
|--------------|---------|---------|
| home.ts | bannersFixture, eventsFixture, categoriesFixture, heroFixture | MirrorHomeCompositeScreen |
| transport.ts | seaLinesFixture, roadLinesFixture, seaTodayDeparturesFixture, roadTodayDeparturesFixture, bannersFixture, menuItemsFixture | Transport mirrors |
| transportDetail.ts | lineDetailFixture, roadLineDetailFixture, seaLineDetailFixture, departuresFixture, timelineFixture | Line detail mirrors |
| events.ts | eventsFixture, calendarEventsFixture, eventDetailFixture | Events mirrors |
| inbox.ts | messagesFixture, inboxDetailFixture, tabsFixture | Inbox mirrors |
| feedback.ts | feedbackFormFixture, feedbackConfirmationFixture, feedbackDetailFixture | Feedback mirrors |
| clickfix.ts | clickFixFormFilledFixture, clickFixConfirmationFixture, clickFixDetailFixture | Click & Fix mirrors |
| static.ts | staticPageFixture | MirrorStaticPageScreen |
| settings.ts | settingsFixture, settingsLabels | MirrorSettingsScreen |
| onboarding.ts | languageSelectionFixture, userModeSelectionFixture, municipalitySelectionFixture | Onboarding mirrors |
| info.ts | infoHubFixture | MirrorInfoHubScreen |
| contacts.ts | contactsListFixture, contactDetailFixture | Contact mirrors |

---

## F) Navigation Structure

```
MirrorStackParamList (dev-only, isolated from production)
├── MirrorHome (entry point)
├── MirrorMenuOverlay
├── MirrorTransportHub
├── MirrorTransportRoad
├── MirrorTransportSea
├── MirrorRoadLineDetail
├── MirrorSeaLineDetail
├── MirrorEvents
├── MirrorEventDetail
├── MirrorInboxList
├── MirrorInboxDetail
├── MirrorFeedbackForm
├── MirrorFeedbackConfirmation
├── MirrorFeedbackDetail
├── MirrorClickFixForm
├── MirrorClickFixConfirmation
├── MirrorClickFixDetail
├── MirrorStaticPage
├── MirrorSettings
├── MirrorLanguageSelection
├── MirrorUserModeSelection
├── MirrorMunicipalitySelection
├── MirrorHomeComposite
├── MirrorInfoHub
├── MirrorContactsList
└── MirrorContactDetail
```

Mirror routes are defined in `MirrorStackParamList` (navigation/types.ts), completely isolated from production `MainStackParamList`.
