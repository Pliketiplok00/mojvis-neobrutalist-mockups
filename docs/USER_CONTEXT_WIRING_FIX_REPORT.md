# User Context Wiring Fix Report

## Summary

Fixed confirmed bug where 10 production screens hardcoded `{ userMode: 'visitor', municipality: null }` instead of reading from the OnboardingContext.

## Root Cause

Screens were created with placeholder user context values during initial development, marked with `// TODO: Get from user context` comments. The OnboardingContext was available but never wired in.

## Solution

### 1. Created Reusable Hook

**File:** `mobile/src/hooks/useUserContext.ts`

```typescript
import { useOnboarding } from '../contexts/OnboardingContext';
import type { UserMode, Municipality } from '../types/inbox';

export interface UserContext {
  userMode: UserMode;
  municipality: Municipality;
}

export function useUserContext(): UserContext {
  const { data } = useOnboarding();
  return {
    userMode: data?.userMode ?? 'visitor',
    municipality: data?.municipality ?? null,
  };
}
```

### 2. Updated All Affected Screens

| Screen | File Path | Change |
|--------|-----------|--------|
| HomeScreen | `mobile/src/screens/home/HomeScreen.tsx` | Added hook import, replaced hardcoded context |
| InboxListScreen | `mobile/src/screens/inbox/InboxListScreen.tsx` | Added hook import, replaced hardcoded context |
| InboxDetailScreen | `mobile/src/screens/inbox/InboxDetailScreen.tsx` | Added hook import, replaced hardcoded context |
| EventsScreen | `mobile/src/screens/events/EventsScreen.tsx` | Added hook import, replaced hardcoded context |
| TransportHubScreen | `mobile/src/screens/transport/TransportHubScreen.tsx` | Added hook import, replaced hardcoded context |
| RoadTransportScreen | `mobile/src/screens/transport/RoadTransportScreen.tsx` | Added hook import, replaced hardcoded context |
| SeaTransportScreen | `mobile/src/screens/transport/SeaTransportScreen.tsx` | Added hook import, replaced hardcoded context |
| StaticPageScreen | `mobile/src/screens/pages/StaticPageScreen.tsx` | Added hook import, replaced hardcoded context |
| FeedbackFormScreen | `mobile/src/screens/feedback/FeedbackFormScreen.tsx` | Added hook import, replaced hardcoded context |
| ClickFixFormScreen | `mobile/src/screens/click-fix/ClickFixFormScreen.tsx` | Added hook import, replaced hardcoded context |

## Code Pattern Applied

**Before (each screen):**
```typescript
// TODO: Get from user context
const userContext = { userMode: 'visitor' as const, municipality: null };
```

**After (each screen):**
```typescript
import { useUserContext } from '../../hooks/useUserContext';
// ...
const userContext = useUserContext();
```

## Behavioral Impact

After this fix:

| Feature | Before Fix | After Fix |
|---------|------------|-----------|
| Municipal messages | Always hidden (visitor mode) | Visible to local users of that municipality |
| Inbox filtering | No municipal content | Proper eligibility filtering |
| Banner targeting | Only general banners | Municipal + general banners |
| Click & Fix context | No municipality context | Sends real municipality |
| Feedback context | No municipality context | Sends real municipality |

## Files Changed

### New Files
- `mobile/src/hooks/useUserContext.ts`

### Modified Files
- `mobile/src/screens/home/HomeScreen.tsx`
- `mobile/src/screens/inbox/InboxListScreen.tsx`
- `mobile/src/screens/inbox/InboxDetailScreen.tsx`
- `mobile/src/screens/events/EventsScreen.tsx`
- `mobile/src/screens/transport/TransportHubScreen.tsx`
- `mobile/src/screens/transport/RoadTransportScreen.tsx`
- `mobile/src/screens/transport/SeaTransportScreen.tsx`
- `mobile/src/screens/pages/StaticPageScreen.tsx`
- `mobile/src/screens/feedback/FeedbackFormScreen.tsx`
- `mobile/src/screens/click-fix/ClickFixFormScreen.tsx`

## Verification

- TypeScript compilation: No new errors introduced (pre-existing skin errors unrelated)
- Pattern consistent across all 10 screens
- useCallback dependency arrays updated where applicable
- SettingsScreen already used OnboardingContext correctly (no change needed)

## Testing Recommendations

1. Complete onboarding as "local" user with municipality = "vis"
2. Verify municipal messages (tagged `vis`) appear in inbox
3. Verify banners tagged `vis` appear on relevant screens
4. Submit feedback/click-fix and verify municipality is included in request
5. Repeat for municipality = "komiza"
6. Verify visitor mode still works (no municipality, general content only)
