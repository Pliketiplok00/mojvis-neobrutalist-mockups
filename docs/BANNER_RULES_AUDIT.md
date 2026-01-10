# Banner Rules Audit

**Date**: 2026-01-09
**Type**: READ-ONLY audit (no code changes)

---

## Executive Summary

Banner eligibility is **server-side** in `backend/src/lib/eligibility.ts`. Banners are NOT a separate entity - they are Inbox messages with `is_banner: true` that pass additional filtering. The key finding: **NOT just "hitno" messages become banners** - eligibility depends on screen context and tag matching.

---

## 1. Banner Eligibility Rules

### Q1: Which tags are banner-eligible?

| Screen Context | Eligible Tags |
|----------------|---------------|
| `home` | `hitno`, `opcenito`, `vis`, `komiza` |
| `transport_road` | `cestovni_promet` OR `hitno` |
| `transport_sea` | `pomorski_promet` OR `hitno` |

**Source**: `backend/src/lib/eligibility.ts:162-188`

```typescript
function isBannerForScreen(message: InboxMessage, screen: ScreenContext): boolean {
  switch (screen) {
    case 'home':
      return message.tags.some(tag =>
        ['hitno', 'opcenito', 'vis', 'komiza'].includes(tag)
      );
    case 'transport_road':
      return message.tags.includes('cestovni_promet') || message.tags.includes('hitno');
    case 'transport_sea':
      return message.tags.includes('pomorski_promet') || message.tags.includes('hitno');
    default:
      return false;
  }
}
```

### Base Eligibility (all screens)

A message must pass `isBannerEligible()` before screen filtering:

1. `is_banner === true`
2. Has active time window (both `active_from` AND `active_to` set)
3. Currently within that window

---

## 2. Time Window Rules

### Q2: What happens if active_from/active_to is NULL?

**Answer**: Message is NOT banner-eligible.

**Source**: `backend/src/lib/eligibility.ts:96-100`

```typescript
function isWithinActiveWindow(message: InboxMessage, now: Date): boolean {
  // If no window defined, not active as banner
  if (!message.active_from || !message.active_to) {
    return false;
  }
  // ... range check
}
```

| active_from | active_to | Banner Eligible? |
|-------------|-----------|------------------|
| NULL | NULL | NO |
| NULL | set | NO |
| set | NULL | NO |
| set (past) | set (future) | YES (if now in range) |
| set (future) | set (future) | NO (not yet active) |
| set (past) | set (past) | NO (expired) |

### Source of Truth

Time window is checked **server-side** at query time. The backend's `GET /banners/active` endpoint filters messages through:

1. `filterBannerEligibleMessages()` - checks is_banner + time window
2. `filterBannersByScreen()` - applies tag rules per screen context

---

## 3. Where Banners Appear

### Q3: Which mobile screens render banners?

| Screen | File | API Call |
|--------|------|----------|
| Home | `mobile/src/screens/home/HomeScreen.tsx` | `getActiveBanners(ctx, 'home')` |
| TransportHub | `mobile/src/screens/transport/TransportHubScreen.tsx` | Both `transport_road` + `transport_sea`, deduplicated |
| RoadTransport | `mobile/src/screens/transport/RoadTransportScreen.tsx` | `getActiveBanners(ctx, 'transport_road')` |
| SeaTransport | `mobile/src/screens/transport/SeaTransportScreen.tsx` | `getActiveBanners(ctx, 'transport_sea')` |

### TransportHub Deduplication Logic

TransportHub fetches BOTH transport screens' banners and deduplicates by ID:

```typescript
// Deduplicate banners that appear in both
const uniqueBanners = [...roadBanners];
for (const seaBanner of seaBanners) {
  if (!uniqueBanners.find(b => b.id === seaBanner.id)) {
    uniqueBanners.push(seaBanner);
  }
}
```

This means a `hitno` banner appears once on TransportHub (not duplicated).

---

## 4. Tap Behavior

**All banners**: Navigate to `InboxDetail` with message ID.

