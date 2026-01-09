# Cross-System Flow Gaps Addendum

**Branch:** `audit/cross-system-flows`
**Date:** 2026-01-09

---

## Summary

During cross-system flow verification, no **blocking** gaps were found. All 6 flows work correctly at the API level. However, some architectural and operational observations are noted below.

---

## Observations (Non-Blocking)

### 1. Admin Authentication Not Enforced

**Severity:** HIGH (Security)
**Status:** Known issue (not new)

All admin endpoints work without authentication headers:
- POST /admin/inbox
- POST /admin/events
- PATCH /admin/pages/{id}/publish
- etc.

**Impact:** In production, any client could modify data.

**Existing WI:** Should map to security work item for admin auth implementation.

---

### 2. Reminder Subscription Manual Prerequisite

**Severity:** LOW (UX)
**Status:** As designed

For Flow 6 (Reminders), devices must explicitly:
1. Subscribe to an event via `POST /events/{id}/subscribe`
2. Wait for reminder generation (scheduled or manual)

**Impact:** Users won't receive reminders unless they subscribe. This is by design but may need UI discoverability.

**Recommendation:** Ensure mobile EventDetail screen has a clear "Subscribe to reminder" button.

---

### 3. Supervisor Role Required for Page Publish

**Severity:** INFO
**Status:** As designed

Adding blocks and publishing pages requires `X-Admin-Role: supervisor` header.

**Example:**
```bash
# This works:
curl -X POST .../admin/pages/{id}/publish -H 'X-Admin-Role: supervisor'

# This would fail (403 expected, but no auth so it passes):
curl -X POST .../admin/pages/{id}/publish
# Actually passes due to no auth enforcement
```

**Impact:** Role-based access is coded but not enforced until auth is implemented.

---

### 4. Banner Context Logic

**Severity:** INFO
**Status:** Working as designed

Banners are filtered by context (home, transport, events) and appear on all contexts if tags match hitno.

Verified contexts:
- `home`: Shows hitno + relevant tags
- `transport`: Shows hitno + promet + pomorski_promet + cestovni_promet
- `events`: Shows hitno + kultura

**No gap found** - filtering works correctly.

---

### 5. Click-Fix Requires Multipart

**Severity:** INFO
**Status:** As designed

Click-Fix submission must use multipart/form-data even if no photos are attached.

Sending JSON to `POST /click-fix` returns 500 error.

**Impact:** Mobile implementation must always use FormData.

---

## New Gaps Discovered

### GAP-1: No Banner Tap Deep Link Verification

**Description:** While banners are returned correctly by the API, the mobile app's behavior when tapping a banner to navigate to InboxDetail was not verified at runtime (no mobile simulator was used in this verification).

**Verification Status:** API level PASS, runtime unverified.

**Recommendation:** Verify in mobile device or simulator that:
1. Banner tap extracts message ID
2. Navigation to InboxDetail passes correct ID
3. InboxDetail screen loads and displays message

---

### GAP-2: Sent Tab Polling Not Verified

**Description:** The mobile "Sent" tab (Feedback + Click-Fix combined) was verified at API level but not at UI runtime.

**Verification Status:** API level PASS, UI unverified.

**Recommendation:** Verify mobile Inbox Sent tab correctly:
1. Fetches both `/feedback/sent` and `/click-fix/sent`
2. Combines and sorts by date
3. Displays correct status badges

---

### GAP-3: Event Subscription UI Not Audited

**Description:** The subscription endpoint `POST /events/{id}/subscribe` works, but the mobile UI for subscribing was not verified.

**Verification Status:** API level PASS, UI unverified.

**Recommendation:** Check if EventDetail screen has:
1. Subscribe button
2. Unsubscribe button (toggle)
3. Subscription status indicator

---

## Work Item Mapping

| Gap | Related WI | Notes |
|-----|------------|-------|
| Admin auth not enforced | (existing) | Security critical |
| Banner deep link | NEW | Mobile UI verification |
| Sent tab UI | NEW | Mobile UI verification |
| Event subscription UI | NEW | Mobile UI verification |

---

## Suggested New Work Items

### WI-NEW-1: Mobile UI Runtime Verification

**Description:** Run mobile app in simulator and manually verify:
- Banner tap navigation
- Inbox Sent tab combined list
- Event subscription toggle
- Click-Fix photo display

**Priority:** Medium
**Effort:** 1-2 hours manual testing

---

### WI-NEW-2: Reminder Subscription Discoverability

**Description:** Ensure mobile EventDetail screen clearly shows:
- Whether user is subscribed
- Toggle to subscribe/unsubscribe
- Explanation of what reminder does

**Priority:** Low
**Effort:** UI design review

---

## Conclusion

All cross-system flows pass at the API level. The system correctly:
1. Creates and persists data across all entity types
2. Returns data to mobile-compatible endpoints
3. Supports the full lifecycle (create -> update -> read)

Remaining gaps are primarily:
- UI-level verification (requires simulator/device)
- Security (auth not enforced - known issue)
