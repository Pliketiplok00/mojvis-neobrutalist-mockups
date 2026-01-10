# User Context Wiring Verification Report

**Date:** 2026-01-09
**Status:** VERIFIED

---

## A) Executive Summary

### **CONFIRMED BUG — hardcoded visitor context exists in production runtime paths**

Multiple production screens use hardcoded `{ userMode: 'visitor', municipality: null }` instead of reading from the OnboardingContext. This causes **all users to be treated as visitors**, breaking municipal message visibility for locals.

---

## B) Evidence Section

### 1) Source of Truth for User Context

The canonical source of user context is **`OnboardingContext.tsx`**:

**File:** `mobile/src/contexts/OnboardingContext.tsx`

```typescript
// Lines 24-27: Types
export type UserMode = 'visitor' | 'local';
export type Municipality = 'vis' | 'komiza';

// Lines 32-37: Data structure
export interface OnboardingData {
  language: Language;
  userMode: UserMode;
  municipality: Municipality | null;
}

// Lines 163-169: Hook to access context
export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
```

The context correctly loads user preferences from AsyncStorage and exposes them via the `useOnboarding()` hook.

### 2) Correct Usage (Reference)

**SettingsScreen** correctly uses the context:

**File:** `mobile/src/screens/settings/SettingsScreen.tsx:29-35`
```typescript
export function SettingsScreen(): React.JSX.Element {
  const { data, resetOnboarding } = useOnboarding();  // ✅ CORRECT
  // ...
  const userMode = data?.userMode ?? 'visitor';
  const municipality = data?.municipality;
```

### 3) Hardcoded Values (BUG)

All other data-fetching screens use hardcoded values with explicit TODO comments:

#### HomeScreen
**File:** `mobile/src/screens/home/HomeScreen.tsx:42-43`
```typescript
// TODO: Get from user context
const userContext = { userMode: 'visitor' as const, municipality: null };  // ❌ HARDCODED
```

#### InboxListScreen
**File:** `mobile/src/screens/inbox/InboxListScreen.tsx:86-87`
```typescript
// TODO: Get from user context
const userContext = { userMode: 'visitor' as const, municipality: null };  // ❌ HARDCODED
```

#### InboxDetailScreen
**File:** `mobile/src/screens/inbox/InboxDetailScreen.tsx:43`
```typescript
const userContext = { userMode: 'visitor' as const, municipality: null };  // ❌ HARDCODED
```

#### EventsScreen
**File:** `mobile/src/screens/events/EventsScreen.tsx:206-207`
```typescript
// TODO: Get from user context
const userContext = { userMode: 'visitor' as const, municipality: null };  // ❌ HARDCODED
```

#### TransportHubScreen
**File:** `mobile/src/screens/transport/TransportHubScreen.tsx:42-43`
```typescript
const response = await inboxApi.getActiveBanners(
  { userMode: 'visitor', municipality: null },  // ❌ HARDCODED (inline)
  'transport'
);
```

#### RoadTransportScreen
**File:** `mobile/src/screens/transport/RoadTransportScreen.tsx:62`
```typescript
const userContext = { userMode: 'visitor' as const, municipality: null };  // ❌ HARDCODED
```

#### SeaTransportScreen
**File:** `mobile/src/screens/transport/SeaTransportScreen.tsx:62`
```typescript
const userContext = { userMode: 'visitor' as const, municipality: null };  // ❌ HARDCODED
```

#### StaticPageScreen
**File:** `mobile/src/screens/pages/StaticPageScreen.tsx:57`
```typescript
const userContext = { userMode: 'visitor' as const, municipality: null };  // ❌ HARDCODED
```

#### FeedbackFormScreen
**File:** `mobile/src/screens/feedback/FeedbackFormScreen.tsx:45`
```typescript
const userContext = { userMode: 'visitor' as const, municipality: null };  // ❌ HARDCODED
```

#### ClickFixFormScreen
**File:** `mobile/src/screens/click-fix/ClickFixFormScreen.tsx:61`
```typescript
const userContext = { userMode: 'visitor' as const, municipality: null };  // ❌ HARDCODED
```

---

## C) Screen/Feature Impact Table

