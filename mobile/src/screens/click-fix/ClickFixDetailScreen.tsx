/**
 * Click & Fix Detail Screen
 *
 * Phase 6: View submitted Click & Fix with status, photos, and replies.
 *
 * Shows:
 * - Colored category header with icon and subject
 * - Date and location metadata
 * - Description in bordered box
 * - Photos gallery (if any)
 * - Replies list (chronological)
 *
 * Design: Unified with InboxDetailScreen poster-style layout.
 * Skin-pure: Uses skin tokens and Icon primitive (no hardcoded hex, no text glyphs).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
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
import { clickFixApi, getFullApiUrl } from '../../services/api';
import type { ClickFixDetailResponse } from '../../types/click-fix';
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

type DetailRouteProp = RouteProp<MainStackParamList, 'ClickFixDetail'>;

const { width: screenWidth } = Dimensions.get('window');

export function ClickFixDetailScreen(): React.JSX.Element {
  const route = useRoute<DetailRouteProp>();
  const { t, language } = useTranslations();
  const { clickFixId } = route.params;

  const [clickFix, setClickFix] = useState<ClickFixDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const fetchClickFix = useCallback(async () => {
    setError(null);
    try {
      const data = await clickFixApi.getDetail(clickFixId, language);
      setClickFix(data);
    } catch (err) {
      console.error('[ClickFixDetail] Error fetching:', err);
      setError(t('clickFix.detail.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clickFixId, language, t]);

  useEffect(() => {
    void fetchClickFix();
  }, [fetchClickFix]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchClickFix();
  }, [fetchClickFix]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <LoadingState message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  if (error || !clickFix) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <ErrorState message={error || t('clickFix.detail.notFound')} />
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
              <Icon name="camera" size="lg" colorToken="textPrimary" />
            </View>
            <Label style={styles.headerTitle} numberOfLines={3}>
              {clickFix.subject.toUpperCase()}
            </Label>
          </View>
        </View>

        {/* Meta row: date + location */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size="sm" colorToken="textMuted" />
            <Meta style={styles.metaText}>{formatDateTimeSlash(clickFix.created_at)}</Meta>
          </View>
          <View style={styles.metaItem}>
            <Icon name="map-pin" size="sm" colorToken="textMuted" />
            <Meta style={styles.locationText}>
              {clickFix.location.lat.toFixed(4)}, {clickFix.location.lng.toFixed(4)}
            </Meta>
          </View>
        </View>

        {/* Description in bordered box */}
        <View style={styles.bodyContainer}>
          <LinkText style={styles.bodyText}>{clickFix.description}</LinkText>
        </View>

        {/* Photos Section */}
        {clickFix.photos.length > 0 && (
          <View style={styles.photosSection}>
            <H2 style={styles.sectionTitle}>
              {t('clickFix.detail.photos').toUpperCase()} ({clickFix.photos.length})
            </H2>
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
                    source={{ uri: getFullApiUrl(photo.url) }}
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
          <H2 style={styles.sectionTitle}>{t('clickFix.detail.replies').toUpperCase()}</H2>

          {clickFix.replies.length === 0 ? (
            <View style={styles.emptyState}>
              <Body style={styles.emptyText}>
                {t('clickFix.detail.noReplies')}
              </Body>
            </View>
          ) : (
            clickFix.replies.map((reply) => (
              <View key={reply.id} style={styles.replyCard}>
                <View style={styles.replyHeader}>
                  <Label style={styles.replyLabel}>{t('clickFix.detail.reply').toUpperCase()}</Label>
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
              source={{ uri: getFullApiUrl(clickFix.photos[selectedPhotoIndex].url) }}
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
    paddingBottom: skin.spacing.xxxl,
  },

  // Category header with title (orange for click-fix)
  categoryHeader: {
    padding: skin.spacing.lg,
    backgroundColor: skin.colors.orange,
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
  locationText: {
    color: skin.colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: skin.typography.fontSize.xs,
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

  // Photos section
  photosSection: {
    marginTop: skin.spacing.xl,
    paddingHorizontal: skin.spacing.lg,
  },
  sectionTitle: {
    marginBottom: skin.spacing.md,
    fontSize: skin.typography.fontSize.sm,
    letterSpacing: 1,
  },
  photosScroll: {
    gap: skin.spacing.md,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
  },

  // Replies section
  repliesSection: {
    marginTop: skin.spacing.xl,
    paddingHorizontal: skin.spacing.lg,
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

  // Photo modal
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
    width: 44,
    height: 44,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
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
