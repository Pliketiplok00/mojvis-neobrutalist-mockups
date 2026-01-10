/**
 * Header & Menu Consistency Regression Tests
 *
 * These tests ensure:
 * 1. Header ALWAYS shows hamburger menu icon (never back arrow)
 * 2. Menu does NOT have a footer
 *
 * UI Contract (NON-NEGOTIABLE):
 * - Every screen shows hamburger menu on left
 * - Back navigation is via iOS swipe gesture only
 * - No back arrow buttons anywhere
 * - Menu footer was removed
 *
 * If these tests fail, the UI contract has been violated.
 */

import * as fs from 'fs';
import * as path from 'path';

const COMPONENTS_DIR = path.join(__dirname, '../components');

describe('Header Consistency (REGRESSION)', () => {
  /**
   * GlobalHeader must ALWAYS show hamburger, never back arrow.
   * This test verifies the component implementation.
   */
  it('GlobalHeader should always show hamburger icon, never back arrow', () => {
    const headerFile = fs.readFileSync(
      path.join(COMPONENTS_DIR, 'GlobalHeader.tsx'),
      'utf-8'
    );

    // Verify BackIcon is NOT defined or used
    expect(headerFile).not.toMatch(/const BackIcon/);
    expect(headerFile).not.toMatch(/<BackIcon\s*\/>/);

    // Verify HamburgerIcon IS defined and used
    expect(headerFile).toMatch(/const HamburgerIcon/);
    expect(headerFile).toMatch(/<HamburgerIcon\s*\/>/);

    // Verify handleLeftPress calls openMenu, not goBack
    expect(headerFile).toMatch(/openMenu\(\)/);
    expect(headerFile).not.toMatch(/navigation\.goBack\(\)/);

    // Verify comment documents the rule
    expect(headerFile).toMatch(/ALWAYS.*hamburger/i);
    expect(headerFile).toMatch(/iOS swipe gesture/i);
  });

  /**
   * GlobalHeader must use MenuContext for consistent menu behavior.
   */
  it('GlobalHeader should use MenuContext for menu control', () => {
    const headerFile = fs.readFileSync(
      path.join(COMPONENTS_DIR, 'GlobalHeader.tsx'),
      'utf-8'
    );

    // Must import useMenu
    expect(headerFile).toMatch(/import.*useMenu.*from.*MenuContext/);

    // Must call useMenu() hook
    expect(headerFile).toMatch(/const\s*\{\s*openMenu\s*\}\s*=\s*useMenu\(\)/);
  });
});

describe('Menu Footer Removal (REGRESSION)', () => {
  /**
   * MenuOverlay must NOT have a footer.
   * The footer was removed per UI contract.
   */
  it('MenuOverlay should NOT have footer JSX', () => {
    const menuFile = fs.readFileSync(
      path.join(COMPONENTS_DIR, 'MenuOverlay.tsx'),
      'utf-8'
    );

    // Footer JSX should not exist
    expect(menuFile).not.toMatch(/<View style={styles\.footer}>/);
    expect(menuFile).not.toMatch(/<Text style={styles\.footerText}>/);
    expect(menuFile).not.toMatch(/MOJ VIS v1\.0/);

    // Comment should document removal
    expect(menuFile).toMatch(/Footer removed/);
  });

  /**
   * MenuOverlay should not have footer styles.
   */
  it('MenuOverlay should NOT have footer styles', () => {
    const menuFile = fs.readFileSync(
      path.join(COMPONENTS_DIR, 'MenuOverlay.tsx'),
      'utf-8'
    );

    // Footer styles should not exist as active code
    // (may exist in comments)
    const styleSection = menuFile.substring(menuFile.indexOf('StyleSheet.create'));

    // Look for actual style definitions (not comments)
    const footerStylePattern = /footer:\s*\{[^}]+\}/;
    const footerTextStylePattern = /footerText:\s*\{[^}]+\}/;

    expect(styleSection).not.toMatch(footerStylePattern);
    expect(styleSection).not.toMatch(footerTextStylePattern);
  });
});

describe('Screen Header Usage (REGRESSION)', () => {
  /**
   * All screens using GlobalHeader should work with hamburger.
   * This is a documentation test showing which screens use the header.
   */
  it('should document screens that use GlobalHeader', () => {
    const screensDir = path.join(__dirname, '../screens');

    // Count screens using GlobalHeader
    const screenFiles: string[] = [];

    function walkDir(dir: string): void {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('GlobalHeader') || content.includes('Header type=')) {
            screenFiles.push(fullPath.replace(screensDir + '/', ''));
          }
        }
      }
    }

    walkDir(screensDir);

    // At minimum, we expect these screens to use the header
    expect(screenFiles.length).toBeGreaterThan(0);

    // Log for documentation
    console.log('Screens using GlobalHeader:', screenFiles);
  });
});
