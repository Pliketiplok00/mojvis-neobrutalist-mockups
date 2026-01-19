/**
 * Mirror Click & Fix Form Screen (Design Mirror)
 *
 * Mirrors ClickFixFormScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Title
 * 2. Error container (optional)
 * 3. Subject field with label, input, char count, error
 * 4. Description field with label, multiline input, char count, error
 * 5. Location section (display or button)
 * 6. Photos section (thumbnails + add buttons)
 * 7. Submit button
 *
 * Rules:
 * - NO useNavigation import
 * - NO API calls
 * - NO real context hooks
 * - NO ImagePicker / Location services
 * - All actions are NO-OP
 * - Skin tokens only
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Icon } from '../../ui/Icon';
import { H1, H2, Body, Label, Meta, ButtonText } from '../../ui/Text';
import {
  clickFixFormFilledFixture,
  VALIDATION_LIMITS,
} from '../fixtures/clickfix';

/**
 * Mirror Click & Fix Form Screen
 * Uses clickFixFormFilledFixture for visual state
 */
export function MirrorClickFixFormScreen(): React.JSX.Element {
  // All data from fixture - no real state
  const fixture = clickFixFormFilledFixture;

  // NO-OP handlers - visual only
  const handleSubjectChange = (): void => {
    // Intentionally empty - mirror screens don't change state
  };

  const handleDescriptionChange = (): void => {
    // Intentionally empty - mirror screens don't change state
  };

  const handleGetLocation = (): void => {
    // Intentionally empty - mirror screens don't get location
  };

  const handlePickPhotos = (): void => {
    // Intentionally empty - mirror screens don't pick photos
  };

  const handleTakePhoto = (): void => {
    // Intentionally empty - mirror screens don't take photos
  };

  const handleRemovePhoto = (): void => {
    // Intentionally empty - mirror screens don't remove photos
  };

  const handleSubmit = (): void => {
    // Intentionally empty - mirror screens don't submit
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>ClickFixForm Mirror</H2>
        <Meta style={styles.headerMeta}>fixture: clickFixFormFilledFixture</Meta>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <H1>{fixture.title}</H1>
          </View>

          {/* Submit Error (shown when fixture has error) */}
          {fixture.error && (
            <View style={styles.errorContainer}>
              <Body style={styles.errorText}>{fixture.error}</Body>
            </View>
          )}

          {/* Subject Field */}
          <View style={styles.field}>
            <H2 style={styles.label}>
              {fixture.subjectLabel} <Label style={styles.required}>*</Label>
            </H2>
            <Input
              value={fixture.subject}
              onChangeText={handleSubjectChange}
              placeholder={fixture.subjectPlaceholder}
              maxLength={VALIDATION_LIMITS.SUBJECT_MAX_LENGTH}
              disabled={fixture.isSubmitting}
              error={!!fixture.fieldErrors?.subject}
              accessibilityLabel={fixture.subjectLabel}
            />
            <View style={styles.fieldFooter}>
              {fixture.fieldErrors?.subject && (
                <Label style={styles.fieldError}>{fixture.fieldErrors.subject}</Label>
              )}
              <Meta style={styles.charCount}>
                {fixture.subject.length}/{VALIDATION_LIMITS.SUBJECT_MAX_LENGTH}
              </Meta>
            </View>
          </View>

          {/* Description Field */}
          <View style={styles.field}>
            <H2 style={styles.label}>
              {fixture.descriptionLabel} <Label style={styles.required}>*</Label>
            </H2>
            <Input
              value={fixture.description}
              onChangeText={handleDescriptionChange}
              placeholder={fixture.descriptionPlaceholder}
              maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
              multiline
              height={120}
              disabled={fixture.isSubmitting}
              error={!!fixture.fieldErrors?.description}
              accessibilityLabel={fixture.descriptionLabel}
            />
            <View style={styles.fieldFooter}>
              {fixture.fieldErrors?.description && (
                <Label style={styles.fieldError}>{fixture.fieldErrors.description}</Label>
              )}
              <Meta style={styles.charCount}>
                {fixture.description.length}/{VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
              </Meta>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.field}>
            <H2 style={styles.label}>
              {fixture.locationLabel} <Label style={styles.required}>*</Label>
            </H2>
            {fixture.location ? (
              <View style={styles.locationDisplay}>
                <Body style={styles.locationText}>
                  {fixture.location.lat.toFixed(6)}, {fixture.location.lng.toFixed(6)}
                </Body>
                <TouchableOpacity
                  style={styles.changeLocationButton}
                  onPress={handleGetLocation}
                  disabled={fixture.isGettingLocation}
                >
                  <ButtonText style={styles.changeLocationText}>Promijeni</ButtonText>
                </TouchableOpacity>
              </View>
            ) : (
              <Button
                variant="secondary"
                onPress={handleGetLocation}
                loading={fixture.isGettingLocation}
                disabled={fixture.isGettingLocation || fixture.isSubmitting}
                style={fixture.fieldErrors?.location ? styles.locationButtonError : undefined}
              >
                Dohvati lokaciju
              </Button>
            )}
            {fixture.fieldErrors?.location && (
              <Label style={styles.fieldError}>{fixture.fieldErrors.location}</Label>
            )}
          </View>

          {/* Photos Section */}
          <View style={styles.field}>
            <H2 style={styles.label}>
              {fixture.photosLabel} ({fixture.photos.length}/{VALIDATION_LIMITS.MAX_PHOTOS})
            </H2>

            {/* Photo Thumbnails (placeholder boxes since we can't show real images) */}
            {fixture.photos.length > 0 && (
              <View style={styles.photoGrid}>
                {fixture.photos.map((photo, index) => (
                  <View key={photo.uri} style={styles.photoItem}>
                    <View style={styles.photoPlaceholder}>
                      <Icon name="camera" size="md" colorToken="textMuted" />
                      <Meta style={styles.photoFileName}>{photo.fileName}</Meta>
                    </View>
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={handleRemovePhoto}
                    >
                      <Icon name="close" size="sm" colorToken="background" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Photo Buttons */}
            {fixture.photos.length < VALIDATION_LIMITS.MAX_PHOTOS && (
              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handlePickPhotos}
                  disabled={fixture.isSubmitting}
                >
                  <ButtonText style={styles.addPhotoText}>Iz galerije</ButtonText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handleTakePhoto}
                  disabled={fixture.isSubmitting}
                >
                  <ButtonText style={styles.addPhotoText}>Slikaj</ButtonText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <Button
            variant="primary"
            onPress={handleSubmit}
            loading={fixture.isSubmitting}
            disabled={fixture.isSubmitting}
            style={styles.submitButton}
          >
            {fixture.submitLabel}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: skin.colors.background,
  },
  header: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundTertiary,
  },
  headerTitle: {
    marginBottom: skin.spacing.xs,
  },
  headerMeta: {
    color: skin.colors.textMuted,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: skin.spacing.lg,
    paddingBottom: skin.spacing.xxxl,
  },
  titleSection: {
    marginBottom: skin.spacing.xxl,
  },
  errorContainer: {
    backgroundColor: skin.colors.warningBackground,
    borderRadius: skin.borders.radiusCard,
    padding: skin.spacing.md,
    marginBottom: skin.spacing.lg,
  },
  errorText: {
    color: skin.colors.warningAccent,
    textAlign: 'center',
  },
  field: {
    marginBottom: skin.spacing.xl,
  },
  label: {
    marginBottom: skin.spacing.sm,
  },
  required: {
    color: skin.colors.errorText,
  },
  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: skin.spacing.xs,
  },
  fieldError: {
    color: skin.colors.errorText,
    flex: 1,
  },
  charCount: {
    color: skin.colors.textDisabled,
  },
  locationButtonError: {
    borderColor: skin.colors.errorText,
  },
  locationDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusCard,
    paddingHorizontal: skin.spacing.lg,
    paddingVertical: skin.spacing.md,
    backgroundColor: skin.colors.successBackground,
  },
  locationText: {
    color: skin.colors.successText,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  changeLocationButton: {
    paddingHorizontal: skin.spacing.md,
    paddingVertical: skin.spacing.sm,
    backgroundColor: skin.colors.textPrimary,
    borderRadius: skin.borders.radiusSmall,
  },
  changeLocationText: {
    color: skin.colors.background,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: skin.spacing.sm,
    marginBottom: skin.spacing.md,
  },
  photoItem: {
    position: 'relative',
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xs,
  },
  photoFileName: {
    color: skin.colors.textMuted,
    fontSize: 8,
    marginTop: skin.spacing.xs,
    textAlign: 'center',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: skin.colors.errorText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: skin.spacing.md,
  },
  addPhotoButton: {
    flex: 1,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderStyle: 'dashed',
    borderRadius: skin.borders.radiusCard,
    paddingVertical: skin.spacing.md,
    alignItems: 'center',
  },
  addPhotoText: {
    color: skin.colors.textPrimary,
  },
  submitButton: {
    marginTop: skin.spacing.lg,
  },
});

export default MirrorClickFixFormScreen;
