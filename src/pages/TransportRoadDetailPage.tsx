import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronRight, Clock, Phone, Calendar, ArrowLeftRight, Bus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

// Mock line data
const lineData: Record<string, {
  name: string;
  duration: string;
  directions: [string, string];
  stops: string[];
}> = {
  "vis-komiza": {
    name: "Vis – Komiža – Vis",
    duration: "~25 min",
    directions: ["Vis → Komiža", "Komiža → Vis"],
    stops: ["Vis (autobusni)", "Rukavac", "Podšpilje", "Komiža"]
  },
  "vis-marina": {
    name: "Vis – Marina – Vis",
    duration: "~15 min",
    directions: ["Vis → Marina", "Marina → Vis"],
    stops: ["Vis (centar)", "Marina"]
  },
  "vis-plisko": {
    name: "Vis – Plisko Polje – Vis",
    duration: "~20 min",
    directions: ["Vis → Plisko Polje", "Plisko Polje → Vis"],
    stops: ["Vis (autobusni)", "Podstražje", "Plisko Polje"]
  },
};

// Mock departures per direction
const departuresData: Record<string, Record<string, { time: string; note?: string }[]>> = {
  "vis-komiza": {
    "0": [
      { time: "06:30" },
      { time: "08:30" },
      { time: "10:45" },
      { time: "13:00" },
      { time: "15:30" },
      { time: "18:00" },
      { time: "20:30", note: "Samo radnim danom" },
    ],
    "1": [
      { time: "07:00" },
      { time: "09:00" },
      { time: "11:15" },
      { time: "13:30" },
      { time: "16:00" },
      { time: "18:30" },
      { time: "21:00", note: "Samo radnim danom" },
    ],
  },
  "vis-marina": {
    "0": [
      { time: "07:15" },
      { time: "12:00" },
      { time: "17:30" },
    ],
    "1": [
      { time: "07:45" },
      { time: "12:30" },
      { time: "18:00" },
    ],
  },
  "vis-plisko": {
    "0": [
      { time: "09:30" },
      { time: "14:00" },
      { time: "19:00" },
    ],
    "1": [
      { time: "10:00" },
      { time: "14:30" },
      { time: "19:30" },
    ],
  },
};

// Mock contacts
const contacts = [
  { name: "Autotrans Vis", phone: "+385 21 711 060" },
];

// Mock active notice
const activeNotice = null; // Set to object to show notice

export default function TransportRoadDetailPage() {
  const navigate = useNavigate();
  const { lineId } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDirection, setSelectedDirection] = useState(0);

  const line = lineData[lineId || "vis-komiza"] || lineData["vis-komiza"];
  const departures = departuresData[lineId || "vis-komiza"]?.[String(selectedDirection)] || [];

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('hr-HR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    }).toUpperCase();
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    // Don't allow past dates
    if (newDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(newDate);
    }
  };

  return (
    <MobileFrame>
      <AppHeader title={line.name.split(' – ')[0].toUpperCase()} showBack onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="p-4 space-y-6">
        {/* Active Notice Banner */}
        {activeNotice && (
          <button 
            onClick={() => navigate(`/inbox/notice-1`)}
            className="w-full bg-destructive neo-border-heavy p-4 flex items-center gap-4 neo-hover"
          >
            <AlertTriangle size={20} strokeWidth={2.5} className="text-white" />
            <span className="font-display font-bold text-sm text-white flex-1 text-left">OBAVIJEST O IZMJENI</span>
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
              </div>
            </div>
          </div>
        </Card>

        {/* Date Selector */}
        <Card variant="flat" className="neo-border-heavy p-4">
          <label className="font-display font-bold text-sm text-muted-foreground block mb-3">
            <Calendar size={16} strokeWidth={2.5} className="inline mr-2" />
            DATUM
          </label>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="neo-border-heavy font-display"
              onClick={() => changeDate(-1)}
              disabled={selectedDate <= new Date(new Date().setHours(0, 0, 0, 0))}
            >
              ←
            </Button>
            <div className="flex-1 bg-accent neo-border-heavy p-3 text-center">
              <span className="font-display font-bold">{formatDate(selectedDate)}</span>
            </div>
            <Button 
              variant="outline" 
              className="neo-border-heavy font-display"
              onClick={() => changeDate(1)}
            >
              →
            </Button>
          </div>
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
                Za odabrani datum nema predviđenih polazaka
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
                    <p className="font-display font-bold">{line.directions[selectedDirection]}</p>
                    {departure.note && (
                      <p className="font-body text-xs text-muted-foreground">{departure.note}</p>
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
