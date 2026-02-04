/**
 * Flora Screen
 *
 * Educational screen about the flora of Vis Island.
 * Subpage of "Flora & Fauna" section.
 *
 * Structure:
 * 1. Hero (no shadow)
 * 2. Warning callout (with shadow)
 * 3. Why special (with shadow)
 * 4. Highlights (with shadow)
 * 5. Sensitive areas (with shadow)
 * 6. Species section header (with shadow)
 * 7. Species cards (with shadows)
 * 8. Closing note (with shadow)
 *
 * Skin-pure: Uses skin tokens only (no hardcoded colors).
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { HeroMediaHeader } from '../../ui/HeroMediaHeader';
import { Icon } from '../../ui/Icon';
import { H2, Body, Meta, Label } from '../../ui/Text';
import { useTranslations } from '../../i18n';
import { skin } from '../../ui/skin';
import { floraContent, type BilingualText } from '../../data/floraContent';
import { FloraSpeciesCard } from './components/FloraSpeciesCard';

const { colors, spacing, borders } = skin;

export function FloraScreen(): React.JSX.Element {
  const { language } = useTranslations();

  // Helper to get text for current language
  const getText = (text: BilingualText) => text[language];

  // Prepare hero images
  const heroImages = floraContent.hero.images.map((img) => img.url);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 1. Hero (NO shadow) */}
        <HeroMediaHeader
          images={heroImages}
          title={getText(floraContent.hero.title)}
          subtitle={getText(floraContent.hero.subtitle)}
        />

        {/* 2. Warning Callout */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={[styles.card, styles.warningCard]}>
              <View style={styles.warningHeader}>
                <View style={styles.warningIconBox}>
                  <Icon name="alert-triangle" size="md" color={colors.urgentText} />
                </View>
                <H2 style={styles.warningTitle}>{getText(floraContent.doNotTouch.title)}</H2>
              </View>

              <Body style={styles.cardText}>{getText(floraContent.doNotTouch.text)}</Body>

              <View style={styles.bulletList}>
                {floraContent.doNotTouch.bullets.map((bullet, index) => (
                  <View key={`bullet-${index}`} style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Body style={styles.bulletText}>{getText(bullet)}</Body>
                  </View>
                ))}
              </View>

              <View style={styles.noteBox}>
                <Meta style={styles.noteText}>{getText(floraContent.doNotTouch.note)}</Meta>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Why Special */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={styles.card}>
              <H2 style={styles.cardTitle}>{getText(floraContent.whySpecial.title)}</H2>
              <Body style={styles.cardText}>{getText(floraContent.whySpecial.text)}</Body>
            </View>
          </View>
        </View>

        {/* 4. Highlights */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={styles.card}>
              <H2 style={styles.cardTitle}>{getText(floraContent.highlights.title)}</H2>
              <View style={styles.highlightList}>
                {floraContent.highlights.items.map((item, index) => (
                  <View key={`highlight-${index}`} style={styles.highlightItem}>
                    <View style={styles.highlightBullet} />
                    <Body style={styles.highlightText}>{getText(item)}</Body>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* 5. Sensitive Areas */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={[styles.card, styles.sensitiveCard]}>
              <H2 style={styles.cardTitle}>{getText(floraContent.sensitiveAreas.title)}</H2>
              <Body style={styles.cardText}>{getText(floraContent.sensitiveAreas.text)}</Body>
            </View>
          </View>
        </View>

        {/* 6. Species Section Header */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={styles.card}>
              <View style={styles.speciesHeaderRow}>
                <Icon name="leaf" size="lg" colorToken="secondary" />
                <H2 style={styles.speciesSectionTitle}>
                  {getText(floraContent.speciesSection.title)}
                </H2>
              </View>
              <Body style={styles.cardText}>{getText(floraContent.speciesSection.intro)}</Body>
            </View>
          </View>
        </View>

        {/* 7. Species Cards */}
        <View style={styles.speciesListContainer}>
          {floraContent.species.map((species) => (
            <FloraSpeciesCard
              key={species.id}
              species={species}
              language={language}
              criticalTag={floraContent.criticalTag}
            />
          ))}
        </View>

        {/* 8. Closing Note */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={styles.card}>
              <Body style={styles.closingNote}>{getText(floraContent.closingNote)}</Body>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },

  // Section containers
  sectionContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },

  // Card with shadow pattern
  cardWrapper: {
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.border,
  },
  card: {
    backgroundColor: colors.background,
    borderWidth: borders.widthCard,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardTitle: {
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  cardText: {
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Warning card variant
  warningCard: {
    backgroundColor: colors.errorBackground,
    borderColor: colors.urgent,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  warningIconBox: {
    width: 44,
    height: 44,
    backgroundColor: colors.urgent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  warningTitle: {
    flex: 1,
    color: colors.textPrimary,
  },
  bulletList: {
    marginTop: spacing.md,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bulletDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.urgent,
    marginTop: 6,
    marginRight: spacing.md,
  },
  bulletText: {
    flex: 1,
    color: colors.textPrimary,
  },
  noteBox: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: borders.widthHairline,
    borderTopColor: colors.borderLight,
  },
  noteText: {
    fontStyle: 'italic',
    color: colors.textSecondary,
  },

  // Sensitive areas card variant
  sensitiveCard: {
    backgroundColor: colors.warningBackground,
  },

  // Highlights
  highlightList: {
    marginTop: spacing.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  highlightBullet: {
    width: 8,
    height: 8,
    backgroundColor: colors.secondary,
    marginTop: 6,
    marginRight: spacing.md,
  },
  highlightText: {
    flex: 1,
    color: colors.textSecondary,
  },

  // Species section header
  speciesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  speciesSectionTitle: {
    flex: 1,
    color: colors.textPrimary,
  },

  // Species list
  speciesListContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },

  // Closing note
  closingNote: {
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default FloraScreen;
