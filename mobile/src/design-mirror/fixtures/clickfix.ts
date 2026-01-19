/**
 * Click & Fix Fixtures (Design Mirror)
 *
 * Static data for Click & Fix mirror screens.
 * Includes form state, confirmation, and detail fixtures.
 *
 * Key differences from Feedback:
 * - Location (lat/lng) is required
 * - Photos array (0-3 images)
 * - Description field instead of body
 */

import type {
  ClickFixStatus,
  ClickFixDetailResponse,
  ClickFixReplyResponse,
  ClickFixPhotoResponse,
  Location,
} from '../../types/click-fix';

// ============================================================
// Form Fixtures
// ============================================================

/**
 * Validation limits (same as production)
 */
export const VALIDATION_LIMITS = {
  SUBJECT_MAX_LENGTH: 120,
  DESCRIPTION_MAX_LENGTH: 4000,
  MAX_PHOTOS: 3,
} as const;

/**
 * Form fixture interface
 */
export interface ClickFixFormFixture {
  subject: string;
  description: string;
  subjectPlaceholder: string;
  descriptionPlaceholder: string;
  subjectLabel: string;
  descriptionLabel: string;
  locationLabel: string;
  photosLabel: string;
  submitLabel: string;
  title: string;
  location: Location | null;
  photos: { uri: string; fileName: string }[];
  error?: string;
  fieldErrors?: {
    subject?: string;
    description?: string;
    location?: string;
  };
  isSubmitting: boolean;
  isGettingLocation: boolean;
}

/**
 * Empty form fixture
 */
export const clickFixFormEmptyFixture: ClickFixFormFixture = {
  subject: '',
  description: '',
  subjectPlaceholder: 'Unesite naslov prijave',
  descriptionPlaceholder: 'Opišite problem detaljno...',
  subjectLabel: 'Naslov',
  descriptionLabel: 'Opis',
  locationLabel: 'Lokacija',
  photosLabel: 'Fotografije',
  submitLabel: 'Pošalji',
  title: 'Prijavi problem',
  location: null,
  photos: [],
  isSubmitting: false,
  isGettingLocation: false,
};

/**
 * Filled form fixture (with location and photos)
 */
export const clickFixFormFilledFixture: ClickFixFormFixture = {
  subject: 'Oštećena cesta na putu prema Komiži',
  description: 'Na glavnoj cesti od Visa prema Komiži, otprilike 2 km nakon tunela, nalazi se velika rupa na kolniku. Rupa je duboka oko 15 cm i predstavlja opasnost za vozila, posebno motocikle i bicikle.\n\nMolim hitnu sanaciju.',
  subjectPlaceholder: 'Unesite naslov prijave',
  descriptionPlaceholder: 'Opišite problem detaljno...',
  subjectLabel: 'Naslov',
  descriptionLabel: 'Opis',
  locationLabel: 'Lokacija',
  photosLabel: 'Fotografije',
  submitLabel: 'Pošalji',
  title: 'Prijavi problem',
  location: {
    lat: 43.061389,
    lng: 16.183611,
  },
  photos: [
    { uri: 'file:///mock/photo1.jpg', fileName: 'rupa-cesta-1.jpg' },
    { uri: 'file:///mock/photo2.jpg', fileName: 'rupa-cesta-2.jpg' },
  ],
  isSubmitting: false,
  isGettingLocation: false,
};

/**
 * Form with validation errors fixture
 */
export const clickFixFormErrorFixture: ClickFixFormFixture = {
  subject: '',
  description: 'Kratki opis.',
  subjectPlaceholder: 'Unesite naslov prijave',
  descriptionPlaceholder: 'Opišite problem detaljno...',
  subjectLabel: 'Naslov',
  descriptionLabel: 'Opis',
  locationLabel: 'Lokacija',
  photosLabel: 'Fotografije',
  submitLabel: 'Pošalji',
  title: 'Prijavi problem',
  location: null,
  photos: [],
  fieldErrors: {
    subject: 'Naslov je obavezan',
    location: 'Lokacija je obavezna',
  },
  isSubmitting: false,
  isGettingLocation: false,
};

// ============================================================
// Confirmation Fixtures
// ============================================================

/**
 * Confirmation fixture interface
 */
export interface ClickFixConfirmationFixture {
  clickFixId: string;
  title: string;
  message: string;
  primaryButtonLabel: string;
  secondaryButtonLabel: string;
}

/**
 * Confirmation screen fixture
 */
export const clickFixConfirmationFixture: ClickFixConfirmationFixture = {
  clickFixId: 'clickfix-456-xyz',
  title: 'Prijava poslana',
  message: 'Vaša prijava problema je uspješno poslana. Pratite status putem obavijesti.',
  primaryButtonLabel: 'Pogledaj prijavu',
  secondaryButtonLabel: 'Natrag',
};

