/**
 * Events Calendar Page V2
 * 
 * Bold calendar with geometric date blocks and
 * color-coded event indicators.
 */

import { useState } from "react";
import { MobileFrameV2 } from "./components/MobileFrameV2";
import { AppHeaderV2 } from "./components/AppHeaderV2";
import { MainMenuV2 } from "./components/MainMenuV2";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";

const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay() || 7;
  
  const days: (number | null)[] = [];
  for (let i = 1; i < startingDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
};

const monthNames = ["SIJEČANJ", "VELJAČA", "OŽUJAK", "TRAVANJ", "SVIBANJ", "LIPANJ", "SRPANJ", "KOLOVOZ", "RUJAN", "LISTOPAD", "STUDENI", "PROSINAC"];
const weekDays = ["P", "U", "S", "Č", "P", "S", "N"];

const eventsData: Record<string, { id: number; title: string; time: string; location: string; color: string }[]> = {
  "2026-01-09": [
    { id: 1, title: "ZIMSKI SAJAM", time: "10:00 - 18:00", location: "Gradski trg", color: "hsl(150,55%,28%)" },
  ],
  "2026-01-15": [
    { id: 2, title: "KONCERT", time: "20:00 - 23:00", location: "Dom kulture", color: "hsl(280,40%,65%)" },
  ],
  "2026-01-20": [
    { id: 3, title: "DEGUSTACIJA VINA", time: "17:00 - 20:00", location: "Vinarija", color: "hsl(8,65%,42%)" },
  ],
  "2026-01-25": [
    { id: 4, title: "RADIONICA FOLKLORA", time: "15:00 - 17:00", location: "Kulturni centar", color: "hsl(28,90%,50%)" },
    { id: 5, title: "JOGA NA PLAŽI", time: "18:00", location: "Plaža", color: "hsl(175,55%,35%)" },
  ],
};

export default function EventsCalendarPageV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  
  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  
  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
    setSelectedDay(1);
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
    setSelectedDay(1);
  };
  
  const formatDateKey = (day: number) => {
    const month = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${currentYear}-${month}-${dayStr}`;
  };
  
  const hasEvents = (day: number) => eventsData[formatDateKey(day)]?.length > 0;
  const selectedEvents = eventsData[formatDateKey(selectedDay)] || [];

  return (
    <MobileFrameV2>
      <AppHeaderV2 onMenuClick={() => setMenuOpen(true)} />
      <MainMenuV2 isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-[hsl(220,85%,35%)] p-5 border-b-[5px] border-[hsl(220,30%,8%)]">
          <h2 className="font-display text-3xl font-black uppercase text-white">DOGAĐAJI</h2>
          <p className="font-body text-xs uppercase tracking-[0.2em] text-white/70 mt-1">Kalendar aktivnosti</p>
        </div>
        
        {/* Calendar */}
        <div className="bg-white p-4 border-b-[5px] border-[hsl(220,30%,8%)]">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevMonth}
              className="w-12 h-12 bg-[hsl(40,25%,92%)] border-[4px] border-[hsl(220,30%,8%)] flex items-center justify-center transition-all hover:bg-[hsl(38,95%,50%)] hover:shadow-[4px_4px_0_0_hsl(220,30%,8%)]"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={3} />
            </button>
            <div className="text-center">
              <h3 className="font-display text-xl font-black uppercase">{monthNames[currentMonth]}</h3>
              <p className="font-body text-xs text-[hsl(220,15%,45%)]">{currentYear}</p>
            </div>
            <button
              onClick={goToNextMonth}
              className="w-12 h-12 bg-[hsl(40,25%,92%)] border-[4px] border-[hsl(220,30%,8%)] flex items-center justify-center transition-all hover:bg-[hsl(38,95%,50%)] hover:shadow-[4px_4px_0_0_hsl(220,30%,8%)]"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={3} />
            </button>
          </div>
          
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, i) => (
              <div key={i} className="py-2 text-center font-display text-xs font-black uppercase text-[hsl(220,15%,45%)]">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} className="aspect-square" />;
              
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = day === selectedDay;
              const hasEvent = hasEvents(day);
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative aspect-square flex items-center justify-center font-display text-sm font-bold transition-all border-[3px] ${
                    isSelected
                      ? "bg-[hsl(220,85%,35%)] text-white border-[hsl(220,30%,8%)] shadow-[3px_3px_0_0_hsl(38,95%,50%)] -translate-x-0.5 -translate-y-0.5"
                      : isToday
                      ? "bg-[hsl(38,95%,50%)] border-[hsl(220,30%,8%)]"
                      : hasEvent
                      ? "bg-[hsl(40,25%,92%)] border-[hsl(220,30%,8%)] hover:bg-[hsl(38,95%,85%)]"
                      : "border-transparent hover:border-[hsl(220,30%,8%)] hover:bg-[hsl(40,12%,85%)]"
                  }`}
                >
                  {day}
                  {hasEvent && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[hsl(220,85%,35%)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Selected Day Events */}
        <div className="flex-1 p-4 bg-[hsl(40,25%,92%)]">
          <h3 className="font-display text-xs font-black uppercase tracking-[0.2em] text-[hsl(220,15%,45%)] mb-4">
            {selectedDay} {monthNames[currentMonth]}
          </h3>
          
          {selectedEvents.length === 0 ? (
            <div className="border-[4px] border-dashed border-[hsl(220,15%,45%)] p-8 text-center bg-white">
              <p className="font-display text-sm uppercase text-[hsl(220,15%,45%)]">Nema događaja za ovaj dan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => navigate(`/v2/events/${event.id}`)}
                  className="w-full flex items-stretch bg-white border-[4px] border-[hsl(220,30%,8%)] transition-all hover:translate-x-[-2px] hover:shadow-[4px_4px_0_0_hsl(220,30%,8%)] overflow-hidden"
                >
                  <div 
                    className="w-2 flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 p-4 text-left">
                    <h4 className="font-display text-base font-black uppercase">{event.title}</h4>
                    <div className="flex flex-wrap gap-4 mt-2 text-[hsl(220,15%,45%)]">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-4 h-4" strokeWidth={2.5} />
                        <span className="font-body">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-4 h-4" strokeWidth={2.5} />
                        <span className="font-body">{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center px-4 bg-[hsl(40,12%,85%)]">
                    <ChevronRight className="w-5 h-5" strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </MobileFrameV2>
  );
}
