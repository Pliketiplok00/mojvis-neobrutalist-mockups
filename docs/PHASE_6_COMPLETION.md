# Phase 6 Completion Report: Click & Fix

## Overview

Phase 6 implements the Click & Fix feature for MOJ VIS, enabling users to report local issues with required location and optional photos. Reports are anonymous (device-based) with rate limiting, status tracking, and admin replies.

## Implementation Summary

### Backend Implementation

**New Files Created:**
- `backend/src/db/migrations/008_click_fix.sql` - Database schema for click_fix tables
- `backend/src/types/click-fix.ts` - Types, validation functions, rate limit config
- `backend/src/repositories/click-fix.ts` - Database operations with rate limiting
- `backend/src/routes/click-fix.ts` - Public API routes (submit, view, list sent)
- `backend/src/routes/admin-click-fix.ts` - Admin API routes (list, detail, status, reply)
- `backend/src/__tests__/click-fix.test.ts` - Test suite (41 tests)

**Modified Files:**
- `backend/src/index.ts` - Added route registration, static file serving for uploads
- `backend/package.json` - Added @fastify/multipart and @fastify/static dependencies

**Key Features:**

1. **Anonymous Device-Based Submission**
   - Uses X-Device-ID header for identification
   - Required location (lat/lng coordinates)
   - Optional photos (0-3 images)

2. **Rate Limiting**
   - 3 submissions per device per day (Europe/Zagreb timezone)
   - Returns 429 with bilingual error message (HR/EN)
   - Daily reset at midnight Zagreb time

3. **Photo Upload**
   - Max 3 photos per submission
   - Max 5MB per photo
   - Allowed types: JPEG, PNG, WebP
   - Stored in `uploads/click-fix/` directory
   - Served via Fastify static plugin

4. **Status Workflow**
   - Status values: `zaprimljeno`, `u_razmatranju`, `prihvaceno`, `odbijeno`
   - Reuses `feedback_status` enum from Phase 5
   - Admin can change status at any time
   - Status changes reflected in user's Sent tab

5. **Admin Reply Thread**
   - Admin can add multiple replies (thread)
   - Replies create inbox messages for user notification

6. **Municipality Scoping**
   - Local admins only see click_fix from their municipality
   - X-Admin-Municipality header controls scoping

### Mobile Implementation

**New Files Created:**
- `mobile/src/types/click-fix.ts` - Mobile types with validation
- `mobile/src/screens/click-fix/ClickFixFormScreen.tsx` - Submission form with location and photo pickers
- `mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx` - Success screen
- `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx` - View submission with photos and replies

**Updated Files:**
- `mobile/src/services/api.ts` - Added clickFixApi with multipart upload support
- `mobile/src/navigation/types.ts` - Added click-fix screen routes
- `mobile/src/navigation/AppNavigator.tsx` - Registered click-fix screens
- `mobile/src/screens/inbox/InboxListScreen.tsx` - Integrated click_fix into Sent tab
- `mobile/package.json` - Added expo-image-picker and expo-location dependencies

**Key Features:**

1. **Click & Fix Form**
   - Subject field (max 120 chars)
   - Description field (max 4000 chars)
   - Character counters
   - Location picker (GPS coordinates)
   - Photo picker (camera/gallery, max 3)
   - Client-side validation
   - Error handling for rate limit

2. **Sent Tab (Inbox Integration)**
   - Combined list showing both feedback and click_fix items
   - Sorted by date (newest first)
   - Type indicator badge for click_fix ("PRIJAVA")
   - Photo count indicator
   - Two action buttons: "Nova poruka" and "Prijavi problem"
   - Pull-to-refresh support

3. **Click & Fix Detail**
   - Shows original message with location
   - Photo gallery with fullscreen modal
   - Current status badge
   - Replies thread (chronological)
   - Pull-to-refresh for updates

### Admin Implementation

**New Files Created:**
- `admin/src/types/click-fix.ts` - Admin types with status colors
- `admin/src/pages/click-fix/ClickFixListPage.tsx` - List view with pagination
- `admin/src/pages/click-fix/ClickFixDetailPage.tsx` - Detail with photos, location, status change, and reply form

**Updated Files:**
- `admin/src/services/api.ts` - Added adminClickFixApi
- `admin/src/App.tsx` - Added click-fix routes
- `admin/src/layouts/DashboardLayout.tsx` - Added click-fix to navigation

**Key Features:**

1. **Click & Fix List**
   - Paginated list of all submissions
   - Status badges with colors
   - Photo count indicator
   - Reply count
   - Municipality scoping (via header)

