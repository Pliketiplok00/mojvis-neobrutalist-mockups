/**
 * Menu Navigation Smoke Check
 *
 * Verifies that the menu overlay navigation is properly set up.
 * Run with: npx tsx scripts/smoke-check-menu.ts
 *
 * This is a static verification since the mobile project
 * doesn't have a testing framework configured.
 *
 * Checks:
 * 1. Required menu files exist
 * 2. No native drawer packages installed (to avoid conflicts)
 * 3. TypeScript compiles without errors
 * 4. Screens have menu wiring
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Files that must exist for menu overlay navigation
const requiredFiles = [
  'src/components/MenuOverlay.tsx',
  'src/contexts/MenuContext.tsx',
  'src/navigation/AppNavigator.tsx',
  'App.tsx',
];

// Screens that should use the menu
const screensWithMenu = [
  'src/screens/home/HomeScreen.tsx',
  'src/screens/transport/TransportHubScreen.tsx',
  'src/screens/events/EventsScreen.tsx',
];

let passed = 0;
let failed = 0;

console.log('\n=== Menu Navigation Smoke Check ===\n');

// Check required files exist
console.log('--- File Existence Checks ---');
for (const file of requiredFiles) {
  const fullPath = join(projectRoot, file);
  if (existsSync(fullPath)) {
    console.log(`✓ ${file} exists`);
    passed++;
  } else {
    console.log(`✗ ${file} MISSING`);
    failed++;
  }
}

// Check no conflicting native packages
console.log('\n--- No Native Drawer Packages ---');
const packageJson = JSON.parse(
  readFileSync(join(projectRoot, 'package.json'), 'utf-8')
);
const deps = packageJson.dependencies || {};
if (!deps['@react-navigation/drawer']) {
  console.log('✓ @react-navigation/drawer NOT installed (good - avoids native conflicts)');
  passed++;
} else {
  console.log('✗ @react-navigation/drawer is installed (may cause native binary issues)');
  failed++;
}

if (!deps['react-native-reanimated']) {
  console.log('✓ react-native-reanimated NOT installed (good - avoids native conflicts)');
  passed++;
} else {
  console.log('⚠ react-native-reanimated is installed (check for native compatibility)');
  // Not counting as failure since it might be needed for other features
}

// Check MenuContext is used
console.log('\n--- Menu Context Check ---');
const appContent = readFileSync(join(projectRoot, 'App.tsx'), 'utf-8');
if (appContent.includes('MenuProvider') && appContent.includes('MenuOverlay')) {
  console.log('✓ App.tsx uses MenuProvider and MenuOverlay');
  passed++;
} else {
  console.log('✗ App.tsx missing MenuProvider or MenuOverlay');
  failed++;
}

// Check screens have menu wiring
console.log('\n--- Screen Menu Wiring Check ---');
for (const screenFile of screensWithMenu) {
  const fullPath = join(projectRoot, screenFile);
  if (!existsSync(fullPath)) {
    console.log(`✗ ${screenFile} MISSING`);
    failed++;
    continue;
  }

  const content = readFileSync(fullPath, 'utf-8');
  const hasMenuImport = content.includes('useMenu');
  const hasOpenMenu = content.includes('openMenu');

  if (hasMenuImport && hasOpenMenu) {
    console.log(`✓ ${screenFile} has menu wiring`);
    passed++;
  } else {
    console.log(`✗ ${screenFile} missing menu wiring`);
    failed++;
  }
}

// Check TypeScript compiles
console.log('\n--- TypeScript Compilation ---');
try {
  execSync('npx tsc --noEmit', { cwd: projectRoot, stdio: 'pipe' });
  console.log('✓ TypeScript compiles without errors');
  passed++;
} catch (error) {
  console.log('✗ TypeScript compilation failed');
  console.log((error as { stderr?: Buffer }).stderr?.toString() || 'Unknown error');
  failed++;
}

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
  console.error('Smoke check FAILED');
  process.exit(1);
} else {
  console.log('Smoke check PASSED');
  console.log('\nManual verification steps:');
  console.log('1. Run: npx expo start --ios');
  console.log('2. Complete onboarding if needed');
  console.log('3. On Home screen, tap hamburger icon (top-left)');
  console.log('4. Menu overlay should slide in from left');
  console.log('5. Tap "Vozni red" (Transport) in menu');
  console.log('6. Verify Transport Hub screen loads');
  console.log('7. Tap hamburger, verify menu opens again');
  process.exit(0);
}
