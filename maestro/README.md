# Maestro Visual Baseline

iOS Simulator screenshot capture and visual regression testing using [Maestro](https://maestro.mobile.dev/).

## Why This Exists

**iOS Simulator screenshots are the authoritative visual ground truth.**

Expo web rendering is NOT authoritative for design parity checks. This system captures
deterministic screenshots from the iOS Simulator to establish visual baselines that
production screens must match.

## Prerequisites

### 1. Install Maestro CLI

```bash
brew install maestro
```

Verify installation:

```bash
maestro --version
```

### 2. Install ImageMagick (for diffs)

```bash
brew install imagemagick
```

### 3. Boot iOS Simulator

```bash
# List available simulators
xcrun simctl list devices

# Boot a specific simulator (e.g., iPhone 15 Pro)
xcrun simctl boot "iPhone 15 Pro"
```

### 4. Build and Install App

From the `mobile/` directory:

```bash
cd mobile

# Install dependencies
pnpm install

# Build and run on iOS Simulator
npx expo run:ios
```

Wait for the app to launch on the simulator.

## Usage

All commands should be run from the **repo root**.

### Generate Baseline Screenshots

Run all flows and save screenshots to `maestro/screenshots/baseline/`:

```bash
./maestro/scripts/baseline.sh
```

Run a specific flow:

```bash
./maestro/scripts/baseline.sh onboarding_language_selection
```

**Baseline screenshots should be committed to the repo.**

### Generate Current Screenshots

Run all flows and save screenshots to `maestro/screenshots/current/`:

```bash
./maestro/scripts/run.sh
```

Run a specific flow:

```bash
./maestro/scripts/run.sh onboarding_language_selection
```

Current screenshots are ignored by git.

### Compare Screenshots (Diff)

Compare current screenshots against baseline:

```bash
./maestro/scripts/diff.sh
```

Compare a specific screenshot:

```bash
./maestro/scripts/diff.sh onboarding_language_selection.png
```

This generates diff images in `maestro/screenshots/diff/` showing pixel differences.

## Fresh App State

The Language Selection screen is only shown on **fresh app launch** (no onboarding data).

To ensure a fresh state:

**Option A: Uninstall and reinstall**
```bash
xcrun simctl uninstall booted com.mojvis.app
npx expo run:ios
```

**Option B: Let Maestro handle it**

The flow uses `clearState: true` which clears app data before launching.

## Folder Structure

```
maestro/
├── README.md                 # This file
├── .gitignore                # Ignore current/diff screenshots
├── flows/                    # Maestro flow definitions
│   └── onboarding_language_selection.yaml
├── scripts/                  # Helper scripts
│   ├── run.sh               # Generate current screenshots
│   ├── baseline.sh          # Generate baseline screenshots
│   └── diff.sh              # Compare current vs baseline
└── screenshots/
    ├── baseline/            # Committed baseline screenshots (ground truth)
    ├── current/             # Generated during test runs (gitignored)
    └── diff/                # Diff outputs (gitignored)
```

## Available Flows

| Flow | Screenshots | Description |
|------|------------|-------------|
| `a1_baseline_all_screens` | 12 screenshots | **Primary flow** - captures all key screens |
| `onboarding_language_selection` | 1 screenshot | Language Selection screen only (legacy) |

### A1 Baseline All Screens

The `a1_baseline_all_screens.yaml` flow captures screenshots of all key mobile screens:

| Screenshot | Screen |
|------------|--------|
| `a1_onboarding_language.png` | Language Selection |
| `a1_onboarding_usermode.png` | User Mode Selection |
| `a1_onboarding_municipality.png` | Municipality Selection |
| `a1_home.png` | Home Screen |
| `a1_transport_hub.png` | Transport Hub |
| `a1_transport_road.png` | Road Transport List |
| `a1_transport_sea.png` | Sea Transport List |
| `a1_events.png` | Events List |
| `a1_inbox.png` | Inbox List |
| `a1_feedback_form.png` | Feedback Form |
| `a1_clickfix_form.png` | Click & Fix Form |
| `a1_settings.png` | Settings |

Run locally:
```bash
maestro test maestro/flows/a1_baseline_all_screens.yaml
```

## Adding New Flows

1. Create a new YAML file in `maestro/flows/`:

```yaml
appId: com.mojvis.app
---
- clearState
- launchApp:
    clearState: true
# Navigate to your screen...
- assertVisible:
    text: "Expected Text"
- takeScreenshot: your_screenshot_name
```

2. Generate baseline:

```bash
./maestro/scripts/baseline.sh your_flow_name
```

3. Commit the baseline screenshot:

```bash
git add maestro/screenshots/baseline/your_screenshot_name.png
git commit -m "chore(maestro): add baseline for your_flow_name"
```

## Troubleshooting

### "No devices found"

Ensure iOS Simulator is booted:

```bash
xcrun simctl list devices | grep Booted
```

### "App not installed"

Build and install the app:

```bash
cd mobile && npx expo run:ios
```

### "Maestro command not found"

Install Maestro:

```bash
brew install maestro
```

### Screenshots differ due to timestamps/dynamic content

Ensure flows wait for stable UI state before capturing. Use `assertVisible` and
`extendedWaitUntil` to wait for expected content.

## Design Parity Workflow

1. **Establish baseline**: Run `./maestro/scripts/baseline.sh` and commit screenshots
2. **Make UI changes**: Modify production screens
3. **Generate current**: Run `./maestro/scripts/run.sh`
4. **Compare**: Run `./maestro/scripts/diff.sh`
5. **Review**: If differences are intentional, update baseline; otherwise fix the regression

The baseline screenshots in this repo represent the canonical iOS visual state.
Production UI changes should match these baselines, not Expo web rendering.

---

## CI (A1) - GitHub Actions Visual Baseline

Maestro visual baseline tests run automatically in CI on Apple Silicon macOS runners.

### When CI Runs

- **Automatically**: On pull requests that modify `maestro/**` or `mobile/**`
- **Manually**: Via `workflow_dispatch` from the Actions tab

### How to Trigger Manually

1. Go to **Actions** → **Maestro Visual Baseline (A1)**
2. Click **Run workflow**
3. Optionally enable debug logging
4. Click **Run workflow** (green button)

### What CI Does

1. Boots iOS Simulator (iPhone 15 Pro)
2. Builds and installs the Expo iOS app
3. Runs all Maestro flows from `maestro/flows/`
4. Captures screenshots to `maestro/screenshots/current/`
5. Compares against committed baselines in `maestro/screenshots/baseline/`
6. Generates diff images for any pixel differences
7. Uploads artifact ZIP with all outputs

### Artifact Contents

Download `maestro-visual-artifacts` from the workflow run:

```
maestro-visual-artifacts.zip
├── screenshots/
│   ├── current/     # Screenshots from this run
│   └── diff/        # Diff images (red = changed pixels)
├── logs/
│   ├── maestro-run.log   # Maestro execution log
│   ├── diff.log          # Diff comparison report
│   └── README.txt        # How to interpret results
```

### Failure Conditions

CI **fails** (exit 1) if:
- Any screenshot differs from its baseline (pixel differences detected)
- Any screenshot has no committed baseline (missing baseline)

### Fixing Failures

**If diff images show unintended changes:**
1. Download artifact and review diff images
2. Fix the UI regression in your code
3. Push fixes and re-run CI

**If changes are intentional:**
1. Run locally on Apple Silicon Mac (or download current screenshots from artifact)
2. Replace baseline: `cp current/<name>.png baseline/<name>.png`
3. Commit updated baseline:
   ```bash
   git add maestro/screenshots/baseline/
   git commit -m "chore(maestro): update baseline for <name>"
   ```

**If baseline is missing:**
1. Download `current/<name>.png` from artifact
2. Verify it looks correct
3. Add to baseline:
   ```bash
   # Copy from downloaded artifact to repo
   cp ~/Downloads/maestro-visual-artifacts/screenshots/current/<name>.png \
      maestro/screenshots/baseline/<name>.png
   git add maestro/screenshots/baseline/<name>.png
   git commit -m "chore(maestro): add baseline for <name>"
   ```

### Local Intel Mac Limitation

Maestro iOS testing does **not** work on Intel Macs (see `DEBUGGING_REPORT.md`).
Use CI as the authoritative runner for visual baseline verification.

---

## How to Generate Baseline from CI Artifacts

When CI runs but baselines are missing, follow these steps to create baselines from CI artifacts:

### Step 1: Trigger CI

Push to a PR or manually trigger the workflow:
```bash
# Push to trigger CI
git push origin your-branch
```
Or go to **Actions** → **Maestro Visual Baseline (A1)** → **Run workflow**

### Step 2: Download Screenshots

After CI completes (even if failed due to missing baselines):
1. Go to the workflow run page
2. Download `maestro-screenshots-current` artifact
3. Extract to a temporary folder

### Step 3: Verify Screenshots

Review each screenshot in the extracted folder:
- Check that UI looks correct
- Verify no test artifacts or loading states
- Confirm text/icons are fully rendered

### Step 4: Copy to Baseline

```bash
# Copy all A1 screenshots to baseline folder
cp ~/Downloads/maestro-screenshots-current/a1_*.png \
   maestro/screenshots/baseline/
```

### Step 5: Commit Baselines

```bash
# Stage baseline screenshots
git add maestro/screenshots/baseline/

# Commit with descriptive message
git commit -m "chore(maestro): add A1 baseline screenshots

Screenshots added:
- a1_onboarding_language.png
- a1_onboarding_usermode.png
- a1_onboarding_municipality.png
- a1_home.png
- a1_transport_hub.png
- a1_transport_road.png
- a1_transport_sea.png
- a1_events.png
- a1_inbox.png
- a1_feedback_form.png
- a1_clickfix_form.png
- a1_settings.png"

# Push to trigger CI verification
git push
```

### Verification

CI should now pass (or show only intentional diffs). The discovery report in `maestro-logs` artifact shows:
- List of flows executed
- List of screenshots produced
- Screenshot file locations
