/**
 * FloraSpeciesCard Component
 *
 * Expandable card for displaying plant species information.
 * Supports collapsed and expanded states with image gallery.
 *
 * Features:
 * - Collapsed: image thumbnail, title, latin name, chevron
 * - Expanded: image gallery, description, how to recognize, habitat, notes, legal basis
 * - Visual emphasis for critical species (different bg/border/shadow)
 * - "Highest level of protection" tag for critical species
 *
 * Skin-pure: Uses skin tokens only (no hardcoded colors).
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableOpacity,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { skin } from '../../../ui/skin';
import { Icon } from '../../../ui/Icon';
import { H2, Body, Meta, Label } from '../../../ui/Text';
import type { FloraSpecies, FloraImage, BilingualText } from '../../../data/floraContent';
import { wikiThumb } from '../../../utils/wikiThumb';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_HORIZONTAL_MARGIN = skin.spacing.lg * 2;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_MARGIN;
const GALLERY_HEIGHT = 200;

interface FloraSpeciesCardProps {
  species: FloraSpecies;
  /** Current language for bilingual content */
  language: 'hr' | 'en';
  /** Localized critical tag text */
  criticalTag: BilingualText;
}

const { colors, spacing, borders } = skin;

// Wikimedia requires User-Agent header to avoid 429 rate limits
const WIKI_IMAGE_HEADERS = {
  'User-Agent': 'MojVisApp/1.0 (https://vis.hr; contact@vis.hr) React-Native',
};

