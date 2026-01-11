/**
 * Feedback Detail Screen
 *
 * Phase 5: View submitted feedback with status and replies.
 *
 * Shows:
 * - Subject + body (original)
 * - Current status label
 * - Replies list (chronological)
 *
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
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
import { skin } from '../../ui/skin';
import { H2, Body, Label, Meta, ButtonText } from '../../ui/Text';

type DetailRouteProp = RouteProp<MainStackParamList, 'FeedbackDetail'>;

// Status colors using semantic skin tokens
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  zaprimljeno: { bg: skin.colors.infoBackground, text: skin.colors.infoText },
  u_razmatranju: { bg: skin.colors.pendingBackground, text: skin.colors.pendingText },
  prihvaceno: { bg: skin.colors.successBackground, text: skin.colors.successText },
  odbijeno: { bg: skin.colors.errorBackground, text: skin.colors.errorText },
};

export function FeedbackDetailScreen(): React.JSX.Element {
  const route = useRoute<DetailRouteProp>();
  const { feedbackId } = route.params;
  const { t } = useTranslations();

  const [feedback, setFeedback] = useState<FeedbackDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setError(null);
    try {
      const data = await feedbackApi.getDetail(feedbackId);
      setFeedback(data);
    } catch (err) {
      console.error('[FeedbackDetail] Error fetching:', err);
      setError(t('feedback.detail.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [feedbackId]);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchFeedback();
  }, [fetchFeedback]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year}. ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={skin.colors.textPrimary} />
          <Body style={styles.loadingText}>{t('common.loading')}</Body>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !feedback) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.errorContainer}>
          <Body style={styles.errorText}>{error || t('feedback.detail.error')}</Body>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLORS[feedback.status] || STATUS_COLORS.zaprimljeno;

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
          <Meta style={styles.date}>{formatDate(feedback.created_at)}</Meta>
          <Body style={styles.body}>{feedback.body}</Body>
        </View>

        {/* Replies Section */}
        <View style={styles.repliesSection}>
          <H2 style={styles.sectionTitle}>{t('feedback.detail.replies')}</H2>

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
                  <Label style={styles.replyLabel}>Odgovor</Label>
                  <Meta style={styles.replyDate}>
                    {formatDate(reply.created_at)}
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
    padding: skin.spacing.lg,
    paddingBottom: skin.spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: skin.spacing.md,
    color: skin.colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xxl,
  },
  errorText: {
    color: skin.colors.warningAccent,
    textAlign: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: skin.spacing.lg,
    paddingVertical: skin.spacing.sm,
    borderRadius: skin.borders.radiusPill,
    marginBottom: skin.spacing.lg,
  },
  statusText: {
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
  },
  replyBody: {
    color: skin.colors.textSecondary,
    lineHeight: 22,
  },
});

export default FeedbackDetailScreen;
