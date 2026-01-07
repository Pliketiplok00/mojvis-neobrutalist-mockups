import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, ChevronRight, ChevronDown, Clock, Phone, CalendarIcon, ArrowLeftRight, Bus, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { format, addMinutes } from "date-fns";
import { hr } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Types
interface Stop {
  name: string;
  offset: number; // minutes from departure
}

interface Pattern {
  id: string;
  stops: Stop[];
  duration: string;
}

interface LineData {
  name: string;
  directions: [string, string];
  patterns: Record<string, Pattern>;
  defaultPattern: string;
}

interface Departure {
  time: string;
  patternId: string;
}

// Mock line data with patterns
const lineData: Record<string, LineData> = {
  "vis-komiza": {
    name: "Vis – Komiža – Vis",
    directions: ["Vis → Komiža", "Komiža → Vis"],
    defaultPattern: "base",
    patterns: {
      "base": {
        id: "base",
        duration: "~25 min",
        stops: [
          { name: "Vis (luka)", offset: 0 },
          { name: "Rukavac", offset: 8 },
          { name: "Podšpilje", offset: 15 },
          { name: "Komiža (centar)", offset: 25 },
        ]
      }
    }
  },
  "vis-marina": {
    name: "Vis – Marina – Vis",
    directions: ["Vis → Marina", "Marina → Vis"],
    defaultPattern: "base",
    patterns: {
      "base": {
        id: "base",
        duration: "~15 min",
        stops: [
          { name: "Vis (centar)", offset: 0 },
          { name: "Marina", offset: 15 },
        ]
      }
    }
  },
  "vis-plisko": {
    name: "Vis – Plisko Polje – Vis",
    directions: ["Vis → Plisko Polje", "Plisko Polje → Vis"],
    defaultPattern: "base",
    patterns: {
      "base": {
        id: "base",
        duration: "~20 min",
        stops: [
          { name: "Vis (autobusni)", offset: 0 },
          { name: "Podstražje", offset: 10 },
          { name: "Plisko Polje", offset: 20 },
        ]
      }
    }
  },
};

