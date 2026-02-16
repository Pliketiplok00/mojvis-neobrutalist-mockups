/**
 * Block Defaults and Utilities
 *
 * Utility functions for PageEditPage.
 * Extracted from PageEditPage.tsx for maintainability.
 */

import type { BlockType, ContentBlock } from '../../../types/static-page';

/**
 * Get default content for new block
 */
export function getDefaultBlockContent(type: BlockType): ContentBlock['content'] {
  switch (type) {
    case 'text':
      return {
        title_hr: null,
        title_en: null,
        body_hr: '',
        body_en: '',
      };
    case 'highlight':
      return {
        title_hr: null,
        title_en: null,
        body_hr: '',
        body_en: '',
        icon: null,
        variant: 'info',
      };
    case 'card_list':
      return { cards: [] };
    case 'media':
      return {
        url: '',
        caption_hr: null,
        caption_en: null,
        alt_hr: null,
        alt_en: null,
        credit_hr: null,
        credit_en: null,
      };
    case 'map':
      return {
        lat: 0,
        lng: 0,
        zoom: 14,
        title_hr: null,
        title_en: null,
        address_hr: null,
        address_en: null,
        note_hr: null,
        note_en: null,
      };
    case 'contact':
      return { contacts: [] };
    case 'link_list':
      return { links: [] };
    default:
      return {};
  }
}

/**
 * Format date for display
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
