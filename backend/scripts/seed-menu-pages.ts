#!/usr/bin/env npx tsx
/**
 * Seed Menu Static Pages
 *
 * Creates static pages required by main menu:
 * - timetables (links to TransportHub)
 * - flora-fauna (links to flora and fauna pages)
 * - flora (child page)
 * - fauna (child page)
 * - visitor-info
 * - important-contacts
 *
 * Usage: npx tsx scripts/seed-menu-pages.ts
 */

import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'mojvis',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

interface PageData {
  slug: string;
  header: {
    type: 'simple' | 'media';
    title_hr: string;
    title_en: string;
    subtitle_hr?: string;
    subtitle_en?: string;
    icon?: string;
    images?: string[];
  };
  blocks: Array<{
    id: string;
    type: string;
    order: number;
    content: Record<string, unknown>;
  }>;
}

const MENU_PAGES: PageData[] = [
  // Timetables landing page
  {
    slug: 'timetables',
    header: {
      type: 'simple',
      title_hr: 'Vozni redovi',
      title_en: 'Timetables',
      subtitle_hr: 'Autobusne i trajektne linije',
      subtitle_en: 'Bus and ferry lines',
    },
    blocks: [
      {
        id: 'timetables-text-1',
        type: 'text',
        order: 0,
        content: {
          title_hr: null,
          title_en: null,
          body_hr: 'Pregledajte vozne redove autobusnih i trajektnih linija prema i od otoka Visa.',
          body_en: 'View bus and ferry timetables to and from the island of Vis.',
        },
      },
      {
        id: 'timetables-links-1',
        type: 'link_list',
        order: 1,
        content: {
          links: [
            {
              id: 'link-transport-hub',
              title_hr: 'Svi vozni redovi',
              title_en: 'All timetables',
              link_type: 'screen',
              link_target: 'TransportHub',
            },
          ],
        },
      },
    ],
  },

  // Flora & Fauna HUB (archipelago landing page)
  {
    slug: 'flora-fauna',
    header: {
      type: 'media',
      title_hr: 'Flora i fauna',
      title_en: 'Flora & Fauna',
      subtitle_hr: 'Viški arhipelag',
      subtitle_en: 'Vis Archipelago',
      images: [
        // Panoramic view of Biševo island next to Vis island - archipelago overview
        'https://upload.wikimedia.org/wikipedia/commons/f/fa/Panoramic_view_of_Bisevo_island_next_to_Vis_island_in_Croatia_%2848608613336%29.jpg',
      ],
    },
    blocks: [
      // 0) INTRO TEXT BLOCK
      {
        id: 'flora-fauna-intro',
        type: 'text',
        order: 0,
        content: {
          title_hr: 'Zašto je flora i fauna viškog arhipelaga posebna?',
          title_en: 'Why is the flora and fauna of the Vis archipelago special?',
          body_hr: 'Viški arhipelag čini mozaik otoka, otočića, hridi i podmorja koji su desetljećima ostali izvan intenzivnog ljudskog utjecaja. Upravo ta kombinacija izolacije, čistog mora i raznolikih staništa — od strmih morskih litica i špilja do suhozida, makije i otvorenog mora — stvorila je iznimno bogat i osjetljiv prirodni sustav.\n\nNa relativno malom prostoru susreću se rijetke i endemske biljne vrste, ptice gnijezdarice, morski sisavci i brojni podmorski organizmi. Mnoge od tih vrsta ovise o miru, stabilnosti i očuvanom okolišu — zato su promatranje, poštovanje i nenarušavanje ključni za njihovo očuvanje.',
          body_en: 'The Vis archipelago is a mosaic of islands, islets, reefs and surrounding seas that remained largely untouched by intensive human activity for decades. This unique combination of isolation, clean waters and diverse habitats — from steep sea cliffs and caves to dry stone landscapes, maquis and open sea — has shaped an exceptionally rich and fragile natural system.\n\nWithin a relatively small area, rare and endemic plant species, nesting seabirds, marine mammals and diverse underwater life coexist. Many of these species depend on calm, stability and intact habitats — which is why observation, respect and non-disturbance are essential for their survival.',
        },
      },
      // 1) FLORA & FAUNA TILES (card_list, side-by-side)
      {
        id: 'flora-fauna-tiles',
        type: 'card_list',
        order: 1,
        content: {
          cards: [
            {
              id: 'tile-flora',
              image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Centaurea_ragusina_1.jpg',
              title_hr: 'Flora',
              title_en: 'Flora',
              description_hr: 'Biljni svijet viškog arhipelaga',
              description_en: 'Plant life of the Vis archipelago',
              meta_hr: null,
              meta_en: null,
              link_type: 'screen',
              link_target: 'Flora',
            },
            {
              id: 'tile-fauna',
              image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Tursiops_truncatus_01.jpg',
              title_hr: 'Fauna',
              title_en: 'Fauna',
              description_hr: 'Životinjski svijet viškog arhipelaga',
              description_en: 'Animal life of the Vis archipelago',
              meta_hr: null,
              meta_en: null,
              link_type: 'screen',
              link_target: 'Fauna',
            },
          ],
        },
      },
      // 2) HIGHLIGHTS BLOCK (bullet list)
      {
        id: 'flora-fauna-highlights',
        type: 'highlight',
        order: 2,
        content: {
          variant: 'info',
          title_hr: 'Zanimljivosti',
          title_en: 'Highlights',
          body_hr: '• Viški arhipelag dio je europske ekološke mreže Natura 2000, koja štiti najvrjednija prirodna staništa.\n• Otočići poput Biševa, Brusnika i Jabuke ključna su područja za gniježđenje ptica i život rijetkih morskih vrsta.\n• Podmorje arhipelaga dom je dupina, morskih kornjača i brojnih osjetljivih zajednica.\n• Mnoge biljne vrste prilagođene su surovim uvjetima — vjetru, suši i slanom aerosolu.\n• Tišina i slab svjetlosni utjecaj noću čine arhipelag važnim za noćne životinje i orijentaciju ptica.',
          body_en: '• The Vis archipelago is part of the Natura 2000 network, protecting Europe\'s most valuable natural habitats.\n• Islets such as Biševo, Brusnik and Jabuka are key areas for seabird nesting and rare marine species.\n• The surrounding sea is home to dolphins, sea turtles and sensitive underwater ecosystems.\n• Many plant species are adapted to harsh conditions — wind, drought and salt spray.\n• Low light pollution and relative silence make the archipelago important for nocturnal wildlife and bird navigation.',
        },
      },
    ],
  },

  // Flora child page
  {
    slug: 'flora',
    header: {
      type: 'simple',
      title_hr: 'Flora',
      title_en: 'Flora',
      subtitle_hr: 'Biljni svijet otoka Visa',
      subtitle_en: 'Plant life of the island of Vis',
    },
    blocks: [
      {
        id: 'flora-text-1',
        type: 'text',
        order: 0,
        content: {
          title_hr: 'Mediteransko bilje',
          title_en: 'Mediterranean plants',
          body_hr: 'Otok Vis obiluje mediteranskim biljem uključujući masline, smokve, lavandu i ružmarin. Autohtone vrste čine posebnu prirodnu baštinu otoka.',
          body_en: 'The island of Vis abounds in Mediterranean plants including olives, figs, lavender, and rosemary. Indigenous species constitute the special natural heritage of the island.',
        },
      },
    ],
  },

  // Fauna child page
  {
    slug: 'fauna',
    header: {
      type: 'simple',
      title_hr: 'Fauna',
      title_en: 'Fauna',
      subtitle_hr: 'Životinjski svijet otoka Visa',
      subtitle_en: 'Animal life of the island of Vis',
    },
    blocks: [
      {
        id: 'fauna-text-1',
        type: 'text',
        order: 0,
        content: {
          title_hr: 'Morski i kopneni život',
          title_en: 'Marine and terrestrial life',
          body_hr: 'Vode oko Visa dom su raznolikim morskim vrstama uključujući dupine, kornjače i brojne vrste riba. Na kopnu obitavaju gušteri, ptice i druge životinje.',
          body_en: 'The waters around Vis are home to diverse marine species including dolphins, turtles, and numerous fish species. On land, lizards, birds, and other animals live.',
        },
      },
    ],
  },

  // Visitor info page
  {
    slug: 'visitor-info',
    header: {
      type: 'simple',
      title_hr: 'Info za posjetitelje',
      title_en: 'Visitor info',
      subtitle_hr: 'Korisne informacije za posjetitelje otoka',
      subtitle_en: 'Useful information for island visitors',
    },
    blocks: [
      {
        id: 'visitor-text-1',
        type: 'text',
        order: 0,
        content: {
          title_hr: 'Dobrodošli na Vis',
          title_en: 'Welcome to Vis',
          body_hr: 'Vis je najudaljeniji nastanjeni hrvatski otok, poznat po netaknutoj prirodi, kristalno čistom moru i bogatoj povijesti. Ovdje ćete pronaći korisne informacije za vaš boravak.',
          body_en: 'Vis is the most remote inhabited Croatian island, known for its pristine nature, crystal clear sea, and rich history. Here you will find useful information for your stay.',
        },
      },
      {
        id: 'visitor-highlight-1',
        type: 'highlight',
        order: 1,
        content: {
          variant: 'info',
          title_hr: 'Turistička sezona',
          title_en: 'Tourist season',
          body_hr: 'Glavna turistička sezona traje od lipnja do rujna. Preporučujemo rezervaciju smještaja unaprijed.',
          body_en: 'The main tourist season lasts from June to September. We recommend booking accommodation in advance.',
        },
      },
    ],
  },

  // Important contacts page
  {
    slug: 'important-contacts',
    header: {
      type: 'simple',
      title_hr: 'Važni kontakti',
      title_en: 'Important contacts',
      subtitle_hr: 'Hitne službe i korisni brojevi',
      subtitle_en: 'Emergency services and useful numbers',
    },
    blocks: [
      {
        id: 'contacts-text-1',
        type: 'text',
        order: 0,
        content: {
          title_hr: null,
          title_en: null,
          body_hr: 'Ovdje su navedeni važni kontakti za hitne slučajeve i svakodnevne potrebe na otoku Visu.',
          body_en: 'Listed here are important contacts for emergencies and everyday needs on the island of Vis.',
        },
      },
      {
        id: 'contacts-contact-1',
        type: 'contact',
        order: 1,
        content: {
          contacts: [
            {
              id: 'contact-emergency',
              icon: '🚨',
              name_hr: 'Hitna pomoć',
              name_en: 'Emergency',
              address_hr: null,
              address_en: null,
              phones: ['112'],
              email: null,
              working_hours_hr: '0-24',
              working_hours_en: '24/7',
              note_hr: 'Europski broj za hitne slučajeve',
              note_en: 'European emergency number',
            },
            {
              id: 'contact-police',
              icon: '👮',
              name_hr: 'Policija Vis',
              name_en: 'Police Vis',
              address_hr: 'Obala Sv. Jurja 36, 21480 Vis',
              address_en: 'Obala Sv. Jurja 36, 21480 Vis',
              phones: ['021 711 111'],
              email: null,
              working_hours_hr: '0-24',
              working_hours_en: '24/7',
              note_hr: null,
              note_en: null,
            },
            {
              id: 'contact-health',
              icon: '🏥',
              name_hr: 'Dom zdravlja Vis',
              name_en: 'Health Center Vis',
              address_hr: 'Šetalište stare Isse 7, 21480 Vis',
              address_en: 'Šetalište stare Isse 7, 21480 Vis',
              phones: ['021 711 247'],
              email: null,
              working_hours_hr: 'Pon-Pet 7:00-15:00',
              working_hours_en: 'Mon-Fri 7:00-15:00',
              note_hr: null,
              note_en: null,
            },
            {
              id: 'contact-tourist',
              icon: 'ℹ️',
              name_hr: 'Turistička zajednica Vis',
              name_en: 'Vis Tourist Board',
              address_hr: 'Šetalište stare Isse 5, 21480 Vis',
              address_en: 'Šetalište stare Isse 5, 21480 Vis',
              phones: ['021 717 017'],
              email: 'info@tz-vis.hr',
              working_hours_hr: 'Pon-Pet 8:00-16:00, Sub 9:00-13:00',
              working_hours_en: 'Mon-Fri 8:00-16:00, Sat 9:00-13:00',
              note_hr: null,
              note_en: null,
            },
          ],
        },
      },
    ],
  },
];

