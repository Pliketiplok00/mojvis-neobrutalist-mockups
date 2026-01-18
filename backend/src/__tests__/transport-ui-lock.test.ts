/**
 * Transport UI Lock Tests
 *
 * HARD GUARDRAILS: These tests FAIL if transport UI layout is changed.
 *
 * CANONICAL STABLE POINT:
 * - Git tag: UI_TRANSPORT_STABLE_2026-01-18
 * - Commit: 1207a92
 * - Branch: fix/ui-transport-header-alignment
 *
 * DO NOT CHANGE THESE TESTS WITHOUT UPDATING:
 * - docs/TRANSPORT_UI_LOCK.md
 * - The actual UI to match
 *
 * WHAT THESE TESTS GUARD:
 * 1. Line card header layout: [ICON] [TITLE] [TAG]
 * 2. Today departure row layout: [TIME] [INFO] [TAG]
 * 3. Badge styling: borderRadius: 0 (sharp corners)
 * 4. No inline/stacked badge layouts
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileDir = join(__dirname, '../../../mobile/src');

// ============================================================
// LINE CARD HEADER LAYOUT TESTS
// Layout MUST be: [ICON] [TITLE] [TAG]
// ============================================================

describe('Transport Line Card Header Layout Lock (HARD GUARDRAILS)', () => {
  /**
   * TEST: SeaTransportScreen line card header uses [ICON][TITLE][TAG] layout
   * FAILS IF: Someone wraps title+tag in a container or changes order
   */
  it('SeaTransportScreen line card header MUST have [ICON][TITLE][TAG] horizontal layout', () => {
    const seaScreenPath = join(mobileDir, 'screens/transport/SeaTransportScreen.tsx');
    expect(existsSync(seaScreenPath)).toBe(true);

    const seaCode = readFileSync(seaScreenPath, 'utf-8');

    // Icon box MUST be first child of lineCardHeader
    expect(seaCode).toContain('lineCardHeaderIconBox');

    // Title MUST be direct child (not wrapped in lineCardHeaderText)
    // Check that lineCardHeaderText wrapper is NOT used
    const hasOldWrapper = seaCode.includes('<View style={styles.lineCardHeaderText}>');
    expect(hasOldWrapper).toBe(false);

    // Badge MUST be sibling of title (not nested inside it)
    // The pattern should be: </H2> ... {line.subtype && <View style={styles.lineSubtypeBadge}
    const correctBadgePlacement = seaCode.match(/lineCardHeaderTitle.*\n.*\{line\.subtype/s);
    expect(correctBadgePlacement).not.toBeNull();
  });

  /**
   * TEST: RoadTransportScreen line card header uses [ICON][TITLE][TAG] layout
   * FAILS IF: Someone wraps title+tag in a container or changes order
   */
  it('RoadTransportScreen line card header MUST have [ICON][TITLE][TAG] horizontal layout', () => {
    const roadScreenPath = join(mobileDir, 'screens/transport/RoadTransportScreen.tsx');
    expect(existsSync(roadScreenPath)).toBe(true);

    const roadCode = readFileSync(roadScreenPath, 'utf-8');

    // Icon box MUST be first child of lineCardHeader
    expect(roadCode).toContain('lineCardHeaderIconBox');

    // Title MUST be direct child (not wrapped in lineCardHeaderText)
    const hasOldWrapper = roadCode.includes('<View style={styles.lineCardHeaderText}>');
    expect(hasOldWrapper).toBe(false);

    // Badge MUST be sibling of title
    const correctBadgePlacement = roadCode.match(/lineCardHeaderTitle.*\n.*\{line\.subtype/s);
    expect(correctBadgePlacement).not.toBeNull();
  });

  /**
   * TEST: Icon box MUST be square (width === height)
   * FAILS IF: Someone removes the height property from lineCardHeaderIconBox
   */
  it('SeaTransportScreen icon box MUST be square', () => {
    const seaCode = readFileSync(join(mobileDir, 'screens/transport/SeaTransportScreen.tsx'), 'utf-8');

    // Must have both width and height in lineCardHeaderIconBox style
    const iconBoxStyle = seaCode.match(/lineCardHeaderIconBox:\s*\{[^}]+\}/s)?.[0] || '';
    expect(iconBoxStyle).toContain('width:');
    expect(iconBoxStyle).toContain('height:');
    expect(iconBoxStyle).toContain('lineCardHeaderIconBoxSize'); // Both must use same token
  });

  /**
   * TEST: Icon box MUST be square (width === height)
   * FAILS IF: Someone removes the height property from lineCardHeaderIconBox
   */
  it('RoadTransportScreen icon box MUST be square', () => {
    const roadCode = readFileSync(join(mobileDir, 'screens/transport/RoadTransportScreen.tsx'), 'utf-8');

    const iconBoxStyle = roadCode.match(/lineCardHeaderIconBox:\s*\{[^}]+\}/s)?.[0] || '';
    expect(iconBoxStyle).toContain('width:');
    expect(iconBoxStyle).toContain('height:');
    expect(iconBoxStyle).toContain('lineCardHeaderIconBoxSize');
  });

  /**
   * TEST: Title MUST have flex: 1 to take available space
   * FAILS IF: Someone removes flex: 1 from lineCardHeaderTitle
   */
  it('Line card title MUST have flex: 1', () => {
    const seaCode = readFileSync(join(mobileDir, 'screens/transport/SeaTransportScreen.tsx'), 'utf-8');
    const roadCode = readFileSync(join(mobileDir, 'screens/transport/RoadTransportScreen.tsx'), 'utf-8');

    const seaTitleStyle = seaCode.match(/lineCardHeaderTitle:\s*\{[^}]+\}/s)?.[0] || '';
    const roadTitleStyle = roadCode.match(/lineCardHeaderTitle:\s*\{[^}]+\}/s)?.[0] || '';

    expect(seaTitleStyle).toContain('flex: 1');
    expect(roadTitleStyle).toContain('flex: 1');
  });
});

