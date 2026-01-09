/**
 * Admin Static Page Types
 *
 * Types for static pages CMS management in admin panel.
 * Phase 3: Static Content Pages
 *
 * Rules (per spec):
 * - Draft/publish workflow (Supervisor publishes)
 * - HR and EN BOTH required for publish (no exceptions)
 * - 8 block types ONLY
 * - Notice blocks are system-controlled
 * - Max 1 map block per page
 * - Per-block locking (structure + content)
 */

/**
 * Fixed block types (FINAL per spec)
 */
export const BLOCK_TYPES = [
  'text',
  'highlight',
  'card_list',
  'media',
  'map',
  'contact',
  'link_list',
  'notice', // System-controlled - not editable
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

/**
 * Block type labels for display (HR-only for admin)
 */
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  text: 'Tekst',
  highlight: 'Istaknuto / Info',
  card_list: 'Lista kartica',
  media: 'Mediji (slike)',
  map: 'Karta',
  contact: 'Kontakti',
  link_list: 'Lista linkova',
  notice: 'Obavijest (sistem)',
};

/**
 * Header type for static page
 */
export type HeaderType = 'simple' | 'media';

/**
 * Page header structure
 */
export interface PageHeader {
  type: HeaderType;
  title_hr: string;
  title_en: string;
  subtitle_hr: string | null;
  subtitle_en: string | null;
  icon?: string | null; // For simple header
  images?: string[]; // For media header (1-5 images)
}

// ============================================================
// Block Content Types
// ============================================================

export interface TextBlockContent {
  title_hr: string | null;
  title_en: string | null;
  body_hr: string;
  body_en: string;
}

export interface HighlightBlockContent {
  title_hr: string | null;
  title_en: string | null;
  body_hr: string;
  body_en: string;
  icon: string | null;
  variant: 'info' | 'warning' | 'success';
}

export interface CardItem {
  id: string;
  image_url: string | null;
  title_hr: string;
  title_en: string;
  description_hr: string | null;
  description_en: string | null;
  meta_hr: string | null;
  meta_en: string | null;
  link_type: 'inbox' | 'event' | 'page' | 'external' | null;
  link_target: string | null;
}

export interface CardListBlockContent {
  cards: CardItem[];
}

export interface MediaBlockContent {
  url: string;
  caption_hr: string | null;
  caption_en: string | null;
  alt_hr: string | null;
  alt_en: string | null;
  credit_hr: string | null;
  credit_en: string | null;
}

export interface MapBlockContent {
  lat: number;
  lng: number;
  zoom: number;
  title_hr: string | null;
  title_en: string | null;
  address_hr: string | null;
  address_en: string | null;
  note_hr: string | null;
  note_en: string | null;
}

export interface ContactItem {
  id: string;
  icon: string | null;
  name_hr: string;
  name_en: string;
  address_hr: string | null;
  address_en: string | null;
  phones: string[];
  email: string | null;
  working_hours_hr: string | null;
  working_hours_en: string | null;
  note_hr: string | null;
  note_en: string | null;
}

export interface ContactBlockContent {
  contacts: ContactItem[];
}

export interface LinkItem {
  id: string;
  title_hr: string;
  title_en: string;
  link_type: 'inbox' | 'event' | 'page' | 'external';
  link_target: string;
}

export interface LinkListBlockContent {
  links: LinkItem[];
}

// Notice block content is empty - it's system-injected
export type NoticeBlockContent = Record<string, never>;

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
 * Content block structure
 */
export interface ContentBlock {
  id: string;
  type: BlockType;
  content: BlockContent;
  order: number;
  structure_locked: boolean;
  content_locked: boolean;
}

/**
 * Static page as stored/retrieved (admin view)
 */
export interface StaticPageAdmin {
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
 * Create page input (supervisor only)
 */
export interface StaticPageCreateInput {
  slug: string;
  header: PageHeader;
  blocks?: ContentBlock[];
}

/**
 * Update draft input (admin)
 */
export interface StaticPageDraftUpdateInput {
  header?: PageHeader;
  blocks?: ContentBlock[];
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

/**
 * Update block structure input (supervisor only)
 */
export interface BlockStructureUpdateInput {
  block_id: string;
  structure_locked?: boolean;
  content_locked?: boolean;
  order?: number;
}

/**
 * Paginated list response
 */
export interface StaticPageListResponse {
  pages: StaticPageAdmin[];
  total: number;
}

/**
 * Validation error from publish attempt
 */
export interface ValidationError {
  field: string;
  message: string;
  language?: 'hr' | 'en';
  block_id?: string;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if user can edit block content
 */
export function canEditBlockContent(block: ContentBlock, isSupervisor: boolean): boolean {
  if (block.type === 'notice') return false;
  if (block.content_locked && !isSupervisor) return false;
  return true;
}

/**
 * Check if user can modify block structure
 */
export function canModifyBlockStructure(block: ContentBlock, isSupervisor: boolean): boolean {
  if (!isSupervisor) return false;
  return !block.structure_locked;
}

/**
 * Get addable block types (exclude notice)
 */
export function getAddableBlockTypes(): BlockType[] {
  return BLOCK_TYPES.filter(type => type !== 'notice');
}

/**
 * Count map blocks in array
 */
export function countMapBlocks(blocks: ContentBlock[]): number {
  return blocks.filter(b => b.type === 'map').length;
}

/**
 * Check if can add map block
 */
export function canAddMapBlock(blocks: ContentBlock[]): boolean {
  return countMapBlocks(blocks) < 1;
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug);
}
