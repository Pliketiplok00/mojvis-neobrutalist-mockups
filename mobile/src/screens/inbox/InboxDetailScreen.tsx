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
 * - Poster-style layout with bordered sections
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
import type { InboxMessage, InboxTag } from '../../types/inbox';
import type { MainStackParamList } from '../../navigation/types';

// UI Primitives
import {
  skin,
  Header,
  Button,
  H1,
  H2,
  Body,
  Meta,
  Label,
  Icon,
  LinkText,
} from '../../ui';
import type { IconName } from '../../ui/Icon';
import { formatDateTimeSlash, formatDateShort } from '../../utils/dateFormat';

const { inbox: inboxTokens } = skin.components;

type DetailRouteProp = RouteProp<MainStackParamList, 'InboxDetail'>;

/**
 * Get header background color and icon based on message tags
 */
function getHeaderConfig(tags: InboxTag[], isUrgent: boolean): {
  backgroundColor: string;
  icon: IconName;
  iconColorToken: 'primaryText' | 'textPrimary';
} {
  // Urgent messages get red header
  if (isUrgent) {
    return {
      backgroundColor: inboxTokens.listItem.iconSlabBackgroundUrgent,
      icon: 'shield-alert',
      iconColorToken: 'primaryText',
    };
  }

  // Check for category tags
  if (tags.includes('promet')) {
    return {
      backgroundColor: inboxTokens.listItem.iconSlabBackgroundTransport,
      icon: 'traffic-cone',
      iconColorToken: 'primaryText',
    };
  }
  if (tags.includes('kultura')) {
    return {
      backgroundColor: inboxTokens.listItem.iconSlabBackgroundCulture,
      icon: 'calendar-heart',
      iconColorToken: 'textPrimary',
    };
  }
  if (tags.includes('opcenito')) {
    return {
      backgroundColor: inboxTokens.listItem.iconSlabBackgroundGeneral,
      icon: 'newspaper',
      iconColorToken: 'textPrimary',
    };
  }

  // Default
  return {
    backgroundColor: inboxTokens.listItem.iconSlabBackgroundDefault,
    icon: 'mail',
    iconColorToken: 'textPrimary',
  };
}

/**
 * Get municipality labels from tags
 */
function getMunicipalityLabels(tags: InboxTag[]): string[] {
  const labels: string[] = [];
  if (tags.includes('vis')) labels.push('Grad Vis');
  if (tags.includes('komiza')) labels.push('Općina Komiža');
  return labels;
}

/**
 * Format tag for display
 */
function formatTag(tag: string): string {
  const tagLabels: Record<string, string> = {
    promet: 'Promet',
    kultura: 'Kultura',
    opcenito: 'Općenito',
    komiza: 'Komiža',
    vis: 'Vis',
    hitno: 'Hitno',
  };
  return tagLabels[tag] || tag;
}

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
  }, [messageId, markAsRead, userContext, t]);

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

  const headerConfig = getHeaderConfig(message.tags, message.is_urgent);
  const municipalities = getMunicipalityLabels(message.tags);
  const hasDateRange = message.active_from || message.active_to;

  return (
    <SafeAreaView style={styles.container}>
      <Header type="inbox" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Colored category header with icon */}
        <View style={[styles.categoryHeader, { backgroundColor: headerConfig.backgroundColor }]}>
          <View style={styles.categoryIconBox}>
            <Icon
              name={headerConfig.icon}
              size="lg"
              colorToken={headerConfig.iconColorToken}
            />
          </View>
          {/* Urgent badge in header */}
          {message.is_urgent && (
            <View style={styles.urgentBadge}>
              <Label style={styles.urgentBadgeText}>HITNO</Label>
            </View>
          )}
        </View>

        {/* Title - uppercase, bold */}
        <H1 style={styles.title}>{message.title.toUpperCase()}</H1>

        {/* Meta row: date + municipality */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size="sm" colorToken="textMuted" />
            <Meta style={styles.metaText}>{formatDateTimeSlash(message.created_at)}</Meta>
          </View>
          {municipalities.map((municipality) => (
            <View key={municipality} style={styles.metaItem}>
              <Icon name="map-pin" size="sm" colorToken="textMuted" />
              <Meta style={styles.metaText}>{municipality}</Meta>
            </View>
          ))}
        </View>

        {/* Body in bordered box */}
        <View style={styles.bodyContainer}>
          <LinkText style={styles.bodyText}>{message.body}</LinkText>
        </View>

        {/* Date range section */}
        {hasDateRange && (
          <View style={styles.dateRangeSection}>
            <H2 style={styles.dateRangeSectionTitle}>
              OBAVIJEST SE ODNOSI NA DAN/E:
            </H2>
            <View style={styles.dateBoxesRow}>
              {message.active_from && (
                <View style={styles.dateBox}>
                  <Label style={styles.dateLabel}>OD</Label>
                  <Label style={styles.dateValue}>
                    {formatDateShort(message.active_from)}
                  </Label>
                </View>
              )}
              {message.active_to && (
                <View style={styles.dateBox}>
                  <Label style={styles.dateLabel}>DO</Label>
                  <Label style={styles.dateValue}>
                    {formatDateShort(message.active_to)}
                  </Label>
                </View>
              )}
            </View>
          </View>
        )}
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

  // Category header
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthCard,
    borderBottomColor: skin.colors.border,
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
  urgentBadge: {
    backgroundColor: skin.colors.urgent,
    paddingHorizontal: skin.spacing.md,
    paddingVertical: skin.spacing.sm,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
  },
  urgentBadgeText: {
    color: skin.colors.urgentText,
    fontWeight: '700',
    fontSize: skin.typography.fontSize.sm,
    letterSpacing: 1,
  },

  // Title
  title: {
    paddingHorizontal: skin.spacing.lg,
    paddingTop: skin.spacing.lg,
    paddingBottom: skin.spacing.sm,
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: skin.spacing.lg,
    paddingHorizontal: skin.spacing.lg,
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

  // Date range section
  dateRangeSection: {
    marginTop: skin.spacing.xl,
    paddingHorizontal: skin.spacing.lg,
  },
  dateRangeSectionTitle: {
    marginBottom: skin.spacing.md,
    fontSize: skin.typography.fontSize.sm,
    letterSpacing: 1,
  },
  dateBoxesRow: {
    flexDirection: 'row',
    gap: skin.spacing.md,
  },
  dateBox: {
    flex: 1,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    padding: skin.spacing.md,
    backgroundColor: skin.colors.background,
  },
  dateLabel: {
    fontSize: skin.typography.fontSize.xs,
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.xs,
  },
  dateValue: {
    fontSize: skin.typography.fontSize.lg,
    fontWeight: '700',
    color: skin.colors.textPrimary,
  },
});

export default InboxDetailScreen;
