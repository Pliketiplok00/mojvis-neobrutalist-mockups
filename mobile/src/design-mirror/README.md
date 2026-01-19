# Design Mirror (DEV ONLY)

## What This Is

The Design Mirror is an **isolated, dev-only sandbox** for visual auditing and UI polishing.
It mirrors existing mobile screens using **deterministic fixtures** instead of live data,
allowing designers and developers to inspect and refine visual elements without affecting
production behavior.

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
├── README.md              # This file
├── screens/               # Mirror screen implementations
│   ├── MirrorHomeScreen.tsx
│   ├── MirrorMenuOverlayScreen.tsx
│   ├── MirrorTransportSeaScreen.tsx
│   └── MirrorTransportRoadScreen.tsx
├── components/            # Mirror-specific helper components (if needed)
└── fixtures/              # Static data fixtures for mirrors
    └── transport.ts       # Transport-related fixture data
```

## How to Open MirrorHomeScreen

1. Open the app in **development mode** (`__DEV__` must be true)
2. Go to **Settings** screen
3. In the "Developer Tools" section, tap **"Design Mirror (DEV)"**

The Design Mirror entry is only visible in dev builds and will not appear in production.

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
- Text primitives (`H1`, `H2`, `Label`, `Body`, `Meta`) from `../../ui/Text`
