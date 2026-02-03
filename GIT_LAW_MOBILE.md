# GIT LAW — MOBILE (MOJ VIS)
Version: 1.0  
Status: NON-NEGOTIABLE  
Scope: mobile/** + mobile deps + onboarding/design work

## 0) Prime Directive
**Main must never become a crime scene.**  
If we are not 100% sure it won’t regress anything, it does NOT go to `main`.

## 1) Canonical Truth
- **Canonical integration branch:** `integration/mobile`
- All mobile work must be based on `integration/mobile`.
- `main` is release-only. We merge to `main` only when a coherent batch is ready.

## 2) The Only Allowed Branch Flow
### Start any work
1) `git fetch --all --prune`
2) `git switch integration/mobile`
3) `git pull --ff-only`
4) `git switch -c feat/<short-name>` (or `fix/<short-name>`)

### Finish work
- Open PR **into `integration/mobile`** (not into `main`)
- After merge, delete the feature branch (local + remote)

## 3) “No Uncommitted Landmines” Rule
On every branch:
- **Never** leave uncommitted changes in:
  - `mobile/package.json`
  - `mobile/pnpm-lock.yaml`
  - `mobile/ios/**`
- If deps must change: make it a **single dedicated commit** with a clear message:
  - `fix(mobile-deps): <what/why>`
- If you currently have uncommitted deps: STOP and clean it (commit or discard). Do not continue.

## 4) Deps-First Policy
If a feature depends on runtime deps (e.g., svg/icons/fonts):
1) Land deps baseline first on `integration/mobile` (PR 1)
2) Then do UI changes (PR 2)
**Never** split deps on one branch and UI on another without merging baseline first.

## 5) No Guessing Policy (Claude + humans)
If anything is unclear, ambiguous, or could cause data loss/regression:
- STOP
- ASK QUESTIONS
- DO NOT GUESS

Examples that require asking:
- Which design variant is canonical if two branches differ
- Which dependency versions are canonical if they mismatch
- Whether unpushed local commits exist
- Whether a change must be “design-only” (skin-first) vs logic

## 6) CI Is a Gate, Not a Decoration
A PR is not mergeable unless ALL are true:
- CI is green
- Mobile baseline check passes
- TypeScript check passes
- No hardcoded hex rule is satisfied (design guard)

If CI is red: we fix CI, not “merge anyway”.

## 7) Verification Before Merge (Required Evidence)
Every PR description MUST include:
- Branch name + HEAD commit
- Files changed (list)
- Commands run and results:
  - `pnpm -r typecheck`
  - `node mobile/scripts/verify-mobile-baseline.mjs`
- Evidence greps (when relevant):
  - `grep -n "onboardingSelection" mobile/src/ui/Card.tsx`
  - `grep -n "municipalitySelection" mobile/src/ui/skin.neobrut2.ts`
  - `grep -n "OnboardingRoleCard" mobile/src/screens/onboarding/UserModeSelectionScreen.tsx`

No evidence = no merge.

## 8) One Task = One PR
No “while I’m here” changes.
If you notice another issue:
- open a new branch
- new PR
Keep diffs small and reversible.

## 9) Regressions Protocol
If a regression appears (icons disappear, screen reverts, etc.):
1) Identify which slice is missing (deps/UI/skin) via git evidence
2) Fix by merging/cherry-picking the missing slice into `integration/mobile`
3) Do NOT “hotfix” by random manual edits in working tree

## 10) Cleanup Hygiene (Always)
After merges:
- delete merged feature branches
- keep only:
  - `main`
  - `integration/mobile`
  - active short-lived feature branches

That’s it.
