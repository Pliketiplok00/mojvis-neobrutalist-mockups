# Design Contract Lock (MOJ VIS Mobile)

## Design-controlled via skin

- Colors (semantic tokens only)
- Typography (font families, sizes, weights)
- Spacing scale
- Border radius
- Icon set (lucide only, via Icon primitive)

## Not design-controlled

- Layout logic
- Conditional rendering
- Data/state logic
- Navigation structure

## Rules

- No raw hex values in components or screens
- No emoji icons in UI
- No direct lucide imports outside Icon.tsx
- All visual changes must be done via skin files

## Guardrail scope

- mobile/src/components
- mobile/src/screens/transport
- mobile/src/screens/inbox

## Statement

“Any design change respecting this contract will not require code refactors.”
