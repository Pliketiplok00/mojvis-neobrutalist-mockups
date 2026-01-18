import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const targetRoots = [
  // Shared components
  path.join(repoRoot, "mobile", "src", "components"),
  // Screen folders (alphabetical)
  path.join(repoRoot, "mobile", "src", "screens", "click-fix"),
  path.join(repoRoot, "mobile", "src", "screens", "events"),
  path.join(repoRoot, "mobile", "src", "screens", "feedback"),
  path.join(repoRoot, "mobile", "src", "screens", "home"),
  path.join(repoRoot, "mobile", "src", "screens", "inbox"),
  path.join(repoRoot, "mobile", "src", "screens", "onboarding"),
  path.join(repoRoot, "mobile", "src", "screens", "pages"),
  path.join(repoRoot, "mobile", "src", "screens", "settings"),
  path.join(repoRoot, "mobile", "src", "screens", "transport"),
];

const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

const hexAllowlist = [
  /^mobile\/src\/ui\/skin[^/]*\.ts$/,
];

const lucideAllowlist = new Set(["mobile/src/ui/Icon.tsx"]);

const emojiAllowlist = [
  /^mobile\/src\/(screens|components)\/.*\/fixtures\//,
];

const emojiSet = ["📭", "📤", "⚠️", "🚌", "🚢", "⚙️", "🔧", "💬", "🏠", "📅", "✅", "❌"];
const baselinePath = path.join(repoRoot, "docs", "design-guard-baseline.json");

// Button primitive guards: must use ButtonText, not raw Text
const buttonPath = path.join(repoRoot, "mobile", "src", "ui", "Button.tsx");
const posterButtonPath = path.join(repoRoot, "mobile", "src", "ui", "PosterButton.tsx");

// Transport screens for badge guard
const transportScreens = [
  path.join(repoRoot, "mobile", "src", "screens", "transport", "SeaTransportScreen.tsx"),
  path.join(repoRoot, "mobile", "src", "screens", "transport", "RoadTransportScreen.tsx"),
];

const scanModes = new Set(["all", "hex", "lucide", "emoji", "poster", "button", "badge"]);
const args = process.argv.slice(2);
let mode = "all";
let writeBaseline = false;

for (const arg of args) {
  if (arg === "--write-baseline") {
    writeBaseline = true;
    continue;
  }
  if (scanModes.has(arg)) {
    mode = arg;
    continue;
  }
  console.error(`Unknown option: ${arg}`);
  console.error("Usage: node scripts/design-guard.mjs [all|hex|lucide|emoji] [--write-baseline]");
  process.exit(1);
}

if (!scanModes.has(mode)) {
  console.error(`Unknown mode: ${mode}`);
  console.error("Usage: node scripts/design-guard.mjs [all|hex|lucide|emoji]");
  process.exit(1);
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function relativePath(filePath) {
  return toPosixPath(path.relative(repoRoot, filePath));
}

function isAllowlisted(relPath, allowlist) {
  return allowlist.some((pattern) => pattern.test(relPath));
}

function walkDir(dirPath, files) {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, files);
      continue;
    }
    const ext = path.extname(entry.name);
    if (allowedExtensions.has(ext)) {
      files.push(fullPath);
    }
  }
}

function collectTargetFiles() {
  const files = [];
  for (const root of targetRoots) {
    walkDir(root, files);
  }
  return files;
}

function scanLines(filePath, matcher) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const matches = [];
  lines.forEach((line, index) => {
    const lineMatches = matcher(line);
    for (const match of lineMatches) {
      matches.push({
        filePath,
        lineNumber: index + 1,
        match,
        lineText: line,
      });
    }
  });
  return matches;
}

function matchAll(regex, line) {
  const matches = [];
  let result;
  while ((result = regex.exec(line)) !== null) {
    matches.push(result[0]);
  }
  return matches;
}

function scanHex(files) {
  const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
  const matches = [];
  for (const filePath of files) {
    const relPath = relativePath(filePath);
    if (isAllowlisted(relPath, hexAllowlist)) {
      continue;
    }
    matches.push(...scanLines(filePath, (line) => matchAll(hexRegex, line)));
  }
  return matches;
}

