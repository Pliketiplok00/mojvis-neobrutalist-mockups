/**
 * Mirror Feedback Form Screen (Design Mirror)
 *
 * Mirrors FeedbackFormScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Title
 * 2. Error container (optional)
 * 3. Subject field with label, input, char count, error
 * 4. Body field with label, multiline input, char count, error
 * 5. Submit button
 *
 * Rules:
 * - NO useNavigation import
 * - NO API calls
 * - NO real context hooks
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { H1, H2, Body, Label, Meta } from '../../ui/Text';
import {
  feedbackFormFilledFixture,
  VALIDATION_LIMITS,
} from '../fixtures/feedback';

/**
 * Mirror Feedback Form Screen
 * Uses feedbackFormFilledFixture for visual state
 */
export function MirrorFeedbackFormScreen(): React.JSX.Element {
  // All data from fixture - no real state
  const fixture = feedbackFormFilledFixture;

  // NO-OP handlers - visual only
  const handleSubjectChange = (): void => {
    // Intentionally empty - mirror screens don't change state
  };

  const handleBodyChange = (): void => {
    // Intentionally empty - mirror screens don't change state
  };

  const handleSubmit = (): void => {
    // Intentionally empty - mirror screens don't submit
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>FeedbackForm Mirror</H2>
        <Meta style={styles.headerMeta}>fixture: feedbackFormFilledFixture</Meta>
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

          {/* Body Field */}
          <View style={styles.field}>
            <H2 style={styles.label}>
              {fixture.bodyLabel} <Label style={styles.required}>*</Label>
            </H2>
            <Input
              value={fixture.body}
              onChangeText={handleBodyChange}
              placeholder={fixture.bodyPlaceholder}
              maxLength={VALIDATION_LIMITS.BODY_MAX_LENGTH}
              multiline
              height={160}
              disabled={fixture.isSubmitting}
              error={!!fixture.fieldErrors?.body}
              accessibilityLabel={fixture.bodyLabel}
            />
            <View style={styles.fieldFooter}>
              {fixture.fieldErrors?.body && (
                <Label style={styles.fieldError}>{fixture.fieldErrors.body}</Label>
              )}
              <Meta style={styles.charCount}>
                {fixture.body.length}/{VALIDATION_LIMITS.BODY_MAX_LENGTH}
              </Meta>
            </View>
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
  submitButton: {
    marginTop: skin.spacing.lg,
  },
});

export default MirrorFeedbackFormScreen;
