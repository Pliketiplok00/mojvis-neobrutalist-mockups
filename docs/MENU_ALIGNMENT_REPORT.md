# Menu Alignment Report

**Date**: 2026-01-09
**Task**: Align mobile app Main Menu to 8 items per specification

---

## 1. Final Menu Item List

| # | HR Label | EN Label | Icon | Navigation Target |
|---|----------|----------|------|-------------------|
| 1 | Početna | Home | 🏠 | Route: `Home` |
| 2 | Događaji | Events | 📅 | Route: `Events` |
| 3 | Vozni redovi | Timetables | 🚌 | Route: `TransportHub` |
| 4 | Flora i fauna | Flora & Fauna | 🌿 | StaticPage: `flora-fauna` |
| 5 | Info za posjetitelje | Visitor info | ℹ️ | StaticPage: `visitor-info` |
| 6 | Prijavi problem | Click & Fix | 🔧 | Route: `ClickFixForm` |
| 7 | Pošalji prijedlog | Feedback | 💬 | Route: `FeedbackForm` |
| 8 | Važni kontakti | Important contacts | 📞 | StaticPage: `important-contacts` |

---

## 2. Static Pages Created

| Slug | HR Title | EN Title | Block Structure |
|------|----------|----------|-----------------|
| `timetables` | Vozni redovi | Timetables | Header + Text + LinkList (→TransportHub) |
| `flora-fauna` | Flora i fauna | Flora & Fauna | Header + Text + LinkList (→flora, fauna) |
| `flora` | Flora | Flora | Header + Text |
| `fauna` | Fauna | Fauna | Header + Text |
| `visitor-info` | Info za posjetitelje | Visitor info | Header + Text + Highlight |
| `important-contacts` | Važni kontakti | Important contacts | Header + Text + Contact (4 contacts) |

All pages include bilingual content (HR/EN) in header title, subtitle, and all block content.

---

## 3. Changed Files

### Files Modified for Menu Alignment (3 files):

| File | Reason |
|------|--------|
| `mobile/src/components/MenuOverlay.tsx` | Updated MENU_ITEMS array to 8 items with new routes |
| `mobile/App.tsx` | Updated handleNavigate to parse StaticPage:slug format |
| `mobile/src/screens/pages/StaticPageScreen.tsx` | Added 'screen' link type handler for internal navigation |

### New Files Created (1 file):

| File | Reason |
|------|--------|
| `backend/scripts/seed-menu-pages.ts` | Seed script to create/update menu static pages in database |

---

## 4. Git Status

```
On branch reset/map-block-editor

Changes not staged for commit:
  modified:   mobile/App.tsx
  modified:   mobile/src/components/MenuOverlay.tsx
  modified:   mobile/src/screens/pages/StaticPageScreen.tsx

Untracked files:
  backend/scripts/seed-menu-pages.ts
```

Note: HomeScreen.tsx and InboxListScreen.tsx show as modified from a previous task (SKIN_TEST_MODE) but were NOT modified as part of this menu alignment task.

---

## 5. Git Diff (Menu-Related Changes Only)

### mobile/src/components/MenuOverlay.tsx
```diff
const MENU_ITEMS: MenuItem[] = [
-  { label: 'Pocetna', labelEn: 'Home', icon: '🏠', route: 'Home' },
-  { label: 'Vozni red', labelEn: 'Transport', icon: '🚌', route: 'TransportHub' },
-  { label: 'Dogadaji', labelEn: 'Events', icon: '📅', route: 'Events' },
-  { label: 'Pristiglo', labelEn: 'Inbox', icon: '📥', route: 'Inbox' },
-  { label: 'Postavke', labelEn: 'Settings', icon: '⚙️', route: 'Settings' },
+  { label: 'Početna', labelEn: 'Home', icon: '🏠', route: 'Home' },
+  { label: 'Događaji', labelEn: 'Events', icon: '📅', route: 'Events' },
+  { label: 'Vozni redovi', labelEn: 'Timetables', icon: '🚌', route: 'StaticPage:timetables' },
+  { label: 'Flora i fauna', labelEn: 'Flora & Fauna', icon: '🌿', route: 'StaticPage:flora-fauna' },
+  { label: 'Info za posjetitelje', labelEn: 'Visitor info', icon: 'ℹ️', route: 'StaticPage:visitor-info' },
+  { label: 'Prijavi problem', labelEn: 'Click & Fix', icon: '🔧', route: 'ClickFixForm' },
+  { label: 'Pošalji prijedlog', labelEn: 'Feedback', icon: '💬', route: 'FeedbackForm' },
+  { label: 'Važni kontakti', labelEn: 'Important contacts', icon: '📞', route: 'StaticPage:important-contacts' },
];
```

