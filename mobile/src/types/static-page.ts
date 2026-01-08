/**
 * Static Page Types (Mobile)
 *
 * Types for static page rendering in mobile app.
 * Phase 3: Static Content Pages
 *
 * Rules (per spec):
 * - Render PUBLISHED static pages only
 * - 8 block types
 * - Notice block injected automatically
 * - Language-localized content from API
 */

/**
 * Block types
 */
export type BlockType =
  | 'text'
  | 'highlight'
  | 'card_list'
  | 'media'
  | 'map'
  | 'contact'
  | 'link_list'
  | 'notice';

/**
 * Localized page header (from API)
 */
export interface PageHeader {
  type: 'simple' | 'media';
  title: string;
  subtitle: string | null;
  icon?: string | null;
  images?: string[];
}

/**
 * Text block content (localized)
 */
export interface TextBlockContent {
  title: string | null;
  body: string;
}

/**
 * Highlight block content (localized)
 */
export interface HighlightBlockContent {
  title: string | null;
  body: string;
  icon: string | null;
  variant: 'info' | 'warning' | 'success';
}

/**
 * Card item (localized)
 */
export interface CardItem {
  id: string;
  image_url: string | null;
  title: string;
  description: string | null;
  meta: string | null;
  link_type: 'inbox' | 'event' | 'page' | 'external' | null;
  link_target: string | null;
}

/**
 * Card list block content
 */
export interface CardListBlockContent {
  cards: CardItem[];
}

/**
 * Media block content
 */
export interface MediaBlockContent {
  images: string[];
  caption: string | null;
}

/**
 * Map pin (localized)
 */
export interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string | null;
}

/**
 * Map block content
 */
export interface MapBlockContent {
  pins: MapPin[];
}

/**
 * Contact item (localized)
 */
export interface ContactItem {
  id: string;
  icon: string | null;
  name: string;
  address: string | null;
  phones: string[];
  email: string | null;
  working_hours: string | null;
  note: string | null;
}

/**
 * Contact block content
 */
export interface ContactBlockContent {
  contacts: ContactItem[];
}

/**
 * Link item (localized)
 */
export interface LinkItem {
  id: string;
  title: string;
  link_type: 'inbox' | 'event' | 'page' | 'external';
  link_target: string;
}

/**
 * Link list block content
 */
export interface LinkListBlockContent {
  links: LinkItem[];
}

/**
 * Notice item (injected by backend)
 */
export interface NoticeItem {
  id: string;
  title: string;
  is_urgent: boolean;
}

/**
 * Notice block content
 */
export interface NoticeBlockContent {
  notices: NoticeItem[];
}

/**
 * Block content union type
 */
export type BlockContent =
  | TextBlockContent
  | HighlightBlockContent
  | CardListBlockContent
  | MediaBlockContent
  | MapBlockContent
  | ContactBlockContent
  | LinkListBlockContent
  | NoticeBlockContent;

/**
 * Content block (localized)
 */
export interface ContentBlock {
  id: string;
  type: BlockType;
  content: BlockContent;
}

/**
 * Static page response (localized)
 */
export interface StaticPageResponse {
  id: string;
  slug: string;
  header: PageHeader;
  blocks: ContentBlock[];
}

/**
 * Page list item (for menu)
 */
export interface PageListItem {
  id: string;
  slug: string;
  title: string;
}

/**
 * Page list response
 */
export interface PageListResponse {
  pages: PageListItem[];
}
