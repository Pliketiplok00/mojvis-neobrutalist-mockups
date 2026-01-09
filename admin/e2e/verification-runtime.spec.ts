/**
 * Admin Runtime Verification E2E Tests
 *
 * Purpose: Verify admin UI behavior at runtime WITHOUT fixing issues.
 * Mode: VERIFY ONLY - Document findings, don't fix.
 *
 * Tests cover:
 * 1. Access without login
 * 2. Inbox workflows
 * 3. Static Pages CMS
 * 4. Events workflows
 * 5. Feedback & Click-Fix
 */

import { test, expect } from '@playwright/test';

// =============================================================================
// 1. ADMIN ACCESS WITHOUT LOGIN
// =============================================================================
test.describe('VERIFY: Admin Access Without Login', () => {
  test('should access root (/) without login redirect', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Check if we're on a login page or dashboard
    const url = page.url();
    const hasLoginPage = url.includes('/login');
    const hasDashboard = await page.locator('h1').first().isVisible().catch(() => false);

    // Document what we found
    console.log(`[VERIFY] Root access: URL=${url}, hasLoginPage=${hasLoginPage}, hasDashboard=${hasDashboard}`);

    // Take screenshot for evidence
    await page.screenshot({ path: 'e2e-report/screenshots/01-root-access.png', fullPage: true });
  });

  test('should access /messages without login', async ({ page }) => {
    const response = await page.goto('/messages');
    const status = response?.status() || 0;

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check if we see message list or login redirect
    const hasMessageList = await page.locator('[data-testid="inbox-list"]').isVisible().catch(() => false);
    const hasLoginForm = await page.locator('input[type="password"]').isVisible().catch(() => false);

    console.log(`[VERIFY] /messages access: status=${status}, hasMessageList=${hasMessageList}, hasLoginForm=${hasLoginForm}`);
    await page.screenshot({ path: 'e2e-report/screenshots/02-messages-access.png', fullPage: true });

    // Document: Is this expected behavior?
    expect(status).toBe(200); // Page loads
  });

  test('should access /events without login', async ({ page }) => {
    const response = await page.goto('/events');
    const status = response?.status() || 0;

    await page.waitForTimeout(2000);

    const hasEventsList = await page.locator('table').first().isVisible().catch(() => false);
    console.log(`[VERIFY] /events access: status=${status}, hasEventsList=${hasEventsList}`);
    await page.screenshot({ path: 'e2e-report/screenshots/03-events-access.png', fullPage: true });

    expect(status).toBe(200);
  });

  test('should access /pages without login', async ({ page }) => {
    const response = await page.goto('/pages');
    const status = response?.status() || 0;

    await page.waitForTimeout(2000);

    const hasPagesList = await page.locator('table').first().isVisible().catch(() => false);
    console.log(`[VERIFY] /pages access: status=${status}, hasPagesList=${hasPagesList}`);
    await page.screenshot({ path: 'e2e-report/screenshots/04-pages-access.png', fullPage: true });

    expect(status).toBe(200);
  });

  test('should access /feedback without login', async ({ page }) => {
    const response = await page.goto('/feedback');
    const status = response?.status() || 0;

    await page.waitForTimeout(2000);

    const hasFeedbackList = await page.locator('table').first().isVisible().catch(() => false);
    console.log(`[VERIFY] /feedback access: status=${status}, hasFeedbackList=${hasFeedbackList}`);
    await page.screenshot({ path: 'e2e-report/screenshots/05-feedback-access.png', fullPage: true });

    expect(status).toBe(200);
  });

  test('should access /click-fix without login', async ({ page }) => {
    const response = await page.goto('/click-fix');
    const status = response?.status() || 0;

    await page.waitForTimeout(2000);

    const hasClickFixList = await page.locator('table').first().isVisible().catch(() => false);
    console.log(`[VERIFY] /click-fix access: status=${status}, hasClickFixList=${hasClickFixList}`);
    await page.screenshot({ path: 'e2e-report/screenshots/06-clickfix-access.png', fullPage: true });

    expect(status).toBe(200);
  });

  test('should check if login page exists', async ({ page }) => {
    const response = await page.goto('/login');
    const status = response?.status() || 0;

    await page.waitForTimeout(1000);

    const hasLoginForm = await page.locator('input[type="password"]').isVisible().catch(() => false);
    const hasUsernameField = await page.locator('input[type="text"], input[name="username"], input[name="email"]').first().isVisible().catch(() => false);

    console.log(`[VERIFY] /login page: status=${status}, hasLoginForm=${hasLoginForm}, hasUsernameField=${hasUsernameField}`);
    await page.screenshot({ path: 'e2e-report/screenshots/07-login-page.png', fullPage: true });
  });
});