// Mock departures per line per direction
const departuresData: Record<string, Record<string, Departure[]>> = {
  "vis-komiza": {
    "0": [
      { time: "06:30", patternId: "base" },
      { time: "08:30", patternId: "base" },
      { time: "10:45", patternId: "base" },
      { time: "13:00", patternId: "base" },
      { time: "15:30", patternId: "base" },
      { time: "18:00", patternId: "base" },
      { time: "20:30", patternId: "base" },
      { time: "23:45", patternId: "base" }, // Late departure to test +1 day
    ],
    "1": [
      { time: "07:00", patternId: "base" },
      { time: "09:00", patternId: "base" },
      { time: "11:15", patternId: "base" },
      { time: "13:30", patternId: "base" },
      { time: "16:00", patternId: "base" },
      { time: "18:30", patternId: "base" },
      { time: "21:00", patternId: "base" },
    ],
  },
  "vis-marina": {
    "0": [
      { time: "07:15", patternId: "base" },
      { time: "12:00", patternId: "base" },
      { time: "17:30", patternId: "base" },
    ],
    "1": [
      { time: "07:45", patternId: "base" },
      { time: "12:30", patternId: "base" },
      { time: "18:00", patternId: "base" },
    ],
  },
  "vis-plisko": {
    "0": [
      { time: "09:30", patternId: "base" },
      { time: "14:00", patternId: "base" },
      { time: "19:00", patternId: "base" },
    ],
    "1": [
      { time: "10:00", patternId: "base" },
      { time: "14:30", patternId: "base" },
      { time: "19:30", patternId: "base" },
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

// Helper: parse "HH:mm" to minutes since midnight
function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper: calculate stop time and check if next day
function calculateStopTime(departureTime: string, offsetMinutes: number): { time: string; nextDay: boolean } {
  const depMinutes = parseTime(departureTime);
  const arrivalMinutes = depMinutes + offsetMinutes;
  const nextDay = arrivalMinutes >= 24 * 60;
  const normalizedMinutes = arrivalMinutes % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  return {
    time: `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    nextDay
  };
}

// Get reversed stops for opposite direction
function getDirectionalStops(stops: Stop[], direction: number): Stop[] {
  if (direction === 0) return stops;
  // Reverse stops and recalculate offsets
  const totalDuration = stops[stops.length - 1].offset;
  return [...stops].reverse().map((stop, i, arr) => ({
    name: stop.name,
    offset: i === 0 ? 0 : totalDuration - arr[arr.length - 1 - i].offset
  }));
}

export default function TransportRoadDetailPage() {
  const navigate = useNavigate();
  const { lineId } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDirection, setSelectedDirection] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [expandedDeparture, setExpandedDeparture] = useState<number | null>(null);

  const line = lineData[lineId || "vis-komiza"] || lineData["vis-komiza"];
  const departures = departuresData[lineId || "vis-komiza"]?.[String(selectedDirection)] || [];
  const defaultPattern = line.patterns[line.defaultPattern];
  const isMultiStop = defaultPattern.stops.length > 2;

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <MobileFrame>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
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
                <span className="font-body text-sm text-white/80">{defaultPattern.duration}</span>
                {isMultiStop && (
                  <span className="bg-white/20 px-2 py-0.5 text-xs font-display text-white rounded">
                    {defaultPattern.stops.length} STANICA
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
                onClick={() => {
                  setSelectedDirection(i);
                  setExpandedDeparture(null);
                }}
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
              {departures.map((departure, i) => {
                const pattern = line.patterns[departure.patternId] || defaultPattern;
                const stops = getDirectionalStops(pattern.stops, selectedDirection);
                const finalStop = stops[stops.length - 1];
                const isExpanded = expandedDeparture === i;

                return (
                  <Collapsible
                    key={i}
                    open={isExpanded}
                    onOpenChange={(open) => setExpandedDeparture(open ? i : null)}
                  >
                    <div className={`${i !== departures.length - 1 ? 'border-b-2 border-foreground' : ''}`}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center gap-4 p-4 neo-hover text-left">
                          <div className="w-20 h-12 bg-primary neo-border-heavy flex items-center justify-center flex-shrink-0">
                            <span className="font-display font-bold text-lg text-primary-foreground">{departure.time}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold truncate">{finalStop.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-body text-xs text-muted-foreground">{pattern.duration}</span>
                              {isMultiStop && (
                                <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                                  <MapPin size={12} strokeWidth={2} />
                                  {stops.length} stanica
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronDown 
                            size={20} 
                            strokeWidth={2.5} 
                            className={cn(
                              "text-muted-foreground transition-transform flex-shrink-0",
                              isExpanded && "rotate-180"
                            )} 
                          />
                        </button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="bg-muted border-t-2 border-foreground px-4 py-3">
                          <div className="space-y-0">
                            {stops.map((stop, stopIdx) => {
                              const { time, nextDay } = calculateStopTime(departure.time, stop.offset);
                              const isFirst = stopIdx === 0;
                              const isLast = stopIdx === stops.length - 1;

                              return (
                                <div key={stopIdx} className="flex items-start gap-3">
                                  {/* Timeline */}
                                  <div className="flex flex-col items-center w-4">
                                    <div className={cn(
                                      "w-3 h-3 rounded-full border-2 border-foreground",
                                      (isFirst || isLast) ? "bg-primary" : "bg-background"
                                    )} />
                                    {!isLast && (
                                      <div className="w-0.5 h-6 bg-foreground/30" />
                                    )}
                                  </div>
                                  
                                  {/* Stop info */}
                                  <div className="flex-1 pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-display font-bold text-sm">{time}</span>
                                      {nextDay && (
                                        <span className="text-xs font-body text-muted-foreground">(+1 dan)</span>
                                      )}
                                    </div>
                                    <p className={cn(
                                      "font-body text-sm",
                                      (isFirst || isLast) ? "font-semibold" : "text-muted-foreground"
                                    )}>
                                      {stop.name}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </Card>
          )}
        </div>

        {/* Duration Info */}
        <Card variant="flat" className="neo-border p-3 bg-muted">
          <p className="font-body text-sm text-center text-muted-foreground">
            <Clock size={14} strokeWidth={2} className="inline mr-2" />
            Trajanje vožnje: <strong className="font-display">{defaultPattern.duration}</strong>
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
