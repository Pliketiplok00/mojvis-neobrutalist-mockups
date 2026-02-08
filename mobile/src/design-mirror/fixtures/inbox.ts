/**
 * Inbox Fixtures (Design Mirror)
 *
 * Static data for Inbox mirror screens.
 * Covers list + detail visual states with tag/urgency variations.
 *
 * Shape matches production types from src/types/inbox.ts
 */

import type { InboxTag, InboxMessage } from '../../types/inbox';
import type { FeedbackStatus } from '../../types/feedback';
import type { ClickFixStatus } from '../../types/click-fix';

// ============================================================
// Inbox List Fixtures (Received Tab)
// ============================================================

/**
 * Sample messages covering all visual states
 * - Tags: promet, kultura, opcenito, multiple tags
 * - Urgency: urgent and non-urgent
 * - Date variations
 */
export const inboxMessagesFixture: InboxMessage[] = [
  // 1. Urgent transport message (hitno + promet)
  {
    id: 'msg-001',
    title: 'Otkazana trajektna linija',
    body: 'Zbog najavljenog nevremena, trajektna linija Split-Vis za danas 19.01. je otkazana. Sljedeći trajekt prema najavi kreće sutra u 07:00.',
    tags: ['promet', 'hitno'] as InboxTag[],
    active_from: '2026-01-19T06:00:00Z',
    active_to: '2026-01-20T12:00:00Z',
    created_at: '2026-01-19T06:30:00Z',
    is_urgent: true,
  },
  // 2. Culture event message (kultura)
  {
    id: 'msg-002',
    title: 'Izložba u Galeriji Kut',
    body: 'Pozivamo vas na otvorenje izložbe "More i ljudi" u Galeriji Kut u Visu. Otvorenje je u subotu 25. siječnja u 19:00 sati. Izložba će biti otvorena do kraja veljače.',
    tags: ['kultura'] as InboxTag[],
    active_from: null,
    active_to: null,
    created_at: '2026-01-18T14:00:00Z',
    is_urgent: false,
  },
  // 3. General municipality message (opcenito + vis)
  {
    id: 'msg-003',
    title: 'Obavijest o radnom vremenu',
    body: 'Turistički ured Vis će od ponedjeljka 20. siječnja raditi po zimskom rasporedu: ponedjeljak - petak 08:00 - 14:00. Subotom i nedjeljom ured je zatvoren.',
    tags: ['opcenito', 'vis'] as InboxTag[],
    active_from: null,
    active_to: null,
    created_at: '2026-01-17T10:00:00Z',
    is_urgent: false,
  },
  // 4. Urgent general message (hitno + opcenito)
  {
    id: 'msg-004',
    title: 'Nestanak struje',
    body: 'Obavještavamo stanovnike naselja Kut o planiranom nestanku električne energije sutra od 09:00 do 13:00 zbog radova na mreži.',
    tags: ['opcenito', 'hitno'] as InboxTag[],
    active_from: '2026-01-19T09:00:00Z',
    active_to: '2026-01-19T13:00:00Z',
    created_at: '2026-01-18T16:00:00Z',
    is_urgent: true,
  },
  // 5. Transport message (promet only, not urgent)
  {
    id: 'msg-005',
    title: 'Novi zimski vozni red',
    body: 'Od 1. veljače na snazi je novi zimski vozni red autobusne linije Vis-Komiža. Molimo putnike da provjere nove polaske na našoj web stranici.',
    tags: ['promet'] as InboxTag[],
    active_from: null,
    active_to: null,
    created_at: '2026-01-15T11:00:00Z',
    is_urgent: false,
  },
  // 6. Komiža specific message (opcenito + komiza)
  {
    id: 'msg-006',
    title: 'Čišćenje plaže Barjoška',
    body: 'Pozivamo sve volontere na akciju čišćenja plaže Barjoška u subotu 25.01. u 10:00. Oprema osigurana, dobrodošli svi koji žele pomoći!',
    tags: ['opcenito', 'komiza'] as InboxTag[],
    active_from: null,
    active_to: null,
    created_at: '2026-01-14T09:00:00Z',
    is_urgent: false,
  },
];

