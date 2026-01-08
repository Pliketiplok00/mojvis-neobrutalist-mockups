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
import { clickFixApi } from '../../services/api';
import type { ClickFixDetailResponse } from '../../types/click-fix';
import type { MainStackParamList } from '../../navigation/types';

type DetailRouteProp = RouteProp<MainStackParamList, 'ClickFixDetail'>;

// Status colors
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  zaprimljeno: { bg: '#E3F2FD', text: '#1565C0' },
  u_razmatranju: { bg: '#FFF3E0', text: '#E65100' },
  prihvaceno: { bg: '#E8F5E9', text: '#2E7D32' },
  odbijeno: { bg: '#FFEBEE', text: '#C62828' },
};

const { width: screenWidth } = Dimensions.get('window');

export function ClickFixDetailScreen(): React.JSX.Element {
  const route = useRoute<DetailRouteProp>();
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
      setError('Greska pri ucitavanju prijave');
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
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Ucitavanje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !clickFix) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Prijava nije pronadena'}</Text>
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
            <Text style={styles.locationLabel}>Lokacija:</Text>
            <Text style={styles.locationText}>
              {clickFix.location.lat.toFixed(6)}, {clickFix.location.lng.toFixed(6)}
            </Text>
          </View>
        </View>

        {/* Photos Section */}
        {clickFix.photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Slike ({clickFix.photos.length})</Text>
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
          <Text style={styles.sectionTitle}>Odgovori</Text>

          {clickFix.replies.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Još nema odgovora na vašu prijavu.
              </Text>
            </View>
          ) : (
            clickFix.replies.map((reply) => (
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
            <Text style={styles.modalCloseText}>X</Text>
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
  description: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#2E7D32',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  photosSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  photosScroll: {
    gap: 12,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  repliesSection: {
    flex: 1,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  modalImage: {
    width: screenWidth - 32,
    height: screenWidth - 32,
  },
});

export default ClickFixDetailScreen;