### mobile/App.tsx
```diff
const handleNavigate = useCallback((route: string) => {
-    navigate(route as keyof MainStackParamList);
+    // Handle StaticPage routes with slug (format: "StaticPage:slug")
+    if (route.startsWith('StaticPage:')) {
+      const slug = route.substring('StaticPage:'.length);
+      navigationRef.current?.dispatch(
+        CommonActions.navigate({
+          name: 'StaticPage',
+          params: { slug },
+        })
+      );
+    } else {
+      navigate(route as keyof MainStackParamList);
+    }
}, []);
```

### mobile/src/screens/pages/StaticPageScreen.tsx
```diff
case 'page':
  navigation.navigate('StaticPage', { slug: linkTarget });
  break;
+case 'screen':
+  // Navigate to internal app screens (e.g., TransportHub, RoadTransport)
+  (navigation.navigate as (screen: string) => void)(linkTarget);
+  break;
case 'external':
```

---

## 6. Commands Run

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | No errors in changed files |
| `npx tsx scripts/seed-menu-pages.ts` | Created 6 static pages |

Seed script output:
```
Seeding Menu Static Pages
[+] Creating page: timetables - Created new page
[+] Creating page: flora-fauna - Created new page
[+] Creating page: flora - Updated existing page
[+] Creating page: fauna - Updated existing page
[+] Creating page: visitor-info - Created new page
[+] Creating page: important-contacts - Created new page
```

---

## 7. Manual Test Checklist

| Test | Status | Notes |
|------|--------|-------|
| Open menu | Pending | 8 items visible in correct order |
| Tap Početna/Home | Pending | Opens HomeScreen |
| Tap Događaji/Events | Pending | Opens EventsScreen |
| Tap Vozni redovi/Timetables | Pending | Opens StaticPage with link to TransportHub |
| Tap Flora i fauna | Pending | Opens StaticPage with links to Flora/Fauna |
| Tap Info za posjetitelje | Pending | Opens visitor-info StaticPage |
| Tap Prijavi problem | Pending | Opens ClickFixForm |
| Tap Pošalji prijedlog | Pending | Opens FeedbackForm |
| Tap Važni kontakti | Pending | Opens important-contacts StaticPage |
| Timetables → TransportHub link | Pending | Navigates to TransportHub screen |
| Flora & Fauna → Flora link | Pending | Navigates to Flora StaticPage |
| Flora & Fauna → Fauna link | Pending | Navigates to Fauna StaticPage |
| Back navigation | Pending | Works correctly on all screens |
| Metro console | Pending | No new errors or warnings |

---

## 8. Architecture Notes

### Navigation Strategy
- Menu items using existing routes (Home, Events, ClickFixForm, FeedbackForm) navigate directly
- Menu items requiring StaticPage use format `StaticPage:slug` which is parsed in App.tsx
- StaticPage link_list blocks support `link_type: 'screen'` to navigate to internal app screens

### Localization
- All menu labels use Croatian (with diacritics) as primary, English as secondary
- Static page content uses bilingual format (title_hr/title_en, body_hr/body_en)
- Backend API localizes content based on Accept-Language header

### No Changes To
- UI design/styling/theme tokens
- Business logic (eligibility, banners, reminders)
- Backend schema/migrations
- Global navigation rules
- Header behavior

---

## Confirmation

This implementation:
- Uses ONLY existing screens/routes where possible
- Creates minimal static page fixtures for dev rendering
- Makes minimum code changes to implement menu + navigation
- Does NOT add new libraries
- Does NOT modify backend schema
- Does NOT change UI design/styling

---

## Revision 1: Direct TransportHub Navigation

**Date**: 2026-01-09

### What Changed
Removed intermediate StaticPage for Timetables. Menu item "Vozni redovi / Timetables" now navigates directly to TransportHub screen instead of StaticPage:timetables.

### Change Details
**File**: `mobile/src/components/MenuOverlay.tsx`

```diff
-  { label: 'Vozni redovi', labelEn: 'Timetables', icon: '🚌', route: 'StaticPage:timetables' },
+  { label: 'Vozni redovi', labelEn: 'Timetables', icon: '🚌', route: 'TransportHub' },
```

### Files Changed
```
mobile/src/components/MenuOverlay.tsx
```

### Confirmation
- Only the menu navigation target changed (1 line)
- No other menu items affected
- No design/styling changes
- No business logic changes
- StaticPage "timetables" left as-is in database (not deleted)
