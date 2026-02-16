/**
 * Feedback Detail Screen
 *
 * Phase 5: View submitted feedback with status and replies.
 *
 * Shows:
 * - Colored category header with icon and subject
 * - Date and status metadata
 * - Body in bordered box
 * - Replies list (chronological)
 *
 * Design: Unified with InboxDetailScreen poster-style layout.
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useTranslations } from '../../i18n';
import { feedbackApi } from '../../services/api';
import type { FeedbackDetailResponse } from '../../types/feedback';
import type { MainStackParamList } from '../../navigation/types';
import {
  skin,
  Icon,
  H2,
  Body,
  Label,
  Meta,
  LinkText,
  LoadingState,
  ErrorState,
} from '../../ui';
import { formatDateTimeSlash } from '../../utils/dateFormat';

type DetailRouteProp = RouteProp<MainStackParamList, 'FeedbackDetail'>;

export function FeedbackDetailScreen(): React.JSX.Element {
  const route = useRoute<DetailRouteProp>();
  const { feedbackId } = route.params;
  const { t, language } = useTranslations();

  const [feedback, setFeedback] = useState<FeedbackDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setError(null);
    try {
      const data = await feedbackApi.getDetail(feedbackId, language);
      setFeedback(data);
    } catch (err) {
      console.error('[FeedbackDetail] Error fetching:', err);
      setError(t('feedback.detail.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [feedbackId, language, t]);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchFeedback();
  }, [fetchFeedback]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <LoadingState message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  if (error || !feedback) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <ErrorState message={error || t('feedback.detail.error')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Colored category header with icon and title */}
        <View style={styles.categoryHeader}>
          <View style={styles.headerContent}>
            <View style={styles.categoryIconBox}>
              <Icon name="send" size="lg" colorToken="textPrimary" />
            </View>
            <Label style={styles.headerTitle} numberOfLines={3}>
              {feedback.subject.toUpperCase()}
            </Label>
          </View>
        </View>

        {/* Meta row: date */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size="sm" colorToken="textMuted" />
            <Meta style={styles.metaText}>{formatDateTimeSlash(feedback.created_at)}</Meta>
          </View>
        </View>

        {/* Body in bordered box */}
        <View style={styles.bodyContainer}>
          <LinkText style={styles.bodyText}>{feedback.body}</LinkText>
        </View>

        {/* Replies Section */}
        <View style={styles.repliesSection}>
          <H2 style={styles.sectionTitle}>{t('feedback.detail.replies').toUpperCase()}</H2>

          {feedback.replies.length === 0 ? (
            <View style={styles.emptyState}>
              <Body style={styles.emptyText}>
                {t('feedback.detail.noReplies')}
              </Body>
            </View>
          ) : (
            feedback.replies.map((reply) => (
              <View key={reply.id} style={styles.replyCard}>
                <View style={styles.replyHeader}>
                  <Label style={styles.replyLabel}>ODGOVOR</Label>
                  <Meta style={styles.replyDate}>
                    {formatDateTimeSlash(reply.created_at)}
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: skin.spacing.xxxl,
  },

  // Category header with title (lavender for feedback)
  categoryHeader: {
    padding: skin.spacing.lg,
    backgroundColor: skin.colors.lavender,
    borderBottomWidth: skin.borders.widthCard,
    borderBottomColor: skin.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.md,
  },
  categoryIconBox: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: skin.typography.fontSize.xl,
    fontWeight: '700',
    color: skin.colors.textPrimary,
    fontFamily: skin.typography.fontFamily.display.bold,
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: skin.spacing.lg,
    paddingHorizontal: skin.spacing.lg,
    paddingTop: skin.spacing.lg,
    paddingBottom: skin.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.xs,
  },
  metaText: {
    color: skin.colors.textMuted,
  },

  // Body container (bordered box)
  bodyContainer: {
    marginHorizontal: skin.spacing.lg,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    padding: skin.spacing.lg,
    backgroundColor: skin.colors.background,
  },
  bodyText: {
    fontSize: skin.typography.fontSize.lg,
    fontFamily: skin.typography.fontFamily.body.regular,
    color: skin.colors.textSecondary,
    lineHeight: skin.typography.fontSize.lg * skin.typography.lineHeight.relaxed,
  },

  // Replies section
  repliesSection: {
    marginTop: skin.spacing.xl,
    paddingHorizontal: skin.spacing.lg,
  },
  sectionTitle: {
    marginBottom: skin.spacing.md,
    fontSize: skin.typography.fontSize.sm,
    letterSpacing: 1,
  },
  emptyState: {
    padding: skin.spacing.xxl,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    alignItems: 'center',
    backgroundColor: skin.colors.background,
  },
  emptyText: {
    color: skin.colors.textMuted,
    textAlign: 'center',
  },
  replyCard: {
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    padding: skin.spacing.lg,
    marginBottom: skin.spacing.md,
    backgroundColor: skin.colors.background,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: skin.spacing.sm,
  },
  replyLabel: {
    fontWeight: '700',
  },
  replyDate: {
    color: skin.colors.textMuted,
  },
  replyBody: {
    color: skin.colors.textSecondary,
    lineHeight: 22,
  },
});

export default FeedbackDetailScreen;
