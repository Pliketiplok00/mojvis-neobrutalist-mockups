import { createContext, useContext, useState, ReactNode } from "react";

export type Locale = "hr" | "en";

// Translation strings - HR and EN
const translations = {
  // App-wide
  appName: { hr: "MOJ VIS", en: "MOJ VIS" },
  menu: { hr: "Izbornik", en: "Menu" },
  back: { hr: "Natrag", en: "Back" },
  openMenu: { hr: "Otvori izbornik", en: "Open menu" },
  openInbox: { hr: "Otvori poruke", en: "Open inbox" },
  loading: { hr: "Učitavanje...", en: "Loading..." },
  error: { hr: "Greška", en: "Error" },
  retry: { hr: "Pokušaj ponovno", en: "Try again" },
  
  // Navigation
  home: { hr: "Početna", en: "Home" },
  events: { hr: "Događanja", en: "Events" },
  roadTransport: { hr: "Autobusni prijevoz", en: "Road Transport" },
  seaTransport: { hr: "Pomorski prijevoz", en: "Sea Transport" },
  feedback: { hr: "Povratne informacije", en: "Feedback" },
  clickFix: { hr: "Klikni & Popravi", en: "Click & Fix" },
  flora: { hr: "Flora", en: "Flora" },
  fauna: { hr: "Fauna", en: "Fauna" },
  info: { hr: "Informacije", en: "Information" },
  settings: { hr: "Postavke", en: "Settings" },
  
  // Inbox
  inbox: { hr: "Poruke", en: "Inbox" },
  received: { hr: "Primljeno", en: "Received" },
  sent: { hr: "Poslano", en: "Sent" },
  newMessage: { hr: "Novo", en: "New" },
  noMessages: { hr: "Nema poruka", en: "No messages" },
  noMessagesDesc: { hr: "Ovdje će se prikazati sve tvoje poruke i obavijesti.", en: "Your messages and notices will appear here." },
  
  // Message status
  statusReceived: { hr: "Zaprimljeno", en: "Received" },
  statusUnderReview: { hr: "U pregledu", en: "Under Review" },
  statusAccepted: { hr: "Prihvaćeno", en: "Accepted" },
  statusRejected: { hr: "Odbijeno", en: "Rejected" },
  
  // Notice
  noticeActivePeriod: { hr: "Razdoblje aktivnosti obavijesti", en: "Notice Active Period" },
  from: { hr: "Od", en: "From" },
  to: { hr: "Do", en: "To" },
  
  // Events
  upcomingEvents: { hr: "Nadolazeći događaji", en: "Upcoming Events" },
  noEvents: { hr: "Nema događaja", en: "No events" },
  noEventsDesc: { hr: "Trenutno nema zakazanih događaja.", en: "There are no scheduled events at this time." },
  viewAll: { hr: "Prikaži sve", en: "View all" },
  
  // Transport
  lines: { hr: "Linije", en: "Lines" },
  todaysDepartures: { hr: "Današnji polasci", en: "Today's Departures" },
  contacts: { hr: "Kontakti", en: "Contacts" },
  noDepartures: { hr: "Nema polazaka", en: "No departures" },
  noDeparturesDesc: { hr: "Nema polazaka za odabrani datum.", en: "No departures for the selected date." },
  stops: { hr: "stanica", en: "stops" },
  ports: { hr: "luke", en: "ports" },
  duration: { hr: "Trajanje", en: "Duration" },
  
  // Feedback & Click Fix
  feedbackTitle: { hr: "Povratne informacije", en: "Feedback" },
  feedbackSubtitle: { hr: "Ideje • Prijedlozi • Pohvale", en: "Ideas • Suggestions • Praise" },
  messageType: { hr: "Vrsta poruke", en: "Message Type" },
  subject: { hr: "Naslov", en: "Subject" },
  message: { hr: "Poruka", en: "Message" },
  submit: { hr: "Pošalji", en: "Submit" },
  sendMessage: { hr: "Pošalji poruku", en: "Send Message" },
  sendReport: { hr: "Pošalji prijavu", en: "Send Report" },
  messageSent: { hr: "Poruka poslana", en: "Message Sent" },
  reportSent: { hr: "Prijava poslana", en: "Report Sent" },
  messageSentDesc: { hr: "Tvoja povratna informacija je zaprimljena. Status možeš pratiti u Inboxu.", en: "Your feedback has been received. You can track its status in your Inbox." },
  reportSentDesc: { hr: "Tvoja prijava je zaprimljena. Status možeš pratiti u Inboxu.", en: "Your report has been received. You can track its status in your Inbox." },
  returnHome: { hr: "Povratak na početnu", en: "Return to Home" },
  
  // Feedback types
  idea: { hr: "Nova ideja", en: "New Idea" },
  suggestion: { hr: "Prijedlog", en: "Suggestion" },
  criticism: { hr: "Kritika", en: "Criticism" },
  praise: { hr: "Pohvala", en: "Praise" },
  
  // Click & Fix
  clickFixTitle: { hr: "Klikni & Popravi", en: "Click & Fix" },
  clickFixSubtitle: { hr: "Prijavi problem na otoku", en: "Report a problem on the island" },
  location: { hr: "Lokacija", en: "Location" },
  selectLocation: { hr: "Odaberi lokaciju na karti", en: "Select location on map" },
  photos: { hr: "Fotografije", en: "Photos" },
  photosOptional: { hr: "opcionalno, max 3", en: "optional, max 3" },
  addPhoto: { hr: "Dodaj", en: "Add" },
  problemDescription: { hr: "Opis problema", en: "Problem Description" },
  minCharacters: { hr: "znakova (minimum)", en: "characters (minimum)" },
  noPhotoWarning: { hr: "Nema fotografija", en: "No Photos" },
  noPhotoWarningDesc: { hr: "Jesi li siguran/na? Prijave s fotografijama imaju veću šansu za rješavanje.", en: "Are you sure? Reports with photos have a higher chance of being resolved." },
  addPhotoBtn: { hr: "Dodaj foto", en: "Add Photo" },
  sendAnyway: { hr: "Pošalji svejedno", en: "Send Anyway" },
  
  // Rate limiting
  rateLimitNote: { hr: "Možeš poslati najviše 3 poruke dnevno.", en: "You can send up to 3 messages per day." },
  rateLimitReached: { hr: "Dnevni limit dosegnut", en: "Daily limit reached" },
  rateLimitReachedDesc: { hr: "Dosegnuo/la si dnevni limit od 3 poruke. Pokušaj ponovno sutra.", en: "You have reached the daily limit of 3 messages. Please try again tomorrow." },
  remainingSubmissions: { hr: "Preostalo poruka danas", en: "Remaining submissions today" },
  
  // Home
  welcome: { hr: "Dobrodošli na Vis!", en: "Welcome to Vis!" },
  welcomeSubtitle: { hr: "Tvoj vodič za događanja, prijevoz i usluge", en: "Your island guide for events, transport & services" },
  quickAccess: { hr: "Brzi pristup", en: "Quick Access" },
  shareThoughts: { hr: "Podijeli svoje mišljenje", en: "Share Your Thoughts" },
  shareThoughtsDesc: { hr: "Ideje, prijedlozi i povratne informacije", en: "Ideas, suggestions & feedback" },
  
  // Info page
  emergencyNumbers: { hr: "Hitni brojevi", en: "Emergency Numbers" },
  importantContacts: { hr: "Važni kontakti", en: "Important Contacts" },
  usefulLinks: { hr: "Korisni linkovi", en: "Useful Links" },
  
  // Settings
  language: { hr: "Jezik", en: "Language" },
  croatian: { hr: "Hrvatski", en: "Croatian" },
  english: { hr: "Engleski", en: "English" },
  
  // Common
  required: { hr: "obavezno", en: "required" },
  optional: { hr: "opcionalno", en: "optional" },
  cancel: { hr: "Odustani", en: "Cancel" },
  confirm: { hr: "Potvrdi", en: "Confirm" },
  close: { hr: "Zatvori", en: "Close" },
  save: { hr: "Spremi", en: "Save" },
  delete: { hr: "Obriši", en: "Delete" },
  edit: { hr: "Uredi", en: "Edit" },
  view: { hr: "Pregledaj", en: "View" },
  
  // Error states
  errorTitle: { hr: "Ups! Nešto je pošlo po zlu", en: "Oops! Something went wrong" },
  errorDesc: { hr: "Došlo je do greške pri učitavanju podataka. Molimo pokušaj ponovno.", en: "There was an error loading the data. Please try again." },
  networkError: { hr: "Greška mreže", en: "Network Error" },
  networkErrorDesc: { hr: "Provjeri internetsku vezu i pokušaj ponovno.", en: "Check your internet connection and try again." },
} as const;

type TranslationKey = keyof typeof translations;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    // Try to get from localStorage, default to 'hr'
    const stored = localStorage.getItem("mojvis-locale");
    return (stored === "en" || stored === "hr") ? stored : "hr";
  });

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("mojvis-locale", newLocale);
  };

  const t = (key: TranslationKey): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[locale];
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export { translations };
