import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Clock, ArrowRight } from "lucide-react";

// Generate calendar data
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay() || 7;
  
  const days: (number | null)[] = [];
  
  for (let i = 1; i < startingDay; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

const eventsData: Record<string, { id: number; title: string; time: string; location: string }[]> = {
  "2026-01-07": [
    { id: 1, title: "Winter Market", time: "10:00 - 18:00", location: "Town Square" },
    { id: 2, title: "Local Band Concert", time: "20:00 - 23:00", location: "Community Center" },
  ],
  "2026-01-10": [
    { id: 3, title: "Wine Tasting", time: "17:00 - 20:00", location: "Local Winery" },
  ],
  "2026-01-15": [
    { id: 4, title: "Summer Festival", time: "19:00 - 00:00", location: "Vis Town Square" },
  ],
  "2026-01-18": [
    { id: 5, title: "Traditional Fishing Night", time: "20:00 - 23:00", location: "Komiža Harbor" },
  ],
  "2026-01-20": [
    { id: 6, title: "Art Exhibition Opening", time: "18:00 - 21:00", location: "Gallery Vis" },
  ],
  "2026-01-25": [
    { id: 7, title: "Folk Dance Workshop", time: "15:00 - 17:00", location: "Cultural Center" },
    { id: 8, title: "Sunset Yoga", time: "18:00 - 19:30", location: "Beach" },
  ],
};

export default function EventsCalendarPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  
  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(1);
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(1);
  };
  
  const formatDateKey = (day: number) => {
    const month = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${currentYear}-${month}-${dayStr}`;
  };
  
  const hasEvents = (day: number) => {
    return eventsData[formatDateKey(day)]?.length > 0;
  };
  
  const selectedDateKey = formatDateKey(selectedDay);
  const selectedEvents = eventsData[selectedDateKey] || [];

  return (
    <MobileFrame>
      <AppHeader title="Events" onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col">
        {/* Header */}
        <div className="border-b-4 border-foreground bg-primary p-5">
          <h2 className="font-display text-2xl font-bold uppercase text-primary-foreground">
            Events
          </h2>
          <p className="mt-1 font-body text-xs uppercase tracking-widest text-primary-foreground/80">
            Discover what is happening
          </p>
        </div>
        
        {/* Calendar */}
        <div className="border-b-4 border-foreground p-4">
          {/* Month Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={goToPrevMonth}
              className="flex h-11 w-11 items-center justify-center border-3 border-foreground bg-background transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              style={{ borderWidth: "3px" }}
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={3} />
            </button>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={goToNextMonth}
              className="flex h-11 w-11 items-center justify-center border-3 border-foreground bg-background transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              style={{ borderWidth: "3px" }}
            >
              <ChevronRight className="h-6 w-6" strokeWidth={3} />
            </button>
          </div>
          
          {/* Week Days Header */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => (
              <div key={i} className="py-2 text-center font-display text-xs font-bold uppercase text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }
              
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = day === selectedDay;
              const hasEvent = hasEvents(day);
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative aspect-square flex items-center justify-center border-2 font-display text-sm font-bold transition-all ${
                    isSelected
                      ? "border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))]"
                      : isToday
                      ? "border-foreground bg-accent"
                      : hasEvent
                      ? "border-foreground bg-secondary/50 hover:bg-secondary"
                      : "border-transparent hover:border-foreground hover:bg-muted"
                  }`}
                >
                  {day}
                  {hasEvent && !isSelected && (
                    <span className="absolute bottom-1 h-1.5 w-1.5 bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Selected Day Events */}
        <div className="p-4">
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {selectedDay} {monthNames[currentMonth]}
          </h3>
          
          {selectedEvents.length === 0 ? (
            <div className="border-3 border-dashed border-muted-foreground p-8 text-center" style={{ borderWidth: "3px" }}>
              <p className="font-display text-sm uppercase text-muted-foreground">No events for this day</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="flex items-center gap-4 border-3 border-foreground bg-background p-4 text-left transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  style={{ borderWidth: "3px" }}
                >
                  <div className="flex-1">
                    <h4 className="font-display font-bold uppercase">{event.title}</h4>
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4" strokeWidth={2.5} />
                        <span className="font-body">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-4 w-4" strokeWidth={2.5} />
                        <span className="font-body">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" strokeWidth={3} />
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </MobileFrame>
  );
}
