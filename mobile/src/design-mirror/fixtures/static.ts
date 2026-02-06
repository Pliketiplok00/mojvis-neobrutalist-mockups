/**
 * Static Page Fixtures (Design Mirror)
 *
 * Static data for StaticPage mirror screen.
 * Includes all 8 block types for comprehensive visual testing.
 */

import type {
  StaticPageResponse,
  TextBlockContent,
  HighlightBlockContent,
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
    title: 'Flora i fauna',
    subtitle: 'Prirodne ljepote otoka Visa',
    images: ['https://upload.wikimedia.org/wikipedia/commons/c/c9/J32_479_Vis%2C_S%C3%BCdk%C3%BCste.jpg'],
  },
  blocks: [
    // Why special (shared intro)
    {
      id: 'flora-fauna-why-special',
      type: 'text',
      content: {
        title: 'Zašto je priroda Visa posebna?',
        body: 'Otok Vis je zbog svoje izoliranosti sačuvao jedinstvenu biološku raznolikost. Mediteranska klima, netaknuti ekosustavi i čisto more čine ga domom rijetkih i endemskih vrsta.',
      } as TextBlockContent,
    },
    // Highlights
    {
      id: 'flora-fauna-highlights',
      type: 'highlight',
      content: {
        variant: 'info',
        icon: null,
        title: 'Zanimljivosti',
        body: 'Vis je dio mreže Natura 2000. Na otoku raste preko 500 biljnih vrsta, a u okolnim vodama obitavaju dupini, kornjače i razne vrste riba.',
      } as HighlightBlockContent,
    },
    // Navigation tiles (card_list)
    {
      id: 'flora-fauna-cards',
      type: 'card_list',
      content: {
        cards: [
          {
            id: 'card-flora',
            image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Centaurea_ragusina_1.jpg/800px-Centaurea_ragusina_1.jpg',
            title: 'Flora',
            description: 'Biljni svijet otoka Visa — zaštićene i endemske vrste',
            meta: null,
            link_type: 'screen',
            link_target: 'Flora',
          },
          {
            id: 'card-fauna',
            image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Tursiops_truncatus_01.jpg/800px-Tursiops_truncatus_01.jpg',
            title: 'Fauna',
            description: 'Životinjski svijet otoka — morski i kopneni stanovnici',
            meta: null,
            link_type: 'screen',
            link_target: 'Fauna',
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