function scanLucide(files) {
  const lucideRegex = /from\s+["']lucide/;
  const matches = [];
  for (const filePath of files) {
    const relPath = relativePath(filePath);
    if (lucideAllowlist.has(relPath)) {
      continue;
    }
    matches.push(
      ...scanLines(filePath, (line) =>
        lucideRegex.test(line) ? ["from 'lucide'"] : []
      )
    );
  }
  return matches;
}

function scanEmoji(files) {
  const emojiRegex = new RegExp(emojiSet.join("|"), "g");
  const matches = [];
  for (const filePath of files) {
    const relPath = relativePath(filePath);
    if (isAllowlisted(relPath, emojiAllowlist)) {
      continue;
    }
    matches.push(...scanLines(filePath, (line) => matchAll(emojiRegex, line)));
  }
  return matches;
}

/**
 * PosterButton typography guard.
 * Checks that PosterButton.tsx:
 * - Imports ButtonText from './Text'
 * - Does NOT import Text from 'react-native' for rendering labels
 */
function scanPosterButton() {
  const matches = [];
  if (!fs.existsSync(posterButtonPath)) {
    matches.push({
      filePath: posterButtonPath,
      lineNumber: 0,
      match: "PosterButton.tsx not found",
      lineText: "",
    });
    return matches;
  }

  const content = fs.readFileSync(posterButtonPath, "utf8");
  const lines = content.split(/\r?\n/);

  // Check for ButtonText import
  const hasButtonTextImport = lines.some(
    (line) => /import.*\{[^}]*ButtonText[^}]*\}.*from\s+['"]\.\/Text['"]/.test(line)
  );
  if (!hasButtonTextImport) {
    matches.push({
      filePath: posterButtonPath,
      lineNumber: 1,
      match: "Missing ButtonText import from './Text'",
      lineText: "PosterButton must import ButtonText from './Text'",
    });
  }

  // Check for raw Text import from react-native (should not have it)
  lines.forEach((line, index) => {
    if (/import\s*\{[^}]*\bText\b[^}]*\}\s*from\s+['"]react-native['"]/.test(line)) {
      matches.push({
        filePath: posterButtonPath,
        lineNumber: index + 1,
        match: "Raw Text import from react-native",
        lineText: line.trim(),
      });
    }
  });

  // Check for <Text> usage (should use <ButtonText> instead)
  lines.forEach((line, index) => {
    // Match <Text but not <ButtonText
    if (/<Text[\s>]/.test(line) && !/<ButtonText/.test(line)) {
      matches.push({
        filePath: posterButtonPath,
        lineNumber: index + 1,
        match: "Raw <Text> usage (should use <ButtonText>)",
        lineText: line.trim(),
      });
    }
  });

  return matches;
}

/**
 * Button.tsx typography guard.
 * Checks that Button.tsx:
 * - Imports ButtonText from './Text'
 * - Does NOT use raw <Text> for button labels
 */
function scanButton() {
  const matches = [];
  if (!fs.existsSync(buttonPath)) {
    matches.push({
      filePath: buttonPath,
      lineNumber: 0,
      match: "Button.tsx not found",
      lineText: "",
    });
    return matches;
  }

  const content = fs.readFileSync(buttonPath, "utf8");
  const lines = content.split(/\r?\n/);

  // Check for ButtonText import
  const hasButtonTextImport = lines.some(
    (line) => /import.*\{[^}]*ButtonText[^}]*\}.*from\s+['"]\.\/Text['"]/.test(line)
  );
  if (!hasButtonTextImport) {
    matches.push({
      filePath: buttonPath,
      lineNumber: 1,
      match: "Missing ButtonText import from './Text'",
      lineText: "Button must import ButtonText from './Text'",
    });
  }

  // Check for raw Text import from react-native (should not have it for label rendering)
  lines.forEach((line, index) => {
    if (/import\s*\{[^}]*\bText\b[^}]*\}\s*from\s+['"]react-native['"]/.test(line)) {
      matches.push({
        filePath: buttonPath,
        lineNumber: index + 1,
        match: "Raw Text import from react-native",
        lineText: line.trim(),
      });
    }
  });

  // Check for <Text> usage in JSX (should use <ButtonText> instead)
  lines.forEach((line, index) => {
    // Match <Text but not <ButtonText (excluding comments)
    if (/<Text[\s>]/.test(line) && !/<ButtonText/.test(line) && !line.trim().startsWith("//") && !line.trim().startsWith("*")) {
      matches.push({
        filePath: buttonPath,
        lineNumber: index + 1,
        match: "Raw <Text> usage (should use <ButtonText>)",
        lineText: line.trim(),
      });
    }
  });

  return matches;
}

/**
 * Badge guard: Transport screens should use Badge component, not inline View+Meta
 * Detects patterns like:
 * - lineSubtypeBadge with inline styles (background, border, padding)
 * - todaySubtypeBadge with inline styles
 */
