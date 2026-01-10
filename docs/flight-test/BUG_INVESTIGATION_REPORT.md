# MOJ VIS Bug Investigation Report

**Date:** 2026-01-10
**Branch:** feat/auth-backend-phase1b
**Status:** Investigation Complete - Awaiting Fix Approval

---

## Executive Summary

Four bugs were reported during flight testing. All four have been investigated and root causes identified:

| # | Bug | Severity | Root Cause |
|---|-----|----------|------------|
| 1 | Mobile Settings unreachable | Medium | Missing menu item |
| 2 | Admin menu extras error | High | Routes not registered |
| 3 | Admin double login | High | Auth state not refreshed |
| 4 | Feedback page fails | Medium | Cascading from #3 |

---

## Issue 1: Mobile Settings Screen Unreachable

### Symptoms
- Settings screen not accessible from mobile app menu
- No way for users to reach Settings

### Root Cause
The Settings screen is registered in the navigator but **NOT added to the menu**.

**File:** `mobile/src/components/MenuOverlay.tsx:43-52`

```typescript
const CORE_MENU_ITEMS: MenuItem[] = [
  { label: 'Pocetna', labelEn: 'Home', icon: 'home', route: 'Home' },
  { label: 'Dogadaji', labelEn: 'Events', icon: 'calendar', route: 'Events' },
  { label: 'Vozni redovi', labelEn: 'Timetables', icon: 'bus', route: 'TransportHub' },
  { label: 'Flora i fauna', labelEn: 'Flora & Fauna', icon: 'leaf', route: 'StaticPage:flora-fauna' },
  { label: 'Info za posjetitelje', labelEn: 'Visitor info', icon: 'info', route: 'StaticPage:visitor-info' },
  { label: 'Prijavi problem', labelEn: 'Click & Fix', icon: 'tool', route: 'ClickFixForm' },
  { label: 'Posalji prijedlog', labelEn: 'Feedback', icon: 'message-circle', route: 'FeedbackForm' },
  { label: 'Vazni kontakti', labelEn: 'Important contacts', icon: 'phone', route: 'StaticPage:important-contacts' },
  // NOTE: Settings is MISSING from this array!
];
```

**Evidence:** Settings screen IS registered in navigator:
- `mobile/src/navigation/AppNavigator.tsx:121` - `<MainStack.Screen name="Settings" component={SettingsScreen} />`

### Proposed Fix
Add Settings item to `CORE_MENU_ITEMS` array:
```typescript
{ label: 'Postavke', labelEn: 'Settings', icon: 'settings', route: 'Settings' },
```

---

## Issue 2: Admin "Greska pri ucitavanju dodatnih stavki izbornika"

### Symptoms
- Error message appears on admin dashboard after login
- Error: "Greska pri ucitavanju dodatnih stavki izbornika" (Error loading menu extras)

### Root Cause
The menu extras routes **exist but are NOT registered** in the server.

**File:** `backend/src/index.ts`

Missing imports:
```typescript
// These imports do NOT exist:
// import { menuExtrasRoutes } from './routes/menu-extras.js';
// import { adminMenuExtrasRoutes } from './routes/admin-menu-extras.js';
```

Missing registrations:
```typescript
// These registrations do NOT exist:
// await fastify.register(menuExtrasRoutes);
// await fastify.register(adminMenuExtrasRoutes);
```

**Evidence:**
- Route files exist: `backend/src/routes/menu-extras.ts`, `backend/src/routes/admin-menu-extras.ts`
- Server logs endpoint (lines 199-200) but endpoint returns 404
- Testing `curl http://localhost:3000/admin/menu/extras` returns auth error (endpoint exists in middleware but not as actual route)

### Proposed Fix
Add to `backend/src/index.ts`:

1. Add imports:
```typescript
import { menuExtrasRoutes } from './routes/menu-extras.js';
import { adminMenuExtrasRoutes } from './routes/admin-menu-extras.js';
```

2. Add registrations in `registerPlugins()`:
```typescript
// Menu extras routes
await fastify.register(menuExtrasRoutes);
await fastify.register(adminMenuExtrasRoutes);
```

---

## Issue 3: Admin Login Requires TWO Attempts

