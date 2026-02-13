/**
 * HeroMediaHeader Component
 *
 * Canonical hero header for content screens (Flora, Fauna, Events, Info).
 * Matches design from docs/header.png.
 *
 * Features:
 * - Multi-image carousel with swipe support
 * - Left/right chevron navigation buttons
 * - Pagination dots
 * - Yellow title slab with heavy border
 * - NO shadow (hero is a page header, not a content block)
 *
 * Skin-pure: Uses skin tokens only (no hardcoded colors).
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type ListRenderItemInfo,
} from 'react-native';
import { skin } from './skin';
import { Icon } from './Icon';
import { H1, Body } from './Text';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_ASPECT_RATIO = 16 / 10;
const IMAGE_HEIGHT = SCREEN_WIDTH / IMAGE_ASPECT_RATIO;

interface HeroMediaHeaderProps {
  /** Array of image URLs */
  images: string[];
  /** Main title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Placeholder when no images available */
  placeholder?: React.ReactNode;
}

const { colors, spacing, borders } = skin;

// Wikimedia requires User-Agent header to avoid 429 rate limits
const WIKI_IMAGE_HEADERS = {
  'User-Agent': 'MojVisApp/1.0 (https://vis.hr; contact@vis.hr) React-Native',
};

export function HeroMediaHeader({
  images,
  title,
  subtitle,
  placeholder,
}: HeroMediaHeaderProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      flatListRef.current?.scrollToOffset({
        offset: newIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(newIndex);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      flatListRef.current?.scrollToOffset({
        offset: newIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(newIndex);
    }
  };

  const renderImage = ({ item }: ListRenderItemInfo<string>) => (
    <Image
      source={{ uri: item, headers: WIKI_IMAGE_HEADERS }}
      style={styles.image}
      resizeMode="cover"
    />
  );

  return (
    <View style={styles.container}>
      {/* Image Area */}
      <View style={styles.imageContainer}>
        {hasImages ? (
          <>
            <FlatList
              ref={flatListRef}
              data={images}
              renderItem={renderImage}
              keyExtractor={(_, index) => `hero-image-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              bounces={false}
            />

            {/* Chevron Buttons */}
            {hasMultipleImages && (
              <>
                <TouchableOpacity
                  style={[styles.chevronButton, styles.chevronLeft]}
                  onPress={goToPrevious}
                  disabled={currentIndex === 0}
                  accessibilityLabel="Previous image"
                >
                  <Icon
                    name="chevron-left"
                    size="md"
                    color={colors.primaryText}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.chevronButton, styles.chevronRight]}
                  onPress={goToNext}
                  disabled={currentIndex === images.length - 1}
                  accessibilityLabel="Next image"
                >
                  <Icon
                    name="chevron-right"
                    size="md"
                    color={colors.primaryText}
                  />
                </TouchableOpacity>
              </>
            )}

            {/* Pagination Dots */}
            {hasMultipleImages && (
              <View style={styles.dotsContainer}>
                {images.map((_, index) => (
                  <View
                    key={`dot-${index}`}
                    style={[
                      styles.dot,
                      index === currentIndex ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            {placeholder ?? (
              <View style={styles.defaultPlaceholder}>
                <Icon name="leaf" size="lg" colorToken="textMuted" />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Title Slab */}
      <View style={styles.titleSlab}>
        <H1 style={styles.title}>{title}</H1>
        {subtitle && <Body style={styles.subtitle}>{subtitle}</Body>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // No shadow on hero
  },

  // Image area
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: colors.backgroundSecondary,
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  placeholderContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  defaultPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Chevron buttons
  chevronButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronLeft: {
    left: 0,
  },
  chevronRight: {
    right: 0,
  },

  // Pagination dots
  dotsContainer: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  dotInactive: {
    backgroundColor: colors.borderMuted,
  },

  // Title slab
  titleSlab: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: borders.widthHeavy,
    borderTopColor: colors.border,
    borderBottomWidth: borders.widthHeavy,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
});

export default HeroMediaHeader;
