import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { ContentHeader } from "@/components/content/ContentHeader";
import { TextBlock } from "@/components/content/TextBlock";
import { HighlightBlock } from "@/components/content/HighlightBlock";
import { ContactBlock } from "@/components/content/ContactBlock";
import { LinkListBlock } from "@/components/content/LinkListBlock";
import { MediaBlock } from "@/components/content/MediaBlock";
import { Info, Phone, Ambulance, Flame, Anchor, AlertCircle } from "lucide-react";
import infoVisTownImg from "@/assets/info-vis-town.jpg";

// Mock CMS data
const pageData = {
  header: {
    title: "Informacije",
    subtitle: "Važni kontakti i korisni linkovi",
  },
  mediaImages: [
    { src: infoVisTownImg, alt: "Pogled iz zraka na luku grada Visa" },
  ],
  intro: {
    title: "O otoku",
    body: [
      "Vis je najudaljeniji naseljeni otok od hrvatskog kopna, udaljen 45 km od Splita. S oko 3.500 stanovnika, nudi autentično dalmatinsko iskustvo daleko od masovnog turizma.",
      "Otok ima dva glavna naselja: grad Vis na istočnoj obali i Komižu na zapadnoj obali. Oba nude osnovne usluge, restorane i smještaj.",
    ],
  },
  emergencyNumbers: [
    { icon: Phone, label: "Policija", number: "192", color: "bg-primary", textColor: "text-primary-foreground" },
    { icon: Flame, label: "Vatrogasci", number: "193", color: "bg-accent", textColor: "text-accent-foreground" },
    { icon: Anchor, label: "Spašavanje na moru", number: "195", color: "bg-secondary", textColor: "text-secondary-foreground" },
    { icon: AlertCircle, label: "Hitna pomoć", number: "112", color: "bg-destructive", textColor: "text-destructive-foreground" },
  ],
  contacts: [
    {
      id: "tourist-office-vis",
      name: "Turistička zajednica Vis",
      address: "Šetalište stare Isse 5, 21480 Vis",
      phones: ["+385 21 717 017"],
      email: "info@tz-vis.hr",
      workingHours: [
        { days: "Pon-Pet", hours: "08:00-14:00" },
        { days: "Sub-Ned", hours: "Zatvoreno" },
      ],
      note: "Produženo radno vrijeme tijekom ljetne sezone",
    },
    {
      id: "tourist-office-komiza",
      name: "Turistička zajednica Komiža",
      address: "Riva svetog Mikule 2, 21485 Komiža",
      phones: ["+385 21 713 455"],
      email: "info@tz-komiza.hr",
      workingHours: "Sezonsko radno vrijeme varira",
    },
    {
      id: "health-center",
      name: "Dom zdravlja Vis",
      address: "Put Mula 2, 21480 Vis",
      phones: ["+385 21 711 320", "+385 21 711 036"],
      workingHours: [
        { days: "Pon-Pet", hours: "07:00-20:00" },
        { days: "Sub", hours: "08:00-12:00" },
        { days: "Ned", hours: "Samo hitni slučajevi" },
      ],
    },
    {
      id: "pharmacy",
      name: "Ljekarna Vis",
      address: "Obala sv. Jurja 36, 21480 Vis",
      phones: ["+385 21 711 190"],
      workingHours: "Pon-Pet 07:30-19:00, Sub 08:00-12:00",
    },
    {
      id: "harbor-master",
      name: "Lučka kapetanija",
      address: "Obala sv. Jurja 25, 21480 Vis",
      phones: ["+385 21 711 162"],
      note: "Za pomorske hitne slučajeve i informacije o luci",
    },
  ],
  usefulLinks: [
    { id: "events", title: "Kalendar događanja", link: "/events" },
    { id: "transport-road", title: "Autobusni vozni red", link: "/transport/road" },
    { id: "transport-sea", title: "Trajekt i katamaran", link: "/transport/sea" },
    { id: "flora", title: "Flora otoka Visa", link: "/flora" },
    { id: "fauna", title: "Fauna otoka Visa", link: "/fauna" },
  ],
  externalLinks: [
    { id: "tz-croatia", title: "Hrvatska turistička zajednica", link: "https://croatia.hr", external: true },
    { id: "jadrolinija", title: "Jadrolinija (trajekti)", link: "https://jadrolinija.hr", external: true },
    { id: "weather", title: "Vremenska prognoza", link: "https://meteo.hr", external: true },
  ],
  infoTip: {
    title: "Lokalni savjeti",
    body: "Većina trgovina zatvara tijekom popodnevne pauze (13:00-17:00). Bankomati su dostupni u Visu i Komiži. Kartice se široko prihvaćaju, ali gotovina je korisna za manje objekte.",
    variant: "tip" as const,
  },
};

export default function InfoPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MobileFrame>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="flex flex-col pb-8">
        <ContentHeader
          title={pageData.header.title}
          subtitle={pageData.header.subtitle}
          icon={<Info className="h-6 w-6" strokeWidth={2.5} />}
        />

        <MediaBlock
          images={pageData.mediaImages}
          caption="Grad Vis - istočna vrata otoka"
        />

        <TextBlock
          title={pageData.intro.title}
          body={pageData.intro.body}
        />

        {/* Emergency Numbers Grid */}
        <section className="border-b-2 border-border bg-background p-5">
          <h3 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Hitni brojevi
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {pageData.emergencyNumbers.map((item) => (
              <a 
                key={item.number} 
                href={`tel:${item.number}`}
                className="relative block"
              >
                <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
                <div
                  className={`relative flex flex-col items-center justify-center gap-1 border-2 border-foreground ${item.color} ${item.textColor} p-4 transition-transform hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-1 active:translate-y-1`}
                >
                  <item.icon className="h-7 w-7" strokeWidth={2} />
                  <span className="font-display text-xs font-bold uppercase">{item.label}</span>
                  <span className="font-display text-2xl font-bold">{item.number}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <ContactBlock
          title="Važni kontakti"
          contacts={pageData.contacts}
        />

        <LinkListBlock
          title="Dijelovi aplikacije"
          links={pageData.usefulLinks}
        />

        <LinkListBlock
          title="External Links"
          links={pageData.externalLinks}
        />

        <HighlightBlock
          title={pageData.infoTip.title}
          body={pageData.infoTip.body}
          variant={pageData.infoTip.variant}
        />
      </main>
    </MobileFrame>
  );
}
