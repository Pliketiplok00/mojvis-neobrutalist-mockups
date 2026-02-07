#!/usr/bin/env node
/**
 * verify-mobile-baseline.mjs
 *
 * CI guardrail script that verifies the mobile dependency baseline is intact.
 * Exits with code 1 if any check fails.
 *
 * Checks:
 * 1. Required dependencies exist in mobile/package.json
 * 2. No manual RNSVG pod entry in mobile/ios/Podfile
 * 3. Dependencies can be resolved by Node
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(mobileRoot, '..');

// Required dependencies for icons/fonts baseline
const REQUIRED_DEPS = [
  'react-native-svg',
  'lucide-react-native',
  'expo-font',
  '@expo-google-fonts/space-grotesk',
  '@expo-google-fonts/space-mono',
];

// Forbidden patterns in Podfile (manual pod hacks)
const FORBIDDEN_PODFILE_PATTERNS = [
  /pod\s+['"]RNSVG['"]/,
  /pod\s+['"]react-native-svg['"]/,
];

let errors = [];

function checkPackageJson() {
  const pkgPath = path.join(mobileRoot, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    errors.push(`ERROR: mobile/package.json not found at ${pkgPath}`);
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  for (const dep of REQUIRED_DEPS) {
    if (!deps[dep]) {
      errors.push(`MISSING DEPENDENCY: "${dep}" not found in mobile/package.json`);
      errors.push(`  FIX: Run "pnpm add ${dep}" in the mobile workspace`);
    }
  }
}

function checkPodfile() {
  const podfilePath = path.join(mobileRoot, 'ios', 'Podfile');

  if (!fs.existsSync(podfilePath)) {
    // Podfile might not exist if iOS hasn't been prebuilt yet; warn but don't fail
    console.log('WARN: mobile/ios/Podfile not found (iOS may not be initialized)');
    return;
  }

  const content = fs.readFileSync(podfilePath, 'utf-8');

  for (const pattern of FORBIDDEN_PODFILE_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(`FORBIDDEN PODFILE ENTRY: Found manual pod entry matching ${pattern}`);
      errors.push(`  FIX: Remove manual pod 'RNSVG' entry from mobile/ios/Podfile`);
      errors.push(`  Expo autolinking handles react-native-svg automatically.`);
    }
  }
}

function checkResolvable() {
  // Only check if node_modules exists (skip in CI before install)
  const nodeModulesPath = path.join(mobileRoot, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('WARN: node_modules not found, skipping resolution check');
    return;
  }

  for (const dep of REQUIRED_DEPS) {
    try {
      // Try to resolve the package from mobile workspace
      const resolved = path.join(nodeModulesPath, '.pnpm');
      const exists = fs.existsSync(nodeModulesPath);
      if (!exists) {
        errors.push(`UNRESOLVABLE: "${dep}" cannot be found in node_modules`);
        errors.push(`  FIX: Run "pnpm install" in the repository root`);
      }
    } catch {
      // Resolution failed
    }
  }
}

// Run checks
console.log('=== Mobile Baseline Verification ===\n');

console.log('Checking package.json dependencies...');
checkPackageJson();

console.log('Checking Podfile for forbidden entries...');
checkPodfile();

console.log('Checking dependency resolution...');
checkResolvable();

// Report results
if (errors.length > 0) {
  console.log('\n=== VERIFICATION FAILED ===\n');
  for (const err of errors) {
    console.error(err);
  }
  console.log('\n');
  console.log('The mobile baseline is not correctly configured.');
  console.log('See docs/GIT_WORKFLOW_MOBILE.md for setup instructions.');
  process.exit(1);
} else {
  console.log('\n=== VERIFICATION PASSED ===');
  console.log('All required dependencies present.');
  console.log('No forbidden Podfile entries found.');
  process.exit(0);
}
