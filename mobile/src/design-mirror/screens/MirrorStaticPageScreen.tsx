/**
 * Mirror Static Page Screen (Design Mirror)
 *
 * Mirrors StaticPageScreen with all 8 block types using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Block types mirrored:
 * 1. TextBlock
 * 2. HighlightBlock (info/warning/success variants)
 * 3. CardListBlock
 * 4. MediaBlock
 * 5. MapBlock
 * 6. ContactBlock
 * 7. LinkListBlock
 * 8. NoticeBlock
 *
 * Rules:
 * - NO useNavigation import
 * - NO navigate() calls
 * - NO API calls
 * - Data from fixtures only
 * - Skin tokens only
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { H1, H2, Label, Body, Meta, ButtonText } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
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
import { staticPageFixture } from '../fixtures/static';

/**
 * Mirror Static Page Screen
 * Uses staticPageFixture for all content
 */
export function MirrorStaticPageScreen(): React.JSX.Element {
  const page: StaticPageResponse = staticPageFixture;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header - simplified, no navigation */}
      <View style={styles.header}>
        <H2 style={styles.headerTitle}>StaticPage Mirror</H2>
        <Meta style={styles.headerMeta}>slug: {page.slug}</Meta>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Page Header */}
        <PageHeaderView header={page.header} />

        {/* Content Blocks */}
        {page.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
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
      <H1 style={styles.pageTitle}>{header.title}</H1>
      {header.subtitle && (
        <Body style={styles.pageSubtitle}>{header.subtitle}</Body>
      )}
    </View>
  );
}

/**
 * Block renderer - dispatches to type-specific renderers
 * NO onPress handlers that navigate - visual only
 */
function BlockRenderer({ block }: { block: ContentBlock }): React.JSX.Element {
  switch (block.type) {
    case 'text':
      return <TextBlock content={block.content as TextBlockContent} />;
    case 'highlight':
      return <HighlightBlock content={block.content as HighlightBlockContent} />;
    case 'card_list':
      return <CardListBlock content={block.content as CardListBlockContent} />;
    case 'media':
      return <MediaBlock content={block.content as MediaBlockContent} />;
    case 'map':
      return <MapBlock content={block.content as MapBlockContent} />;
    case 'contact':
      return <ContactBlock content={block.content as ContactBlockContent} />;
    case 'link_list':
      return <LinkListBlock content={block.content as LinkListBlockContent} />;
    case 'notice':
      return <NoticeBlock content={block.content as NoticeBlockContent} />;
    default:
      return <View />;
  }
}

// ============================================================
// Block Type Renderers (Visual only, no navigation)
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
  const variantStyles = {
    info: { backgroundColor: skin.colors.infoBackground, borderColor: skin.colors.infoText },
    warning: { backgroundColor: skin.colors.warningBackground, borderColor: skin.colors.warningAccent },
    success: { backgroundColor: skin.colors.successBackground, borderColor: skin.colors.successText },
  };
  const style = variantStyles[content.variant] || variantStyles.info;

  return (
    <View style={[styles.block, styles.highlightBlock, { backgroundColor: style.backgroundColor, borderLeftColor: style.borderColor }]}>
      {content.title && <ButtonText style={styles.highlightTitle}>{content.title}</ButtonText>}
      <Body style={styles.highlightBody}>{content.body}</Body>
    </View>
  );
}

function CardListBlock({ content }: { content: CardListBlockContent }): React.JSX.Element {
  if (content.cards.length === 0) return <View />;

  return (
    <View style={styles.block}>
      {content.cards.map((card) => (
        <TouchableOpacity
          key={card.id}
          style={styles.card}
          disabled={true} // No navigation in mirror
          activeOpacity={1}
        >
          {card.image_url && (
            <Image source={{ uri: card.image_url }} style={styles.cardImage} resizeMode="cover" />
          )}
          <View style={styles.cardContent}>
            <ButtonText style={styles.cardTitle}>{card.title}</ButtonText>
            {card.description && <Label style={styles.cardDescription}>{card.description}</Label>}
            {card.meta && <Meta style={styles.cardMeta}>{card.meta}</Meta>}
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
      {content.caption && <Meta style={styles.mediaCaption}>{content.caption}</Meta>}
    </View>
  );
}

function MapBlock({ content }: { content: MapBlockContent }): React.JSX.Element {
  return (
    <View style={styles.block}>
      <View style={styles.mapPlaceholder}>
        <Label style={styles.mapPlaceholderText}>Karta</Label>
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
            <Label style={styles.contactLink}>{contact.email}</Label>
          )}
          {contact.working_hours && <Label style={styles.contactInfo}>{contact.working_hours}</Label>}
          {contact.note && <Meta style={styles.contactNote}>{contact.note}</Meta>}
        </View>
      ))}
    </View>
  );
}

function LinkListBlock({ content }: { content: LinkListBlockContent }): React.JSX.Element {
  if (content.links.length === 0) return <View />;

  return (
    <View style={styles.block}>
      {content.links.map((link) => (
        <TouchableOpacity
          key={link.id}
          style={styles.linkItem}
          disabled={true} // No navigation in mirror
          activeOpacity={1}
        >
          <Body style={styles.linkText}>{link.title}</Body>
          <Icon name="chevron-right" size="sm" colorToken="chevron" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function NoticeBlock({ content }: { content: NoticeBlockContent }): React.JSX.Element {
  if (content.notices.length === 0) return <View />;

  return (
    <View style={styles.noticeBlock}>
      {content.notices.map((notice) => (
        <TouchableOpacity
          key={notice.id}
          style={[styles.noticeItem, notice.is_urgent && styles.noticeItemUrgent]}
          disabled={true} // No navigation in mirror
          activeOpacity={1}
        >
          {notice.is_urgent && <Meta style={styles.noticeUrgentBadge}>HITNO</Meta>}
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
  header: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundTertiary,
  },
  headerTitle: {
    marginBottom: skin.spacing.xs,
  },
  headerMeta: {
    color: skin.colors.textMuted,
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
  },
  blockBody: {
    lineHeight: 24,
    color: skin.colors.textSecondary,
  },

  // Highlight block
  highlightBlock: {
    borderLeftWidth: 4,
    borderRadius: skin.borders.radiusCard,
    marginHorizontal: skin.spacing.lg,
  },
  highlightTitle: {
    marginBottom: skin.spacing.xs,
    color: skin.colors.textPrimary,
  },
  highlightBody: {
    lineHeight: 22,
    color: skin.colors.textSecondary,
  },

  // Card list
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
  },
  cardDescription: {
    marginBottom: skin.spacing.xs,
    color: skin.colors.textMuted,
  },
  cardMeta: {
    // Inherited from Meta primitive
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
    marginTop: skin.spacing.micro,
    color: skin.colors.textMuted,
  },
  mapPinCoords: {
    marginTop: skin.spacing.xs,
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
    paddingVertical: skin.spacing.micro,
    borderRadius: skin.spacing.xs,
    marginRight: skin.spacing.sm,
    overflow: 'hidden',
  },
  noticeTitle: {
    flex: 1,
    color: skin.colors.textSecondary,
  },
});

export default MirrorStaticPageScreen;
