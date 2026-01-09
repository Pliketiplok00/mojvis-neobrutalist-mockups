/**
 * Transport Page V2
 * 
 * Combined transport hub for sea and road transport.
 * Uses original Mediterranean color palette.
 */

import { useState } from "react";
import { MobileFrameV2 } from "./components/MobileFrameV2";
import { AppHeaderV2 } from "./components/AppHeaderV2";
import { MainMenuV2 } from "./components/MainMenuV2";
import { useNavigate } from "react-router-dom";
import { Ship, Bus, AlertTriangle, ChevronRight, Clock } from "lucide-react";

const transportTypes = [
  { 
    id: "sea", 
    label: "POMORSKI", 
    sublabel: "Trajekti & Katamarani",
    icon: Ship,
    color: "hsl(180,45%,42%)",
    route: "/v2/transport/sea"
  },
  { 
    id: "road", 
    label: "CESTOVNI", 
    sublabel: "Autobusne linije",
    icon: Bus,
    color: "hsl(25,85%,55%)",
    route: "/v2/transport/road"
  },
];

export default function TransportPageV2() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MobileFrameV2>
      <AppHeaderV2 title="VOZNI RED" onMenuClick={() => setMenuOpen(true)} />
      <MainMenuV2 isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col min-h-screen bg-[hsl(45,30%,96%)]">
        {/* Header */}
        <div className="bg-[hsl(180,45%,42%)] p-5 border-b-[5px] border-[hsl(220,20%,10%)] flex items-center gap-4">
          <div className="w-16 h-16 bg-white border-[4px] border-[hsl(220,20%,10%)] shadow-[4px_4px_0_0_hsl(220,20%,10%)] flex items-center justify-center -rotate-3">
            <Clock className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black uppercase text-white">VOZNI RED</h1>
            <p className="font-body text-xs uppercase tracking-wider text-white/80">Trajekti & Autobusi</p>
          </div>
        </div>

        {/* Notice Banner */}
        <button 
          onClick={() => navigate("/v2/inbox/notice-1")}
          className="flex items-center gap-4 bg-[hsl(12,55%,50%)] p-4 border-b-[5px] border-[hsl(220,20%,10%)]"
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
          <h2 className="font-display text-xs font-black uppercase tracking-[0.2em] text-[hsl(220,10%,40%)]">
            ODABERI VRSTU PRIJEVOZA
          </h2>
          
          <div className="space-y-4">
            {transportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => navigate(type.route)}
                  className="w-full border-[5px] border-[hsl(220,20%,10%)] bg-white shadow-[8px_8px_0_0_hsl(220,20%,10%)] transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0_0_hsl(220,20%,10%)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none overflow-hidden"
                >
                  <div className="flex">
                    {/* Icon Area */}
                    <div 
                      className="w-28 flex flex-col items-center justify-center py-6 border-r-[5px] border-[hsl(220,20%,10%)]"
                      style={{ backgroundColor: type.color }}
                    >
                      <Icon className="w-14 h-14 text-white" strokeWidth={1.5} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-5 text-left flex flex-col justify-center">
                      <p className="font-display text-2xl font-black uppercase">{type.label}</p>
                      <p className="font-body text-sm text-[hsl(220,10%,40%)] mt-1">{type.sublabel}</p>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex items-center px-4 bg-[hsl(45,15%,90%)]">
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
          <div className="border-[4px] border-[hsl(220,20%,10%)] bg-white p-4">
            <p className="font-body text-sm text-center text-[hsl(220,10%,40%)]">
              Vozni redovi se automatski ažuriraju.<br/>
              Za hitne izmjene provjerite obavijesti.
            </p>
          </div>
        </div>
      </main>
    </MobileFrameV2>
  );
}