// =============================================================================
// 2. INBOX WORKFLOW VERIFICATION
// =============================================================================
test.describe('VERIFY: Inbox Workflow', () => {
  test('should verify create message form fields', async ({ page }) => {
    await page.goto('/messages/new');
    await page.waitForTimeout(2000);

    // Check what fields exist
    const fields = {
      titleHr: await page.locator('[data-testid="inbox-title-hr"]').isVisible().catch(() => false),
      titleEn: await page.locator('input[placeholder*="English"]').first().isVisible().catch(() => false),
      bodyHr: await page.locator('[data-testid="inbox-body-hr"]').isVisible().catch(() => false),
      bodyEn: await page.locator('textarea[placeholder*="English"]').isVisible().catch(() => false),
      tags: await page.locator('label:has-text("Hitno")').isVisible().catch(() => false),
      dateFields: await page.locator('input[type="datetime-local"]').first().isVisible().catch(() => false),
      submitButton: await page.locator('[data-testid="inbox-submit"]').isVisible().catch(() => false),
    };

    console.log(`[VERIFY] Create message form fields:`, JSON.stringify(fields, null, 2));
    await page.screenshot({ path: 'e2e-report/screenshots/10-inbox-create-form.png', fullPage: true });

    expect(fields.titleHr).toBe(true);
    expect(fields.submitButton).toBe(true);
  });

  test('should verify message creation works without auth headers', async ({ page }) => {
    // Create via API directly (like backend verification showed)
    const uniqueTitle = `VERIFY-${Date.now()}`;
    const response = await page.request.post('http://localhost:3000/admin/inbox', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        title_hr: uniqueTitle,
        body_hr: 'Verification test message',
        tags: ['vis'],
      },
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    console.log(`[VERIFY] API create without auth: status=${status}, id=${body.id}`);

    // Verify it appears in UI
    await page.goto('/messages');
    await page.waitForSelector('[data-testid="inbox-list"]', { timeout: 10000 });

    const hasNewMessage = await page.locator(`text=${uniqueTitle}`).isVisible().catch(() => false);
    console.log(`[VERIFY] Created message visible in list: ${hasNewMessage}`);

    await page.screenshot({ path: 'e2e-report/screenshots/11-inbox-api-create.png', fullPage: true });

    expect(status).toBe(201);
  });

  test('should verify edit message works', async ({ page }) => {
    // Get first message ID from API
    const listResponse = await page.request.get('http://localhost:3000/admin/inbox');
    const listData = await listResponse.json();
    const firstMessage = listData.messages?.[0];

    if (firstMessage) {
      await page.goto(`/messages/${firstMessage.id}`);
      await page.waitForTimeout(2000);

      const titleInput = page.locator('[data-testid="inbox-title-hr"]');
      const isEditable = await titleInput.isEditable().catch(() => false);
      const currentValue = await titleInput.inputValue().catch(() => '');

      console.log(`[VERIFY] Edit message: id=${firstMessage.id}, isEditable=${isEditable}, currentValue="${currentValue.substring(0, 30)}..."`);

      await page.screenshot({ path: 'e2e-report/screenshots/12-inbox-edit-form.png', fullPage: true });
    } else {
      console.log('[VERIFY] No messages found to edit');
    }
  });

  test('should verify delete button exists and works', async ({ page }) => {
    await page.goto('/messages');
    await page.waitForSelector('[data-testid="inbox-list"]', { timeout: 10000 });

    const deleteButtons = await page.locator('[data-testid^="inbox-delete-"]').count();
    console.log(`[VERIFY] Delete buttons visible: ${deleteButtons}`);

    await page.screenshot({ path: 'e2e-report/screenshots/13-inbox-delete-buttons.png', fullPage: true });

    expect(deleteButtons).toBeGreaterThan(0);
  });
});

