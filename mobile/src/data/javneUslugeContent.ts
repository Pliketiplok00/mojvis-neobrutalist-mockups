/**
 * Javne Usluge Content Data
 *
 * Static content for the Public Services (Javne usluge) screen.
 * Contains service info, contact details, and emergency numbers.
 *
 * Skin-pure: Uses icon names from available icon set.
 */

import type { IconName } from '../ui/Icon';

// ============================================================
// Types
// ============================================================

export interface ServiceInfoRow {
  icon: IconName;
  label: string;
  labelEn: string;
  value: string;
  valueEn: string;
}

export interface ServiceItem {
  id: string;
  icon: IconName;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  badge?: string;
  iconBackgroundColor:
    | 'errorBackground'
    | 'warningBackground'
    | 'infoBackground'
    | 'pendingBackground'
    | 'accent'
    | 'secondary'
    | 'primary'
    | 'lavender'
    | 'orange'
    | 'urgent';
  infoRows: ServiceInfoRow[];
  note?: string;
  noteEn?: string;
}

export interface UsefulLink {
  id: string;
  icon: IconName;
  title: string;
  titleEn: string;
  url: string;
}

export interface EmergencyNumber {
  id: string;
  icon: IconName;
  name: string;
  nameEn: string;
  phoneNumber: string;
  backgroundColor: 'warningBackground' | 'backgroundSecondary' | 'secondary';
  textColor?: 'textPrimary' | 'primaryText';
}

export interface JavneUslugeContent {
  header: {
    title: string;
    titleEn: string;
    subtitle: string;
    subtitleEn: string;
    icon: IconName;
  };
  services: ServiceItem[];
  emergency: {
    title: string;
    titleEn: string;
    numbers: EmergencyNumber[];
  };
  usefulLinks: {
    title: string;
    titleEn: string;
    links: UsefulLink[];
  };
}

// ============================================================
// Content
// ============================================================

