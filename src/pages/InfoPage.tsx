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
import { Info } from "lucide-react";
import infoVisTownImg from "@/assets/info-vis-town.jpg";

// Mock CMS data
const pageData = {
  header: {
    title: "Information",
    subtitle: "Essential contacts & useful links",
  },
  mediaImages: [
    { src: infoVisTownImg, alt: "Aerial view of Vis town harbor" },
  ],
  intro: {
    title: "About the Island",
    body: [
      "Vis is the farthest inhabited island from the Croatian mainland, located 45 km from Split. With a population of around 3,500, it offers an authentic Dalmatian experience away from mass tourism.",
      "The island has two main settlements: Vis town on the eastern coast and Komiža on the western coast. Both offer essential services, restaurants, and accommodation.",
    ],
  },
  emergencyNotice: {
    title: "Emergency Numbers",
    body: "Police: 192 • Ambulance: 194 • Fire: 193 • Sea Rescue: 195 • General Emergency: 112",
    variant: "warning" as const,
  },
  contacts: [
    {
      id: "tourist-office-vis",
      name: "Tourist Office Vis",
      address: "Šetalište stare Isse 5, 21480 Vis",
      phones: ["+385 21 717 017"],
      email: "info@tz-vis.hr",
      workingHours: [
        { days: "Mon-Fri", hours: "08:00-14:00" },
        { days: "Sat-Sun", hours: "Closed" },
      ],
      note: "Extended hours during summer season",
    },
    {
      id: "tourist-office-komiza",
      name: "Tourist Office Komiža",
      address: "Riva svetog Mikule 2, 21485 Komiža",
      phones: ["+385 21 713 455"],
      email: "info@tz-komiza.hr",
      workingHours: "Seasonal hours vary",
    },
    {
      id: "health-center",
      name: "Health Center Vis",
      address: "Put Mula 2, 21480 Vis",
      phones: ["+385 21 711 320", "+385 21 711 036"],
      workingHours: [
        { days: "Mon-Fri", hours: "07:00-20:00" },
        { days: "Sat", hours: "08:00-12:00" },
        { days: "Sun", hours: "Emergency only" },
      ],
    },
    {
      id: "pharmacy",
      name: "Pharmacy Vis",
      address: "Obala sv. Jurja 36, 21480 Vis",
      phones: ["+385 21 711 190"],
      workingHours: "Mon-Fri 07:30-19:00, Sat 08:00-12:00",
    },
    {
      id: "harbor-master",
      name: "Harbor Master's Office",
      address: "Obala sv. Jurja 25, 21480 Vis",
      phones: ["+385 21 711 162"],
      note: "For maritime emergencies and port information",
    },
  ],
  usefulLinks: [
    { id: "events", title: "Events Calendar", link: "/events" },
    { id: "transport-road", title: "Bus Schedules", link: "/transport/road" },
    { id: "transport-sea", title: "Ferry & Catamaran", link: "/transport/sea" },
    { id: "flora", title: "Flora of Vis", link: "/flora" },
    { id: "fauna", title: "Fauna of Vis", link: "/fauna" },
  ],
  externalLinks: [
    { id: "tz-croatia", title: "Croatian National Tourist Board", link: "https://croatia.hr", external: true },
    { id: "jadrolinija", title: "Jadrolinija (Ferries)", link: "https://jadrolinija.hr", external: true },
    { id: "weather", title: "Weather Forecast", link: "https://meteo.hr", external: true },
  ],
  infoTip: {
    title: "Local Tips",
    body: "Most shops close for afternoon siesta (13:00-17:00). ATMs are available in both Vis and Komiža. Credit cards are widely accepted but cash is useful for smaller establishments.",
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
          caption="Vis town - the eastern gateway to the island"
        />

        <TextBlock
          title={pageData.intro.title}
          body={pageData.intro.body}
        />

        <HighlightBlock
          title={pageData.emergencyNotice.title}
          body={pageData.emergencyNotice.body}
          variant={pageData.emergencyNotice.variant}
        />

        <ContactBlock
          title="Important Contacts"
          contacts={pageData.contacts}
        />

        <LinkListBlock
          title="App Sections"
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
