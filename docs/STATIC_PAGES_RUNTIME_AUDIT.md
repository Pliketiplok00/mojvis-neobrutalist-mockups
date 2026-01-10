# Static Pages & Menu — Runtime Capability Audit

**Date**: 2026-01-09
**Status**: READ-ONLY audit — no code changes made

---

## Executive Summary

- Static page **content** is fully server-driven and fetches at runtime via API
- Static page **creation** works via admin without app rebuild
- Mobile **routing** accepts any slug — no code change needed for new pages
- **Menu items are HARDCODED** in mobile code (`MenuOverlay.tsx`)
- **A new menu link requires modifying mobile code and redeploying the app**

---

## 1. Static Page Content Source

**Where does `StaticPageScreen` get its content?**

| Aspect | Evidence |
|--------|----------|
| API call | `staticPagesApi.getPage(slug, userContext)` |
| Endpoint | `GET /pages/:slug` |
| Source files | `mobile/src/screens/pages/StaticPageScreen.tsx:63` |
| Backend route | `backend/src/routes/static-pages.ts:202-278` |
| Timing | **RUNTIME** — content fetched on screen mount, not bundled |

```typescript
// mobile/src/screens/pages/StaticPageScreen.tsx:58-71
const fetchPage = useCallback(async () => {
  setLoading(true);
  try {
    const data = await staticPagesApi.getPage(slug, userContext);
    setPage(data);
  } catch (err) {
    setError('Stranica nije pronadena ili nije objavljena.');
  } finally {
    setLoading(false);
  }
}, [slug, userContext]);
```

---

## 2. Static Page Creation

**Can a NEW static page be created and become visible without app rebuild?**

| Question | Answer | Evidence |
|----------|--------|----------|
| Admin creation endpoint? | YES | `POST /admin/pages` (`admin-static-pages.ts:14`) |
| Seed script exists? | YES | `backend/scripts/seed-menu-pages.ts` |
| Visible after publish? | YES | Mobile fetches by slug at runtime |
| Identifier used | `slug` string | `MainStackParamList` defines `StaticPage: { slug: string }` |

**Key point**: If you create and publish a page with slug `new-page`, navigating to `StaticPage:new-page` will render it correctly — no mobile rebuild needed.

---

## 3. Menu Links

**Where are menu items defined?**

```typescript
// mobile/src/components/MenuOverlay.tsx:33-42
const MENU_ITEMS: MenuItem[] = [
  { label: 'Početna', labelEn: 'Home', icon: '🏠', route: 'Home' },
  { label: 'Događaji', labelEn: 'Events', icon: '📅', route: 'Events' },
  { label: 'Vozni redovi', labelEn: 'Timetables', icon: '🚌', route: 'TransportHub' },
  { label: 'Flora i fauna', labelEn: 'Flora & Fauna', icon: '🌿', route: 'StaticPage:flora-fauna' },
  { label: 'Info za posjetitelje', labelEn: 'Visitor info', icon: 'ℹ️', route: 'StaticPage:visitor-info' },
  { label: 'Prijavi problem', labelEn: 'Click & Fix', icon: '🔧', route: 'ClickFixForm' },
  { label: 'Pošalji prijedlog', labelEn: 'Feedback', icon: '💬', route: 'FeedbackForm' },
  { label: 'Važni kontakti', labelEn: 'Important contacts', icon: '📞', route: 'StaticPage:important-contacts' },
];
```

| Question | Answer | Evidence |
|----------|--------|----------|
| Fetched from backend? | **NO** | No menu API exists in backend |
| Hardcoded in mobile? | **YES** | `const MENU_ITEMS` in `MenuOverlay.tsx:33-42` |
| Menu table in DB? | **NO** | Migrations 001-009 checked — no menu table |
| Backend menu endpoint? | **NO** | `grep "menu"` found no routes |

**Critical blocker**: To add a new menu item, you MUST edit `MenuOverlay.tsx` and redeploy the mobile app.

---

## 4. Mobile App Dependency

| Component | Requires Mobile Code Change? | Evidence |
|-----------|------------------------------|----------|
| Page content | NO | Runtime API fetch |
| Page routing | NO | Generic `StaticPage: { slug: string }` route |
| Menu item for new page | **YES** | Hardcoded `MENU_ITEMS` array |

**Navigation flow** (from `mobile/App.tsx:74-87`):

```typescript
const handleNavigate = useCallback((route: string) => {
  // Handle StaticPage routes with slug (format: "StaticPage:slug")
  if (route.startsWith('StaticPage:')) {
    const slug = route.substring('StaticPage:'.length);
    navigationRef.current?.dispatch(
      CommonActions.navigate({
        name: 'StaticPage',
        params: { slug },
      })
    );
  } else {
    navigate(route as keyof MainStackParamList);
  }
}, []);
```

The navigation system IS flexible — it can handle any `StaticPage:*` route. But the menu that triggers navigation is hardcoded.

---

## 5. Final Answer

### Can we add a new static page + menu link without users updating the app?

## **NO** — Mobile rebuild is required.

| Capability | Status |
|------------|--------|
| Add new page content | YES (server-driven) |
| Page becomes accessible via URL/deeplink | YES (generic slug routing) |
| Page appears in menu | **NO** (menu is hardcoded) |

**Bottom line**: Users CAN see new page content if they somehow navigate to it (via deeplink, card link, etc.), but the page will NOT appear in the hamburger menu without a mobile app update.

---

## Files Examined

| File | Purpose |
|------|---------|
| `mobile/src/screens/pages/StaticPageScreen.tsx` | Page rendering (API fetch) |
| `mobile/src/components/MenuOverlay.tsx` | Hardcoded menu items |
| `mobile/src/navigation/types.ts` | Route type definitions |
| `mobile/src/navigation/AppNavigator.tsx` | Screen registration |
| `mobile/App.tsx` | Menu navigation handler |
| `backend/src/routes/static-pages.ts` | Public page API |
| `backend/src/routes/admin-static-pages.ts` | Admin CRUD API |
| `backend/src/db/migrations/` | No menu table (001-009) |

---

## Proof

```bash
$ git status
# Shows only this new file: docs/STATIC_PAGES_RUNTIME_AUDIT.md

$ git diff --name-only
# (no changes to existing files — audit only)
```
