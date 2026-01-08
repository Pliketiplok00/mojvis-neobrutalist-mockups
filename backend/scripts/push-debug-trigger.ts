#!/usr/bin/env npx tsx
/**
 * Push Debug Trigger Script
 *
 * Phase 7: CLI tool to trigger a test push notification.
 *
 * This script:
 * 1. Creates a test hitno inbox message with active window including "now"
 * 2. The message creation triggers push through the same codepath as admin UI
 * 3. Prints the push result
 *
 * Usage:
 *   npx tsx scripts/push-debug-trigger.ts
 *
 * Or with custom API URL:
 *   API_URL="http://localhost:3000" npx tsx scripts/push-debug-trigger.ts
 *
 * NOTE: This goes through the same business rules as admin-inbox save.
 * No business rules are bypassed.
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function main() {
  console.log('='.repeat(60));
  console.log('Phase 7 Push Debug Trigger');
  console.log('='.repeat(60));
  console.log();
  console.log(`API URL: ${API_URL}`);
  console.log();

  // Create active window: now - 1 hour to now + 1 hour
  const now = new Date();
  const activeFrom = new Date(now.getTime() - 60 * 60 * 1000);
  const activeTo = new Date(now.getTime() + 60 * 60 * 1000);

  const testMessage = {
    title_hr: `[TEST] Hitna obavijest - ${now.toISOString()}`,
    title_en: `[TEST] Emergency notice - ${now.toISOString()}`,
    body_hr: 'Ovo je testna hitna poruka za provjeru push obavijesti. Ignorirajte ovu poruku.',
    body_en: 'This is a test emergency message to verify push notifications. Please ignore this message.',
    tags: ['hitno'],
    active_from: activeFrom.toISOString(),
    active_to: activeTo.toISOString(),
  };

  console.log('Creating test hitno message...');
  console.log('-'.repeat(40));
  console.log(`  Title (HR): ${testMessage.title_hr}`);
  console.log(`  Tags: ${testMessage.tags.join(', ')}`);
  console.log(`  Active From: ${testMessage.active_from}`);
  console.log(`  Active To: ${testMessage.active_to}`);
  console.log(`  Current Time: ${now.toISOString()}`);
  console.log();

  try {
    // Step 1: Create the message (this triggers push automatically)
    console.log('POST /admin/inbox ...');
    const createResponse = await fetch(`${API_URL}/admin/inbox`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error('ERROR: Failed to create message');
      console.error(`Status: ${createResponse.status}`);
      console.error(`Error: ${JSON.stringify(error, null, 2)}`);
      process.exit(1);
    }

    const createdMessage = await createResponse.json();

    console.log('Message created successfully!');
    console.log('-'.repeat(40));
    console.log(`  Message ID: ${createdMessage.id}`);
    console.log(`  Is Locked: ${createdMessage.is_locked ? 'YES' : 'NO'}`);
    console.log(`  Pushed At: ${createdMessage.pushed_at || 'Not pushed'}`);
    console.log();

    // Step 2: Get the latest push log to see results
    console.log('Fetching push log...');
    const debugResponse = await fetch(`${API_URL}/device/push-debug`, {
      method: 'GET',
      headers: {
        'X-Device-ID': 'debug-script',
        'Content-Type': 'application/json',
      },
    });

    if (debugResponse.ok) {
      const debugData = await debugResponse.json();

      console.log();
      console.log('Push Results:');
      console.log('-'.repeat(40));

      if (debugData.last_global_push) {
        const push = debugData.last_global_push;
        console.log(`  Inbox Message ID: ${push.inbox_message_id}`);
        console.log(`  Sent At: ${push.sent_at}`);
        console.log(`  Target Count: ${push.target_count}`);
        console.log(`  Success Count: ${push.success_count}`);
        console.log(`  Failure Count: ${push.failure_count}`);
        console.log(`  Provider: ${push.provider}`);

        if (push.target_count === 0) {
          console.log();
          console.log('NOTE: Target count is 0. This may be because:');
          console.log('  - No devices are registered for push');
          console.log('  - All devices opted out of push');
          console.log('  - No devices match the message language');
        }
      } else {
        console.log('  No push log found.');
        console.log('  The push may not have triggered if no devices were eligible.');
      }
    }

    console.log();
    console.log('='.repeat(60));
    console.log('Push trigger complete.');
    console.log();
    console.log('To verify on device:');
    console.log('  1. Check if push notification was received');
    console.log('  2. Tap notification to verify deep linking');
    console.log(`  3. Message ID to look for: ${createdMessage.id}`);

    // Step 3: Verify locked state
    if (createdMessage.is_locked) {
      console.log();
      console.log('Verifying locked state...');
      const updateResponse = await fetch(`${API_URL}/admin/inbox/${createdMessage.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title_hr: 'Attempted update' }),
      });

      if (updateResponse.status === 409) {
        console.log('  PASS: Locked message correctly returns 409 on edit attempt');
      } else {
        console.log(`  FAIL: Expected 409, got ${updateResponse.status}`);
      }
    }

  } catch (error) {
    console.error('ERROR: Failed to connect to API');
    console.error(error instanceof Error ? error.message : String(error));
    console.log();
    console.log('Make sure the backend is running:');
    console.log('  cd backend && npm run dev');
    process.exit(1);
  }
}

main();
