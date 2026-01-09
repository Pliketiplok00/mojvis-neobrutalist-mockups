/**
 * Menu Extras Types
 *
 * Server-driven menu items that are appended after core menu items.
 * Extras link ONLY to static pages via StaticPage:<slug>.
 */

// ============================================================
// Database Entity
// ============================================================

export interface MenuExtra {
  id: string;
  label_hr: string;
  label_en: string;
  target: string;
  display_order: number;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// Validation
// ============================================================

/**
 * Regex for valid target format
 * Must be StaticPage:<slug> where slug is lowercase alphanumeric with hyphens
 */
export const TARGET_REGEX = /^StaticPage:[a-z0-9-]+$/;

/**
 * Label length constraints
 */
export const LABEL_MIN_LENGTH = 2;
export const LABEL_MAX_LENGTH = 60;

/**
 * Validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate menu extra input
 */
export function validateMenuExtraInput(input: MenuExtraCreateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // label_hr
  if (!input.label_hr || typeof input.label_hr !== 'string') {
    errors.push({ field: 'label_hr', message: 'label_hr is required' });
  } else if (input.label_hr.length < LABEL_MIN_LENGTH || input.label_hr.length > LABEL_MAX_LENGTH) {
    errors.push({ field: 'label_hr', message: `label_hr must be ${LABEL_MIN_LENGTH}-${LABEL_MAX_LENGTH} characters` });
  }

  // label_en
  if (!input.label_en || typeof input.label_en !== 'string') {
    errors.push({ field: 'label_en', message: 'label_en is required' });
  } else if (input.label_en.length < LABEL_MIN_LENGTH || input.label_en.length > LABEL_MAX_LENGTH) {
    errors.push({ field: 'label_en', message: `label_en must be ${LABEL_MIN_LENGTH}-${LABEL_MAX_LENGTH} characters` });
  }

  // target
  if (!input.target || typeof input.target !== 'string') {
    errors.push({ field: 'target', message: 'target is required' });
  } else if (!TARGET_REGEX.test(input.target)) {
    errors.push({ field: 'target', message: 'target must be in format StaticPage:<slug>' });
  }

  // display_order (optional, but must be integer if provided)
  if (input.display_order !== undefined) {
    if (typeof input.display_order !== 'number' || !Number.isInteger(input.display_order)) {
      errors.push({ field: 'display_order', message: 'display_order must be an integer' });
    }
  }

  return errors;
}

// ============================================================
// API Input Types
// ============================================================

export interface MenuExtraCreateInput {
  label_hr: string;
  label_en: string;
  target: string;
  display_order?: number;
  enabled?: boolean;
}

export interface MenuExtraUpdateInput {
  label_hr?: string;
  label_en?: string;
  target?: string;
  display_order?: number;
  enabled?: boolean;
}

// ============================================================
// API Response Types
// ============================================================

/**
 * Public response for menu extras (used by mobile)
 */
export interface MenuExtraPublic {
  id: string;
  labelHr: string;
  labelEn: string;
  target: string;
  order: number;
}

/**
 * Admin response for menu extras (includes all fields)
 */
export interface MenuExtraAdmin {
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
 * Public list response
 */
export interface MenuExtrasPublicResponse {
  extras: MenuExtraPublic[];
}

/**
 * Admin list response
 */
export interface MenuExtrasAdminResponse {
  extras: MenuExtraAdmin[];
  total: number;
}
