/**
 * Static Page Types
 *
 * Types for the CMS static pages system.
 * Phase 3: Static Content Pages
 *
 * Rules (per spec):
 * - Draft/publish workflow (admin edits draft, supervisor publishes)
 * - HR and EN both REQUIRED for static pages (no exceptions)
 * - Exactly 8 block types (no custom HTML)
 * - Header is mandatory (exactly 1 per page)
 * - Max 1 map block per page
 * - Header media carousel: 1-5 images
 * - Per-block locking (structure + content)
 */

// ============================================================
// Block Types (EXACTLY 8)
// ============================================================

export const BLOCK_TYPES = [
  'text',
  'highlight',
  'card_list',
  'media',
  'map',
  'contact',
  'link_list',
  'notice', // System-controlled, read-only
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

/**
 * Highlight/Info block variants
 */
export const HIGHLIGHT_VARIANTS = ['info', 'warning', 'tip', 'notice'] as const;
export type HighlightVariant = (typeof HIGHLIGHT_VARIANTS)[number];

/**
 * Link types for card list and link list blocks
 */
export const LINK_TYPES = [
  'internal_static', // Link to another static page
  'internal_dynamic', // Link to event, transport, etc.
  'external', // External URL
  'none', // No link
] as const;
export type LinkType = (typeof LINK_TYPES)[number];

// ============================================================
// Block Content Structures
// ============================================================

/**
 * Text Block
 * Purpose: General text content
 */
export interface TextBlockContent {
  title_hr: string | null;
  title_en: string | null;
  body_hr: string; // Rich text, no custom HTML
  body_en: string; // Rich text, no custom HTML
}

/**
 * Highlight/Info Block
 * Purpose: Emphasized information (tips, warnings, notes)
 */
export interface HighlightBlockContent {
  title_hr: string | null;
  title_en: string | null;
  body_hr: string;
  body_en: string;
  icon: string | null;
  variant: HighlightVariant;
}

/**
 * Card in Card List Block
 */
export interface CardItem {
  id: string;
  image_url: string | null;
  title_hr: string;
  title_en: string;
  description_hr: string | null;
  description_en: string | null;
  meta_hr: string | null;
  meta_en: string | null;
  link_type: LinkType;
  link_target: string | null; // slug, entity ID, or URL
}

/**
 * Card List Block
 * Purpose: Lists of items displayed as cards
 */
export interface CardListBlockContent {
  cards: CardItem[];
}

/**
 * Media Block
 * Purpose: Visual content (image or carousel)
 */
export interface MediaBlockContent {
  images: string[]; // URLs, 1-5 images
  caption_hr: string | null;
  caption_en: string | null;
}

/**
 * Map Pin
 */
export interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  title_hr: string;
  title_en: string;
  description_hr: string | null;
  description_en: string | null;
}

/**
 * Map Block
 * Purpose: Display geographic locations
 * MAX 1 PER PAGE
 */
export interface MapBlockContent {
  pins: MapPin[];
}

/**
 * Contact in Contact Block
 */
export interface ContactItem {
  id: string;
  icon: string;
  name_hr: string;
  name_en: string;
  address_hr: string | null;
  address_en: string | null;
  phones: string[];
  email: string | null;
  working_hours_hr: string | null; // Free text or structured
  working_hours_en: string | null;
  note_hr: string | null;
  note_en: string | null;
}

/**
 * Contact Block
 * Purpose: Structured contact information
 */
export interface ContactBlockContent {
  contacts: ContactItem[];
}

/**
 * Link in Link List Block
 */
export interface LinkItem {
  id: string;
  title_hr: string;
  title_en: string;
  link_type: LinkType;
  link_target: string; // slug, entity ID, or URL
}

/**
 * Link List Block
 * Purpose: Curated lists of useful links
 */
export interface LinkListBlockContent {
  links: LinkItem[];
}

/**
 * Notice Block (System-controlled)
 * Purpose: Display active system notices
 *
 * IMPORTANT:
 * - This block is NOT stored/edited like other blocks
 * - Content is injected automatically by the system
 * - Based on active Inbox messages with relevant tags
 * - Read-only, cannot be created/edited/removed
 */
