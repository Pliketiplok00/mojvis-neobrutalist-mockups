/**
 * Click & Fix Form Screen (Slikaj & Popravi)
 *
 * Form for submitting issue reports with location + photos.
 * Redesigned with neobrutalist styling and orange header.
 *
 * Fields:
 * - Location - required (GPS)
 * - Photos - optional, 0-3 images (fixed 3 tiles)
 * - Subject (Naslov) - required, max 120 chars
 * - Description (Opis) - required, max 4000 chars
 *
 * Municipality is derived from onboarding context.
 *
 * Skin-pure: Uses skin tokens and primitives only.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';

import { GlobalHeader } from '../../components/GlobalHeader';
import { ServicePageHeader } from '../../components/services/ServicePageHeader';
import { FormSectionHeader } from '../../components/common/FormSectionHeader';
import { PhotoSlotTile } from '../../components/common/PhotoSlotTile';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { clickFixApi } from '../../services/api';
import {
  validateClickFixForm,
  VALIDATION_LIMITS,
} from '../../types/click-fix';
import type { Location as LocationType, PhotoToUpload } from '../../types/click-fix';
import type { MainStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Icon } from '../../ui/Icon';
import { Body, Label, Meta } from '../../ui/Text';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const { colors, spacing, borders } = skin;

/**
 * Max photo dimensions for upload.
 * Resizing to 1920px width keeps quality while reducing file size
 * from 10-20MB to typically under 1MB.
 */
const MAX_PHOTO_WIDTH = 1920;
const PHOTO_COMPRESSION = 0.8;

/**
 * Resize photo to max width while maintaining aspect ratio.
 * This prevents "Network request failed" errors from large photos.
 *
 * Returns the resized URI or throws an error with details.
 */
async function resizePhoto(uri: string): Promise<{ uri: string; size: number }> {
  console.info('[ClickFix] Resizing photo:', uri);

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_PHOTO_WIDTH } }],
    { compress: PHOTO_COMPRESSION, format: ImageManipulator.SaveFormat.JPEG }
  );

  // Verify the resized file exists and get its size
  const fileInfo = await FileSystem.getInfoAsync(result.uri);

  if (!fileInfo.exists) {
    throw new Error('Resized photo file does not exist');
  }

  // Size is available on the fileInfo when the file exists
  const size = (fileInfo as { size?: number }).size ?? 0;
  console.info('[ClickFix] Resized photo:', {
    uri: result.uri,
    width: result.width,
    height: result.height,
    size: `${(size / 1024).toFixed(1)} KB`,
  });

  return { uri: result.uri, size };
}

