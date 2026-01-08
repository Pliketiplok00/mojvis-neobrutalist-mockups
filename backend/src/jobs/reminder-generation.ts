/**
 * Reminder Generation Job
 *
 * Backend-only job that generates Inbox reminder messages.
 *
 * Rules (per spec):
 * - Runs at 00:01 Europe/Zagreb
 * - Generates Inbox messages for events happening THAT DAY
 * - Only for subscribed devices
 * - One reminder per event per device
 * - Reminder content is derived from Event (HR/EN)
 * - Mobile NEVER triggers reminder creation
 *
 * TODO: Schedule this job to run at 00:01 Europe/Zagreb daily.
 * Options to consider:
 * - node-cron: Schedule within the Node.js process
 * - External cron job calling an admin endpoint
 * - Cloud scheduler (Cloud Functions, AWS Lambda, etc.)
 *
 * For now, this module exports the job function to be called by
 * whatever scheduler is chosen.
 */

import { getSubscriptionsForDate } from '../repositories/event.js';
import { createInboxMessage } from '../repositories/inbox.js';
import type { InboxTag } from '../types/inbox.js';

/**
 * Generate reminder inbox messages for events starting today.
 *
 * This function should be called at 00:01 Europe/Zagreb.
 *
 * @param date - The date to generate reminders for (YYYY-MM-DD format)
 *               If not provided, uses today in Europe/Zagreb timezone.
 * @returns Number of reminders generated
 */
export async function generateReminders(date?: string): Promise<number> {
  // Get today's date in Europe/Zagreb timezone if not provided
  const targetDate = date ?? getTodayInZagreb();

  console.info(`[ReminderJob] Starting reminder generation for date: ${targetDate}`);

  try {
    // Get all subscriptions for events happening on this date
    const subscriptions = await getSubscriptionsForDate(targetDate);

    console.info(`[ReminderJob] Found ${subscriptions.length} subscriptions for ${targetDate}`);

    if (subscriptions.length === 0) {
      console.info('[ReminderJob] No subscriptions to process');
      return 0;
    }

    let generatedCount = 0;

    // Generate inbox message for each subscription
    for (const { device_id, event } of subscriptions) {
      try {
        // Format reminder content
        const titleHr = `Podsjetnik: ${event.title_hr}`;
        const titleEn = `Reminder: ${event.title_en}`;

        const timeStr = event.is_all_day
          ? 'Cijeli dan'
          : formatTime(event.start_datetime);
        const timeStrEn = event.is_all_day
          ? 'All day'
          : formatTime(event.start_datetime);

        let bodyHr = `Danas u ${timeStr}`;
        let bodyEn = `Today at ${timeStrEn}`;

        if (event.location_hr) {
          bodyHr += `\nLokacija: ${event.location_hr}`;
        }
        if (event.location_en) {
          bodyEn += `\nLocation: ${event.location_en}`;
        }

        if (event.description_hr) {
          bodyHr += `\n\n${event.description_hr}`;
        }
        if (event.description_en) {
          bodyEn += `\n\n${event.description_en}`;
        }

        // Create inbox message for this device
        // Using 'kultura' tag for event reminders
        const tags: InboxTag[] = ['kultura'];

        await createInboxMessage({
          title_hr: titleHr,
          title_en: titleEn,
          body_hr: bodyHr,
          body_en: bodyEn,
          tags,
          active_from: null, // Reminders don't need banner display
          active_to: null,
          created_by: `reminder:${event.id}`, // Track source
        });

        generatedCount++;

        console.info(`[ReminderJob] Generated reminder for device=${device_id} event=${event.id}`);
      } catch (error) {
        console.error(`[ReminderJob] Error generating reminder for device=${device_id} event=${event.id}:`, error);
        // Continue with other subscriptions
      }
    }

    console.info(`[ReminderJob] Completed. Generated ${generatedCount} reminders.`);
    return generatedCount;
  } catch (error) {
    console.error('[ReminderJob] Fatal error during reminder generation:', error);
    throw error;
  }
}

/**
 * Get today's date in Europe/Zagreb timezone (YYYY-MM-DD format)
 */
function getTodayInZagreb(): string {
  const now = new Date();
  const zagrebTime = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zagreb',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  return zagrebTime;
}

/**
 * Format time for display (HH:mm)
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('hr-HR', {
    timeZone: 'Europe/Zagreb',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
