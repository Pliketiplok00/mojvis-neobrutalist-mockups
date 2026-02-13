/**
 * Icon Primitive
 *
 * Skin-controlled icon component using lucide-react-native.
 * All icon sizes and stroke widths come from skin tokens.
 *
 * Phase 1: Fonts + Icons Infrastructure
 * Hotfix: Added fallback mechanism with dev warning for unknown icons.
 *
 * Stroke Normalization:
 * Stroke width is now size-aware to maintain consistent visual weight
 * across different icon sizes. Larger icons use thicker strokes to
 * preserve the same apparent line weight ratio.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { skin } from './skin';
import {
  Menu,
  Inbox,
  Home,
  Calendar,
  CalendarHeart,
  Bus,
  Ship,
  Anchor,
  Leaf,
  Info,
  Wrench,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Settings,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  X,
  AlertTriangle,
  ShieldAlert,
  Send,
  MailOpen,
  Camera,
  Check,
  Clock,
  MapPin,
  User,
  Hospital,
  Cat,
  Car,
  Landmark,
  TrafficCone,
  Newspaper,
  Megaphone,
  type LucideIcon,
} from 'lucide-react-native';

/**
 * Available icon names.
 * Maps to lucide-react-native icon components.
 *
 * To add a new icon:
 * 1. Import it from 'lucide-react-native' above
 * 2. Add the name to this union type
 * 3. Add the mapping in ICON_MAP below
 */
export type IconName =
  | 'menu'
  | 'inbox'
  | 'home'
  | 'calendar'
  | 'calendar-heart'
  | 'bus'
  | 'ship'
  | 'anchor'
  | 'leaf'
  | 'info'
  | 'wrench'
  | 'message-circle'
  | 'phone'
  | 'mail'
  | 'mail-open'
  | 'globe'
  | 'settings'
  | 'file-text'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-up'
  | 'chevron-down'
  | 'close'
  | 'alert-triangle'
  | 'shield-alert'
  | 'send'
  | 'camera'
  | 'check'
  | 'clock'
  | 'map-pin'
  | 'user'
  | 'hospital'
  | 'cat'
  | 'car'
  | 'landmark'
  | 'traffic-cone'
  | 'newspaper'
  | 'megaphone';

/**
 * Icon size tokens - unified unboxed sizes only.
 * No legacy 'xs' support; use 'sm' (24px) as minimum.
 */
export type IconSize = keyof typeof skin.icons.unboxed;

/**
 * Stroke width tokens from skin.
 */
export type IconStroke = keyof typeof skin.icons.strokeWidth;

/**
 * Color token keys from skin.colors.
 */
export type IconColorToken = keyof typeof skin.colors;

/**
 * Size-aware stroke width mapping for unboxed icon sizes.
 *
 * Maintains consistent visual weight across icon sizes by scaling
 * stroke width proportionally. Larger icons need thicker strokes
 * to maintain the same apparent line thickness ratio.
 *
 * Unboxed sizes: sm=24, md=32, lg=48, xl=64, xxl=80
 *
 * Rationale (targeting ~6-8% stroke-to-size ratio for regular):
 * - sm(24):  2.0 → 8.3%
 * - md(32):  2.0 → 6.25%
 * - lg(48):  2.5 → 5.2%
 * - xl(64):  3.0 → 4.7%
 * - xxl(80): 3.5 → 4.4%
 */
const STROKE_BY_SIZE: Record<IconSize, Record<IconStroke, number>> = {
  sm:  { light: 1.5, regular: 2.0, strong: 2.5 },  // 24px
  md:  { light: 1.5, regular: 2.0, strong: 2.5 },  // 32px
  lg:  { light: 2.0, regular: 2.5, strong: 3.0 },  // 48px
  xl:  { light: 2.5, regular: 3.0, strong: 3.5 },  // 64px
  xxl: { light: 3.0, regular: 3.5, strong: 4.0 },  // 80px
};

/**
 * Icon component map.
 * Uses SCREAMING_CASE to indicate this is a constant lookup table.
 */
const ICON_MAP: Record<IconName, LucideIcon> = {
  'menu': Menu,
  'inbox': Inbox,
  'home': Home,
  'calendar': Calendar,
  'calendar-heart': CalendarHeart,
  'bus': Bus,
  'ship': Ship,
  'anchor': Anchor,
  'leaf': Leaf,
  'info': Info,
  'wrench': Wrench,
  'message-circle': MessageCircle,
  'phone': Phone,
  'mail': Mail,
  'mail-open': MailOpen,
  'globe': Globe,
  'settings': Settings,
  'file-text': FileText,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'close': X,
  'alert-triangle': AlertTriangle,
  'shield-alert': ShieldAlert,
  'send': Send,
  'camera': Camera,
  'check': Check,
  'clock': Clock,
  'map-pin': MapPin,
  'user': User,
  'hospital': Hospital,
  'cat': Cat,
  'car': Car,
  'landmark': Landmark,
  'traffic-cone': TrafficCone,
  'newspaper': Newspaper,
  'megaphone': Megaphone,
};

interface IconProps {
  /**
   * Icon name from the available icon set.
   */
  name: IconName;

  /**
   * Size token from skin.icons.unboxed.
   * @default 'md'
   */
  size?: IconSize;

  /**
   * Stroke width token from skin.icons.strokeWidth.
   * @default 'regular'
   */
  stroke?: IconStroke;

  /**
   * Color token from skin.colors.
   * @default 'textPrimary'
   */
  colorToken?: IconColorToken;

  /**
   * Direct color override (use only when skin token doesn't apply).
   * Prefer colorToken when possible.
   */
  color?: string;

  /**
   * Additional accessibility label.
   */
  accessibilityLabel?: string;
}

/**
 * Fallback component shown when icon lookup fails.
 * Should only render for impossible runtime states.
 */
function IconFallback({
  name,
  size,
  color,
}: {
  name: string;
  size: number;
  color: string;
}): React.JSX.Element {
  // Dev warning for debugging
  if (__DEV__) {
    console.warn(
      `[Icon] Unknown icon name: "${name}". ` +
        `Available icons: ${Object.keys(ICON_MAP).join(', ')}`
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderColor: color,
        },
      ]}
      accessibilityLabel={`Missing icon: ${name}`}
    >
      <Text style={[styles.fallbackText, { color, fontSize: size * 0.4 }]}>?</Text>
    </View>
  );
}

/**
 * Skin-controlled icon component.
 *
 * @example
 * ```tsx
 * <Icon name="menu" size="md" stroke="strong" colorToken="textPrimary" />
 * <Icon name="inbox" size="sm" colorToken="primary" />
 * ```
 */
export function Icon({
  name,
  size = 'md',
  stroke = 'regular',
  colorToken = 'textPrimary',
  color,
  accessibilityLabel,
}: IconProps): React.JSX.Element {
  const iconSize = skin.icons.unboxed[size];
  // Size-aware stroke width for consistent visual weight across sizes
  const strokeWidth = STROKE_BY_SIZE[size][stroke];
  const iconColor = color ?? skin.colors[colorToken];

  // Runtime safety check - should never trigger with proper TypeScript usage
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) {
    return <IconFallback name={name} size={iconSize} color={iconColor} />;
  }

  return (
    <IconComponent
      size={iconSize}
      strokeWidth={strokeWidth}
      color={iconColor}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: skin.borders.radiusSharp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '600',
  },
});

export default Icon;