// ============================================================
// Detail Fixtures
// ============================================================

/**
 * Status display mapping
 */
export const STATUS_DISPLAY: Record<ClickFixStatus, { label: string }> = {
  zaprimljeno: { label: 'Zaprimljeno' },
  u_razmatranju: { label: 'U razmatranju' },
  prihvaceno: { label: 'Prihvaćeno' },
  odbijeno: { label: 'Odbijeno' },
};

/**
 * Sample photos for detail fixtures
 */
const samplePhotos: ClickFixPhotoResponse[] = [
  {
    id: 'photo-1',
    url: '/uploads/clickfix/photo-1.jpg',
    file_name: 'rupa-cesta-1.jpg',
    mime_type: 'image/jpeg',
    file_size: 245000,
    display_order: 0,
  },
  {
    id: 'photo-2',
    url: '/uploads/clickfix/photo-2.jpg',
    file_name: 'rupa-cesta-2.jpg',
    mime_type: 'image/jpeg',
    file_size: 312000,
    display_order: 1,
  },
];

/**
 * Sample replies for detail fixture
 */
const sampleReplies: ClickFixReplyResponse[] = [
  {
    id: 'reply-1',
    body: 'Poštovani,\n\nHvala na prijavi. Našim djelatnicima je upućen nalog za pregled lokacije. Očekujemo sanaciju u roku od 7 radnih dana.\n\nS poštovanjem,\nKomunalno poduzeće Vis',
    created_at: '2026-01-18T14:30:00Z',
  },
];

/**
 * Detail fixture - received status, no replies
 */
export const clickFixDetailReceivedFixture: ClickFixDetailResponse = {
  id: 'clickfix-001',
  subject: 'Oštećena cesta na putu prema Komiži',
  description: 'Na glavnoj cesti od Visa prema Komiži, otprilike 2 km nakon tunela, nalazi se velika rupa na kolniku. Rupa je duboka oko 15 cm i predstavlja opasnost za vozila, posebno motocikle i bicikle.\n\nMolim hitnu sanaciju.',
  location: {
    lat: 43.061389,
    lng: 16.183611,
  },
  status: 'zaprimljeno',
  status_label: 'Zaprimljeno',
  language: 'hr',
  created_at: '2026-01-17T10:15:00Z',
  updated_at: '2026-01-17T10:15:00Z',
  photos: samplePhotos,
  replies: [],
};

/**
 * Detail fixture - in review status, with reply
 */
export const clickFixDetailInReviewFixture: ClickFixDetailResponse = {
  id: 'clickfix-002',
  subject: 'Oštećena cesta na putu prema Komiži',
  description: 'Na glavnoj cesti od Visa prema Komiži, otprilike 2 km nakon tunela, nalazi se velika rupa na kolniku. Rupa je duboka oko 15 cm i predstavlja opasnost za vozila, posebno motocikle i bicikle.\n\nMolim hitnu sanaciju.',
  location: {
    lat: 43.061389,
    lng: 16.183611,
  },
  status: 'u_razmatranju',
  status_label: 'U razmatranju',
  language: 'hr',
  created_at: '2026-01-17T10:15:00Z',
  updated_at: '2026-01-18T14:30:00Z',
  photos: samplePhotos,
  replies: sampleReplies,
};

/**
 * Detail fixture - accepted status
 */
export const clickFixDetailAcceptedFixture: ClickFixDetailResponse = {
  id: 'clickfix-003',
  subject: 'Neispravna javna rasvjeta',
  description: 'Ulična lampa na adresi Obala sv. Jurja 15 ne radi već dva tjedna. Ulica je potpuno mračna noću.',
  location: {
    lat: 43.062500,
    lng: 16.188889,
  },
  status: 'prihvaceno',
  status_label: 'Prihvaćeno',
  language: 'hr',
  created_at: '2026-01-10T09:00:00Z',
  updated_at: '2026-01-15T11:00:00Z',
  photos: [],
  replies: [
    {
      id: 'reply-accepted-1',
      body: 'Poštovani,\n\nKvar je saniran. Lampa je ponovno u funkciji.\n\nHvala na prijavi.',
      created_at: '2026-01-15T11:00:00Z',
    },
  ],
};

/**
 * Default detail fixture (exported as main)
 */
export const clickFixDetailFixture = clickFixDetailInReviewFixture;

/**
 * Section labels for detail screen
 */
export const clickFixDetailLabels = {
  repliesTitle: 'Odgovori',
  noReplies: 'Još nema odgovora na vašu prijavu.',
  replyLabel: 'Odgovor',
  photosTitle: 'Fotografije',
  locationTitle: 'Lokacija',
};
