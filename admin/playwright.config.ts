import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Admin UI E2E tests.
 *
 * Prerequisites:
 * - Backend must be running on http://localhost:3000
 * - Admin dev server must be running on http://localhost:5173
 * - Database must be seeded with test data
 */
export default defineConfig({
  testDir: './e2e',
  // Serial execution for reliable tests - parallel causes API contention
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'e2e-report' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.ADMIN_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd ../backend && DB_NAME=mojvis npm run dev',
      url: 'http://localhost:3000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});
