/**
 * Mirror Feedback Confirmation Screen (Design Mirror)
 *
 * Mirrors FeedbackConfirmationScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Success icon container
 * 2. Title
 * 3. Message
 * 4. Primary button (view feedback)
 * 5. Secondary button (go home)
 *
 * Rules:
 * - NO useNavigation import
 * - NO useRoute import
 * - All actions are NO-OP
 * - Skin tokens only
 */

import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { Button } from '../../ui/Button';
import { H1, H2, Body, Meta } from '../../ui/Text';
import { feedbackConfirmationFixture } from '../fixtures/feedback';

/**
 * Mirror Feedback Confirmation Screen
 * Uses feedbackConfirmationFixture for visual state
 */
export function MirrorFeedbackConfirmationScreen(): React.JSX.Element {
  // All data from fixture
  const fixture = feedbackConfirmationFixture;

  // NO-OP handlers - visual only
  const handleViewFeedback = (): void => {
    // Intentionally empty - mirror screens don't navigate
  };

  const handleGoHome = (): void => {
    // Intentionally empty - mirror screens don't navigate
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>FeedbackConfirmation Mirror</H2>
        <Meta style={styles.headerMeta}>feedbackId: {fixture.feedbackId}</Meta>
      </View>

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Icon name="check" size="xl" colorToken="background" />
        </View>

        {/* Success Message */}
        <H1 style={styles.title}>{fixture.title}</H1>
        <Body style={styles.message}>
          {fixture.message}
        </Body>

        {/* Actions */}
        <View style={styles.actions}>
          <Button variant="primary" onPress={handleViewFeedback}>
            {fixture.primaryButtonLabel}
          </Button>

          <Button variant="secondary" onPress={handleGoHome}>
            {fixture.secondaryButtonLabel}
          </Button>
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xxxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: skin.colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: skin.spacing.xxl,
  },
  title: {
    marginBottom: skin.spacing.md,
    textAlign: 'center',
  },
  message: {
    color: skin.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: skin.spacing.xxxl,
  },
  actions: {
    width: '100%',
    gap: skin.spacing.md,
  },
});

export default MirrorFeedbackConfirmationScreen;