| Screen / Feature | Uses real context? | Hardcoded? | File path | Severity |
|------------------|-------------------|------------|-----------|----------|
| **HomeScreen** (banners) | NO | YES | `screens/home/HomeScreen.tsx:43` | CRITICAL |
| **InboxListScreen** (messages) | NO | YES | `screens/inbox/InboxListScreen.tsx:87` | CRITICAL |
| **InboxDetailScreen** (message) | NO | YES | `screens/inbox/InboxDetailScreen.tsx:43` | CRITICAL |
| **EventsScreen** (banners) | NO | YES | `screens/events/EventsScreen.tsx:207` | HIGH |
| **TransportHubScreen** (banners) | NO | YES | `screens/transport/TransportHubScreen.tsx:43` | HIGH |
| **RoadTransportScreen** (banners) | NO | YES | `screens/transport/RoadTransportScreen.tsx:62` | HIGH |
| **SeaTransportScreen** (banners) | NO | YES | `screens/transport/SeaTransportScreen.tsx:62` | HIGH |
| **StaticPageScreen** (notices) | NO | YES | `screens/pages/StaticPageScreen.tsx:57` | HIGH |
| **FeedbackFormScreen** (submit) | NO | YES | `screens/feedback/FeedbackFormScreen.tsx:45` | MEDIUM |
| **ClickFixFormScreen** (submit) | NO | YES | `screens/click-fix/ClickFixFormScreen.tsx:61` | MEDIUM |
| **SettingsScreen** (display) | YES | NO | `screens/settings/SettingsScreen.tsx:29` | OK |

---

## D) Runtime Impact Assessment

### What Breaks

1. **Municipal messages invisible to ALL users**
   - Users who selected "Local" + "Vis" during onboarding will NOT see `vis`-tagged messages
   - Users who selected "Local" + "Komiža" will NOT see `komiza`-tagged messages
   - The API receives `userMode: 'visitor'` so it filters OUT all municipal content

2. **Municipal banners invisible**
   - `hitno + vis` banners hidden from Vis locals
   - `hitno + komiza` banners hidden from Komiža locals

3. **Feedback/Click & Fix metadata incorrect**
   - Submissions are tagged as `visitor` even when user is a local
   - Municipality information not attached to reports

### Affected Screens

- **Home**: Missing municipal banners
- **Inbox**: Missing municipal messages
- **Events**: Missing municipal banners
- **Transport (all 3)**: Missing municipal banners
- **Static Pages**: Missing municipal notices
- **Feedback/Click & Fix**: Wrong metadata on submissions

---

## E) Classification of "visitor" Occurrences

| Location | Type | Classification |
|----------|------|----------------|
| `locales/hr.json:12` | Translation string | OK - i18n label |
| `locales/en.json:12` | Translation string | OK - i18n label |
| `types/inbox.ts:61` | Type definition | OK - type union |
| `navigation/types.ts:16` | Type definition | OK - type union |
| `contexts/OnboardingContext.tsx:24` | Type definition | OK - type union |
| `contexts/OnboardingContext.tsx:91` | Fallback default | OK - loading fallback |
| `screens/onboarding/UserModeSelectionScreen.tsx` | User selection logic | OK - onboarding flow |
| `screens/settings/SettingsScreen.tsx:34` | Fallback with `??` | OK - null safety |
| **All other screens** | Hardcoded production value | **CRITICAL BUG** |

---

## F) Conclusion

### **Fix REQUIRED**

All screens with hardcoded `userContext = { userMode: 'visitor', municipality: null }` must be updated to:

```typescript
import { useOnboarding } from '../../contexts/OnboardingContext';

// Inside component:
const { data } = useOnboarding();
const userContext = {
  userMode: data?.userMode ?? 'visitor',
  municipality: data?.municipality ?? null,
};
```

### Files Requiring Fix (10 total)

1. `mobile/src/screens/home/HomeScreen.tsx`
2. `mobile/src/screens/inbox/InboxListScreen.tsx`
3. `mobile/src/screens/inbox/InboxDetailScreen.tsx`
4. `mobile/src/screens/events/EventsScreen.tsx`
5. `mobile/src/screens/transport/TransportHubScreen.tsx`
6. `mobile/src/screens/transport/RoadTransportScreen.tsx`
7. `mobile/src/screens/transport/SeaTransportScreen.tsx`
8. `mobile/src/screens/pages/StaticPageScreen.tsx`
9. `mobile/src/screens/feedback/FeedbackFormScreen.tsx`
10. `mobile/src/screens/click-fix/ClickFixFormScreen.tsx`

---

## Proof

```
$ git status
On branch main
Untracked files:
    docs/USER_CONTEXT_WIRING_VERIFICATION.md

$ git diff --name-only
(no code files modified)
```
