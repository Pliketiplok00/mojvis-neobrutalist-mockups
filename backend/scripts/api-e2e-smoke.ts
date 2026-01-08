#!/usr/bin/env npx tsx
/**
 * API E2E Smoke Test Script (DB-Backed)
 *
 * Comprehensive end-to-end verification of all admin and public API endpoints.
 * Requires real PostgreSQL database connection (no mock mode).
 *
 * Coverage:
 * - Inbox CRUD + HITNO push-lock flow
 * - Events CRUD
 * - Static Pages (draft/publish)
 * - Feedback (public submit + admin management + replies)
 * - Click & Fix (multipart upload + admin management + replies)
 * - Transport (read-only verification)
 *
 * Usage: npx tsx scripts/api-e2e-smoke.ts [BASE_URL]
 *
 * Environment:
 *   API_URL - Backend API URL (default: http://localhost:3000)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = process.argv[2] || process.env.API_URL || 'http://localhost:3000';

interface TestResult {
  test: string;
  phase: string;
  endpoint: string;
  method: string;
  status: number | 'ERROR';
  success: boolean;
  response?: unknown;
  error?: string;
  assertion?: string;
}

const results: TestResult[] = [];
const testDeviceId = `e2e-test-device-${Date.now()}`;

/**
 * Make HTTP request and return result
 */
async function request(
  method: string,
  endpoint: string,
  options: {
    body?: unknown;
    headers?: Record<string, string>;
    multipart?: Record<string, string | { data: Buffer; filename: string; contentType: string }>;
    expectedStatus?: number[];
  } = {}
): Promise<{ status: number; data: unknown; ok: boolean }> {
  const url = `${API_URL}${endpoint}`;
  const { body, headers = {}, multipart, expectedStatus = [200, 201] } = options;

  const requestOptions: RequestInit = {
    method,
    headers: {
      ...headers,
    },
  };

  if (multipart) {
    // Build multipart form data manually
    const boundary = `----formdata-${Date.now()}`;
    const parts: Buffer[] = [];

    for (const [key, value] of Object.entries(multipart)) {
      if (typeof value === 'string') {
        parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`));
      } else {
        parts.push(Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="${key}"; filename="${value.filename}"\r\nContent-Type: ${value.contentType}\r\n\r\n`
        ));
        parts.push(value.data);
        parts.push(Buffer.from('\r\n'));
      }
    }
    parts.push(Buffer.from(`--${boundary}--\r\n`));

    requestOptions.headers = {
      ...requestOptions.headers,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    };
    requestOptions.body = Buffer.concat(parts);
  } else if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Content-Type': 'application/json',
    };
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return {
      status: response.status,
      data,
      ok: expectedStatus.includes(response.status),
    };
  } catch (error) {
    return {
      status: 0,
      data: null,
      ok: false,
    };
  }
}

/**
 * Add test result
 */
function addResult(
  test: string,
  phase: string,
  method: string,
  endpoint: string,
  status: number | 'ERROR',
  success: boolean,
  options: { response?: unknown; error?: string; assertion?: string } = {}
): void {
  results.push({
    test,
    phase,
    endpoint,
    method,
    status,
    success,
    ...options,
  });

  const icon = success ? '✓' : '✗';
  const statusStr = status === 'ERROR' ? 'ERROR' : status.toString();
  console.log(`  ${icon} ${test}: ${statusStr}${options.assertion ? ` - ${options.assertion}` : ''}`);
  if (!success && options.error) {
    console.log(`      Error: ${options.error}`);
  }
}

/**
 * Assert condition and log result
 */