function scanBadgePatterns() {
  const matches = [];

  for (const screenPath of transportScreens) {
    if (!fs.existsSync(screenPath)) {
      continue;
    }

    const content = fs.readFileSync(screenPath, "utf8");
    const lines = content.split(/\r?\n/);

    // Detect inline badge styling patterns that should use Badge component
    lines.forEach((line, index) => {
      // Check for inline badge styles with hardcoded styling (background/padding)
      // This would catch patterns like: lineSubtypeBadge: { backgroundColor: 'rgba(...)'
      if (/SubtypeBadge.*backgroundColor.*rgba|SubtypeText.*fontSize.*\d+/.test(line)) {
        matches.push({
          filePath: screenPath,
          lineNumber: index + 1,
          match: "Inline badge styling (should use Badge component)",
          lineText: line.trim(),
        });
      }

      // Check for <View style={styles.xxxSubtypeBadge}><Meta
      if (/<View\s+style=\{styles\.\w*SubtypeBadge\}\s*>\s*<Meta/.test(line)) {
        matches.push({
          filePath: screenPath,
          lineNumber: index + 1,
          match: "Inline badge pattern (should use <Badge variant='transport'>)",
          lineText: line.trim(),
        });
      }
    });
  }

  return matches;
}

function formatMatches(matches) {
  return matches
    .map((match) => `${relativePath(match.filePath)}:${match.lineNumber}: ${match.match}`)
    .join("\n");
}

function fingerprint(match) {
  return `${relativePath(match.filePath)}::${match.match}::${match.lineText}`;
}

function loadBaseline() {
  if (!fs.existsSync(baselinePath)) {
    return null;
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const entries = Array.isArray(baseline.violations) ? baseline.violations : [];
  return new Set(entries.map((entry) => entry.fingerprint));
}

function reportMatches(label, matches, baselineSet) {
  const filtered = baselineSet
    ? matches.filter((match) => !baselineSet.has(fingerprint(match)))
    : matches;
  if (filtered.length === 0) {
    return true;
  }
  console.error(`Design guard failed: ${label}`);
  console.error(formatMatches(filtered));
  return false;
}

const files = collectTargetFiles();
let ok = true;
const baselineSet = writeBaseline ? null : loadBaseline();
const violations = [];

if (mode === "all" || mode === "hex") {
  const matches = scanHex(files);
  violations.push(...matches.map((match) => ({ rule: "hex", ...match, fingerprint: fingerprint(match) })));
  ok = reportMatches("hardcoded hex colors", matches, baselineSet) && ok;
}

if (mode === "all" || mode === "lucide") {
  const matches = scanLucide(files);
  violations.push(
    ...matches.map((match) => ({ rule: "lucide", ...match, fingerprint: fingerprint(match) }))
  );
  ok = reportMatches("raw lucide imports", matches, baselineSet) && ok;
}

if (mode === "all" || mode === "emoji") {
  const matches = scanEmoji(files);
  violations.push(
    ...matches.map((match) => ({ rule: "emoji", ...match, fingerprint: fingerprint(match) }))
  );
  ok = reportMatches("emoji icons used as UI", matches, baselineSet) && ok;
}

if (mode === "all" || mode === "poster") {
  const matches = scanPosterButton();
  violations.push(
    ...matches.map((match) => ({ rule: "poster", ...match, fingerprint: fingerprint(match) }))
  );
  ok = reportMatches("PosterButton typography violation", matches, baselineSet) && ok;
}

if (mode === "all" || mode === "button") {
  const matches = scanButton();
  violations.push(
    ...matches.map((match) => ({ rule: "button", ...match, fingerprint: fingerprint(match) }))
  );
  ok = reportMatches("Button typography violation", matches, baselineSet) && ok;
}

if (mode === "all" || mode === "badge") {
  const matches = scanBadgePatterns();
  violations.push(
    ...matches.map((match) => ({ rule: "badge", ...match, fingerprint: fingerprint(match) }))
  );
  ok = reportMatches("Inline badge pattern (use Badge component)", matches, baselineSet) && ok;
}

if (writeBaseline) {
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    scope: targetRoots.map(relativePath),
    violations: violations.map((match) => ({
      rule: match.rule,
      file: relativePath(match.filePath),
      line: match.lineNumber,
      match: match.match,
      lineText: match.lineText,
      fingerprint: match.fingerprint,
    })),
  };
  fs.writeFileSync(baselinePath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Design guard baseline written to ${relativePath(baselinePath)}.`);
  process.exit(0);
}

if (!ok) {
  process.exit(1);
}

console.log("Design guard passed.");
