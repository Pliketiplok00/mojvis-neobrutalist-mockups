/**
 * Inbox Utilities
 *
 * Error handling and formatting utilities for InboxEditPage.
 * Extracted from InboxEditPage.tsx for maintainability.
 */

/**
 * Backend error code to Croatian message mapping
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Inbox errors
  MESSAGE_LOCKED: 'Ova poruka je zaključana jer je poslana push obavijest. Nije moguće uređivati.',
  ALREADY_PUBLISHED: 'Poruka je već objavljena.',
  MESSAGE_DELETED: 'Poruka je obrisana.',
  NOT_ARCHIVED: 'Poruka nije arhivirana.',
  TAGS_EMPTY: 'Odaberite barem jednu oznaku.',
  TAGS_MAX_EXCEEDED: 'Maksimalno 2 oznake su dozvoljene.',
  HITNO_MISSING_CONTEXT: 'Hitno poruke moraju imati jednu kontekst oznaku.',
  HITNO_MISSING_DATES: 'Hitno poruke moraju imati definirani aktivni period.',
  // Auth errors
  UNAUTHENTICATED: 'Niste prijavljeni. Prijavite se ponovo.',
  SESSION_INVALID: 'Sesija je istekla. Prijavite se ponovo.',
  // Translation errors
  TRANSLATION_NOT_CONFIGURED: 'Usluga prijevoda nije dostupna.',
  TRANSLATION_FAILED: 'Prijevod nije uspio. Pokušajte ponovo.',
};

/**
 * Parse error response and return Croatian message
 */
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Dogodila se neočekivana greška.';
  }

  const message = error.message;

  // Check for known error codes in the message
  for (const [code, croatianMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) {
      return croatianMessage;
    }
  }

  // Check for HTTP status codes
  if (message.includes('409')) {
    return 'Konflikt: poruka je već objavljena ili zaključana.';
  }
  if (message.includes('403')) {
    return 'Nemate ovlasti za ovu radnju.';
  }
  if (message.includes('404')) {
    return 'Poruka nije pronađena.';
  }

  return 'Greška pri spremanju. Pokušajte ponovo.';
}

/**
 * Format ISO date string for datetime-local input
 */
export function formatDateTimeLocal(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
