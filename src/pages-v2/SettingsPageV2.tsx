/**
 * Settings Page V2 - Uses original Mediterranean colors
 */

import { useState } from "react";
import { MobileFrameV2 } from "./components/MobileFrameV2";
import { AppHeaderV2 } from "./components/AppHeaderV2";
import { MainMenuV2 } from "./components/MainMenuV2";
import { Globe, User, Building2, Check, Palette } from "lucide-react";

export default function SettingsPageV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<"hr" | "en">("hr");
  const [userMode, setUserMode] = useState<"visitor" | "local">("visitor");
  const [municipality, setMunicipality] = useState<"vis" | "komiza" | null>(null);

  return (
    <MobileFrameV2>
      <AppHeaderV2 title="POSTAVKE" onMenuClick={() => setMenuOpen(true)} />
      <MainMenuV2 isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col min-h-screen bg-[hsl(45,30%,96%)] p-5 space-y-5">
        {/* Language */}
        <div className="bg-white border-[4px] border-[hsl(220,20%,10%)] p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[hsl(210,80%,45%)] border-[4px] border-[hsl(220,20%,10%)] flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-display font-black uppercase">JEZIK</h3>
              <p className="font-body text-xs text-[hsl(220,10%,40%)]">Odaberi jezik aplikacije</p>
            </div>
          </div>
          <div className="flex border-[4px] border-[hsl(220,20%,10%)]">
            <button onClick={() => setLanguage("hr")}
              className={`flex-1 p-3 font-display font-black uppercase flex items-center justify-center gap-2 transition-colors ${language === "hr" ? "bg-[hsl(210,80%,45%)] text-white" : "bg-white hover:bg-[hsl(45,15%,90%)]"}`}>
              HRVATSKI{language === "hr" && <Check className="w-4 h-4" strokeWidth={3} />}
            </button>
            <div className="w-[4px] bg-[hsl(220,20%,10%)]" />
            <button onClick={() => setLanguage("en")}
              className={`flex-1 p-3 font-display font-black uppercase flex items-center justify-center gap-2 transition-colors ${language === "en" ? "bg-[hsl(210,80%,45%)] text-white" : "bg-white hover:bg-[hsl(45,15%,90%)]"}`}>
              ENGLISH{language === "en" && <Check className="w-4 h-4" strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* User Mode */}
        <div className="bg-white border-[4px] border-[hsl(220,20%,10%)] p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[hsl(160,45%,38%)] border-[4px] border-[hsl(220,20%,10%)] flex items-center justify-center">
              <User className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-display font-black uppercase">NAČIN KORIŠTENJA</h3>
              <p className="font-body text-xs text-[hsl(220,10%,40%)]">Posjetitelj ili stanovnik</p>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => { setUserMode("visitor"); setMunicipality(null); }}
              className={`w-full border-[4px] border-[hsl(220,20%,10%)] p-4 text-left flex items-center gap-4 transition-all ${
                userMode === "visitor" ? "bg-[hsl(210,80%,45%)] text-white shadow-[4px_4px_0_0_hsl(220,20%,10%)] -translate-x-1 -translate-y-1" : "bg-white hover:bg-[hsl(45,15%,90%)]"
              }`}>
              <div className="flex-1">
                <p className="font-display font-black">POSJETITELJ</p>
                <p className={`font-body text-xs ${userMode === "visitor" ? "text-white/80" : "text-[hsl(220,10%,40%)]"}`}>Opće obavijesti i događaji</p>
              </div>
              {userMode === "visitor" && <Check className="w-6 h-6" strokeWidth={3} />}
            </button>
            <button onClick={() => setUserMode("local")}
              className={`w-full border-[4px] border-[hsl(220,20%,10%)] p-4 text-left flex items-center gap-4 transition-all ${
                userMode === "local" ? "bg-[hsl(160,45%,38%)] text-white shadow-[4px_4px_0_0_hsl(220,20%,10%)] -translate-x-1 -translate-y-1" : "bg-white hover:bg-[hsl(45,15%,90%)]"
              }`}>
              <div className="flex-1">
                <p className="font-display font-black">LOKALNI STANOVNIK</p>
                <p className={`font-body text-xs ${userMode === "local" ? "text-white/80" : "text-[hsl(220,10%,40%)]"}`}>+ Općinske obavijesti</p>
              </div>
              {userMode === "local" && <Check className="w-6 h-6" strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* Municipality */}
        {userMode === "local" && (
          <div className="bg-white border-[4px] border-[hsl(220,20%,10%)] p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[hsl(180,45%,42%)] border-[4px] border-[hsl(220,20%,10%)] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-display font-black uppercase">OPĆINA</h3>
                <p className="font-body text-xs text-[hsl(220,10%,40%)]">Odaberi svoju općinu</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setMunicipality("vis")}
                className={`border-[4px] border-[hsl(220,20%,10%)] p-4 font-display font-black flex flex-col items-center gap-2 transition-all ${
                  municipality === "vis" ? "bg-[hsl(180,45%,42%)] text-white shadow-[4px_4px_0_0_hsl(220,20%,10%)]" : "bg-white hover:bg-[hsl(45,15%,90%)]"
                }`}>VIS{municipality === "vis" && <Check className="w-4 h-4" strokeWidth={3} />}</button>
              <button onClick={() => setMunicipality("komiza")}
                className={`border-[4px] border-[hsl(220,20%,10%)] p-4 font-display font-black flex flex-col items-center gap-2 transition-all ${
                  municipality === "komiza" ? "bg-[hsl(180,45%,42%)] text-white shadow-[4px_4px_0_0_hsl(220,20%,10%)]" : "bg-white hover:bg-[hsl(45,15%,90%)]"
                }`}>KOMIŽA{municipality === "komiza" && <Check className="w-4 h-4" strokeWidth={3} />}</button>
            </div>
          </div>
        )}

        {/* Theme */}
        <div className="bg-white border-[4px] border-[hsl(220,20%,10%)] p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-[hsl(45,92%,55%)] border-[4px] border-[hsl(220,20%,10%)] flex items-center justify-center">
            <Palette className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="font-display font-black uppercase">TEMA</p>
            <p className="font-body text-xs text-[hsl(220,10%,40%)]">Neobrutalist Mediterranean</p>
          </div>
        </div>

        {/* App Info */}
        <div className="border-[4px] border-[hsl(220,20%,10%)] bg-[hsl(220,20%,10%)] p-4 text-center">
          <p className="font-display font-black text-[hsl(45,30%,96%)]">MOJ VIS v3.0</p>
          <p className="font-body text-xs text-[hsl(45,30%,96%)]/60 mt-1">BOLD EDITION</p>
        </div>
      </main>
    </MobileFrameV2>
  );
}
