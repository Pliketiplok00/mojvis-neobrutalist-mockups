# Phase 5 Completion Report: Feedback System

## Overview

Phase 5 implements the anonymous Feedback system for MOJ VIS, enabling users to send feedback messages with status tracking and admin replies.

## Implementation Summary

### Backend Implementation

**New Files Created:**
- `backend/src/db/migrations/007_feedback.sql` - Database schema for feedback tables
- `backend/src/types/feedback.ts` - Types, validation functions, rate limit config
- `backend/src/repositories/feedback.ts` - Database operations with rate limiting
- `backend/src/routes/feedback.ts` - Public API routes (submit, view, list sent)
- `backend/src/routes/admin-feedback.ts` - Admin API routes (list, detail, status, reply)
- `backend/src/__tests__/feedback.test.ts` - Test suite (24 tests)

**Key Features:**

1. **Anonymous Device-Based Submission**
   - Uses X-Device-ID header for identification
   - No contact fields required
   - No category selection

2. **Rate Limiting**
   - 3 submissions per device per day (Europe/Zagreb timezone)
   - Returns 429 with bilingual error message (HR/EN)
   - Daily reset at midnight Zagreb time

3. **Status Workflow**
   - Status values: `zaprimljeno`, `u_razmatranju`, `prihvaceno`, `odbijeno`
   - Admin can change status at any time
   - Status changes reflected in user's Sent tab

4. **Admin Reply Thread**
   - Admin can add multiple replies (thread)
   - Reply language must match original feedback language
   - Replies create inbox messages for user notification

5. **Municipality Scoping**
   - Local admins only see feedback from their municipality
   - Visitor feedback visible to all admins
   - X-Admin-Municipality header controls scoping

### Mobile Implementation

**New Files Created:**
- `mobile/src/types/feedback.ts` - Mobile types with validation
- `mobile/src/screens/feedback/FeedbackFormScreen.tsx` - Submission form
- `mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx` - Success screen
- `mobile/src/screens/feedback/FeedbackDetailScreen.tsx` - View feedback with replies

**Updated Files:**
- `mobile/src/services/api.ts` - Added feedbackApi
- `mobile/src/navigation/types.ts` - Added feedback screen routes
- `mobile/src/navigation/AppNavigator.tsx` - Registered feedback screens
- `mobile/src/screens/inbox/InboxListScreen.tsx` - Updated Sent tab with actual items

**Key Features:**

1. **Feedback Form**
   - Subject field (max 120 chars)
   - Body field (max 4000 chars)
   - Character counters
   - Client-side validation
   - Error handling for rate limit

2. **Sent Tab (Inbox Integration)**
   - Shows all submitted feedback
   - Status badge with color coding
   - Tap to view detail with replies
   - "Nova poruka" button to submit new feedback
   - Pull-to-refresh support

3. **Feedback Detail**
   - Shows original message
   - Current status badge
   - Replies thread (chronological)
   - Pull-to-refresh for updates

### Admin Implementation

**New Files Created:**
- `admin/src/types/feedback.ts` - Admin types with status colors
- `admin/src/pages/feedback/FeedbackListPage.tsx` - List view with pagination
- `admin/src/pages/feedback/FeedbackDetailPage.tsx` - Detail with status change and reply form

**Updated Files:**
- `admin/src/services/api.ts` - Added adminFeedbackApi
- `admin/src/App.tsx` - Added feedback routes
- `admin/src/layouts/DashboardLayout.tsx` - Added feedback to navigation

**Key Features:**

1. **Feedback List**
   - Paginated list of all feedback
   - Status badges with colors
   - Language indicator
   - Reply count
   - Municipality scoping (via header)

2. **Feedback Detail**
   - Original message display
   - Status change buttons
   - Reply form with language hint
   - Thread of existing replies
   - Device and submission info

## API Endpoints

### Public Routes
- `POST /feedback` - Submit new feedback (rate limited)
- `GET /feedback/:id` - Get feedback detail (device-scoped)
- `GET /feedback/sent` - List user's submitted feedback

### Admin Routes
- `GET /admin/feedback` - List all feedback (paginated, scoped)
- `GET /admin/feedback/:id` - Get feedback detail
- `PATCH /admin/feedback/:id/status` - Update status
- `POST /admin/feedback/:id/reply` - Add reply

## Test Coverage

**Backend Tests: 24 tests**
- Validation functions (validateFeedbackSubmission)
- Status helpers (getStatusLabel)
- Rate limit configuration
- Bilingual error messages
- Subject/body length validation
- Feedback status enum values

