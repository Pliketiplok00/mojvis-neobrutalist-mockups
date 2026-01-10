# Design CI guardrails

These checks prevent design regressions from re-entering the codebase while allowing existing debt to be tracked and reduced over time.

## What is enforced

Scope (current phase):
- mobile/src/components/**
- mobile/src/screens/transport/**
- mobile/src/screens/inbox/**

1) Hardcoded hex colors
- Match: #[0-9a-fA-F]{3,8}\b
- Allowlist: mobile/src/ui/skin*.ts

2) Raw lucide imports
- Match: from "lucide" or from 'lucide'
- Allowlist: mobile/src/ui/Icon.tsx

3) Emoji icons used as UI
- Emoji set: 📭 📤 ⚠️ 🚌 🚢 ⚙️ 🔧 💬 🏠 📅 ✅ ❌
- Default: fail

## Baseline mode

We track existing violations in `docs/design-guard-baseline.json`. CI fails only when new violations are introduced within the current scope.

To update the baseline (strict; use only when intentionally reducing or accepting existing debt):

- `node scripts/design-guard.mjs all --write-baseline`

The baseline records file + line + match + line text. If a violation moves or changes, update the baseline after confirming the change is intended.

## Run locally

- All checks: `pnpm design:guard`
- Hex only: `pnpm design:guard:hex`
- Lucide only: `pnpm design:guard:lucide`
- Emoji only: `pnpm design:guard:emoji`

## Adding allowlist entries (strict)

Allowlist rules live in `scripts/design-guard.mjs`.

- Hex allowlist: update `hexAllowlist` with a specific file regex.
- Lucide allowlist: add the exact file path to `lucideAllowlist`.
- Emoji allowlist: update `emojiAllowlist` with a narrow path regex (for example, fixtures only).

Keep allowlists as tight as possible. Broad wildcards are not allowed.

## Troubleshooting

- If CI fails, the output lists `file:line:match` entries. Remove the hardcoded hex, replace raw lucide imports with the UI icon component, or replace emoji icons with the approved system.
- If the emoji check is too noisy for a specific content fixture, add a targeted allowlist entry for that fixture path only.
