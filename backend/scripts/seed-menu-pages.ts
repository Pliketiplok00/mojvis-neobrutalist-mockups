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
    type: string;
    title_hr: string;
    title_en: string;
    subtitle_hr?: string;
    subtitle_en?: string;
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

  // Flora & Fauna landing page
  {
    slug: 'flora-fauna',
    header: {
      type: 'simple',
      title_hr: 'Flora i fauna',
      title_en: 'Flora & Fauna',
      subtitle_hr: 'Prirodne ljepote otoka Visa',
      subtitle_en: 'Natural beauties of the island of Vis',
    },
    blocks: [
      // Shared "Why special" card
      {
        id: 'flora-fauna-why-special',
        type: 'text',
        order: 0,
        content: {
          title_hr: 'Zašto su flora i fauna Viškog arhipelaga posebne',
          title_en: 'Why the flora and fauna of the Vis archipelago are special',
          body_hr: 'Viški arhipelag ima iznimno raznoliku mediteransku floru i faunu, oblikovanu izolacijom, čistim morem i netaknutim staništima. Na malom prostoru susreću se endemske vrste, rijetke ptice gnjezdarice, morski sisavci i preko 870 biljnih vrsta.\n\nMnoge vrste osjetljive su na uznemiravanje — promatrajte, fotografirajte, ali ne uznemiravajte i ne berite.',
          body_en: 'The Vis archipelago has exceptionally diverse Mediterranean flora and fauna, shaped by isolation, clean seas, and pristine habitats. Within a small area, endemic species, rare nesting birds, marine mammals, and over 870 plant species coexist.\n\nMany species are sensitive to disturbance — observe and photograph, but do not disturb or pick.',
        },
      },
      // Shared "Highlights" card
      {
        id: 'flora-fauna-highlights',
        type: 'highlight',
        order: 1,
        content: {
          variant: 'info',
          title_hr: 'Zanimljivosti',
          title_en: 'Highlights',
          body_hr: '• Više od 870 biljnih vrsta zabilježeno je na Visu\n• Biševo je utočište za ugroženu sredozemnu medvjedicu\n• Viški arhipelag jedno je od rijetkih gnjezdilišta Eleonorinog sokola\n• Endemske gušterice razvijale su se izolirano tisućama godina\n• Natura 2000 štiti brojne vrste ovog područja',
          body_en: '• Over 870 plant species recorded on Vis\n• Biševo is a refuge for the endangered Mediterranean monk seal\n• The Vis archipelago is one of the rare nesting sites for Eleonora\'s falcon\n• Endemic lizards evolved in isolation for thousands of years\n• Natura 2000 protects many species in this area',
        },
      },
      // Links to Flora and Fauna screens
      {
        id: 'flora-fauna-links-1',
        type: 'link_list',
        order: 2,
        content: {
          links: [
            {
              id: 'link-flora',
              title_hr: 'Flora',
              title_en: 'Flora',
              link_type: 'screen',
              link_target: 'Flora',
            },
            {
              id: 'link-fauna',
              title_hr: 'Fauna',
              title_en: 'Fauna',
              link_type: 'screen',
              link_target: 'Fauna',
            },
          ],
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
