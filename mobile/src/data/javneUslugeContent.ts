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
  value: string;
}

export interface ServiceItem {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
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
}

export interface UsefulLink {
  id: string;
  icon: IconName;
  title: string;
  url: string;
}

export interface EmergencyNumber {
  id: string;
  icon: IconName;
  name: string;
  phoneNumber: string;
  backgroundColor: 'warningBackground' | 'backgroundSecondary' | 'secondary';
  textColor?: 'textPrimary' | 'primaryText';
}

export interface JavneUslugeContent {
  header: {
    title: string;
    subtitle: string;
    icon: IconName;
  };
  services: ServiceItem[];
  emergency: {
    title: string;
    numbers: EmergencyNumber[];
  };
  usefulLinks: {
    title: string;
    links: UsefulLink[];
  };
}

// ============================================================
// Content
// ============================================================

export const javneUslugeContent: JavneUslugeContent = {
  header: {
    title: 'Javne usluge',
    subtitle: 'Korisne informacije za stanovnike i posjetitelje',
    icon: 'info',
  },

  services: [
    {
      id: 'dom-zdravlja',
      icon: 'home',
      title: 'Dom zdravlja',
      subtitle: 'Primarna zdravstvena zaštita',
      badge: 'VELJAČA \'26',
      iconBackgroundColor: 'urgent',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'Adresa',
          value: 'Šetalište stare Isse 3, Vis',
        },
        {
          icon: 'phone',
          label: 'Telefon',
          value: '+385 21 711 033',
        },
        {
          icon: 'clock',
          label: 'Radno vrijeme',
          value: 'Pon - Pet: 07:00 - 20:00\nSub: 08:00 - 12:00',
        },
      ],
      note: 'Hitna pomoć dostupna 24/7 na broj 194',
    },
    {
      id: 'veterinarska',
      icon: 'leaf',
      title: 'Veterinarska stanica',
      subtitle: 'Zdravstvena skrb za životinje',
      iconBackgroundColor: 'secondary',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'Adresa',
          value: 'Put Mula 12, Vis',
        },
        {
          icon: 'phone',
          label: 'Telefon',
          value: '+385 21 711 155',
        },
        {
          icon: 'clock',
          label: 'Radno vrijeme',
          value: 'Pon - Pet: 08:00 - 16:00',
        },
      ],
    },
    {
      id: 'javni-biljeznik',
      icon: 'file-text',
      title: 'Javni bilježnik',
      subtitle: 'Pravne usluge i ovjera dokumenata',
      iconBackgroundColor: 'lavender',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'Adresa',
          value: 'Trg 30. svibnja 5, Vis',
        },
        {
          icon: 'phone',
          label: 'Telefon',
          value: '+385 21 711 200',
        },
        {
          icon: 'clock',
          label: 'Radno vrijeme',
          value: 'Pon - Pet: 09:00 - 14:00',
        },
      ],
      note: 'Preporuča se najava dolaska telefonom',
    },
    {
      id: 'tehnicki-pregled',
      icon: 'wrench',
      title: 'Tehnički pregled',
      subtitle: 'Registracija vozila',
      iconBackgroundColor: 'orange',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'Adresa',
          value: 'Poslovna zona Vis, bb',
        },
        {
          icon: 'phone',
          label: 'Telefon',
          value: '+385 21 711 300',
        },
        {
          icon: 'clock',
          label: 'Radno vrijeme',
          value: 'Pon - Pet: 08:00 - 15:00',
        },
      ],
    },
    {
      id: 'banke',
      icon: 'inbox',
      title: 'Banke',
      subtitle: 'Bankomati i poslovnice',
      iconBackgroundColor: 'accent',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'PBZ',
          value: 'Obala sv. Jurja 18, Vis',
        },
        {
          icon: 'map-pin',
          label: 'Erste banka',
          value: 'Šetalište stare Isse 1, Vis',
        },
        {
          icon: 'info',
          label: 'Bankomati',
          value: 'Dostupni 24/7 na obje lokacije',
        },
      ],
    },
    {
      id: 'posta-internet',
      icon: 'mail',
      title: 'Pošta & Internet',
      subtitle: 'Poštanske usluge i pristup internetu',
      iconBackgroundColor: 'primary',
      infoRows: [
        {
          icon: 'map-pin',
          label: 'HP Pošta',
          value: 'Trg 30. svibnja 1, Vis',
        },
        {
          icon: 'clock',
          label: 'Radno vrijeme',
          value: 'Pon - Pet: 08:00 - 14:00\nSub: 08:00 - 12:00',
        },
        {
          icon: 'globe',
          label: 'WiFi',
          value: 'Besplatan WiFi dostupan na rivi i glavnom trgu',
        },
      ],
    },
  ],

  emergency: {
    title: 'Hitni brojevi',
    numbers: [
      {
        id: 'hitna',
        icon: 'phone',
        name: 'Hitna pomoć',
        phoneNumber: '194',
        backgroundColor: 'warningBackground',
        textColor: 'textPrimary',
      },
      {
        id: 'policija',
        icon: 'phone',
        name: 'Policija',
        phoneNumber: '192',
        backgroundColor: 'backgroundSecondary',
        textColor: 'textPrimary',
      },
      {
        id: 'vatrogasci',
        icon: 'phone',
        name: 'Vatrogasci',
        phoneNumber: '193',
        backgroundColor: 'secondary',
        textColor: 'primaryText',
      },
    ],
  },

  usefulLinks: {
    title: 'Korisni linkovi',
    links: [
      {
        id: 'jadrolinija',
        icon: 'ship',
        title: 'Jadrolinija – trajekti',
        url: 'https://www.jadrolinija.hr',
      },
      {
        id: 'krilo',
        icon: 'anchor',
        title: 'Krilo – katamaran',
        url: 'https://www.krfrilo.hr',
      },
      {
        id: 'prognoza',
        icon: 'globe',
        title: 'Vremenska prognoza',
        url: 'https://meteo.hr',
      },
    ],
  },
};

export default javneUslugeContent;
