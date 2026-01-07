import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { ContentHeader } from "@/components/content/ContentHeader";
import { TextBlock } from "@/components/content/TextBlock";
import { HighlightBlock } from "@/components/content/HighlightBlock";
import { CardListBlock } from "@/components/content/CardListBlock";
import { MediaBlock } from "@/components/content/MediaBlock";
import { Fish } from "lucide-react";
import faunaDolphinsImg from "@/assets/fauna-dolphins.jpg";
import faunaLizardImg from "@/assets/fauna-lizard.jpg";

// Mock CMS data
const pageData = {
  header: {
    title: "Fauna of Vis",
    subtitle: "Wildlife on land and in the Adriatic",
  },
  mediaImages: [
    { src: faunaDolphinsImg, alt: "Dolphins swimming in the Adriatic Sea near Vis" },
    { src: faunaLizardImg, alt: "Mediterranean lizard on ancient stone wall" },
  ],
  intro: {
    title: "Island Wildlife",
    body: [
      "Vis hosts a diverse array of wildlife adapted to its Mediterranean island environment. The surrounding Adriatic waters are particularly rich in marine life, while the island's rocky terrain provides habitat for unique reptiles and birds.",
      "The island's relative isolation has allowed many species to thrive undisturbed, making Vis an excellent destination for wildlife observation.",
    ],
  },
  marineHighlight: {
    title: "Marine Protected Areas",
    body: "The waters around Vis include protected zones where fishing is restricted. The famous Blue Cave area is home to rare corals and marine species.",
    variant: "info" as const,
  },
  categories: [
    {
      id: "marine",
      title: "Marine Life",
      description: "Dolphins, sea turtles, octopus, and over 150 fish species inhabit these waters.",
      meta: "Adriatic Sea",
    },
    {
      id: "birds",
      title: "Birdlife",
      description: "Eleonora's falcons, shearwaters, and various Mediterranean seabirds nest on cliffs.",
      meta: "Coastal cliffs",
    },
    {
      id: "reptiles",
      title: "Reptiles",
      description: "Endemic lizards, harmless snakes, and Mediterranean geckos thrive in rocky areas.",
      meta: "Stone walls, rocks",
    },
    {
      id: "insects",
      title: "Insects & Pollinators",
      description: "Colorful butterflies, cicadas, and various bee species support the island ecosystem.",
      meta: "Meadows, gardens",
    },
  ],
  warning: {
    title: "Wildlife Guidelines",
    body: "Do not feed or approach wild animals. When snorkeling or diving, avoid touching marine life or corals. Keep safe distance from nesting birds.",
    variant: "warning" as const,
  },
  divingTip: {
    title: "Best Wildlife Encounters",
    body: "Summer months offer the best diving visibility and dolphin sightings. Dawn and dusk are ideal for bird watching on coastal paths.",
    variant: "tip" as const,
  },
};

export default function FaunaPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MobileFrame>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="flex flex-col pb-8">
        <ContentHeader
          title={pageData.header.title}
          subtitle={pageData.header.subtitle}
          icon={<Fish className="h-6 w-6" strokeWidth={2.5} />}
        />

        <MediaBlock
          images={pageData.mediaImages}
          caption="Wildlife thrives in the Adriatic waters and rocky island terrain"
        />

        <TextBlock
          title={pageData.intro.title}
          body={pageData.intro.body}
        />

        <HighlightBlock
          title={pageData.marineHighlight.title}
          body={pageData.marineHighlight.body}
          variant={pageData.marineHighlight.variant}
        />

        <CardListBlock
          title="Wildlife Categories"
          cards={pageData.categories}
          columns={2}
        />

        <HighlightBlock
          title={pageData.warning.title}
          body={pageData.warning.body}
          variant={pageData.warning.variant}
        />

        <HighlightBlock
          title={pageData.divingTip.title}
          body={pageData.divingTip.body}
          variant={pageData.divingTip.variant}
        />
      </main>
    </MobileFrame>
  );
}
