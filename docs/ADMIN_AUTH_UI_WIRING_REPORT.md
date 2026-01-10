# Admin Auth UI Wiring Report

**Date:** 2026-01-10
**Phase:** 2.5 - Admin UI Cookie-Session Wiring
**Author:** Claude Opus 4.5

---

## Summary

Wired the admin frontend to use the cookie-session authentication implemented in backend Phase 1b. All admin API calls now use `credentials: 'include'` to send session cookies, and protected routes are guarded by an AuthGuard component that checks session validity on load.

---

## Changes

### Backend (`backend/`)

| File | Change |
|------|--------|
| `src/__tests__/admin-auth.test.ts` | NEW - Unit tests for /admin/auth/* endpoints |

### Admin UI (`admin/`)

| File | Change |
|------|--------|
| `src/services/api.ts` | Added `credentials: 'include'`, 401/403 redirect, removed X-Admin-* headers, added `adminAuthApi` |
| `src/services/AuthContext.tsx` | NEW - Auth context provider, useAuth hook, AuthGuard component |
| `src/App.tsx` | Added AuthProvider wrapper, AuthGuard on all protected routes |
| `src/pages/LoginPage.tsx` | Wired to real `adminAuthApi.login()`, changed email to username |
| `src/layouts/DashboardLayout.tsx` | Wired to real `logout()`, displays username/municipality |
| `src/pages/pages/PagesListPage.tsx` | Removed supervisor role checks (all admins equal) |
| `src/pages/pages/PageEditPage.tsx` | Removed supervisor role checks |
| `src/pages/feedback/FeedbackListPage.tsx` | Removed municipality header parameter |
| `src/pages/feedback/FeedbackDetailPage.tsx` | Removed municipality header parameter |
| `src/pages/click-fix/ClickFixListPage.tsx` | Removed municipality header parameter |
| `src/pages/click-fix/ClickFixDetailPage.tsx` | Removed municipality header parameter |

---

## Auth Flow

1. **App Load**: AuthProvider calls `/admin/auth/me` to check session
2. **No Session**: AuthGuard redirects to `/login`
3. **Login**: User enters username/password, calls `/admin/auth/login`
4. **Success**: Cookie set, navigate to `/dashboard`
5. **Protected Routes**: All wrapped in `<AuthGuard>`, check `useAuth().user`
6. **API 401/403**: Global handler in `apiRequest()` redirects to `/login`
7. **Logout**: Calls `/admin/auth/logout`, clears cookie, redirects to `/login`

---

## Manual Testing

### Prerequisites
- Backend running on localhost:3000
- Migration 011_admin_auth.sql applied
- Admin user created (or use break-glass if configured)

### Test Login
```bash
# Should fail (no credentials)
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{}' -v

# Should fail (wrong password)
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}' -v

# Should succeed (with valid credentials)
curl -X POST http://localhost:3000/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_admin","password":"your_password"}' \
  -c cookies.txt -v

# Check session
curl http://localhost:3000/admin/auth/me \
  -b cookies.txt -v

# Logout
curl -X POST http://localhost:3000/admin/auth/logout \
  -b cookies.txt -v
```

### Test UI Flow
1. Start admin: `cd admin && npm run dev`
2. Navigate to http://localhost:5173
3. Should redirect to /login
4. Enter valid credentials
5. Should redirect to /dashboard
6. Header should show username (municipality)
7. Click "Odjava" in sidebar
8. Should redirect to /login

---

## Verification Results

| Check | Result |
|-------|--------|
| Backend Typecheck | PASS |
| Backend Tests | 278 passed |
| Backend Lint | 78 issues (all pre-existing) |
| Admin Build | PASS |
| Admin Lint | 0 errors, 1 pre-existing warning |

---

## Security Notes

- Session cookies are HttpOnly, SameSite=Lax, Secure (in production)
- No X-Admin-* headers used for identity (removed from all API calls)
- Municipality scoping enforced by backend session, not client headers
- 401/403 responses trigger immediate redirect to login

---

## Removed Legacy Patterns

- `X-Admin-Role` header (supervisor role removed)
- `X-Admin-Municipality` header (session-derived)
- `isSupervisor` state in pages (all admins equal)
- Role parameter in API functions
