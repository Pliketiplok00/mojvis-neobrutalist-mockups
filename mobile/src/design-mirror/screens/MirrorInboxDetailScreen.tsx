/**
 * Mirror Inbox Detail Screen (Design Mirror)
 *
 * Mirrors InboxDetailScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Urgent badge (if is_urgent)
 * 2. Tag badges (filtered, no 'hitno')
 * 3. Title
 * 4. Date
 * 5. Body
 *
 * Rules:
 * - NO useNavigation import
 * - NO useRoute import
 * - NO useUnread hook
 * - NO API calls
 * - Skin tokens only
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { skin } from '../../ui/skin';
import { Badge } from '../../ui/Badge';
import { H1, H2, Body, Meta } from '../../ui/Text';
import { LinkText } from '../../ui/LinkText';
import {
  inboxDetailFixture,
  inboxLabels,
  tagLabels,
} from '../fixtures/inbox';

/**
 * Format date in Croatian style (DD.MM.YYYY. / HH:mm)
 */
function formatDateTimeSlash(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year}. / ${hours}:${minutes}`;
}

/**
 * Format tag for display
 */
function formatTag(tag: string): string {
  return tagLabels[tag] || tag;
}

/**
 * Mirror Inbox Detail Screen
 * Uses inboxDetailFixture for visual state
 */
export function MirrorInboxDetailScreen(): React.JSX.Element {
  // All data from fixture
  const message = inboxDetailFixture;

  // Filter tags: remove 'hitno' since urgent has its own badge
  const visibleTags = Array.isArray(message.tags)
    ? message.tags.filter((tag) => tag !== 'hitno')
    : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>InboxDetail Mirror</H2>
        <Meta style={styles.headerMeta}>id: {message.id}</Meta>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Urgent badge */}
        {message.is_urgent && (
          <Badge variant="urgent" style={styles.urgentBadge}>
            {inboxLabels.badges.urgent}
          </Badge>
        )}

        {/* Tags */}
        {visibleTags.length > 0 && (
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
        )}

        {/* Title */}
        <H1 style={styles.title}>{message.title}</H1>

        {/* Date */}
        <Meta style={styles.date}>{formatDateTimeSlash(message.created_at)}</Meta>

        {/* Body - with clickable links */}
        <LinkText style={styles.body}>{message.body}</LinkText>
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
    fontSize: skin.typography.fontSize.lg,
    fontFamily: skin.typography.fontFamily.body.regular,
    color: skin.colors.textSecondary,
    lineHeight: skin.typography.fontSize.lg * skin.typography.lineHeight.relaxed,
  },
});

export default MirrorInboxDetailScreen;
