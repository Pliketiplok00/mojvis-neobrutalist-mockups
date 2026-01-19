/**
 * Static Page Fixtures (Design Mirror)
 *
 * Static data for StaticPage mirror screen.
 * Includes all 8 block types for comprehensive visual testing.
 */

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
    // 1. TextBlock
    {
      id: 'block-text-1',
      type: 'text',
      content: {
        title: 'O prirodi otoka',
        body: 'Otok Vis je dom bogatoj mediteranskoj flori i fauni. Endemske biljke i rijetke životinjske vrste čine ovaj otok posebnim. Posjetitelji mogu uživati u prirodnim ljepotama nacionalnog parka i zaštićenih područja.',
      } as TextBlockContent,
    },
    // 2. HighlightBlock - info variant
    {
      id: 'block-highlight-info',
      type: 'highlight',
      content: {
        title: 'Savjet za posjetitelje',
        body: 'Preporučujemo posjet u ranim jutarnjim satima kada je fauna najaktivnija.',
        icon: 'info',
        variant: 'info',
      } as HighlightBlockContent,
    },
    // 3. HighlightBlock - warning variant
    {
      id: 'block-highlight-warning',
      type: 'highlight',
      content: {
        title: 'Upozorenje',
        body: 'Zabranjeno je branje zaštićenih biljaka. Kazne su visoke.',
        icon: 'alert-triangle',
        variant: 'warning',
      } as HighlightBlockContent,
    },
    // 4. HighlightBlock - success variant
    {
      id: 'block-highlight-success',
      type: 'highlight',
      content: {
        title: 'Dobra vijest',
        body: 'Populacija endemske viške gušterice je u porastu!',
        icon: 'check-circle',
        variant: 'success',
      } as HighlightBlockContent,
    },
    // 5. CardListBlock
    {
      id: 'block-cards-1',
      type: 'card_list',
      content: {
        cards: [
          {
            id: 'card-1',
            image_url: 'https://picsum.photos/400/200?random=2',
            title: 'Modra špilja',
            description: 'Prirodni fenomen na otoku Biševu',
            meta: '20 min brodom',
            link_type: 'page',
            link_target: 'blue-cave',
          },
          {
            id: 'card-2',
            image_url: 'https://picsum.photos/400/200?random=3',
            title: 'Stiniva plaža',
            description: 'Jedna od najljepših plaža na svijetu',
            meta: '45 min pješice',
            link_type: 'page',
            link_target: 'stiniva',
          },
          {
            id: 'card-3',
            image_url: null,
            title: 'Zelena špilja',
            description: 'Još jedna prirodna atrakcija',
            meta: '15 min brodom',
            link_type: null,
            link_target: null,
          },
        ],
      } as CardListBlockContent,
    },
    // 6. MediaBlock
    {
      id: 'block-media-1',
      type: 'media',
      content: {
        images: [
          'https://picsum.photos/800/400?random=4',
          'https://picsum.photos/800/400?random=5',
        ],
        caption: 'Pogled na viške uvale s vrha Hum',
      } as MediaBlockContent,
    },
    // 7. MapBlock
    {
      id: 'block-map-1',
      type: 'map',
      content: {
        pins: [
          {
            id: 'pin-1',
            latitude: 43.0622,
            longitude: 16.1833,
            title: 'Grad Vis',
            description: 'Glavni grad otoka',
          },
          {
            id: 'pin-2',
            latitude: 43.0447,
            longitude: 16.0914,
            title: 'Komiža',
            description: 'Ribarsko mjesto na zapadnoj obali',
          },
          {
            id: 'pin-3',
            latitude: 43.0167,
            longitude: 16.0833,
            title: 'Biševo',
            description: 'Otok s Modrom špiljom',
          },
        ],
      } as MapBlockContent,
    },
    // 8. ContactBlock
    {
      id: 'block-contact-1',
      type: 'contact',
      content: {
        contacts: [
          {
            id: 'contact-1',
            icon: 'phone',
            name: 'Turistička zajednica Vis',
            address: 'Šetalište Stare Isse 5, Vis',
            phones: ['+385 21 717 017', '+385 21 717 018'],
            email: 'info@tz-vis.hr',
            working_hours: 'Pon-Pet: 08:00-16:00',
            note: 'Zatvoreno vikendom izvan sezone',
          },
          {
            id: 'contact-2',
            icon: 'building',
            name: 'Park prirode Lastovo',
            address: null,
            phones: ['+385 20 801 252'],
            email: 'pp-lastovo@np-lastovo.hr',
            working_hours: null,
            note: null,
          },
        ],
      } as ContactBlockContent,
    },
    // 9. LinkListBlock
    {
      id: 'block-links-1',
      type: 'link_list',
      content: {
        links: [
          {
            id: 'link-1',
            title: 'Vozni redovi',
            link_type: 'page',
            link_target: 'TransportHub',
          },
          {
            id: 'link-2',
            title: 'Događaji na otoku',
            link_type: 'event',
            link_target: 'events',
          },
          {
            id: 'link-3',
            title: 'Službena stranica TZ',
            link_type: 'external',
            link_target: 'https://www.tz-vis.hr',
          },
        ],
      } as LinkListBlockContent,
    },
    // 10. NoticeBlock
    {
      id: 'block-notice-1',
      type: 'notice',
      content: {
        notices: [
          {
            id: 'notice-1',
            title: 'Trajektna linija 602 ne vozi zbog olujnog nevremena',
            is_urgent: true,
          },
          {
            id: 'notice-2',
            title: 'Produženo radno vrijeme TZ u sezoni',
            is_urgent: false,
          },
        ],
      } as NoticeBlockContent,
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
