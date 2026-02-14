/**
 * Carrier Constants
 *
 * Sea transport carrier information and ticket URLs.
 * Used in LineDetailScreen for displaying carrier info.
 */

/**
 * Carrier ticket purchase URLs
 * Maps carrier name to their official ticket booking URL.
 */
export const CARRIER_TICKET_URLS: Record<string, string> = {
  Jadrolinija: 'https://shop.jadrolinija.hr/shop/index.php?what=booking',
  Krilo: 'https://krilo.aktiva-info.hr/',
};

/**
 * Sea line carrier info structure
 */
export interface SeaLineCarrier {
  name: string;
  ticketUrl: string | null; // null = boarding purchase only
}

/**
 * Sea line carrier mapping by line_number
 * Used when contacts array is empty to determine carrier info.
 */
export const SEA_LINE_CARRIERS: Record<string, SeaLineCarrier> = {
  '602': { name: 'Jadrolinija', ticketUrl: CARRIER_TICKET_URLS.Jadrolinija },
  '659': { name: 'Jadrolinija', ticketUrl: CARRIER_TICKET_URLS.Jadrolinija },
  '9602': { name: 'Krilo', ticketUrl: CARRIER_TICKET_URLS.Krilo },
  '612': { name: 'Nautički centar Komiža', ticketUrl: null },
};
