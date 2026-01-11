/**
 * Click & Fix Detail Screen
 *
 * Phase 6: View submitted Click & Fix with status, photos, and replies.
 *
 * Shows:
 * - Subject + description (original)
 * - Location coordinates
 * - Current status label
 * - Photos (if any)
 * - Replies list (chronological)
 *
 * Skin-pure: Uses skin tokens and Icon primitive (no hardcoded hex, no text glyphs).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useTranslations } from '../../i18n';
import { clickFixApi } from '../../services/api';
import type { ClickFixDetailResponse } from '../../types/click-fix';
import type { MainStackParamList } from '../../navigation/types';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';

type DetailRouteProp = RouteProp<MainStackParamList, 'ClickFixDetail'>;

// Status colors using semantic skin tokens
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  zaprimljeno: { bg: skin.colors.infoBackground, text: skin.colors.infoText },
  u_razmatranju: { bg: skin.colors.pendingBackground, text: skin.colors.pendingText },
  prihvaceno: { bg: skin.colors.successBackground, text: skin.colors.successText },
  odbijeno: { bg: skin.colors.errorBackground, text: skin.colors.errorText },
};

const { width: screenWidth } = Dimensions.get('window');

export function ClickFixDetailScreen(): React.JSX.Element {
  const route = useRoute<DetailRouteProp>();
  const { t } = useTranslations();
  const { clickFixId } = route.params;

  const [clickFix, setClickFix] = useState<ClickFixDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const fetchClickFix = useCallback(async () => {
    setError(null);
    try {
      const data = await clickFixApi.getDetail(clickFixId);
      setClickFix(data);
    } catch (err) {
      console.error('[ClickFixDetail] Error fetching:', err);
      setError(t('clickFix.detail.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clickFixId]);

  useEffect(() => {
    void fetchClickFix();
  }, [fetchClickFix]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchClickFix();
  }, [fetchClickFix]);

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

  if (error || !clickFix) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || t('clickFix.detail.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = STATUS_COLORS[clickFix.status] || STATUS_COLORS.zaprimljeno;

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
            {clickFix.status_label}
          </Text>
        </View>

        {/* Original Message */}
        <View style={styles.messageCard}>
          <Text style={styles.subject}>{clickFix.subject}</Text>
          <Text style={styles.date}>{formatDate(clickFix.created_at)}</Text>
          <Text style={styles.description}>{clickFix.description}</Text>

          {/* Location */}
          <View style={styles.locationSection}>
            <Text style={styles.locationLabel}>{t('clickFix.detail.location')}:</Text>
            <Text style={styles.locationText}>
              {clickFix.location.lat.toFixed(6)}, {clickFix.location.lng.toFixed(6)}
            </Text>
          </View>
        </View>

        {/* Photos Section */}
        {clickFix.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>{t('clickFix.detail.photos')} ({clickFix.photos.length})</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScroll}
            >
              {clickFix.photos.map((photo, index) => (
                <TouchableOpacity
                  key={photo.id}
                  onPress={() => setSelectedPhotoIndex(index)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: photo.url }}
                    style={styles.photoThumbnail}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Replies Section */}
        <View style={styles.repliesSection}>
          <Text style={styles.sectionTitle}>{t('clickFix.detail.replies')}</Text>

          {clickFix.replies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {t('clickFix.detail.noReplies')}
              </Text>
            </View>
          ) : (
            clickFix.replies.map((reply) => (
              <View key={reply.id} style={styles.replyCard}>
                <View style={styles.replyHeader}>
                  <Text style={styles.replyLabel}>{t('clickFix.detail.reply')}</Text>
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

      {/* Photo Modal */}
      <Modal
        visible={selectedPhotoIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhotoIndex(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setSelectedPhotoIndex(null)}
          >
            <Icon name="close" size="md" colorToken="textPrimary" />
          </TouchableOpacity>
          {selectedPhotoIndex !== null && clickFix.photos[selectedPhotoIndex] && (
            <Image
              source={{ uri: clickFix.photos[selectedPhotoIndex].url }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  description: {
    fontSize: skin.typography.fontSize.lg,
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
    fontSize: skin.typography.fontSize.md,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textMuted,
    marginRight: skin.spacing.sm,
  },
  locationText: {
    fontSize: skin.typography.fontSize.md,
    color: skin.colors.successText,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  photosSection: {
    marginBottom: skin.spacing.xxl,
  },
  sectionTitle: {
    fontSize: skin.typography.fontSize.xl,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.md,
  },
  photosScroll: {
    gap: skin.spacing.md,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
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
  modalContainer: {
    flex: 1,
    backgroundColor: skin.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: skin.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalImage: {
    width: screenWidth - 32,
    height: screenWidth - 32,
  },
});

export default ClickFixDetailScreen;
