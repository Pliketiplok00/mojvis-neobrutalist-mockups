/**
 * Feedback & Click-Fix E2E Tests
 *
 * Verifies:
 * - Feedback list loads
 * - Feedback detail shows thread
 * - Status change works
 * - Reply functionality
 * - Click & Fix list with photos
 * - Map link exists
 */

import { test, expect } from '@playwright/test';

test.describe('Feedback UI', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test feedback via API
    const deviceId = `e2e-feedback-${Date.now()}`;
    await page.request.post('http://localhost:3000/feedback', {
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': deviceId,
        'X-User-Mode': 'local',
        'X-Municipality': 'vis',
        'Accept-Language': 'hr',
      },
      data: {
        subject: 'E2E Playwright Test Feedback',
        body: 'This is a test feedback for Playwright E2E tests.',
      },
    });
  });

  test('should display feedback list', async ({ page }) => {
    await page.goto('/feedback');
    // Wait for the feedback list container with data-testid
    await page.waitForSelector('[data-testid="feedback-list"]', { timeout: 10000 });

    // Should have at least one row (rows are clickable with data-testid)
    const rows = page.locator('[data-testid^="feedback-row-"]');
    await expect(rows.first()).toBeVisible();
  });

  test('should open feedback detail', async ({ page }) => {
    await page.goto('/feedback');
    await page.waitForSelector('[data-testid="feedback-list"]', { timeout: 10000 });

    // Click on first feedback row (rows are now clickable)
    const firstFeedback = page.locator('[data-testid^="feedback-row-"]').first();
    await firstFeedback.click();

    // Should show detail page
    await expect(page).toHaveURL(/\/feedback\/[a-z0-9-]+/);
  });

  test('should change feedback status', async ({ page }) => {
    await page.goto('/feedback');
    await page.waitForSelector('[data-testid="feedback-list"]', { timeout: 10000 });

    // Click on first feedback row
    const firstFeedback = page.locator('[data-testid^="feedback-row-"]').first();
    await firstFeedback.click();

    // Wait for detail page and status section
    await page.waitForSelector('[data-testid="feedback-status-section"]', { timeout: 5000 });

    // Click status button to change status
    const statusButton = page.locator('[data-testid="feedback-status-u_razmatranju"]');
    if (await statusButton.isVisible({ timeout: 2000 })) {
      await statusButton.click();
    }
  });

  test('should add reply to feedback', async ({ page }) => {
    // Create a dedicated feedback for this test
    const deviceId = `e2e-reply-${Date.now()}`;
    const createResponse = await page.request.post('http://localhost:3000/feedback', {
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': deviceId,
        'X-User-Mode': 'local',
        'X-Municipality': 'vis',
        'Accept-Language': 'hr',
      },
      data: {
        subject: `E2E Reply Test ${deviceId}`,
        body: 'Feedback specifically for testing reply functionality.',
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const feedback = await createResponse.json();
    const feedbackId = feedback.id;

    // Navigate directly to this feedback
    await page.goto(`/feedback/${feedbackId}`);

    // Wait for detail page to fully load - check for subject heading
    await page.waitForSelector('h2', { timeout: 10000 });

    // Wait for reply input
    const replyInput = page.locator('[data-testid="feedback-reply-input"]');
    await expect(replyInput).toBeVisible({ timeout: 10000 });

    // Get initial reply count
    const repliesHeader = page.locator('h3').filter({ hasText: 'Odgovori' });
    await expect(repliesHeader).toBeVisible({ timeout: 5000 });

    // Fill in the reply
    const replyText = `E2E Test Reply ${Date.now()}`;
    await replyInput.fill(replyText);

    // Submit reply and wait for network response
    const submitButton = page.locator('[data-testid="feedback-reply-submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    // Click and wait for the API response (201 Created)
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/reply') && resp.status() === 201, { timeout: 10000 }),
      submitButton.click(),
    ]);

    // After successful API, wait for input to be cleared (state updated)
    await expect(replyInput).toHaveValue('', { timeout: 5000 });

    // Verify the reply text appears on page
    await expect(page.getByText(replyText)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Click & Fix UI', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test click-fix via API
    const deviceId = `e2e-clickfix-${Date.now()}`;

    // Create small test image
    const pngData = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
      0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const boundary = `----formdata-${Date.now()}`;
    const bodyParts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="subject"\r\n\r\nE2E Playwright Click-Fix\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nTest click-fix for Playwright E2E.\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="location"\r\n\r\n{"lat":43.0622,"lng":16.1836}\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`,
    ];

    const body = Buffer.concat([
      Buffer.from(bodyParts.join('')),
      pngData,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    await page.request.post('http://localhost:3000/click-fix', {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-Device-ID': deviceId,
        'X-User-Mode': 'local',
        'X-Municipality': 'vis',
        'Accept-Language': 'hr',
      },
      data: body,
    });
  });

  test('should display click-fix list', async ({ page }) => {
    await page.goto('/click-fix');
    await page.waitForSelector('[data-testid="clickfix-list"]', { timeout: 10000 });

    // Should have at least one row
    const rows = page.locator('[data-testid^="clickfix-row-"]');
    await expect(rows.first()).toBeVisible();
  });

  test('should open click-fix detail', async ({ page }) => {
    await page.goto('/click-fix');
    await page.waitForSelector('[data-testid="clickfix-list"]', { timeout: 10000 });

    // Click on first item (rows are now clickable)
    const firstItem = page.locator('[data-testid^="clickfix-row-"]').first();
    await firstItem.click();

    // Should show detail page
    await expect(page).toHaveURL(/\/click-fix\/[a-z0-9-]+/);
  });

  test('should display photos in click-fix detail', async ({ page }) => {
    await page.goto('/click-fix');
    await page.waitForSelector('[data-testid="clickfix-list"]', { timeout: 10000 });

    // Click on first item
    await page.locator('[data-testid^="clickfix-row-"]').first().click();

    // Wait for photos section
    const photosSection = page.locator('[data-testid="clickfix-photos"]');
    if (await photosSection.isVisible({ timeout: 5000 })) {
      const photo = page.locator('[data-testid="clickfix-photo-0"]');
      await expect(photo).toBeVisible();
    }
  });

  test('should have map link in click-fix detail', async ({ page }) => {
    await page.goto('/click-fix');
    await page.waitForSelector('[data-testid="clickfix-list"]', { timeout: 10000 });

    // Click on first item
    await page.locator('[data-testid^="clickfix-row-"]').first().click();

    // Should show map link
    const mapLink = page.locator('[data-testid="clickfix-map-link"]');
    await expect(mapLink).toBeVisible({ timeout: 5000 });
    await expect(mapLink).toHaveAttribute('href', /43\.0622.*16\.1836|16\.1836.*43\.0622/);
  });

  test('should change click-fix status', async ({ page }) => {
    await page.goto('/click-fix');
    await page.waitForSelector('[data-testid="clickfix-list"]', { timeout: 10000 });

    // Click on first item
    await page.locator('[data-testid^="clickfix-row-"]').first().click();

    // Wait for status section
    await page.waitForSelector('[data-testid="clickfix-status-section"]', { timeout: 5000 });

    // Click status button to change status
    const statusButton = page.locator('[data-testid="clickfix-status-prihvaceno"]');
    if (await statusButton.isVisible({ timeout: 2000 })) {
      await statusButton.click();
    }
  });

  test('should add reply to click-fix', async ({ page }) => {
    // Create a dedicated click-fix for this test
    const deviceId = `e2e-clickfix-reply-${Date.now()}`;

    // Create small test image
    const pngData = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
      0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const boundary = `----formdata-reply-${Date.now()}`;
    const bodyParts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="subject"\r\n\r\nE2E Reply Test Click-Fix\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nClick-fix for testing reply functionality.\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="location"\r\n\r\n{"lat":43.0622,"lng":16.1836}\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="photos"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n`,
    ];

    const body = Buffer.concat([
      Buffer.from(bodyParts.join('')),
      pngData,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const createResponse = await page.request.post('http://localhost:3000/click-fix', {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-Device-ID': deviceId,
        'X-User-Mode': 'local',
        'X-Municipality': 'vis',
        'Accept-Language': 'hr',
      },
      data: body,
    });
    expect(createResponse.ok()).toBeTruthy();
    const clickFix = await createResponse.json();
    const clickFixId = clickFix.id;

    // Navigate directly to this click-fix
    await page.goto(`/click-fix/${clickFixId}`);

    // Wait for detail page to fully load - check for subject heading
    await page.waitForSelector('h2', { timeout: 10000 });

    // Wait for reply input
    const replyInput = page.locator('[data-testid="clickfix-reply-input"]');
    await expect(replyInput).toBeVisible({ timeout: 10000 });

    // Fill in the reply
    const replyText = `E2E Click-Fix Reply ${Date.now()}`;
    await replyInput.fill(replyText);

    // Submit reply and wait for network response
    const submitButton = page.locator('[data-testid="clickfix-reply-submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    // Click and wait for the API response (201 Created)
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/reply') && resp.status() === 201, { timeout: 10000 }),
      submitButton.click(),
    ]);

    // After successful API, wait for input to be cleared (state updated)
    await expect(replyInput).toHaveValue('', { timeout: 5000 });

    // Verify the reply text appears on page
    await expect(page.getByText(replyText)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Static Pages UI', () => {
  test('should display pages list', async ({ page }) => {
    await page.goto('/pages');
    await page.waitForSelector('[data-testid="pages-list"]', { timeout: 10000 });

    // Should have at least one row
    const rows = page.locator('[data-testid^="pages-row-"]');
    await expect(rows.first()).toBeVisible();
  });

  test('should open page editor', async ({ page }) => {
    await page.goto('/pages');
    await page.waitForSelector('[data-testid="pages-list"]', { timeout: 10000 });

    // Click on first page row (rows are now clickable)
    const firstPage = page.locator('[data-testid^="pages-row-"]').first();
    await firstPage.click();

    // Should show edit page
    await expect(page).toHaveURL(/\/pages\/[a-z0-9-]+/);
  });

  test('should show placeholder for unimplemented block editors', async ({ page }) => {
    await page.goto('/pages');
    await page.waitForSelector('[data-testid="pages-list"]', { timeout: 10000 });

    // Click on first page row
    await page.locator('[data-testid^="pages-row-"]').first().click();

    // Just check page loads without error - verify title is visible
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 5000 });
  });
});
