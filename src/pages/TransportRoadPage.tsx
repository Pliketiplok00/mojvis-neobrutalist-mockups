import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Bus, AlertTriangle, ChevronRight, Clock, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Mock data for bus lines
const busLines = [
  { id: "vis-komiza", name: "Vis – Komiža – Vis", duration: "~25 min", stops: 4 },
  { id: "vis-marina", name: "Vis – Marina – Vis", duration: "~15 min", stops: 2 },
  { id: "vis-plisko", name: "Vis – Plisko Polje – Vis", duration: "~20 min", stops: 3 },
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
      <AppHeader title="CESTOVNI PRIJEVOZ" showBack onMenuClick={() => setMenuOpen(true)} />
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
            {busLines.map((line) => (
              <Card 
                key={line.id}
                variant="flat" 
                className="neo-border-heavy neo-shadow neo-hover overflow-hidden cursor-pointer"
                onClick={() => navigate(`/transport/road/${line.id}`)}
              >
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-secondary flex items-center justify-center border-r-[3px] border-foreground">
                    <Bus size={28} strokeWidth={2.5} className="text-white" />
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
                        {line.stops} stanica
                      </span>
                    </div>
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
                  <div className="w-16 h-10 bg-primary neo-border flex items-center justify-center">
                    <span className="font-display font-bold text-sm text-primary-foreground">{departure.time}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-sm">{departure.line}</p>
                    <p className="font-body text-xs text-muted-foreground">{departure.direction}</p>
                  </div>
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
