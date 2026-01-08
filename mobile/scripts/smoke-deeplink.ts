#!/usr/bin/env npx tsx
/**
 * Mobile Deep Link Navigation Test
 *
 * Tests the deep link handler logic without requiring a full app runtime.
 * Simulates receiving a push notification payload and verifies correct
 * route resolution.
 *
 * Usage: npx tsx scripts/smoke-deeplink.ts
 */

interface PushNotificationPayload {
  inbox_message_id?: string;
  [key: string]: unknown;
}

interface NavigationRoute {
  name: string;
  params?: Record<string, unknown>;
}

/**
 * Simulates the deep link handler logic.
 * This mirrors the actual implementation in the app.
 */
function resolveDeepLinkRoute(payload: PushNotificationPayload): NavigationRoute | null {
  // Phase 7: Inbox message deep link
  if (payload.inbox_message_id) {
    return {
      name: 'InboxDetail',
      params: { messageId: payload.inbox_message_id },
    };
  }

  // Future: Add more deep link types here
  // e.g., event_id -> EventDetail, feedback_id -> FeedbackDetail

  return null;
}

/**
 * Test result
 */
interface TestResult {
  name: string;
  passed: boolean;
  expected?: NavigationRoute | null;
  actual?: NavigationRoute | null;
  error?: string;
}

const results: TestResult[] = [];

function test(
  name: string,
  payload: PushNotificationPayload,
  expected: NavigationRoute | null
): void {
  const actual = resolveDeepLinkRoute(payload);
  const passed = JSON.stringify(actual) === JSON.stringify(expected);

  results.push({
    name,
    passed,
    expected,
    actual,
    error: passed ? undefined : `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
  });

  const icon = passed ? '✓' : '✗';
  console.log(`${icon} ${name}`);
  if (!passed) {
    console.log(`    Expected: ${JSON.stringify(expected)}`);
    console.log(`    Actual:   ${JSON.stringify(actual)}`);
  }
}

// ============================================================================
// TEST CASES
// ============================================================================

console.log('='.repeat(60));
console.log('Mobile Deep Link Navigation Test');
console.log('='.repeat(60));
console.log('');

// Test 1: Inbox message deep link
test(
  'Inbox message deep link',
  { inbox_message_id: 'abc-123-def-456' },
  { name: 'InboxDetail', params: { messageId: 'abc-123-def-456' } }
);

// Test 2: Empty payload returns null
test(
  'Empty payload returns null',
  {},
  null
);

// Test 3: Unknown payload field returns null
test(
  'Unknown payload field returns null',
  { unknown_field: 'value' },
  null
);

// Test 4: Payload with extra fields still resolves inbox
test(
  'Payload with extra fields still resolves inbox',
  { inbox_message_id: 'msg-id-789', extra: 'data', sound: 'default' },
  { name: 'InboxDetail', params: { messageId: 'msg-id-789' } }
);

// Test 5: Empty string inbox_message_id
test(
  'Empty string inbox_message_id returns null (falsy)',
  { inbox_message_id: '' },
  null
);

// ============================================================================
// SUMMARY
// ============================================================================

console.log('');
console.log('-'.repeat(60));
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
console.log('='.repeat(60));

if (failed > 0) {
  console.log('\nSome tests failed.');
  process.exit(1);
} else {
  console.log('\nAll tests passed!');
  process.exit(0);
}