export interface NoticeBlockContent {
  // Content is empty - notices are injected at runtime
  // based on active Inbox messages
}

/**
 * Union type for all block content types
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

// ============================================================
// Block Structure
// ============================================================

/**
 * Content block with locking
 */
export interface ContentBlock {
  id: string;
  type: BlockType;
  content: BlockContent;
  order: number;
  structure_locked: boolean; // Admin cannot move/delete/change type
  content_locked: boolean; // Admin cannot edit content
}

// ============================================================
// Header Types
// ============================================================

export const HEADER_TYPES = ['simple', 'media'] as const;
export type HeaderType = (typeof HEADER_TYPES)[number];

/**
 * Simple Header
 */
export interface SimpleHeader {
  type: 'simple';
  title_hr: string;
  title_en: string;
  subtitle_hr: string | null;
  subtitle_en: string | null;
  icon: string | null;
}

/**
 * Media Header (with carousel)
 */
export interface MediaHeader {
  type: 'media';
  title_hr: string;
  title_en: string;
  subtitle_hr: string | null;
  subtitle_en: string | null;
  images: string[]; // URLs, 1-5 images
}

export type PageHeader = SimpleHeader | MediaHeader;

// ============================================================
// Page Structure
// ============================================================

/**
 * Static page (draft state stored in database)
 */
export interface StaticPage {
  id: string;
  slug: string; // Stable identifier, URL-friendly

  // Draft content (what admin edits)
  draft_header: PageHeader;
  draft_blocks: ContentBlock[];
  draft_updated_at: Date;
  draft_updated_by: string | null;

  // Published content (what mobile sees)
  published_header: PageHeader | null;
  published_blocks: ContentBlock[] | null;
  published_at: Date | null;
  published_by: string | null;

  // Metadata
  created_at: Date;
  created_by: string | null;
}

/**
 * Static page input for creation
 */
export interface StaticPageCreateInput {
  slug: string;
  header: PageHeader;
  blocks?: ContentBlock[];
}

/**
 * Static page draft update input
 */
export interface StaticPageDraftUpdateInput {
  header?: PageHeader;
  blocks?: ContentBlock[];
}

/**
 * Block update input (for admin editing content)
 */
export interface BlockContentUpdateInput {
  block_id: string;
  content: BlockContent;
}

/**
 * Block structure update input (for supervisor)
 */
export interface BlockStructureUpdateInput {
  block_id: string;
  structure_locked?: boolean;
  content_locked?: boolean;
  order?: number;
}

/**
 * Add block input (supervisor only)
 */
export interface AddBlockInput {
  type: BlockType;
  content: BlockContent;
  order?: number;
  structure_locked?: boolean;
  content_locked?: boolean;
}

// ============================================================
// API Response Types
// ============================================================

/**
 * Public static page response (published content, localized)
 */
export interface StaticPagePublicResponse {
  id: string;
  slug: string;
  header: {
    type: HeaderType;
    title: string;
    subtitle: string | null;
    icon?: string | null;
    images?: string[];
  };
  blocks: Array<{
    id: string;
    type: BlockType;
    content: Record<string, unknown>; // Localized content
  }>;
}

/**
 * Public page list item (for menu)
 */
export interface StaticPageListItem {
  id: string;
  slug: string;
  title: string;
}

/**
 * Public page list response
 */
export interface StaticPageListResponse {
  pages: StaticPageListItem[];
}

/**
 * Admin static page response (includes draft and published states)
 */
export interface StaticPageAdminResponse {
  id: string;
  slug: string;
  draft_header: PageHeader;
  draft_blocks: ContentBlock[];
  draft_updated_at: string;
  draft_updated_by: string | null;
  published_header: PageHeader | null;
  published_blocks: ContentBlock[] | null;
  published_at: string | null;
  published_by: string | null;
  has_unpublished_changes: boolean;
  created_at: string;
}

/**
 * Admin page list response
 */
export interface StaticPageAdminListResponse {
  pages: StaticPageAdminResponse[];
  total: number;
}

// ============================================================
// Validation Types
// ============================================================

/**
 * Validation error detail
 */
