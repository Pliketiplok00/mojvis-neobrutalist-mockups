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
  HighlightBlockContent,
} from '../../types/static-page';

/**
 * Sample static page fixture with all 8 block types
 * Updated to match hub structure with shared "Why special" + "Highlights"
 */
export const staticPageFixture: StaticPageResponse = {
  id: 'page-flora-fauna',
  slug: 'flora-fauna',
  header: {
    type: 'simple',
    title: 'Flora i fauna',
    subtitle: 'Prirodne ljepote otoka Visa',
  },
  blocks: [
    // Shared "Why special" card
    {
      id: 'block-why-special',
      type: 'text',
      content: {
        title: 'Zašto su flora i fauna Viškog arhipelaga posebne',
        body: 'Viški arhipelag ima iznimno raznoliku mediteransku floru i faunu, oblikovanu izolacijom, čistim morem i netaknutim staništima. Na malom prostoru susreću se endemske vrste, rijetke ptice gnjezdarice, morski sisavci i preko 870 biljnih vrsta.\n\nMnoge vrste osjetljive su na uznemiravanje — promatrajte, fotografirajte, ali ne uznemiravajte i ne berite.',
      } as TextBlockContent,
    },
    // Shared "Highlights" card
    {
      id: 'block-highlights',
      type: 'highlight',
      content: {
        title: 'Zanimljivosti',
        body: '• Više od 870 biljnih vrsta zabilježeno je na Visu\n• Biševo je utočište za ugroženu sredozemnu medvjedicu\n• Viški arhipelag jedno je od rijetkih gnjezdilišta Eleonorinog sokola\n• Endemske gušterice razvijale su se izolirano tisućama godina\n• Natura 2000 štiti brojne vrste ovog područja',
        icon: null,
        variant: 'info',
      } as HighlightBlockContent,
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
            description: 'Životinjski svijet otoka Visa',
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
