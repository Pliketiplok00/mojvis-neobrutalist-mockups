/**
 * Road Transport Overview Screen
 *
 * Shows road transport information with active banners.
 *
 * Banner placement rules (per spec):
 * - ONLY cestovni_promet OR hitno tags
 * - NO opcenito, kultura, or municipal-only messages
 *
 * Phase 1: Placeholder with banner support.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { inboxApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';

export function RoadTransportScreen(): React.JSX.Element {
  const [banners, setBanners] = useState<InboxMessage[]>([]);

  // TODO: Get from user context
  const userContext = { userMode: 'visitor' as const, municipality: null };

  const fetchBanners = useCallback(async () => {
    try {
      // Pass 'transport_road' screen context for banner filtering
      const response = await inboxApi.getActiveBanners(userContext, 'transport_road');
      setBanners(response.banners);
    } catch (err) {
      console.error('[RoadTransport] Error fetching banners:', err);
      // Silently fail - banners are optional
    }
  }, []);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader type="child" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Active Banners (only cestovni_promet or hitno) */}
        <BannerList banners={banners} />

        {/* Placeholder content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cestovni promet</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Informacije o cestovnom prometu bit ce prikazane ovdje.
            </Text>
            <Text style={styles.placeholderHint}>
              (Phase 2+)
            </Text>
          </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  placeholder: {
    backgroundColor: '#F0F0F0',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  placeholderHint: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default RoadTransportScreen;
