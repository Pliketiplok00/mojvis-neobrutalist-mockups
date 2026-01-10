# Branch Design Infrastructure Audit

## Problem Statement
User reported seeing "old fonts + emoji icons" despite Phase 4A being complete and build markers confirming latest commit was running.

## Root Cause
**Phase 4A branch (`feat/mobile-skin-inbox-screens-phase4a`) did NOT contain the Phase 2/3 design infrastructure commits.**

The Phase 2/3 branches were never merged into `main`, and Phase 4A was created from `main`. This meant:
- Font loading infrastructure was never integrated into App.tsx
- Custom fonts (Space Grotesk, Space Mono) were never loaded at runtime
- The app was falling back to system fonts

## Ancestry Analysis

### Current Branch
- **Branch:** `feat/mobile-skin-inbox-screens-phase4a`
- **Commit:** `fdd4b6e`
- **Base:** `main` (commit `b0edf6b`)

### Phase 2/3 Commits Status

| Phase | Commit | Message | In Current Branch |
|-------|--------|---------|-------------------|
| 2A | `a74975b` | feat(mobile): integrate fonts + make GlobalHeader skin-pure | **NO** |
| 2B | `6d05fd7` | (Phase 2B) | **NO** |
| 2C | `0a0797e` | (Phase 2C) | **NO** |
| 2D | `04cc354` | (Phase 2D) | **NO** |
| 3A | `e740ddd` | (Phase 3A) | **NO** |
| 3B | `8326b9b` | (Phase 3B) | **NO** |
| 3CD | `1d9b41c` | feat(mobile): migrate TransportHubScreen and LineDetailScreen | **NO** |

**All Phase 2/3 commits existed in separate branches but were never merged to main.**

### Phase Branches (Local)
```
feat/mobile-skin-fonts-icons-phase1
feat/mobile-skin-globalheader-phase2a
feat/mobile-skin-menuoverlay-phase2b
feat/mobile-skin-banner-phase2c
feat/mobile-skin-departureitem-phase2d
feat/mobile-skin-sea-transport-screen-phase3a
feat/mobile-skin-road-transport-screen-phase3b
feat/mobile-skin-transport-hub-and-line-detail-phase3cd
```

Each branch was created independently from `main`, not building on previous phases.

## File State Before Fix

| File | Status |
|------|--------|
| `mobile/App.tsx` | **MISSING** `useAppFonts()` call |
| `mobile/src/ui/fonts.ts` | EXISTS (added in Phase 4A via checkout) |
| `mobile/src/ui/Icon.tsx` | EXISTS and exports correctly |
| `mobile/src/ui/skin.ts` | EXISTS and re-exports `skin.neobrut2` |
| `mobile/src/components/GlobalHeader.tsx` | Has hardcoded `#FFFFFF`, `#FF0000` |

## Fix Applied

### What Was Changed

**`mobile/App.tsx`** - Added font loading integration:

```typescript
// Added imports
import { useAppFonts } from './src/ui/fonts';
import { skin } from './src/ui/skin';

// Added font loading check in App component
const [fontsLoaded, fontError] = useAppFonts();

if (!fontsLoaded && !fontError) {
  return <FontLoadingScreen />;
}

if (fontError) {
  return <FontErrorScreen />;
}
```

Also added:
- `FontLoadingScreen` component with skin tokens
- `FontErrorScreen` component with skin tokens
- Updated styles using skin tokens

### Why Cherry-Pick/Merge Wasn't Used

The Phase 2A commit (`a74975b`) modified App.tsx, but the current App.tsx has evolved since then (Phase 5, 7, etc.). A direct cherry-pick would cause conflicts. Instead, the specific font-loading changes were manually applied to preserve all existing functionality.

## Verification Results

### Runtime Proof (Metro Logs)
```
LOG  APP_ROOT_PROOF: useAppFonts CALLED - fonts loading
LOG  APP_ROOT_PROOF: useAppFonts LOADED - fonts ready
```

**Fonts are now loading successfully!**

### Bundle Info
- Bundled 2992 modules in 13706ms
- No TypeScript errors

## Remaining Work

### GlobalHeader Migration (Not in This Fix)
`mobile/src/components/GlobalHeader.tsx` still has hardcoded colors:
- Line 119: `backgroundColor: '#FFFFFF'`
- Line 154: `backgroundColor: '#FF0000'`

This should be migrated in a separate phase to use skin tokens.

## Conclusion

| Item | Status |
|------|--------|
| **Phase 2/3 commits in ancestry** | NO (branches never merged) |
| **Font loading integrated** | **YES (fixed)** |
| **useAppFonts called at root** | **YES (fixed)** |
| **Custom fonts loading** | **YES (verified)** |
| **GlobalHeader migrated** | NO (separate task) |

## Recommendations

1. **Merge strategy:** Future phases should be merged to `main` promptly, or each new phase branch should be based on the previous phase branch (not `main`).

2. **GlobalHeader migration:** Create a separate task to migrate GlobalHeader to use skin tokens.

3. **Verification:** After this fix, Space Grotesk and Space Mono fonts should be visible throughout the app.
