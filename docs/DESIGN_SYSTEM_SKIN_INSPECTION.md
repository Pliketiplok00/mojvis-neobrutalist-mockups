# MOJ VIS — DESIGN SYSTEM & SKIN INSPECTION (CURRENT STATE)

**Inspection Date:** 2026-01-10
**Inspector:** Claude Code
**Scope:** `mobile/src/` codebase only (ignoring legacy docs)

---

## 1. SKIN MODE STATUS (CRITICAL)

### Is the application currently using a SKIN / THEME based design system?

**YES** — but with severe adoption issues.

### Where is the skin/theme system implemented?

| File | Purpose |
|------|---------|
| `mobile/src/ui/skin.ts` | Barrel export (re-exports skin.neobrut2) |
| `mobile/src/ui/skin.neobrut2.ts` | Active skin definition with all tokens |

### What is considered a "skin" in the current architecture?

A **skin** is a typed object (`Skin`) containing:

```typescript
{
  colors: { /* 30+ semantic color tokens */ },
  spacing: { xs, sm, md, lg, xl, xxl, xxxl },
  borders: { widthThin, widthCard, radiusSmall, radiusMedium, radiusLarge },
  shadows: { none, card },
  typography: { fontFamily, fontSize, fontWeight, lineHeight },
  components: { screen, section, card, button, listRow, badge, tab },
  externalShadowLayer: { offset, color }
}
```

### Is skinning currently functional?

**PARTIALLY** — The skin system is well-designed but **severely under-adopted**.

| Metric | Value |
|--------|-------|
| Hardcoded hex colors in codebase | **382 occurrences** in 24 files |
| Skin token usages | **71 occurrences** in 5 files |
| Screens using skin tokens | **2 of 22** (HomeScreen, InboxListScreen) |
| UI primitives using skin tokens | **8 of 8** (fully compliant) |
| Components using skin tokens | **0 of 4** (GlobalHeader, MenuOverlay, Banner, DepartureItem) |

**Conclusion:** Skin mode exists but is **incomplete**. The UI primitives layer respects skin isolation. The screen and component layers largely ignore it.

---

## 2. CURRENT DESIGN SYSTEM BOUNDARIES

### Aspects controlled globally (via skin tokens)

| Aspect | Token Location | Status |
|--------|---------------|--------|
| **Colors (semantic)** | `skin.colors.*` | Defined (30+ tokens) |
| **Colors (palette)** | Internal `palette` object | Not exposed |
| **Typography sizes** | `skin.typography.fontSize.*` | Defined (xs–xxxl) |
| **Typography weights** | `skin.typography.fontWeight.*` | Defined (regular–bold) |
| **Font families** | `skin.typography.fontFamily.*` | Placeholder (undefined = system) |
| **Spacing scale** | `skin.spacing.*` | Defined (xs–xxxl) |
| **Border widths** | `skin.borders.width*` | Defined (thin, card) |
| **Border radii** | `skin.borders.radius*` | Defined (small, medium, large) |
| **Shadows** | `skin.shadows.*` | Defined (none, card) |
| **Component tokens** | `skin.components.*` | Defined (screen, section, card, button, listRow, badge, tab) |

### Aspects NOT controlled by skin (hardcoded)

| Location | Violation Type | Example |
|----------|---------------|---------|
| `GlobalHeader.tsx` | All colors hardcoded | `#FFFFFF`, `#E0E0E0`, `#000000`, `#FF0000` |
| `MenuOverlay.tsx` | All colors hardcoded | `#FFFFFF`, `#E0E0E0`, `#000000`, `#666666`, `#999999`, `#F0F0F0` |
| `Banner.tsx` | Status colors hardcoded | `#FFF3CD`, `#FFC107`, `#DC3545`, etc. |
| `DepartureItem.tsx` | All colors hardcoded | `#FFFFFF`, `#000000`, `#666666`, etc. |
| `SettingsScreen.tsx` | All colors hardcoded | `#F5F5F5`, `#FFFFFF`, `#000000`, `#666666`, `#10B981`, etc. |
| `EventsScreen.tsx` | All colors hardcoded | 24 hex values |
| `EventDetailScreen.tsx` | All colors hardcoded | 18 hex values |
| `StaticPageScreen.tsx` | All colors hardcoded | 42 hex values |
| All transport screens | All colors hardcoded | ~85 hex values combined |
| All feedback screens | All colors hardcoded | ~48 hex values combined |
| All click-fix screens | All colors hardcoded | ~69 hex values combined |
| All onboarding screens | All colors hardcoded | ~26 hex values combined |

