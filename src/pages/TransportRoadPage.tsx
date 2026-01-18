import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Bus, AlertTriangle, ChevronRight, Clock, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Mock data for bus lines
const busLines = [
  { 
    id: "vis-komiza", 
    name: "Vis – Komiža – Vis", 
    duration: "~25 min", 
    stops: ["Vis (luka)", "Rukavac", "Podšpilje", "Komiža (centar)"]
  },
  { 
    id: "vis-marina", 
    name: "Vis – Marina – Vis", 
    duration: "~15 min", 
    stops: ["Vis (luka)", "Marina"]
  },
  { 
    id: "vis-plisko", 
    name: "Vis – Plisko Polje – Vis", 
    duration: "~20 min", 
    stops: ["Vis (luka)", "Dračevo Polje", "Plisko Polje"]
  },
];

// Mock today's departures (aggregated from all lines)
const todaysDepartures = [
  { time: "06:30", line: "Vis – Komiža", direction: "Vis → Komiža" },
  { time: "07:15", line: "Vis – Marina", direction: "Vis → Marina" },
  { time: "08:00", line: "Vis – Komiža", direction: "Komiža → Vis" },
  { time: "09:30", line: "Vis – Plisko Polje", direction: "Vis → Plisko Polje" },
  { time: "10:45", line: "Vis – Komiža", direction: "Vis → Komiža" },
  { time: "12:00", line: "Vis – Marina", direction: "Marina → Vis" },
  { time: "14:30", line: "Vis – Komiža", direction: "Komiža → Vis" },
  { time: "16:00", line: "Vis – Plisko Polje", direction: "Plisko Polje → Vis" },
];

// Mock contacts
const contacts = [
  { name: "Autotrans Vis", phone: "+385 21 711 060" },
  { name: "Info punkt Vis", phone: "+385 21 717 017" },
];

// Mock active notice
const activeNotice = {
  id: "notice-1",
  title: "IZMJENA VOZNOG REDA",
  description: "Linija Vis-Komiža: privremena izmjena od 15.01."
};

export default function TransportRoadPage() {
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
        <section className="border-b-4 border-foreground bg-secondary p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-background border-4 border-foreground flex items-center justify-center -rotate-3">
              <Bus size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase text-secondary-foreground">Autobusne linije</h1>
              <p className="font-body text-xs text-secondary-foreground/80 uppercase tracking-widest">Otočni prijevoz</p>
            </div>
          </div>
        </section>

        {/* Section A: Lines List */}
        <section className="p-5 bg-background border-b-4 border-foreground">
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 border-b-2 border-foreground pb-2">Linije</h2>
          <div className="space-y-4">
            {busLines.map((line, index) => (
              <div key={line.id} className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
                <button
                  onClick={() => navigate(`/transport/road/${line.id}`)}
                  className="relative w-full bg-background border-4 border-foreground p-0 text-left transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1"
                >
                  {/* Title bar with full-width route name */}
                  <div className={`w-full ${index % 2 === 0 ? 'bg-primary' : 'bg-secondary'} px-4 py-3 border-b-4 border-foreground flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <Bus size={22} strokeWidth={2.5} className="text-white flex-shrink-0" />
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
                        {line.stops.length} stanica
                      </span>
                    </div>
                    <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                      {line.stops.length <= 5 
                        ? line.stops.join(" → ") 
                        : `${line.stops.slice(0, 5).join(" → ")} +${line.stops.length - 5} stanica`
                      }
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
                  <div className="w-16 h-10 bg-primary border-3 border-foreground flex items-center justify-center" style={{ borderWidth: "3px" }}>
                    <span className="font-display font-bold text-sm text-primary-foreground">{departure.time}</span>
                  </div>
                  <div className="flex-1">
                    {/* Direction only - line name hidden per spec */}
                    <p className="font-display font-bold text-sm">{departure.direction}</p>
                  </div>
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
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-secondary" />
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
