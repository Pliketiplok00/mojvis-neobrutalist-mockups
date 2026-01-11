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
  Text,
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
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !feedback) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || t('feedback.detail.error')}</Text>
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
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {feedback.status_label}
          </Text>
        </View>

        {/* Original Message */}
        <View style={styles.messageCard}>
          <Text style={styles.subject}>{feedback.subject}</Text>
          <Text style={styles.date}>{formatDate(feedback.created_at)}</Text>
          <Text style={styles.body}>{feedback.body}</Text>
        </View>

        {/* Replies Section */}
        <View style={styles.repliesSection}>
          <Text style={styles.sectionTitle}>{t('feedback.detail.replies')}</Text>

          {feedback.replies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {t('feedback.detail.noReplies')}
              </Text>
            </View>
          ) : (
            feedback.replies.map((reply) => (
              <View key={reply.id} style={styles.replyCard}>
                <View style={styles.replyHeader}>
                  <Text style={styles.replyLabel}>Odgovor</Text>
                  <Text style={styles.replyDate}>
                    {formatDate(reply.created_at)}
                  </Text>
                </View>
                <Text style={styles.replyBody}>{reply.body}</Text>
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
    fontSize: skin.typography.fontSize.md,
    color: skin.colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xxl,
  },
  errorText: {
    fontSize: skin.typography.fontSize.lg,
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
    fontSize: skin.typography.fontSize.md,
    fontWeight: skin.typography.fontWeight.semiBold,
  },
  messageCard: {
    backgroundColor: skin.colors.backgroundSecondary,
    borderRadius: skin.borders.radiusCard,
    padding: skin.spacing.lg,
    marginBottom: skin.spacing.xxl,
  },
  subject: {
    fontSize: skin.typography.fontSize.xl,
    fontWeight: skin.typography.fontWeight.bold,
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.xs,
  },
  date: {
    fontSize: skin.typography.fontSize.sm,
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.lg,
  },
  body: {
    fontSize: skin.typography.fontSize.lg,
    color: skin.colors.textSecondary,
    lineHeight: 24,
  },
  repliesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: skin.typography.fontSize.xl,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.md,
  },
  emptyState: {
    padding: skin.spacing.xxl,
    backgroundColor: skin.colors.backgroundSecondary,
    borderRadius: skin.borders.radiusCard,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: skin.typography.fontSize.md,
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
    fontSize: skin.typography.fontSize.sm,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textPrimary,
    textTransform: 'uppercase',
  },
  replyDate: {
    fontSize: skin.typography.fontSize.sm,
    color: skin.colors.textMuted,
  },
  replyBody: {
    fontSize: skin.typography.fontSize.md,
    color: skin.colors.textSecondary,
    lineHeight: 22,
  },
});

export default FeedbackDetailScreen;