export function ClickFixFormScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslations();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationType | null>(null);
  const [photos, setPhotos] = useState<PhotoToUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errors, setErrors] = useState<{
    subject?: string;
    description?: string;
    location?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const userContext = useUserContext();

  const handleGetLocation = useCallback(async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('clickFix.permissions.locationTitle'),
          t('clickFix.permissions.locationDenied')
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
      });
      setErrors((prev) => ({ ...prev, location: undefined }));
    } catch (err) {
      Alert.alert(t('common.error'), t('clickFix.error.location'));
    } finally {
      setIsGettingLocation(false);
    }
  }, [t]);

  const handlePickPhoto = useCallback(async (slotIndex: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('clickFix.permissions.title'),
        t('clickFix.permissions.galleryDenied')
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1, // Full quality - we'll compress in resize
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];

      try {
        // Resize photo to reduce file size (prevents network errors)
        const resized = await resizePhoto(asset.uri);

        const newPhoto: PhotoToUpload = {
          uri: resized.uri,
          fileName: `photo-${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
        };

        setPhotos((prev) => {
          const updated = [...prev];
          if (slotIndex < updated.length) {
            updated[slotIndex] = newPhoto;
          } else {
            updated.push(newPhoto);
          }
          return updated.slice(0, VALIDATION_LIMITS.MAX_PHOTOS);
        });
      } catch (error) {
        console.error('[ClickFix] Error resizing photo:', error);
        Alert.alert(
          t('common.error'),
          t('clickFix.error.photoResize')
        );
      }
    }
  }, [t]);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    const validation = validateClickFixForm(subject, description, location);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await clickFixApi.submit(
        userContext,
        {
          subject: subject.trim(),
          description: description.trim(),
          location: location as LocationType,
        },
        photos
      );

      navigation.replace('ClickFixConfirmation', { clickFixId: response.id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('clickFix.error.submit');
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [subject, description, location, photos, navigation, userContext, t]);

  const photoCount = photos.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Slab */}
          <ServicePageHeader
            title={t('clickFix.title')}
            subtitle={t('clickFix.subtitle')}
            icon="camera"
            backgroundColor="orange"
          />

          {/* Submit Error */}
          {submitError && (
            <View style={styles.errorContainer}>
              <Body style={styles.errorText}>{submitError}</Body>
            </View>
          )}

          {/* Location Section */}
          <View style={styles.section}>
            <FormSectionHeader
              icon="map-pin"
              label={t('clickFix.location')}
              required
            />
            {location ? (
              <View style={styles.locationCard}>
                <View style={styles.locationInfo}>
                  <Icon name="check" size="sm" colorToken="successText" />
                  <Body style={styles.locationText}>
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </Body>
                </View>
                <Pressable
                  style={styles.locationClearButton}
                  onPress={() => setLocation(null)}
                  accessibilityLabel={t('common.close')}
                >
                  <Icon name="close" size="sm" colorToken="textMuted" />
                </Pressable>
              </View>
            ) : (
              <Button
                variant="primary"
                onPress={handleGetLocation}
                loading={isGettingLocation}
                disabled={isGettingLocation || isSubmitting}
                style={errors.location ? styles.buttonError : undefined}
              >
                {t('clickFix.locationActions.getLocation')}
              </Button>
            )}
            {errors.location && (
              <Label style={styles.fieldError}>{t(errors.location)}</Label>
            )}
          </View>

          {/* Photos Section */}
          <View style={styles.section}>
            <FormSectionHeader
              icon="camera"
              label={t('clickFix.photos')}
              count={`${photoCount}/${VALIDATION_LIMITS.MAX_PHOTOS}`}
            />
            <View style={styles.photoGrid}>
              {[0, 1, 2].map((slotIndex) => (
                <PhotoSlotTile
                  key={slotIndex}
                  photoUri={photos[slotIndex]?.uri}
                  onPickPhoto={() => handlePickPhoto(slotIndex)}
                  onRemove={photos[slotIndex] ? () => handleRemovePhoto(slotIndex) : undefined}
                  disabled={isSubmitting}
                />
              ))}
            </View>
          </View>

          {/* Subject Field */}
          <View style={styles.section}>
            <FormSectionHeader
              icon="file-text"
              label={t('clickFix.titleField')}
              required
            />
            <Input
              value={subject}
              onChangeText={setSubject}
              placeholder={t('clickFix.titlePlaceholder')}
              maxLength={VALIDATION_LIMITS.SUBJECT_MAX_LENGTH}
              disabled={isSubmitting}
              error={!!errors.subject}
              accessibilityLabel={t('clickFix.titleField')}
            />
            <View style={styles.fieldFooter}>
              {errors.subject && (
                <Label style={styles.fieldError}>{t(errors.subject)}</Label>
              )}
              <Meta style={styles.charCount}>
                {subject.length}/{VALIDATION_LIMITS.SUBJECT_MAX_LENGTH}
              </Meta>
            </View>
          </View>

          {/* Description Field */}
          <View style={styles.section}>
            <FormSectionHeader
              icon="file-text"
              label={t('clickFix.description')}
              required
            />
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder={t('clickFix.descriptionPlaceholder')}
              maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
              multiline
              height={120}
              disabled={isSubmitting}
              error={!!errors.description}
              accessibilityLabel={t('clickFix.description')}
            />
            <View style={styles.fieldFooter}>
              {errors.description && (
                <Label style={styles.fieldError}>{t(errors.description)}</Label>
              )}
              <Meta style={styles.charCount}>
                {description.length}/{VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
              </Meta>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <Button
              variant="primary"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              shadow
            >
              {t('clickFix.send')}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  errorContainer: {
    backgroundColor: colors.errorBackground,
    borderWidth: borders.widthThin,
    borderColor: colors.errorText,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  errorText: {
    color: colors.errorText,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  locationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.successBackground,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
    padding: spacing.md,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationText: {
    color: colors.successText,
    fontFamily: skin.typography.fontFamily.body.regular,
  },
  locationClearButton: {
    padding: spacing.xs,
  },
  buttonError: {
    borderColor: colors.errorText,
  },
  fieldError: {
    color: colors.errorText,
    marginTop: spacing.xs,
  },
  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  charCount: {
    color: colors.textDisabled,
    marginLeft: 'auto',
  },
  photoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  submitSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
});

export default ClickFixFormScreen;
