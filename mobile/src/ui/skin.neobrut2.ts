// mobile/src/ui/skin.neobrut2.ts
import { Platform } from "react-native";
import { FontFamilies } from "./fonts";

type ShadowStyle = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation?: number;
};

type ShadowToken = {
  ios: Omit<ShadowStyle, "elevation">;
  android: { elevation: number };
};

const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;
const hsla = (h: number, s: number, l: number, a: number) =>
  `hsla(${h} ${s}% ${l}% / ${a})`;

// Mediterranean Neobrut palette - ALIGNED TO V1 DESIGN SYSTEM
const palette = {
  // Core Background & Foreground (from V1 design system)
  background: hsl(45, 30, 96), // Warm cream/sand
  foreground: hsl(220, 20, 10), // Near-black

  // Surfaces
  surface: hsl(45, 25, 98), // cards (--card)
  surfaceAlt: hsl(45, 15, 90), // muted panels / sections (--muted)

  // Text
  mutedText: hsl(220, 10, 40), // --muted-foreground

  // Primary - Mediterranean Blue
  primary: hsl(210, 80, 45),
  // Secondary - Olive Green
  secondary: hsl(160, 45, 38),
  // Accent - Sun Yellow
  accent: hsl(45, 92, 55),
  // Destructive - Terracotta Red
  destructive: hsl(12, 55, 50),

  // Extended Mediterranean Palette
  lavender: hsl(270, 35, 70), // Feedback section
  amber: hsl(35, 83, 61), // Banner fill - #eeab4b
  orange: hsl(25, 85, 55), // Click-Fix section
  teal: hsl(180, 45, 42), // Catamaran transport
  pink: hsl(350, 50, 65), // Decorative accents

  // UI extras
  chevron: hsl(220, 10, 50),
  typeBadge: hsl(270, 40, 52),
  unreadIndicator: hsl(210, 80, 45), // matches primary

  // Link color
  link: hsl(210, 80, 45), // same as primary for consistency
};