async function seed() {
  console.log('='.repeat(60));
  console.log('Seeding Menu Static Pages');
  console.log('='.repeat(60));
  console.log();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const pageData of MENU_PAGES) {
      console.log(`[+] Creating page: ${pageData.slug}`);

      // Check if page exists
      const existing = await client.query(
        'SELECT id FROM static_pages WHERE slug = $1',
        [pageData.slug]
      );

      if (existing.rows.length > 0) {
        // Update existing page
        await client.query(
          `UPDATE static_pages
           SET draft_header = $2, draft_blocks = $3,
               published_header = $2, published_blocks = $3,
               published_at = NOW(), published_by = 'seed-menu'
           WHERE slug = $1`,
          [pageData.slug, JSON.stringify(pageData.header), JSON.stringify(pageData.blocks)]
        );
        console.log(`    Updated existing page: ${pageData.slug}`);
      } else {
        // Insert new page
        await client.query(
          `INSERT INTO static_pages (slug, draft_header, draft_blocks, published_header, published_blocks, published_at, published_by)
           VALUES ($1, $2, $3, $2, $3, NOW(), 'seed-menu')`,
          [pageData.slug, JSON.stringify(pageData.header), JSON.stringify(pageData.blocks)]
        );
        console.log(`    Created new page: ${pageData.slug}`);
      }
    }

    await client.query('COMMIT');

    console.log();
    console.log('='.repeat(60));
    console.log('Menu pages seeding complete!');
    console.log('='.repeat(60));
    console.log();
    console.log('Created/updated pages:');
    for (const page of MENU_PAGES) {
      console.log(`  - ${page.slug}: ${page.header.title_hr} / ${page.header.title_en}`);
    }
    console.log();

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
