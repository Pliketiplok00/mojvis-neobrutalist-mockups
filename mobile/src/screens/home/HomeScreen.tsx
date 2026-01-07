/**
 * Home Screen (HOME_01)
 *
 * Main landing screen after onboarding.
 *
 * Sections (per spec):
 * 1. Active Notifications (banner if active)
 * 2. Greeting Block
 * 3. Category Grid
 * 4. Upcoming Events
 * 5. Feedback Entry
 *
 * Phase 1: Added active banners from API.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { inboxApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';

export function HomeScreen(): React.JSX.Element {
  const [banners, setBanners] = useState<InboxMessage[]>([]);

  // TODO: Get from user context
  const userContext = { userMode: 'visitor' as const, municipality: null };

  const fetchBanners = useCallback(async () => {
    try {
      const response = await inboxApi.getActiveBanners(userContext);
      setBanners(response.banners);
    } catch (err) {
      console.error('[Home] Error fetching banners:', err);
      // Silently fail - banners are optional
    }
  }, []);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  const handleMenuPress = (): void => {
    // TODO: Open drawer menu
    console.info('Menu pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader type="root" onMenuPress={handleMenuPress} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Section 1: Active Notifications */}
        <BannerList banners={banners} />

        {/* Section 2: Greeting Block */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Dobrodošli na Vis!</Text>
          <Text style={styles.greetingSubtitle}>
            Vaš vodič za život i posjetu otoku
          </Text>
        </View>

        {/* Section 3: Category Grid (placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategorije</Text>
          <View style={styles.categoryGrid}>
            {['Događaji', 'Promet', 'Info', 'Kontakti'].map((category) => (
              <View key={category} style={styles.categoryCard}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 4: Upcoming Events (placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nadolazeći događaji</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              [Events list will appear here]
            </Text>
          </View>
        </View>

        {/* Section 5: Feedback Entry (placeholder) */}
        <View style={styles.section}>
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Imate prijedlog?</Text>
            <Text style={styles.feedbackSubtitle}>
              Pošaljite nam povratnu informaciju
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
  bannerPlaceholder: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  greetingSection: {
    marginBottom: 24,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  greetingSubtitle: {
    fontSize: 16,
    color: '#666666',
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  placeholder: {
    backgroundColor: '#F0F0F0',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
  feedbackCard: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
  },
});

export default HomeScreen;
