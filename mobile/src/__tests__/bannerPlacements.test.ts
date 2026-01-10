/**
 * InboxMessage Placement Regression Tests
 *
 * IMPORTANT: There is exactly ONE message type in this app: InboxMessage.
 * "Banner", "Notice", "Alert" are UI names only, not different domain concepts.
 *
 * These tests ensure InboxMessage renders ONLY on allowed screens.
 *
 * ALLOWED placements (confirmed by product owner 2026-01-09):
 * - HomeScreen (via BannerList component)
 * - EventsScreen (via BannerList component)
 * - TransportHubScreen (via BannerList component)
 * - RoadTransportScreen (via BannerList component)
 * - SeaTransportScreen (via BannerList component)
 *
 * FORBIDDEN placements:
 * - StaticPageScreen (Flora/Fauna, Important Contacts, etc.)
 * - InboxListScreen (Inbox is the source of truth, not a display location)
 * - InboxDetailScreen
 * - All detail/form screens
 * - Settings
 */

import * as fs from 'fs';
import * as path from 'path';

const SCREENS_DIR = path.join(__dirname, '../screens');

/**
 * Helper to read a screen file
 */
function readScreenFile(relativePath: string): string {
  const fullPath = path.join(SCREENS_DIR, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Screen file not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Check if a file imports or uses Banner/BannerList
 */
function hasBannerUsage(content: string): boolean {
  return (
    /import.*Banner/.test(content) ||
    /BannerList/.test(content) ||
    /getActiveBanners/.test(content)
  );
}

describe('Banner Placement Policy', () => {
  describe('ALLOWED placements', () => {
    it('HomeScreen should have banners (home context)', () => {
      const content = readScreenFile('home/HomeScreen.tsx');
      expect(hasBannerUsage(content)).toBe(true);
      expect(content).toMatch(/getActiveBanners.*'home'/);
    });

    it('EventsScreen should have banners (events context)', () => {
      const content = readScreenFile('events/EventsScreen.tsx');
      expect(hasBannerUsage(content)).toBe(true);
      expect(content).toMatch(/getActiveBanners.*'events'/);
    });

    it('TransportHubScreen should have banners (transport context)', () => {
      const content = readScreenFile('transport/TransportHubScreen.tsx');
      expect(hasBannerUsage(content)).toBe(true);
      expect(content).toMatch(/getActiveBanners.*'transport'/);
    });

    it('RoadTransportScreen should have banners (transport context)', () => {
      const content = readScreenFile('transport/RoadTransportScreen.tsx');
      expect(hasBannerUsage(content)).toBe(true);
      expect(content).toMatch(/getActiveBanners.*'transport'/);
    });

    it('SeaTransportScreen should have banners (transport context)', () => {
      const content = readScreenFile('transport/SeaTransportScreen.tsx');
      expect(hasBannerUsage(content)).toBe(true);
      expect(content).toMatch(/getActiveBanners.*'transport'/);
    });
  });

  describe('FORBIDDEN placements (REGRESSION GUARD)', () => {
    /**
     * REGRESSION: StaticPageScreen must NOT have banners.
     * This screen is used for:
     * - Flora & Fauna
     * - Important Contacts
     * - Other static content pages
     *
     * If this test fails, banners were incorrectly added to static pages.
     */
    it('StaticPageScreen must NOT have banners (Flora/Fauna, Important Contacts)', () => {
      const content = readScreenFile('pages/StaticPageScreen.tsx');
      expect(hasBannerUsage(content)).toBe(false);
    });

    it('InboxListScreen must NOT have banners', () => {
      const content = readScreenFile('inbox/InboxListScreen.tsx');
      expect(hasBannerUsage(content)).toBe(false);
    });

    it('InboxDetailScreen must NOT have banners', () => {
      const content = readScreenFile('inbox/InboxDetailScreen.tsx');
      expect(hasBannerUsage(content)).toBe(false);
    });

    it('EventDetailScreen must NOT have banners', () => {
      const content = readScreenFile('events/EventDetailScreen.tsx');
      expect(hasBannerUsage(content)).toBe(false);
    });

    it('SettingsScreen must NOT have banners', () => {
      const content = readScreenFile('settings/SettingsScreen.tsx');
      expect(hasBannerUsage(content)).toBe(false);
    });

    it('FeedbackFormScreen must NOT have banners', () => {
      const content = readScreenFile('feedback/FeedbackFormScreen.tsx');
      expect(hasBannerUsage(content)).toBe(false);
    });

    it('ClickFixFormScreen must NOT have banners', () => {
      const content = readScreenFile('click-fix/ClickFixFormScreen.tsx');
      expect(hasBannerUsage(content)).toBe(false);
    });
  });

  describe('Placement summary', () => {
    it('should have exactly 5 screens with banner placement', () => {
      const screensWithBanners: string[] = [];

      // Walk through all screen files
      const screenDirs = ['home', 'events', 'transport', 'inbox', 'pages', 'settings', 'feedback', 'click-fix'];

      for (const dir of screenDirs) {
        const dirPath = path.join(SCREENS_DIR, dir);
        if (!fs.existsSync(dirPath)) continue;

        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.tsx'));
        for (const file of files) {
          const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
          if (hasBannerUsage(content)) {
            screensWithBanners.push(`${dir}/${file}`);
          }
        }
      }

      // Exactly 5 screens should have banners
      expect(screensWithBanners).toHaveLength(5);
      expect(screensWithBanners.sort()).toEqual([
        'events/EventsScreen.tsx',
        'home/HomeScreen.tsx',
        'transport/RoadTransportScreen.tsx',
        'transport/SeaTransportScreen.tsx',
        'transport/TransportHubScreen.tsx',
      ]);
    });
  });
});
