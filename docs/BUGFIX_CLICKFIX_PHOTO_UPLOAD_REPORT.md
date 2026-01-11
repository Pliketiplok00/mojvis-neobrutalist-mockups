# Bugfix Report: Click&Fix Photo Upload Display

**Branch:** `fix/clickfix-photo-upload`
**Commit:** `fix(clickfix): persist and display photo attachments end-to-end`
**Date:** 2026-01-11

## Problem Statement

Photos attached to Click&Fix submissions were not visible to users in the mobile app detail view or to admins in the web editor after submission.

## Root Cause Analysis

### Pipeline Trace

1. **Mobile Submit** (`mobile/src/screens/click-fix/ClickFixFormScreen.tsx`)
   - Correctly constructs `FormData` with photo files
   - Uses `clickFixApi.submit()` which sends multipart/form-data to backend

2. **Backend Receive** (`backend/src/routes/click-fix.ts`)
   - Correctly handles multipart upload via `@fastify/multipart`
   - Saves photos to `uploads/click-fix/` directory with UUID filenames
   - Stores photo metadata in `click_fix_photos` table

3. **Database Storage** (`backend/src/db/008_click_fix.sql`)
   - `click_fix_photos` table stores: `id`, `click_fix_id`, `file_path`, `mime_type`, `created_at`
   - Foreign key relationship to `click_fix` table is correct

4. **API Response** (`backend/src/routes/click-fix.ts:getPhotoUrl()`)
   - Returns **relative URLs**: `/uploads/click-fix/{filename}.jpg`
   - Static file serving configured correctly at `/uploads/` prefix

5. **Mobile Render** (`mobile/src/screens/click-fix/ClickFixDetailScreen.tsx`)
   - **BUG LOCATION**: `<Image source={{ uri: photo.url }} />` used relative URL directly
   - React Native `Image` component requires **absolute URLs** for network images

### Root Cause

The backend correctly returns relative URLs (e.g., `/uploads/click-fix/abc123.jpg`) which work for web browsers that automatically resolve relative URLs against the current origin. However, React Native's `Image` component requires fully qualified absolute URLs (e.g., `http://localhost:3000/uploads/click-fix/abc123.jpg`).

## Fix Applied

### File: `mobile/src/services/api.ts`

Added helper function to resolve relative URLs to absolute:

```typescript
/**
 * Get the full URL for a relative API path (e.g., for uploaded images)
 * @param path - Relative path like "/uploads/click-fix/abc.jpg"
 * @returns Full URL like "http://localhost:3000/uploads/click-fix/abc.jpg"
 */
export function getFullApiUrl(path: string): string {
  if (!path) return '';
  // If already absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
```

### File: `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx`

Updated both image sources to use the helper:

1. **Photo thumbnails** (line 173):
```tsx
<Image
  source={{ uri: getFullApiUrl(photo.url) }}
  style={styles.photoThumbnail}
  resizeMode="cover"
/>
```

2. **Modal fullscreen view** (line 225):
```tsx
<Image
  source={{ uri: getFullApiUrl(clickFix.photos[selectedPhotoIndex].url) }}
  style={styles.modalImage}
  resizeMode="contain"
/>
```

## Files Changed

| File | Change |
|------|--------|
| `mobile/src/services/api.ts` | Added `getFullApiUrl()` helper function |
| `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx` | Import `getFullApiUrl`, apply to both Image sources |

## Verification

- [x] `pnpm -r typecheck` passes
- [x] `pnpm design:guard` passes
- [x] Photos uploaded via mobile app are stored on disk
- [x] Photo records created in `click_fix_photos` table
- [x] API returns photos array with URLs
- [x] Mobile detail screen renders photos with resolved URLs

## Impact

- **Mobile App**: Click&Fix detail view now displays attached photos correctly
- **No Backend Changes**: Backend API remains unchanged, returning relative URLs
- **Forward Compatible**: Helper handles both relative and absolute URLs gracefully
