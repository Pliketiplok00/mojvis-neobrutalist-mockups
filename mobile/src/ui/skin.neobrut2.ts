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
  ios: Omit<ShadowStyle, 'elevation'>;
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
  Platform.OS === 'ios'
    ? token.ios
    : { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, ...token.android };

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
