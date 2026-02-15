/**
 * CategoryGrid Component
 *
 * 2x2 grid of category tiles for quick navigation.
 * Neobrut style with shadow offset effect.
 *
 * Extracted from HomeScreen.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { H2, Label } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { skin } from '../../../ui/skin';
import type { IconName } from '../../../ui/Icon';
import type { MainStackParamList } from '../../../navigation/types';

export interface CategoryItem {
  key: string;
  icon: IconName;
  backgroundColor: string;
  textColor: string;
  route: keyof MainStackParamList;
}

interface CategoryGridProps {
  /** Category items to display */
  categories: CategoryItem[];
  /** Section title */
  sectionTitle: string;
  /** Press handler */
  onCategoryPress: (category: CategoryItem) => void;
  /** Translation function for category labels */
  t: (key: string) => string;
}

/**
 * 2x2 grid of category tiles with neobrut shadow styling
 */
export function CategoryGrid({
  categories,
  sectionTitle,
  onCategoryPress,
  t,
}: CategoryGridProps): React.JSX.Element {
  return (
    <View style={styles.gridSection}>
      <H2 style={styles.sectionLabel}>{sectionTitle}</H2>
      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={styles.categoryTileWrapper}
            onPress={() => onCategoryPress(category)}
            activeOpacity={0.8}
          >
            {/* Shadow layer for neobrut offset effect */}
            <View style={styles.categoryTileShadow} />
            {/* Main tile */}
            <View
              style={[
                styles.categoryTile,
                { backgroundColor: category.backgroundColor },
              ]}
            >
              <View style={styles.categoryIconBox}>
                <Icon
                  name={category.icon}
                  size="lg"
                  color={category.textColor}
                  stroke="strong"
                />
              </View>
              <Label style={[styles.categoryLabel, { color: category.textColor }]}>
                {t(`home.categoryLabels.${category.key}`).toUpperCase()}
              </Label>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridSection: {
    paddingHorizontal: skin.spacing.lg,
    paddingTop: skin.spacing.xl,
  },
  sectionLabel: {
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.md,
    letterSpacing: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryTileWrapper: {
    width: '48%',
    height: 110,
    marginBottom: skin.spacing.md,
  },
  categoryTileShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '100%',
    height: '100%',
    backgroundColor: skin.colors.border,
    borderRadius: skin.borders.radiusCard,
    zIndex: 0,
  },
  categoryTile: {
    width: '100%',
    height: '100%',
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusCard,
    alignItems: 'center',
    justifyContent: 'center',
    gap: skin.spacing.sm,
    zIndex: 1,
  },
  categoryIconBox: {
    // IconBox handles sizing
  },
  categoryLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