2. **Click & Fix Detail**
   - Original message display
   - Location coordinates with "Open in Google Maps" link
   - Photo gallery with lightbox viewer
   - Status change buttons
   - Reply form
   - Thread of existing replies
   - Device and submission info

## API Endpoints

### Public Routes
- `POST /click-fix` - Submit new report (multipart, rate limited)
- `GET /click-fix/:id` - Get report detail (device-scoped)
- `GET /click-fix/sent` - List user's submitted reports

### Admin Routes
- `GET /admin/click-fix` - List all reports (paginated, scoped)
- `GET /admin/click-fix/:id` - Get report detail
- `PATCH /admin/click-fix/:id/status` - Update status
- `POST /admin/click-fix/:id/reply` - Add reply

### Static Files
- `GET /uploads/click-fix/*` - Serve uploaded photos

## Test Coverage

**Backend Tests: 41 tests**
- Validation functions (validateClickFixSubmission)
- Status helpers (getStatusLabel)
- Location validation (lat/lng bounds)
- Rate limit configuration
- Bilingual error messages
- Photo count validation
- Subject/description length validation

**Total Backend Tests: 186 (all passing)**

## Database Schema

```sql
-- Click & Fix table
CREATE TABLE click_fix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) NOT NULL,
  subject VARCHAR(120) NOT NULL,
  description VARCHAR(4000) NOT NULL,
  location JSONB NOT NULL,
  status feedback_status NOT NULL DEFAULT 'zaprimljeno',
  municipality VARCHAR(100),
  inbox_message_id UUID REFERENCES inbox_messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Click & Fix photos
CREATE TABLE click_fix_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_fix_id UUID NOT NULL REFERENCES click_fix(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Click & Fix replies
CREATE TABLE click_fix_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_fix_id UUID NOT NULL REFERENCES click_fix(id) ON DELETE CASCADE,
  body VARCHAR(4000) NOT NULL,
  admin_id VARCHAR(255),
  inbox_message_id UUID REFERENCES inbox_messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rate limiting
CREATE TABLE click_fix_rate_limits (
  device_id VARCHAR(255) NOT NULL,
  date_key DATE NOT NULL,
  submission_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (device_id, date_key)
);

-- Updated inbox_messages table
ALTER TABLE inbox_messages ADD COLUMN click_fix_id UUID REFERENCES click_fix(id);
ALTER TABLE inbox_messages ADD COLUMN click_fix_reply_id UUID REFERENCES click_fix_replies(id);
```

## Compliance with Spec

| Requirement | Status |
|-------------|--------|
| Anonymous device-based submission | DONE |
| Required location (lat/lng) | DONE |
| Optional photos (0-3) | DONE |
| Max 5MB per photo | DONE |
| JPEG/PNG/WebP only | DONE |
| Rate limit 3/day per device | DONE |
| Europe/Zagreb timezone for rate limit | DONE |
| Bilingual rate limit error (HR/EN) | DONE |
| Status values (exact) | DONE |
| Admin can change status | DONE |
| Admin can add multiple replies | DONE |
| Municipality scoping | DONE |
| Sent tab in Inbox (combined) | DONE |
| Admin list page | DONE |
| Admin detail page with photos | DONE |
| Tests for validation | DONE |

## Files Changed/Created

### Backend
- `src/db/migrations/008_click_fix.sql` (NEW)
- `src/types/click-fix.ts` (NEW)
- `src/repositories/click-fix.ts` (NEW)
- `src/routes/click-fix.ts` (NEW)
- `src/routes/admin-click-fix.ts` (NEW)
- `src/__tests__/click-fix.test.ts` (NEW)
- `src/index.ts` (MODIFIED - added routes, static file serving)
- `package.json` (MODIFIED - added dependencies)

### Mobile
- `src/types/click-fix.ts` (NEW)
- `src/screens/click-fix/ClickFixFormScreen.tsx` (NEW)
- `src/screens/click-fix/ClickFixConfirmationScreen.tsx` (NEW)
- `src/screens/click-fix/ClickFixDetailScreen.tsx` (NEW)
- `src/services/api.ts` (MODIFIED - added clickFixApi)
- `src/navigation/types.ts` (MODIFIED - added routes)
- `src/navigation/AppNavigator.tsx` (MODIFIED - registered screens)
- `src/screens/inbox/InboxListScreen.tsx` (MODIFIED - combined Sent tab)
- `package.json` (MODIFIED - added expo-image-picker, expo-location)