export const javneUslugeContent: JavneUslugeContent = {
  header: {
    title: 'Javne usluge',
    titleEn: 'Public Services',
    subtitle: 'Korisne informacije za stanovnike i posjetitelje',
    subtitleEn: 'Useful information for residents and visitors',
    icon: 'info',
  },

  services: [
    {
      id: 'dom-zdravlja',
      icon: 'hospital',
      title: 'Dom zdravlja',
      titleEn: 'Health Center',
      subtitle: 'Primarna zdravstvena zaštita',
      subtitleEn: 'Primary healthcare',
      badge: 'VELJAČA \'26',
      iconBackgroundColor: 'urgent',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'Adresa',
          labelEn: 'Address',
          value: 'Šetalište stare Isse 3, Vis',
          valueEn: 'Šetalište stare Isse 3, Vis',
        },
        {
          icon: 'phone',
          label: 'Telefon',
          labelEn: 'Phone',
          value: '+385 21 711 033',
          valueEn: '+385 21 711 033',
        },
        {
          icon: 'clock',
          label: 'Radno vrijeme',
          labelEn: 'Working hours',
          value: 'Pon - Pet: 07:00 - 20:00\nSub: 08:00 - 12:00',
          valueEn: 'Mon - Fri: 07:00 - 20:00\nSat: 08:00 - 12:00',
        },
      ],
      note: 'Hitna pomoć dostupna 24/7 na broj 194',
      noteEn: 'Emergency available 24/7 at 194',
    },
    {
      id: 'veterinarska',
      icon: 'cat',
      title: 'Veterinarska stanica',
      titleEn: 'Veterinary Clinic',
      subtitle: 'Zdravstvena skrb za životinje',
      subtitleEn: 'Animal healthcare',
      iconBackgroundColor: 'secondary',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'Adresa',
          labelEn: 'Address',
          value: 'Put Mula 12, Vis',
          valueEn: 'Put Mula 12, Vis',
        },
        {
          icon: 'phone',
          label: 'Telefon',
          labelEn: 'Phone',
          value: '+385 21 711 155',
          valueEn: '+385 21 711 155',
        },
        {
          icon: 'clock',
          label: 'Radno vrijeme',
          labelEn: 'Working hours',
          value: 'Pon - Pet: 08:00 - 16:00',
          valueEn: 'Mon - Fri: 08:00 - 16:00',
        },
      ],
    },
    {
      id: 'javni-biljeznik',
      icon: 'file-text',
      title: 'Javni bilježnik',
      titleEn: 'Notary Public',
      subtitle: 'Pravne usluge i ovjera dokumenata',
      subtitleEn: 'Legal services and document certification',
      iconBackgroundColor: 'lavender',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'Adresa',
          labelEn: 'Address',
          value: 'Trg 30. svibnja 5, Vis',
          valueEn: 'Trg 30. svibnja 5, Vis',
        },
        {
          icon: 'phone',
          label: 'Telefon',
          labelEn: 'Phone',
          value: '+385 21 711 200',
          valueEn: '+385 21 711 200',
        },
        {
          icon: 'clock',
          label: 'Radno vrijeme',
          labelEn: 'Working hours',
          value: 'Pon - Pet: 09:00 - 14:00',
          valueEn: 'Mon - Fri: 09:00 - 14:00',
        },
      ],
      note: 'Preporuča se najava dolaska telefonom',
      noteEn: 'Phone appointment recommended',
    },
    {
      id: 'tehnicki-pregled',
      icon: 'car',
      title: 'Tehnički pregled',
      titleEn: 'Vehicle Inspection',
      subtitle: 'Registracija vozila',
      subtitleEn: 'Vehicle registration',
      iconBackgroundColor: 'orange',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'Adresa',
          labelEn: 'Address',
          value: 'Poslovna zona Vis, bb',
          valueEn: 'Business zone Vis, bb',
        },
        {
          icon: 'phone',
          label: 'Telefon',
          labelEn: 'Phone',
          value: '+385 21 711 300',
          valueEn: '+385 21 711 300',
        },
        {
          icon: 'clock',
          label: 'Radno vrijeme',
          labelEn: 'Working hours',
          value: 'Pon - Pet: 08:00 - 15:00',
          valueEn: 'Mon - Fri: 08:00 - 15:00',
        },
      ],
    },
    {
      id: 'banke',
      icon: 'landmark',
      title: 'Banke',
      titleEn: 'Banks',
      subtitle: 'Bankomati i poslovnice',
      subtitleEn: 'ATMs and branches',
      iconBackgroundColor: 'accent',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'PBZ',
          labelEn: 'PBZ',
          value: 'Obala sv. Jurja 18, Vis',
          valueEn: 'Obala sv. Jurja 18, Vis',
        },
        {
          icon: 'map-pin',
          label: 'Erste banka',
          labelEn: 'Erste Bank',
          value: 'Šetalište stare Isse 1, Vis',
          valueEn: 'Šetalište stare Isse 1, Vis',
        },
        {
          icon: 'info',
          label: 'Bankomati',
          labelEn: 'ATMs',
          value: 'Dostupni 24/7 na obje lokacije',
          valueEn: 'Available 24/7 at both locations',
        },
      ],
    },
    {
      id: 'posta-internet',
      icon: 'mail',
      title: 'Pošta & Internet',
      titleEn: 'Post & Internet',
      subtitle: 'Poštanske usluge i pristup internetu',
      subtitleEn: 'Postal services and internet access',
      iconBackgroundColor: 'primary',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'HP Pošta',
          labelEn: 'Post Office',
          value: 'Trg 30. svibnja 1, Vis',
          valueEn: 'Trg 30. svibnja 1, Vis',
        },
        {
          icon: 'clock',
          label: 'Radno vrijeme',
          labelEn: 'Working hours',
          value: 'Pon - Pet: 08:00 - 14:00\nSub: 08:00 - 12:00',
          valueEn: 'Mon - Fri: 08:00 - 14:00\nSat: 08:00 - 12:00',
        },
        {
          icon: 'globe',
          label: 'WiFi',
          labelEn: 'WiFi',
          value: 'Besplatan WiFi dostupan na rivi i glavnom trgu',
          valueEn: 'Free WiFi available at the waterfront and main square',
        },
      ],
    },
  ],

  emergency: {
    title: 'Hitni brojevi',
    titleEn: 'Emergency Numbers',
    numbers: [
      {
        id: 'hitna',
        icon: 'phone',
        name: 'Hitna pomoć',
        nameEn: 'Ambulance',
        phoneNumber: '194',
        backgroundColor: 'warningBackground',
        textColor: 'textPrimary',
      },
      {
        id: 'policija',
        icon: 'phone',
        name: 'Policija',
        nameEn: 'Police',
        phoneNumber: '192',
        backgroundColor: 'backgroundSecondary',
        textColor: 'textPrimary',
      },
      {
        id: 'vatrogasci',
        icon: 'phone',
        name: 'Vatrogasci',
        nameEn: 'Fire Dept.',
        phoneNumber: '193',
        backgroundColor: 'secondary',
        textColor: 'primaryText',
      },
    ],
  },

  usefulLinks: {
    title: 'Korisni linkovi',
    titleEn: 'Useful Links',
    links: [
      {
        id: 'jadrolinija',
        icon: 'ship',
        title: 'Jadrolinija – trajekti',
        titleEn: 'Jadrolinija – Ferries',
        url: 'https://www.jadrolinija.hr',
      },
      {
        id: 'krilo',
        icon: 'anchor',
        title: 'Krilo – katamaran',
        titleEn: 'Krilo – Catamaran',
        url: 'https://www.krfrilo.hr',
      },
      {
        id: 'prognoza',
        icon: 'globe',
        title: 'Vremenska prognoza',
        titleEn: 'Weather Forecast',
        url: 'https://meteo.hr',
      },
    ],
  },
};

export default javneUslugeContent;
