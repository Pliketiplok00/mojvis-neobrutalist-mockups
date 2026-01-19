/**
 * Feedback Fixtures (Design Mirror)
 *
 * Static data for Feedback mirror screens.
 * Includes form state, confirmation, and detail fixtures.
 */

import type {
  FeedbackStatus,
  FeedbackDetailResponse,
  FeedbackReplyResponse,
} from '../../types/feedback';

// ============================================================
// Form Fixtures
// ============================================================

/**
 * Validation limits (same as production)
 */
export const VALIDATION_LIMITS = {
  SUBJECT_MAX_LENGTH: 120,
  BODY_MAX_LENGTH: 4000,
} as const;

/**
 * Form fixture - empty state
 */
export interface FeedbackFormFixture {
  subject: string;
  body: string;
  subjectPlaceholder: string;
  bodyPlaceholder: string;
  subjectLabel: string;
  bodyLabel: string;
  submitLabel: string;
  title: string;
  error?: string;
  fieldErrors?: {
    subject?: string;
    body?: string;
  };
  isSubmitting: boolean;
}

/**
 * Empty form fixture
 */
export const feedbackFormEmptyFixture: FeedbackFormFixture = {
  subject: '',
  body: '',
  subjectPlaceholder: 'Unesite temu prijedloga',
  bodyPlaceholder: 'Opišite svoj prijedlog...',
  subjectLabel: 'Tema',
  bodyLabel: 'Poruka',
  submitLabel: 'Pošalji',
  title: 'Pošalji prijedlog',
  isSubmitting: false,
};

/**
 * Filled form fixture
 */
export const feedbackFormFilledFixture: FeedbackFormFixture = {
  subject: 'Prijedlog za poboljšanje autobusne linije',
  body: 'Poštovani,\n\nŽelio bih predložiti dodatnu autobusnu liniju koja bi povezivala centar Visa s plažom Stiniva tijekom ljetnih mjeseci. Trenutno je potrebno hodati 45 minuta do plaže, što je teško za starije osobe i obitelji s djecom.\n\nHvala na razmatranju.',
  subjectPlaceholder: 'Unesite temu prijedloga',
  bodyPlaceholder: 'Opišite svoj prijedlog...',
  subjectLabel: 'Tema',
  bodyLabel: 'Poruka',
  submitLabel: 'Pošalji',
  title: 'Pošalji prijedlog',
  isSubmitting: false,
};

/**
 * Form with validation errors fixture
 */
export const feedbackFormErrorFixture: FeedbackFormFixture = {
  subject: '',
  body: 'Kratka poruka.',
  subjectPlaceholder: 'Unesite temu prijedloga',
  bodyPlaceholder: 'Opišite svoj prijedlog...',
  subjectLabel: 'Tema',
  bodyLabel: 'Poruka',
  submitLabel: 'Pošalji',
  title: 'Pošalji prijedlog',
  fieldErrors: {
    subject: 'Tema je obavezna',
  },
  isSubmitting: false,
};

// ============================================================
// Confirmation Fixtures
// ============================================================

/**
 * Confirmation fixture
 */
export interface FeedbackConfirmationFixture {
  feedbackId: string;
  title: string;
  message: string;
  primaryButtonLabel: string;
  secondaryButtonLabel: string;
}

/**
 * Confirmation screen fixture
 */
export const feedbackConfirmationFixture: FeedbackConfirmationFixture = {
  feedbackId: 'feedback-123-abc',
  title: 'Prijedlog poslan',
  message: 'Vaš prijedlog je uspješno poslan. Odgovor ćete primiti putem obavijesti.',
  primaryButtonLabel: 'Pogledaj prijedlog',
  secondaryButtonLabel: 'Natrag',
};

// ============================================================
// Detail Fixtures
// ============================================================

/**
 * Status color mapping (mirrors STATUS_COLORS from ui/utils/statusColors.ts)
 * Using existing skin token references
 */
export const STATUS_DISPLAY: Record<FeedbackStatus, { label: string }> = {
  zaprimljeno: { label: 'Zaprimljeno' },
  u_razmatranju: { label: 'U razmatranju' },
  prihvaceno: { label: 'Prihvaćeno' },
  odbijeno: { label: 'Odbijeno' },
};

/**
 * Sample replies for detail fixture
 */
const sampleReplies: FeedbackReplyResponse[] = [
  {
    id: 'reply-1',
    body: 'Poštovani,\n\nHvala na Vašem prijedlogu. Proslijedili smo ga nadležnom odjelu koji će razmotriti mogućnost uvođenja dodatne autobusne linije.\n\nS poštovanjem,\nTuristička zajednica Vis',
    created_at: '2026-01-18T14:30:00Z',
  },
];

/**
 * Detail fixture - received status, no replies
 */
export const feedbackDetailReceivedFixture: FeedbackDetailResponse = {
  id: 'feedback-001',
  subject: 'Prijedlog za poboljšanje autobusne linije',
  body: 'Poštovani,\n\nŽelio bih predložiti dodatnu autobusnu liniju koja bi povezivala centar Visa s plažom Stiniva tijekom ljetnih mjeseci. Trenutno je potrebno hodati 45 minuta do plaže, što je teško za starije osobe i obitelji s djecom.\n\nHvala na razmatranju.',
  status: 'zaprimljeno',
  status_label: 'Zaprimljeno',
  language: 'hr',
  created_at: '2026-01-17T10:15:00Z',
  updated_at: '2026-01-17T10:15:00Z',
  replies: [],
};

/**
 * Detail fixture - in review status, with reply
 */
export const feedbackDetailInReviewFixture: FeedbackDetailResponse = {
  id: 'feedback-002',
  subject: 'Prijedlog za poboljšanje autobusne linije',
  body: 'Poštovani,\n\nŽelio bih predložiti dodatnu autobusnu liniju koja bi povezivala centar Visa s plažom Stiniva tijekom ljetnih mjeseci. Trenutno je potrebno hodati 45 minuta do plaže, što je teško za starije osobe i obitelji s djecom.\n\nHvala na razmatranju.',
  status: 'u_razmatranju',
  status_label: 'U razmatranju',
  language: 'hr',
  created_at: '2026-01-17T10:15:00Z',
  updated_at: '2026-01-18T14:30:00Z',
  replies: sampleReplies,
};

/**
 * Detail fixture - accepted status
 */
export const feedbackDetailAcceptedFixture: FeedbackDetailResponse = {
  id: 'feedback-003',
  subject: 'Zahtjev za postavljanje klupe na autobusnoj stanici',
  body: 'Molim postavljanje klupe za sjedenje na autobusnoj stanici kod pošte u Komiži. Starije osobe nemaju gdje sjesti dok čekaju autobus.',
  status: 'prihvaceno',
  status_label: 'Prihvaćeno',
  language: 'hr',
  created_at: '2026-01-10T09:00:00Z',
  updated_at: '2026-01-15T11:00:00Z',
  replies: [
    {
      id: 'reply-accepted-1',
      body: 'Poštovani,\n\nVaš prijedlog je prihvaćen. Klupa će biti postavljena do kraja mjeseca.\n\nHvala na sugestiji.',
      created_at: '2026-01-15T11:00:00Z',
    },
  ],
};

/**
 * Default detail fixture (exported as main)
 */
export const feedbackDetailFixture = feedbackDetailInReviewFixture;

/**
 * Section labels for detail screen
 */
export const feedbackDetailLabels = {
  repliesTitle: 'Odgovori',
  noReplies: 'Još nema odgovora na vaš prijedlog.',
  replyLabel: 'Odgovor',
};
