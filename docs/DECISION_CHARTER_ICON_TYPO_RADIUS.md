MOJ VIS – VISUAL DECISION CHARTER
Icon System · Typography Density · Border Philosophy

Date: 2026-02-12
Status: Locked decisions
Scope: Global UI system

1. BORDER PHILOSOPHY
Rule

All UI elements must use sharp corners.

No Exceptions

The following are forbidden:

4px radius

12px radius

20px radius

32px radius

40px radius

Any non-zero border radius

Impact

Photo tiles become square

Confirmation checkmarks become square

Status blocks become square

Selection cards become square

MOJ VIS is fully neobrutalist.
No softening.

2. ICON SYSTEM

We define exactly three icon contexts.

No additional sizes allowed.

A. Navigation Icons

Usage:

Hamburger

Inbox

Back

Top-level action buttons

Rules:

All navigation icons use identical size

Must have square container

Must have visible border

Must have background color

No rounded corners

Semantic token:
icon.nav

B. Hero / Detail Icons

Usage:

Transport overview header

LineDetail header

Major screen headers

Rules:

Must be larger than navigation icons

Must have square container

Must have border

Must have background

No rounded corners

Semantic token:
icon.hero

C. List Icons

Usage:

List rows

Meta rows

Informational rows

Inline icon + text patterns

Rules:

Must be smaller than navigation icons

No background

No border

No container box

Icon only

Semantic token:
icon.list

Forbidden

No additional icon sizes

No 40 / 44 / 48 / 52 fragmentation

No ad-hoc box sizes

No contextual resizing outside the 3 classes

3. TYPOGRAPHY DENSITY SYSTEM

We define exactly three line-height densities.

No fixed pixel line-height values allowed in components.

A. Tight

Usage:

Meta text

Compact info blocks

Secondary labels

Semantic token:
typography.lineHeight.tight

B. Normal

Usage:

Standard body text

List rows

Descriptions

Semantic token:
typography.lineHeight.normal

C. Roomy

Usage:

Long-form text

StaticPage content

Editorial blocks

Semantic token:
typography.lineHeight.roomy

Forbidden

No fixed 18px / 20px / 22px / 24px line-heights in components

No screen-specific line-height overrides

No ad-hoc text spacing adjustments

4. SYSTEM PRINCIPLES

Every visual element must map to a semantic class.

No pixel-based decisions outside skin.

No contextual resizing unless defined in this charter.

No “temporary” visual exceptions.

Consistency over micro-optimisation.

5. MIGRATION STRATEGY (NOT YET IMPLEMENTED)

Phase 1:

Remove all non-zero border radius values.

Phase 2:

Migrate icon system to 3 semantic classes.

Phase 3:

Replace fixed line-heights with density tokens.

No structural refactors until each phase is visually QA’d.

END OF CHARTER