### Icon style

**Not governed by skin.** Icons are:
- Emoji-based text (`☰`, `📥`, etc.) in GlobalHeader
- Emoji strings in MenuOverlay items
- No icon library or skin token for icons

---

## 3. DESIGN SURFACE INVENTORY (FROM CODE)

### Global Components

| Component | File | Skin-Driven | Fixed/Hardcoded |
|-----------|------|-------------|-----------------|
| **GlobalHeader** | `components/GlobalHeader.tsx` | None | Height (56), padding (16), all colors (#FFFFFF, #E0E0E0, #000000, #FF0000), font sizes, badge radius |
| **MenuOverlay** | `components/MenuOverlay.tsx` | None | Width (75% screen), all colors, padding, spacing, font sizes, shadow |
| **Banner** | `components/Banner.tsx` | None | All status colors (warning, urgent), text colors, padding, font sizes |
| **DepartureItem** | `components/DepartureItem.tsx` | None | All colors, border widths, padding, spacing, font sizes |

### UI Primitives (Skin-Compliant)

| Primitive | File | Skin-Driven | Fixed |
|-----------|------|-------------|-------|
| **Screen** | `ui/Screen.tsx` | backgroundColor, padding | flex structure |
| **Card** | `ui/Card.tsx` | backgroundColor, borderWidth, borderColor, borderRadius, padding | none |
| **Button** | `ui/Button.tsx` | backgroundColor, textColor, borderWidth, borderRadius, fontSize, fontWeight, padding | opacity (0.5 disabled) |
| **Badge** | `ui/Badge.tsx` | variant colors, padding, borderRadius, fontSize, fontWeight | textTransform (uppercase) |
| **ListRow** | `ui/ListRow.tsx` | padding, borderWidth, borderColor, chevronColor, chevronSize, highlighted bg | flex layout |
| **Section** | `ui/Section.tsx` | marginBottom, fontSize, fontWeight, color | none |
| **Text** (H1, H2, Label, Body, Meta, ButtonText) | `ui/Text.tsx` | All typography tokens | none |
| **Header** | `ui/Header.tsx` | None (delegates to GlobalHeader) | N/A |

### Screen-level Components

| Screen | File | Uses Skin | Hardcoded Values | Verdict |
|--------|------|-----------|------------------|---------|
| **HomeScreen** | `screens/home/HomeScreen.tsx` | YES (15 usages) | None | **COMPLIANT** |
| **InboxListScreen** | `screens/inbox/InboxListScreen.tsx` | YES (42 usages) | None | **COMPLIANT** |
| **InboxDetailScreen** | `screens/inbox/InboxDetailScreen.tsx` | NO | 13 hex colors | VIOLATES |
| **EventsScreen** | `screens/events/EventsScreen.tsx` | NO | 24 hex colors | VIOLATES |
| **EventDetailScreen** | `screens/events/EventDetailScreen.tsx` | NO | 18 hex colors | VIOLATES |
| **TransportHubScreen** | `screens/transport/TransportHubScreen.tsx` | NO | 8 hex colors | VIOLATES |
| **RoadTransportScreen** | `screens/transport/RoadTransportScreen.tsx` | NO | 24 hex colors | VIOLATES |
| **SeaTransportScreen** | `screens/transport/SeaTransportScreen.tsx` | NO | 24 hex colors | VIOLATES |
| **LineDetailScreen** | `screens/transport/LineDetailScreen.tsx` | NO | 29 hex colors | VIOLATES |
| **StaticPageScreen** | `screens/pages/StaticPageScreen.tsx` | NO | 42 hex colors | VIOLATES |
| **FeedbackFormScreen** | `screens/feedback/FeedbackFormScreen.tsx` | NO | 18 hex colors | VIOLATES |
| **FeedbackDetailScreen** | `screens/feedback/FeedbackDetailScreen.tsx` | NO | 20 hex colors | VIOLATES |
| **FeedbackConfirmationScreen** | `screens/feedback/FeedbackConfirmationScreen.tsx` | NO | 10 hex colors | VIOLATES |
| **ClickFixFormScreen** | `screens/click-fix/ClickFixFormScreen.tsx` | NO | 33 hex colors | VIOLATES |
| **ClickFixDetailScreen** | `screens/click-fix/ClickFixDetailScreen.tsx` | NO | 26 hex colors | VIOLATES |
| **ClickFixConfirmationScreen** | `screens/click-fix/ClickFixConfirmationScreen.tsx` | NO | 10 hex colors | VIOLATES |
| **SettingsScreen** | `screens/settings/SettingsScreen.tsx` | NO | 17 hex colors | VIOLATES |
| **LanguageSelectionScreen** | `screens/onboarding/LanguageSelectionScreen.tsx` | NO | 6 hex colors | VIOLATES |
| **UserModeSelectionScreen** | `screens/onboarding/UserModeSelectionScreen.tsx` | NO | 10 hex colors | VIOLATES |
| **MunicipalitySelectionScreen** | `screens/onboarding/MunicipalitySelectionScreen.tsx` | NO | 10 hex colors | VIOLATES |

---

## 4. SKIN CONTRACT (SKIN MODE = YES, PARTIAL)

### 4.1 What a designer IS ALLOWED to change

Designers may modify the following tokens in `skin.neobrut2.ts`:

**Color Palette**
| Token | Current Value | Purpose |
|-------|---------------|---------|
| `palette.background` | `hsl(45, 28, 93)` | App background |
| `palette.foreground` | `hsl(220, 18, 10)` | Primary text, borders |
| `palette.surface` | `hsl(45, 22, 97)` | Card backgrounds |
| `palette.surfaceAlt` | `hsl(45, 14, 88)` | Muted panels |
| `palette.mutedText` | `hsl(220, 10, 34)` | Secondary text |
| `palette.primary` | `hsl(210, 85, 40)` | Primary actions |
| `palette.secondary` | `hsl(155, 45, 34)` | Success/olive |
| `palette.accent` | `hsl(42, 95, 55)` | Highlight/warning |
| `palette.destructive` | `hsl(12, 62, 48)` | Error/urgent |

**Spacing Scale**
| Token | Current Value |
|-------|---------------|
| `spacing.xs` | 4 |
| `spacing.sm` | 8 |
| `spacing.md` | 12 |
| `spacing.lg` | 16 |
| `spacing.xl` | 20 |
| `spacing.xxl` | 24 |
| `spacing.xxxl` | 32 |

**Typography Scale**
| Token | Current Value |
|-------|---------------|
| `typography.fontSize.xs` | 10 |
| `typography.fontSize.sm` | 12 |
| `typography.fontSize.md` | 14 |
| `typography.fontSize.lg` | 16 |
| `typography.fontSize.xl` | 18 |
| `typography.fontSize.xxl` | 24 |
| `typography.fontSize.xxxl` | 28 |

**Border Tokens**
| Token | Current Value |
|-------|---------------|
| `borders.widthThin` | 2 |
| `borders.widthCard` | 3 |
| `borders.widthHeavy` | 4 |
| `borders.radiusSharp` | 0 |
| `borders.radiusSoft` | 4 |

**Shadow Offset**
| Token | Current Value |
|-------|---------------|
| `externalShadowLayer.offset` | 4 |

### 4.2 What a designer MUST NOT change

| Aspect | Reason |
|--------|--------|
| Token names/keys | Breaking change to all consumers |
| Token structure | TypeScript type contract |
| Component behavior | Not a design concern |
| Layout hierarchy | Coded in component JSX |
| Navigation structure | Coded in navigator |
| State management | Logic concern |
| Platform-specific logic | iOS/Android differences |

### 4.3 REQUIRED DESIGN DELIVERABLES

To safely create a new skin, designers must provide:

**1. Color Token Table (Required)**
```
| Token Key | Hex/HSL Value | Usage Description |
|-----------|---------------|-------------------|
| palette.background | #XXXXXX | ... |
| palette.foreground | #XXXXXX | ... |
| ... (all palette values) |
```

**2. Semantic Color Mapping (Required)**
```
| Semantic Token | Maps To | Example UI Element |
|----------------|---------|-------------------|
| colors.textPrimary | palette.foreground | Headings, labels |
| colors.errorText | palette.destructive | Error messages |
| ... |
```

**3. Typography Scale (Required if changing)**
```
| Size Token | Value (px) | Usage |
|------------|------------|-------|
| fontSize.xs | 10 | Badges |
| fontSize.sm | 12 | Meta text |
| ... |
```

**4. Spacing Scale (Required if changing)**
```
| Token | Value (px) |
|-------|------------|
| xs | 4 |
| sm | 8 |
| ... |
```

**5. Border/Radius Spec (Required if changing)**
```
| Token | Value | Notes |
|-------|-------|-------|
| widthThin | 2 | List separators |
| widthCard | 3 | Card borders |
| radiusSoft | 4 | Badge corners |
```

**6. Component State Definitions (Optional)**
Specify any variant-specific overrides:
- Button: primary/secondary background + text colors
- Badge: urgent/info/success/warning/pending/type/default colors
- Card: default/outlined/filled backgrounds

---

## 5. VIOLATIONS & RISKS

### Critical Violations (Blocks Multi-Skin Support)

| Component/Screen | Issue | Hex Count |
|------------------|-------|-----------|
| `GlobalHeader.tsx` | All styling hardcoded, not using skin | 5 |
| `MenuOverlay.tsx` | All styling hardcoded, not using skin | 8 |
| `Banner.tsx` | Status colors hardcoded | 10 |
| `DepartureItem.tsx` | All styling hardcoded | 14 |
| 20 of 22 screens | Full stylesheet hardcoded | 350+ |

### Specific Hardcoded Values That Must Be Migrated

| Value | Occurrences | Should Map To |
|-------|-------------|---------------|
| `#FFFFFF` | ~50 | `skin.colors.backgroundTertiary` or `surface` |
| `#000000` | ~60 | `skin.colors.textPrimary` or `border` |
| `#666666` | ~30 | `skin.colors.textSecondary` |
| `#F5F5F5` | ~15 | `skin.colors.background` |
| `#E0E0E0` | ~10 | `skin.colors.borderLight` |

### Risks for Multi-Skin Support

1. **GlobalHeader is skin-blind** — The header appears on every screen but ignores all skin tokens. A new skin would have mismatched header colors.

2. **MenuOverlay is skin-blind** — The navigation menu ignores skin tokens. Theme switching would show inconsistent menu styling.

3. **Status colors in Banner are duplicated** — Warning/urgent colors in Banner don't reference the existing `skin.colors.warning*` or `skin.colors.urgent*` tokens.

4. **Screens don't use UI primitives** — Most screens implement custom cards, buttons, and lists instead of using the skin-compliant primitives (`Card`, `Button`, `ListRow`).

5. **No runtime theme switching** — The skin is statically imported. Dynamic theme changes would require app restart or context-based theming infrastructure.

6. **Icon styling is uncontrolled** — Emoji icons cannot be themed. A proper icon system (SVG/font icons with color props) would be needed for full skin support.

### Adoption Gap Summary

```
UI Primitives:     ████████████████████ 100% skin-compliant
Global Components: ░░░░░░░░░░░░░░░░░░░░   0% skin-compliant
Screens:           ██░░░░░░░░░░░░░░░░░░   9% skin-compliant (2/22)
Overall:           ██░░░░░░░░░░░░░░░░░░  ~15% skin adoption
```

---

## Summary

The MOJ VIS mobile app has a **well-designed skin system** that is **severely under-adopted**. The UI primitive layer (`mobile/src/ui/`) correctly implements skin isolation with typed tokens. However, **91% of screens** and **100% of global components** bypass the skin system entirely with hardcoded hex colors.

**To achieve multi-skin support, the following must happen:**
1. Migrate `GlobalHeader.tsx` to use skin tokens
2. Migrate `MenuOverlay.tsx` to use skin tokens
3. Migrate `Banner.tsx` to use skin tokens
4. Migrate `DepartureItem.tsx` to use skin tokens
5. Refactor all 20 non-compliant screens to use either:
   - Direct skin token references, OR
   - The existing UI primitives (`Card`, `Button`, `ListRow`, `Badge`, etc.)

Until then, changing the skin will result in a **visually fragmented** application where only HomeScreen and InboxListScreen reflect the new theme.
