/**
 * Inbox Detail Screen
 *
 * Shows full content of a single inbox message.
 *
 * Rules:
 * - Header type is 'inbox' (no inbox icon shown)
 * - Uses back navigation (child screen)
 * - Marks message as read on open
 * - Shows urgent badge for hitno messages
 *
 * REFACTORED: Now uses UI primitives from src/ui/
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useUnread } from '../../contexts/UnreadContext';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { inboxApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { MainStackParamList } from '../../navigation/types';

// UI Primitives
import {
  skin,
  Header,
  Button,
  Badge,
  H1,
  Body,
  Meta,
  Icon,
} from '../../ui';

type DetailRouteProp = RouteProp<MainStackParamList, 'InboxDetail'>;

export function InboxDetailScreen(): React.JSX.Element {
  const route = useRoute<DetailRouteProp>();
  const { messageId } = route.params;
  const { markAsRead } = useUnread();
  const { t } = useTranslations();

  const [message, setMessage] = useState<InboxMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userContext = useUserContext();

  const fetchMessage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await inboxApi.getMessage(userContext, messageId);
      setMessage(data);
      markAsRead(messageId);
    } catch (err) {
      console.error('[Inbox] Error fetching message:', err);
      setError(t('inboxDetail.error'));
    } finally {
      setLoading(false);
    }
  }, [messageId, markAsRead, userContext]);

  useEffect(() => {
    void fetchMessage();
  }, [fetchMessage]);

  const handleRetry = (): void => {
    void fetchMessage();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header type="inbox" />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={skin.colors.textPrimary} />
          <Meta style={styles.loadingText}>{t('common.loading')}</Meta>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !message) {
    return (
      <SafeAreaView style={styles.container}>
        <Header type="inbox" />
        <View style={styles.errorState}>
          <View style={styles.errorIconContainer}>
            <Icon name="alert-triangle" size="xl" colorToken="errorText" />
          </View>
          <Body style={styles.errorTitle}>
            {error || t('inboxDetail.notFound')}
          </Body>
          <Button onPress={handleRetry}>{t('common.retry')}</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header type="inbox" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Urgent badge */}
        {message.is_urgent && (
          <Badge variant="urgent" style={styles.urgentBadge}>
            {t('banner.urgent')}
          </Badge>
        )}

        {/* Tags - defensive: ensure tags is always an array */}
        {(() => {
          const tags = Array.isArray(message.tags) ? message.tags : [];
          const visibleTags = tags.filter((tag) => tag !== 'hitno');
          if (visibleTags.length === 0) return null;
          return (
            <View style={styles.tagsContainer}>
              {visibleTags.map((tag) => (
                <Badge
                  key={tag}
                  backgroundColor={skin.colors.backgroundSecondary}
                  textColor={skin.colors.textMuted}
                >
                  {formatTag(tag)}
                </Badge>
              ))}
            </View>
          );
        })()}

        {/* Title */}
        <H1 style={styles.title}>{message.title}</H1>

        {/* Date */}
        <Meta style={styles.date}>{formatDateTime(message.created_at)}</Meta>

        {/* Body */}
        <Body style={styles.body}>{message.body}</Body>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Format tag for display
 */
function formatTag(tag: string): string {
  const tagLabels: Record<string, string> = {
    cestovni_promet: 'Cestovni promet',
    pomorski_promet: 'Pomorski promet',
    kultura: 'Kultura',
    opcenito: 'Općenito',
    komiza: 'Komiža',
    vis: 'Vis',
  };
  return tagLabels[tag] || tag;
}

/**
 * Format date and time for display
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
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
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: skin.spacing.md,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xxl,
  },
  errorIconContainer: {
    marginBottom: skin.spacing.lg,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: skin.spacing.lg,
  },
  urgentBadge: {
    alignSelf: 'flex-start',
    marginBottom: skin.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: skin.spacing.sm,
    marginBottom: skin.spacing.md,
  },
  title: {
    marginBottom: skin.spacing.sm,
  },
  date: {
    marginBottom: skin.spacing.xxl,
  },
  body: {
    lineHeight: skin.typography.fontSize.lg * skin.typography.lineHeight.relaxed,
  },
});

export default InboxDetailScreen;