### Admin
- `src/types/click-fix.ts` (NEW)
- `src/pages/click-fix/ClickFixListPage.tsx` (NEW)
- `src/pages/click-fix/ClickFixDetailPage.tsx` (NEW)
- `src/services/api.ts` (MODIFIED - added adminClickFixApi)
- `src/App.tsx` (MODIFIED - added routes)
- `src/layouts/DashboardLayout.tsx` (MODIFIED - added nav item)

## Status Colors Reference

```typescript
const STATUS_COLORS = {
  zaprimljeno: { bg: '#E3F2FD', text: '#1565C0' },   // Blue
  u_razmatranju: { bg: '#FFF3E0', text: '#E65100' }, // Orange
  prihvaceno: { bg: '#E8F5E9', text: '#2E7D32' },    // Green
  odbijeno: { bg: '#FFEBEE', text: '#C62828' },      // Red
};
```

## CLI Verification

All CLI verification steps completed successfully on 2026-01-07.

### Backend TypeScript + Tests

```bash
cd backend
npm run typecheck
# Exit code: 0 (no errors)

npm test
```

**Output:**
```
 ✓ src/__tests__/transport.test.ts  (29 tests) 89ms
 ✓ src/__tests__/inbox.test.ts  (25 tests) 48ms
 ✓ src/__tests__/admin-inbox.test.ts  (16 tests) 45ms
 ✓ src/__tests__/events.test.ts  (16 tests) 48ms
 ✓ src/__tests__/static-pages.test.ts  (32 tests) 64ms
 ✓ src/__tests__/health.test.ts  (3 tests) 40ms
 ✓ src/__tests__/click-fix.test.ts  (41 tests) 64ms
 ✓ src/__tests__/feedback.test.ts  (24 tests) 63ms

 Test Files  9 passed (9)
      Tests  186 passed (186)
   Duration  881ms
```

### Mobile TypeScript

```bash
cd mobile
npx tsc --noEmit
# Exit code: 0 (no errors)
```

### Admin Build

```bash
cd admin
npm run build
```

**Output:**
```
> mojvis-admin@0.1.0 build
> tsc -b && vite build

vite v7.3.1 building client environment for production...
transforming...
✓ 59 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.45 kB │ gzip:  0.29 kB
dist/assets/index-CaXv68rm.css    0.49 kB │ gzip:  0.34 kB
dist/assets/index-BLLLL_iz.js   313.06 kB │ gzip: 88.75 kB
✓ built in 1.22s
```

## Key Technical Decisions

1. **Multipart File Upload**
   - Used @fastify/multipart for streaming file uploads
   - Files saved to disk, metadata stored in DB
   - Photo size validation done after upload (streaming constraint)

2. **Combined Sent Tab**
   - Merged feedback and click_fix items in single list
   - Sorted by created_at descending
   - Type badge distinguishes items

3. **Location Storage**
   - Stored as JSONB: `{ lat: number, lng: number }`
   - No address resolution (per spec: coordinates only)

4. **Reused Status Enum**
   - Reuses `feedback_status` enum from Phase 5
   - Same status workflow and colors

## Manual Verification Checklist

### Mobile App (iOS Simulator)
- [ ] Open Inbox > Sent tab
- [ ] Tap "Prijavi problem" button
- [ ] Fill subject and description
- [ ] Tap location picker - GPS coordinates should appear
- [ ] Add 1-3 photos from gallery
- [ ] Submit form
- [ ] Verify confirmation screen appears
- [ ] Navigate to Sent tab - click_fix item should appear with "PRIJAVA" badge
- [ ] Tap item to view detail with photos and location
- [ ] Verify photo modal opens on tap

### Admin Panel (Browser)
- [ ] Navigate to Click & Fix in sidebar
- [ ] Verify list shows submissions with status and photo count
- [ ] Click "Pregledaj" to view detail
- [ ] Verify photos display correctly
- [ ] Click "Otvori na karti" to verify Google Maps link
- [ ] Change status using status buttons
- [ ] Add a reply using reply form
- [ ] Verify status and reply appear in mobile app

### Rate Limiting
- [ ] Submit 3 click_fix reports in one day
- [ ] Attempt 4th submission - should show rate limit error

---

## Next Steps (Future Phases)

1. **Push Notifications** - Notify users of status changes and replies
2. **Admin Authentication** - Implement proper admin login with municipality scoping
3. **Photo Thumbnails** - Generate thumbnails for faster loading
4. **Location Address Resolution** - Optional reverse geocoding for display
