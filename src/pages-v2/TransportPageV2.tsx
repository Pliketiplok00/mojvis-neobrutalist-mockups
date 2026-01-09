/**
 * Transport Page V2
 * 
 * Hub for transport selection with bold type cards.
 */

import { useState } from "react";
import { MobileFrameV2 } from "./components/MobileFrameV2";
import { AppHeaderV2 } from "./components/AppHeaderV2";
import { MainMenuV2 } from "./components/MainMenuV2";
import { useNavigate } from "react-router-dom";
import { Ship, Bus, AlertTriangle, ChevronRight, Anchor, Navigation } from "lucide-react";

const transportTypes = [
  { 
    id: "sea", 
    label: "POMORSKI", 
    sublabel: "Trajekti & Katamarani",
    icon: Ship,
    secondIcon: Anchor,
    color: "hsl(175,55%,35%)",
    route: "/v2/transport/sea"
  },
  { 
    id: "road", 
    label: "CESTOVNI", 
    sublabel: "Autobusne linije",
    icon: Bus,
    secondIcon: Navigation,
    color: "hsl(28,90%,50%)",
    route: "/v2/transport/road"
  },
];

export default function TransportPageV2() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MobileFrameV2>
      <AppHeaderV2 title="PRIJEVOZ" onMenuClick={() => setMenuOpen(true)} />
      <MainMenuV2 isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col min-h-screen bg-[hsl(40,25%,92%)]">
        {/* Notice Banner */}
        <button 
          onClick={() => navigate("/v2/inbox/notice-1")}
          className="flex items-center gap-4 bg-[hsl(8,65%,42%)] p-4 border-b-[5px] border-[hsl(220,30%,8%)]"
        >
          <div className="w-10 h-10 bg-white/20 border-[3px] border-white/40 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-display text-sm font-black uppercase text-white">IZMJENA VOZNOG REDA</p>
            <p className="font-body text-xs text-white/80">Linija Vis-Komiža: privremena izmjena</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white" strokeWidth={3} />
        </button>

        {/* Transport Selection */}
        <div className="p-5 space-y-5">
          <h2 className="font-display text-xs font-black uppercase tracking-[0.2em] text-[hsl(220,15%,45%)]">
            ODABERI VRSTU PRIJEVOZA
          </h2>
          
          <div className="space-y-4">
            {transportTypes.map((type) => {
              const Icon = type.icon;
              const SecondIcon = type.secondIcon;
              return (
                <button
                  key={type.id}
                  onClick={() => navigate(type.route)}
                  className="w-full border-[5px] border-[hsl(220,30%,8%)] bg-white shadow-[8px_8px_0_0_hsl(220,30%,8%)] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_0_hsl(220,30%,8%)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none overflow-hidden"
                >
                  <div className="flex">
                    {/* Icon Area */}
                    <div 
                      className="w-28 flex flex-col items-center justify-center py-6 border-r-[5px] border-[hsl(220,30%,8%)] relative"
                      style={{ backgroundColor: type.color }}
                    >
                      <Icon className="w-14 h-14 text-white" strokeWidth={1.5} />
                      <SecondIcon className="w-6 h-6 text-white/60 absolute bottom-2 right-2" strokeWidth={2} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-5 text-left flex flex-col justify-center">
                      <p className="font-display text-2xl font-black uppercase">{type.label}</p>
                      <p className="font-body text-sm text-[hsl(220,15%,45%)] mt-1">{type.sublabel}</p>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex items-center px-4 bg-[hsl(40,12%,85%)]">
                      <ChevronRight className="w-8 h-8" strokeWidth={3} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="mt-auto p-5">
          <div className="border-[4px] border-[hsl(220,30%,8%)] bg-white p-4">
            <p className="font-body text-sm text-center text-[hsl(220,15%,45%)]">
              Vozni redovi se automatski ažuriraju.<br/>
              Za hitne izmjene provjerite obavijesti.
            </p>
          </div>
        </div>
      </main>
    </MobileFrameV2>
  );
}
