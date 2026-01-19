/**
 * Contacts Fixtures (Design Mirror)
 *
 * Static data for Contacts List and Contact Detail mirror screens.
 * Covers contact list variants and detail view states.
 *
 * Note: Production Contacts screens not found.
 * Design based on existing app patterns (StaticPageScreen ContactBlock).
 */

import type { IconName } from '../../ui/Icon';

// ============================================================
// Types
// ============================================================

export type ContactCategory =
  | 'emergency'
  | 'municipality'
  | 'healthcare'
  | 'utilities'
  | 'transport'
  | 'tourism'
  | 'other';

export interface Contact {
  id: string;
  name: string;
  category: ContactCategory;
  categoryLabelHr: string;
  categoryLabelEn: string;
  phones: string[];
  email: string | null;
  website: string | null;
  address: string | null;
  workingHours: string | null;
  noteHr: string | null;
  noteEn: string | null;
  isEmergency: boolean;
  icon: IconName;
}

export interface ContactsListFixture {
  id: string;
  name: string;
  description: string;
  contacts: Contact[];
}

export interface ContactDetailFixture {
  id: string;
  name: string;
  description: string;
  contact: Contact;
}

// ============================================================
// Category Labels
// ============================================================

export const contactCategoryLabels: Record<ContactCategory, { hr: string; en: string }> = {
  emergency: { hr: 'HITNE SLUŽBE', en: 'EMERGENCY' },
  municipality: { hr: 'OPĆINA', en: 'MUNICIPALITY' },
  healthcare: { hr: 'ZDRAVSTVO', en: 'HEALTHCARE' },
  utilities: { hr: 'KOMUNALIJE', en: 'UTILITIES' },
  transport: { hr: 'PRIJEVOZ', en: 'TRANSPORT' },
  tourism: { hr: 'TURIZAM', en: 'TOURISM' },
  other: { hr: 'OSTALO', en: 'OTHER' },
};

// ============================================================
// Contact Category Icons
// ============================================================

export const contactCategoryIcons: Record<ContactCategory, IconName> = {
  emergency: 'alert-triangle',
  municipality: 'home',
  healthcare: 'info',
  utilities: 'wrench',
  transport: 'ship',
  tourism: 'globe',
  other: 'info',
};

// ============================================================
// UI Labels
// ============================================================

export const contactsLabels = {
  titleHr: 'KONTAKTI',
  titleEn: 'CONTACTS',
  subtitleHr: 'Važni kontakti na otoku',
  subtitleEn: 'Important contacts on the island',
  emergencySectionHr: 'HITNI BROJEVI',
  emergencySectionEn: 'EMERGENCY NUMBERS',
  allContactsHr: 'SVI KONTAKTI',
  allContactsEn: 'ALL CONTACTS',
  emptyStateHr: 'Nema dostupnih kontakata',
  emptyStateEn: 'No contacts available',
  phoneHr: 'Telefon',
  phoneEn: 'Phone',
  emailHr: 'E-pošta',
  emailEn: 'Email',
  websiteHr: 'Web stranica',
  websiteEn: 'Website',
  addressHr: 'Adresa',
  addressEn: 'Address',
  workingHoursHr: 'Radno vrijeme',
  workingHoursEn: 'Working hours',
  noteHr: 'Napomena',
  noteEn: 'Note',
};

// ============================================================
// Sample Contacts Data
// ============================================================

const emergencyContacts: Contact[] = [
  {
    id: 'emergency-police',
    name: 'Policija / Police',
    category: 'emergency',
    categoryLabelHr: contactCategoryLabels.emergency.hr,
    categoryLabelEn: contactCategoryLabels.emergency.en,
    phones: ['192'],
    email: null,
    website: null,
    address: null,
    workingHours: '24/7',
    noteHr: 'Pozovite za sve hitne slučajeve sigurnosti',
    noteEn: 'Call for all safety emergencies',
    isEmergency: true,
    icon: 'alert-triangle',
  },
  {
    id: 'emergency-ambulance',
    name: 'Hitna pomoć / Ambulance',
    category: 'emergency',
    categoryLabelHr: contactCategoryLabels.emergency.hr,
    categoryLabelEn: contactCategoryLabels.emergency.en,
    phones: ['194'],
    email: null,
    website: null,
    address: null,
    workingHours: '24/7',
    noteHr: 'Za medicinske hitne slučajeve',
    noteEn: 'For medical emergencies',
    isEmergency: true,
    icon: 'alert-triangle',
  },
  {
    id: 'emergency-fire',
    name: 'Vatrogasci / Fire Department',
    category: 'emergency',
    categoryLabelHr: contactCategoryLabels.emergency.hr,
    categoryLabelEn: contactCategoryLabels.emergency.en,
    phones: ['193'],
    email: null,
    website: null,
    address: null,
    workingHours: '24/7',
    noteHr: 'Za požare i spašavanje',
    noteEn: 'For fires and rescue',
    isEmergency: true,
    icon: 'alert-triangle',
  },
  {
    id: 'emergency-coastguard',
    name: 'Obalna straža / Coast Guard',
    category: 'emergency',
    categoryLabelHr: contactCategoryLabels.emergency.hr,
    categoryLabelEn: contactCategoryLabels.emergency.en,
    phones: ['195'],
    email: null,
    website: null,
    address: null,
    workingHours: '24/7',
    noteHr: 'Za pomoć na moru',
    noteEn: 'For maritime assistance',
    isEmergency: true,
    icon: 'anchor',
  },
];

