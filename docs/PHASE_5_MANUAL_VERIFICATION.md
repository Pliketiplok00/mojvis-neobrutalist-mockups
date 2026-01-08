# Phase 5 Manual Verification Checklist

This checklist must be completed by a human tester before Phase 5 is formally closed.

## Prerequisites

**IMPORTANT:** Before testing Phase 5 features, ensure the following:

### Onboarding Must Complete Successfully

The app must be able to navigate through the onboarding flow and reach the Home screen.

**Verification steps:**
1. Run `npx expo start --ios` in the `mobile` directory
2. Select a language (Hrvatski or English)
3. Select user mode (Visitor or Local)
4. If Local, select a municipality (Vis or Komiza)
5. Verify Home screen appears

**Persistence check:**
- After completing onboarding, close and reopen the app
- Verify Home screen appears directly (no onboarding loop)

**Smoke check (automated):**
```bash
cd mobile
npx tsx scripts/smoke-check-onboarding.ts
```

If onboarding does not complete successfully, Phase 5 testing is blocked.

---

## Mobile (iOS Simulator)

### Feedback Submission (HR)
- [ ] Open app in iOS simulator
- [ ] Navigate to Inbox screen
- [ ] Tap "Poslano" tab
- [ ] Tap "Nova poruka" button
- [ ] Fill in subject (Tema) in Croatian
- [ ] Fill in body (Poruka) in Croatian
- [ ] Submit form
- [ ] Verify confirmation screen appears with checkmark
- [ ] Navigate to Inbox > Poslano tab
- [ ] Verify new feedback appears with status "Zaprimljeno" (blue badge)

### Feedback Detail View
- [ ] Tap on the submitted feedback in Sent tab
- [ ] Verify detail screen shows subject and body correctly
- [ ] Verify status badge shows "Zaprimljeno"
- [ ] Verify "Odgovori" section shows "Jos nema odgovora..."

### Admin Reply Flow
- [ ] Open admin dashboard in browser
- [ ] Navigate to "Povratne inf."
- [ ] Find the submitted feedback
- [ ] Click "Pregledaj" to open detail
- [ ] Add a reply in Croatian (matching original language)
- [ ] Submit reply
- [ ] Return to mobile app
- [ ] Pull-to-refresh the feedback detail screen
- [ ] Verify reply appears in the thread

### Status Change Flow
- [ ] In admin dashboard, change feedback status to "U razmatranju"
- [ ] Return to mobile app
- [ ] Pull-to-refresh Inbox > Poslano tab
- [ ] Verify status badge changed to "U razmatranju" (orange badge)

### Feedback Submission (EN)
- [ ] Repeat submission flow with English text
- [ ] Verify it appears correctly in Sent tab
- [ ] In admin, verify language shows "EN"
- [ ] Add reply (must be in English per spec)
- [ ] Verify reply appears on mobile

### Rate Limiting (Optional)
- [ ] Submit 3 feedback items
- [ ] Attempt 4th submission
- [ ] Verify bilingual error message appears (HR + EN)

---

## Admin (Browser)

### Feedback List
- [ ] Navigate to "Povratne inf." in sidebar
- [ ] Verify list loads with pagination
- [ ] Verify columns: Tema, Status, Jezik, Odgovori, Datum, Akcije
- [ ] Verify status badges have correct colors:
  - Zaprimljeno: Blue (#E3F2FD / #1565C0)
  - U razmatranju: Orange (#FFF3E0 / #E65100)
  - Prihvaceno: Green (#E8F5E9 / #2E7D32)
  - Odbijeno: Red (#FFEBEE / #C62828)

### Feedback Detail
- [ ] Click "Pregledaj" on any feedback
- [ ] Verify original message displays correctly
- [ ] Verify status badge and language indicator appear
- [ ] Verify device ID and creation date shown in sidebar

### Status Changes
- [ ] Change status to "U razmatranju" - verify badge updates
- [ ] Change status to "Prihvaceno" - verify badge updates
- [ ] Change status to "Odbijeno" - verify badge updates
- [ ] Change status back to "Zaprimljeno" - verify badge updates

### Reply Functionality
- [ ] Add first reply - verify it appears in thread
- [ ] Add second reply - verify thread shows multiple replies
- [ ] Verify reply timestamps are displayed correctly
- [ ] Verify language hint shows correct language (HR/EN)

### Municipality Scoping (if applicable)
- [ ] If testing with municipal admin, verify only relevant feedback visible
- [ ] Visitor feedback (municipality: null) should be visible to all

---

## Verification Sign-off

**Tester Name:** ___________________

**Date:** ___________________

**Mobile Verification:**
- [ ] All mobile tests passed
- [ ] Issues found (describe): ___________________

**Admin Verification:**
- [ ] All admin tests passed
- [ ] Issues found (describe): ___________________

**Overall Status:**
- [ ] Phase 5 APPROVED for closure
- [ ] Phase 5 REQUIRES FIXES (list issues below)

**Notes:**
```
[Add any additional notes or observations here]
```
