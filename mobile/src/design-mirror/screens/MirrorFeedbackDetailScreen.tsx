/**
 * Mirror Feedback Detail Screen (Design Mirror)
 *
 * Mirrors FeedbackDetailScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Status badge (colored by status)
 * 2. Message card (subject, date, body)
 * 3. Replies section (list or empty state)
 *
 * Rules:
 * - NO useNavigation import
 * - NO useRoute import
 * - NO API calls
 * - Uses STATUS_COLORS from ui/utils (safe import)
 * - Skin tokens only
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { STATUS_COLORS } from '../../ui/utils/statusColors';
import { H2, Body, Label, Meta, ButtonText } from '../../ui/Text';
import {
  feedbackDetailFixture,
  feedbackDetailLabels,
} from '../fixtures/feedback';

/**
 * Format date in Croatian style (DD.MM.YYYY. HH:mm)
 */
function formatDateCroatian(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year}. ${hours}:${minutes}`;
}

/**
 * Mirror Feedback Detail Screen
 * Uses feedbackDetailFixture for visual state
 */
export function MirrorFeedbackDetailScreen(): React.JSX.Element {
  // All data from fixture
  const feedback = feedbackDetailFixture;
  const labels = feedbackDetailLabels;

  // Get status colors from production utility
  const statusColor = STATUS_COLORS[feedback.status] || STATUS_COLORS.zaprimljeno;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>FeedbackDetail Mirror</H2>
        <Meta style={styles.headerMeta}>id: {feedback.id}</Meta>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Status Badge */}
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
        >
          <ButtonText style={[styles.statusText, { color: statusColor.text }]}>
            {feedback.status_label}
          </ButtonText>
        </View>

        {/* Original Message */}
        <View style={styles.messageCard}>
          <H2 style={styles.subject}>{feedback.subject}</H2>
          <Meta style={styles.date}>{formatDateCroatian(feedback.created_at)}</Meta>
          <Body style={styles.body}>{feedback.body}</Body>
        </View>

        {/* Replies Section */}
        <View style={styles.repliesSection}>
          <H2 style={styles.sectionTitle}>{labels.repliesTitle}</H2>

          {feedback.replies.length === 0 ? (
            <View style={styles.emptyState}>
              <Body style={styles.emptyText}>
                {labels.noReplies}
              </Body>
            </View>
          ) : (
            feedback.replies.map((reply) => (
              <View key={reply.id} style={styles.replyCard}>
                <View style={styles.replyHeader}>
                  <Label style={styles.replyLabel}>{labels.replyLabel}</Label>
                  <Meta style={styles.replyDate}>
                    {formatDateCroatian(reply.created_at)}
                  </Meta>
                </View>
                <Body style={styles.replyBody}>{reply.body}</Body>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: skin.spacing.lg,
    paddingBottom: skin.spacing.xxxl,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: skin.spacing.lg,
    paddingVertical: skin.spacing.sm,
    borderRadius: skin.borders.radiusPill,
    marginBottom: skin.spacing.lg,
  },
  statusText: {
    // color set dynamically
  },
  messageCard: {
    backgroundColor: skin.colors.backgroundSecondary,
    borderRadius: skin.borders.radiusCard,
    padding: skin.spacing.lg,
    marginBottom: skin.spacing.xxl,
  },
  subject: {
    marginBottom: skin.spacing.xs,
  },
  date: {
    marginBottom: skin.spacing.lg,
  },
  body: {
    color: skin.colors.textSecondary,
    lineHeight: 24,
  },
  repliesSection: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: skin.spacing.md,
  },
  emptyState: {
    padding: skin.spacing.xxl,
    backgroundColor: skin.colors.backgroundSecondary,
    borderRadius: skin.borders.radiusCard,
    alignItems: 'center',
  },
  emptyText: {
    color: skin.colors.textMuted,
    textAlign: 'center',
  },
  replyCard: {
    backgroundColor: skin.colors.background,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusCard,
    padding: skin.spacing.lg,
    marginBottom: skin.spacing.md,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: skin.spacing.sm,
  },
  replyLabel: {
    textTransform: 'uppercase',
  },
  replyDate: {
    // uses Meta defaults
  },
  replyBody: {
    color: skin.colors.textSecondary,
    lineHeight: 22,
  },
});

export default MirrorFeedbackDetailScreen;
