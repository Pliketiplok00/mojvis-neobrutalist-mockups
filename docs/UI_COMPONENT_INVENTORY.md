# UI Component Inventory

> MOJ VIS Mobile App - Design System Documentation
> Generated: 2026-02-12

---

## Table of Contents

1. [Overview](#overview)
2. [UI Primitives](#ui-primitives-mobilesrcui)
3. [Composite Components](#composite-components-mobilesrccomponents)
4. [Component Dependency Graph](#component-dependency-graph)

---

## Overview

The MOJ VIS mobile app uses a two-tier component architecture:

- **UI Primitives** (`mobile/src/ui/`) - Low-level, reusable building blocks
- **Composite Components** (`mobile/src/components/`) - Higher-level, feature-specific components

All components follow the "skin-pure" principle: visual properties are driven by tokens from `skin.neobrut2.ts` with no hardcoded hex colors.

---

## UI Primitives (`mobile/src/ui/`)

### Button

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/Button.tsx` |
| **Purpose** | Primary, secondary, and danger button variants with neobrut offset shadow |
| **Token Dependencies** | `components.button.*` (primary/secondary/danger variants, borderRadius, padding, shadow) |
| **Styling Props** | `variant` ('primary', 'secondary', 'danger'), `disabled`, `loading`, `shadow` |
| **Used By** | HomeScreen, InboxListScreen, EventDetailScreen, FeedbackFormScreen, ClickFixFormScreen, SettingsScreen |

### Text (H1, H2, Label, Body, Meta, ButtonText)

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/Text.tsx` |
| **Purpose** | Typography primitives with consistent font families and sizes |
| **Token Dependencies** | `typography.fontSize.*`, `typography.fontFamily.*`, `colors.textPrimary`, `colors.textSecondary` |
| **Styling Props** | `color`, `style` |
| **Used By** | Every screen and component |

### Icon

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/Icon.tsx` |
| **Purpose** | Skin-controlled icon component using lucide-react-native |
| **Token Dependencies** | `icons.size.*` (xs-xl), `icons.strokeWidth.*` (light/regular/strong), `colors[colorToken]` |
| **Styling Props** | `name`, `size`, `stroke`, `colorToken`, `color` |
| **Used By** | Every screen and component requiring icons |

### Card

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/Card.tsx` |
| **Purpose** | Base card surface with variant system (default, outlined, filled, selection, onboardingSelection) |
| **Token Dependencies** | `components.card.*`, `colors.primary`, `colors.secondary`, `borders.*` |
| **Styling Props** | `variant`, `onPress`, `disabled`, `pressFeedbackColorToken`, `backgroundColor` |
| **Used By** | HomeScreen, MunicipalitySelectionScreen, various list screens |

### Header

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/Header.tsx` |
| **Purpose** | Thin wrapper around GlobalHeader for skin-aware header usage |
| **Token Dependencies** | (delegates to GlobalHeader) |
| **Styling Props** | `type` ('root', 'child', 'inbox'), `onMenuPress`, `unreadCount` |
| **Used By** | All screens via GlobalHeader |

### Badge

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/Badge.tsx` |
| **Purpose** | Status/category badges with 8 variants |
| **Token Dependencies** | `colors.urgent/info/success/warning/pending`, `components.badge.*` |
| **Styling Props** | `variant` (urgent/info/success/warning/pending/type/transport/default), `size` (default/compact/large), `backgroundColor`, `textColor` |
| **Used By** | InboxListScreen, InboxDetailScreen, EventsScreen, transport screens |

### Input

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/Input.tsx` |
| **Purpose** | Text input component for forms with error/focus states |
| **Token Dependencies** | `components.input.*`, `typography.fontFamily.body.regular` |
| **Styling Props** | `error`, `disabled`, `multiline`, `numberOfLines`, `height`, `maxLength` |
| **Used By** | FeedbackFormScreen, ClickFixFormScreen |

### LinkText

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/LinkText.tsx` |
| **Purpose** | Text component with automatic URL detection and clickable links |
| **Token Dependencies** | `colors.link` |
| **Styling Props** | `linkColor`, `style` |
| **Used By** | InboxDetailScreen, StaticPageScreen |

### ListRow

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/ListRow.tsx` |
| **Purpose** | Row component with optional chevron for lists and menus |
| **Token Dependencies** | `components.listRow.*`, `colors.backgroundUnread` |
| **Styling Props** | `showChevron`, `rightAccessory`, `highlighted` |
| **Used By** | SettingsScreen, menu lists |

### Section

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/Section.tsx` |
| **Purpose** | Section wrapper with title/subtitle and content area |
| **Token Dependencies** | `components.section.*` |
| **Styling Props** | `title`, `subtitle` |
| **Used By** | HomeScreen sections, various list screens |

### Screen

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/Screen.tsx` |
| **Purpose** | Full-screen container with SafeAreaView, optional scroll, test mode watermark |
| **Token Dependencies** | `colors.background`, `spacing.lg`, `spacing.xxxl`, `colors.testWatermark*` |
| **Styling Props** | `scroll`, `padded`, `style`, `contentStyle` |
| **Used By** | All screens as root container |

### HeroMediaHeader

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/HeroMediaHeader.tsx` |
| **Purpose** | Hero header with image carousel, pagination dots, and yellow title slab |
| **Token Dependencies** | `colors.accent`, `colors.border`, `colors.backgroundSecondary`, `spacing.*`, `borders.widthHeavy` |
| **Styling Props** | `images`, `title`, `subtitle`, `placeholder` |
| **Used By** | FaunaScreen, FloraScreen, StaticPageScreen, EventDetailScreen |

### States (LoadingState, EmptyState, ErrorState)

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/States.tsx` |
| **Purpose** | Consistent state displays for async operations |
| **Token Dependencies** | `colors.textPrimary`, `colors.textMuted`, `spacing.*` |
| **Styling Props** | `message`, `onRetry`, `retryLabel`, `icon`, `title`, `subtitle` |
| **Used By** | All screens with async data loading |

### MicroPrimitives (NotificationBadge, Hairline, Dot, IconBox)

| Property | Value |
|----------|-------|
| **File** | `mobile/src/ui/MicroPrimitives.tsx` |
| **Purpose** | Small reusable building blocks |
| **Token Dependencies** | `colors.urgent`, `borders.*`, `spacing.xs`, `colors.unreadIndicator` |
| **Styling Props** | `count` (NotificationBadge), `size`/`color` (Dot), `size` (IconBox) |
| **Used By** | GlobalHeader (badge), various indicators |

---

## Composite Components (`mobile/src/components/`)

### Banner / BannerList

| Property | Value |
|----------|-------|
| **File** | `mobile/src/components/Banner.tsx` |
| **Purpose** | System notification banners in V1 Poster style |
| **Token Dependencies** | `colors.amber`, `colors.orange`, `colors.urgent`, `colors.border`, `borders.widthHeavy`, `spacing.md` |
| **Styling Props** | `message` (InboxMessage), `isUrgent` |
| **Used By** | HomeScreen, TransportHubScreen, EventsScreen, transport screens |

### DepartureItem

| Property | Value |
|----------|-------|
| **File** | `mobile/src/components/DepartureItem.tsx` |
| **Purpose** | Transport departure with expandable stop times timeline |
| **Token Dependencies** | `components.transport.lineDetail.*` (30+ tokens including timeBlock, timeline, shadow) |
| **Styling Props** | `departure` (DepartureResponse), `transportType` ('sea', 'road') |
| **Used By** | LineDetailScreen, SeaTransportScreen, RoadTransportScreen |

### GlobalHeader

| Property | Value |
|----------|-------|
| **File** | `mobile/src/components/GlobalHeader.tsx` |
| **Purpose** | Fixed header bar (mandatory on all screens) with menu, title, inbox |
| **Token Dependencies** | `components.header.*`, `colors.warningAccent`, `colors.primary`, `colors.border`, `borders.widthCard` |
| **Styling Props** | `type` ('root', 'child', 'inbox'), `unreadCount` |
| **Used By** | All screens (mandatory) |

### MenuOverlay

| Property | Value |
|----------|-------|
| **File** | `mobile/src/components/MenuOverlay.tsx` |
| **Purpose** | Slide-in overlay navigation menu |
| **Token Dependencies** | `colors.overlay`, `colors.backgroundTertiary`, `colors.primary`, `shadows.menuItemBox.*`, `typography.*` |
| **Styling Props** | `visible`, `currentRoute`, `onClose`, `onNavigate` |
| **Used By** | App root (accessible from all screens) |

### FormSectionHeader

| Property | Value |
|----------|-------|
| **File** | `mobile/src/components/common/FormSectionHeader.tsx` |
| **Purpose** | Reusable section header for form pages |
| **Token Dependencies** | `colors.textMuted`, `colors.textPrimary`, `colors.errorText`, `spacing.md`, `spacing.sm` |
| **Styling Props** | `icon`, `label`, `count`, `required` |
| **Used By** | ClickFixFormScreen, FeedbackFormScreen |

### InfoRow

| Property | Value |
|----------|-------|
| **File** | `mobile/src/components/common/InfoRow.tsx` |
| **Purpose** | Atomic row for labeled information display |
| **Token Dependencies** | `colors.textMuted`, `colors.textPrimary`, `spacing.sm`, `spacing.xxl`, `spacing.xs` |
| **Styling Props** | `icon`, `label`, `value` |
| **Used By** | ServiceAccordionCard (expanded state) |

### PhotoSlotTile

| Property | Value |
|----------|-------|
| **File** | `mobile/src/components/common/PhotoSlotTile.tsx` |
| **Purpose** | Photo upload slot with empty/filled states |
| **Token Dependencies** | `borders.widthThin`, `colors.border`, `colors.errorText`, `borders.radiusSharp`, `spacing.xs` |
| **Styling Props** | `photoUri`, `onPickPhoto`, `onRemove`, `disabled` |
| **Used By** | ClickFixFormScreen |

### EmergencyTile

| Property | Value |
|----------|-------|
| **File** | `mobile/src/components/services/EmergencyTile.tsx` |
| **Purpose** | Compact colored tile for emergency services in 3-column grid |
| **Token Dependencies** | `colors.border`, `colors.textPrimary`, `borders.widthThin`, `spacing.lg`, `spacing.sm` |
| **Styling Props** | `icon`, `name`, `phoneNumber`, `backgroundColor`, `textColor` |
| **Used By** | JavneUslugeScreen |

### ServiceAccordionCard

| Property | Value |
|----------|-------|
| **File** | `mobile/src/components/services/ServiceAccordionCard.tsx` |
| **Purpose** | Expandable accordion card for public services |
| **Token Dependencies** | `colors.background`, `colors.backgroundSecondary`, `colors.border`, `colors.textPrimary`, `borders.widthCard`, `borders.widthThin`, `spacing.*` |
| **Styling Props** | `icon`, `title`, `subtitle`, `badge`, `iconBackgroundColor`, `infoRows`, `note` |
| **Used By** | JavneUslugeScreen |

### ServicePageHeader

| Property | Value |
|----------|-------|
| **File** | `mobile/src/components/services/ServicePageHeader.tsx` |
| **Purpose** | Colored header slab for service/form pages |
| **Token Dependencies** | `colors[backgroundColor]` (teal/orange/primary/secondary/lavender), `colors.primaryText`, `borders.widthHeavy`, `spacing.lg`, `spacing.xl` |
| **Styling Props** | `title`, `subtitle`, `icon`, `backgroundColor` |
| **Used By** | ClickFixFormScreen, JavneUslugeScreen |

---

## Component Dependency Graph

```
Screen (container)
├── GlobalHeader (mandatory)
│   └── NotificationBadge
├── BannerList
│   └── Banner
└── [Screen-specific content]
    ├── UI Primitives (H1, H2, Body, Label, Meta, Icon, Button, Badge, Card, Input)
    ├── HeroMediaHeader (for detail screens)
    ├── States (Loading/Empty/Error)
    └── Composite Components (DepartureItem, ServiceAccordionCard, etc.)
```

### Primitive → Composite Usage

| Primitive | Used By Composites |
|-----------|-------------------|
| Icon | All composites |
| H1, H2, Body, Label, Meta | All composites |
| Badge | Banner, DepartureItem |
| Card | ServiceAccordionCard (base) |
| Button | ServicePageHeader (CTAs) |
| Input | (used directly in screens) |
| ListRow | MenuOverlay items |

---

*End of UI Component Inventory*