// =============================================================================
// 3. STATIC PAGES CMS VERIFICATION
// =============================================================================
test.describe('VERIFY: Static Pages CMS', () => {
  test('should verify pages list loads', async ({ page }) => {
    await page.goto('/pages');
    await page.waitForTimeout(2000);

    const tableRows = await page.locator('table tbody tr').count();
    const hasNewButton = await page.locator('a[href="/pages/new"], button:has-text("Nova")').isVisible().catch(() => false);

    console.log(`[VERIFY] Pages list: rows=${tableRows}, hasNewButton=${hasNewButton}`);
    await page.screenshot({ path: 'e2e-report/screenshots/20-pages-list.png', fullPage: true });
  });

  test('should verify page edit form', async ({ page }) => {
    // Get first page from API
    const listResponse = await page.request.get('http://localhost:3000/admin/pages');
    const listData = await listResponse.json();
    const firstPage = listData.pages?.[0];

    if (firstPage) {
      await page.goto(`/pages/${firstPage.id}`);
      await page.waitForTimeout(3000);

      const hasBlocks = await page.locator('[data-testid^="block-"]').count();
      const hasPublishButton = await page.locator('button:has-text("Objavi")').isVisible().catch(() => false);
      const hasSaveButton = await page.locator('button:has-text("Spremi")').isVisible().catch(() => false);

      console.log(`[VERIFY] Page edit: id=${firstPage.id}, blocks=${hasBlocks}, hasPublishButton=${hasPublishButton}, hasSaveButton=${hasSaveButton}`);
      await page.screenshot({ path: 'e2e-report/screenshots/21-page-edit.png', fullPage: true });
    }
  });

  test('should verify supervisor-only controls', async ({ page }) => {
    // Get first page
    const listResponse = await page.request.get('http://localhost:3000/admin/pages');
    const listData = await listResponse.json();
    const firstPage = listData.pages?.[0];

    if (firstPage) {
      await page.goto(`/pages/${firstPage.id}`);
      await page.waitForTimeout(3000);

      // Check for supervisor-specific UI elements
      const hasPublishButton = await page.locator('button:has-text("Objavi")').isVisible().catch(() => false);
      const hasUnpublishButton = await page.locator('button:has-text("Povuci")').isVisible().catch(() => false);
      const hasAddBlockButton = await page.locator('button:has-text("Dodaj blok")').isVisible().catch(() => false);
      const hasDeleteBlockButtons = await page.locator('button:has-text("Obriši blok")').count();
      const hasLockControls = await page.locator('[data-testid*="lock"]').count();

      console.log(`[VERIFY] Supervisor controls:`, JSON.stringify({
        hasPublishButton,
        hasUnpublishButton,
        hasAddBlockButton,
        deleteBlockButtons: hasDeleteBlockButtons,
        lockControls: hasLockControls,
      }, null, 2));

      await page.screenshot({ path: 'e2e-report/screenshots/22-page-supervisor-controls.png', fullPage: true });
    }
  });

  test('should verify block editing', async ({ page }) => {
    // Get first page
    const listResponse = await page.request.get('http://localhost:3000/admin/pages');
    const listData = await listResponse.json();
    const firstPage = listData.pages?.[0];

    if (firstPage) {
      await page.goto(`/pages/${firstPage.id}`);
      await page.waitForTimeout(3000);

      // Check if blocks are editable
      const firstBlock = page.locator('[data-testid^="block-"]').first();
      if (await firstBlock.isVisible()) {
        // Try to find input/textarea in block
        const hasEditableContent = await firstBlock.locator('input, textarea, [contenteditable="true"]').count();
        console.log(`[VERIFY] First block editable elements: ${hasEditableContent}`);
      }

      await page.screenshot({ path: 'e2e-report/screenshots/23-page-block-edit.png', fullPage: true });
    }
  });
});

