# Git Workflow for Mobile Development

This document defines the canonical workflow for mobile feature development in MOJ VIS.

## Rules

### 1. Canonical Integration Branch

All mobile work integrates into **`integration/mobile`**.

- Feature branches for mobile MUST branch off `integration/mobile`
- PRs for mobile features target `integration/mobile`
- `integration/mobile` is periodically merged to `main` after validation

### 2. Dependency Changes First

Dependency changes (package.json, lockfiles) are **dedicated PRs merged first**.

- Never add dependencies as part of a UI feature PR
- Create a separate PR for deps, get it merged, then rebase your feature branch
- This prevents "works on my machine" regressions

### 3. Sync Before Work

Before starting any mobile UI work:

```bash
git checkout integration/mobile
git pull --ff-only
git checkout -b feat/my-feature
```

If your feature branch already exists:

```bash
git checkout feat/my-feature
git merge integration/mobile
# or: git rebase integration/mobile
```

### 4. No Manual Podfile Hacks

The iOS Podfile must NOT contain manual pod entries for autolinked packages.

**Forbidden:**
```ruby
pod 'RNSVG', :path => '../node_modules/react-native-svg'
```

**Correct:** Let Expo autolinking handle `react-native-svg` automatically.

If icons/SVG don't work, the fix is in `package.json`, not `Podfile`.

### 5. Required Dependencies (Baseline)

The following dependencies MUST be present in `mobile/package.json`:

- `react-native-svg`
- `lucide-react-native`
- `expo-font`
- `@expo-google-fonts/space-grotesk`
- `@expo-google-fonts/space-mono`

CI will fail if any are missing.

## Local Verification

Before pushing, verify the baseline:

```bash
node mobile/scripts/verify-mobile-baseline.mjs
```

Run TypeScript check:

```bash
cd mobile && npx tsc --noEmit
```

Build iOS:

```bash
cd mobile && npx expo run:ios
```

## CI Checks

The `design-guardrails.yml` workflow runs on PRs to `main` and `integration/mobile`:

1. **Mobile Baseline Check**: Verifies required deps and no Podfile hacks
2. **TypeScript Check**: Ensures no type errors in mobile workspace

Both must pass before merge.

## Recovering from Regressions

If icons/fonts stop working:

1. Check `mobile/package.json` has all required deps
2. Check `mobile/ios/Podfile` has no manual RNSVG entry
3. Run: `pnpm install && cd mobile/ios && pod install`
4. Rebuild: `npx expo run:ios`

If a feature disappeared:

1. Check which branch contains the feature: `git branch --contains <commit>`
2. Cherry-pick or merge the missing commits into `integration/mobile`
3. Push and verify
