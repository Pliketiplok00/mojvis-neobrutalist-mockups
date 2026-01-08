#!/usr/bin/env npx tsx
/**
 * Admin API Smoke Test Script (DB-Backed)
 *
 * Verifies all admin API endpoints with full CRUD operations.
 * Requires real PostgreSQL database connection.
 *
 * Usage: npx tsx scripts/admin-smoke.ts [BASE_URL]
 *
 * Environment:
 *   API_URL - Backend API URL (default: http://localhost:3000)
 */

const API_URL = process.argv[2] || process.env.API_URL || 'http://localhost:3000';

interface TestResult {
  test: string;
  endpoint: string;
  method: string;
  status: number | 'ERROR';
  success: boolean;
  response?: string;
  error?: string;
}

const results: TestResult[] = [];

async function testEndpoint(
  test: string,
  method: string,
  endpoint: string,
  body?: object,
  expectedStatus: number[] = [200, 201],
  headers?: Record<string, string>
): Promise<TestResult> {
  const url = `${API_URL}${endpoint}`;

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const text = await response.text();

    const result: TestResult = {
      test,
      endpoint,
      method,
      status: response.status,
      success: expectedStatus.includes(response.status),
      response: text,  // Keep full response for parsing
    };
    results.push(result);
    return result;
  } catch (error) {
    const result: TestResult = {
      test,
      endpoint,
      method,
      status: 'ERROR',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    results.push(result);
    return result;
  }
}

