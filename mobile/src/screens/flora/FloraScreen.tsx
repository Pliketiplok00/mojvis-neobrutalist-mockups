/**
 * Flora Screen
 *
 * Educational screen about the flora of Vis Island.
 * Subpage of "Flora & Fauna" section.
 *
 * Structure:
 * 1. Hero (no shadow)
 * 2. Why special (with shadow)
 * 3. Highlights (with shadow)
 * 4. Warning / guide card (with shadow) - introduces species list
 * 5. Species cards (with shadows)
 * 6. Closing note (with shadow)
 * 7. Sensitive areas (at bottom, with shadow)
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

/** Wikimedia Commons original → width-limited thumbnail */
const WIKI_PREFIX = 'https://upload.wikimedia.org/wikipedia/commons/';
function wikiThumb(url: string, width = 1200): string {
  if (!url.startsWith(WIKI_PREFIX)) return url;
  const rest = url.slice(WIKI_PREFIX.length);
  const filename = rest.split('/').pop() ?? '';
  return `${WIKI_PREFIX}thumb/${rest}/${width}px-${filename}`;
}

export function FloraScreen(): React.JSX.Element {
  const { language } = useTranslations();

  // Helper to get text for current language
  const getText = (text: BilingualText) => text[language];

  // Prepare hero images (use 1200px thumbs — full-width hero)
  const heroImages = floraContent.hero.images.map((img) => wikiThumb(img.url));

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

        {/* 2. Why Special */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={styles.card}>
              <H2 style={styles.cardTitle}>{getText(floraContent.whySpecial.title)}</H2>
              <Body style={styles.cardText}>{getText(floraContent.whySpecial.text)}</Body>
            </View>
          </View>
        </View>

        {/* 3. Highlights */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={styles.card}>
              <H2 style={styles.cardTitle}>{getText(floraContent.highlights.title)}</H2>
              <View style={styles.highlightList}>
                {floraContent.highlights.items.map((item, index) => (
                  <View key={`highlight-${index}`} style={styles.highlightItem}>
                    <View style={styles.highlightBullet} />
                    <View style={styles.highlightContent}>
                      <Label style={styles.highlightHeadline}>{getText(item.headline)}</Label>
                      <Body style={styles.highlightDescription}>{getText(item.description)}</Body>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* 4. Warning / Guide Card (introduces species list) */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={[styles.shadowLayer, styles.shadowLayerWarning]} />
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

        {/* 5. Species Cards */}
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

        {/* 6. Closing Note */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={styles.card}>
              <Body style={styles.closingNote}>{getText(floraContent.closingNote)}</Body>
            </View>
          </View>
        </View>

        {/* 7. Sensitive Areas (at bottom) */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={[styles.card, styles.sensitiveCard]}>
              <H2 style={styles.cardTitle}>{getText(floraContent.sensitiveAreas.title)}</H2>
              <Body style={styles.cardText}>{getText(floraContent.sensitiveAreas.text)}</Body>
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
  // Note: colors.errorBackground has alpha, so use opaque white base + tinted overlay
  warningCard: {
    backgroundColor: colors.background,
    borderColor: colors.urgent,
  },
  // Shadow for warning card uses urgent color with reduced opacity
  shadowLayerWarning: {
    backgroundColor: 'rgba(215, 72, 47, 0.4)', // urgent color at 40% opacity
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
    marginBottom: spacing.lg,
  },
  highlightBullet: {
    width: 8,
    height: 8,
    backgroundColor: colors.secondary,
    marginTop: 4,
    marginRight: spacing.md,
  },
  highlightContent: {
    flex: 1,
  },
  highlightHeadline: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  highlightDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
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