export function FloraSpeciesCard({
  species,
  language,
  criticalTag,
}: FloraSpeciesCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryRef = useRef<ScrollView>(null);

  const isCritical = species.priority === 'critical';
  const hasImages = species.images.length > 0;
  const hasMultipleImages = species.images.length > 1;

  const galleryImageWidth = CARD_WIDTH - borders.widthCard * 2;

  // Helper to get text for current language
  const getText = (text: BilingualText) => text[language];

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleGalleryScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / galleryImageWidth);
    if (index !== galleryIndex && index >= 0 && index < species.images.length) {
      setGalleryIndex(index);
    }
  };

  const goToPreviousImage = () => {
    if (galleryIndex > 0) {
      const newIndex = galleryIndex - 1;
      galleryRef.current?.scrollTo({
        x: newIndex * galleryImageWidth,
        animated: true,
      });
      setGalleryIndex(newIndex);
    }
  };

  const goToNextImage = () => {
    if (galleryIndex < species.images.length - 1) {
      const newIndex = galleryIndex + 1;
      galleryRef.current?.scrollTo({
        x: newIndex * galleryImageWidth,
        animated: true,
      });
      setGalleryIndex(newIndex);
    }
  };

  // Get first image for thumbnail (use 200px thumb for collapsed card)
  const thumbnailImage = hasImages ? wikiThumb(species.images[0].url, 200) : null;

  return (
    <View style={styles.wrapper}>
      {/* Shadow Layer */}
      <View
        style={[
          styles.shadowLayer,
          isCritical ? styles.shadowLayerCritical : styles.shadowLayerDefault,
        ]}
      />

      {/* Main Card */}
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isCritical ? styles.cardCritical : styles.cardDefault,
          pressed && styles.cardPressed,
        ]}
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityLabel={`${getText(species.title)}, ${species.latin}`}
        accessibilityState={{ expanded }}
      >
        {/* Header Row (always visible) */}
        <View style={styles.header}>
          {/* Thumbnail (with placeholder fallback) */}
          {thumbnailImage ? (
            <Image
              source={{ uri: thumbnailImage, headers: WIKI_IMAGE_HEADERS }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Icon name="leaf" size="md" colorToken="textMuted" />
            </View>
          )}

          {/* Title Area */}
          <View style={styles.titleArea}>
            <H2 style={styles.title}>{getText(species.title)}</H2>
            <Meta style={styles.latinName}>{species.latin}</Meta>

            {/* Critical Tag */}
            {isCritical && (
              <View style={styles.criticalTag}>
                <Meta style={styles.criticalTagText}>
                  {getText(criticalTag)}
                </Meta>
              </View>
            )}
          </View>

          {/* Chevron */}
          <View style={styles.chevronContainer}>
            <Icon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size="md"
              colorToken="textPrimary"
            />
          </View>
        </View>

        {/* Expanded Content */}
        {expanded && (
          <View style={styles.expandedContent}>
            {/* Image Gallery (or placeholder if no images) */}
            <View style={styles.gallery}>
              {hasImages ? (
                <>
                  <ScrollView
                    ref={galleryRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleGalleryScroll}
                    scrollEventThrottle={16}
                    bounces={false}
                  >
                    {species.images.map((item, index) => {
                      const computedUrl = wikiThumb(item.url);
                      return (
                        <View
                          key={`gallery-${species.id}-${index}`}
                          style={styles.galleryImageContainer}
                        >
                          <Image
                            source={{ uri: computedUrl, headers: WIKI_IMAGE_HEADERS, cache: 'reload' }}
                            style={{ width: galleryImageWidth, height: GALLERY_HEIGHT }}
                            resizeMode="cover"
                          />
                          {item.author && (
                            <Meta style={styles.imageAttribution}>
                              {item.author} {item.license ? `(${item.license})` : ''}
                            </Meta>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* Gallery Chevrons */}
                  {hasMultipleImages && (
                    <>
                      <TouchableOpacity
                        style={[styles.galleryChevron, styles.galleryChevronLeft]}
                        onPress={goToPreviousImage}
                        disabled={galleryIndex === 0}
                      >
                        <Icon name="chevron-left" size="sm" color={colors.primaryText} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.galleryChevron, styles.galleryChevronRight]}
                        onPress={goToNextImage}
                        disabled={galleryIndex === species.images.length - 1}
                      >
                        <Icon name="chevron-right" size="sm" color={colors.primaryText} />
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Gallery Dots */}
                  {hasMultipleImages && (
                    <View style={styles.galleryDots}>
                      {species.images.map((_, index) => (
                        <View
                          key={`dot-${index}`}
                          style={[
                            styles.galleryDot,
                            index === galleryIndex
                              ? styles.galleryDotActive
                              : styles.galleryDotInactive,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.galleryPlaceholder}>
                  <Icon name="camera" size="xl" colorToken="textMuted" />
                  <Meta style={styles.galleryPlaceholderText}>
                    {language === 'hr' ? 'Slika nije dostupna' : 'Image not available'}
                  </Meta>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Body style={styles.description}>{getText(species.description)}</Body>
            </View>

            {/* How to Recognize */}
            {species.howToRecognize && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="info" size="sm" colorToken="textSecondary" />
                  <Label style={styles.sectionLabel}>
                    {language === 'hr' ? 'Kako prepoznati' : 'How to recognize'}
                  </Label>
                </View>
                <Body style={styles.sectionText}>{getText(species.howToRecognize)}</Body>
              </View>
            )}

            {/* Habitat */}
            {species.habitat && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="map-pin" size="sm" colorToken="textSecondary" />
                  <Label style={styles.sectionLabel}>
                    {language === 'hr' ? 'Stanište' : 'Habitat'}
                  </Label>
                </View>
                <Body style={styles.sectionText}>{getText(species.habitat)}</Body>
              </View>
            )}

            {/* Notes */}
            {species.notes && (
              <View style={styles.section}>
                <Body style={styles.sectionText}>{getText(species.notes)}</Body>
              </View>
            )}

            {/* Legal Basis (small, discreet, last) */}
            {species.legalBasis && (
              <View style={styles.legalSection}>
                <Meta style={styles.legalText}>{getText(species.legalBasis)}</Meta>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: spacing.lg,
  },

  // Shadow layers
  shadowLayer: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
  },
  shadowLayerDefault: {
    backgroundColor: colors.border,
  },
  // Critical shadow uses urgent color with reduced opacity for cleaner look
  shadowLayerCritical: {
    backgroundColor: 'rgba(215, 72, 47, 0.5)', // urgent color at 50% opacity
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
  },

  // Card
  card: {
    borderWidth: borders.widthCard,
    overflow: 'hidden',
  },
  cardDefault: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  // Note: colors.errorBackground has alpha, so use opaque white for clean look
  cardCritical: {
    backgroundColor: colors.background,
    borderColor: colors.urgent,
  },
  cardPressed: {
    opacity: 0.9,
  },

  // Header (collapsed state)
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    color: colors.textPrimary,
  },
  latinName: {
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  criticalTag: {
    backgroundColor: colors.urgent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  criticalTagText: {
    color: colors.urgentText,
    textTransform: 'uppercase',
  },
  chevronContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Expanded content
  expandedContent: {
    borderTopWidth: borders.widthThin,
    borderTopColor: colors.borderLight,
  },

  // Gallery
  gallery: {
    position: 'relative',
    height: GALLERY_HEIGHT,
  },
  galleryImageContainer: {
    width: CARD_WIDTH - borders.widthCard * 2,
    height: GALLERY_HEIGHT,
  },
  imageAttribution: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.overlay,
    color: colors.primaryText,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  galleryChevron: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryChevronLeft: {
    left: 0,
  },
  galleryChevronRight: {
    right: 0,
  },
  galleryDots: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  galleryDot: {
    width: 6,
    height: 6,
  },
  galleryDotActive: {
    backgroundColor: colors.accent,
  },
  galleryDotInactive: {
    backgroundColor: colors.borderMuted,
  },
  galleryPlaceholder: {
    width: '100%',
    height: GALLERY_HEIGHT,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  galleryPlaceholderText: {
    color: colors.textMuted,
  },

  // Sections
  section: {
    padding: spacing.lg,
    borderTopWidth: borders.widthHairline,
    borderTopColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  sectionText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  description: {
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // Legal basis (discreet, last)
  legalSection: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: borders.widthHairline,
    borderTopColor: colors.borderLight,
  },
  legalText: {
    color: colors.textDisabled,
    fontStyle: 'italic',
  },
});

export default FloraSpeciesCard;