/**
 * Empty state fixture for inbox list
 */
export const inboxMessagesEmptyFixture: InboxMessage[] = [];

// ============================================================
// Inbox List Fixtures (Sent Tab)
// ============================================================

/**
 * Combined sent item type (matches production)
 */
export interface CombinedSentItemFixture {
  id: string;
  type: 'feedback' | 'click_fix';
  subject: string;
  status: FeedbackStatus | ClickFixStatus;
  status_label: string;
  photo_count?: number;
  created_at: string;
}

/**
 * Sample sent items (feedback + click_fix combined)
 */
export const sentItemsFixture: CombinedSentItemFixture[] = [
  {
    id: 'feedback-001',
    type: 'feedback',
    subject: 'Prijedlog za poboljšanje autobusne linije',
    status: 'u_razmatranju',
    status_label: 'U razmatranju',
    created_at: '2026-01-17T10:15:00Z',
  },
  {
    id: 'clickfix-001',
    type: 'click_fix',
    subject: 'Oštećena cesta na putu prema Komiži',
    status: 'zaprimljeno',
    status_label: 'Zaprimljeno',
    photo_count: 2,
    created_at: '2026-01-16T14:30:00Z',
  },
  {
    id: 'feedback-002',
    type: 'feedback',
    subject: 'Zahvala za brzu sanaciju ceste',
    status: 'prihvaceno',
    status_label: 'Prihvaćeno',
    created_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'clickfix-002',
    type: 'click_fix',
    subject: 'Neispravna javna rasvjeta',
    status: 'prihvaceno',
    status_label: 'Prihvaćeno',
    photo_count: 1,
    created_at: '2026-01-08T16:45:00Z',
  },
];

/**
 * Empty sent items fixture
 */
export const sentItemsEmptyFixture: CombinedSentItemFixture[] = [];

// ============================================================
// Inbox Detail Fixtures
// ============================================================

/**
 * Detail fixture - urgent transport message with tags
 */
export const inboxDetailUrgentFixture: InboxMessage = inboxMessagesFixture[0];

/**
 * Detail fixture - culture message without urgency
 */
export const inboxDetailCultureFixture: InboxMessage = inboxMessagesFixture[1];

/**
 * Detail fixture - general message with multiple tags
 */
export const inboxDetailGeneralFixture: InboxMessage = inboxMessagesFixture[2];

/**
 * Default detail fixture (used by mirror screen)
 */
export const inboxDetailFixture = inboxDetailUrgentFixture;

// ============================================================
// UI Labels (Croatian)
// ============================================================

export const inboxLabels = {
  tabs: {
    received: 'Primljeno',
    sent: 'Poslano',
  },
  empty: {
    title: 'Nema poruka',
    received: 'Trenutno nema poruka u sandučiću.',
    sent: 'Još nemate poslanih poruka.',
    sentHint: 'Pošaljite prijedlog ili prijavite problem.',
  },
  actions: {
    newMessage: 'Novi prijedlog',
    reportProblem: 'Prijavi problem',
  },
  badges: {
    report: 'Prijava',
    new: 'NOVO',
    urgent: 'HITNO',
  },
  photoCount: 'fotografija',
  detail: {
    loading: 'Učitavanje...',
    error: 'Greška pri učitavanju poruke.',
    notFound: 'Poruka nije pronađena.',
  },
};

/**
 * Tag display labels
 */
export const tagLabels: Record<string, string> = {
  promet: 'Promet',
  kultura: 'Kultura',
  opcenito: 'Općenito',
  komiza: 'Komiža',
  vis: 'Vis',
  hitno: 'Hitno',
};
