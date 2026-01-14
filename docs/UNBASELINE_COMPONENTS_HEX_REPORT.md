# Unbaseline Components Hex Report

## Summary
Removed hardcoded hex colors from `Banner` and `DepartureItem` by replacing them with semantic skin tokens, then refreshed the design-guard baseline.

## Hex replacements

Banner (`mobile/src/components/Banner.tsx`)
- `#FFF3CD` -> `skin.colors.warningBackground`
- `#FFC107` -> `skin.colors.warningAccent`
- `#F8D7DA` -> `skin.colors.errorBackground`
- `#DC3545` -> `skin.colors.urgent`
- `#FFFFFF` -> `skin.colors.urgentText`
- `#856404` -> `skin.colors.warningText`
- `#721C24` -> `skin.colors.errorText`
- `#666666` -> `skin.colors.textMuted`
- `#999999` -> `skin.colors.chevron`

DepartureItem (`mobile/src/components/DepartureItem.tsx`)
- `#FFFFFF` -> `skin.colors.backgroundTertiary`
- `#000000` -> `skin.colors.border` / `skin.colors.textPrimary` (borders + primary text/dots)
- `#666666` -> `skin.colors.textMuted`
- `#856404` -> `skin.colors.warningText`
- `#FFF3CD` -> `skin.colors.warningBackground`
- `#CCCCCC` -> `skin.colors.borderLight`
- `#333333` -> `skin.colors.textSecondary`

## Verification summary

- `rg -n "#[0-9a-fA-F]{3,8}\\b" mobile/src/components/Banner.tsx mobile/src/components/DepartureItem.tsx`
  - No matches.
- `node scripts/design-guard.mjs all`
  - Pass.
- `pnpm -r typecheck`
  - Pass.
- `pnpm -r lint`
  - Fail due to pre-existing lint issues unrelated to this change.
  - Example errors:
    - `backend/src/types/static-page.ts`: `@typescript-eslint/no-empty-object-type`
    - `mobile/src/navigation/types.ts`: `@typescript-eslint/no-empty-object-type`
    - `src/components/layout/MainMenu.tsx`: `@typescript-eslint/no-explicit-any`
    - `mobile/dist/_expo/static/js/ios/index-*.js`: multiple complexity/max-statements violations

## Baseline size

- Before refresh: 24 violations
- After refresh: 0 violations