**Source**: `mobile/src/components/Banner.tsx:36-39`

```typescript
const handlePress = () => {
  navigation.navigate('InboxDetail', { messageId: message.id });
};
```

No special handling per tag or screen - all banners open their full message.

---

## 5. Ordering & Cap Rules

### Ordering

Backend returns banners ordered by:
1. `created_at DESC` (newest first)

**Source**: `backend/src/routes/inbox.ts` - query uses `ORDER BY created_at DESC`

### Cap

**No cap implemented**. `BannerList` renders all banners returned by API:

```typescript
// mobile/src/components/Banner.tsx
export function BannerList({ banners, style }: BannerListProps) {
  return (
    <View style={[styles.bannerList, style]}>
      {banners.map((message) => (
        <Banner key={message.id} message={message} />
      ))}
    </View>
  );
}
```

---

## 6. All Available Tags

From `backend/src/types/inbox.ts`:

```typescript
export const INBOX_TAGS = [
  'cestovni_promet',
  'pomorski_promet',
  'kultura',
  'opcenito',
  'hitno',
  'komiza',
  'vis',
] as const;
```

### Tag-to-Banner Mapping Summary

| Tag | Banner on Home? | Banner on Transport? |
|-----|-----------------|----------------------|
| `hitno` | YES | YES (both road/sea) |
| `opcenito` | YES | NO |
| `vis` | YES | NO |
| `komiza` | YES | NO |
| `cestovni_promet` | NO | YES (road only) |
| `pomorski_promet` | NO | YES (sea only) |
| `kultura` | NO | NO |

---

## 7. Mismatches & Fix Options

### Potential Issues Found

| Issue | Current Behavior | Recommendation |
|-------|-----------------|----------------|
| `kultura` tag never shows as banner | Excluded from all screen filters | Add to `home` filter if cultural banners needed |
| No banner cap | Could flood UI with many active banners | Consider max 3-5 banners per screen |
| No priority/severity ordering | Newest first only | Add `priority` field if `hitno` should always be first |

### Architecture Notes

- Banners are NOT separate from Inbox - they're filtered Inbox messages
- No banner-specific database table exists
- Time windows are optional on Inbox messages but REQUIRED for banner eligibility
- Screen context is passed from mobile to API, filtering happens server-side

---

## PROOF: No Code Changes

### git status (at audit completion)

```
M mobile/App.tsx                              # Menu alignment (prior task)
M mobile/src/components/MenuOverlay.tsx       # Menu alignment (prior task)
M mobile/src/screens/home/HomeScreen.tsx      # SKIN_TEST_MODE (prior task)
M mobile/src/screens/inbox/InboxListScreen.tsx # SKIN_TEST_MODE (prior task)
M mobile/src/screens/pages/StaticPageScreen.tsx # Menu alignment (prior task)
?? backend/scripts/seed-menu-pages.ts         # Menu alignment (prior task)
?? docs/MENU_ALIGNMENT_REPORT.md              # Menu alignment (prior task)
```

### git diff --name-only (during this audit)

**Zero files modified by this audit.** All modifications shown are from prior tasks (Menu Alignment, SKIN_TEST_MODE).

This audit was READ-ONLY as specified.

---

## Files Reviewed

| File | Purpose |
|------|---------|
| `backend/src/lib/eligibility.ts` | Core banner eligibility logic |
| `backend/src/routes/inbox.ts` | Banner API endpoint |
| `backend/src/types/inbox.ts` | Tag definitions, InboxMessage type |
| `mobile/src/components/Banner.tsx` | Banner UI component |
| `mobile/src/screens/home/HomeScreen.tsx` | Home screen banner usage |
| `mobile/src/screens/transport/TransportHubScreen.tsx` | Transport hub banner usage |
| `mobile/src/screens/transport/RoadTransportScreen.tsx` | Road transport banner usage |
| `mobile/src/screens/transport/SeaTransportScreen.tsx` | Sea transport banner usage |