const borders = {
  color: palette.foreground,
  widthHairline: 1,
  widthThin: 2,
  widthCard: 3,
  widthHeavy: 4,
  radiusSharp: 0, // neobrutalist: sharp corners everywhere
  radiusSoft: 4, // small elements (badges) - per design system --radius-soft
  radiusCard: 0, // cards/containers: sharp corners (neobrutalist principle)
  radiusPill: 9999, // fully rounded (pill shape)
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

const typography = {
  fontFamily: {
    // Display font (Space Grotesk) - for headings
    display: {
      regular: FontFamilies.spaceGroteskRegular,
      medium: FontFamilies.spaceGroteskMedium,
      semiBold: FontFamilies.spaceGroteskSemiBold,
      bold: FontFamilies.spaceGroteskBold,
    },
    // Body font (Space Mono) - for UI text
    body: {
      regular: FontFamilies.spaceMonoRegular,
      bold: FontFamilies.spaceMonoBold,
    },
    // Legacy aliases (maps to body for backwards compatibility)
    regular: FontFamilies.spaceMonoRegular,
    medium: FontFamilies.spaceMonoRegular, // Space Mono has no medium, use regular
    semiBold: FontFamilies.spaceMonoBold, // Space Mono has no semiBold, use bold
    bold: FontFamilies.spaceMonoBold,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 28,
  },
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// Icon tokens for lucide-react-native
const icons = {
  size: {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 40,
  },
  strokeWidth: {
    light: 1.5,
    regular: 2,
    strong: 2.5,
  },
} as const;

// Size tokens for specific UI elements
const sizes = {
  calendarEventIndicator: 8, // Small square indicator for days with events
  calendarDayMinHeight: 40, // Minimum height for calendar day tiles
} as const;

const hardShadow = (offset: number, color: string = borders.color): ShadowToken => ({
  ios: {
    shadowColor: color,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: offset, height: offset },
  },
  android: {
    // Android approximation
    elevation: Math.max(1, Math.round(offset * 1.5)),
  },
});

const platformShadow = (token: ShadowToken): ShadowStyle | Record<string, never> =>
  Platform.OS === "ios"
    ? token.ios
    : {
        shadowColor: "transparent",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        ...token.android,
      };

// ---- Colors (include aliases expected by existing primitives/screens) ----
export const colors = {
  // Backgrounds
  background: palette.background,
  backgroundSecondary: palette.surfaceAlt,
  backgroundTertiary: palette.surface,
  backgroundUnread: hsla(42, 95, 55, 0.18), // accent tint

  // Text
  textPrimary: palette.foreground,
  textSecondary: palette.mutedText,
  textMuted: palette.mutedText,
  textDisabled: hsla(220, 10, 34, 0.55),

  // Borders
  border: borders.color,
  borderLight: hsla(220, 18, 10, 0.12),
  borderMuted: hsla(220, 10, 50, 0.35), // Subtle connector lines, timelines

  // Interactive
  primary: palette.primary,
  primaryText: "white",
  primaryTextMuted: hsla(0, 0, 100, 0.85), // White at 85% opacity for subtitles on colored surfaces

  // Links
  link: palette.link,

  // Status - Success (olive)
  successBackground: hsla(155, 45, 34, 0.15),
  successText: palette.secondary,
  successAccent: palette.secondary,

  // Status - Error / Urgent (terracotta)
  errorBackground: hsla(12, 62, 48, 0.14),
  errorText: palette.destructive,
  urgent: palette.destructive,
  urgentText: "white",

  // Status - Warning (sun)
  warningBackground: hsl(35, 83, 61), // #eeab4b
  warningText: palette.foreground,
  warningAccent: palette.accent, // Border/indicator for warning state

  // Status - Info (sea)
  infoBackground: hsla(210, 85, 40, 0.14),
  infoText: palette.primary,

  // Input focus state
  focusOutline: palette.primary,

  // Status - Pending (warm orange-ish)
  pendingBackground: hsla(25, 85, 55, 0.16),
  pendingText: hsl(25, 85, 40),

  // Special
  unreadIndicator: palette.unreadIndicator,
  typeBadge: palette.typeBadge,
  chevron: palette.chevron,

  // Calendar day tile states (V1 poster parity)
  calendarToday: palette.accent, // Yellow fill for today
  calendarSelected: palette.primary, // Blue fill for selected
  calendarHasEvents: hsla(160, 45, 38, 0.35), // Green-ish tint for days with events (visible)
  calendarEventIndicator: palette.primary, // Blue square indicator

  // Extended Mediterranean (feature-specific)
  lavender: palette.lavender, // Feedback section
  amber: palette.amber, // Banner fill (midpoint yellow-orange)
  orange: palette.orange, // Click-Fix section
  teal: palette.teal, // Catamaran transport
  pink: palette.pink, // Decorative accents

  // Optional overlay
  overlay: hsla(220, 20, 10, 0.6),

  // Test watermark (if still present somewhere)
  testWatermarkBg: borders.color,
  testWatermarkText: "white",
} as const;

// ---- Borders ----
export const bordersToken = {
  widthHairline: borders.widthHairline,
  widthThin: borders.widthThin,
  widthCard: borders.widthCard,
  widthHeavy: borders.widthHeavy,
  radiusSharp: borders.radiusSharp, // neobrutalist: 0
  radiusSmall: borders.radiusSoft,
  radiusMedium: borders.radiusSharp,
  radiusLarge: borders.radiusSharp, // neobrutalist: 0
  radiusCard: borders.radiusCard, // neobrutalist: 0
  radiusPill: borders.radiusPill,
} as const;

// ---- Shadows ----
export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    ...platformShadow(hardShadow(4)),
  },
  // Soft shadow for floating panels (menu, modals, dropdowns)
  soft: {
    shadowColor: borders.color,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
} as const;

