# Transport Headers & Tabs - Changelog

## Overview

This document summarizes the transport UI consolidation work merged to main on 2026-02-12.

## Changes

### SeaTransportScreen (List Cards)

| Before | After |
|--------|-------|
| Header background varied by subtype (blue for ferry, teal for catamaran, yellow for 659) | All sea cards use TEAL header background |
| Icon varied by subtype (ship for ferry, anchor for catamaran) | All sea cards use SHIP icon |
| Line 659 had full yellow card with black text | Line 659 has teal header like others |
| Subtype shown as single badge | Subtype + seasonal badges stacked vertically for 659 |

### LineDetailScreen (Sea Lines)

| Before | After |
|--------|-------|
| Subtype shown as Meta text in headerMetaRow | Subtype shown as Badge (right-aligned) for sea transport |
| No seasonal badge | Line 659 shows seasonal badge stacked under subtype |
| headerMetaRow structure | Preserved - duration meta still displays correctly |

### i18n

- Added `transport.seasonal` key:
  - HR: "SEZONSKA"
  - EN: "SEASONAL"
- Existing `transport.line659Seasonal` key unchanged (subtitle text)

## Screens Affected

| Screen | File | Changes |
|--------|------|---------|
| SeaTransportScreen | `mobile/src/screens/transport/SeaTransportScreen.tsx` | Header color, icon, badge stack |
| LineDetailScreen | `mobile/src/screens/transport/LineDetailScreen.tsx` | Badge stack for sea, headerMetaRow preserved |

## Edge Cases Verified

| Case | Expected Behavior | Status |
|------|-------------------|--------|
| Line 659 (seasonal catamaran) | Teal header, ship icon, KATAMARAN + SEZONSKA badges stacked | Verified |
| Line 9602 (Krilo catamaran) | Teal header, ship icon, subtype badge only | Verified |
| Line 602/612 (ferry) | Teal header, ship icon, TRAJEKT badge | Verified |
| Road lines | Green header, bus icon, subtype as Meta in headerMetaRow | Unchanged |
| LineDetail 659 | Badge stack visible, headerMetaRow shows duration | Verified |

## Intentionally NOT Changed

| Item | Reason |
|------|--------|
| TransportHubScreen header tiles | Out of scope - separate component |
| DepartureItem tokens (`lineDetail.*`) | Risk of regression - other components depend on these |
| design-mirror screens | Deprecated/experimental - not production |
| Inbox tabs | Unchanged - working correctly |
| Road transport screens | Only sea-specific changes made |

## Commits

1. `3c357e8` - ui(sea-transport): teal headers + consistent seasonal badge + fix 659 text
2. `2161979` - fix(line-detail): restore headerMetaRow structure and keep seasonal badge stack
3. `dc6ffd5` - fix(i18n): add missing transport.seasonal translation key

## Files Changed

```
mobile/src/i18n/locales/en.json
mobile/src/i18n/locales/hr.json
mobile/src/screens/transport/LineDetailScreen.tsx
mobile/src/screens/transport/SeaTransportScreen.tsx
```
