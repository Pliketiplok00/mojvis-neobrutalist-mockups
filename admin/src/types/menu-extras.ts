/**
 * Menu Extras Types (Admin)
 *
 * Types for server-driven menu extras management.
 */

/**
 * Menu extra from API
 */
export interface MenuExtra {
  id: string;
  label_hr: string;
  label_en: string;
  target: string;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a menu extra
 */
export interface MenuExtraCreateInput {
  label_hr: string;
  label_en: string;
  target: string;
  display_order?: number;
  enabled?: boolean;
}

/**
 * Input for updating a menu extra
 */
export interface MenuExtraUpdateInput {
  label_hr?: string;
  label_en?: string;
  target?: string;
  display_order?: number;
  enabled?: boolean;
}

/**
 * List response from API
 */
export interface MenuExtrasListResponse {
  extras: MenuExtra[];
  total: number;
}

/**
 * Validation for target format
 */
export const TARGET_REGEX = /^StaticPage:[a-z0-9-]+$/;

/**
 * Label constraints
 */
export const LABEL_MIN_LENGTH = 2;
export const LABEL_MAX_LENGTH = 60;
