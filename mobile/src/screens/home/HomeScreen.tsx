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
 *
 * REFACTORED: Now uses UI primitives from src/ui/
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native';
import { BannerList } from '../../components/Banner';
import { useMenu } from '../../contexts/MenuContext';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { inboxApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';

// UI Primitives
import {
  skin,
  Header,
  Section,
  Card,
  H1,
  H2,
  Body,
  Meta,
} from '../../ui';

export function HomeScreen(): React.JSX.Element {
  const { openMenu } = useMenu();
  const { t } = useTranslations();
  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const userContext = useUserContext();

  const fetchBanners = useCallback(async () => {
    try {
      // Pass 'home' screen context for banner filtering
      const response = await inboxApi.getActiveBanners(userContext, 'home');
      setBanners(response.banners);
    } catch (err) {
      console.error('[Home] Error fetching banners:', err);
      // Silently fail - banners are optional
    }
  }, [userContext]);

  useEffect(() => {
    void fetchBanners();
  }, [fetchBanners]);

  const handleMenuPress = (): void => {
    openMenu();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header type="root" onMenuPress={handleMenuPress} />

      <View style={styles.scrollView}>
        <View style={styles.content}>
          {/* Section 1: Active Notifications */}
          <BannerList banners={banners} />

          {/* Section 2: Greeting Block */}
          <Section>
            <H1 style={styles.greetingTitle}>{t('home.greeting')}</H1>
            <Body color={skin.colors.textMuted}>
              {t('home.subtitle')}
            </Body>
          </Section>

          {/* Section 3: Category Grid */}
          <Section title={t('home.categories')}>
            <View style={styles.categoryGrid}>
              {[
                { key: 'events', label: t('home.categoryLabels.events') },
                { key: 'transport', label: t('home.categoryLabels.transport') },
                { key: 'info', label: t('home.categoryLabels.info') },
                { key: 'contacts', label: t('home.categoryLabels.contacts') },
              ].map((category) => (
                <Card key={category.key} variant="filled" style={styles.categoryCard}>
                  <Body style={styles.categoryText}>{category.label}</Body>
                </Card>
              ))}
            </View>
          </Section>

          {/* Section 4: Upcoming Events (placeholder) */}
          <Section title={t('home.upcomingEvents')}>
            <View style={styles.placeholder}>
              <Meta style={styles.placeholderText}>
                {t('home.eventsPlaceholder')}
              </Meta>
            </View>
          </Section>

          {/* Section 5: Feedback Entry */}
          <Section>
            <Card
              variant="filled"
              backgroundColor={skin.colors.successBackground}
              style={styles.feedbackCard}
            >
              <H2 color={skin.colors.successText}>{t('home.feedback.title')}</H2>
              <Body color={skin.colors.successAccent} style={styles.feedbackSubtitle}>
                {t('home.feedback.subtitle')}
              </Body>
            </Card>
          </Section>
        </View>
      </View>
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
  greetingTitle: {
    marginBottom: skin.spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: skin.spacing.md,
  },
  categoryCard: {
    width: '47%',
    alignItems: 'center',
    // Uses skin.components.card.borderWidth indirectly via Card
  },
  categoryText: {
    fontWeight: skin.typography.fontWeight.medium,
  },
  placeholder: {
    backgroundColor: skin.colors.backgroundTertiary,
    padding: skin.spacing.xxl,
    borderRadius: skin.borders.radiusMedium,
    alignItems: 'center',
  },
  placeholderText: {
    fontStyle: 'italic',
  },
  feedbackCard: {
    // Card uses skin tokens for padding/radius
  },
  feedbackSubtitle: {
    marginTop: skin.spacing.xs,
  },
});

export default HomeScreen;
