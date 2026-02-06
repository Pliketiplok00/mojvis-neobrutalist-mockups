/**
 * PhotoSlotTile Component
 *
 * A dashed-bordered tile for photo slots in form screens.
 * Can display either an empty slot (with action buttons) or a photo thumbnail.
 *
 * Features:
 * - Empty state: dashed border with camera/gallery icons
 * - Filled state: photo thumbnail with remove button
 * - Neobrutalist styling (sharp corners, thick borders)
 *
 * Skin-pure: Uses skin tokens only.
 */

import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { Meta } from '../../ui/Text';

interface PhotoSlotTileProps {
  /** Photo URI if filled, undefined if empty */
  photoUri?: string;
  /** Called when empty tile is pressed for camera */
  onTakePhoto?: () => void;
  /** Called when empty tile is pressed for gallery */
  onPickPhoto?: () => void;
  /** Called when remove button is pressed */
  onRemove?: () => void;
  /** Whether the tile is disabled */
  disabled?: boolean;
  /** Label for take photo action */
  takePhotoLabel?: string;
  /** Label for pick photo action */
  pickPhotoLabel?: string;
}

const { colors, spacing, borders } = skin;

const TILE_SIZE = 100;

export function PhotoSlotTile({
  photoUri,
  onTakePhoto,
  onPickPhoto,
  onRemove,
  disabled,
  takePhotoLabel = 'Slikaj',
  pickPhotoLabel = 'Galerija',
}: PhotoSlotTileProps): React.JSX.Element {
  // Filled state - show photo with remove button
  if (photoUri) {
    return (
      <View style={styles.filledContainer}>
        <Image source={{ uri: photoUri }} style={styles.photo} />
        {onRemove && !disabled && (
          <Pressable
            style={styles.removeButton}
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
          >
            <Icon name="close" size="sm" color={colors.background} />
          </Pressable>
        )}
      </View>
    );
  }

  // Empty state - show action buttons
  return (
    <View style={styles.emptyContainer}>
      <Pressable
        style={styles.actionButton}
        onPress={onTakePhoto}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={takePhotoLabel}
      >
        <Icon name="camera" size="md" colorToken="textMuted" />
        <Meta style={styles.actionLabel}>{takePhotoLabel}</Meta>
      </Pressable>
      <View style={styles.divider} />
      <Pressable
        style={styles.actionButton}
        onPress={onPickPhoto}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={pickPhotoLabel}
      >
        <Icon name="inbox" size="md" colorToken="textMuted" />
        <Meta style={styles.actionLabel}>{pickPhotoLabel}</Meta>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
    borderStyle: 'dashed',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledContainer: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    position: 'relative',
  },
  photo: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
  },
  removeButton: {
    position: 'absolute',
    top: -spacing.sm,
    right: -spacing.sm,
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: spacing.md,
    backgroundColor: colors.errorText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  divider: {
    width: '80%',
    height: borders.widthHairline,
    backgroundColor: colors.borderLight,
  },
  actionLabel: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default PhotoSlotTile;
