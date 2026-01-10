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
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
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
            <Text style={styles.title}>{t('feedback.title')}</Text>
          </View>

          {/* Submit Error */}
          {submitError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{submitError}</Text>
            </View>
          )}

          {/* Subject Field */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('feedback.subject')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.subject && styles.inputError]}
              value={subject}
              onChangeText={setSubject}
              placeholder={t('feedback.subjectPlaceholder')}
              placeholderTextColor="#999999"
              maxLength={VALIDATION_LIMITS.SUBJECT_MAX_LENGTH}
              editable={!isSubmitting}
            />
            <View style={styles.fieldFooter}>
              {errors.subject && (
                <Text style={styles.fieldError}>{t(errors.subject)}</Text>
              )}
              <Text style={styles.charCount}>
                {subject.length}/{VALIDATION_LIMITS.SUBJECT_MAX_LENGTH}
              </Text>
            </View>
          </View>

          {/* Body Field */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('feedback.message')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.body && styles.inputError,
              ]}
              value={body}
              onChangeText={setBody}
              placeholder={t('feedback.messagePlaceholder')}
              placeholderTextColor="#999999"
              maxLength={VALIDATION_LIMITS.BODY_MAX_LENGTH}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
            <View style={styles.fieldFooter}>
              {errors.body && (
                <Text style={styles.fieldError}>{t(errors.body)}</Text>
              )}
              <Text style={styles.charCount}>
                {body.length}/{VALIDATION_LIMITS.BODY_MAX_LENGTH}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>{t('feedback.send')}</Text>
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
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  required: {
    color: '#CC0000',
  },
  input: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#CC0000',
  },
  textArea: {
    height: 160,
    textAlignVertical: 'top',
  },
  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  fieldError: {
    fontSize: 12,
    color: '#CC0000',
    flex: 1,
  },
  charCount: {
    fontSize: 12,
    color: '#999999',
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FeedbackFormScreen;
