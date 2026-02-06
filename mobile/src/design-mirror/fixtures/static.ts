/**
 * Static Page Fixtures (Design Mirror)
 *
 * Static data for StaticPage mirror screen.
 * Matches runtime seed data for visual parity testing.
 */

import type {
  StaticPageResponse,
  TextBlockContent,
  HighlightBlockContent,
  CardListBlockContent,
} from '../../types/static-page';

/**
 * Flora & Fauna HUB fixture (matches seed-menu-pages.ts)
 */
export const staticPageFixture: StaticPageResponse = {
  id: 'page-flora-fauna',
  slug: 'flora-fauna',
  header: {
    type: 'media',
    title: 'Flora i fauna',
    subtitle: 'Viški arhipelag',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/f/fa/Panoramic_view_of_Bisevo_island_next_to_Vis_island_in_Croatia_%2848608613336%29.jpg',
    ],
  },
  blocks: [
    // 0) INTRO TEXT BLOCK
    {
      id: 'flora-fauna-intro',
      type: 'text',
      content: {
        title: 'Zašto je flora i fauna viškog arhipelaga posebna?',
        body: 'Viški arhipelag čini mozaik otoka, otočića, hridi i podmorja koji su desetljećima ostali izvan intenzivnog ljudskog utjecaja. Upravo ta kombinacija izolacije, čistog mora i raznolikih staništa — od strmih morskih litica i špilja do suhozida, makije i otvorenog mora — stvorila je iznimno bogat i osjetljiv prirodni sustav.\n\nNa relativno malom prostoru susreću se rijetke i endemske biljne vrste, ptice gnijezdarice, morski sisavci i brojni podmorski organizmi. Mnoge od tih vrsta ovise o miru, stabilnosti i očuvanom okolišu — zato su promatranje, poštovanje i nenarušavanje ključni za njihovo očuvanje.',
      } as TextBlockContent,
    },
    // 1) FLORA & FAUNA TILES (card_list, side-by-side)
    {
      id: 'flora-fauna-tiles',
      type: 'card_list',
      content: {
        cards: [
          {
            id: 'tile-flora',
            image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Centaurea_ragusina_1.jpg',
            title: 'Flora',
            description: 'Biljni svijet viškog arhipelaga',
            meta: null,
            link_type: 'screen',
            link_target: 'Flora',
          },
          {
            id: 'tile-fauna',
            image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Tursiops_truncatus_01.jpg',
            title: 'Fauna',
            description: 'Životinjski svijet viškog arhipelaga',
            meta: null,
            link_type: 'screen',
            link_target: 'Fauna',
          },
        ],
      } as CardListBlockContent,
    },
    // 2) HIGHLIGHTS BLOCK
    {
      id: 'flora-fauna-highlights',
      type: 'highlight',
      content: {
        variant: 'info',
        icon: null,
        title: 'Zanimljivosti',
        body: '• Viški arhipelag dio je europske ekološke mreže Natura 2000, koja štiti najvrjednija prirodna staništa.\n• Otočići poput Biševa, Brusnika i Jabuke ključna su područja za gniježđenje ptica i život rijetkih morskih vrsta.\n• Podmorje arhipelaga dom je dupina, morskih kornjača i brojnih osjetljivih zajednica.\n• Mnoge biljne vrste prilagođene su surovim uvjetima — vjetru, suši i slanom aerosolu.\n• Tišina i slab svjetlosni utjecaj noću čine arhipelag važnim za noćne životinje i orijentaciju ptica.',
      } as HighlightBlockContent,
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
