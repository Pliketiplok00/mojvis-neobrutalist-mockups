import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { ContentHeader } from "@/components/content/ContentHeader";
import { TextBlock } from "@/components/content/TextBlock";
import { HighlightBlock } from "@/components/content/HighlightBlock";
import { CardListBlock } from "@/components/content/CardListBlock";
import { Leaf } from "lucide-react";

// Mock CMS data
const pageData = {
  header: {
    title: "Flora of Vis",
    subtitle: "Discover the island's botanical treasures",
  },
  intro: {
    title: "Mediterranean Biodiversity",
    body: [
      "The island of Vis is home to over 1,000 plant species, many of which are endemic to the Dalmatian coast. The unique microclimate and isolated geography have preserved species found nowhere else in the world.",
      "From aromatic herbs on rocky hillsides to ancient olive groves and wild orchids in hidden valleys, Vis offers a remarkable journey through Mediterranean botany.",
    ],
  },
  highlight: {
    title: "Protected Species",
    body: "Several plant species on Vis are legally protected. Please observe all flora from paths and never pick or uproot any plants.",
    variant: "warning" as const,
  },
  categories: [
    {
      id: "herbs",
      title: "Aromatic Herbs",
      description: "Rosemary, lavender, sage, and thyme cover the hillsides with fragrance.",
      meta: "Common throughout",
    },
    {
      id: "trees",
      title: "Trees & Shrubs",
      description: "Ancient olive trees, carob, fig, and wild pomegranate dot the landscape.",
      meta: "Olive groves, valleys",
    },
    {
      id: "wildflowers",
      title: "Wildflowers",
      description: "Seasonal blooms including wild orchids, poppies, and Mediterranean iris.",
      meta: "Spring & early summer",
    },
    {
      id: "endemic",
      title: "Endemic Species",
      description: "Rare plants unique to Vis and the central Dalmatian islands.",
      meta: "Protected areas",
    },
  ],
  botanicalTip: {
    title: "Best Viewing Seasons",
    body: "Spring (April-May) offers the most spectacular wildflower displays. Autumn brings the olive harvest and aromatic herb flowering.",
    variant: "tip" as const,
  },
};

export default function FloraPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MobileFrame>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="flex flex-col pb-8">
        <ContentHeader
          title={pageData.header.title}
          subtitle={pageData.header.subtitle}
          icon={<Leaf className="h-6 w-6" strokeWidth={2.5} />}
        />

        <TextBlock
          title={pageData.intro.title}
          body={pageData.intro.body}
        />

        <HighlightBlock
          title={pageData.highlight.title}
          body={pageData.highlight.body}
          variant={pageData.highlight.variant}
        />

        <CardListBlock
          title="Plant Categories"
          cards={pageData.categories}
          columns={2}
        />

        <HighlightBlock
          title={pageData.botanicalTip.title}
          body={pageData.botanicalTip.body}
          variant={pageData.botanicalTip.variant}
        />
      </main>
    </MobileFrame>
  );
}
