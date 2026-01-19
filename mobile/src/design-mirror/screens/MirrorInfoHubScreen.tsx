/**
 * Mirror Info Hub Screen (Design Mirror)
 *
 * Mirrors an Info/Categories hub using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Hero section (title + subtitle)
 * 2. Category tiles (2x2 grid)
 * 3. Quick links sections (tile rows)
 *
 * Rules:
 * - NO useNavigation import
 * - NO API calls or context
 * - All actions are NO-OP or toggle local state
 * - Skin tokens only
 *
 * Note: Production Info Hub screen not found.
 * Design based on existing app patterns.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { Card } from '../../ui/Card';
import { H1, H2, Body, Label, Meta, ButtonText } from '../../ui/Text';
import {
  infoHubFixtures,
  infoLabels,
  type InfoHubFixture,
  type InfoCategory,
  type InfoSection,
  type InfoTile,
} from '../fixtures/info';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Mirror Info Hub Screen
 * Uses infoHubFixtures for visual state with in-screen fixture switcher
 */
export function MirrorInfoHubScreen(): React.JSX.Element {
  // Fixture switcher state
  const [fixtureIndex, setFixtureIndex] = useState(0);
  const currentFixture = infoHubFixtures[fixtureIndex];

  // NO-OP handlers - mirror screens don't navigate
  const handleCategoryPress = (_category: InfoCategory): void => {
    // Does not navigate - visual only
  };

  const handleTilePress = (_tile: InfoTile): void => {
    // Does not navigate - visual only
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header with fixture switcher */}
      <View style={styles.mirrorHeader}>
        <H2 style={styles.mirrorHeaderTitle}>Info Hub Mirror</H2>
        <Meta style={styles.mirrorHeaderMeta}>
          Fixture: {currentFixture.name}
        </Meta>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.fixtureSwitcher}
        >
          {infoHubFixtures.map((fixture, index) => (
            <TouchableOpacity
              key={fixture.id}
              style={[
                styles.fixtureButton,
                index === fixtureIndex && styles.fixtureButtonActive,
              ]}
              onPress={() => setFixtureIndex(index)}
            >
              <Meta
                style={[
                  styles.fixtureButtonText,
                  index === fixtureIndex && styles.fixtureButtonTextActive,
                ]}
              >
                {fixture.name}
              </Meta>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Meta style={styles.fixtureDescription}>
          {currentFixture.description}
        </Meta>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <H1 style={styles.heroTitle}>{currentFixture.heroTitleHr}</H1>
          <Body style={styles.heroSubtitle}>
            {currentFixture.heroSubtitleHr}
          </Body>
        </View>

        {/* Categories Section */}
        {currentFixture.categories.length > 0 && (
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>{infoLabels.sectionsHr}</H2>
            <View style={styles.categoryGrid}>
              {currentFixture.categories.map((category) => (
                <CategoryTile
                  key={category.id}
                  category={category}
                  onPress={() => handleCategoryPress(category)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Quick Links Sections */}
        {currentFixture.sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <H2 style={styles.sectionTitle}>{section.titleHr}</H2>
            <View style={styles.tilesContainer}>
              {section.tiles.map((tile) => (
                <TileRow
                  key={tile.id}
                  tile={tile}
                  onPress={() => handleTilePress(tile)}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// Sub-components
// ============================================================

interface CategoryTileProps {
  category: InfoCategory;
  onPress: () => void;
}

function CategoryTile({
  category,
  onPress,
}: CategoryTileProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.categoryTile, { backgroundColor: category.backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name={category.icon} size="lg" color={category.textColor} />
      <Label
        style={[styles.categoryLabel, { color: category.textColor }]}
        numberOfLines={2}
      >
        {category.titleHr}
      </Label>
      <Meta
        style={[styles.categoryDescription, { color: category.textColor }]}
        numberOfLines={2}
      >
        {category.descriptionHr}
      </Meta>
    </TouchableOpacity>
  );
}

interface TileRowProps {
  tile: InfoTile;
  onPress: () => void;
}

function TileRow({ tile, onPress }: TileRowProps): React.JSX.Element {
  return (
    <Card variant="default" onPress={onPress} style={styles.tileRow}>
      <View style={styles.tileIconContainer}>
        <Icon name={tile.icon} size="md" colorToken="textPrimary" />
      </View>
      <View style={styles.tileContent}>
        <Label style={styles.tileTitle} numberOfLines={2}>
          {tile.titleHr}
        </Label>
        <Meta style={styles.tileSubtitle}>{tile.titleEn}</Meta>
      </View>
      <Icon name="chevron-right" size="md" colorToken="chevron" />
    </Card>
  );
}

// ============================================================
// Styles
// ============================================================

const TILE_GAP = skin.spacing.md;
const TILE_WIDTH = (SCREEN_WIDTH - skin.spacing.lg * 2 - TILE_GAP) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: skin.colors.background,
  },
  mirrorHeader: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundTertiary,
  },
  mirrorHeaderTitle: {
    marginBottom: skin.spacing.xs,
  },
  mirrorHeaderMeta: {
    color: skin.colors.textMuted,
  },
  fixtureSwitcher: {
    marginTop: skin.spacing.md,
    marginBottom: skin.spacing.sm,
  },
  fixtureButton: {
    paddingHorizontal: skin.spacing.md,
    paddingVertical: skin.spacing.sm,
    marginRight: skin.spacing.sm,
    backgroundColor: skin.colors.backgroundSecondary,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusSmall,
  },
  fixtureButtonActive: {
    backgroundColor: skin.colors.primary,
    borderColor: skin.colors.primary,
  },
  fixtureButtonText: {
    color: skin.colors.textMuted,
  },
  fixtureButtonTextActive: {
    color: skin.colors.primaryText,
  },
  fixtureDescription: {
    fontStyle: 'italic',
    color: skin.colors.textDisabled,
  },
  content: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    backgroundColor: skin.colors.primary,
    padding: skin.spacing.xxl,
    marginTop: skin.spacing.lg,
    marginHorizontal: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    ...skin.shadows.card,
  },
  heroTitle: {
    color: skin.colors.primaryText,
    marginBottom: skin.spacing.sm,
  },
  heroSubtitle: {
    color: skin.colors.primaryTextMuted,
  },

  // Section
  section: {
    padding: skin.spacing.lg,
  },
  sectionTitle: {
    marginBottom: skin.spacing.lg,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },
  categoryTile: {
    width: TILE_WIDTH,
    minHeight: 120,
    padding: skin.spacing.md,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    gap: skin.spacing.xs,
    ...skin.shadows.card,
  },
  categoryLabel: {
    marginTop: skin.spacing.sm,
  },
  categoryDescription: {
    opacity: 0.8,
  },

  // Tile Rows
  tilesContainer: {
    gap: skin.spacing.md,
  },
  tileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.spacing.md,
  },
  tileIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: skin.colors.backgroundSecondary,
    borderRadius: skin.borders.radiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: skin.spacing.md,
  },
  tileContent: {
    flex: 1,
  },
  tileTitle: {
    marginBottom: skin.spacing.xs,
  },
  tileSubtitle: {
    color: skin.colors.textMuted,
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    height: skin.spacing.xxl,
  },
});

export default MirrorInfoHubScreen;
