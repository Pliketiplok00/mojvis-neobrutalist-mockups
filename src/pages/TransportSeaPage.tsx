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
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col bg-muted/30">
        {/* Active Notice Banner */}
        {activeNotice && (
          <div className="relative border-b-4 border-foreground">
            <div className="absolute inset-0 translate-x-1 translate-y-1 bg-destructive" />
            <button 
              onClick={() => navigate(`/inbox/${activeNotice.id}`)}
              className="relative w-full bg-accent p-4 flex items-center gap-4 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
            >
              <div className="w-12 h-12 bg-destructive border-4 border-foreground flex items-center justify-center rotate-3">
                <AlertTriangle size={24} strokeWidth={2.5} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-display font-bold text-sm">{activeNotice.title}</p>
                <p className="font-body text-xs text-muted-foreground">{activeNotice.description}</p>
              </div>
              <ChevronRight size={24} strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Section Header */}
        <section className="border-b-4 border-foreground bg-primary p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-background border-4 border-foreground flex items-center justify-center -rotate-3">
              <Ship size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase text-primary-foreground">Pomorske linije</h1>
              <p className="font-body text-xs text-primary-foreground/80 uppercase tracking-widest">Trajekti i katamarani</p>
            </div>
          </div>
        </section>

        {/* Section A: Lines List */}
        <section className="p-5 bg-background border-b-4 border-foreground">
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 border-b-2 border-foreground pb-2">Linije</h2>
          <div className="space-y-4">
            {seaLines.map((line) => (
              <div key={line.id} className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
                <button
                  onClick={() => navigate(`/transport/sea/${line.id}`)}
                  className="relative w-full bg-background border-4 border-foreground p-0 text-left transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1"
                >
                  {/* Title bar with full-width route name */}
                  <div className={`w-full px-4 py-3 border-b-4 border-foreground flex items-center justify-between ${
                    line.type === "ferry" ? "bg-primary" : "bg-teal"
                  }`}>
                    <div className="flex items-center gap-3">
                      {line.type === "ferry" ? (
                        <Ship size={22} strokeWidth={2.5} className="text-white flex-shrink-0" />
                      ) : (
                        <Anchor size={22} strokeWidth={2.5} className="text-white flex-shrink-0" />
                      )}
                      <p className="font-display font-bold text-base uppercase text-white">{line.name}</p>
                    </div>
                    <div className="w-8 h-8 border-2 border-white/50 bg-white/20 flex items-center justify-center flex-shrink-0">
                      <ChevronRight size={18} strokeWidth={3} className="text-white" />
                    </div>
                  </div>
                  {/* Details row */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                        <Clock size={12} strokeWidth={2.5} />
                        {line.duration}
                      </span>
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                        <MapPin size={12} strokeWidth={2.5} />
                        {line.stops.length} luke
                      </span>
                    </div>
                    <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                      {line.stops.join(" → ")}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section B: Today's Departures */}
        <section className="p-5 bg-background border-b-4 border-foreground">
          <div className="flex items-center justify-between mb-4 border-b-2 border-foreground pb-2">
            <h2 className="font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">Današnji polasci</h2>
            <span className="bg-primary border-3 border-foreground px-3 py-1 font-display font-bold text-xs text-primary-foreground" style={{ borderWidth: "3px" }}>
              {new Date().toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' }).toUpperCase()}
            </span>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
            <div className="relative bg-background border-4 border-foreground max-h-64 overflow-y-auto">
              {todaysDepartures.map((departure, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-4 p-3 ${i !== todaysDepartures.length - 1 ? 'border-b-2 border-foreground' : ''}`}
                >
                  <div className={`w-16 h-10 border-3 border-foreground flex items-center justify-center ${
                    departure.type === "ferry" ? "bg-primary" : "bg-teal"
                  }`} style={{ borderWidth: "3px" }}>
                    <span className="font-display font-bold text-sm text-primary-foreground">{departure.time}</span>
                  </div>
                  <div className="flex-1">
                    {/* Direction only - line name hidden per spec */}
                    <p className="font-display font-bold text-sm">{departure.direction}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-display font-bold uppercase border-2 border-foreground ${
                    departure.type === "ferry" ? "bg-primary/20" : "bg-teal/20"
                  }`}>
                    {departure.type === "ferry" ? "Trajekt" : "Katamaran"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section C: Contacts */}
        <section className="p-5 pb-8 bg-muted/30">
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 border-b-2 border-foreground pb-2">Kontakti</h2>
          <div className="space-y-4">
            {contacts.map((contact, i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-primary" />
                <button
                  onClick={() => handleCall(contact.phone)}
                  className="relative w-full bg-background border-4 border-foreground p-4 text-left transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-accent border-4 border-foreground flex items-center justify-center rotate-3">
                      <Phone size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold uppercase">{contact.name}</p>
                      <p className="font-body text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </MobileFrame>
  );
}