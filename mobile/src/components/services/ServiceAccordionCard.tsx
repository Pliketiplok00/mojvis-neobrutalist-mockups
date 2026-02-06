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

import React, { useState } from 'react';
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
}

const { colors, spacing, borders } = skin;

export function ServiceAccordionCard({
  icon,
  title,
  subtitle,
  badge,
  iconBackgroundColor = colors.backgroundSecondary,
  infoRows,
  note,
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

            {/* Info rows */}
            {infoRows.map((row, index) => (
              <React.Fragment key={`${row.label}-${index}`}>
                <InfoRow icon={row.icon} label={row.label} value={row.value} />
                {index < infoRows.length - 1 && <Hairline style={styles.rowDivider} />}
              </React.Fragment>
            ))}

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
}

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
    borderWidth: borders.widthThin,
    borderColor: colors.border,
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
});

export default ServiceAccordionCard;
