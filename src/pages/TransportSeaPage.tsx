import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Ship, AlertTriangle, ChevronRight, Clock, Phone, MapPin, Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Mock data for ferry/catamaran lines
const seaLines = [
  { 
    id: "split-vis-ferry", 
    name: "Split – Vis (trajekt)", 
    type: "ferry",
    duration: "~2h 20min", 
    stops: ["Split", "Vis"]
  },
  { 
    id: "split-vis-catamaran", 
    name: "Split – Vis (katamaran)", 
    type: "catamaran",
    duration: "~1h 20min", 
    stops: ["Split", "Vis"]
  },
  { 
    id: "split-hvar-vis", 
    name: "Split – Hvar – Vis (katamaran)", 
    type: "catamaran",
    duration: "~2h 10min", 
    stops: ["Split", "Hvar", "Vis"]
  },
];

// Mock today's departures (aggregated from all lines)
const todaysDepartures = [
  { time: "06:00", line: "Split – Vis", type: "ferry", direction: "Split → Vis" },
  { time: "07:30", line: "Split – Vis", type: "catamaran", direction: "Split → Vis" },
  { time: "09:00", line: "Split – Vis", type: "ferry", direction: "Vis → Split" },
  { time: "14:30", line: "Split – Hvar – Vis", type: "catamaran", direction: "Split → Vis" },
  { time: "16:00", line: "Split – Vis", type: "ferry", direction: "Split → Vis" },
  { time: "17:30", line: "Split – Vis", type: "catamaran", direction: "Vis → Split" },
  { time: "19:00", line: "Split – Vis", type: "ferry", direction: "Vis → Split" },
];

// Mock contacts
const contacts = [
  { name: "Jadrolinija", phone: "+385 21 338 333" },
  { name: "Lučka kapetanija Vis", phone: "+385 21 711 010" },
];

// Mock active notice
const activeNotice = {
  id: "notice-sea-1",
  title: "UPOZORENJE: NEVRIJEME",
  description: "Moguća otkazivanja linija zbog jakog juga."
};

export default function TransportSeaPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  return (
    <MobileFrame>
      <AppHeader title="MOJ VIS" onMenuClick={() => setMenuOpen(true)} />
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

        {/* Section A: Lines List */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Linije</h2>
          <div className="space-y-3">
            {seaLines.map((line) => (
              <Card 
                key={line.id}
                variant="flat" 
                className="neo-border-heavy neo-shadow neo-hover overflow-hidden cursor-pointer"
                onClick={() => navigate(`/transport/sea/${line.id}`)}
              >
                <div className="flex items-center">
                  <div className={`w-16 h-16 flex items-center justify-center border-r-[3px] border-foreground ${
                    line.type === "ferry" ? "bg-primary" : "bg-teal"
                  }`}>
                    {line.type === "ferry" ? (
                      <Ship size={28} strokeWidth={2.5} className="text-white" />
                    ) : (
                      <Anchor size={28} strokeWidth={2.5} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1 p-4">
                    <p className="font-display font-bold">{line.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 font-body text-sm text-muted-foreground">
                        <Clock size={14} strokeWidth={2} />
                        {line.duration}
                      </span>
                      <span className="flex items-center gap-1 font-body text-sm text-muted-foreground">
                        <MapPin size={14} strokeWidth={2} />
                        {line.stops.length} luke
                      </span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      {line.stops.join(" → ")}
                    </p>
                  </div>
                  <ChevronRight size={24} strokeWidth={2.5} className="text-muted-foreground mr-4" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Section B: Today's Departures */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl uppercase">Današnji polasci</h2>
            <span className="bg-accent neo-border px-2 py-1 font-display font-bold text-xs">
              {new Date().toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' }).toUpperCase()}
            </span>
          </div>
          
          <Card variant="flat" className="neo-border-heavy overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {todaysDepartures.map((departure, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-4 p-3 ${i !== todaysDepartures.length - 1 ? 'border-b-2 border-foreground' : ''}`}
                >
                  <div className={`w-16 h-10 neo-border flex items-center justify-center ${
                    departure.type === "ferry" ? "bg-primary" : "bg-teal"
                  }`}>
                    <span className="font-display font-bold text-sm text-primary-foreground">{departure.time}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-sm">{departure.line}</p>
                    <p className="font-body text-xs text-muted-foreground">{departure.direction}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-display uppercase ${
                    departure.type === "ferry" ? "bg-primary/20" : "bg-teal/20"
                  }`}>
                    {departure.type === "ferry" ? "Trajekt" : "Katamaran"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Section C: Contacts */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Kontakti</h2>
          <div className="space-y-3">
            {contacts.map((contact, i) => (
              <Card 
                key={i}
                variant="flat" 
                className="neo-border-heavy neo-hover p-4 cursor-pointer"
                onClick={() => handleCall(contact.phone)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent neo-border-heavy flex items-center justify-center">
                    <Phone size={24} strokeWidth={2.5} className="text-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold">{contact.name}</p>
                    <p className="font-body text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}