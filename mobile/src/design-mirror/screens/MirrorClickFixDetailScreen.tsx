/**
 * Mirror Click & Fix Detail Screen (Design Mirror)
 *
 * Mirrors ClickFixDetailScreen using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Status badge (colored by status)
 * 2. Message card (subject, date, description, location)
 * 3. Photos section (horizontal scroll with placeholders)
 * 4. Replies section (list or empty state)
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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { STATUS_COLORS } from '../../ui/utils/statusColors';
import { Icon } from '../../ui/Icon';
import { H2, Body, Label, Meta, ButtonText } from '../../ui/Text';
import {
  clickFixDetailFixture,
  clickFixDetailLabels,
} from '../fixtures/clickfix';

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
 * Mirror Click & Fix Detail Screen
 * Uses clickFixDetailFixture for visual state
 */
export function MirrorClickFixDetailScreen(): React.JSX.Element {
  // All data from fixture
  const clickFix = clickFixDetailFixture;
  const labels = clickFixDetailLabels;

  // Get status colors from production utility
  const statusColor = STATUS_COLORS[clickFix.status] || STATUS_COLORS.zaprimljeno;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>ClickFixDetail Mirror</H2>
        <Meta style={styles.headerMeta}>id: {clickFix.id}</Meta>
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
            {clickFix.status_label}
          </ButtonText>
        </View>

        {/* Original Message */}
        <View style={styles.messageCard}>
          <H2 style={styles.subject}>{clickFix.subject}</H2>
          <Meta style={styles.date}>{formatDateCroatian(clickFix.created_at)}</Meta>
          <Body style={styles.description}>{clickFix.description}</Body>

          {/* Location */}
          <View style={styles.locationSection}>
            <ButtonText style={styles.locationLabel}>{labels.locationTitle}:</ButtonText>
            <Body style={styles.locationText}>
              {clickFix.location.lat.toFixed(6)}, {clickFix.location.lng.toFixed(6)}
            </Body>
          </View>
        </View>

        {/* Photos Section */}
        {clickFix.photos.length > 0 && (
          <View style={styles.photosSection}>
            <H2 style={styles.sectionTitle}>{labels.photosTitle} ({clickFix.photos.length})</H2>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScroll}
            >
              {clickFix.photos.map((photo) => (
                <View key={photo.id} style={styles.photoPlaceholder}>
                  <Icon name="camera" size="md" colorToken="textMuted" />
                  <Meta style={styles.photoFileName}>{photo.file_name}</Meta>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Replies Section */}
        <View style={styles.repliesSection}>
          <H2 style={styles.sectionTitle}>{labels.repliesTitle}</H2>

          {clickFix.replies.length === 0 ? (
            <View style={styles.emptyState}>
              <Body style={styles.emptyText}>
                {labels.noReplies}
              </Body>
            </View>
          ) : (
            clickFix.replies.map((reply) => (
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
  description: {
    color: skin.colors.textSecondary,
    lineHeight: 24,
    marginBottom: skin.spacing.lg,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: skin.spacing.md,
    borderTopWidth: 1,
    borderTopColor: skin.colors.borderLight,
  },
  locationLabel: {
    color: skin.colors.textMuted,
    marginRight: skin.spacing.sm,
  },
  locationText: {
    color: skin.colors.successText,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  photosSection: {
    marginBottom: skin.spacing.xxl,
  },
  sectionTitle: {
    marginBottom: skin.spacing.md,
  },
  photosScroll: {
    gap: skin.spacing.md,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.sm,
  },
  photoFileName: {
    color: skin.colors.textMuted,
    fontSize: 10,
    marginTop: skin.spacing.xs,
    textAlign: 'center',
  },
  repliesSection: {
    flex: 1,
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

export default MirrorClickFixDetailScreen;
