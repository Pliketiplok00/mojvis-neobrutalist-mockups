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

// Mediterranean Neobrut palette (more visible than "almost white")
const palette = {
  // Paper/sand background — clearly not pure white
  background: hsl(45, 28, 93),
  foreground: hsl(220, 18, 10), // ink black

  // Surfaces
  surface: hsl(45, 22, 97), // cards
  surfaceAlt: hsl(45, 14, 88), // muted panels / sections

  // Text
  mutedText: hsl(220, 10, 34),

  // Accents (Mediterranean)
  primary: hsl(210, 85, 40), // deep sea blue
  secondary: hsl(155, 45, 34), // olive
  accent: hsl(42, 95, 55), // sun yellow

  destructive: hsl(12, 62, 48), // terracotta

  // UI extras
  chevron: hsl(220, 10, 50),
  typeBadge: hsl(270, 40, 52),
  unreadIndicator: hsl(210, 85, 40),

  // Link color
  link: hsl(210, 85, 40), // same as primary for consistency
};

const borders = {
  color: palette.foreground,
  widthThin: 2,
  widthCard: 3,
  widthHeavy: 4,
  radiusSharp: 0,
  radiusSoft: 4, // keep tiny rounding for small elements (badges)
  radiusCard: 8, // standard card/container radius
  radiusPill: 9999, // fully rounded (pill shape for badges, buttons)
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
  warningBackground: hsla(42, 95, 55, 0.22),
  warningText: palette.foreground,
  warningAccent: palette.accent, // Border/indicator for warning state

  // Status - Info (sea)
  infoBackground: hsla(210, 85, 40, 0.14),
  infoText: palette.primary,

  // Status - Pending (warm orange-ish)
  pendingBackground: hsla(25, 85, 55, 0.16),
  pendingText: hsl(25, 85, 40),

  // Special
  unreadIndicator: palette.unreadIndicator,
  typeBadge: palette.typeBadge,
  chevron: palette.chevron,

  // Optional overlay
  overlay: hsla(220, 18, 10, 0.6),

  // Test watermark (if still present somewhere)
  testWatermarkBg: borders.color,
  testWatermarkText: "white",
} as const;

// ---- Borders ----
export const bordersToken = {
  widthThin: borders.widthThin,
  widthCard: borders.widthCard,
  widthHeavy: borders.widthHeavy,
  radiusSmall: borders.radiusSoft,
  radiusMedium: borders.radiusSharp,
  radiusLarge: borders.radiusSharp,
  radiusCard: borders.radiusCard,
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
      borderWidth: 0,
      borderColor: "transparent",
    },
    secondary: {
      backgroundColor: colors.background,
      textColor: colors.textPrimary,
      borderWidth: bordersToken.widthCard,
      borderColor: colors.border,
    },
    borderRadius: bordersToken.radiusMedium,
    paddingVertical: spacing.lg,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
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
    borderRadius: bordersToken.radiusSmall,
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
} as const;

// ---- Final skin object ----
export const skinNeobrut2 = {
  colors,
  spacing,
  borders: bordersToken,
  shadows,
  typography,
  icons,
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
