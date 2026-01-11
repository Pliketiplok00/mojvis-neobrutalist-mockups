/**
 * Click & Fix Form Screen
 *
 * Phase 6: Form for submitting issue reports with location + photos.
 *
 * Fields:
 * - Subject (Naslov) - required, max 120 chars
 * - Description (Opis) - required, max 4000 chars
 * - Location - required (map picker)
 * - Photos - optional, 0-3 images
 *
 * Municipality is derived from onboarding context.
 *
 * Skin-pure: Uses skin tokens and Icon primitive (no hardcoded hex, no text glyphs).
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { GlobalHeader } from '../../components/GlobalHeader';
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
import { Icon } from '../../ui/Icon';
import { H1, H2, Body, Label, Meta, ButtonText } from '../../ui/Text';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

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
      console.error('[ClickFixForm] Error getting location:', err);
      Alert.alert(t('common.error'), t('clickFix.error.location'));
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  const handlePickPhotos = useCallback(async () => {
    if (photos.length >= VALIDATION_LIMITS.MAX_PHOTOS) {
      Alert.alert(
        t('clickFix.photoActions.maxTitle'),
        t('clickFix.photoActions.maxMessage')
      );
      return;
    }

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
      allowsMultipleSelection: true,
      selectionLimit: VALIDATION_LIMITS.MAX_PHOTOS - photos.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newPhotos = result.assets.map((asset) => ({
        uri: asset.uri,
        fileName: asset.fileName || `photo-${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
      }));
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, VALIDATION_LIMITS.MAX_PHOTOS));
    }
  }, [photos.length]);

  const handleTakePhoto = useCallback(async () => {
    if (photos.length >= VALIDATION_LIMITS.MAX_PHOTOS) {
      Alert.alert(
        t('clickFix.photoActions.maxTitle'),
        t('clickFix.photoActions.maxMessage')
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('clickFix.permissions.title'),
        t('clickFix.permissions.cameraDenied')
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setPhotos((prev) => [
        ...prev,
        {
          uri: asset.uri,
          fileName: asset.fileName || `photo-${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        },
      ].slice(0, VALIDATION_LIMITS.MAX_PHOTOS));
    }
  }, [photos.length]);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validate
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

      // Navigate to confirmation
      navigation.replace('ClickFixConfirmation', { clickFixId: response.id });
    } catch (err) {
      console.error('[ClickFixForm] Error submitting:', err);
      const errorMessage = err instanceof Error ? err.message : t('clickFix.error.submit');
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [subject, description, location, photos, navigation, userContext]);

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
          {/* Title */}
          <View style={styles.titleSection}>
            <H1>{t('clickFix.title')}</H1>
          </View>

          {/* Submit Error */}
          {submitError && (
            <View style={styles.errorContainer}>
              <Body style={styles.errorText}>{submitError}</Body>
            </View>
          )}

          {/* Subject Field */}
          <View style={styles.field}>
            <H2 style={styles.label}>
              {t('clickFix.titleField')} <Label style={styles.required}>*</Label>
            </H2>
            <TextInput
              style={[styles.input, errors.subject && styles.inputError]}
              value={subject}
              onChangeText={setSubject}
              placeholder={t('clickFix.titlePlaceholder')}
              placeholderTextColor={skin.colors.textDisabled}
              maxLength={VALIDATION_LIMITS.SUBJECT_MAX_LENGTH}
              editable={!isSubmitting}
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
          <View style={styles.field}>
            <H2 style={styles.label}>
              {t('clickFix.description')} <Label style={styles.required}>*</Label>
            </H2>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description && styles.inputError,
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder={t('clickFix.descriptionPlaceholder')}
              placeholderTextColor={skin.colors.textDisabled}
              maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!isSubmitting}
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

          {/* Location Section */}
          <View style={styles.field}>
            <H2 style={styles.label}>
              {t('clickFix.location')} <Label style={styles.required}>*</Label>
            </H2>
            {location ? (
              <View style={styles.locationDisplay}>
                <Body style={styles.locationText}>
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </Body>
                <TouchableOpacity
                  style={styles.changeLocationButton}
                  onPress={handleGetLocation}
                  disabled={isGettingLocation}
                >
                  <ButtonText style={styles.changeLocationText}>{t('clickFix.locationActions.change')}</ButtonText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  errors.location && styles.locationButtonError,
                ]}
                onPress={handleGetLocation}
                disabled={isGettingLocation || isSubmitting}
              >
                {isGettingLocation ? (
                  <ActivityIndicator color={skin.colors.textPrimary} />
                ) : (
                  <ButtonText style={styles.locationButtonText}>
                    {t('clickFix.locationActions.getLocation')}
                  </ButtonText>
                )}
              </TouchableOpacity>
            )}
            {errors.location && (
              <Label style={styles.fieldError}>{t(errors.location)}</Label>
            )}
          </View>

          {/* Photos Section */}
          <View style={styles.field}>
            <H2 style={styles.label}>
              {t('clickFix.photos')} ({photos.length}/{VALIDATION_LIMITS.MAX_PHOTOS})
            </H2>

            {/* Photo Thumbnails */}
            {photos.length > 0 && (
              <View style={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <View key={photo.uri} style={styles.photoItem}>
                    <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Icon name="close" size="sm" colorToken="background" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Photo Buttons */}
            {photos.length < VALIDATION_LIMITS.MAX_PHOTOS && (
              <View style={styles.photoButtons}>
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handlePickPhotos}
                  disabled={isSubmitting}
                >
                  <ButtonText style={styles.addPhotoText}>{t('clickFix.photoActions.pickFromGallery')}</ButtonText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handleTakePhoto}
                  disabled={isSubmitting}
                >
                  <ButtonText style={styles.addPhotoText}>{t('clickFix.photoActions.takePhoto')}</ButtonText>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <ActivityIndicator color={skin.colors.background} />
            ) : (
              <ButtonText style={styles.submitButtonText}>{t('clickFix.send')}</ButtonText>
            )}
          </TouchableOpacity>
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
  input: {
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusCard,
    paddingHorizontal: skin.spacing.lg,
    paddingVertical: skin.spacing.md,
    fontSize: skin.typography.fontSize.lg,
    color: skin.colors.textPrimary,
    backgroundColor: skin.colors.background,
  },
  inputError: {
    borderColor: skin.colors.errorText,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
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
  locationButton: {
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusCard,
    paddingVertical: skin.spacing.lg,
    alignItems: 'center',
    backgroundColor: skin.colors.backgroundSecondary,
  },
  locationButtonError: {
    borderColor: skin.colors.errorText,
  },
  locationButtonText: {
    color: skin.colors.textPrimary,
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
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
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
    backgroundColor: skin.colors.textPrimary,
    borderRadius: skin.borders.radiusCard,
    paddingVertical: skin.spacing.lg,
    alignItems: 'center',
    marginTop: skin.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: skin.colors.background,
  },
});

export default ClickFixFormScreen;
