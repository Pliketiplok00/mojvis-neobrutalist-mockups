# Phase 7 Device Verification Checklist

Manual verification steps for push notification functionality on physical devices.

## Prerequisites

- Backend running locally or on staging server
- Expo development build installed on physical device
- Device has granted notification permissions

## iOS Physical Device Steps

### Step 1: Fresh Install & Onboarding
1. Delete app if previously installed
2. Install fresh Expo development build
3. Complete onboarding (choose language: HR or EN)
4. Note your device ID from Settings screen or logs

**Expected Result:**
- Onboarding completes successfully
- Push token registration logged: `[Push] Registering token: {...}`

### Step 2: Verify Registration
```bash
# Run from backend directory
DEVICE_ID="your-device-id" npx tsx scripts/push-debug-status.ts
```

**Expected Result:**
- Script shows: registered=true, platform=ios, locale matches onboarding choice
- Token is masked (e.g., `Exponent...xxxxxx`)

### Step 3: Test Push Toggle
1. Go to Settings screen
2. Toggle "Hitne obavijesti (push)" OFF
3. Run debug status script again

**Expected Result:**
- push_opt_in = false

4. Toggle back ON

**Expected Result:**
- push_opt_in = true

### Step 4: Trigger Test Push
```bash
# Run from backend directory
npx tsx scripts/push-debug-trigger.ts
```

**Expected Result:**
- Script outputs: inbox_message_id, target_count >= 1, success_count >= 1
- Device receives push notification within seconds
- Notification shows HR or EN content based on device locale

### Step 5: Push Tap Navigation
1. Tap on received notification
2. App should open to InboxDetail screen for that message

**Expected Result:**
- Navigates to Inbox first, then to message detail
- Message content matches push notification

### Step 6: Verify Message Lock
1. In admin panel, try to edit the pushed message
2. Form should be disabled with lock banner

**Expected Result:**
- Lock banner visible with push timestamp
- Save button not visible/disabled
- PUT request returns 409 if attempted via API

---

## Android Physical Device Steps

### Step 1: Fresh Install & Onboarding
1. Delete app if previously installed
2. Install fresh Expo development build
3. Complete onboarding (choose language: HR or EN)
4. Note your device ID from Settings screen or logs

**Expected Result:**
- Onboarding completes successfully
- Push token registration logged: `[Push] Registering token: {...}`
- Android notification channel "emergency" created

### Step 2: Verify Registration
```bash
DEVICE_ID="your-device-id" npx tsx scripts/push-debug-status.ts
```

**Expected Result:**
- Script shows: registered=true, platform=android, locale matches onboarding choice

### Step 3: Test Push Toggle
Same as iOS Step 3.

### Step 4: Trigger Test Push
Same as iOS Step 4.

**Expected Result:**
- Same as iOS, plus notification appears in notification shade
- High importance notification with vibration

### Step 5: Push Tap Navigation
Same as iOS Step 5.

### Step 6: Verify Message Lock
Same as iOS Step 6.

---

## Troubleshooting

### No push received
1. Check device is physical (not simulator/emulator)
2. Verify notification permissions granted
3. Check push_opt_in is true via debug script
4. Verify active_from/active_to window includes current time
5. Check backend logs for push send errors

### EN device not receiving push
- Verify message has English content (title_en, body_en)
- EN devices are excluded if no English content (by design)

### Token registration failed
- Check Expo project ID in app.json
- Verify device has network connectivity
- Check Constants.expoConfig is accessible

---

## CLI Commands Summary

```bash
# Check device registration status
cd backend
DEVICE_ID="device-123" npx tsx scripts/push-debug-status.ts

# Trigger test push (creates hitno message + sends push)
cd backend
npx tsx scripts/push-debug-trigger.ts

# Run backend tests
cd backend
npm test
```

---

## Sign-Off

| Tester | Device | Platform | Date | Status |
|--------|--------|----------|------|--------|
| | | iOS | | |
| | | Android | | |

**Notes:**
