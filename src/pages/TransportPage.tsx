import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Ship, Bus, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const transportTypes = [
  { 
    id: "sea", 
    label: "POMORSKI PRIJEVOZ", 
    sublabel: "Trajekti i katamarani",
    icon: Ship, 
    color: "bg-primary",
    route: "/transport/sea"
  },
  { 
    id: "road", 
    label: "CESTOVNI PRIJEVOZ", 
    sublabel: "Autobusne linije",
    icon: Bus, 
    color: "bg-secondary",
    route: "/transport/road"
  },
];

// Mock active notice
const activeNotice = {
  id: "notice-1",
  title: "IZMJENA VOZNOG REDA",
  description: "Linija Vis-Komiža: privremena izmjena od 15.01.",
  type: "transport"
};

export default function TransportPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MobileFrame>
      <AppHeader title="VOZNI REDOVI" onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="p-4 space-y-6">
        {/* Active Notice Banner */}
        {activeNotice && (
          <button 
            onClick={() => navigate(`/inbox/${activeNotice.id}`)}
            className="w-full bg-destructive neo-border-heavy p-4 flex items-center gap-4 neo-hover"
          >
            <div className="w-10 h-10 bg-white/20 neo-border flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} strokeWidth={2.5} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-display font-bold text-sm text-white">{activeNotice.title}</p>
              <p className="font-body text-xs text-white/80">{activeNotice.description}</p>
            </div>
            <ChevronRight size={20} strokeWidth={2.5} className="text-white" />
          </button>
        )}

        {/* Transport Type Selection */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Odaberi vrstu prijevoza</h2>
          <div className="space-y-4">
            {transportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => navigate(type.route)}
                  className={`w-full ${type.color} neo-border-heavy neo-shadow-lg neo-hover p-0 overflow-hidden`}
                >
                  <div className="flex items-center">
                    <div className="w-24 h-24 bg-white/10 flex items-center justify-center border-r-[3px] border-foreground">
                      <Icon size={48} strokeWidth={2} className="text-white" />
                    </div>
                    <div className="flex-1 p-4 text-left">
                      <p className="font-display font-bold text-xl text-white">{type.label}</p>
                      <p className="font-body text-sm text-white/80">{type.sublabel}</p>
                    </div>
                    <ChevronRight size={28} strokeWidth={2.5} className="text-white mr-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Card */}
        <Card variant="flat" className="neo-border-heavy p-4">
          <p className="font-body text-sm text-muted-foreground text-center">
            Vozni redovi se automatski ažuriraju. Za hitne izmjene provjerite obavijesti.
          </p>
        </Card>
      </div>
    </MobileFrame>
  );
}
