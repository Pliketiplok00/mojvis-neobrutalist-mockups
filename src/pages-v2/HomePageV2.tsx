/**
 * Home Page V2
 * 
 * Bold neobrutalist interpretation with inverted header.
 * Uses original Mediterranean color palette.
 */

import { useState } from "react";
import { MobileFrameV2 } from "./components/MobileFrameV2";
import { AppHeaderV2 } from "./components/AppHeaderV2";
import { MainMenuV2 } from "./components/MainMenuV2";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Info, AlertCircle, ArrowRight, Sparkles, MessageSquare } from "lucide-react";

const upcomingEvents = [
  { id: 1, title: "LJETNI FESTIVAL", date: "15", month: "SRP", time: "19:00", location: "Trg Grada Visa" },
  { id: 2, title: "NOĆ RIBOLOVA", date: "18", month: "SRP", time: "20:00", location: "Luka Komiža" },
  { id: 3, title: "DEGUSTACIJA VINA", date: "20", month: "SRP", time: "18:00", location: "Lokalna vinarija" },
];

const categoryItems = [
  { icon: Calendar, label: "DOGAĐAJI", path: "/v2/events", color: "hsl(210,80%,45%)" },
  { icon: Clock, label: "VOZNI RED", path: "/v2/transport", color: "hsl(180,45%,42%)" },
  { icon: MessageSquare, label: "FEEDBACK", path: "/v2/feedback", color: "hsl(270,35%,70%)" },
  { icon: Info, label: "INFO", path: "/v2/info", color: "hsl(160,45%,38%)" },
];

export default function HomePageV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileFrameV2>
      <AppHeaderV2 onMenuClick={() => setMenuOpen(true)} />
      <MainMenuV2 isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col">
        {/* Emergency Banner */}
        <button 
          onClick={() => navigate("/v2/inbox/1")}
          className="flex items-center gap-4 bg-[hsl(12,55%,50%)] p-4 border-b-[5px] border-[hsl(220,20%,10%)] transition-transform hover:translate-x-1"
        >
          <div className="w-12 h-12 bg-white/20 border-[4px] border-white/40 flex items-center justify-center flex-shrink-0 rotate-3">
            <AlertCircle className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
          <div className="flex-1">
            <p className="font-display text-sm font-black uppercase text-white">RADOVI NA CESTI</p>
            <p className="font-body text-xs text-white/80">Glavna cesta zatvorena do 18:00</p>
          </div>
          <div className="w-8 h-8 bg-[hsl(45,92%,55%)] border-[3px] border-[hsl(220,20%,10%)] flex items-center justify-center">
            <span className="font-display text-xs font-black">!</span>
          </div>
        </button>

        {/* Welcome Section */}
        <section className="bg-[hsl(210,80%,45%)] p-6 border-b-[5px] border-[hsl(220,20%,10%)]">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[hsl(45,92%,55%)] border-[4px] border-[hsl(220,20%,10%)] flex items-center justify-center -rotate-6 shadow-[6px_6px_0_0_hsl(220,20%,10%)]">
              <Sparkles className="w-8 h-8 text-[hsl(220,20%,10%)]" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-3xl font-black uppercase text-white leading-none tracking-tight">
                DOBRODOŠLI<br/>NA VIS!
              </h2>
              <p className="mt-2 font-body text-sm text-white/80">
                Vaš vodič za otok
              </p>
            </div>
          </div>
        </section>

        {/* Category Grid - 2x2 */}
        <section className="p-5 bg-[hsl(45,30%,96%)] border-b-[5px] border-[hsl(220,20%,10%)]">
          <h3 className="font-display text-xs font-black uppercase tracking-[0.2em] text-[hsl(220,10%,40%)] mb-4 pl-1">
            BRZI PRISTUP
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {categoryItems.map((item, index) => {
              const Icon = item.icon;
              const isOdd = index % 2 === 1;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative aspect-square border-[4px] border-[hsl(220,20%,10%)] p-4 flex flex-col items-center justify-center gap-3 transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[6px_6px_0_0_hsl(220,20%,10%)] active:translate-x-0 active:translate-y-0 active:shadow-none ${isOdd ? 'rotate-2' : '-rotate-1'}`}
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                  <span className="font-display text-sm font-black text-white">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="p-5 bg-white border-b-[5px] border-[hsl(220,20%,10%)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xs font-black uppercase tracking-[0.2em] text-[hsl(220,10%,40%)]">
              NADOLAZEĆI DOGAĐAJI
            </h3>
            <button 
              onClick={() => navigate("/v2/events")}
              className="flex items-center gap-1 font-display text-xs font-bold uppercase text-[hsl(210,80%,45%)] hover:underline"
            >
              SVI
              <ArrowRight className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
          
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <button
                key={event.id}
                onClick={() => navigate(`/v2/events/${event.id}`)}
                className={`w-full flex items-stretch border-[4px] border-[hsl(220,20%,10%)] bg-white transition-all hover:translate-x-[-2px] hover:shadow-[4px_4px_0_0_hsl(220,20%,10%)] active:translate-x-0 active:shadow-none overflow-hidden ${index === 0 ? 'shadow-[4px_4px_0_0_hsl(45,92%,55%)]' : ''}`}
              >
                {/* Date Block */}
                <div className={`w-20 flex-shrink-0 flex flex-col items-center justify-center p-3 border-r-[4px] border-[hsl(220,20%,10%)] ${index === 0 ? 'bg-[hsl(210,80%,45%)]' : 'bg-[hsl(45,15%,90%)]'}`}>
                  <span className={`font-display text-2xl font-black leading-none ${index === 0 ? 'text-white' : 'text-[hsl(220,20%,10%)]'}`}>
                    {event.date}
                  </span>
                  <span className={`font-display text-xs font-bold uppercase ${index === 0 ? 'text-white/80' : 'text-[hsl(220,10%,40%)]'}`}>
                    {event.month}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-3 text-left">
                  <h4 className="font-display text-sm font-black uppercase">{event.title}</h4>
                  <p className="font-body text-xs text-[hsl(220,10%,40%)] mt-1">{event.location}</p>
                </div>
                
                {/* Time */}
                <div className="flex items-center px-3 bg-[hsl(45,15%,90%)]">
                  <span className="font-display text-sm font-bold">{event.time}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Click & Fix CTA */}
        <section className="p-5 pb-8 bg-[hsl(45,30%,96%)]">
          <button
            onClick={() => navigate("/v2/click-fix")}
            className="w-full bg-[hsl(25,85%,55%)] border-[5px] border-[hsl(220,20%,10%)] p-5 flex items-center gap-4 transition-all shadow-[6px_6px_0_0_hsl(220,20%,10%)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0_0_hsl(220,20%,10%)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <div className="w-14 h-14 bg-white border-[4px] border-[hsl(220,20%,10%)] flex items-center justify-center rotate-6">
              <span className="font-display text-3xl">🔧</span>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-display text-lg font-black uppercase text-white">KLIKNI & POPRAVI</h4>
              <p className="font-body text-xs text-white/80">Prijavi problem na otoku</p>
            </div>
            <ArrowRight className="w-6 h-6 text-white" strokeWidth={3} />
          </button>
        </section>
      </main>
    </MobileFrameV2>
  );
}
