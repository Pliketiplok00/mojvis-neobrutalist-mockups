/**
 * ServiceAccordionCard Component
 *
 * Expandable accordion card for public services.
 * Used in Javne usluge screen for service listings.
 *
 * Features:
 * - Collapsed: IconBox (44px), title, subtitle, optional badge, chevron
 * - Expanded: InfoRow components, hairline dividers, optional note
 * - LayoutAnimation for smooth expand/collapse
 * - Neobrutalist styling with offset shadow
 *
 * Skin-pure: Uses skin tokens only.
 */

import React, { useState, memo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { skin } from '../../ui/skin';
import { Icon, type IconName } from '../../ui/Icon';
import { Badge } from '../../ui/Badge';
import { Hairline } from '../../ui/MicroPrimitives';
import { ButtonText, Label, Meta } from '../../ui/Text';
import { InfoRow } from '../common/InfoRow';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Info row data structure */
export interface ServiceInfoRow {
  icon: IconName;
  label: string;
  value: string;
}

/** Scheduled date structure for periodic services */
export interface ScheduledDateItem {
  date: string;
  time_from: string;
  time_to: string;
}

/** Location hours structure */
export interface LocationHoursItem {
  time: string;
  description: string;
}

/** Location structure for services with multiple locations */
export interface ServiceLocationItem {
  name: string;
  address: string;
  phone: string;
  hours: LocationHoursItem[];
}

interface ServiceAccordionCardProps {
  /** Icon name for the header */
  icon: IconName;
  /** Service title */
  title: string;
  /** Service subtitle/description */
  subtitle: string;
  /** Optional badge text (e.g., "VELJAČA '26") */
  badge?: string;
  /** Background color for the icon box (use skin.colors token) */
  iconBackgroundColor?: string;
  /** Info rows to display when expanded */
  infoRows: ServiceInfoRow[];
  /** Optional note text at the bottom */
  note?: string;
  /** Scheduled dates for periodic services */
  scheduledDates?: ScheduledDateItem[];
  /** Locations for services with multiple locations (e.g., pharmacies) */
  locations?: ServiceLocationItem[];
  /** Current language for date formatting */
  language?: 'hr' | 'en';
}

const { colors, spacing, borders } = skin;

/** Format a date for display */
const formatScheduledDate = (dateStr: string, language: 'hr' | 'en'): string => {
  const date = new Date(dateStr);
  const locale = language === 'hr' ? 'hr-HR' : 'en-US';
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

/** Filter to only show current/future dates */
const filterFutureDates = (dates: ScheduledDateItem[]): ScheduledDateItem[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dates.filter((d) => new Date(d.date) >= today);
};

export const ServiceAccordionCard = memo(function ServiceAccordionCard({
  icon,
  title,
  subtitle,
  badge,
  iconBackgroundColor = colors.backgroundSecondary,
  infoRows,
  note,
  scheduledDates,
  locations,
  language = 'hr',
}: ServiceAccordionCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Offset shadow layer */}
      <View style={styles.shadowLayer} />

      {/* Main card */}
      <View style={styles.card}>
        {/* Header (always visible) */}
        <Pressable
          onPress={toggleExpanded}
          style={styles.header}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={`${title}, ${subtitle}`}
        >
          {/* Icon box */}
          <View style={[styles.iconBox, { backgroundColor: iconBackgroundColor }]}>
            <Icon name={icon} size="md" colorToken="textPrimary" />
          </View>

          {/* Title area */}
          <View style={styles.titleContainer}>
            <ButtonText style={styles.title}>{title}</ButtonText>
            <Label style={styles.subtitle}>{subtitle}</Label>
          </View>

          {/* Badge (optional) */}
          {badge && (
            <View style={styles.badgeContainer}>
              <Badge variant="info">{badge}</Badge>
            </View>
          )}

          {/* Chevron */}
          <View style={styles.chevronContainer}>
            <Icon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size="sm"
              colorToken="chevron"
            />
          </View>
        </Pressable>

        {/* Expanded content */}
        {expanded && (
          <View style={styles.expandedContent}>
            <Hairline style={styles.divider} />

            {/* Info rows (only show if no locations) */}
            {(!locations || locations.length === 0) && infoRows.map((row, index) => (
              <React.Fragment key={`${row.label}-${index}`}>
                <InfoRow icon={row.icon} label={row.label} value={row.value} />
                {index < infoRows.length - 1 && <Hairline style={styles.rowDivider} />}
              </React.Fragment>
            ))}

            {/* Locations for multi-location services (e.g., pharmacies) */}
            {locations && locations.length > 0 && locations.map((loc, locIndex) => (
              <View key={`location-${locIndex}`} style={styles.locationBlock}>
                {locIndex > 0 && <Hairline style={styles.locationDivider} />}
                <Label style={styles.locationName}>{loc.name}</Label>
                <InfoRow icon="map-pin" label={language === 'hr' ? 'Adresa' : 'Address'} value={loc.address} />
                <Hairline style={styles.rowDivider} />
                <InfoRow icon="phone" label={language === 'hr' ? 'Telefon' : 'Phone'} value={loc.phone} />
                {loc.hours.length > 0 && (
                  <>
                    <Hairline style={styles.rowDivider} />
                    <InfoRow
                      icon="clock"
                      label={language === 'hr' ? 'Radno vrijeme' : 'Hours'}
                      value={loc.hours.map((h) => `${h.description}: ${h.time}`).join('\n')}
                    />
                  </>
                )}
              </View>
            ))}

            {/* Scheduled dates for periodic services */}
            {scheduledDates && scheduledDates.length > 0 && (() => {
              const futureDates = filterFutureDates(scheduledDates).slice(0, 5);
              if (futureDates.length === 0) return null;
              return (
                <>
                  <Hairline style={styles.scheduleDivider} />
                  <Label style={styles.scheduleLabel}>
                    {language === 'hr' ? 'ZAKAZANI TERMINI' : 'SCHEDULED DATES'}
                  </Label>
                  {futureDates.map((sd, index) => (
                    <View key={`schedule-${index}`} style={styles.scheduleRow}>
                      <Icon name="calendar" size="sm" colorToken="textMuted" />
                      <Label style={styles.scheduleDate}>
                        {formatScheduledDate(sd.date, language)}
                      </Label>
                      <Meta style={styles.scheduleTime}>
                        {sd.time_from} - {sd.time_to}
                      </Meta>
                    </View>
                  ))}
                </>
              );
            })()}

            {/* Note (optional) */}
            {note && (
              <>
                <Hairline style={styles.noteDivider} />
                <Meta style={styles.note}>{note}</Meta>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
});

const ICON_BOX_SIZE = 44;
const SHADOW_OFFSET = 4;

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  shadowLayer: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    backgroundColor: colors.border,
  },
  card: {
    backgroundColor: colors.background,
    borderWidth: borders.widthCard,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconBox: {
    width: ICON_BOX_SIZE,
    height: ICON_BOX_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  badgeContainer: {
    marginRight: spacing.sm,
  },
  chevronContainer: {
    width: spacing.xxl,
    alignItems: 'center',
  },
  expandedContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  divider: {
    marginBottom: spacing.sm,
  },
  rowDivider: {
    marginVertical: spacing.xs,
  },
  noteDivider: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderStyle: 'dashed',
  },
  note: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  scheduleDivider: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  scheduleLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  scheduleDate: {
    flex: 1,
    color: colors.textPrimary,
  },
  scheduleTime: {
    color: colors.textMuted,
  },
  locationBlock: {
    marginTop: spacing.sm,
  },
  locationDivider: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  locationName: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ServiceAccordionCard;
