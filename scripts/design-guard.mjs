import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const targetRoots = [
  path.join(repoRoot, "mobile", "src", "components"),
  path.join(repoRoot, "mobile", "src", "screens", "transport"),
  path.join(repoRoot, "mobile", "src", "screens", "inbox"),
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

const scanModes = new Set(["all", "hex", "lucide", "emoji"]);
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
