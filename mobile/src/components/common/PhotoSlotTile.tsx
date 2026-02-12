/**
 * PhotoSlotTile Component
 *
 * A tile for photo slots in form screens.
 * Polish version: simplified empty state, neobrut shadow on filled.
 *
 * Features:
 * - Empty state: dashed border with centered camera icon (taps to pick photo)
 * - Filled state: photo thumbnail with neobrut offset shadow + remove button
 *
 * Skin-pure: Uses skin tokens only.
 */

import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';

const SHADOW_OFFSET = 4;

interface PhotoSlotTileProps {
  /** Photo URI if filled, undefined if empty */
  photoUri?: string;
  /** Called when empty tile is pressed (opens picker) */
  onPickPhoto?: () => void;
  /** Called when remove button is pressed */
  onRemove?: () => void;
  /** Whether the tile is disabled */
  disabled?: boolean;
}

const { colors, spacing, borders } = skin;

export function PhotoSlotTile({
  photoUri,
  onPickPhoto,
  onRemove,
  disabled,
}: PhotoSlotTileProps): React.JSX.Element {
  // Filled state - show photo with neobrut shadow and remove button
  if (photoUri) {
    return (
      <View style={styles.filledWrapper}>
        {/* Shadow layer */}
        <View style={styles.shadowLayer} />
        {/* Main tile */}
        <View style={styles.filledContainer}>
          <Image source={{ uri: photoUri }} style={styles.photo} />
          {onRemove && !disabled && (
            <Pressable
              style={styles.removeButton}
              onPress={onRemove}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
            >
              <Icon name="close" size="sm" colorToken="background" />
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // Empty state - dashed border with centered camera icon
  return (
    <Pressable
      style={styles.emptyContainer}
      onPress={onPickPhoto}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Add photo"
    >
      <Icon name="camera" size="lg" colorToken="textMuted" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borders.radiusSharp,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  filledWrapper: {
    flex: 1,
    aspectRatio: 1,
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: SHADOW_OFFSET,
    left: SHADOW_OFFSET,
    right: -SHADOW_OFFSET,
    bottom: -SHADOW_OFFSET,
    backgroundColor: colors.border,
    borderRadius: borders.radiusSharp,
  },
  filledContainer: {
    flex: 1,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
    borderRadius: borders.radiusSharp,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: borders.radiusSharp,
    backgroundColor: colors.errorText,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PhotoSlotTile;
