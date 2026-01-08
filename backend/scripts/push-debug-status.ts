#!/usr/bin/env npx tsx
/**
 * Push Debug Status Script
 *
 * Phase 7: CLI tool to check device push registration status.
 *
 * Usage:
 *   DEVICE_ID="your-device-id" npx tsx scripts/push-debug-status.ts
 *
 * Or with custom API URL:
 *   API_URL="http://localhost:3000" DEVICE_ID="device-123" npx tsx scripts/push-debug-status.ts
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const DEVICE_ID = process.env.DEVICE_ID;

async function main() {
  console.log('='.repeat(60));
  console.log('Phase 7 Push Debug Status');
  console.log('='.repeat(60));
  console.log();

  if (!DEVICE_ID) {
    console.error('ERROR: DEVICE_ID environment variable is required');
    console.log();
    console.log('Usage:');
    console.log('  DEVICE_ID="your-device-id" npx tsx scripts/push-debug-status.ts');
    console.log();
    process.exit(1);
  }

  console.log(`API URL:   ${API_URL}`);
  console.log(`Device ID: ${DEVICE_ID}`);
  console.log();

  try {
    const response = await fetch(`${API_URL}/device/push-debug`, {
      method: 'GET',
      headers: {
        'X-Device-ID': DEVICE_ID,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('ERROR: API request failed');
      console.error(`Status: ${response.status}`);
      console.error(`Error: ${JSON.stringify(error, null, 2)}`);
      process.exit(1);
    }

    const data = await response.json();

    console.log('Device Registration:');
    console.log('-'.repeat(40));
    console.log(`  Registered:    ${data.registered ? 'YES' : 'NO'}`);

    if (data.registered) {
      console.log(`  Device ID:     ${data.device_id}`);
      console.log(`  Platform:      ${data.platform}`);
      console.log(`  Locale:        ${data.locale}`);
      console.log(`  Push Opt-In:   ${data.push_opt_in ? 'YES' : 'NO'}`);
      console.log(`  Token (masked): ${data.expo_push_token_masked}`);
      console.log(`  Registered At: ${data.registered_at}`);
      console.log(`  Updated At:    ${data.updated_at}`);
    } else {
      console.log(`  Message: ${data.message}`);
    }

    console.log();
    console.log('Last Global Push:');
    console.log('-'.repeat(40));

    if (data.last_global_push) {
      const push = data.last_global_push;
      console.log(`  Message ID:    ${push.inbox_message_id}`);
      console.log(`  Sent At:       ${push.sent_at}`);
      console.log(`  Target Count:  ${push.target_count}`);
      console.log(`  Success Count: ${push.success_count}`);
      console.log(`  Failure Count: ${push.failure_count}`);
      console.log(`  Provider:      ${push.provider}`);
    } else {
      console.log('  No push notifications have been sent yet.');
    }

    console.log();
    console.log('='.repeat(60));
    console.log('Status check complete.');

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