async function runTests(): Promise<void> {
  console.log('='.repeat(70));
  console.log('Admin API Smoke Test (DB-Backed)');
  console.log('='.repeat(70));
  console.log(`API URL: ${API_URL}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('');

  // =========================================================================
  // 1. HEALTH CHECK - Must return 200
  // =========================================================================
  console.log('--- 1. Health Check (MUST be 200) ---');
  const healthResult = await testEndpoint('Health 200', 'GET', '/health');
  if (healthResult.status !== 200) {
    console.log('');
    console.log('FATAL: /health is not 200. Database not connected.');
    console.log('Response:', healthResult.response);
    console.log('');
    console.log('Aborting smoke test. Fix database connection first.');
    process.exit(1);
  }
  console.log(`  /health: ${healthResult.status} OK`);
  console.log(`  Response: ${healthResult.response}`);
  console.log('');

  // =========================================================================
  // 2. ADMIN INBOX - CRUD
  // =========================================================================
  console.log('--- 2. Admin Inbox CRUD ---');

  // 2.1 List existing
  const inboxList = await testEndpoint('Inbox List', 'GET', '/admin/inbox');
  console.log(`  GET /admin/inbox: ${inboxList.status}`);
  const listData = JSON.parse(inboxList.response || '{}');
  console.log(`    Total messages: ${listData.total}`);

  // 2.2 Create new message
  const createInbox = await testEndpoint('Inbox Create', 'POST', '/admin/inbox', {
    title_hr: 'Smoke Test Poruka',
    title_en: 'Smoke Test Message',
    body_hr: 'Ovo je testna poruka za smoke test.',
    body_en: 'This is a test message for smoke test.',
    tags: ['opcenito'],
    active_from: new Date().toISOString(),
    active_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }, [201]);
  console.log(`  POST /admin/inbox: ${createInbox.status}`);
  let createdInboxId = '';
  if (createInbox.success) {
    const created = JSON.parse(createInbox.response || '{}');
    createdInboxId = created.id;
    console.log(`    Created ID: ${createdInboxId}`);
  }

  // 2.3 Read created
  if (createdInboxId) {
    const readInbox = await testEndpoint('Inbox Read', 'GET', `/admin/inbox/${createdInboxId}`);
    console.log(`  GET /admin/inbox/${createdInboxId}: ${readInbox.status}`);
  }

  // 2.4 Update message
  if (createdInboxId) {
    const updateInbox = await testEndpoint('Inbox Update', 'PATCH', `/admin/inbox/${createdInboxId}`, {
      title_hr: 'Smoke Test Poruka (Ažurirano)',
      title_en: 'Smoke Test Message (Updated)',
      body_hr: 'Ova poruka je ažurirana.',
      body_en: 'This message has been updated.',
      tags: ['opcenito'],
    });
    console.log(`  PATCH /admin/inbox/${createdInboxId}: ${updateInbox.status}`);
  }

  // 2.5 Delete (soft delete)
  if (createdInboxId) {
    const deleteInbox = await testEndpoint('Inbox Delete', 'DELETE', `/admin/inbox/${createdInboxId}`, undefined, [200, 204]);
    console.log(`  DELETE /admin/inbox/${createdInboxId}: ${deleteInbox.status}`);
  }
  console.log('');

  // =========================================================================
  // 3. ADMIN EVENTS - CRUD
  // =========================================================================
  console.log('--- 3. Admin Events CRUD ---');

  const eventsList = await testEndpoint('Events List', 'GET', '/admin/events');
  console.log(`  GET /admin/events: ${eventsList.status}`);

  const createEvent = await testEndpoint('Event Create', 'POST', '/admin/events', {
    title_hr: 'Smoke Test Događaj',
    title_en: 'Smoke Test Event',
    description_hr: 'Opis testnog događaja.',
    description_en: 'Test event description.',
    start_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    is_all_day: false,
  }, [201]);
  console.log(`  POST /admin/events: ${createEvent.status}`);
  let createdEventId = '';
  if (createEvent.success) {
    const created = JSON.parse(createEvent.response || '{}');
    createdEventId = created.id;
    console.log(`    Created ID: ${createdEventId}`);
  }

  if (createdEventId) {
    const updateEvent = await testEndpoint('Event Update', 'PATCH', `/admin/events/${createdEventId}`, {
      title_hr: 'Smoke Test Događaj (Ažurirano)',
      title_en: 'Smoke Test Event (Updated)',
      description_hr: 'Ažurirani opis.',
      description_en: 'Updated description.',
      start_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      is_all_day: false,
    });
    console.log(`  PATCH /admin/events/${createdEventId}: ${updateEvent.status}`);

    const deleteEvent = await testEndpoint('Event Delete', 'DELETE', `/admin/events/${createdEventId}`, undefined, [200, 204]);
    console.log(`  DELETE /admin/events/${createdEventId}: ${deleteEvent.status}`);
  }
  console.log('');

  // =========================================================================
  // 4. ADMIN PAGES
  // =========================================================================
  console.log('--- 4. Admin Pages ---');

  const pagesList = await testEndpoint('Pages List', 'GET', '/admin/pages');
  console.log(`  GET /admin/pages: ${pagesList.status}`);
  const pagesData = JSON.parse(pagesList.response || '{}');
  console.log(`    Total pages: ${pagesData.total}`);

  // Show existing pages
  if (pagesData.pages && pagesData.pages.length > 0) {
    const pageId = pagesData.pages[0].id;
    const pageDetail = await testEndpoint('Page Detail', 'GET', `/admin/pages/${pageId}`);
    console.log(`  GET /admin/pages/${pageId}: ${pageDetail.status}`);
  }
  console.log('');

  // =========================================================================
  // 5. ADMIN FEEDBACK
  // =========================================================================
  console.log('--- 5. Admin Feedback ---');

  const feedbackList = await testEndpoint('Feedback List', 'GET', '/admin/feedback');
  console.log(`  GET /admin/feedback: ${feedbackList.status}`);
  const feedbackData = JSON.parse(feedbackList.response || '{}');
  console.log(`    Total feedback: ${feedbackData.total || feedbackData.feedback?.length || 0}`);

  if (feedbackData.feedback && feedbackData.feedback.length > 0) {
    const feedbackId = feedbackData.feedback[0].id;
    const feedbackDetail = await testEndpoint('Feedback Detail', 'GET', `/admin/feedback/${feedbackId}`);
    console.log(`  GET /admin/feedback/${feedbackId}: ${feedbackDetail.status}`);

    // Update status (valid values: zaprimljeno, u_razmatranju, prihvaceno, odbijeno)
    const updateStatus = await testEndpoint('Feedback Status', 'PATCH', `/admin/feedback/${feedbackId}/status`, {
      status: 'u_razmatranju',
    });
    console.log(`  PATCH /admin/feedback/${feedbackId}/status: ${updateStatus.status}`);
  }
  console.log('');

  // =========================================================================
  // 6. ADMIN CLICK & FIX
  // =========================================================================
  console.log('--- 6. Admin Click & Fix ---');

  const clickFixList = await testEndpoint('ClickFix List', 'GET', '/admin/click-fix');
  console.log(`  GET /admin/click-fix: ${clickFixList.status}`);
  const clickFixData = JSON.parse(clickFixList.response || '{}');
  console.log(`    Total reports: ${clickFixData.total || clickFixData.reports?.length || 0}`);

  if (clickFixData.reports && clickFixData.reports.length > 0) {
    const reportId = clickFixData.reports[0].id;
    const reportDetail = await testEndpoint('ClickFix Detail', 'GET', `/admin/click-fix/${reportId}`);
    console.log(`  GET /admin/click-fix/${reportId}: ${reportDetail.status}`);
  }
  console.log('');

  // =========================================================================
  // 7. LOCKED MESSAGE 409 TEST
  // =========================================================================
  console.log('--- 7. Locked Message 409 Test ---');

  // Get the hitno message (should exist from seed data)
  const inboxListForLock = await testEndpoint('Get Hitno', 'GET', '/admin/inbox');
  const inboxDataForLock = JSON.parse(inboxListForLock.response || '{}');
  const hitnoMsg = inboxDataForLock.messages?.find((m: { tags: string[] }) => m.tags?.includes('hitno'));

  if (hitnoMsg) {
    console.log(`  Found hitno message: ${hitnoMsg.id}`);
    console.log(`    is_locked: ${hitnoMsg.is_locked}`);
    console.log(`    pushed_at: ${hitnoMsg.pushed_at || 'not pushed'}`);

    if (hitnoMsg.is_locked) {
      // Try to update locked message - should get 409
      const update409 = await testEndpoint('Locked 409', 'PUT', `/admin/inbox/${hitnoMsg.id}`, {
        title_hr: 'Attempting to edit locked message',
        body_hr: 'This should fail',
        tags: ['hitno'],
      }, [409]);
      console.log(`  PUT /admin/inbox/${hitnoMsg.id} (locked): ${update409.status}`);
      if (update409.status === 409) {
        console.log('    PASS: Locked message correctly returns 409');
      }
    } else {
      console.log('  Note: Hitno message not yet locked (no push triggered)');
      console.log('  To test 409: trigger push via POST /admin/inbox with hitno + active window');
    }
  } else {
    console.log('  No hitno message found in seed data');
  }
  console.log('');

  // =========================================================================
  // 8. PUBLIC ENDPOINTS
  // =========================================================================
  console.log('--- 8. Public Endpoints ---');

  const publicInbox = await testEndpoint('Public Inbox', 'GET', '/inbox');
  console.log(`  GET /inbox: ${publicInbox.status}`);

  const publicEvents = await testEndpoint('Public Events', 'GET', '/events');
  console.log(`  GET /events: ${publicEvents.status}`);

  const publicPages = await testEndpoint('Public Pages', 'GET', '/pages');
  console.log(`  GET /pages: ${publicPages.status}`);

  const publicTransportRoad = await testEndpoint('Transport Road', 'GET', '/transport/road/lines');
  console.log(`  GET /transport/road/lines: ${publicTransportRoad.status}`);

  const publicTransportSea = await testEndpoint('Transport Sea', 'GET', '/transport/sea/lines');
  console.log(`  GET /transport/sea/lines: ${publicTransportSea.status}`);
  console.log('');

  // =========================================================================
  // RESULTS SUMMARY
  // =========================================================================
  console.log('='.repeat(70));
  console.log('Results Summary');
  console.log('='.repeat(70));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  for (const result of results) {
    const icon = result.success ? '✓' : '✗';
    const statusStr = result.status === 'ERROR' ? 'ERROR' : result.status.toString();
    console.log(`${icon} ${result.test.padEnd(20)} ${result.method.padEnd(7)} ${result.endpoint.padEnd(40)} ${statusStr}`);
    if (!result.success) {
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
      if (result.response) {
        console.log(`    Response: ${result.response.substring(0, 200)}`);
      }
    }
  }

  console.log('');
  console.log('-'.repeat(70));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(70));

  if (failed > 0) {
    console.log('\nSome tests failed. Check the results above.');
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
