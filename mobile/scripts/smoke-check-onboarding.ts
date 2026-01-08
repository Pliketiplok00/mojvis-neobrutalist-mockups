/**
 * Onboarding Smoke Check
 *
 * Verifies that the onboarding flow files exist and TypeScript compiles.
 * Run with: node scripts/smoke-check-onboarding.js
 *
 * This is a static verification since the mobile project
 * doesn't have a testing framework configured.
 *
 * Checks:
 * 1. Required files exist
 * 2. TypeScript compiles without errors
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Files that must exist for onboarding to work
const requiredFiles = [
  'src/contexts/OnboardingContext.tsx',
  'src/screens/onboarding/LanguageSelectionScreen.tsx',
  'src/screens/onboarding/UserModeSelectionScreen.tsx',
  'src/screens/onboarding/MunicipalitySelectionScreen.tsx',
  'src/navigation/AppNavigator.tsx',
  'src/navigation/types.ts',
  'App.tsx',
];

let passed = 0;
let failed = 0;

console.log('\n=== Onboarding Smoke Check ===\n');

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
  console.log('2. Select a language on first screen');
  console.log('3. Select Visitor or Local');
  console.log('4. If Local, select a municipality');
  console.log('5. Verify Home screen appears');
  console.log('6. Restart app and verify Home appears directly (no onboarding)');
  process.exit(0);
}