**All backend tests pass.**

## Database Schema

```sql
-- Feedback status enum
CREATE TYPE feedback_status AS ENUM (
  'zaprimljeno',
  'u_razmatranju',
  'prihvaceno',
  'odbijeno'
);

-- Feedback language enum
CREATE TYPE feedback_language AS ENUM ('hr', 'en');

-- Main feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) NOT NULL,
  subject VARCHAR(120) NOT NULL,
  body VARCHAR(4000) NOT NULL,
  status feedback_status NOT NULL DEFAULT 'zaprimljeno',
  language feedback_language NOT NULL DEFAULT 'hr',
  municipality VARCHAR(100),
  inbox_message_id UUID REFERENCES inbox_messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feedback replies
CREATE TABLE feedback_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  body VARCHAR(4000) NOT NULL,
  admin_id VARCHAR(255),
  inbox_message_id UUID REFERENCES inbox_messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rate limiting
CREATE TABLE feedback_rate_limits (
  device_id VARCHAR(255) NOT NULL,
  date_key DATE NOT NULL,
  submission_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (device_id, date_key)
);
```

## Compliance with Spec

| Requirement | Status |
|-------------|--------|
| Anonymous device-based submission | DONE |
| No contact fields | DONE |
| No category field | DONE |
| Rate limit 3/day per device | DONE |
| Europe/Zagreb timezone for rate limit | DONE |
| Bilingual rate limit error (HR/EN) | DONE |
| Status values (exact) | DONE |
| Admin can change status | DONE |
| Admin can add multiple replies | DONE |
| Reply language matches original | DONE |
| Municipality scoping | DONE |
| Sent tab in Inbox | DONE |
| Admin list page | DONE |
| Admin detail page | DONE |
| Tests for validation | DONE |

## Files Changed/Created

### Backend
- `src/db/migrations/007_feedback.sql` (NEW)
- `src/types/feedback.ts` (NEW)
- `src/repositories/feedback.ts` (NEW)
- `src/routes/feedback.ts` (NEW)
- `src/routes/admin-feedback.ts` (NEW)
- `src/__tests__/feedback.test.ts` (NEW)
- `src/index.ts` (MODIFIED - added route registration)

### Mobile
- `src/types/feedback.ts` (NEW)
- `src/screens/feedback/FeedbackFormScreen.tsx` (NEW)
- `src/screens/feedback/FeedbackConfirmationScreen.tsx` (NEW)
- `src/screens/feedback/FeedbackDetailScreen.tsx` (NEW)
- `src/services/api.ts` (MODIFIED - added feedbackApi)
- `src/navigation/types.ts` (MODIFIED - added feedback routes)
- `src/navigation/AppNavigator.tsx` (MODIFIED - registered screens)
- `src/screens/inbox/InboxListScreen.tsx` (MODIFIED - Sent tab implementation)

### Admin
- `src/types/feedback.ts` (NEW)
- `src/pages/feedback/FeedbackListPage.tsx` (NEW)
- `src/pages/feedback/FeedbackDetailPage.tsx` (NEW)
- `src/services/api.ts` (MODIFIED - added adminFeedbackApi)
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

### Mobile TypeScript + Expo Bundling

```bash
cd mobile
npx tsc --noEmit
# Exit code: 0 (no errors)

npx expo export --platform ios
```

**Output:**
```
Starting Metro Bundler
iOS ./index.ts ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░ 99.9% (838/838)
iOS Bundled 10769ms index.ts (838 modules)

› Assets (16):
node_modules/@react-navigation/elements/lib/module/assets/back-icon-mask.png (653 B)
node_modules/@react-navigation/elements/lib/module/assets/back-icon.png (4 variations | 566 B)
node_modules/@react-navigation/elements/lib/module/assets/clear-icon.png (4 variations | 425 B)
node_modules/@react-navigation/elements/lib/module/assets/close-icon.png (4 variations | 235 B)
node_modules/@react-navigation/elements/lib/module/assets/search-icon.png (3 variations | 582 B)

› ios bundles (1):
_expo/static/js/ios/index-6ffc695011728039ae23d6dda7a3506e.hbc (2.3 MB)

› Files (1):
metadata.json (1.34 kB)

Exported: dist
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
✓ 56 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.45 kB │ gzip:  0.29 kB
dist/assets/index-CaXv68rm.css    0.49 kB │ gzip:  0.34 kB
dist/assets/index-D69ZEwP6.js   297.40 kB │ gzip: 87.08 kB
✓ built in 1.19s
```