### Symptoms
- First login attempt appears to succeed but user is redirected back to login
- Second login attempt works correctly
- Very confusing user experience

### Root Cause
After successful login, the `AuthContext` state is **NOT updated**. The login page navigates to dashboard but the auth context still has `user: null`.

**Flow Analysis:**

1. User visits `/login` - AuthProvider mounts, `checkAuth()` runs, no session exists, `user = null`
2. User submits login form
3. `adminAuthApi.login()` succeeds, session cookie is set
4. `navigate('/dashboard')` called (React Router navigation, NOT page reload)
5. Dashboard wrapped with `AuthGuard` checks `user` - still `null` (never updated!)
6. AuthGuard redirects to `/login` via `window.location.href` (FULL PAGE RELOAD)
7. On reload: AuthProvider re-mounts, `checkAuth()` runs with existing cookie, `user` is now set
8. User sees login page but is actually authenticated
9. Second login succeeds and works because auth state is already correct

**File:** `admin/src/pages/LoginPage.tsx:35-42`

```typescript
try {
  const result = await adminAuthApi.login(username, password);

  if (result.ok) {
    navigate('/dashboard');  // <-- Just navigates, doesn't update auth state!
  } else {
    setError(result.error || 'Pogresno korisnicko ime ili lozinka');
  }
}
```

**File:** `admin/src/services/AuthContext.tsx:47-49`

```typescript
useEffect(() => {
  checkAuth();  // Only runs on mount, not after login
}, []);
```

### Proposed Fix
After successful login, call `refreshAuth()` before navigating:

**Option A - Use AuthContext in LoginPage:**
```typescript
import { useAuth } from '../services/AuthContext';

export function LoginPage() {
  const { refreshAuth } = useAuth();
  // ...

  if (result.ok) {
    await refreshAuth();  // Update auth state
    navigate('/dashboard');
  }
}
```

**Option B - Export login function from AuthContext that handles both:**
```typescript
// In AuthContext.tsx
const login = async (username: string, password: string) => {
  const result = await adminAuthApi.login(username, password);
  if (result.ok) {
    await checkAuth();  // Update state
  }
  return result;
};
```

---

## Issue 4: "Povratne informacije" Page Fails

### Symptoms
- Feedback page shows error when loading
- Error message: "Greska pri ucitavanju poruka. Pokusajte ponovo."

### Root Cause
**Cascading effect of Issue 3** - The auth state synchronization problem causes API requests to fail or behave unexpectedly.

**Analysis:**
- Backend endpoint `/admin/feedback` is properly registered and implemented
- Endpoint correctly requires authentication via `adminAuthHook`
- Repository queries are correct
- Type definitions are compatible between frontend and backend

**Evidence:**
- `curl http://localhost:3000/admin/feedback` returns `{"error":"Authentication required","code":"UNAUTHENTICATED"}` - endpoint exists
- Backend code at `backend/src/routes/admin-feedback.ts` is correctly implemented
- Frontend types at `admin/src/types/feedback.ts` are compatible with backend response

### Proposed Fix
Fixing Issue 3 should resolve Issue 4. No additional changes needed for the feedback page itself.

---

## Fix Priority Recommendation

1. **Issue 3 (Double Login)** - Fix first, high impact on UX
2. **Issue 2 (Menu Extras)** - Fix second, blocks admin feature
3. **Issue 4 (Feedback Page)** - Should resolve after Issue 3
4. **Issue 1 (Settings Menu)** - Fix last, lower priority

---

## Testing Checklist After Fixes

- [ ] Login once, verify immediate access to dashboard
- [ ] Navigate to Menu Extras page, verify no error
- [ ] Navigate to Povratne informacije page, verify list loads
- [ ] Mobile app: verify Settings accessible from menu
- [ ] Logout and login again to verify session handling

---

## Files Requiring Changes

| File | Change Type | Issue |
|------|-------------|-------|
| `admin/src/pages/LoginPage.tsx` | Modify | #3 |
| `backend/src/index.ts` | Modify | #2 |
| `mobile/src/components/MenuOverlay.tsx` | Modify | #1 |

---

**Report prepared by:** Claude Code
**Awaiting:** User approval before implementing fixes
