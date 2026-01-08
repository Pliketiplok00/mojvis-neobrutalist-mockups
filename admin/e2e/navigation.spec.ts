/**
 * Admin Navigation E2E Tests
 *
 * Verifies:
 * - Sidebar navigation links exist
 * - All routes are accessible
 * - Page titles/headings render correctly
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Navigation', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1:has-text("MOJ VIS")')).toBeVisible();
  });

  test('should have all sidebar navigation links', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify sidebar nav items
    const navItems = [
      { text: 'Poruke', href: '/messages' },
      { text: 'Povratne inf.', href: '/feedback' },
      { text: 'Click & Fix', href: '/click-fix' },
      { text: 'Dogadaji', href: '/events' },
      { text: 'Stranice', href: '/pages' },
      { text: 'Promet', href: '/transport' },
    ];

    for (const item of navItems) {
      const link = page.locator(`nav a[href="${item.href}"]`);
      await expect(link).toBeVisible();
      await expect(link).toContainText(item.text);
    }
  });

  test('should navigate to Messages (Inbox) page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('nav a[href="/messages"]');
    await expect(page).toHaveURL('/messages');
  });

  test('should navigate to Events page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('nav a[href="/events"]');
    await expect(page).toHaveURL('/events');
  });

  test('should navigate to Pages page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('nav a[href="/pages"]');
    await expect(page).toHaveURL('/pages');
  });

  test('should navigate to Feedback page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('nav a[href="/feedback"]');
    await expect(page).toHaveURL('/feedback');
  });

  test('should navigate to Click & Fix page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('nav a[href="/click-fix"]');
    await expect(page).toHaveURL('/click-fix');
  });

  test('should have logout button', async ({ page }) => {
    await page.goto('/dashboard');
    const logoutButton = page.locator('button:has-text("Odjava")');
    await expect(logoutButton).toBeVisible();
  });
});