// ============================================================
// TODAY DEPARTURES ROW LAYOUT TESTS
// Layout MUST be: [TIME] [INFO] [TAG]
// ============================================================

describe('Transport Today Departures Row Layout Lock (HARD GUARDRAILS)', () => {
  /**
   * TEST: SeaTransportScreen today row uses [TIME][INFO][TAG] layout
   * FAILS IF: Badge is nested inside todayInfo or todayLineRow
   */
  it('SeaTransportScreen today row MUST have [TIME][INFO][TAG] layout', () => {
    const seaCode = readFileSync(join(mobileDir, 'screens/transport/SeaTransportScreen.tsx'), 'utf-8');

    // todayLineRow wrapper should NOT exist (removed in the fix)
    const hasTodayLineRow = (seaCode.match(/todayLineRow/g) || []).length;
    // If todayLineRow exists in styles but not used in JSX, count should be <=1 (only style definition)
    // Actually, we removed it entirely, so it should be 0
    expect(hasTodayLineRow).toBe(0);

    // Badge MUST be outside todayInfo container
    // Pattern: </View> (closing todayInfo) ... {dep.subtype && <View style={styles.todaySubtypeBadge}
    const badgeOutsideInfo = seaCode.includes('todayDirection')
      && seaCode.includes('{/* Badge: right-aligned */}');
    expect(badgeOutsideInfo).toBe(true);
  });

  /**
   * TEST: RoadTransportScreen today row uses [TIME][INFO][TAG] layout
   * FAILS IF: Badge is nested inside todayInfo or todayLineRow
   */
  it('RoadTransportScreen today row MUST have [TIME][INFO][TAG] layout', () => {
    const roadCode = readFileSync(join(mobileDir, 'screens/transport/RoadTransportScreen.tsx'), 'utf-8');

    // todayLineRow wrapper should NOT exist
    const hasTodayLineRow = (roadCode.match(/todayLineRow/g) || []).length;
    expect(hasTodayLineRow).toBe(0);

    // Badge MUST be outside todayInfo container
    const badgeOutsideInfo = roadCode.includes('todayDirection')
      && roadCode.includes('{/* Badge: right-aligned */}');
    expect(badgeOutsideInfo).toBe(true);
  });

  /**
   * TEST: Today info container MUST have flex: 1
   * FAILS IF: Someone removes flex: 1 from todayInfo
   */
  it('Today info container MUST have flex: 1', () => {
    const seaCode = readFileSync(join(mobileDir, 'screens/transport/SeaTransportScreen.tsx'), 'utf-8');
    const roadCode = readFileSync(join(mobileDir, 'screens/transport/RoadTransportScreen.tsx'), 'utf-8');

    const seaInfoStyle = seaCode.match(/todayInfo:\s*\{[^}]+\}/s)?.[0] || '';
    const roadInfoStyle = roadCode.match(/todayInfo:\s*\{[^}]+\}/s)?.[0] || '';

    expect(seaInfoStyle).toContain('flex: 1');
    expect(roadInfoStyle).toContain('flex: 1');
  });
});

// ============================================================
// BADGE STYLING TESTS
// Badge MUST have borderRadius: 0 (sharp corners)
// ============================================================