// ---- Component tokens (match existing usage pattern) ----
export const components = {
  header: {
    height: 64, // design system: h-16 = 64px
    borderBottomWidth: bordersToken.widthHeavy, // design system: border-b-4
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    // Inbox badge (unread indicator)
    inboxBadge: {
      backgroundColor: palette.destructive, // Terracotta red for urgency
      borderWidth: bordersToken.widthHairline,
      borderColor: colors.border,
      textColor: colors.primaryText,
      minSize: 20,
      offsetTop: -6,
      offsetRight: -6,
      paddingHorizontal: spacing.xs,
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.body.bold,
    },
  },

  screen: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  section: {
    marginBottom: spacing.xxl,
    titleFontSize: typography.fontSize.xl,
    titleFontWeight: typography.fontWeight.semiBold,
    titleColor: colors.textPrimary,
    titleMarginBottom: spacing.md,
    subtitleFontSize: typography.fontSize.lg,
    subtitleColor: colors.textMuted,
  },

  card: {
    backgroundColor: colors.backgroundTertiary,
    borderWidth: bordersToken.widthCard,
    borderColor: colors.border,
    borderRadius: bordersToken.radiusLarge,
    padding: spacing.xl,
  },

  button: {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors.primaryText,
      borderWidth: bordersToken.widthThin, // design system: border-2 border-foreground
      borderColor: colors.border,
    },
    secondary: {
      backgroundColor: colors.background,
      textColor: colors.textPrimary,
      borderWidth: bordersToken.widthCard,
      borderColor: colors.border,
    },
    danger: {
      backgroundColor: colors.errorBackground,
      textColor: colors.errorText,
      borderWidth: bordersToken.widthThin,
      borderColor: colors.urgent,
    },
    borderRadius: bordersToken.radiusMedium,
    paddingVertical: spacing.lg,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    disabledOpacity: 0.5,
  },

  listRow: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: bordersToken.widthThin,
    borderBottomColor: colors.borderLight,
    chevronColor: colors.chevron,
    chevronSize: 24,
  },

  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: bordersToken.radiusSharp, // neobrutalist: sharp corners
    borderWidth: bordersToken.widthThin, // design system: border-2 border-foreground
    borderColor: colors.border,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },

  tab: {
    paddingVertical: 14,
    fontSize: typography.fontSize.lg,
    inactiveColor: colors.textMuted,
    activeColor: colors.textPrimary,
    activeWeight: typography.fontWeight.semiBold,
    borderBottomWidth: bordersToken.widthCard,
    borderBottomColor: colors.border,
  },

  input: {
    backgroundColor: colors.background,
    borderWidth: bordersToken.widthThin,
    borderColor: colors.border,
    borderColorFocus: colors.focusOutline,
    borderColorError: colors.errorText,
    borderRadius: bordersToken.radiusCard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.lg,
    textColor: colors.textPrimary,
    placeholderColor: colors.textDisabled,
    disabledOpacity: 0.5,
  },

  // Calendar component tokens (V1 poster style)
  calendar: {
    // Container background (transparent - matches screen background per V1 mockup)
    containerBackground: "transparent",
    // Day tile outline - for colored tiles (has-events, today, selected)
    dayTileBorderWidth: bordersToken.widthThin,
    dayTileBorderColor: colors.border,
    // Legacy aliases (same as dayTile*)
    hasEventsBorderWidth: bordersToken.widthThin,
    hasEventsBorderColor: colors.border,
    // Grid spacing (gutters between tiles)
    dayTileGap: spacing.xs,
    dayTileGapY: spacing.sm, // Vertical row spacing (slightly larger than horizontal)
    dayTilePadding: spacing.xs,
    // Event indicator spacing
    eventIndicatorMarginTop: spacing.xs,
    // Selected day offset shadow (neobrut double-layer) - ONLY for selected
    selectedShadowOffsetX: 3,
    selectedShadowOffsetY: 3,
    selectedShadowColor: colors.border,
    // Typography
    weekdayFontWeight: typography.fontWeight.bold,
    dayNumberFontWeight: typography.fontWeight.bold,
    dayNumberColor: colors.textPrimary,
    selectedDayNumberColor: colors.primaryText, // white
  },

  // Events screen component tokens
  events: {
    // Empty state (dotted outline box per V1 mockup)
    emptyStateBorderWidth: bordersToken.widthThin,
    emptyStateBorderColor: colors.borderMuted,
    emptyStateBorderStyle: "dotted" as const,
    emptyStateBackground: "transparent",
    emptyStatePadding: spacing.xxl,
    emptyStateBorderRadius: bordersToken.radiusSharp,

    // Event list card (clickable poster box)
    card: {
      // Border styling (matches canonical clickable box)
      borderWidth: bordersToken.widthCard,
      borderColor: colors.border,
      borderRadius: bordersToken.radiusSharp,
      background: colors.background,
      padding: spacing.md,
      marginBottom: spacing.md,
      // Dual-layer offset shadow (poster style)
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      shadowColor: colors.border,
    },

    // Event Detail screen tokens (V1 poster style)
    detail: {
      // Hero image (optional)
      heroImageAspectRatio: 16 / 9, // Standard hero ratio
      heroImageBorderWidth: bordersToken.widthCard,
      heroImageBorderColor: colors.border,

      // Title header section (poster band - YELLOW slab)
      titlePadding: spacing.xl,
      titleBorderWidth: bordersToken.widthCard, // Heavy poster-style rule
      titleBorderColor: colors.border,
      titleBackground: palette.accent, // Yellow slab background

      // Info tile tokens (icon tile row with square icon box)
      infoTileIconBoxSize: 44, // Square icon box size
      infoTileIconBoxBackground: colors.background,
      infoTileIconBoxBorderWidth: bordersToken.widthThin,
      infoTileIconBoxBorderColor: colors.border,
      infoTileGap: spacing.md, // Gap between icon box and text
      infoTilePadding: spacing.lg, // Row padding

      // Info sections (Time/Location/Description)
      infoSectionPadding: spacing.lg,
      infoSectionDividerWidth: bordersToken.widthThin, // Poster-style separator
      infoSectionDividerColor: colors.border,
      infoLabelMarginBottom: spacing.xs,

      // CTA dual-layer shadow (neobrut offset shadow)
      ctaShadowOffsetX: 4,
      ctaShadowOffsetY: 4,
      ctaShadowColor: colors.border,

      // Reminder CTA card
      reminderCardPadding: spacing.lg,
      reminderCardBorderWidth: bordersToken.widthCard, // Strong CTA border
      reminderCardBorderColor: colors.border,
      reminderCardBackground: colors.background, // Clean, not grey panel
      reminderCardRadius: bordersToken.radiusSharp, // Sharp corners (poster)

      // Tokenized hardcoded values
      secondaryValueMarginTop: spacing.xs, // Was: 2
      reminderHintMarginTop: spacing.xs, // Was: 2
      descriptionLineHeight: 22, // Keep same value, now tokenized
    },
  },

  // Transport Hub screen component tokens (V1 poster style)
  transport: {
    // Banner container - full-bleed (edge-to-edge)
    bannerContainerPaddingHorizontal: 0,
    bannerContainerPaddingTop: 0,

    // Transport type tiles (poster slab style)
    tiles: {
      // Tile container
      tileBorderWidth: bordersToken.widthCard,
      tileBorderColor: colors.border,
      tileRadius: bordersToken.radiusSharp, // Sharp corners (poster)
      tileGap: spacing.md, // Vertical spacing between tiles

      // Tile backgrounds (semantic colors)
      tileSeaBackground: palette.primary, // Blue for sea
      tileRoadBackground: palette.secondary, // Green for road

      // Poster slab shadow (dual-layer offset)
      tileShadowOffsetX: 4,
      tileShadowOffsetY: 4,
      tileShadowColor: colors.border,

      // Left icon slab (full height section)
      tileIconSlabWidth: 64,
      tileIconSlabPadding: spacing.md,

      // Vertical divider between icon slab and content
      tileDividerWidth: bordersToken.widthThin,
      tileDividerColor: colors.border,

      // Content slab (right section with text)
      tileContentPadding: spacing.md,

      // Text styling
      tileTitleColor: colors.primaryText, // White text on colored bg
      tileTitleFontSize: typography.fontSize.xl, // 18px - stronger title
      tileTitleFontFamily: typography.fontFamily.body.bold, // Bold weight
      tileSubtitleColor: colors.primaryTextMuted, // White at 85% opacity

      // Icon on colored surface
      tileIconColor: colors.primaryText, // White icon

      // Chevron affordance (muted on colored surface)
      tileChevronColor: colors.primaryTextMuted,
      tileChevronPaddingRight: spacing.md,
    },

    // Bottom note info box
    note: {
      noteBorderWidth: bordersToken.widthThin,
      noteBorderColor: colors.border,
      noteBackground: colors.background,
      notePadding: spacing.lg,
      noteRadius: bordersToken.radiusSharp, // Sharp corners (poster)
      noteTextColor: colors.textSecondary,
    },

    // Overview header (poster-style header for Sea/Road overview screens)
    overviewHeader: {
      // Full-bleed header slab (edge-to-edge)
      padding: spacing.lg,
      borderBottomWidth: bordersToken.widthHeavy,
      borderBottomColor: colors.border,

      // Backgrounds per transport type
      backgroundSea: palette.primary,
      backgroundRoad: palette.secondary,

      // Icon box (square container for icon)
      iconBoxSize: 48,
      iconBoxBackground: colors.background,
      iconBoxBorderWidth: bordersToken.widthThin,
      iconBoxBorderColor: colors.border,
      iconBoxGap: spacing.md,

      // Text styling (white on colored background)
      titleColor: colors.primaryText,
      subtitleColor: "rgba(255, 255, 255, 0.85)",
    },

    // Section header (poster-style with bottom rule)
    sectionHeader: {
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: bordersToken.widthCard, // Thick poster rule
      borderBottomColor: colors.border,
    },

    // Lines list (poster-style cards)
    list: {
      // Line card outer structure (poster card with 2-part layout)
      lineCardBorderWidth: bordersToken.widthHeavy, // Heavy outline
      lineCardBorderColor: colors.border,
      lineCardRadius: bordersToken.radiusSharp,
      lineCardGap: spacing.md, // Gap between cards

      // Shadow offset for line cards (dual-layer look)
      lineCardShadowOffsetX: 4,
      lineCardShadowOffsetY: 4,
      lineCardShadowColor: colors.border,

      // Pressed state offset (neobrut press-in effect)
      lineCardPressedOffsetX: 2,
      lineCardPressedOffsetY: 2,

      // Line card header slab (colored top section with icon + title)
      lineCardHeaderPadding: spacing.md,
      lineCardHeaderBackgroundSea: palette.primary, // Blue for sea ferry
      lineCardHeaderBackgroundSeaCatamaran: palette.teal, // Teal for catamaran
      lineCardHeaderBackgroundRoad: palette.secondary, // Green for road
      lineCardHeaderIconBoxSize: 40,
      lineCardHeaderIconBoxBackground: colors.background,
      lineCardHeaderIconBoxBorderWidth: bordersToken.widthThin,
      lineCardHeaderIconBoxBorderColor: colors.border,
      lineCardHeaderIconGap: spacing.md,
      lineCardHeaderTitleColor: colors.primaryText, // White on colored bg

      // Line card body (white bottom section with meta + chevron)
      lineCardBodyBackground: colors.background,
      lineCardBodyPadding: spacing.md,
      lineCardBodyBorderTopWidth: bordersToken.widthThin,
      lineCardBodyBorderColor: colors.border,

      // Boxed chevron affordance (square with border)
      lineCardChevronBoxSize: 36,
      lineCardChevronBoxBorderWidth: bordersToken.widthThin,
      lineCardChevronBoxBorderColor: colors.border,
      lineCardChevronBoxBackground: colors.backgroundSecondary,
      lineCardChevronGap: spacing.md,

      // Line card text spacing
      lineCardMetaGap: spacing.xs,

      // Today departures set (single bordered container with stacked rows)
      todaySetBorderWidth: bordersToken.widthCard,
      todaySetBorderColor: colors.border,
      todaySetBackground: colors.backgroundSecondary, // Grey tinted container
      todaySetRadius: bordersToken.radiusSharp,
      todaySetShadowOffsetX: 4,
      todaySetShadowOffsetY: 4,
      todaySetShadowColor: colors.border,

      // Today row (inside the set)
      todayRowBackground: colors.backgroundSecondary, // Low-fi grey row
      todayRowDividerWidth: bordersToken.widthThin,
      todayRowDividerColor: colors.border,
      todayRowPadding: spacing.md,
      todayRowPressedOffsetX: 1, // Subtle press-in for rows
      todayRowPressedOffsetY: 1,

      // Time block in today row - MATCHES LineDetail time block
      todayTimeBlockWidth: 72, // Same as lineDetail.timeBlockWidth
      todayTimeBlockPadding: spacing.sm, // Same as lineDetail.timeBlockPadding
      todayTimeBlockBackgroundSea: palette.primary, // Blue - same as lineDetail
      todayTimeBlockBackgroundRoad: palette.secondary, // Green - same as lineDetail
      todayTimeBlockBorderWidth: bordersToken.widthThin,
      todayTimeBlockBorderColor: colors.border,
      todayTimeBlockTextColor: colors.primaryText, // White text
    },

    // Line Detail screen tokens (V1 poster style)
    lineDetail: {
      // Header slab (colored poster band)
      headerBackground: palette.primary, // Blue for sea (override for road: secondary)
      headerBackgroundSea: palette.primary,
      headerBackgroundRoad: palette.secondary,
      headerPadding: spacing.lg,
      headerBorderWidth: bordersToken.widthCard,
      headerBorderColor: colors.border,

      // Header icon box
      headerIconBoxSize: 52,
      headerIconBoxBackground: colors.background,
      headerIconBoxBorderWidth: bordersToken.widthThin,
      headerIconBoxBorderColor: colors.border,

      // Header text
      headerTitleColor: colors.primaryText, // White on colored bg
      headerMetaColor: "rgba(255, 255, 255, 0.85)",

      // Date selector card (YELLOW poster button per mockup)
      dateSelectorPadding: spacing.lg,
      dateSelectorBorderWidth: bordersToken.widthCard,
      dateSelectorBorderColor: colors.border,
      dateSelectorBackground: palette.accent, // Yellow per mockup
      dateSelectorRadius: bordersToken.radiusSharp,
      dateSelectorArrowSize: 44,

      // Dual-layer shadow offset
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      shadowColor: colors.border,

      // Direction toggle tabs
      directionTabPadding: spacing.md,
      directionTabBorderWidth: bordersToken.widthCard,
      directionTabBorderColor: colors.border,
      directionTabRadius: bordersToken.radiusSharp,
      directionTabActiveBackground: palette.primary, // Same as header for sea
      directionTabInactiveBackground: colors.background,
      directionTabActiveText: colors.primaryText,
      directionTabInactiveText: colors.textPrimary,

      // Section dividers
      sectionDividerWidth: bordersToken.widthThin,
      sectionDividerColor: colors.border,

      // Departure row (poster card)
      departureRowBorderWidth: bordersToken.widthCard,
      departureRowBorderColor: colors.border,
      departureRowBackground: colors.background,
      departureRowRadius: bordersToken.radiusSharp,
      departureRowPadding: spacing.md,
      departureRowGap: spacing.sm,

      // Time block (colored left block)
      timeBlockWidth: 72,
      timeBlockPadding: spacing.sm,
      timeBlockBorderWidth: bordersToken.widthThin,
      timeBlockBorderColor: colors.border,
      timeBlockBackground: palette.primary, // Sea blue
      timeBlockBackgroundSea: palette.primary,
      timeBlockBackgroundRoad: palette.secondary,
      timeBlockTextColor: colors.primaryText,

      // Timeline (expanded)
      timelineDotSize: 10,
      timelineDotSizeEndpoint: 12,
      timelineDotColor: colors.textMuted,
      timelineDotEndpointColor: colors.textPrimary,
      timelineLineWidth: bordersToken.widthThin,
      timelineLineColor: colors.borderMuted,
      timelineStopTimeWidth: 56,

      // Notes badge
      notesBadgeBackground: colors.warningBackground,
      notesBadgePadding: spacing.sm,

      // Contact card
      contactCardPadding: spacing.lg,
      contactCardBorderWidth: bordersToken.widthCard,
      contactCardBorderColor: colors.border,
      contactCardBackground: colors.background,
      contactCardRadius: bordersToken.radiusSharp,
    },
  },

  // Inbox screen component tokens (V1 banner list style)
  inbox: {
    // Banner-style tabs (stronger typography hierarchy)
    tabs: {
      borderBottomWidth: bordersToken.widthCard,
      borderBottomColor: colors.border,
      // Active tab (filled)
      activeBackground: palette.primary,
      activeTextColor: colors.primaryText,
      activeBorderWidth: bordersToken.widthCard,
      activeBorderColor: colors.border,
      // Inactive tab
      inactiveBackground: colors.background,
      inactiveTextColor: colors.textPrimary,
      inactiveBorderWidth: bordersToken.widthCard,
      inactiveBorderColor: colors.border,
      // Layout
      tabPadding: spacing.md,
      tabGap: spacing.sm,
      iconGap: spacing.sm,
    },

    // List item (poster-style row)
    listItem: {
      // Container
      background: colors.background,
      borderWidth: bordersToken.widthCard,
      borderColor: colors.border,
      borderRadius: bordersToken.radiusSharp,
      padding: spacing.md,
      marginBottom: spacing.md,
      marginHorizontal: spacing.lg,
      // Dual-layer shadow
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      shadowColor: colors.border,
      // Tab label typography (BOLD - must outrank row titles)
      labelFontFamily: typography.fontFamily.body.bold,
      labelFontSize: typography.fontSize.md,
    },

    // Banner list item (full-width, bottom border only, no shadow)
    listItem: {
      // Container - full width banners
      background: colors.background,
      borderBottomWidth: bordersToken.widthCard,
      borderBottomColor: colors.border,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      // Icon slab (left)
      iconSlabSize: 44,
      iconSlabBorderWidth: bordersToken.widthThin,
      iconSlabBorderColor: colors.border,
      iconSlabGap: spacing.md,
      // Icon slab backgrounds by type
      iconSlabBackgroundDefault: colors.backgroundSecondary,
      iconSlabBackgroundUrgent: palette.destructive,
      iconSlabBackgroundTransport: palette.primary,
      iconSlabBackgroundCulture: palette.lavender,
      iconSlabBackgroundGeneral: palette.secondary,
      // Text styling
      titleMarginBottom: spacing.xs,
      snippetMarginBottom: spacing.xs,
      // NEW badge
      newBadgeBackground: palette.primary,
      newBadgeTextColor: colors.primaryText,
      newBadgePadding: spacing.xs,
      newBadgeBorderWidth: bordersToken.widthThin,
      newBadgeBorderColor: colors.border,
      // Chevron box
      chevronBoxSize: 32,
      chevronBoxBackground: colors.backgroundSecondary,
      chevronBoxBorderWidth: bordersToken.widthThin,
      chevronBoxBorderColor: colors.border,
    },
  },
} as const;

// ---- Final skin object ----
export const skinNeobrut2 = {
  colors,
  spacing,
  borders: bordersToken,
  shadows,
  typography,
  icons,
  sizes,
  components,

  // Optional: for future "external shadow layer" (fake neo shadow)
  externalShadowLayer: {
    offset: 4,
    color: colors.border,
  },
} as const;

export type Skin = typeof skinNeobrut2;

/**
 * Test mode flag - set to true to show TEST MODE watermark on all screens.
 * Useful for distinguishing development builds from production.
 */
export const SKIN_TEST_MODE = false;

export default skinNeobrut2;
