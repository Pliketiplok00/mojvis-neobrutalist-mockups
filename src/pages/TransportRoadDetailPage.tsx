import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertTriangle, ChevronRight, Clock, Phone, CalendarIcon, ArrowLeftRight, Bus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Mock line data
const lineData: Record<string, {
  name: string;
  duration: string;
  directions: [string, string];
  stops: string[];
  isMultiStop: boolean;
}> = {
  "vis-komiza": {
    name: "Vis – Komiža – Vis",
    duration: "~25 min",
    directions: ["Vis → Komiža", "Komiža → Vis"],
    stops: ["Vis (autobusni)", "Rukavac", "Podšpilje", "Komiža"],
    isMultiStop: true
  },
  "vis-marina": {
    name: "Vis – Marina – Vis",
    duration: "~15 min",
    directions: ["Vis → Marina", "Marina → Vis"],
    stops: ["Vis (centar)", "Marina"],
    isMultiStop: false
  },
  "vis-plisko": {
    name: "Vis – Plisko Polje – Vis",
    duration: "~20 min",
    directions: ["Vis → Plisko Polje", "Plisko Polje → Vis"],
    stops: ["Vis (autobusni)", "Podstražje", "Plisko Polje"],
    isMultiStop: true
  },
};

// Mock departures per direction
const departuresData: Record<string, Record<string, { time: string; destination: string; via?: string }[]>> = {
  "vis-komiza": {
    "0": [
      { time: "06:30", destination: "Komiža", via: "Podšpilje" },
      { time: "08:30", destination: "Komiža", via: "Podšpilje" },
      { time: "10:45", destination: "Komiža", via: "Podšpilje" },
      { time: "13:00", destination: "Komiža", via: "Podšpilje" },
      { time: "15:30", destination: "Komiža", via: "Podšpilje" },
      { time: "18:00", destination: "Komiža", via: "Podšpilje" },
      { time: "20:30", destination: "Komiža", via: "Podšpilje" },
    ],
    "1": [
      { time: "07:00", destination: "Vis", via: "Podšpilje" },
      { time: "09:00", destination: "Vis", via: "Podšpilje" },
      { time: "11:15", destination: "Vis", via: "Podšpilje" },
      { time: "13:30", destination: "Vis", via: "Podšpilje" },
      { time: "16:00", destination: "Vis", via: "Podšpilje" },
      { time: "18:30", destination: "Vis", via: "Podšpilje" },
      { time: "21:00", destination: "Vis", via: "Podšpilje" },
    ],
  },
  "vis-marina": {
    "0": [
      { time: "07:15", destination: "Marina" },
      { time: "12:00", destination: "Marina" },
      { time: "17:30", destination: "Marina" },
    ],
    "1": [
      { time: "07:45", destination: "Vis" },
      { time: "12:30", destination: "Vis" },
      { time: "18:00", destination: "Vis" },
    ],
  },
  "vis-plisko": {
    "0": [
      { time: "09:30", destination: "Plisko Polje", via: "Podstražje" },
      { time: "14:00", destination: "Plisko Polje", via: "Podstražje" },
      { time: "19:00", destination: "Plisko Polje", via: "Podstražje" },
    ],
    "1": [
      { time: "10:00", destination: "Vis", via: "Podstražje" },
      { time: "14:30", destination: "Vis", via: "Podstražje" },
      { time: "19:30", destination: "Vis", via: "Podstražje" },
    ],
  },
};

// Mock contacts
const contacts = [
  { name: "Autotrans Vis", phone: "+385 21 711 060" },
];

// Mock active notice
const activeNotice = {
  id: "notice-1",
  title: "IZMJENA VOZNOG REDA",
  description: "Linija Vis-Komiža: privremena izmjena od 15.01."
};

export default function TransportRoadDetailPage() {
  const navigate = useNavigate();
  const { lineId } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDirection, setSelectedDirection] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const line = lineData[lineId || "vis-komiza"] || lineData["vis-komiza"];
  const departures = departuresData[lineId || "vis-komiza"]?.[String(selectedDirection)] || [];

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <MobileFrame>
      <AppHeader title="MOJ VIS" showBack onMenuClick={() => setMenuOpen(true)} />
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

        {/* Line Info Header */}
        <Card variant="flat" className="bg-secondary neo-border-heavy neo-shadow-lg p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 neo-border-heavy flex items-center justify-center">
              <Bus size={28} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-white">{line.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={14} strokeWidth={2.5} className="text-white/80" />
                <span className="font-body text-sm text-white/80">{line.duration}</span>
                {line.isMultiStop && (
                  <span className="bg-white/20 px-2 py-0.5 text-xs font-display text-white rounded">
                    VIŠE STANICA
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Date Selector - Calendar Picker */}
        <Card variant="flat" className="neo-border-heavy p-4">
          <label className="font-display font-bold text-sm text-muted-foreground block mb-3">
            <CalendarIcon size={16} strokeWidth={2.5} className="inline mr-2" />
            DATUM
          </label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="w-full bg-accent neo-border-heavy p-4 flex items-center justify-between neo-hover">
                <span className="font-display font-bold">
                  {format(selectedDate, "EEEE, d. MMMM yyyy.", { locale: hr }).toUpperCase()}
                </span>
                <CalendarIcon size={20} strokeWidth={2.5} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 neo-border-heavy" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                disabled={(date) => date < today}
                initialFocus
                locale={hr}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </Card>

        {/* Direction Toggle */}
        <Card variant="flat" className="neo-border-heavy p-4">
          <label className="font-display font-bold text-sm text-muted-foreground block mb-3">
            <ArrowLeftRight size={16} strokeWidth={2.5} className="inline mr-2" />
            SMJER
          </label>
          <div className="grid grid-cols-2 gap-0 neo-border-heavy overflow-hidden">
            {line.directions.map((direction, i) => (
              <button
                key={i}
                onClick={() => setSelectedDirection(i)}
                className={`p-4 font-display font-bold text-sm transition-colors ${
                  selectedDirection === i 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card hover:bg-muted'
                } ${i === 0 ? 'border-r-[3px] border-foreground' : ''}`}
              >
                {direction}
              </button>
            ))}
          </div>
        </Card>

        {/* Departures List */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Polasci</h2>
          
          {departures.length === 0 ? (
            <Card variant="flat" className="neo-border-heavy p-8 text-center">
              <Bus size={48} strokeWidth={2} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-display font-bold text-muted-foreground">NEMA POLAZAKA</p>
              <p className="font-body text-sm text-muted-foreground mt-2">
                Za odabrani datum nema predviđenih polazaka.
              </p>
            </Card>
          ) : (
            <Card variant="flat" className="neo-border-heavy overflow-hidden">
              {departures.map((departure, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-4 p-4 ${i !== departures.length - 1 ? 'border-b-2 border-foreground' : ''}`}
                >
                  <div className="w-20 h-12 bg-primary neo-border-heavy flex items-center justify-center">
                    <span className="font-display font-bold text-lg text-primary-foreground">{departure.time}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold">{departure.destination}</p>
                    {departure.via && (
                      <p className="font-body text-xs text-muted-foreground">via {departure.via}</p>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* Duration Info */}
        <Card variant="flat" className="neo-border p-3 bg-muted">
          <p className="font-body text-sm text-center text-muted-foreground">
            <Clock size={14} strokeWidth={2} className="inline mr-2" />
            Trajanje vožnje: <strong className="font-display">{line.duration}</strong>
          </p>
        </Card>

        {/* Contacts */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Kontakt</h2>
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