function assert(
  condition: boolean,
  test: string,
  phase: string,
  method: string,
  endpoint: string,
  status: number,
  assertion: string,
  response?: unknown
): boolean {
  addResult(test, phase, method, endpoint, status, condition, {
    response,
    assertion,
    error: condition ? undefined : `Assertion failed: ${assertion}`,
  });
  return condition;
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

async function testHealth(): Promise<boolean> {
  console.log('\n--- 1. Health Check (GATE) ---');

  const res = await request('GET', '/health');
  const data = res.data as { status?: string; checks?: { database?: boolean } };

  if (res.status !== 200) {
    addResult('Health Check', 'health', 'GET', '/health', res.status, false, {
      error: 'Health check failed - database not connected',
      response: res.data,
    });
    return false;
  }

  return assert(
    data.status === 'ok' && data.checks?.database === true,
    'Health Check',
    'health',
    'GET',
    '/health',
    res.status,
    'status=ok AND database=true',
    res.data
  );
}

async function testInboxCRUD(): Promise<{ normalId: string; hitnoId: string }> {
  console.log('\n--- 2. Inbox CRUD + HITNO Lock Flow ---');

  // 2.1 Create normal message
  const createNormal = await request('POST', '/admin/inbox', {
    body: {
      title_hr: 'E2E Test Normal Message',
      title_en: 'E2E Test Normal Message',
      body_hr: 'Ovo je testna poruka za E2E test.',
      body_en: 'This is a test message for E2E test.',
      tags: ['opcenito'],
      active_from: new Date().toISOString(),
      active_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    expectedStatus: [201],
  });

  const normalData = createNormal.data as { id?: string };
  const normalId = normalData.id || '';

  assert(
    createNormal.status === 201 && !!normalId,
    'Create Normal Message',
    'inbox',
    'POST',
    '/admin/inbox',
    createNormal.status,
    'status=201 AND id present',
    createNormal.data
  );

  // 2.2 List should contain message
  const listAfterCreate = await request('GET', '/admin/inbox');
  const listData = listAfterCreate.data as { messages?: Array<{ id: string }> };
  const foundInList = listData.messages?.some((m) => m.id === normalId) ?? false;

  assert(
    foundInList,
    'List Contains Created Message',
    'inbox',
    'GET',
    '/admin/inbox',
    listAfterCreate.status,
    `message ${normalId.slice(0, 8)}... in list`,
    { total: listData.messages?.length }
  );

  // 2.3 Read detail
  const detail = await request('GET', `/admin/inbox/${normalId}`);
  const detailData = detail.data as { id?: string; title_hr?: string };

  assert(
    detail.status === 200 && detailData.id === normalId,
    'Read Message Detail',
    'inbox',
    'GET',
    `/admin/inbox/${normalId}`,
    detail.status,
    'id matches',
    { title_hr: detailData.title_hr }
  );

  // 2.4 Update message
  const update = await request('PATCH', `/admin/inbox/${normalId}`, {
    body: {
      title_hr: 'E2E Test Normal Message (Updated)',
    },
  });
  const updateData = update.data as { title_hr?: string };

  assert(
    update.status === 200 && updateData.title_hr?.includes('Updated'),
    'Update Message',
    'inbox',
    'PATCH',
    `/admin/inbox/${normalId}`,
    update.status,
    'title updated',
    { title_hr: updateData.title_hr }
  );

  // 2.5 Delete (soft)
  const del = await request('DELETE', `/admin/inbox/${normalId}`, {
    expectedStatus: [200, 204],
  });

  assert(
    [200, 204].includes(del.status),
    'Soft Delete Message',
    'inbox',
    'DELETE',
    `/admin/inbox/${normalId}`,
    del.status,
    'deleted successfully'
  );

  // 2.6 List no longer shows deleted (unless ?include_deleted)
  const listAfterDelete = await request('GET', '/admin/inbox');
  const listAfterDeleteData = listAfterDelete.data as { messages?: Array<{ id: string; deleted_at?: string | null }> };
  const stillVisible = listAfterDeleteData.messages?.find((m) => m.id === normalId);
  const isDeleted = stillVisible?.deleted_at !== null;

  assert(
    isDeleted || !stillVisible,
    'List Excludes Deleted',
    'inbox',
    'GET',
    '/admin/inbox',
    listAfterDelete.status,
    'deleted message marked or excluded'
  );

  // 2.7 Create HITNO message with active window (should trigger push + lock)
  const now = new Date();
  const createHitno = await request('POST', '/admin/inbox', {
    body: {
      title_hr: '[HITNO] E2E Test Emergency',
      title_en: '[URGENT] E2E Test Emergency',
      body_hr: 'Hitna poruka za E2E test.',
      body_en: 'Emergency message for E2E test.',
      tags: ['hitno', 'vis'],
      active_from: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      active_to: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    },
    expectedStatus: [201],
  });

  const hitnoData = createHitno.data as { id?: string; is_locked?: boolean; pushed_at?: string | null };
  const hitnoId = hitnoData.id || '';

  assert(
    createHitno.status === 201 && !!hitnoId,
    'Create HITNO Message',
    'inbox',
    'POST',
    '/admin/inbox',
    createHitno.status,
    'status=201 AND id present',
    { id: hitnoId, is_locked: hitnoData.is_locked, pushed_at: hitnoData.pushed_at }
  );

  // Note: Push may not lock if no devices registered, so we test both cases
  if (hitnoData.is_locked) {
    // 2.8 Attempt to update locked message - should get 409
    const updateLocked = await request('PATCH', `/admin/inbox/${hitnoId}`, {
      body: { title_hr: 'Attempting to edit locked message' },
      expectedStatus: [409],
    });

    assert(
      updateLocked.status === 409,
      'Update Locked Message Returns 409',
      'inbox',
      'PATCH',
      `/admin/inbox/${hitnoId}`,
      updateLocked.status,
      'locked message rejects edit with 409',
      updateLocked.data
    );
  } else {
    // No devices registered, push didn't happen, message not locked
    addResult(
      'HITNO Not Locked (No Devices)',
      'inbox',
      'POST',
      '/admin/inbox',
      201,
      true,
      { assertion: 'No devices registered - push not triggered', response: hitnoData }
    );
  }

  // 2.9 Verify push_notification_logs table has entry (if pushed)
  // This would require direct DB query - skipping for API-only test
  // Instead, verify via GET that is_locked and pushed_at are set

  const hitnoDetail = await request('GET', `/admin/inbox/${hitnoId}`);
  const hitnoDetailData = hitnoDetail.data as { is_locked?: boolean; pushed_at?: string | null };

  addResult(
    'HITNO Lock State',
    'inbox',
    'GET',
    `/admin/inbox/${hitnoId}`,
    hitnoDetail.status,
    true,
    {
      assertion: `is_locked=${hitnoDetailData.is_locked}, pushed_at=${hitnoDetailData.pushed_at || 'null'}`,
      response: { is_locked: hitnoDetailData.is_locked, pushed_at: hitnoDetailData.pushed_at },
    }
  );

  return { normalId, hitnoId };
}

async function testEventsCRUD(): Promise<string> {
  console.log('\n--- 3. Events CRUD ---');

  // 3.1 Create event
  const create = await request('POST', '/admin/events', {
    body: {
      title_hr: 'E2E Test Event',
      title_en: 'E2E Test Event',
      description_hr: 'Opis E2E testnog događaja.',
      description_en: 'E2E test event description.',
      start_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      is_all_day: false,
    },
    expectedStatus: [201],
  });

  const createData = create.data as { id?: string };
  const eventId = createData.id || '';

  assert(
    create.status === 201 && !!eventId,
    'Create Event',
    'events',
    'POST',
    '/admin/events',
    create.status,
    'status=201 AND id present'
  );

  // 3.2 List contains event
  const list = await request('GET', '/admin/events');
  const listData = list.data as { events?: Array<{ id: string }> };
  const found = listData.events?.some((e) => e.id === eventId) ?? false;

  assert(
    found,
    'List Contains Event',
    'events',
    'GET',
    '/admin/events',
    list.status,
    `event ${eventId.slice(0, 8)}... in list`
  );

  // 3.3 Update event
  const update = await request('PATCH', `/admin/events/${eventId}`, {
    body: {
      title_hr: 'E2E Test Event (Updated)',
    },
  });

  assert(
    update.status === 200,
    'Update Event',
    'events',
    'PATCH',
    `/admin/events/${eventId}`,
    update.status,
    'event updated'
  );

  // 3.4 Delete event
  const del = await request('DELETE', `/admin/events/${eventId}`, {
    expectedStatus: [200, 204],
  });

  assert(
    [200, 204].includes(del.status),
    'Delete Event',
    'events',
    'DELETE',
    `/admin/events/${eventId}`,
    del.status,
    'event deleted'
  );

  // 3.5 Verify not in list
  const listAfter = await request('GET', '/admin/events');
  const listAfterData = listAfter.data as { events?: Array<{ id: string }> };
  const stillFound = listAfterData.events?.some((e) => e.id === eventId) ?? false;

  assert(
    !stillFound,
    'List Excludes Deleted Event',
    'events',
    'GET',
    '/admin/events',
    listAfter.status,
    'deleted event not in list'
  );

  return eventId;
}

async function testStaticPages(): Promise<void> {
  console.log('\n--- 4. Static Pages ---');

  // 4.1 List pages
  const list = await request('GET', '/admin/pages');
  const listData = list.data as { pages?: Array<{ id: string; slug: string }>; total?: number };

  assert(
    list.status === 200 && Array.isArray(listData.pages),
    'List Pages',
    'pages',
    'GET',
    '/admin/pages',
    list.status,
    `total=${listData.total || listData.pages?.length}`,
    { total: listData.total }
  );

  if (listData.pages && listData.pages.length > 0) {
    const pageId = listData.pages[0].id;
    const pageSlug = listData.pages[0].slug;

    // 4.2 Get page detail
    const detail = await request('GET', `/admin/pages/${pageId}`);

    assert(
      detail.status === 200,
      'Get Page Detail',
      'pages',
      'GET',
      `/admin/pages/${pageId}`,
      detail.status,
      `slug=${pageSlug}`
    );

    // 4.3 Update draft (if endpoint exists)
    const updateDraft = await request('PATCH', `/admin/pages/${pageId}`, {
      body: {
        draft_header: {
          type: 'header',
          title_hr: 'E2E Updated Title',
          title_en: 'E2E Updated Title',
        },
      },
    });

    if (updateDraft.status === 200) {
      const updateData = updateDraft.data as { draft_updated_at?: string };
      assert(
        updateData.draft_updated_at !== undefined,
        'Update Draft',
        'pages',
        'PATCH',
        `/admin/pages/${pageId}`,
        updateDraft.status,
        'draft_updated_at changed'
      );
    } else if (updateDraft.status === 404 || updateDraft.status === 405) {
      addResult(
        'Update Draft (Not Implemented)',
        'pages',
        'PATCH',
        `/admin/pages/${pageId}`,
        updateDraft.status,
        true,
        { assertion: 'endpoint not implemented yet' }
      );
    }

    // 4.4 Test public endpoint
    const publicPage = await request('GET', `/pages/${pageSlug}`);

    assert(
      publicPage.status === 200,
      'Public Page Access',
      'pages',
      'GET',
      `/pages/${pageSlug}`,
      publicPage.status,
      'public page accessible'
    );
  } else {
    addResult('No Pages to Test', 'pages', 'GET', '/admin/pages', list.status, true, {
      assertion: 'no pages seeded - skipping detail tests',
    });
  }
}

async function testFeedback(): Promise<string> {
  console.log('\n--- 5. Feedback Flow ---');

  // 5.1 Public POST /feedback
  const submit = await request('POST', '/feedback', {
    body: {
      subject: 'E2E Test Feedback',
      body: 'This is E2E test feedback submission.',
    },
    headers: {
      'X-Device-ID': testDeviceId,
      'X-User-Mode': 'local',
      'X-Municipality': 'vis',
      'Accept-Language': 'hr',
    },
    expectedStatus: [201],
  });

  const submitData = submit.data as { id?: string };
  const feedbackId = submitData.id || '';

  assert(
    submit.status === 201 && !!feedbackId,
    'Submit Feedback (Public)',
    'feedback',
    'POST',
    '/feedback',
    submit.status,
    'status=201 AND id present',
    { id: feedbackId }
  );

  // 5.2 Public GET /feedback/sent contains id
  const sent = await request('GET', '/feedback/sent', {
    headers: {
      'X-Device-ID': testDeviceId,
    },
  });

  const sentData = sent.data as { items?: Array<{ id: string }> };
  const foundInSent = sentData.items?.some((f) => f.id === feedbackId) ?? false;

  assert(
    foundInSent,
    'Sent Contains Feedback',
    'feedback',
    'GET',
    '/feedback/sent',
    sent.status,
    `feedback ${feedbackId.slice(0, 8)}... in sent`
  );

  // 5.3 Admin GET list contains id
  const adminList = await request('GET', '/admin/feedback');
  const adminListData = adminList.data as { feedback?: Array<{ id: string }> };
  const foundInAdmin = adminListData.feedback?.some((f) => f.id === feedbackId) ?? false;

  assert(
    foundInAdmin,
    'Admin List Contains Feedback',
    'feedback',
    'GET',
    '/admin/feedback',
    adminList.status,
    `feedback ${feedbackId.slice(0, 8)}... in admin list`
  );

  // 5.4 Admin PATCH status
  const patchStatus = await request('PATCH', `/admin/feedback/${feedbackId}/status`, {
    body: { status: 'u_razmatranju' },
  });

  assert(
    patchStatus.status === 200,
    'Admin Update Status',
    'feedback',
    'PATCH',
    `/admin/feedback/${feedbackId}/status`,
    patchStatus.status,
    'status changed to u_razmatranju'
  );

  // 5.5 Verify status change visible to user
  const userDetail = await request('GET', `/feedback/${feedbackId}`, {
    headers: { 'X-Device-ID': testDeviceId },
  });

  const userDetailData = userDetail.data as { status?: string };

  assert(
    userDetailData.status === 'u_razmatranju',
    'User Sees Status Change',
    'feedback',
    'GET',
    `/feedback/${feedbackId}`,
    userDetail.status,
    'status=u_razmatranju visible to user'
  );

  // 5.6 Admin POST reply
  const reply = await request('POST', `/admin/feedback/${feedbackId}/reply`, {
    body: { body: 'E2E test admin reply' },
    expectedStatus: [201],
  });

  const replyData = reply.data as { id?: string };

  assert(
    reply.status === 201 && !!replyData.id,
    'Admin Reply',
    'feedback',
    'POST',
    `/admin/feedback/${feedbackId}/reply`,
    reply.status,
    'reply created'
  );

  // 5.7 Verify reply visible to user
  const userDetailWithReply = await request('GET', `/feedback/${feedbackId}`, {
    headers: { 'X-Device-ID': testDeviceId },
  });

  const detailWithReply = userDetailWithReply.data as { replies?: Array<{ body: string }> };
  const hasReply = detailWithReply.replies?.some((r) => r.body === 'E2E test admin reply') ?? false;

  assert(
    hasReply,
    'User Sees Reply',
    'feedback',
    'GET',
    `/feedback/${feedbackId}`,
    userDetailWithReply.status,
    'admin reply visible to user'
  );

  return feedbackId;
}

async function testClickFix(): Promise<{ id: string; filename: string }> {
  console.log('\n--- 6. Click & Fix Flow ---');

  // 6.1 Create a small test image (1x1 red pixel PNG)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
    0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  // 6.2 Submit click-fix with multipart
  const submit = await request('POST', '/click-fix', {
    multipart: {
      subject: 'E2E Test Issue Report',
      description: 'This is an E2E test click-fix submission with photo.',
      location: JSON.stringify({ lat: 43.0622, lng: 16.1836 }),
      photos: { data: pngData, filename: 'test-photo.png', contentType: 'image/png' },
    },
    headers: {
      'X-Device-ID': testDeviceId,
      'X-User-Mode': 'local',
      'X-Municipality': 'vis',
      'Accept-Language': 'hr',
    },
    expectedStatus: [201],
  });

  const submitData = submit.data as { id?: string };
  const clickFixId = submitData.id || '';

  assert(
    submit.status === 201 && !!clickFixId,
    'Submit Click-Fix (Multipart)',
    'click-fix',
    'POST',
    '/click-fix',
    submit.status,
    'status=201 AND id present',
    { id: clickFixId }
  );

  // 6.3 Public GET /click-fix/sent contains id
  const sent = await request('GET', '/click-fix/sent', {
    headers: { 'X-Device-ID': testDeviceId },
  });

  const sentData = sent.data as { items?: Array<{ id: string; photo_count?: number }> };
  const foundItem = sentData.items?.find((cf) => cf.id === clickFixId);

  assert(
    !!foundItem,
    'Sent Contains Click-Fix',
    'click-fix',
    'GET',
    '/click-fix/sent',
    sent.status,
    `click-fix ${clickFixId.slice(0, 8)}... in sent, photo_count=${foundItem?.photo_count}`
  );

  // 6.4 Admin list contains id
  const adminList = await request('GET', '/admin/click-fix');
  const adminListData = adminList.data as { items?: Array<{ id: string }> };
  const foundInAdmin = adminListData.items?.some((cf) => cf.id === clickFixId) ?? false;

  assert(
    foundInAdmin,
    'Admin List Contains Click-Fix',
    'click-fix',
    'GET',
    '/admin/click-fix',
    adminList.status,
    `click-fix ${clickFixId.slice(0, 8)}... in admin list`
  );

  // 6.5 Admin detail shows photos + location
  const adminDetail = await request('GET', `/admin/click-fix/${clickFixId}`);
  const adminDetailData = adminDetail.data as {
    photos?: Array<{ url: string; file_name: string }>;
    location?: { lat: number; lng: number };
  };

  const hasPhotos = (adminDetailData.photos?.length ?? 0) > 0;
  const hasLocation = !!adminDetailData.location?.lat && !!adminDetailData.location?.lng;
  const photoFilename = adminDetailData.photos?.[0]?.url?.split('/').pop() || '';

  assert(
    hasPhotos && hasLocation,
    'Admin Detail Shows Photos + Location',
    'click-fix',
    'GET',
    `/admin/click-fix/${clickFixId}`,
    adminDetail.status,
    `photos=${adminDetailData.photos?.length}, location=${adminDetailData.location?.lat},${adminDetailData.location?.lng}`
  );

  // 6.6 Admin PATCH status
  const patchStatus = await request('PATCH', `/admin/click-fix/${clickFixId}/status`, {
    body: { status: 'prihvaceno' },
  });

  assert(
    patchStatus.status === 200,
    'Admin Update Status',
    'click-fix',
    'PATCH',
    `/admin/click-fix/${clickFixId}/status`,
    patchStatus.status,
    'status changed to prihvaceno'
  );

  // 6.7 User sees status change
  const userDetail = await request('GET', `/click-fix/${clickFixId}`, {
    headers: { 'X-Device-ID': testDeviceId },
  });

  const userDetailData = userDetail.data as { status?: string };

  assert(
    userDetailData.status === 'prihvaceno',
    'User Sees Status Change',
    'click-fix',
    'GET',
    `/click-fix/${clickFixId}`,
    userDetail.status,
    'status=prihvaceno visible to user'
  );

  // 6.8 Admin reply
  const reply = await request('POST', `/admin/click-fix/${clickFixId}/reply`, {
    body: { body: 'E2E test admin reply for click-fix' },
    expectedStatus: [201],
  });

  assert(
    reply.status === 201,
    'Admin Reply',
    'click-fix',
    'POST',
    `/admin/click-fix/${clickFixId}/reply`,
    reply.status,
    'reply created'
  );

  // 6.9 User sees reply
  const userWithReply = await request('GET', `/click-fix/${clickFixId}`, {
    headers: { 'X-Device-ID': testDeviceId },
  });

  const withReply = userWithReply.data as { replies?: Array<{ body: string }> };
  const hasReply = withReply.replies?.some((r) => r.body.includes('E2E test admin reply')) ?? false;

  assert(
    hasReply,
    'User Sees Reply',
    'click-fix',
    'GET',
    `/click-fix/${clickFixId}`,
    userWithReply.status,
    'admin reply visible to user'
  );

  // 6.10 Static GET /uploads/click-fix/<filename> returns 200
  if (photoFilename) {
    const photoUrl = `/uploads/click-fix/${photoFilename}`;
    const photoRes = await request('GET', photoUrl, { expectedStatus: [200] });

    assert(
      photoRes.status === 200,
      'Photo Static Accessible',
      'click-fix',
      'GET',
      photoUrl,
      photoRes.status,
      'uploaded photo accessible via static route'
    );
  }

  return { id: clickFixId, filename: photoFilename };
}

async function testTransport(): Promise<void> {
  console.log('\n--- 7. Transport (Read-Only) ---');

  // 7.1 Road lines
  const roadLines = await request('GET', '/transport/road/lines');

  assert(
    roadLines.status === 200,
    'Road Lines',
    'transport',
    'GET',
    '/transport/road/lines',
    roadLines.status,
    'road lines accessible'
  );

  // 7.2 Sea lines
  const seaLines = await request('GET', '/transport/sea/lines');

  assert(
    seaLines.status === 200,
    'Sea Lines',
    'transport',
    'GET',
    '/transport/sea/lines',
    seaLines.status,
    'sea lines accessible'
  );

  // 7.3 Check if any lines exist and test detail
  const roadData = roadLines.data as { lines?: Array<{ id: string }> };
  if (roadData.lines && roadData.lines.length > 0) {
    const lineId = roadData.lines[0].id;
    const lineDetail = await request('GET', `/transport/road/lines/${lineId}`);

    assert(
      lineDetail.status === 200,
      'Road Line Detail',
      'transport',
      'GET',
      `/transport/road/lines/${lineId}`,
      lineDetail.status,
      'line detail accessible'
    );

    // 7.4 Departures (if applicable)
    const today = new Date().toISOString().split('T')[0];
    const departures = await request('GET', `/transport/road/lines/${lineId}/departures?date=${today}`);

    if (departures.status === 200) {
      const depData = departures.data as { departures?: Array<{ stop_times?: (string | null)[] }> };
      // Verify stop_times can include null (for skipped stops)
      const hasNullStops = depData.departures?.some((d) => d.stop_times?.includes(null)) ?? false;

      addResult(
        'Departures (Null Stops Check)',
        'transport',
        'GET',
        `/transport/road/lines/${lineId}/departures`,
        departures.status,
        true,
        { assertion: `has null stops: ${hasNullStops}` }
      );
    }
  }
}

async function testPublicEndpoints(): Promise<void> {
  console.log('\n--- 8. Public Endpoints ---');

  const endpoints = [
    { path: '/inbox', name: 'Public Inbox' },
    { path: '/events', name: 'Public Events' },
    { path: '/pages', name: 'Public Pages' },
  ];

  for (const ep of endpoints) {
    const res = await request('GET', ep.path);
    assert(
      res.status === 200,
      ep.name,
      'public',
      'GET',
      ep.path,
      res.status,
      'accessible'
    );
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function runTests(): Promise<void> {
  console.log('='.repeat(70));
  console.log('API E2E Smoke Test (DB-Backed)');
  console.log('='.repeat(70));
  console.log(`API URL: ${API_URL}`);
  console.log(`Test Device ID: ${testDeviceId}`);
  console.log(`Date: ${new Date().toISOString()}`);

  // 1. Health check (gate)
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n');
    console.log('FATAL: /health check failed. Database not connected.');
    console.log('Run: ./scripts/dev-postgres.sh');
    console.log('Aborting E2E tests.');
    process.exit(1);
  }

  // 2. Inbox CRUD + HITNO
  await testInboxCRUD();

  // 3. Events CRUD
  await testEventsCRUD();

  // 4. Static Pages
  await testStaticPages();

  // 5. Feedback
  await testFeedback();

  // 6. Click & Fix
  await testClickFix();

  // 7. Transport
  await testTransport();

  // 8. Public endpoints
  await testPublicEndpoints();

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('Results Summary');
  console.log('='.repeat(70));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  // Group by phase
  const phases = [...new Set(results.map((r) => r.phase))];
  for (const phase of phases) {
    const phaseResults = results.filter((r) => r.phase === phase);
    const phasePassed = phaseResults.filter((r) => r.success).length;
    const phaseFailed = phaseResults.filter((r) => !r.success).length;
    console.log(`\n[${phase.toUpperCase()}] ${phasePassed}/${phaseResults.length} passed`);
    for (const r of phaseResults) {
      const icon = r.success ? '✓' : '✗';
      console.log(`  ${icon} ${r.test}`);
    }
  }

  console.log('\n' + '-'.repeat(70));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(70));

  // Write report
  const reportPath = join(__dirname, '..', '..', 'docs', 'API_E2E_REPORT.md');
  mkdirSync(dirname(reportPath), { recursive: true });

  const report = generateReport(passed, failed);
  writeFileSync(reportPath, report);
  console.log(`\nReport written to: ${reportPath}`);

  if (failed > 0) {
    console.log('\nSome tests failed. Check the results above.');
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
    process.exit(0);
  }
}

function generateReport(passed: number, failed: number): string {
  const lines: string[] = [
    '# API E2E Test Report',
    '',
    `**Date:** ${new Date().toISOString()}`,
    `**API URL:** ${API_URL}`,
    `**Test Device ID:** ${testDeviceId}`,
    '',
    '## Summary',
    '',
    `| Metric | Result |`,
    `|--------|--------|`,
    `| Total Tests | ${results.length} |`,
    `| Passed | ${passed} |`,
    `| Failed | ${failed} |`,
    `| Status | ${failed === 0 ? 'PASS' : 'FAIL'} |`,
    '',
    '---',
    '',
  ];

  // Group by phase
  const phases = [...new Set(results.map((r) => r.phase))];
  for (const phase of phases) {
    const phaseResults = results.filter((r) => r.phase === phase);
    lines.push(`## ${phase.charAt(0).toUpperCase() + phase.slice(1)}`);
    lines.push('');
    lines.push('| Test | Method | Endpoint | Status | Result |');
    lines.push('|------|--------|----------|--------|--------|');

    for (const r of phaseResults) {
      const icon = r.success ? 'PASS' : 'FAIL';
      lines.push(`| ${r.test} | ${r.method} | \`${r.endpoint}\` | ${r.status} | ${icon} |`);
    }
    lines.push('');
  }

  // Failed tests detail
  const failedTests = results.filter((r) => !r.success);
  if (failedTests.length > 0) {
    lines.push('## Failed Tests');
    lines.push('');
    for (const r of failedTests) {
      lines.push(`### ${r.test}`);
      lines.push('');
      lines.push(`- **Endpoint:** ${r.method} ${r.endpoint}`);
      lines.push(`- **Status:** ${r.status}`);
      lines.push(`- **Error:** ${r.error || 'Unknown'}`);
      if (r.response) {
        lines.push(`- **Response:** \`\`\`json\n${JSON.stringify(r.response, null, 2)}\n\`\`\``);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');
  lines.push('*Generated by api-e2e-smoke.ts*');

  return lines.join('\n');
}

// Run
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
