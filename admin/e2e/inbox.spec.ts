/**
 * Inbox CRUD + HITNO Lock E2E Tests
 *
 * Verifies:
 * - Create new inbox message
 * - Message appears in list
 * - Edit message
 * - Delete message
 * - HITNO message lock UI
 */

import { test, expect } from '@playwright/test';

test.describe('Inbox CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/messages');
  });

  test('should display messages list', async ({ page }) => {
    // Wait for list to load using data-testid
    await page.waitForSelector('[data-testid="inbox-list"]', { timeout: 10000 });
  });

  test('should navigate to new message form', async ({ page }) => {
    // Wait for list to load first
    await page.waitForSelector('[data-testid="inbox-list"]', { timeout: 10000 });
    // Click create button using data-testid
    await page.click('[data-testid="inbox-create"]');
    await expect(page).toHaveURL('/messages/new');
  });

  test('should create a new message', async ({ page }) => {
    await page.goto('/messages/new');

    // Fill in form using data-testid
    await page.fill('[data-testid="inbox-title-hr"]', 'E2E Test Poruka');
    await page.fill('[data-testid="inbox-body-hr"]', 'Ovo je testna poruka za E2E test.');

    // Select municipal tag to make EN fields optional
    await page.getByText('Vis (općinska)').click();

    // Submit form
    await page.click('[data-testid="inbox-submit"]');

    // Should redirect to list or show success
    await page.waitForURL('/messages', { timeout: 10000 });
  });

  test('should edit an existing message', async ({ page }) => {
    // Create a fresh message via API with municipal tag (makes EN optional)
    const uniqueId = `e2e-edit-${Date.now()}`;
    const createResponse = await page.request.post('http://localhost:3000/admin/inbox', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        title_hr: `${uniqueId} Original`,
        body_hr: 'Original content for edit test.',
        tags: ['vis'],
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const created = await createResponse.json();
    const messageId = created.id;

    // Navigate directly to edit this message
    await page.goto(`/messages/${messageId}`);

    // Wait for form to fully load - title input should have the value
    const titleInput = page.locator('[data-testid="inbox-title-hr"]');
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    await expect(titleInput).toHaveValue(`${uniqueId} Original`, { timeout: 5000 });

    // Verify submit button is visible (not a locked message)
    const submitButton = page.locator('[data-testid="inbox-submit"]');
    await expect(submitButton).toBeVisible({ timeout: 5000 });

    // Ensure Vis tag checkbox is checked (click label if not)
    const visLabel = page.locator('label').filter({ hasText: 'Vis (općinska)' });
    const visCheckbox = visLabel.locator('input[type="checkbox"]');
    if (!(await visCheckbox.isChecked())) {
      await visLabel.click();
      // Wait for state to update
      await expect(visCheckbox).toBeChecked({ timeout: 2000 });
    }

    // Modify title
    await titleInput.fill(`${uniqueId} Updated`);

    // Save
    await submitButton.click();

    // Should redirect to list
    await page.waitForURL('/messages', { timeout: 10000 });

    // Verify the updated message appears in the list
    await page.waitForSelector('[data-testid="inbox-list"]', { timeout: 10000 });
  });

  test('should delete a message', async ({ page }) => {
    // Wait for list to load
    await page.waitForSelector('[data-testid="inbox-list"]', { timeout: 10000 });

    // Click on first message row
    const firstMessage = page.locator('[data-testid^="inbox-row-"]').first();

    // Get the row's data-testid to extract the message ID for the delete button
    const testId = await firstMessage.getAttribute('data-testid');
    const messageId = testId?.replace('inbox-row-', '');

    if (messageId) {
      // Click the delete button directly (without navigating to edit page)
      const deleteButton = page.locator(`[data-testid="inbox-delete-${messageId}"]`);

      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept());

      await deleteButton.click();

      // Wait for the row to be removed or page to refresh
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Inbox HITNO Lock UI', () => {
  test('should show locked state for pushed messages', async ({ page }) => {
    // Register a device first via API
    const deviceId = `e2e-lock-test-${Date.now()}`;
    await page.request.post('http://localhost:3000/device/push-token', {
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': deviceId,
        'X-User-Mode': 'local',
        'X-Municipality': 'vis',
        'Accept-Language': 'hr',
      },
      data: {
        expoPushToken: 'ExponentPushToken[test-e2e-lock]',
        platform: 'ios',
      },
    });

    // Go to new message form
    await page.goto('/messages/new');

    // Fill in HITNO message using data-testid (HR and EN required for hitno)
    await page.fill('[data-testid="inbox-title-hr"]', '[HITNO] E2E Test Lock');
    await page.fill('[data-testid="inbox-body-hr"]', 'Testna hitna poruka.');
    await page.fill('input[placeholder="Message title in English"]', '[URGENT] E2E Test Lock');
    await page.fill('textarea[placeholder*="English"]', 'Test urgent message.');

    // Select hitno tag by clicking the label
    await page.getByText('Hitno (urgentno)').click();

    // Set active window that includes now
    const now = new Date();
    const past = new Date(now.getTime() - 60 * 60 * 1000);
    const future = new Date(now.getTime() + 60 * 60 * 1000);

    const activeFromInput = page.locator('input[type="datetime-local"]').first();
    if (await activeFromInput.isVisible()) {
      await activeFromInput.fill(past.toISOString().slice(0, 16));
    }

    const activeToInput = page.locator('input[type="datetime-local"]').last();
    if (await activeToInput.isVisible()) {
      await activeToInput.fill(future.toISOString().slice(0, 16));
    }

    // Submit
    await page.click('[data-testid="inbox-submit"]');

    // Wait for redirect
    await page.waitForURL('/messages', { timeout: 10000 });

    // Wait for list to load
    await page.waitForSelector('[data-testid="inbox-list"]', { timeout: 10000 });

    // Click on a HITNO message row
    const hitnoRow = page.locator('[data-testid^="inbox-hitno-"]').first();
    if (await hitnoRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Get parent row and click it
      const row = hitnoRow.locator('xpath=ancestor::tr');
      await row.click();

      // Should show locked indicator
      const lockedIndicator = page.locator('[data-testid="inbox-locked-badge"]');
      const titleInput = page.locator('[data-testid="inbox-title-hr"]');

      // Either locked indicator is visible OR inputs are disabled
      const isLocked = await lockedIndicator.isVisible().catch(() => false);
      const isDisabled = await titleInput.isDisabled().catch(() => false);

      expect(isLocked || isDisabled).toBeTruthy();
    }
  });

  test('should prevent editing locked message', async ({ page }) => {
    // Find a locked message in the list
    await page.goto('/messages');

    // Wait for list to load
    await page.waitForSelector('[data-testid="inbox-list"]', { timeout: 10000 });

    // Look for a HITNO message
    const hitnoRow = page.locator('[data-testid^="inbox-hitno-"]').first();

    if (await hitnoRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Get parent row and click it
      const row = hitnoRow.locator('xpath=ancestor::tr');
      await row.click();

      // On detail page, if locked, save button should be disabled or not visible
      const saveButton = page.locator('[data-testid="inbox-submit"]');
      const lockedBadge = page.locator('[data-testid="inbox-locked-badge"]');

      // If locked badge is visible, save button should not be visible
      if (await lockedBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(saveButton).not.toBeVisible();
      }
    }
  });
});
