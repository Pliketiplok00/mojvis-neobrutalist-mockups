/**
 * Menu Extras Types (Mobile)
 *
 * Types for server-driven menu extras.
 */

/**
 * Menu extra item from API
 */
export interface MenuExtra {
  id: string;
  labelHr: string;
  labelEn: string;
  target: string;
  order: number;
}

/**
 * Response from GET /menu/extras
 */
export interface MenuExtrasResponse {
  extras: MenuExtra[];
}