const municipalityContacts: Contact[] = [
  {
    id: 'municipality-vis',
    name: 'Grad Vis',
    category: 'municipality',
    categoryLabelHr: contactCategoryLabels.municipality.hr,
    categoryLabelEn: contactCategoryLabels.municipality.en,
    phones: ['+385 21 711 532', '+385 21 711 533'],
    email: 'grad.vis@vis.hr',
    website: 'www.gradvis.hr',
    address: 'Trg 30. svibnja 2, 21480 Vis',
    workingHours: 'Pon-Pet 08:00-15:00',
    noteHr: 'Gradska uprava i javne usluge',
    noteEn: 'City administration and public services',
    isEmergency: false,
    icon: 'home',
  },
  {
    id: 'municipality-komiza',
    name: 'Općina Komiža',
    category: 'municipality',
    categoryLabelHr: contactCategoryLabels.municipality.hr,
    categoryLabelEn: contactCategoryLabels.municipality.en,
    phones: ['+385 21 713 022'],
    email: 'opcina-komiza@st.t-com.hr',
    website: 'www.komiza.hr',
    address: 'Hrvatskih mučenika 9, 21485 Komiža',
    workingHours: 'Pon-Pet 08:00-15:00',
    noteHr: 'Općinska uprava Komiže',
    noteEn: 'Municipality administration of Komiža',
    isEmergency: false,
    icon: 'home',
  },
];

const healthcareContacts: Contact[] = [
  {
    id: 'healthcare-dom',
    name: 'Dom zdravlja Vis',
    category: 'healthcare',
    categoryLabelHr: contactCategoryLabels.healthcare.hr,
    categoryLabelEn: contactCategoryLabels.healthcare.en,
    phones: ['+385 21 711 035'],
    email: 'dom.zdravlja.vis@gmail.com',
    website: null,
    address: 'Put Jame 3, 21480 Vis',
    workingHours: 'Pon-Pet 07:00-19:00, Sub 08:00-12:00',
    noteHr: 'Opća praksa, hitna pomoć, laboratorij',
    noteEn: 'General practice, emergency, laboratory',
    isEmergency: false,
    icon: 'info',
  },
  {
    id: 'healthcare-pharmacy',
    name: 'Ljekarna Vis',
    category: 'healthcare',
    categoryLabelHr: contactCategoryLabels.healthcare.hr,
    categoryLabelEn: contactCategoryLabels.healthcare.en,
    phones: ['+385 21 711 211'],
    email: null,
    website: null,
    address: 'Obala sv. Jurja 28, 21480 Vis',
    workingHours: 'Pon-Pet 08:00-20:00, Sub 08:00-13:00',
    noteHr: null,
    noteEn: null,
    isEmergency: false,
    icon: 'info',
  },
];

const utilitiesContacts: Contact[] = [
  {
    id: 'utilities-vodovod',
    name: 'Vodovod Vis d.o.o.',
    category: 'utilities',
    categoryLabelHr: contactCategoryLabels.utilities.hr,
    categoryLabelEn: contactCategoryLabels.utilities.en,
    phones: ['+385 21 711 166'],
    email: 'vodovod.vis@gmail.com',
    website: null,
    address: 'Trg 30. svibnja 1, 21480 Vis',
    workingHours: 'Pon-Pet 07:00-15:00',
    noteHr: 'Vodoopskrba i prijava kvarova',
    noteEn: 'Water supply and fault reporting',
    isEmergency: false,
    icon: 'wrench',
  },
  {
    id: 'utilities-hep',
    name: 'HEP - Elektra Split',
    category: 'utilities',
    categoryLabelHr: contactCategoryLabels.utilities.hr,
    categoryLabelEn: contactCategoryLabels.utilities.en,
    phones: ['0800 300 403'],
    email: null,
    website: 'www.hep.hr',
    address: null,
    workingHours: '24/7 (dežurna služba)',
    noteHr: 'Prijava nestanka struje',
    noteEn: 'Power outage reporting',
    isEmergency: false,
    icon: 'wrench',
  },
];

