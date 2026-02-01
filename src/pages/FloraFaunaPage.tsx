import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { ContentHeader } from "@/components/content/ContentHeader";
import { HighlightBlock } from "@/components/content/HighlightBlock";
import { Sprout, Leaf, Fish, ChevronRight } from "lucide-react";
import floraHerbsImg from "@/assets/flora-herbs.jpg";
import faunaDolphinsImg from "@/assets/fauna-dolphins.jpg";

export default function FloraFaunaPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="flex flex-col pb-8">
        <ContentHeader
          title="Flora & Fauna"
          subtitle="Prirodna baština otoka Visa"
          icon={<Sprout className="h-6 w-6" strokeWidth={2.5} />}
        />

        {/* Info Block */}
        <HighlightBlock
          title=""
          body="Vis je mali otok s velikom bioraznolikošću: od mirisne makije i vinograda do ptica na liticama i bogatog podmorja. Posebno je zanimljivo da na Visu nema otrovnih zmija, pa je istraživanje staza opušteno. A botanika je stvarno luda: na otoku je zabilježeno više od 870 biljnih vrsta, što ga čini jednim od najbogatijih botaničkih džepova Jadrana."
          variant="notice"
        />

        {/* Category Cards Section */}
        <section className="border-b-4 border-foreground p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center border-3 border-foreground bg-primary" style={{ borderWidth: "3px" }}>
              <Sprout className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <h2 className="font-display text-sm font-bold uppercase tracking-tight">
              Strogo Zaštićene Vrste
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Flora Card */}
            <button
              onClick={() => navigate("/flora")}
              className="group relative text-left"
            >
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
              <div className="relative border-4 border-foreground bg-background overflow-hidden transition-transform hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={floraHerbsImg}
                    alt="Zaštićene biljke otoka Visa"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-3 bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-primary" strokeWidth={2.5} />
                      <span className="font-display text-sm font-bold uppercase tracking-tight">
                        Flora
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
                  </div>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    Zaštićene biljke
                  </p>
                </div>
              </div>
            </button>

            {/* Fauna Card */}
            <button
              onClick={() => navigate("/fauna")}
              className="group relative text-left"
            >
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
              <div className="relative border-4 border-foreground bg-background overflow-hidden transition-transform hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={faunaDolphinsImg}
                    alt="Zaštićene životinje otoka Visa"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-3 bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fish className="h-4 w-4 text-secondary" strokeWidth={2.5} />
                      <span className="font-display text-sm font-bold uppercase tracking-tight">
                        Fauna
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
                  </div>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    Zaštićene životinje
                  </p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Geopark Info Block */}
        <HighlightBlock
          title="Geopark Viški Arhipelag"
          body="Vis i okolni otočići čine UNESCO Global Geopark zbog iznimne geološke raznolikosti: vrlo starih stijena, krškog reljefa, morskih špilja i rijetkih vulkanskih otočića (Brusnik i Jabuka). Krajolik Visa je 'učionica na otvorenom' — priča o nastanku Jadrana, pomicanju tla i oblikovanju obale."
          variant="info"
        />
      </main>
    </MobileFrame>
  );
}
