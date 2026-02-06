/**
 * Static Page Screen
 *
 * Renders published static pages with all block types.
 * Phase 3: Static Content Pages
 *
 * Rules (per spec):
 * - Render PUBLISHED pages only
 * - All 8 block types supported
 * - Notice block injected by backend (tapping opens inbox detail)
 * - Loading/empty/error states
 * - Local caching (TODO)
 *
 * Skin-pure: Uses skin tokens, Text primitives, and Icon (no hardcoded hex, no text glyphs).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import { GlobalHeader } from '../../components/GlobalHeader';
import { HeroMediaHeader } from '../../ui/HeroMediaHeader';
import { useTranslations } from '../../i18n';
import { useUserContext } from '../../hooks/useUserContext';
import { staticPagesApi } from '../../services/api';
import { wikiThumb } from '../../utils/wikiThumb';
import type { MainStackParamList } from '../../navigation/types';
import type {
  StaticPageResponse,
  ContentBlock,
  TextBlockContent,
  HighlightBlockContent,
  CardListBlockContent,
  MediaBlockContent,
  MapBlockContent,
  ContactBlockContent,
  LinkListBlockContent,
  NoticeBlockContent,
} from '../../types/static-page';
import { skin } from '../../ui/skin';
import { Button } from '../../ui/Button';
import { H1, H2, Label, Body, Meta, ButtonText } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { LoadingState, ErrorState } from '../../ui/States';

type PageRouteProp = RouteProp<MainStackParamList, 'StaticPage'>;

export function StaticPageScreen(): React.JSX.Element {
  const route = useRoute<PageRouteProp>();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { t } = useTranslations();
  const { slug } = route.params;

  // DEV LOGGING: Track StaticPageScreen renders
  // NOTE: This screen uses CONTENT NOTICES (NoticeBlock), NOT system banners from the API
  if (__DEV__) {
    console.log('[STATICPAGE_RENDER]', {
      slug,
      timestamp: new Date().toISOString(),
    });
  }

  const [page, setPage] = useState<StaticPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userContext = useUserContext();

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await staticPagesApi.getPage(slug, userContext);
      setPage(data);
    } catch (err) {
      console.error('[StaticPage] Error fetching page:', err);
      setError(t('staticPage.notFound'));
    } finally {
      setLoading(false);
    }
  }, [slug, userContext]);

  useEffect(() => {
    void fetchPage();
  }, [fetchPage]);

  const handleRetry = (): void => {
    void fetchPage();
  };

  const handleNoticePress = (noticeId: string): void => {
    navigation.navigate('InboxDetail', { messageId: noticeId });
  };

  const handleLinkPress = (linkType: string, linkTarget: string): void => {
    switch (linkType) {
      case 'inbox':
        navigation.navigate('InboxDetail', { messageId: linkTarget });
        break;
      case 'event':
        navigation.navigate('EventDetail', { eventId: linkTarget });
        break;
      case 'page':
        navigation.navigate('StaticPage', { slug: linkTarget });
        break;
      case 'screen':
        // Navigate to internal app screens (e.g., TransportHub, RoadTransport)
        // Use type assertion for dynamic screen navigation
        (navigation.navigate as (screen: string) => void)(linkTarget);
        break;
      case 'external':
        void Linking.openURL(linkTarget);
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <GlobalHeader type="child" />
        <LoadingState message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  if (error || !page) {
    return (
      <SafeAreaView style={styles.container}>
        <GlobalHeader type="child" />
        <ErrorState
          message={error || t('staticPage.notFound')}
          onRetry={handleRetry}
          retryLabel={t('common.retry')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader type="child" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Page Header */}
        <PageHeaderView header={page.header} />

        {/* Content Blocks */}
        {page.blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            onNoticePress={handleNoticePress}
            onLinkPress={handleLinkPress}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Page header renderer
 *
 * - media: Uses HeroMediaHeader with carousel, title slab (matches Flora/Fauna screens)
 * - simple: Uses plain H1 + subtitle
 */
function PageHeaderView({ header }: { header: StaticPageResponse['header'] }): React.JSX.Element {
  // Media header: use HeroMediaHeader component for carousel + title slab
  if (header.type === 'media' && header.images && header.images.length > 0) {
    // Convert images to wikiThumb URLs for proper sizing
    const heroImages = header.images.map((img) => wikiThumb(img, 1200));
    return (
      <HeroMediaHeader
        images={heroImages}
        title={header.title}
        subtitle={header.subtitle ?? undefined}
      />
    );
  }

  // Simple header: plain text
  return (
    <View style={styles.pageHeader}>
      <H1 style={styles.pageTitle}>{header.title}</H1>
      {header.subtitle && (
        <Body style={styles.pageSubtitle}>{header.subtitle}</Body>
      )}
    </View>
  );
}

/**
 * Block renderer - dispatches to type-specific renderers
 */
function BlockRenderer({
  block,
  onNoticePress,
  onLinkPress,
}: {
  block: ContentBlock;
  onNoticePress: (noticeId: string) => void;
  onLinkPress: (linkType: string, linkTarget: string) => void;
}): React.JSX.Element {
  switch (block.type) {
    case 'text':
      return <TextBlock content={block.content as TextBlockContent} />;
    case 'highlight':
      return <HighlightBlock content={block.content as HighlightBlockContent} />;
    case 'card_list':
      return <CardListBlock content={block.content as CardListBlockContent} onLinkPress={onLinkPress} />;
    case 'media':
      return <MediaBlock content={block.content as MediaBlockContent} />;
    case 'map':
      return <MapBlock content={block.content as MapBlockContent} />;
    case 'contact':
      return <ContactBlock content={block.content as ContactBlockContent} />;
    case 'link_list':
      return <LinkListBlock content={block.content as LinkListBlockContent} onLinkPress={onLinkPress} />;
    case 'notice':
      return <NoticeBlock content={block.content as NoticeBlockContent} onPress={onNoticePress} />;
    default:
      return <View />;
  }
}

// ============================================================
// Block Type Renderers
// ============================================================

function TextBlock({ content }: { content: TextBlockContent }): React.JSX.Element {
  return (
    <View style={styles.block}>
      {content.title && <H2 style={styles.blockTitle}>{content.title}</H2>}
      <Body style={styles.blockBody}>{content.body}</Body>
    </View>
  );
}

function HighlightBlock({ content }: { content: HighlightBlockContent }): React.JSX.Element {
  // Parse bullets: lines starting with • or - are treated as bullet items
  const bulletLines = content.body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const hasBullets = bulletLines.some(line => line.startsWith('•') || line.startsWith('-'));

  // Variant styling for the shadow
  const variantShadowColors: Record<string, string> = {
    info: skin.colors.infoText,
    warning: skin.colors.warningAccent,
    success: skin.colors.successText,
  };
  const shadowColor = variantShadowColors[content.variant] || variantShadowColors.info;

  return (
    <View style={styles.highlightCardContainer}>
      <View style={styles.highlightCardWrapper}>
        <View style={[styles.highlightShadow, { backgroundColor: shadowColor }]} />
        <View style={styles.highlightCard}>
          {content.title && <H2 style={styles.highlightCardTitle}>{content.title}</H2>}
          {hasBullets ? (
            <View style={styles.highlightBulletList}>
              {bulletLines.map((line, index) => {
                const text = line.replace(/^[•-]\s*/, '');
                return (
                  <View key={`bullet-${index}`} style={styles.highlightBulletRow}>
                    <View style={styles.highlightBulletIcon}>
                      <Icon name="check" size="sm" colorToken="secondary" />
                    </View>
                    <Body style={styles.highlightBulletText}>{text}</Body>
                  </View>
                );
              })}
            </View>
          ) : (
            <Body style={styles.highlightCardBody}>{content.body}</Body>
          )}
        </View>
      </View>
    </View>
  );
}

// Wikimedia requires User-Agent header to avoid 429 rate limits
const WIKI_IMAGE_HEADERS = {
  'User-Agent': 'MojVisApp/1.0 (https://vis.hr; contact@vis.hr) React-Native',
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const TILE_GAP = skin.spacing.md;
const TILE_WIDTH = (SCREEN_WIDTH - skin.spacing.lg * 2 - TILE_GAP) / 2;

function CardListBlock({
  content,
  onLinkPress
}: {
  content: CardListBlockContent;
  onLinkPress: (linkType: string, linkTarget: string) => void;
}): React.JSX.Element {
  if (content.cards.length === 0) return <View />;

  // For exactly 2 cards, render side-by-side (gateway tiles)
  const isTileLayout = content.cards.length === 2;

  if (isTileLayout) {
    return (
      <View style={styles.tilesContainer}>
        {content.cards.map((card) => {
          const imageUrl = card.image_url ? wikiThumb(card.image_url, 400) : null;
          return (
            <TouchableOpacity
              key={card.id}
              style={styles.tile}
              onPress={() => card.link_type && card.link_target && onLinkPress(card.link_type, card.link_target)}
              disabled={!card.link_type || !card.link_target}
              accessibilityRole="button"
              accessibilityLabel={card.title}
            >
              <View style={styles.tileShadow} />
              <View style={styles.tileInner}>
                {imageUrl && (
                  <Image
                    source={{ uri: imageUrl, headers: WIKI_IMAGE_HEADERS }}
                    style={styles.tileImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.tileContent}>
                  <ButtonText style={styles.tileTitle}>{card.title}</ButtonText>
                  {card.description && (
                    <Label style={styles.tileDescription} numberOfLines={2}>{card.description}</Label>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // Default: vertical card list
  return (
    <View style={styles.block}>
      {content.cards.map((card) => {
        const imageUrl = card.image_url ? wikiThumb(card.image_url, 800) : null;
        return (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            onPress={() => card.link_type && card.link_target && onLinkPress(card.link_type, card.link_target)}
            disabled={!card.link_type || !card.link_target}
          >
            {imageUrl && (
              <Image
                source={{ uri: imageUrl, headers: WIKI_IMAGE_HEADERS }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.cardContent}>
              <ButtonText style={styles.cardTitle}>{card.title}</ButtonText>
              {card.description && <Label style={styles.cardDescription}>{card.description}</Label>}
              {card.meta && <Meta style={styles.cardMeta}>{card.meta}</Meta>}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MediaBlock({ content }: { content: MediaBlockContent }): React.JSX.Element {
  if (content.images.length === 0) return <View />;

  return (
    <View style={styles.block}>
      {content.images.map((image, index) => (
        <Image
          key={index}
          source={{ uri: image }}
          style={styles.mediaImage}
          resizeMode="cover"
        />
      ))}
      {content.caption && <Meta style={styles.mediaCaption}>{content.caption}</Meta>}
    </View>
  );
}

function MapBlock({ content }: { content: MapBlockContent }): React.JSX.Element {
  const { t } = useTranslations();
  // Note: Full map implementation would use react-native-maps
  // For now, show a placeholder with pins list
  return (
    <View style={styles.block}>
      <View style={styles.mapPlaceholder}>
        <Label style={styles.mapPlaceholderText}>{t('staticPage.map')}</Label>
      </View>
      {content.pins.map((pin) => (
        <View key={pin.id} style={styles.mapPin}>
          <ButtonText style={styles.mapPinTitle}>{pin.title}</ButtonText>
          {pin.description && <Label style={styles.mapPinDesc}>{pin.description}</Label>}
          <Meta style={styles.mapPinCoords}>{pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}</Meta>
        </View>
      ))}
    </View>
  );
}

function ContactBlock({ content }: { content: ContactBlockContent }): React.JSX.Element {
  if (content.contacts.length === 0) return <View />;

  return (
    <View style={styles.block}>
      {content.contacts.map((contact) => (
        <View key={contact.id} style={styles.contactItem}>
          <ButtonText style={styles.contactName}>{contact.name}</ButtonText>
          {contact.address && <Label style={styles.contactInfo}>{contact.address}</Label>}
          {contact.phones.length > 0 && (
            <Label style={styles.contactInfo}>Tel: {contact.phones.join(', ')}</Label>
          )}
          {contact.email && (
            <TouchableOpacity onPress={() => void Linking.openURL(`mailto:${contact.email}`)}>
              <Label style={styles.contactLink}>{contact.email}</Label>
            </TouchableOpacity>
          )}
          {contact.working_hours && <Label style={styles.contactInfo}>{contact.working_hours}</Label>}
          {contact.note && <Meta style={styles.contactNote}>{contact.note}</Meta>}
        </View>
      ))}
    </View>
  );
}

function LinkListBlock({
  content,
  onLinkPress
}: {
  content: LinkListBlockContent;
  onLinkPress: (linkType: string, linkTarget: string) => void;
}): React.JSX.Element {
  if (content.links.length === 0) return <View />;

  return (
    <View style={styles.block}>
      {content.links.map((link) => (
        <TouchableOpacity
          key={link.id}
          style={styles.linkItem}
          onPress={() => onLinkPress(link.link_type, link.link_target)}
        >
          <Body style={styles.linkText}>{link.title}</Body>
          <Icon name="chevron-right" size="sm" colorToken="chevron" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function NoticeBlock({
  content,
  onPress
}: {
  content: NoticeBlockContent;
  onPress: (noticeId: string) => void;
}): React.JSX.Element {
  const { t } = useTranslations();
  // DEV LOGGING: NoticeBlock is a CONTENT NOTICE (from CMS), NOT a SYSTEM BANNER (from Inbox API)
  if (__DEV__) {
    console.log('[NOTICEBLOCK_RENDER]', {
      noticeCount: content.notices.length,
      noticeIds: content.notices.map(n => n.id.slice(0, 8)),
      source: 'CMS_CONTENT_BLOCK',
      timestamp: new Date().toISOString(),
    });
  }

  if (content.notices.length === 0) return <View />;

  return (
    <View style={styles.noticeBlock}>
      {content.notices.map((notice) => (
        <TouchableOpacity
          key={notice.id}
          style={[styles.noticeItem, notice.is_urgent && styles.noticeItemUrgent]}
          onPress={() => onPress(notice.id)}
        >
          {notice.is_urgent && <Meta style={styles.noticeUrgentBadge}>{t('banner.urgent')}</Meta>}
          <Label style={styles.noticeTitle}>{notice.title}</Label>
          <Icon name="chevron-right" size="sm" colorToken="chevron" />
        </TouchableOpacity>
      ))}
    </View>
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
  // Page Header
  pageHeader: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthHairline,
    borderBottomColor: skin.colors.borderLight,
    marginBottom: skin.spacing.sm,
  },
  headerImage: {
    width: '100%',
    height: 180,
    borderRadius: skin.borders.radiusCard,
    marginBottom: skin.spacing.md,
  },
  pageTitle: {
    marginBottom: skin.spacing.xs,
    // Inherited from H1 primitive
  },
  pageSubtitle: {
    color: skin.colors.textMuted,
  },

  // Generic block
  block: {
    padding: skin.spacing.lg,
    marginBottom: skin.spacing.sm,
  },
  blockTitle: {
    marginBottom: skin.spacing.sm,
    // Inherited from H2 primitive
  },
  blockBody: {
    lineHeight: 24,
    color: skin.colors.textSecondary,
  },

  // Highlight block (neobrut card with shadow)
  highlightCardContainer: {
    paddingHorizontal: skin.spacing.lg,
    paddingVertical: skin.spacing.md,
  },
  highlightCardWrapper: {
    position: 'relative',
  },
  highlightShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
  },
  highlightCard: {
    backgroundColor: skin.colors.background,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    padding: skin.spacing.lg,
  },
  highlightCardTitle: {
    marginBottom: skin.spacing.md,
  },
  highlightBulletList: {
    gap: skin.spacing.sm,
  },
  highlightBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  highlightBulletIcon: {
    width: 24,
    marginRight: skin.spacing.sm,
    paddingTop: 2,
  },
  highlightBulletText: {
    flex: 1,
    lineHeight: 22,
    color: skin.colors.textSecondary,
  },
  highlightCardBody: {
    lineHeight: 22,
    color: skin.colors.textSecondary,
  },

  // Card list (vertical)
  card: {
    backgroundColor: skin.colors.backgroundTertiary,
    borderRadius: skin.borders.radiusCard,
    marginBottom: skin.spacing.md,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: skin.spacing.md,
  },
  cardTitle: {
    marginBottom: skin.spacing.xs,
    // Inherited from ButtonText primitive
  },
  cardDescription: {
    marginBottom: skin.spacing.xs,
    color: skin.colors.textMuted,
  },
  cardMeta: {
    // Inherited from Meta primitive (textDisabled)
  },

  // Gateway tiles (side-by-side 2-column)
  tilesContainer: {
    flexDirection: 'row',
    paddingHorizontal: skin.spacing.lg,
    paddingVertical: skin.spacing.md,
    gap: skin.spacing.md,
  },
  tile: {
    flex: 1,
    position: 'relative',
  },
  tileShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: skin.colors.border,
  },
  tileInner: {
    backgroundColor: skin.colors.background,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    overflow: 'hidden',
  },
  tileImage: {
    width: '100%',
    height: 100,
  },
  tileContent: {
    padding: skin.spacing.md,
  },
  tileTitle: {
    marginBottom: skin.spacing.xs,
    color: skin.colors.textPrimary,
  },
  tileDescription: {
    color: skin.colors.textSecondary,
    lineHeight: 18,
  },

  // Media block
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: skin.borders.radiusCard,
    marginBottom: skin.spacing.sm,
  },
  mediaCaption: {
    fontStyle: 'italic',
    textAlign: 'center',
    // Inherited from Meta primitive
  },

  // Map block
  mapPlaceholder: {
    height: 200,
    backgroundColor: skin.colors.borderLight,
    borderRadius: skin.borders.radiusCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: skin.spacing.md,
  },
  mapPlaceholderText: {
    color: skin.colors.textMuted,
  },
  mapPin: {
    padding: skin.spacing.md,
    backgroundColor: skin.colors.backgroundTertiary,
    borderRadius: skin.borders.radiusCard,
    marginBottom: skin.spacing.sm,
  },
  mapPinTitle: {
    // Inherited from ButtonText primitive
  },
  mapPinDesc: {
    marginTop: 2,
    color: skin.colors.textMuted,
  },
  mapPinCoords: {
    marginTop: skin.spacing.xs,
    // Inherited from Meta primitive
  },

  // Contact block
  contactItem: {
    padding: skin.spacing.md,
    backgroundColor: skin.colors.backgroundTertiary,
    borderRadius: skin.borders.radiusCard,
    marginBottom: skin.spacing.md,
  },
  contactName: {
    marginBottom: skin.spacing.sm,
    // Inherited from ButtonText primitive
  },
  contactInfo: {
    marginBottom: skin.spacing.xs,
    color: skin.colors.textSecondary,
  },
  contactLink: {
    marginBottom: skin.spacing.xs,
    color: skin.colors.link,
  },
  contactNote: {
    fontStyle: 'italic',
    marginTop: skin.spacing.sm,
    // Inherited from Meta primitive
  },

  // Link list
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: skin.spacing.md,
    borderBottomWidth: skin.borders.widthHairline,
    borderBottomColor: skin.colors.borderLight,
  },
  linkText: {
    flex: 1,
    color: skin.colors.textPrimary,
  },

  // Notice block
  noticeBlock: {
    padding: skin.spacing.lg,
    backgroundColor: skin.colors.warningBackground,
    marginBottom: skin.spacing.sm,
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: skin.spacing.md,
    borderBottomWidth: skin.borders.widthHairline,
    borderBottomColor: skin.colors.warningAccent,
  },
  noticeItemUrgent: {
    backgroundColor: skin.colors.errorBackground,
    marginHorizontal: -skin.spacing.lg,
    paddingHorizontal: skin.spacing.lg,
  },
  noticeUrgentBadge: {
    backgroundColor: skin.colors.urgent,
    color: skin.colors.urgentText,
    paddingHorizontal: skin.spacing.sm,
    paddingVertical: 2,
    borderRadius: skin.spacing.xs,
    marginRight: skin.spacing.sm,
    overflow: 'hidden',
  },
  noticeTitle: {
    flex: 1,
    color: skin.colors.textSecondary,
  },
});

export default StaticPageScreen;