const tourismContacts: Contact[] = [
  {
    id: 'tourism-tz-vis',
    name: 'Turistička zajednica Vis',
    category: 'tourism',
    categoryLabelHr: contactCategoryLabels.tourism.hr,
    categoryLabelEn: contactCategoryLabels.tourism.en,
    phones: ['+385 21 717 017'],
    email: 'info@tz-vis.hr',
    website: 'www.tz-vis.hr',
    address: 'Šetalište stare Isse 5, 21480 Vis',
    workingHours: 'Pon-Sub 08:00-20:00 (sezona)',
    noteHr: 'Informacije za turiste, karte, smještaj',
    noteEn: 'Tourist information, maps, accommodation',
    isEmergency: false,
    icon: 'globe',
  },
  {
    id: 'tourism-tz-komiza',
    name: 'Turistička zajednica Komiža',
    category: 'tourism',
    categoryLabelHr: contactCategoryLabels.tourism.hr,
    categoryLabelEn: contactCategoryLabels.tourism.en,
    phones: ['+385 21 713 455'],
    email: 'info@tz-komiza.hr',
    website: 'www.tz-komiza.hr',
    address: 'Riva Sv. Mikule 2, 21485 Komiža',
    workingHours: 'Pon-Sub 08:00-20:00 (sezona)',
    noteHr: 'Turistički ured Komiže',
    noteEn: 'Komiža tourist office',
    isEmergency: false,
    icon: 'globe',
  },
];

// ============================================================
// Fixture 1: Default (8-12 entries)
// ============================================================

export const contactsListDefaultFixture: ContactsListFixture = {
  id: 'default',
  name: 'Default',
  description: 'Mixed contacts from all categories (10 entries)',
  contacts: [
    ...emergencyContacts.slice(0, 2),
    ...municipalityContacts,
    ...healthcareContacts,
    ...utilitiesContacts.slice(0, 1),
    ...tourismContacts,
  ],
};

// ============================================================
// Fixture 2: Emergency (prioritised)
// ============================================================

export const contactsListEmergencyFixture: ContactsListFixture = {
  id: 'emergency',
  name: 'Emergency',
  description: 'Emergency contacts only (4 entries)',
  contacts: emergencyContacts,
};

// ============================================================
// Fixture 3: Empty
// ============================================================

export const contactsEmptyFixture: ContactsListFixture = {
  id: 'empty',
  name: 'Empty',
  description: 'Empty state - no contacts',
  contacts: [],
};

// ============================================================
// Fixture 4: Contact Detail - Long
// ============================================================

export const contactDetailLongFixture: ContactDetailFixture = {
  id: 'detail-long',
  name: 'Long Detail',
  description: 'Contact with long notes and address (stress test)',
  contact: {
    id: 'long-detail-contact',
    name: 'Turistička zajednica grada Visa - Ured za informacije i promociju turizma',
    category: 'tourism',
    categoryLabelHr: contactCategoryLabels.tourism.hr,
    categoryLabelEn: contactCategoryLabels.tourism.en,
    phones: ['+385 21 717 017', '+385 21 717 018', '+385 91 555 1234'],
    email: 'info@tz-vis.hr',
    website: 'www.tz-vis.hr',
    address: 'Šetalište stare Isse 5, zgrada Turističke zajednice, prizemlje, 21480 Vis, Republika Hrvatska',
    workingHours: 'Ponedjeljak - Subota: 08:00-20:00 (glavna sezona lipanj-rujan), 08:00-14:00 (izvan sezone), Nedjelja: zatvoreno osim državnih praznika',
    noteHr: 'Turistički ured pruža sve potrebne informacije za posjetitelje otoka Visa, uključujući karte, brošure, preporuke za smještaj, restorane i aktivnosti. Dostupna je i pomoć pri organizaciji izleta na obližnje otoke i rezervaciji lokalnih vodiča. U sezoni je moguće dobiti besplatne turističke karte i informativne materijale na više jezika.',
    noteEn: 'The tourist office provides all necessary information for visitors to Vis island, including maps, brochures, recommendations for accommodation, restaurants and activities. Assistance with organizing trips to nearby islands and booking local guides is also available. During the season, free tourist maps and informational materials are available in multiple languages.',
    isEmergency: false,
    icon: 'globe',
  },
};

// ============================================================
// Fixture 5: Contact Detail - Minimal
// ============================================================

export const contactDetailMinimalFixture: ContactDetailFixture = {
  id: 'detail-minimal',
  name: 'Minimal Detail',
  description: 'Contact with minimal info (phone only)',
  contact: {
    id: 'minimal-detail-contact',
    name: 'Policija',
    category: 'emergency',
    categoryLabelHr: contactCategoryLabels.emergency.hr,
    categoryLabelEn: contactCategoryLabels.emergency.en,
    phones: ['192'],
    email: null,
    website: null,
    address: null,
    workingHours: '24/7',
    noteHr: null,
    noteEn: null,
    isEmergency: true,
    icon: 'alert-triangle',
  },
};

// ============================================================
// All Fixtures Arrays
// ============================================================

export const contactsListFixtures: ContactsListFixture[] = [
  contactsListDefaultFixture,
  contactsListEmergencyFixture,
  contactsEmptyFixture,
];

export const contactDetailFixtures: ContactDetailFixture[] = [
  contactDetailLongFixture,
  contactDetailMinimalFixture,
];
