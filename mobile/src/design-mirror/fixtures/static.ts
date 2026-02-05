/**
 * Static Page Fixtures (Design Mirror)
 *
 * Static data for StaticPage mirror screen.
 * Includes all 8 block types for comprehensive visual testing.
 */

import type {
  StaticPageResponse,
  TextBlockContent,
  CardListBlockContent,
} from '../../types/static-page';

/**
 * Sample static page fixture with all 8 block types
 */
export const staticPageFixture: StaticPageResponse = {
  id: 'page-flora-fauna',
  slug: 'flora-fauna',
  header: {
    type: 'media',
    title: 'Flora i Fauna',
    subtitle: 'Prirodne ljepote otoka Visa',
    images: ['https://picsum.photos/800/400?random=1'],
  },
  blocks: [
    // Intro text
    {
      id: 'block-text-intro',
      type: 'text',
      content: {
        title: null,
        body: 'Otok Vis je dom bogatoj mediteranskoj flori i fauni. Endemske biljke i rijetke životinjske vrste čine ovaj otok posebnim.',
      } as TextBlockContent,
    },
    // Gateway cards: Flora and Fauna
    {
      id: 'block-cards-gateway',
      type: 'card_list',
      content: {
        cards: [
          {
            id: 'card-flora',
            image_url: 'https://picsum.photos/400/200?random=flora',
            title: 'Flora',
            description: 'Zaštićene biljke i endemske vrste otoka Visa',
            meta: null,
            link_type: 'screen',
            link_target: 'Flora',
          },
          {
            id: 'card-fauna',
            image_url: 'https://picsum.photos/400/200?random=fauna',
            title: 'Fauna',
            description: 'Životinjski svijet otoka — uskoro',
            meta: null,
            link_type: null,
            link_target: null,
          },
        ],
      } as CardListBlockContent,
    },
  ],
};

/**
 * Simple static page fixture (fewer blocks, for quick testing)
 */
export const simpleStaticPageFixture: StaticPageResponse = {
  id: 'page-simple',
  slug: 'visitor-info',
  header: {
    type: 'simple',
    title: 'Info za posjetitelje',
    subtitle: null,
  },
  blocks: [
    {
      id: 'block-text-simple',
      type: 'text',
      content: {
        title: null,
        body: 'Dobrodošli na otok Vis! Ovdje ćete pronaći sve informacije potrebne za vaš posjet.',
      } as TextBlockContent,
    },
  ],
};
