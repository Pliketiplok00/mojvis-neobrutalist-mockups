/**
 * Feedback Detail Screen
 *
 * Phase 5: View submitted feedback with status and replies.
 *
 * Shows:
 * - Subject + body (original)
 * - Current status label
 * - Replies list (chronological)
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
import { feedbackApi } from '../../services/api';
import type { FeedbackDetailResponse } from '../../types/feedback';
import type { MainStackParamList } from '../../navigation/types';

type DetailRouteProp = RouteProp<MainStackParamList, 'FeedbackDetail'>;

// Status colors
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  zaprimljeno: { bg: '#E3F2FD', text: '#1565C0' },
  u_razmatranju: { bg: '#FFF3E0', text: '#E65100' },
  prihvaceno: { bg: '#E8F5E9', text: '#2E7D32' },
  odbijeno: { bg: '#FFEBEE', text: '#C62828' },
};

export function FeedbackDetailScreen(): React.JSX.Element {
  const route = useRoute<DetailRouteProp>();
  const { feedbackId } = route.params;

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
      setError('Greska pri ucitavanju poruke');
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
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Ucitavanje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !feedback) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Poruka nije pronadena'}</Text>
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
          <Text style={styles.sectionTitle}>Odgovori</Text>

          {feedback.replies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Još nema odgovora na vašu poruku.
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#856404',
    textAlign: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  messageCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  subject: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  repliesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  emptyState: {
    padding: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  replyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
  },
  replyDate: {
    fontSize: 12,
    color: '#666666',
  },
  replyBody: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
});

export default FeedbackDetailScreen;
