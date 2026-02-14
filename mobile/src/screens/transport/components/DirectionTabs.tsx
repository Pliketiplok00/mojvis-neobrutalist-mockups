/**
 * DirectionTabs Component
 *
 * Tab bar for selecting travel direction (e.g., "Vis → Split" / "Split → Vis").
 * Includes neobrutalist offset shadow effect.
 *
 * Extracted from LineDetailScreen for reusability.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Label } from '../../../ui/Text';
import { skin } from '../../../ui/skin';
import type { RouteInfo } from '../../../types/transport';

const { colors, spacing, components } = skin;
const lineDetail = components.transport.lineDetail;

interface DirectionTabsProps {
  routes: RouteInfo[];
  selectedDirection: number;
  onSelectDirection: (direction: number) => void;
  activeBackgroundColor: string;
  sectionLabel: string;
}

/**
 * Direction toggle tabs with offset shadow
 * Only renders when multiple routes (directions) exist
 */
export function DirectionTabs({
  routes,
  selectedDirection,
  onSelectDirection,
  activeBackgroundColor,
  sectionLabel,
}: DirectionTabsProps): React.JSX.Element | null {
  // Don't render if only one direction
  if (routes.length <= 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Label style={styles.sectionLabel}>{sectionLabel}</Label>
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsShadow} />
        <View style={styles.tabs}>
          {routes.map((route) => {
            const isActive = selectedDirection === route.direction;
            return (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.tab,
                  isActive && [
                    styles.tabActive,
                    { backgroundColor: activeBackgroundColor },
                  ],
                  route.direction === 1 && styles.tabRight,
                ]}
                onPress={() => onSelectDirection(route.direction)}
              >
                <Label
                  style={[
                    styles.tabText,
                    isActive && styles.tabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {route.direction_label}
                </Label>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  tabsWrapper: {
    position: 'relative',
    marginTop: spacing.sm,
  },
  tabsShadow: {
    position: 'absolute',
    top: lineDetail.shadowOffsetY,
    left: lineDetail.shadowOffsetX,
    right: -lineDetail.shadowOffsetX,
    bottom: -lineDetail.shadowOffsetY,
    backgroundColor: lineDetail.shadowColor,
  },
  tabs: {
    flexDirection: 'row',
    borderWidth: lineDetail.directionTabBorderWidth,
    borderColor: lineDetail.directionTabBorderColor,
    borderRadius: lineDetail.directionTabRadius,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: lineDetail.directionTabPadding,
    paddingHorizontal: spacing.sm,
    backgroundColor: lineDetail.directionTabInactiveBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRight: {
    borderLeftWidth: lineDetail.directionTabBorderWidth,
    borderLeftColor: lineDetail.directionTabBorderColor,
  },
  tabActive: {
    // backgroundColor set dynamically via prop
  },
  tabText: {
    color: lineDetail.directionTabInactiveText,
    textAlign: 'center',
  },
  tabTextActive: {
    color: lineDetail.directionTabActiveText,
  },
});