// =============================================================================
// 4. EVENTS WORKFLOW VERIFICATION
// =============================================================================
test.describe('VERIFY: Events Workflow', () => {
  test('should verify events list loads', async ({ page }) => {
    await page.goto('/events');
    await page.waitForTimeout(2000);

    const tableRows = await page.locator('table tbody tr').count();
    const hasNewButton = await page.locator('a[href="/events/new"], button:has-text("Novi")').isVisible().catch(() => false);

    console.log(`[VERIFY] Events list: rows=${tableRows}, hasNewButton=${hasNewButton}`);
    await page.screenshot({ path: 'e2e-report/screenshots/30-events-list.png', fullPage: true });
  });

  test('should verify event create form', async ({ page }) => {
    await page.goto('/events/new');
    await page.waitForTimeout(2000);

    const fields = {
      titleHr: await page.locator('input[name="title_hr"], [data-testid="event-title-hr"]').isVisible().catch(() => false),
      titleEn: await page.locator('input[name="title_en"], input[placeholder*="English"]').isVisible().catch(() => false),
      date: await page.locator('input[type="date"], input[type="datetime-local"]').first().isVisible().catch(() => false),
      location: await page.locator('input[name="location"], [data-testid="event-location"]').isVisible().catch(() => false),
      submitButton: await page.locator('button[type="submit"], button:has-text("Spremi")').isVisible().catch(() => false),
    };

    console.log(`[VERIFY] Event create form:`, JSON.stringify(fields, null, 2));
    await page.screenshot({ path: 'e2e-report/screenshots/31-event-create-form.png', fullPage: true });
  });

  test('should verify event edit works', async ({ page }) => {
    // Get first event from API
    const listResponse = await page.request.get('http://localhost:3000/admin/events');
    const listData = await listResponse.json();
    const firstEvent = listData.events?.[0];

    if (firstEvent) {
      await page.goto(`/events/${firstEvent.id}`);
      await page.waitForTimeout(2000);

      const hasEditableFields = await page.locator('input:not([disabled]), textarea:not([disabled])').count();
      console.log(`[VERIFY] Event edit: id=${firstEvent.id}, editableFields=${hasEditableFields}`);

      await page.screenshot({ path: 'e2e-report/screenshots/32-event-edit.png', fullPage: true });
    }
  });

  test('should verify event delete exists', async ({ page }) => {
    await page.goto('/events');
    await page.waitForTimeout(2000);

    const deleteButtons = await page.locator('button:has-text("Obriši"), [data-testid*="delete"]').count();
    console.log(`[VERIFY] Event delete buttons: ${deleteButtons}`);

    await page.screenshot({ path: 'e2e-report/screenshots/33-event-delete.png', fullPage: true });
  });
});