export interface ValidationError {
  field: string;
  message: string;
  block_id?: string;
  language?: 'hr' | 'en';
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validate block type is in allowed list
 */
export function isValidBlockType(type: string): type is BlockType {
  return BLOCK_TYPES.includes(type as BlockType);
}

/**
 * Validate header type
 */
export function isValidHeaderType(type: string): type is HeaderType {
  return HEADER_TYPES.includes(type as HeaderType);
}

/**
 * Validate highlight variant
 */
export function isValidHighlightVariant(variant: string): variant is HighlightVariant {
  return HIGHLIGHT_VARIANTS.includes(variant as HighlightVariant);
}

/**
 * Validate link type
 */
export function isValidLinkType(type: string): type is LinkType {
  return LINK_TYPES.includes(type as LinkType);
}

/**
 * Count map blocks in a block array
 */
export function countMapBlocks(blocks: ContentBlock[]): number {
  return blocks.filter((b) => b.type === 'map').length;
}

/**
 * Validate page can be published
 * Returns detailed validation errors
 */
export function validateForPublish(page: StaticPage): ValidationResult {
  const errors: ValidationError[] = [];
  const header = page.draft_header;
  const blocks = page.draft_blocks;

  // 1. Header is mandatory
  if (!header) {
    errors.push({
      field: 'header',
      message: 'Header is required',
    });
  } else {
    // Validate header HR content
    if (!header.title_hr?.trim()) {
      errors.push({
        field: 'header.title_hr',
        message: 'Header title (HR) is required',
        language: 'hr',
      });
    }
    // Validate header EN content
    if (!header.title_en?.trim()) {
      errors.push({
        field: 'header.title_en',
        message: 'Header title (EN) is required',
        language: 'en',
      });
    }
    // Validate media header images
    if (header.type === 'media') {
      const mediaHeader = header as MediaHeader;
      if (!mediaHeader.images || mediaHeader.images.length === 0) {
        errors.push({
          field: 'header.images',
          message: 'Media header requires at least 1 image',
        });
      } else if (mediaHeader.images.length > 5) {
        errors.push({
          field: 'header.images',
          message: 'Media header allows maximum 5 images',
        });
      }
    }
  }

  // 2. Body must have at least 1 content block (excluding notice blocks)
  const contentBlocks = blocks.filter((b) => b.type !== 'notice');
  if (contentBlocks.length === 0) {
    errors.push({
      field: 'blocks',
      message: 'At least one content block is required',
    });
  }

  // 3. Max 1 map block per page
  const mapCount = countMapBlocks(blocks);
  if (mapCount > 1) {
    errors.push({
      field: 'blocks',
      message: 'Maximum 1 map block allowed per page',
    });
  }

  // 4. Validate each block has required HR/EN content
  for (const block of blocks) {
    const validationErrors = validateBlockContent(block);
    errors.push(...validationErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate individual block content for HR/EN completeness
 */
export function validateBlockContent(block: ContentBlock): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (block.type) {
    case 'text': {
      const content = block.content as TextBlockContent;
      if (!content.body_hr?.trim()) {
        errors.push({
          field: 'body_hr',
          message: 'Text body (HR) is required',
          block_id: block.id,
          language: 'hr',
        });
      }
      if (!content.body_en?.trim()) {
        errors.push({
          field: 'body_en',
          message: 'Text body (EN) is required',
          block_id: block.id,
          language: 'en',
        });
      }
      break;
    }

    case 'highlight': {
      const content = block.content as HighlightBlockContent;
      if (!content.body_hr?.trim()) {
        errors.push({
          field: 'body_hr',
          message: 'Highlight body (HR) is required',
          block_id: block.id,
          language: 'hr',
        });
      }
      if (!content.body_en?.trim()) {
        errors.push({
          field: 'body_en',
          message: 'Highlight body (EN) is required',
          block_id: block.id,
          language: 'en',
        });
      }
      if (!isValidHighlightVariant(content.variant)) {
        errors.push({
          field: 'variant',
          message: 'Invalid highlight variant',
          block_id: block.id,
        });
      }
      break;
    }

    case 'card_list': {
      const content = block.content as CardListBlockContent;
      if (!content.cards || content.cards.length === 0) {
        errors.push({
          field: 'cards',
          message: 'Card list requires at least 1 card',
          block_id: block.id,
        });
      } else {
        for (const card of content.cards) {
          if (!card.title_hr?.trim()) {
            errors.push({
              field: `card.${card.id}.title_hr`,
              message: 'Card title (HR) is required',
              block_id: block.id,
              language: 'hr',
            });
          }
          if (!card.title_en?.trim()) {
            errors.push({
              field: `card.${card.id}.title_en`,
              message: 'Card title (EN) is required',
              block_id: block.id,
              language: 'en',
            });
          }
        }
      }
      break;
    }

    case 'media': {
      const content = block.content as MediaBlockContent;
      if (!content.images || content.images.length === 0) {
        errors.push({
          field: 'images',
          message: 'Media block requires at least 1 image',
          block_id: block.id,
        });
      } else if (content.images.length > 5) {
        errors.push({
          field: 'images',
          message: 'Media block allows maximum 5 images',
          block_id: block.id,
        });
      }
      break;
    }

    case 'map': {
      const content = block.content as MapBlockContent;
      if (!content.pins || content.pins.length === 0) {
        errors.push({
          field: 'pins',
          message: 'Map block requires at least 1 pin',
          block_id: block.id,
        });
      } else {
        for (const pin of content.pins) {
          if (!pin.title_hr?.trim()) {
            errors.push({
              field: `pin.${pin.id}.title_hr`,
              message: 'Map pin title (HR) is required',
              block_id: block.id,
              language: 'hr',
            });
          }
          if (!pin.title_en?.trim()) {
            errors.push({
              field: `pin.${pin.id}.title_en`,
              message: 'Map pin title (EN) is required',
              block_id: block.id,
              language: 'en',
            });
          }
        }
      }
      break;
    }

    case 'contact': {
      const content = block.content as ContactBlockContent;
      if (!content.contacts || content.contacts.length === 0) {
        errors.push({
          field: 'contacts',
          message: 'Contact block requires at least 1 contact',
          block_id: block.id,
        });
      } else {
        for (const contact of content.contacts) {
          if (!contact.name_hr?.trim()) {
            errors.push({
              field: `contact.${contact.id}.name_hr`,
              message: 'Contact name (HR) is required',
              block_id: block.id,
              language: 'hr',
            });
          }
          if (!contact.name_en?.trim()) {
            errors.push({
              field: `contact.${contact.id}.name_en`,
              message: 'Contact name (EN) is required',
              block_id: block.id,
              language: 'en',
            });
          }
        }
      }
      break;
    }

    case 'link_list': {
      const content = block.content as LinkListBlockContent;
      if (!content.links || content.links.length === 0) {
        errors.push({
          field: 'links',
          message: 'Link list requires at least 1 link',
          block_id: block.id,
        });
      } else {
        for (const link of content.links) {
          if (!link.title_hr?.trim()) {
            errors.push({
              field: `link.${link.id}.title_hr`,
              message: 'Link title (HR) is required',
              block_id: block.id,
              language: 'hr',
            });
          }
          if (!link.title_en?.trim()) {
            errors.push({
              field: `link.${link.id}.title_en`,
              message: 'Link title (EN) is required',
              block_id: block.id,
              language: 'en',
            });
          }
          if (!link.link_target?.trim()) {
            errors.push({
              field: `link.${link.id}.link_target`,
              message: 'Link target is required',
              block_id: block.id,
            });
          }
        }
      }
      break;
    }

    case 'notice':
      // Notice blocks are system-controlled, no validation needed
      break;
  }

  return errors;
}

/**
 * Sanitize text content to remove potential HTML/script injection
 * Returns clean text with basic formatting preserved
 */
export function sanitizeRichText(text: string): string {
  if (!text) return '';

  // Remove script tags and their content
  let clean = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: urls
  clean = clean.replace(/javascript:/gi, '');

  // Remove style tags
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Allow only safe tags (p, br, strong, em, ul, ol, li)
  // For now, strip all HTML and keep plain text
  // TODO: Implement proper HTML sanitization if rich text is needed
  clean = clean.replace(/<[^>]*>/g, '');

  return clean.trim();
}
