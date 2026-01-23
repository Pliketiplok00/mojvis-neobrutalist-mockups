/**
 * Feedback Form Screen
 *
 * Phase 5: Form for submitting user feedback.
 *
 * Fields:
 * - Subject (Tema) - required, max 120 chars
 * - Message (Poruka) - required, max 4000 chars
 *
 * No contact fields. No category.
 * Municipality is derived from onboarding context.
 *
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { feedbackApi } from '../../services/api';
import { validateFeedbackForm, VALIDATION_LIMITS } from '../../types/feedback';
import type { MainStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { H1, H2, Body, Label, Meta } from '../../ui/Text';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export function FeedbackFormScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslations();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ subject?: string; body?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const userContext = useUserContext();

  const handleSubmit = useCallback(async () => {
    // Validate
    const validation = validateFeedbackForm(subject, body);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await feedbackApi.submit(userContext, {
        subject: subject.trim(),
        body: body.trim(),
      });

      // Navigate to confirmation
      navigation.replace('FeedbackConfirmation', { feedbackId: response.id });
    } catch (err) {
      console.error('[FeedbackForm] Error submitting:', err);
      const errorMessage = err instanceof Error ? err.message : t('feedback.error.submit');
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [subject, body, navigation, userContext]);

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
            <H1>{t('feedback.title')}</H1>
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
              {t('feedback.subject')} <Label style={styles.required}>*</Label>
            </H2>
            <Input
              value={subject}
              onChangeText={setSubject}
              placeholder={t('feedback.subjectPlaceholder')}
              maxLength={VALIDATION_LIMITS.SUBJECT_MAX_LENGTH}
              disabled={isSubmitting}
              error={!!errors.subject}
              accessibilityLabel={t('feedback.subject')}
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

          {/* Body Field */}
          <View style={styles.field}>
            <H2 style={styles.label}>
              {t('feedback.message')} <Label style={styles.required}>*</Label>
            </H2>
            <Input
              value={body}
              onChangeText={setBody}
              placeholder={t('feedback.messagePlaceholder')}
              maxLength={VALIDATION_LIMITS.BODY_MAX_LENGTH}
              multiline
              height={160}
              disabled={isSubmitting}
              error={!!errors.body}
              accessibilityLabel={t('feedback.message')}
            />
            <View style={styles.fieldFooter}>
              {errors.body && (
                <Label style={styles.fieldError}>{t(errors.body)}</Label>
              )}
              <Meta style={styles.charCount}>
                {body.length}/{VALIDATION_LIMITS.BODY_MAX_LENGTH}
              </Meta>
            </View>
          </View>

          {/* Submit Button */}
          <Button
            variant="primary"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            {t('feedback.send')}
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
  submitButton: {
    marginTop: skin.spacing.lg,
  },
});

export default FeedbackFormScreen;
