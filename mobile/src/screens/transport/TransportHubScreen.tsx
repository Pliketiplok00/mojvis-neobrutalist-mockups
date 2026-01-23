/**
 * Transport Hub Screen
 *
 * Entry point for all transport timetables.
 * User selects Road or Sea transport.
 *
 * Per spec:
 * - Root screen (hamburger menu)
 * - Two choices: Road / Sea
 * - Active notices show as banners
 * - No deep linking bypasses this hub
 *
 * Design (V1 poster style):
 * - Full-bleed banners (edge-to-edge)
 * - Poster tiles with colored backgrounds and icon boxes
 * - Bottom note info box
 *
 * Phase 3C: Migrated to skin primitives (100% skin-adopted).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { H1, Label, Meta, Body } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { skin } from '../../ui/skin';
import { useMenu } from '../../contexts/MenuContext';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { inboxApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const { colors, spacing, components } = skin;
const { tiles, note } = components.transport;

export function TransportHubScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { openMenu } = useMenu();
  const { t } = useTranslations();
  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const userContext = useUserContext();

  // Fetch banners for transport (Phase 2: unified 'transport' context)
  const fetchBanners = useCallback(async () => {
    try {
      const response = await inboxApi.getActiveBanners(userContext, 'transport');
      setBanners(response.banners);
    } catch (err) {
      console.error('[TransportHub] Error fetching banners:', err);
    }
  }, [userContext]);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  const handleMenuPress = (): void => {
    openMenu();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="root" onMenuPress={handleMenuPress} />

      <ScrollView style={styles.scrollView}>
        {/* Banners - Full-bleed */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <BannerList banners={banners} />
          </View>
        )}

        {/* Title */}
        <View style={styles.section}>
          <H1>{t('transport.hub.title')}</H1>
        </View>

        {/* Transport Type Selection - Poster Slab Tiles */}
        <View style={styles.tilesContainer}>
          {/* Road Transport Tile */}
          <View style={styles.tileWrapper}>
            <View style={styles.tileShadow} />
            <TouchableOpacity
              onPress={() => navigation.navigate('RoadTransport')}
              activeOpacity={0.8}
              style={[styles.tile, styles.tileRoad]}
              accessibilityRole="button"
              accessibilityLabel={t('transport.hub.road')}
            >
              {/* Left icon slab */}
              <View style={styles.tileIconSlab}>
                <Icon name="bus" size="lg" colorToken="primaryText" />
              </View>
              {/* Vertical divider */}
              <View style={styles.tileDivider} />
              {/* Content slab */}
              <View style={styles.tileContent}>
                <Label style={styles.tileTitle}>{t('transport.hub.road')}</Label>
                <Meta style={styles.tileSubtitle}>{t('transport.hub.roadDescription')}</Meta>
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
              onPress={() => navigation.navigate('SeaTransport')}
              activeOpacity={0.8}
              style={[styles.tile, styles.tileSea]}
              accessibilityRole="button"
              accessibilityLabel={t('transport.hub.sea')}
            >
              {/* Left icon slab */}
              <View style={styles.tileIconSlab}>
                <Icon name="ship" size="lg" colorToken="primaryText" />
              </View>
              {/* Vertical divider */}
              <View style={styles.tileDivider} />
              {/* Content slab */}
              <View style={styles.tileContent}>
                <Label style={styles.tileTitle}>{t('transport.hub.sea')}</Label>
                <Meta style={styles.tileSubtitle}>{t('transport.hub.seaDescription')}</Meta>
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
            <Body style={styles.noteText}>{t('transport.note')}</Body>
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

export default TransportHubScreen;
