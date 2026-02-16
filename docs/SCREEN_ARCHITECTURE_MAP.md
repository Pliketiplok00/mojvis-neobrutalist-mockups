# Screen Architecture Map

> MOJ VIS Mobile App - Design System Documentation
> Generated: 2026-02-12

---

## Table of Contents

1. [Overview](#overview)
2. [Screen Inventory](#screen-inventory)
   - [Home & Navigation](#home--navigation)
   - [Inbox](#inbox)
   - [Transport](#transport)
   - [Events](#events)
   - [Flora & Fauna](#flora--fauna)
   - [Feedback & Click-Fix](#feedback--click-fix)
   - [Onboarding](#onboarding)
   - [Services & Pages](#services--pages)
   - [Development](#development)
3. [Cross-Screen Pattern Map](#cross-screen-pattern-map)
4. [Pattern Sharing Analysis](#pattern-sharing-analysis)

---

## Overview

The MOJ VIS mobile app contains **29 screen files** organized into functional domains. All screens follow the neobrutalist design language with consistent use of skin tokens.

**Mandatory Elements:**
- GlobalHeader on every screen (hamburger menu, "MOJ VIS" title, inbox icon)
- Screen wrapper with SafeAreaView
- BannerList for system notifications (where applicable)

---

## Screen Inventory

### Home & Navigation

#### HomeScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/home/HomeScreen.tsx` |
| **Purpose** | Landing screen with quick access to app features |
| **Components** | Header, H1, H2, Body, Label, Meta, Icon, IconBox, BannerList |
| **Layout** | Banner → Hero Slab → 2x2 Category Grid → Upcoming Events → Feedback CTA |
| **Special Cases** | First event card uses `warningAccent` background highlight |

---

### Inbox

#### InboxListScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/inbox/InboxListScreen.tsx` |
| **Purpose** | List of received and sent messages with filtering |
| **Components** | Header, Badge, Button, Label, Body, Meta, Icon, LoadingState, EmptyState, ErrorState, BannerList |
| **Layout** | Tabs (Received/Sent) → Tag Filter Bar → Message List (FlatList) |
| **Special Cases** | Tag filter chips with neobrut shadow on selection; STATUS_COLORS mapping for badges; Municipal tags shown only to matching users |

#### InboxDetailScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/inbox/InboxDetailScreen.tsx` |
| **Purpose** | Display single inbox message with full content |
| **Components** | Header, Badge, H1, Body, Meta, Icon, LinkText, LoadingState, ErrorState |
| **Layout** | Urgent Badge → Tags → Title → Date → Body (with clickable links) |
| **Special Cases** | 'hitno' tag filtered from display; LinkText for URL detection |

---

### Transport

#### TransportHubScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/transport/TransportHubScreen.tsx` |
| **Purpose** | Entry point to transport timetables |
| **Components** | Header, BannerList, H1, Label, Meta, Icon, Button |
| **Layout** | Banner → Title → 2 Colored Tiles (Road/Sea) → Info Note |
| **Special Cases** | Fully tokenized, no special conditional rendering |

#### RoadTransportScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/transport/RoadTransportScreen.tsx` |
| **Purpose** | Road (bus) transport lines and today's departures |
| **Components** | Header, BannerList, Badge, Button, H1, H2, Label, Meta, Icon |
| **Layout** | Banner → Green Header Slab → Lines List (2-part cards) → Today's Departures |
| **Special Cases** | Green time blocks (`todayTimeBlockBackgroundRoad`); formatTime() helper |

#### SeaTransportScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/transport/SeaTransportScreen.tsx` |
| **Purpose** | Sea transport lines and today's departures |
| **Components** | Same as RoadTransportScreen |
| **Layout** | Banner → Blue Header Slab → Lines List → Today's Departures |
| **Special Cases** | **Line 659 yellow highlight** (seasonal line); Blue time blocks; getSeaHeaderBackground() conditional |

#### LineDetailScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/transport/LineDetailScreen.tsx` |
| **Purpose** | Detailed timetable for a specific line |
| **Components** | Header, BannerList, DepartureItem, H1, H2, Label, Meta, Body, Icon, LoadingState, ErrorState |
| **Layout** | Banner → Colored Header → Date Selector Card → Direction Tabs → Route Info → Departures List → Ticket Info Box → Contacts |
| **Special Cases** | SEA_LINE_CARRIERS mapping for ticket URLs; Platform-specific date picker (Modal iOS, native Android); Direction toggle tabs |

#### RoadLineDetailScreen / SeaLineDetailScreen

| Property | Value |
|----------|-------|
| **Files** | `mobile/src/screens/transport/RoadLineDetailScreen.tsx`, `SeaLineDetailScreen.tsx` |
| **Purpose** | Wrapper components for LineDetailScreen |
| **Components** | Delegates to LineDetailScreen |
| **Layout** | Passes `transportType` prop |
| **Special Cases** | None (thin wrappers) |

---

### Events

#### EventsScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/events/EventsScreen.tsx` |
| **Purpose** | Calendar view with event listings |
| **Components** | Header, BannerList, H1, H2, Label, Body, Meta, Icon |
| **Layout** | Hero Slab → Calendar Grid → Selected Day Events List |
| **Special Cases** | Calendar day priority: Selected > Today > HasEvents; Event indicator (blue square); Neobrut shadow only on selected day |

#### EventDetailScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/events/EventDetailScreen.tsx` |
| **Purpose** | Single event detail with reminder functionality |
| **Components** | Header, LoadingState, ErrorState, H1, Label, Body, Meta, Icon, Button, Switch |
| **Layout** | Optional Hero Image → Yellow Title Slab → Info Tiles (Clock/MapPin/User) → Description → Reminder Toggle → Share Button |
| **Special Cases** | Hardcoded reminder toggle styling; Share API integration |

---

### Flora & Fauna

#### FaunaScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/fauna/FaunaScreen.tsx` |
| **Purpose** | Island fauna information and conservation |
| **Components** | Header, HeroMediaHeader, Icon, H2, Body, Meta, Label, FaunaSpeciesCard |
| **Layout** | Hero Carousel → Why Special Section → Highlights → Warning Card → Species List → Sensitive Areas → Closing Note |
| **Special Cases** | Warning card with urgent border; Sensitive area overlay with `sensitiveAreaBg`; Wikimedia image handling |

#### FloraScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/flora/FloraScreen.tsx` |
| **Purpose** | Island flora information and conservation |
| **Components** | Same as FaunaScreen |
| **Layout** | Identical structure to FaunaScreen |
| **Special Cases** | "Do Not Touch" warning instead of "Do Not Disturb" |

#### FaunaSpeciesCard / FloraSpeciesCard

| Property | Value |
|----------|-------|
| **Files** | `mobile/src/screens/fauna/components/FaunaSpeciesCard.tsx`, `flora/components/FloraSpeciesCard.tsx` |
| **Purpose** | Species display cards for Flora/Fauna screens |
| **Components** | Local helper components |
| **Layout** | Image + Name + Description card |
| **Special Cases** | Wikimedia thumbnail handling |

---

### Feedback & Click-Fix

#### FeedbackFormScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/feedback/FeedbackFormScreen.tsx` |
| **Purpose** | General feedback submission form |
| **Components** | Header, Button, Input, H1, H2, Body, Label, Meta |
| **Layout** | Title → Error Alert → Subject Field → Body Field → Submit Button |
| **Special Cases** | VALIDATION_LIMITS constants (SUBJECT: 120, BODY: 4000); KeyboardAvoidingView |

#### FeedbackDetailScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/feedback/FeedbackDetailScreen.tsx` |
| **Purpose** | View submitted feedback and replies |
| **Components** | Header, H2, Body, Label, Meta, ButtonText, LoadingState, ErrorState |
| **Layout** | Status Badge → Original Message Card → Replies Section |
| **Special Cases** | STATUS_COLORS mapping; formatDateTimeCroatian() helper |

#### FeedbackConfirmationScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx` |
| **Purpose** | Success confirmation after feedback submission |
| **Components** | Header, Icon, Button, H1, Body |
| **Layout** | Success Icon (80x80 circle) → Title → Message → Action Buttons |
| **Special Cases** | Hardcoded icon container size (80x80) |

#### ClickFixFormScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/click-fix/ClickFixFormScreen.tsx` |
| **Purpose** | Report problems with photo and location |
| **Components** | Header, ServicePageHeader, FormSectionHeader, PhotoSlotTile, Button, Input, Icon, Body, Label, Meta |
| **Layout** | Orange Header → Location Section → Photos (3 slots) → Subject → Description → Submit |
| **Special Cases** | Location card success styling; 3-column photo grid; ImagePicker + Location permissions |

#### ClickFixDetailScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx` |
| **Purpose** | View submitted report and replies |
| **Components** | Header, H2, Body, Label, Meta, ButtonText, Icon, LoadingState, ErrorState |
| **Layout** | Status Badge → Message Card (with location) → Photos Scroll → Replies |
| **Special Cases** | Photo modal with close button (hardcoded position); Monospace font for coordinates (platform-specific) |

#### ClickFixConfirmationScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx` |
| **Purpose** | Success confirmation after report submission |
| **Components** | Same as FeedbackConfirmationScreen |
| **Layout** | Identical to FeedbackConfirmationScreen |
| **Special Cases** | Same hardcoded sizes |

---

### Onboarding

#### LanguageSelectionScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/onboarding/LanguageSelectionScreen.tsx` |
| **Purpose** | Initial language selection |
| **Components** | Button, H2, Body |
| **Layout** | Blue Identity Zone → Black Divider → Amber Action Zone with 2 Language Buttons |
| **Special Cases** | Logo size: 40% screen width (hardcoded); Bilingual welcome text |

#### UserModeSelectionScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/onboarding/UserModeSelectionScreen.tsx` |
| **Purpose** | Choose visitor or local mode |
| **Components** | SafeAreaView, H2, Body, Meta, OnboardingRoleCard |
| **Layout** | Title → 2 Role Cards (Visitor/Local) → Bilingual Hint |
| **Special Cases** | Visitor skips municipality selection |

#### MunicipalitySelectionScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/onboarding/MunicipalitySelectionScreen.tsx` |
| **Purpose** | Choose municipality (Vis or Komiža) |
| **Components** | TouchableOpacity, H1, H2, Body, Label, Meta, Icon, Card |
| **Layout** | Back Button → Title → 2 Municipality Cards → Hint |
| **Special Cases** | Hardcoded municipality names (Vis, Komiža) |

#### OnboardingRoleCard

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/onboarding/components/OnboardingRoleCard.tsx` |
| **Purpose** | Reusable card for user mode selection |
| **Components** | Local component |
| **Layout** | Icon + Title + Description |
| **Special Cases** | Visitor/Local variant colors |

---

### Services & Pages

#### JavneUslugeScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/services/JavneUslugeScreen.tsx` |
| **Purpose** | Public services directory |
| **Components** | Header, ServicePageHeader, ServiceAccordionCard, EmergencyTile, Icon, H2, Body |
| **Layout** | Teal Header → Accordion Service Cards → Emergency Numbers Row → Useful Links |
| **Special Cases** | Dynamic color lookup from content data; Linking.openURL() for phone/links |

#### StaticPageScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/pages/StaticPageScreen.tsx` |
| **Purpose** | Dynamic CMS-driven content pages |
| **Components** | Header, HeroMediaHeader, Button, H1, H2, Label, Body, Meta, ButtonText, Icon, LoadingState, ErrorState |
| **Layout** | Page Header (hero or simple) → Dynamic Content Blocks |
| **Special Cases** | 8 block types (text, highlight, card_list, media, map, contact, link_list, notice); Tile layout detection (2 cards = side-by-side); Highlight bullet parsing |

---

### Development

#### UiInventoryScreen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/screens/dev/UiInventoryScreen.tsx` |
| **Purpose** | Comprehensive UI component catalog |
| **Components** | All UI primitives |
| **Layout** | Sections: Typography, Colors, Icons, Badges, Buttons, Inputs, Spacing, Borders, Shadows, Transport Elements |
| **Special Cases** | DEV-only (`__DEV__` flag); Demo values for all components |

---

## Cross-Screen Pattern Map

### Hero Headers

| Pattern | Screens | Implementation |
|---------|---------|----------------|
| HeroMediaHeader (carousel + title slab) | FaunaScreen, FloraScreen, StaticPageScreen, EventDetailScreen | **Shared** via `ui/HeroMediaHeader.tsx` |
| Colored Header Slab (transport) | TransportHubScreen, RoadTransportScreen, SeaTransportScreen, LineDetailScreen | **Duplicated** inline per screen |
| ServicePageHeader (colored band) | ClickFixFormScreen, JavneUslugeScreen | **Shared** via `components/services/ServicePageHeader.tsx` |

### Section Titles

| Pattern | Screens | Implementation |
|---------|---------|----------------|
| H2 + spacing | HomeScreen, various | Inline |
| Section component | Various list screens | **Shared** via `ui/Section.tsx` |
| FormSectionHeader | ClickFixFormScreen, FeedbackFormScreen | **Shared** via `components/common/FormSectionHeader.tsx` |

### Card Layouts

| Pattern | Screens | Implementation |
|---------|---------|----------------|
| Line cards (2-part: header + body) | RoadTransportScreen, SeaTransportScreen | **Duplicated** (same structure, different colors) |
| Event cards | HomeScreen, EventsScreen | **Duplicated** (similar structure) |
| Service accordion cards | JavneUslugeScreen | **Shared** via `ServiceAccordionCard` |
| Onboarding role cards | UserModeSelectionScreen | **Shared** via `OnboardingRoleCard` |
| Message list items | InboxListScreen | Inline implementation |

### Tab Navigation

| Pattern | Screens | Implementation |
|---------|---------|----------------|
| Direction tabs (0/1) | LineDetailScreen | Inline |
| Received/Sent tabs | InboxListScreen | Inline |

Both use `components.tab.*` tokens but are inline implementations.

### Date Selectors

| Pattern | Screens | Implementation |
|---------|---------|----------------|
| Date selector card + modal | LineDetailScreen | Unique implementation |
| Calendar grid | EventsScreen | Unique implementation |

### Confirmation Screens

| Pattern | Screens | Implementation |
|---------|---------|----------------|
| Success icon + title + buttons | FeedbackConfirmationScreen, ClickFixConfirmationScreen | **Duplicated** (nearly identical) |

---

## Pattern Sharing Analysis

### Shared Patterns (Good)

| Pattern | Component | Consumers |
|---------|-----------|-----------|
| Hero with carousel | `HeroMediaHeader` | 4 screens |
| Service page header | `ServicePageHeader` | 2 screens |
| Form section header | `FormSectionHeader` | 2 screens |
| Service accordion | `ServiceAccordionCard` | 1 screen (extensible) |
| Photo upload slot | `PhotoSlotTile` | 1 screen (extensible) |
| Info row | `InfoRow` | ServiceAccordionCard |

### Duplicated Patterns (Debt)

| Pattern | Duplicated In | Impact |
|---------|---------------|--------|
| Transport header slabs | 4 transport screens | Medium - inconsistency risk |
| Line cards | 2 transport screens | Low - well-tokenized |
| Event cards | 2 screens | Low - slight differences |
| Tab navigation | 2 screens | Low - different contexts |
| Confirmation screens | 2 screens | High - nearly identical code |

### Unique Implementations

| Pattern | Screen | Reason |
|---------|--------|--------|
| Calendar grid | EventsScreen | Complex custom logic |
| Date selector | LineDetailScreen | Platform-specific handling |
| Menu overlay | MenuOverlay | App-wide singleton |
| Block renderer | StaticPageScreen | CMS-driven dynamic content |

---

*End of Screen Architecture Map*
