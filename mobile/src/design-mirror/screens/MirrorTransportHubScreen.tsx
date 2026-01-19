/**
 * Mirror Transport Hub Screen (Design Mirror)
 *
 * Mirrors TransportHubScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Components mirrored:
 * 1. Header (simplified)
 * 2. Banners (via StaticBannerList - no navigation)
 * 3. Title
 * 4. Road/Sea transport tiles (poster slab style)
 * 5. Bottom note info box
 *
 * Rules:
 * - NO useNavigation import
 * - NO navigate() calls
 * - NO API calls
 * - Uses StaticBannerList instead of BannerList
 * - Skin tokens only (specifically skin.components.transport)
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { H1, H2, Label, Meta, Body } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { StaticBannerList } from '../components/StaticBannerList';
import { bannersFixture } from '../fixtures/transport';

const { colors, spacing, components } = skin;
const { tiles, note } = components.transport;

/**
 * Mirror Transport Hub Screen
 * Uses bannersFixture for banner data
 */
export function MirrorTransportHubScreen(): React.JSX.Element {
  // NO-OP handler - visual only
  const handleTilePress = (): void => {
    // Intentionally empty - mirror screens don't navigate
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>TransportHub Mirror</H2>
        <Meta style={styles.headerMeta}>fixture: bannersFixture</Meta>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Banners - Full-bleed (using StaticBannerList, NOT BannerList) */}
        {bannersFixture.length > 0 && (
          <View style={styles.bannerSection}>
            <StaticBannerList banners={bannersFixture} />
          </View>
        )}

        {/* Title */}
        <View style={styles.section}>
          <H1>Vozni redovi</H1>
        </View>

        {/* Transport Type Selection - Poster Slab Tiles */}
        <View style={styles.tilesContainer}>
          {/* Road Transport Tile */}
          <View style={styles.tileWrapper}>
            <View style={styles.tileShadow} />
            <TouchableOpacity
              onPress={handleTilePress}
              activeOpacity={0.8}
              style={[styles.tile, styles.tileRoad]}
              accessibilityRole="button"
              accessibilityLabel="Cestovni prijevoz"
              disabled={true} // No navigation in mirror
            >
              {/* Left icon slab */}
              <View style={styles.tileIconSlab}>
                <Icon name="bus" size="lg" colorToken="primaryText" />
              </View>
              {/* Vertical divider */}
              <View style={styles.tileDivider} />
              {/* Content slab */}
              <View style={styles.tileContent}>
                <Label style={styles.tileTitle}>CESTOVNI</Label>
                <Meta style={styles.tileSubtitle}>Autobusne linije na otoku</Meta>
              </View>
              {/* Chevron */}
              <View style={styles.tileChevron}>
                <Icon name="chevron-right" size="md" colorToken="primaryTextMuted" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Sea Transport Tile */}
          <View style={styles.tileWrapper}>
            <View style={styles.tileShadow} />
            <TouchableOpacity
              onPress={handleTilePress}
              activeOpacity={0.8}
              style={[styles.tile, styles.tileSea]}
              accessibilityRole="button"
              accessibilityLabel="Pomorski prijevoz"
              disabled={true} // No navigation in mirror
            >
              {/* Left icon slab */}
              <View style={styles.tileIconSlab}>
                <Icon name="ship" size="lg" colorToken="primaryText" />
              </View>
              {/* Vertical divider */}
              <View style={styles.tileDivider} />
              {/* Content slab */}
              <View style={styles.tileContent}>
                <Label style={styles.tileTitle}>POMORSKI</Label>
                <Meta style={styles.tileSubtitle}>Trajekti i katamarani</Meta>
              </View>
              {/* Chevron */}
              <View style={styles.tileChevron}>
                <Icon name="chevron-right" size="md" colorToken="primaryTextMuted" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Note Info Box */}
        <View style={styles.noteContainer}>
          <View style={styles.noteBox}>
            <Body style={styles.noteText}>
              Vozni redovi se mogu promijeniti ovisno o vremenskim uvjetima i sezoni.
              Provjerite prije putovanja.
            </Body>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundTertiary,
  },
  headerTitle: {
    marginBottom: spacing.xs,
  },
  headerMeta: {
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },

  // V1 Poster: Full-bleed banners (edge-to-edge)
  bannerSection: {
    paddingHorizontal: components.transport.bannerContainerPaddingHorizontal,
    paddingTop: components.transport.bannerContainerPaddingTop,
  },

  section: {
    padding: spacing.lg,
  },

  // Poster Slab Tiles Container
  tilesContainer: {
    paddingHorizontal: spacing.lg,
    gap: tiles.tileGap,
  },

  // Tile wrapper for shadow layer
  tileWrapper: {
    position: 'relative',
  },

  // Offset shadow (dual-layer poster effect)
  tileShadow: {
    position: 'absolute',
    top: tiles.tileShadowOffsetY,
    left: tiles.tileShadowOffsetX,
    right: -tiles.tileShadowOffsetX,
    bottom: -tiles.tileShadowOffsetY,
    backgroundColor: tiles.tileShadowColor,
    borderRadius: tiles.tileRadius,
  },

  // Base Tile Style (poster slab)
  tile: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: tiles.tileBorderWidth,
    borderColor: tiles.tileBorderColor,
    borderRadius: tiles.tileRadius,
    overflow: 'hidden',
  },

  // Road Transport Tile (Green)
  tileRoad: {
    backgroundColor: tiles.tileRoadBackground,
  },

  // Sea Transport Tile (Blue)
  tileSea: {
    backgroundColor: tiles.tileSeaBackground,
  },

  // Left icon slab (full height)
  tileIconSlab: {
    width: tiles.tileIconSlabWidth,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tiles.tileIconSlabPadding,
  },

  // Vertical divider between icon and content
  tileDivider: {
    width: tiles.tileDividerWidth,
    backgroundColor: tiles.tileDividerColor,
  },

  // Content slab (text + chevron area)
  tileContent: {
    flex: 1,
    justifyContent: 'center',
    padding: tiles.tileContentPadding,
  },

  tileTitle: {
    color: tiles.tileTitleColor,
    fontSize: tiles.tileTitleFontSize,
    fontFamily: tiles.tileTitleFontFamily,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },

  tileSubtitle: {
    color: tiles.tileSubtitleColor,
  },

  // Chevron container
  tileChevron: {
    justifyContent: 'center',
    paddingRight: tiles.tileChevronPaddingRight,
  },

  // Bottom Note Info Box
  noteContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },

  noteBox: {
    borderWidth: note.noteBorderWidth,
    borderColor: note.noteBorderColor,
    backgroundColor: note.noteBackground,
    borderRadius: note.noteRadius,
    padding: note.notePadding,
  },

  noteText: {
    color: note.noteTextColor,
    textAlign: 'center',
  },
});

export default MirrorTransportHubScreen;
