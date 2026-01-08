#!/usr/bin/env npx tsx
/**
 * Seed Development Data Script
 *
 * Inserts minimal fixtures for admin verification:
 * - 2 inbox messages (1 normal, 1 hitno with active window)
 * - 1 event
 * - 1 static page with text/highlight blocks
 * - 1 feedback entry
 * - 1 click-fix entry
 *
 * Usage: npx tsx scripts/seed-dev-data.ts
 */

import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'mojvis',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  console.log('='.repeat(60));
  console.log('Seeding Development Data');
  console.log('='.repeat(60));
  console.log();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Inbox Messages
    console.log('[1/5] Seeding inbox messages...');

    // Normal message
    const normalMsg = await client.query(`
      INSERT INTO inbox_messages (title_hr, title_en, body_hr, body_en, tags, active_from, active_to)
      VALUES (
        'Obavijest o radnom vremenu',
        'Working Hours Notice',
        'Upravni odjeli Grada Visa radit će skraćeno radno vrijeme tijekom blagdana.',
        'Municipal offices will have reduced working hours during holidays.',
        ARRAY['opcenito']::inbox_tag[],
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '7 days'
      )
      RETURNING id, title_hr
    `);
    console.log(`   Created normal inbox: ${normalMsg.rows[0].id} - ${normalMsg.rows[0].title_hr}`);

    // Hitno message (within active window - will trigger push if devices registered)
    const hitnoMsg = await client.query(`
      INSERT INTO inbox_messages (title_hr, title_en, body_hr, body_en, tags, active_from, active_to)
      VALUES (
        '[HITNO] Prekid opskrbe vodom',
        '[URGENT] Water Supply Interruption',
        'Zbog hitnih radova na vodovodnoj mreži, opskrba vodom bit će prekinuta danas od 14:00 do 18:00 sati u zoni Kut.',
        'Due to urgent repairs on the water supply network, water will be interrupted today from 2 PM to 6 PM in the Kut area.',
        ARRAY['hitno', 'vis']::inbox_tag[],
        NOW() - INTERVAL '1 hour',
        NOW() + INTERVAL '4 hours'
      )
      RETURNING id, title_hr
    `);
    console.log(`   Created hitno inbox: ${hitnoMsg.rows[0].id} - ${hitnoMsg.rows[0].title_hr}`);

    // 2. Event
    console.log('[2/5] Seeding event...');
    const event = await client.query(`
      INSERT INTO events (
        title_hr, title_en, description_hr, description_en,
        location_hr, location_en, start_datetime, end_datetime, is_all_day
      )
      VALUES (
        'Ljetni karneval Visa',
        'Vis Summer Carnival',
        'Tradicionalni ljetni karneval s maskama, glazbom i plesom kroz ulice grada.',
        'Traditional summer carnival with masks, music, and dancing through the streets.',
        'Gradske ulice, Vis',
        'City streets, Vis',
        NOW() + INTERVAL '14 days',
        NOW() + INTERVAL '14 days' + INTERVAL '6 hours',
        false
      )
      RETURNING id, title_hr
    `);
    console.log(`   Created event: ${event.rows[0].id} - ${event.rows[0].title_hr}`);

    // 3. Static Page
    console.log('[3/5] Seeding static page...');
    const draftHeader = {
      type: 'header',
      title_hr: 'O aplikaciji MOJ VIS',
      title_en: 'About MOJ VIS App',
      subtitle_hr: 'Službena aplikacija Grada Visa i Općine Komiža',
      subtitle_en: 'Official app of the City of Vis and Municipality of Komiža'
    };
    const draftBlocks = [
      {
        id: 'block-1',
        type: 'text',
        order: 0,
        content: {
          text_hr: 'MOJ VIS je službena mobilna aplikacija Grada Visa i Općine Komiža. Aplikacija vam omogućuje praćenje vijesti, događanja i važnih obavijesti.',
          text_en: 'MOJ VIS is the official mobile app of the City of Vis and Municipality of Komiža. The app allows you to follow news, events, and important announcements.'
        }
      },
      {
        id: 'block-2',
        type: 'highlight',
        order: 1,
        content: {
          variant: 'info',
          text_hr: 'Za pitanja i prijedloge, kontaktirajte nas putem forme za povratne informacije.',
          text_en: 'For questions and suggestions, contact us via the feedback form.'
        }
      }
    ];
    const page = await client.query(`
      INSERT INTO static_pages (slug, draft_header, draft_blocks, published_header, published_blocks, published_at, published_by)
      VALUES (
        'o-aplikaciji',
        $1,
        $2,
        $1,
        $2,
        NOW(),
        'seed-admin'
      )
      RETURNING id, slug
    `, [JSON.stringify(draftHeader), JSON.stringify(draftBlocks)]);
    console.log(`   Created page: ${page.rows[0].id} - ${page.rows[0].slug}`);

    // 4. Feedback
    console.log('[4/5] Seeding feedback...');
    const feedback = await client.query(`
      INSERT INTO feedback (device_id, user_mode, municipality, language, subject, body, status)
      VALUES (
        'seed-device-001',
        'local',
        'vis',
        'hr',
        'Pohvala za aplikaciju',
        'Odlična aplikacija! Vrlo korisne informacije o događanjima na otoku. Hvala vam na trudu!',
        'zaprimljeno'
      )
      RETURNING id, subject
    `);
    console.log(`   Created feedback: ${feedback.rows[0].id} - ${feedback.rows[0].subject}`);

    // 5. Click & Fix
    console.log('[5/5] Seeding click & fix...');
    const clickFix = await client.query(`
      INSERT INTO click_fix (device_id, user_mode, municipality, language, subject, description, location_lat, location_lng, status)
      VALUES (
        'seed-device-002',
        'local',
        'vis',
        'hr',
        'Javna rasvjeta ne radi',
        'Javna rasvjeta ne radi na križanju ulica Ante Starčevića i Splitska. Molim hitnu intervenciju.',
        43.0622,
        16.1836,
        'zaprimljeno'
      )
      RETURNING id, subject
    `);
    console.log(`   Created click-fix: ${clickFix.rows[0].id} - ${clickFix.rows[0].subject}`);

    await client.query('COMMIT');

    console.log();
    console.log('='.repeat(60));
    console.log('Seeding complete!');
    console.log('='.repeat(60));
    console.log();
    console.log('Created:');
    console.log(`  - 2 inbox messages`);
    console.log(`    - Normal: ${normalMsg.rows[0].id}`);
    console.log(`    - Hitno:  ${hitnoMsg.rows[0].id}`);
    console.log(`  - 1 event: ${event.rows[0].id}`);
    console.log(`  - 1 static page: ${page.rows[0].id} (slug: ${page.rows[0].slug})`);
    console.log(`  - 1 feedback: ${feedback.rows[0].id}`);
    console.log(`  - 1 click-fix: ${clickFix.rows[0].id}`);
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