// =============================================================================
// 5. FEEDBACK & CLICK-FIX VERIFICATION
// =============================================================================
test.describe('VERIFY: Feedback & Click-Fix', () => {
  test('should verify feedback list loads with data', async ({ page }) => {
    await page.goto('/feedback');
    await page.waitForTimeout(2000);

    const tableRows = await page.locator('table tbody tr').count();
    console.log(`[VERIFY] Feedback list rows: ${tableRows}`);

    await page.screenshot({ path: 'e2e-report/screenshots/40-feedback-list.png', fullPage: true });
  });

  test('should verify feedback detail page', async ({ page }) => {
    // Get first feedback from API
    const listResponse = await page.request.get('http://localhost:3000/admin/feedback');
    const listData = await listResponse.json();
    const firstFeedback = listData.feedback?.[0];

    if (firstFeedback) {
      await page.goto(`/feedback/${firstFeedback.id}`);
      await page.waitForTimeout(2000);

      const hasStatusDropdown = await page.locator('select, [data-testid*="status"]').isVisible().catch(() => false);
      const hasReplyButton = await page.locator('button:has-text("Odgovori"), [data-testid*="reply"]').isVisible().catch(() => false);
      const hasReplyTextarea = await page.locator('textarea').isVisible().catch(() => false);

      console.log(`[VERIFY] Feedback detail:`, JSON.stringify({
        id: firstFeedback.id,
        hasStatusDropdown,
        hasReplyButton,
        hasReplyTextarea,
      }, null, 2));

      await page.screenshot({ path: 'e2e-report/screenshots/41-feedback-detail.png', fullPage: true });
    }
  });

  test('should verify status change works without auth', async ({ page }) => {
    // Get first feedback from API
    const listResponse = await page.request.get('http://localhost:3000/admin/feedback');
    const listData = await listResponse.json();
    const firstFeedback = listData.feedback?.[0];

    if (firstFeedback) {
      // Try to change status via API
      const patchResponse = await page.request.patch(
        `http://localhost:3000/admin/feedback/${firstFeedback.id}/status`,
        {
          headers: { 'Content-Type': 'application/json' },
          data: { status: 'in_progress' },
        }
      );

      console.log(`[VERIFY] Feedback status change via API: status=${patchResponse.status()}`);
    }
  });

  test('should verify click-fix list loads', async ({ page }) => {
    await page.goto('/click-fix');
    await page.waitForTimeout(2000);

    const tableRows = await page.locator('table tbody tr').count();
    console.log(`[VERIFY] Click-fix list rows: ${tableRows}`);

    await page.screenshot({ path: 'e2e-report/screenshots/42-clickfix-list.png', fullPage: true });
  });

  test('should verify click-fix detail page', async ({ page }) => {
    // Get first click-fix from API
    const listResponse = await page.request.get('http://localhost:3000/admin/click-fix');
    const listData = await listResponse.json();
    const firstSubmission = listData.submissions?.[0];

    if (firstSubmission) {
      await page.goto(`/click-fix/${firstSubmission.id}`);
      await page.waitForTimeout(2000);

      const hasPhoto = await page.locator('img').isVisible().catch(() => false);
      const hasStatusControl = await page.locator('select, [data-testid*="status"]').isVisible().catch(() => false);
      const hasReplyOption = await page.locator('button:has-text("Odgovori"), textarea').isVisible().catch(() => false);

      console.log(`[VERIFY] Click-fix detail:`, JSON.stringify({
        id: firstSubmission.id,
        hasPhoto,
        hasStatusControl,
        hasReplyOption,
      }, null, 2));

      await page.screenshot({ path: 'e2e-report/screenshots/43-clickfix-detail.png', fullPage: true });
    } else {
      console.log('[VERIFY] No click-fix submissions found');
      await page.screenshot({ path: 'e2e-report/screenshots/43-clickfix-empty.png', fullPage: true });
    }
  });
});

// =============================================================================
// 6. ROLE-BASED ACCESS VERIFICATION
// =============================================================================
test.describe('VERIFY: Role-Based Access', () => {
  test('should check what role headers UI sends', async ({ page }) => {
    // Intercept requests to see what headers are sent
    const headers: Record<string, string>[] = [];

    page.on('request', (request) => {
      if (request.url().includes('localhost:3000/admin')) {
        headers.push({
          url: request.url(),
          adminRole: request.headers()['x-admin-role'] || 'NOT_SET',
          contentType: request.headers()['content-type'] || 'NOT_SET',
        });
      }
    });

    await page.goto('/messages');
    await page.waitForTimeout(3000);

    console.log(`[VERIFY] Admin API request headers:`, JSON.stringify(headers.slice(0, 5), null, 2));
  });

  test('should verify if supervisor role is assumed in UI', async ({ page }) => {
    // Go to pages which has supervisor-only features
    await page.goto('/pages');
    await page.waitForTimeout(2000);

    // Get first page
    const listResponse = await page.request.get('http://localhost:3000/admin/pages');
    const listData = await listResponse.json();
    const firstPage = listData.pages?.[0];

    if (firstPage) {
      await page.goto(`/pages/${firstPage.id}`);
      await page.waitForTimeout(3000);

      // Supervisor-only features that should be restricted
      const publishButton = await page.locator('button:has-text("Objavi")').isVisible().catch(() => false);
      const addBlockButton = await page.locator('button:has-text("Dodaj")').isVisible().catch(() => false);
      const deletePageButton = await page.locator('button:has-text("Obriši stranicu")').isVisible().catch(() => false);

      console.log(`[VERIFY] Supervisor features visible (should require auth):`, JSON.stringify({
        publishButton,
        addBlockButton,
        deletePageButton,
      }, null, 2));

      await page.screenshot({ path: 'e2e-report/screenshots/50-supervisor-features.png', fullPage: true });
    }
  });
});
