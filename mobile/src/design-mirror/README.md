# Design Mirror (DEV ONLY)

> **Status: COMPLETE** - Baseline locked as of 2026-01-20

## What This Is

The Design Mirror is an **isolated, dev-only sandbox** for visual auditing and UI polishing.
It mirrors all production screens using **deterministic fixtures** instead of live data,
allowing designers and developers to inspect and refine visual elements without affecting
production behavior.

## Design Mirror Baseline Lock

**Date:** 2026-01-20
**Commit:** `1c860a488cb9e7b44f983e83635ae80e949df91c`

**The Design Mirror is the canonical visual reference for the app.**

- Mirrors are complete for all 22 production screens (100% coverage)
- Production screens must match mirrors, not the other way around
- Any future UI change requires updating the mirror first
- Mirrors are design-only and never shipped to production

## What This Must NEVER Do

1. **NEVER modify production screens or components** outside this folder
2. **NEVER import repositories, hooks, or services that fetch network data**
3. **NEVER be accessible in production builds** (gated by `__DEV__`)
4. **NEVER use raw hex colors, magic numbers, or non-tokenized values** - use skin tokens only
5. **NEVER introduce "improvements" or UX changes** - mirror must replicate exactly
6. **NEVER change app navigation flows, menus, or business logic**

## Folder Structure

```
mobile/src/design-mirror/
├── README.md                           # This file
├── DESIGN_MIRROR_COVERAGE.md           # Coverage matrix and lock statement
├── screens/                            # Mirror screen implementations (27 files)
│   ├── MirrorHomeScreen.tsx            # Entry point - lists all mirrors
│   ├── MirrorHomeCompositeScreen.tsx   # Home screen mirror
│   ├── MirrorTransportHubScreen.tsx    # Transport hub mirror
│   ├── MirrorTransportRoadScreen.tsx   # Road transport mirror
│   ├── MirrorTransportSeaScreen.tsx    # Sea transport mirror
│   ├── MirrorRoadLineDetailScreen.tsx  # Road line detail mirror
│   ├── MirrorSeaLineDetailScreen.tsx   # Sea line detail mirror
│   ├── MirrorLineDetailScreen.tsx      # Generic line detail mirror
│   ├── MirrorEventsScreen.tsx          # Events list mirror
│   ├── MirrorEventDetailScreen.tsx     # Event detail mirror
│   ├── MirrorInboxListScreen.tsx       # Inbox list mirror
│   ├── MirrorInboxDetailScreen.tsx     # Inbox detail mirror
│   ├── MirrorFeedbackFormScreen.tsx    # Feedback form mirror
│   ├── MirrorFeedbackConfirmationScreen.tsx
│   ├── MirrorFeedbackDetailScreen.tsx
│   ├── MirrorClickFixFormScreen.tsx    # Click & Fix form mirror
│   ├── MirrorClickFixConfirmationScreen.tsx
│   ├── MirrorClickFixDetailScreen.tsx
│   ├── MirrorStaticPageScreen.tsx      # Static page mirror
│   ├── MirrorSettingsScreen.tsx        # Settings mirror
│   ├── MirrorLanguageSelectionScreen.tsx
│   ├── MirrorUserModeSelectionScreen.tsx
│   ├── MirrorMunicipalitySelectionScreen.tsx
│   ├── MirrorMenuOverlayScreen.tsx     # Menu overlay component mirror
│   ├── MirrorInfoHubScreen.tsx         # Future: Info hub
│   ├── MirrorContactsListScreen.tsx    # Future: Contacts list
│   └── MirrorContactDetailScreen.tsx   # Future: Contact detail
└── fixtures/                           # Static data fixtures (12 files)
    ├── home.ts
    ├── transport.ts
    ├── transportDetail.ts
    ├── events.ts
    ├── inbox.ts
    ├── feedback.ts
    ├── clickfix.ts
    ├── static.ts
    ├── settings.ts
    ├── onboarding.ts
    ├── info.ts
    └── contacts.ts
```

## How to Open MirrorHomeScreen

1. Open the app in **development mode** (`__DEV__` must be true)
2. Go to **Settings** screen
3. In the "Developer Tools" section, tap **"Design Mirror (DEV)"**

The Design Mirror entry is only visible in dev builds and will not appear in production.

## Navigation Isolation

Mirror routes are defined in `MirrorStackParamList` (navigation/types.ts), completely
isolated from production `MainStackParamList`. This ensures:

- Type safety: mirror routes don't pollute production navigation types
- Runtime safety: mirrors can't be accidentally accessed in production
- Clean separation: design-only code stays in design-mirror folder

## STOP + ASK Rules

If you encounter any of the following situations while working on the mirror:

- A screen cannot be mirrored exactly due to **missing skin tokens**
- A screen requires **new primitives** not available in `/ui/`
- A component has **runtime dependencies** that cannot be safely mocked with fixtures
- The mirror would require changes to files **outside** `mobile/src/design-mirror/`

**STOP and ask before proceeding.** Do not introduce workarounds.

## Token Contract

All styling in mirror screens must use:
- `skin.colors.*` for colors
- `skin.spacing.*` for spacing
- `skin.borders.*` for borders
- `skin.typography.*` for typography
- `skin.shadows.*` for shadows
- `skin.components.*` for component-specific tokens
- `Icon` primitive from `../../ui/Icon`
- Text primitives (`H1`, `H2`, `Label`, `Body`, `Meta`, `ButtonText`) from `../../ui/Text`

## Coverage Status

| Domain | Screens | Status |
|--------|---------|--------|
| Home | 1 | Complete |
| Transport | 6 | Complete |
| Events | 2 | Complete |
| Inbox | 2 | Complete |
| Feedback | 3 | Complete |
| Click & Fix | 3 | Complete |
| Static | 1 | Complete |
| Settings | 1 | Complete |
| Onboarding | 3 | Complete |
| **Total** | **22** | **100%** |

See [DESIGN_MIRROR_COVERAGE.md](./DESIGN_MIRROR_COVERAGE.md) for detailed coverage matrix.
