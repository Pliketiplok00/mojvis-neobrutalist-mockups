/**
 * Fauna Screen
 *
 * Educational screen about the fauna of Vis Island.
 * Subpage of "Flora & Fauna" section.
 *
 * Structure (mirrors Flora):
 * 1. Hero (no shadow)
 * 2. Why special (with shadow)
 * 3. Highlights (with shadow)
 * 4. Warning / guide card (with shadow) - introduces species list
 * 5. Species cards (with shadows)
 * 6. Sensitive areas (with shadow, image + white text)
 * 7. Closing note (no shadow, transport-note style)
 *
 * Skin-pure: Uses skin tokens only (no hardcoded colors).
 */

import React from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { HeroMediaHeader } from '../../ui/HeroMediaHeader';
import { Icon } from '../../ui/Icon';
import { H2, Body, Meta, Label } from '../../ui/Text';
import { useTranslations } from '../../i18n';
import { skin } from '../../ui/skin';
import { faunaContent, type BilingualText } from '../../data/faunaContent';
import { FaunaSpeciesCard } from './components/FaunaSpeciesCard';
import { wikiThumb } from '../../utils/wikiThumb';

const { colors, spacing, borders } = skin;

// Wikimedia requires User-Agent header to avoid 429 rate limits
const WIKI_IMAGE_HEADERS = {
  'User-Agent': 'MojVisApp/1.0 (https://vis.hr; contact@vis.hr) React-Native',
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const SENSITIVE_IMAGE_HEIGHT = 160;
const SENSITIVE_IMAGE_WIDTH = CARD_WIDTH - borders.widthCard * 2;

export function FaunaScreen(): React.JSX.Element {
  const { language } = useTranslations();

  // Helper to get text for current language
  const getText = (text: BilingualText) => text[language];

  // Prepare hero images (use 1200px thumbs — full-width hero)
  const heroImages = faunaContent.hero.images.map((img) => wikiThumb(img.url, 1200));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 1. Hero (NO shadow) */}
        <HeroMediaHeader
          images={heroImages}
          title={getText(faunaContent.hero.title)}
          subtitle={getText(faunaContent.hero.subtitle)}
        />

        {/* 2. Why Special */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={styles.card}>
              <H2 style={styles.cardTitle}>{getText(faunaContent.whySpecial.title)}</H2>
              <Body style={styles.cardText}>{getText(faunaContent.whySpecial.text)}</Body>
            </View>
          </View>
        </View>

        {/* 3. Highlights */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={styles.card}>
              <H2 style={styles.cardTitle}>{getText(faunaContent.highlights.title)}</H2>
              <View style={styles.highlightList}>
                {faunaContent.highlights.items.map((item, index) => (
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
                <H2 style={styles.warningTitle}>{getText(faunaContent.doNotDisturb.title)}</H2>
              </View>

              <Body style={styles.cardText}>{getText(faunaContent.doNotDisturb.text)}</Body>

              <View style={styles.bulletList}>
                {faunaContent.doNotDisturb.bullets.map((bullet, index) => (
                  <View key={`bullet-${index}`} style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Body style={styles.bulletText}>{getText(bullet)}</Body>
                  </View>
                ))}
              </View>

              <View style={styles.noteBox}>
                <Meta style={styles.noteText}>{getText(faunaContent.doNotDisturb.note)}</Meta>
              </View>
            </View>
          </View>
        </View>

        {/* 5. Species Cards */}
        <View style={styles.speciesListContainer}>
          {faunaContent.species.map((species) => (
            <FaunaSpeciesCard
              key={species.id}
              species={species}
              language={language}
              criticalTag={faunaContent.criticalTag}
            />
          ))}
        </View>

        {/* 6. Sensitive Areas */}
        <View style={styles.sectionContainer}>
          <View style={styles.cardWrapper}>
            <View style={styles.shadowLayer} />
            <View style={[styles.card, styles.sensitiveCard]}>
              <Image
                source={{ uri: wikiThumb(faunaContent.sensitiveAreas.image.url, 800), headers: WIKI_IMAGE_HEADERS }}
                style={{ width: SENSITIVE_IMAGE_WIDTH, height: SENSITIVE_IMAGE_HEIGHT }}
                resizeMode="cover"
              />
              {faunaContent.sensitiveAreas.image.author && (
                <Meta style={styles.sensitiveImageAttribution}>
                  {faunaContent.sensitiveAreas.image.author}{' '}
                  {faunaContent.sensitiveAreas.image.license
                    ? `(${faunaContent.sensitiveAreas.image.license})`
                    : ''}
                </Meta>
              )}
              <View style={styles.sensitiveTextArea}>
                <H2 style={styles.sensitiveTitle}>{getText(faunaContent.sensitiveAreas.title)}</H2>
                <Body style={styles.sensitiveText}>{getText(faunaContent.sensitiveAreas.text)}</Body>
              </View>
            </View>
          </View>
        </View>

        {/* 7. Closing Note (no shadow, transport-note style) */}
        <View style={styles.sectionContainer}>
          <View style={styles.closingNoteCard}>
            <Body style={styles.closingNote}>{getText(faunaContent.closingNote)}</Body>
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
    backgroundColor: colors.background,
    borderColor: colors.urgent,
  },
  // Shadow for warning card uses urgent color with reduced opacity
  shadowLayerWarning: {
    backgroundColor: colors.sensitiveAreaBg,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  warningIconBox: {
    width: 44,
    height: 44,
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
    padding: 0,
    overflow: 'hidden',
  },
  sensitiveImageAttribution: {
    position: 'absolute',
    top: SENSITIVE_IMAGE_HEIGHT - 20,
    right: spacing.xs,
    backgroundColor: colors.overlay,
    color: colors.primaryText,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.micro,
  },
  sensitiveTextArea: {
    padding: spacing.lg,
  },
  sensitiveTitle: {
    marginBottom: spacing.md,
    color: colors.primaryText,
  },
  sensitiveText: {
    color: colors.primaryText,
    lineHeight: 22,
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

  // Closing note (transport-note style: thin border, no shadow)
  closingNoteCard: {
    borderWidth: borders.widthThin,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  closingNote: {
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default FaunaScreen;
