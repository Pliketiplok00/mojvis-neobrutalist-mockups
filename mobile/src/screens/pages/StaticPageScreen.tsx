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
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import { GlobalHeader } from '../../components/GlobalHeader';
import { useTranslations } from '../../i18n';
import { useUserContext } from '../../hooks/useUserContext';
import { staticPagesApi } from '../../services/api';
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
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !page) {
    return (
      <SafeAreaView style={styles.container}>
        <GlobalHeader type="child" />
        <View style={styles.errorState}>
          <Text style={styles.errorIcon}>!</Text>
          <Text style={styles.errorTitle}>
            {error || t('staticPage.notFound')}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
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
 */
function PageHeaderView({ header }: { header: StaticPageResponse['header'] }): React.JSX.Element {
  return (
    <View style={styles.pageHeader}>
      {header.type === 'media' && header.images && header.images.length > 0 && (
        <Image
          source={{ uri: header.images[0] }}
          style={styles.headerImage}
          resizeMode="cover"
        />
      )}
      <Text style={styles.pageTitle}>{header.title}</Text>
      {header.subtitle && (
        <Text style={styles.pageSubtitle}>{header.subtitle}</Text>
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
      {content.title && <Text style={styles.blockTitle}>{content.title}</Text>}
      <Text style={styles.blockBody}>{content.body}</Text>
    </View>
  );
}

function HighlightBlock({ content }: { content: HighlightBlockContent }): React.JSX.Element {
  const variantStyles = {
    info: { backgroundColor: '#E3F2FD', borderColor: '#1565C0' },
    warning: { backgroundColor: '#FFF3CD', borderColor: '#856404' },
    success: { backgroundColor: '#D4EDDA', borderColor: '#155724' },
  };
  const style = variantStyles[content.variant] || variantStyles.info;

  return (
    <View style={[styles.block, styles.highlightBlock, { backgroundColor: style.backgroundColor, borderLeftColor: style.borderColor }]}>
      {content.title && <Text style={styles.highlightTitle}>{content.title}</Text>}
      <Text style={styles.highlightBody}>{content.body}</Text>
    </View>
  );
}

function CardListBlock({
  content,
  onLinkPress
}: {
  content: CardListBlockContent;
  onLinkPress: (linkType: string, linkTarget: string) => void;
}): React.JSX.Element {
  if (content.cards.length === 0) return <View />;

  return (
    <View style={styles.block}>
      {content.cards.map((card) => (
        <TouchableOpacity
          key={card.id}
          style={styles.card}
          onPress={() => card.link_type && card.link_target && onLinkPress(card.link_type, card.link_target)}
          disabled={!card.link_type || !card.link_target}
        >
          {card.image_url && (
            <Image source={{ uri: card.image_url }} style={styles.cardImage} resizeMode="cover" />
          )}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            {card.description && <Text style={styles.cardDescription}>{card.description}</Text>}
            {card.meta && <Text style={styles.cardMeta}>{card.meta}</Text>}
          </View>
        </TouchableOpacity>
      ))}
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
      {content.caption && <Text style={styles.mediaCaption}>{content.caption}</Text>}
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
        <Text style={styles.mapPlaceholderText}>{t('staticPage.map')}</Text>
      </View>
      {content.pins.map((pin) => (
        <View key={pin.id} style={styles.mapPin}>
          <Text style={styles.mapPinTitle}>{pin.title}</Text>
          {pin.description && <Text style={styles.mapPinDesc}>{pin.description}</Text>}
          <Text style={styles.mapPinCoords}>{pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}</Text>
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
          <Text style={styles.contactName}>{contact.name}</Text>
          {contact.address && <Text style={styles.contactInfo}>{contact.address}</Text>}
          {contact.phones.length > 0 && (
            <Text style={styles.contactInfo}>Tel: {contact.phones.join(', ')}</Text>
          )}
          {contact.email && (
            <TouchableOpacity onPress={() => void Linking.openURL(`mailto:${contact.email}`)}>
              <Text style={styles.contactLink}>{contact.email}</Text>
            </TouchableOpacity>
          )}
          {contact.working_hours && <Text style={styles.contactInfo}>{contact.working_hours}</Text>}
          {contact.note && <Text style={styles.contactNote}>{contact.note}</Text>}
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
          <Text style={styles.linkText}>{link.title}</Text>
          <Text style={styles.linkArrow}>-</Text>
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
          {notice.is_urgent && <Text style={styles.noticeUrgentBadge}>{t('banner.urgent')}</Text>}
          <Text style={styles.noticeTitle}>{notice.title}</Text>
          <Text style={styles.noticeArrow}>-</Text>
        </TouchableOpacity>
      ))}
    </View>
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
    paddingBottom: 32,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Page Header
  pageHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  headerImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#666666',
  },

  // Generic block
  block: {
    padding: 16,
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  blockBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },

  // Highlight block
  highlightBlock: {
    borderLeftWidth: 4,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  highlightBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
  },

  // Card list
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#999999',
  },

  // Media block
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  mediaCaption: {
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Map block
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#666666',
  },
  mapPin: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  mapPinTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  mapPinDesc: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  mapPinCoords: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },

  // Contact block
  contactItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  contactLink: {
    fontSize: 14,
    color: '#1565C0',
    marginBottom: 4,
  },
  contactNote: {
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 8,
  },

  // Link list
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  linkArrow: {
    fontSize: 18,
    color: '#666666',
  },

  // Notice block
  noticeBlock: {
    padding: 16,
    backgroundColor: '#FFF3CD',
    marginBottom: 8,
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE69C',
  },
  noticeItemUrgent: {
    backgroundColor: '#F8D7DA',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  noticeUrgentBadge: {
    backgroundColor: '#DC3545',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  noticeTitle: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  noticeArrow: {
    fontSize: 16,
    color: '#666666',
  },
});

export default StaticPageScreen;