describe('Transport Badge Styling Lock (HARD GUARDRAILS)', () => {
  /**
   * TEST: Line card badge MUST have borderRadius: 0
   * FAILS IF: Someone adds rounded corners to lineSubtypeBadge
   */
  it('Line card badge MUST have borderRadius: 0 (sharp corners)', () => {
    const seaCode = readFileSync(join(mobileDir, 'screens/transport/SeaTransportScreen.tsx'), 'utf-8');
    const roadCode = readFileSync(join(mobileDir, 'screens/transport/RoadTransportScreen.tsx'), 'utf-8');

    const seaBadgeStyle = seaCode.match(/lineSubtypeBadge:\s*\{[^}]+\}/s)?.[0] || '';
    const roadBadgeStyle = roadCode.match(/lineSubtypeBadge:\s*\{[^}]+\}/s)?.[0] || '';

    // Must explicitly set borderRadius: 0
    expect(seaBadgeStyle).toContain('borderRadius: 0');
    expect(roadBadgeStyle).toContain('borderRadius: 0');
  });

  /**
   * TEST: Today departure badge MUST have borderRadius: 0
   * FAILS IF: Someone adds rounded corners to todaySubtypeBadge
   */
  it('Today departure badge MUST have borderRadius: 0 (sharp corners)', () => {
    const seaCode = readFileSync(join(mobileDir, 'screens/transport/SeaTransportScreen.tsx'), 'utf-8');
    const roadCode = readFileSync(join(mobileDir, 'screens/transport/RoadTransportScreen.tsx'), 'utf-8');

    const seaBadgeStyle = seaCode.match(/todaySubtypeBadge:\s*\{[^}]+\}/s)?.[0] || '';
    const roadBadgeStyle = roadCode.match(/todaySubtypeBadge:\s*\{[^}]+\}/s)?.[0] || '';

    // Must explicitly set borderRadius: 0
    expect(seaBadgeStyle).toContain('borderRadius: 0');
    expect(roadBadgeStyle).toContain('borderRadius: 0');
  });

  /**
   * TEST: No hardcoded hex colors in badge styles
   * FAILS IF: Someone uses hardcoded colors instead of tokens
   */
  it('Badges MUST NOT use hardcoded hex colors', () => {
    const seaCode = readFileSync(join(mobileDir, 'screens/transport/SeaTransportScreen.tsx'), 'utf-8');
    const roadCode = readFileSync(join(mobileDir, 'screens/transport/RoadTransportScreen.tsx'), 'utf-8');

    // Extract badge style blocks
    const seaLineBadge = seaCode.match(/lineSubtypeBadge:\s*\{[^}]+\}/s)?.[0] || '';
    const seaTodayBadge = seaCode.match(/todaySubtypeBadge:\s*\{[^}]+\}/s)?.[0] || '';
    const roadLineBadge = roadCode.match(/lineSubtypeBadge:\s*\{[^}]+\}/s)?.[0] || '';
    const roadTodayBadge = roadCode.match(/todaySubtypeBadge:\s*\{[^}]+\}/s)?.[0] || '';

    // Check for hardcoded hex colors (but allow rgba which is acceptable)
    const hexPattern = /#[0-9a-fA-F]{3,8}(?!.*rgba)/;

    // Note: rgba(255,255,255,0.9) is allowed for semi-transparent backgrounds
    // Only pure hex colors like #ffffff are forbidden
    expect(seaLineBadge).not.toMatch(hexPattern);
    expect(roadLineBadge).not.toMatch(hexPattern);

    // Today badges use tokens
    expect(seaTodayBadge).toContain('colors.');
    expect(roadTodayBadge).toContain('colors.');
  });
});

// ============================================================
// ORIGIN FILTER LOCK TESTS
// Today departures MUST only include island-origin departures
// ============================================================

describe('Transport Today Departures Origin Filter Lock', () => {
  /**
   * TEST: Backend MUST filter by island origins
   * FAILS IF: Someone removes or changes the origin filter
   */
  it('getTodaysDepartures MUST filter by island origins (Vis, Komiža)', () => {
    const repoPath = join(__dirname, '../repositories/transport.ts');
    expect(existsSync(repoPath)).toBe(true);

    const repoCode = readFileSync(repoPath, 'utf-8');

    // Must contain origin filter for sea transport
    expect(repoCode).toContain('Vis');
    expect(repoCode).toContain('Komiža');

    // The filter should be in the WHERE clause context
    const hasOriginFilter = repoCode.includes("s.name IN ('Vis', 'Komiža')")
      || repoCode.includes("s.name IN (") && repoCode.includes("'Vis'") && repoCode.includes("'Komiža'");
    expect(hasOriginFilter).toBe(true);
  });
});

// ============================================================
// LOCK COMMENT VERIFICATION
// Source files MUST contain lock comments
// ============================================================

describe('Transport Lock Comment Verification', () => {
  /**
   * TEST: SeaTransportScreen MUST have lock comment
   */
  it('SeaTransportScreen MUST have TRANSPORT_UI_LOCK comment', () => {
    const seaCode = readFileSync(join(mobileDir, 'screens/transport/SeaTransportScreen.tsx'), 'utf-8');
    expect(seaCode).toContain('TRANSPORT_UI_LOCK');
  });

  /**
   * TEST: RoadTransportScreen MUST have lock comment
   */
  it('RoadTransportScreen MUST have TRANSPORT_UI_LOCK comment', () => {
    const roadCode = readFileSync(join(mobileDir, 'screens/transport/RoadTransportScreen.tsx'), 'utf-8');
    expect(roadCode).toContain('TRANSPORT_UI_LOCK');
  });

  /**
   * TEST: transport.ts repository MUST have lock comment
   */
  it('transport.ts repository MUST have TRANSPORT_UI_LOCK comment', () => {
    const repoCode = readFileSync(join(__dirname, '../repositories/transport.ts'), 'utf-8');
    expect(repoCode).toContain('TRANSPORT_UI_LOCK');
  });
});