### Backend TypeScript + Tests

```bash
cd backend
npx tsc --noEmit
# Exit code: 0 (no errors)

npm test
```

**Output:**
```
 ✓ src/__tests__/transport.test.ts  (29 tests) 84ms
 ✓ src/__tests__/inbox.test.ts  (25 tests) 56ms
 ✓ src/__tests__/admin-inbox.test.ts  (16 tests) 49ms
 ✓ src/__tests__/events.test.ts  (16 tests) 52ms
 ✓ src/__tests__/static-pages.test.ts  (32 tests) 56ms
 ✓ src/__tests__/health.test.ts  (3 tests) 31ms
 ✓ src/__tests__/feedback.test.ts  (24 tests) 52ms

 Test Files  8 passed (8)
      Tests  145 passed (145)
   Duration  916ms
```

## Manual Verification

**Status:** Pending - requires human verification (simulator + browser)

### Onboarding Regression (RESOLVED)

Manual verification was initially blocked by an onboarding navigation regression:
- **Root cause:** Onboarding screens had TODO placeholders for navigation to Home
- **Fix applied:** Implemented OnboardingContext with AsyncStorage persistence
- **Files added/modified:**
  - `mobile/src/contexts/OnboardingContext.tsx` (NEW)
  - `mobile/src/screens/onboarding/*.tsx` (MODIFIED)
  - `mobile/src/navigation/AppNavigator.tsx` (MODIFIED)
  - `mobile/App.tsx` (MODIFIED)
  - `mobile/scripts/smoke-check-onboarding.ts` (NEW)

**Verification:** Run `npx tsx scripts/smoke-check-onboarding.ts` in mobile directory.

### Hamburger Menu Regression (RESOLVED)

Manual verification was also blocked by hamburger menu not opening:
- **Root cause:** No menu implementation existed. Hamburger handlers were TODO placeholders (`console.info` only).
- **Initial attempt:** Used `@react-navigation/drawer` with `react-native-reanimated`, but this caused native binary mismatch errors in Expo Go (`WorkletsError: Mismatch between JavaScript part and native part`).
- **Final fix:** Implemented custom `MenuOverlay` using React Native's built-in `Animated` API (no native modules required):
  - Created `MenuContext` for open/close state management
  - Created `MenuOverlay.tsx` - animated slide-in panel with menu items
  - Updated root screens to use `useMenu()` hook
- **Files added/modified:**
  - `mobile/src/components/MenuOverlay.tsx` (NEW)
  - `mobile/src/contexts/MenuContext.tsx` (NEW)
  - `mobile/App.tsx` (MODIFIED - added MenuProvider and MenuOverlay)
  - `mobile/src/navigation/AppNavigator.tsx` (MODIFIED - accepts navigation ref)
  - `mobile/src/screens/home/HomeScreen.tsx` (MODIFIED - uses useMenu)
  - `mobile/src/screens/transport/TransportHubScreen.tsx` (MODIFIED - uses useMenu)
  - `mobile/src/screens/events/EventsScreen.tsx` (MODIFIED - uses useMenu)
  - `mobile/scripts/smoke-check-menu.ts` (NEW)

**Verification:** Run `npx tsx scripts/smoke-check-menu.ts` in mobile directory.

**Manual verification:**
1. Start app with `npx expo start --ios`
2. Complete onboarding if needed
3. On Home screen, tap hamburger icon (top-left)
4. Menu overlay should slide in from left with items: Pocetna, Vozni red, Dogadaji, Pristiglo
5. Tap "Vozni red" - should navigate to Transport Hub
6. Tap hamburger again - menu should open

### Checklist

See [PHASE_5_MANUAL_VERIFICATION.md](./PHASE_5_MANUAL_VERIFICATION.md) for the complete checklist.

### Required Checks:
- iOS Simulator: Feedback submission, Sent tab, detail view, admin reply flow
- Admin Browser: Feedback list, status changes, reply functionality, municipality scoping

Phase 5 will be formally closed after manual verification is complete and signed off.

---

## Next Steps (Future Phases)

1. **Push Notifications** - Notify users of status changes and replies
2. **Admin Authentication** - Implement proper admin login with municipality scoping
3. **Analytics** - Track feedback submission patterns
4. **Export** - Allow admin to export feedback data
