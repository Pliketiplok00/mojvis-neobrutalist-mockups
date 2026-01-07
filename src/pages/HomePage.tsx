import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Bus, Ship, MessageSquare, Info, AlertCircle, ArrowRight } from "lucide-react";

// Mock data
const upcomingEvents = [
  { id: 1, title: "Summer Festival", date: "15/07", time: "19:00", location: "Vis Town Square" },
  { id: 2, title: "Traditional Fishing Night", date: "18/07", time: "20:00", location: "Komiža Harbor" },
  { id: 3, title: "Wine Tasting Event", date: "20/07", time: "18:00", location: "Local Winery" },
];

const categoryItems = [
  { icon: Calendar, label: "Events", path: "/events", color: "bg-primary", textColor: "text-primary-foreground" },
  { icon: Bus, label: "Bus", path: "/transport/road", color: "bg-secondary", textColor: "text-secondary-foreground" },
  { icon: Ship, label: "Ferry", path: "/transport/sea", color: "bg-teal", textColor: "text-primary-foreground" },
  { icon: Info, label: "Info", path: "/info", color: "bg-accent", textColor: "text-accent-foreground" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col bg-muted/30">
        {/* Active Notification Banner */}
        <button 
          onClick={() => navigate("/inbox/1")}
          className="flex items-center gap-3 border-b-4 border-foreground bg-accent p-4 text-left transition-colors hover:bg-accent/90"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-destructive">
            <AlertCircle className="h-5 w-5 text-destructive-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <p className="font-display text-sm font-bold uppercase tracking-tight">Road Works Notice</p>
            <p className="font-body text-xs text-foreground/70">Main road closed until 18:00 today</p>
          </div>
          <Badge variant="destructive" className="uppercase border-2 border-foreground font-display text-xs">New</Badge>
        </button>

        {/* Greeting Block */}
        <section className="border-b-4 border-foreground bg-primary p-6">
          <h2 className="font-display text-3xl font-bold uppercase leading-tight text-primary-foreground tracking-tight">
            Welcome to Vis!
          </h2>
          <p className="mt-2 font-body text-sm text-primary-foreground/80">
            Your island guide for events, transport & services
          </p>
        </section>

        {/* Category Grid */}
        <section className="border-b-4 border-foreground bg-background p-5">
          <h3 className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Quick Access
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {categoryItems.map((item) => (
              <div key={item.path} className="relative">
                <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
                <button
                  onClick={() => navigate(item.path)}
                  className={`relative flex flex-col items-center justify-center gap-2 border-2 border-foreground ${item.color} ${item.textColor} p-5 transition-transform hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-1 active:translate-y-1 w-full`}
                >
                  <item.icon className="h-7 w-7" strokeWidth={2} />
                  <span className="font-display text-sm font-bold uppercase">{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="p-5 bg-background border-b-4 border-foreground">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Upcoming Events
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/events")} 
              className="uppercase text-xs font-display font-bold hover:bg-muted px-2 h-8"
            >
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingEvents.map((event, index) => (
              <div key={event.id} className="relative">
                <div className={`absolute inset-0 translate-x-1.5 translate-y-1.5 ${index === 0 ? 'bg-primary' : 'bg-foreground/20'}`} />
                <button
                  onClick={() => navigate(`/events/${event.id}`)}
                  className={`relative flex items-center gap-3 border-2 border-foreground p-3 text-left transition-transform hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-1 active:translate-y-1 w-full ${
                    index === 0 ? "bg-accent" : "bg-background"
                  }`}
                >
                  <div className="flex h-12 w-12 flex-col items-center justify-center border-2 border-foreground bg-primary text-primary-foreground shrink-0">
                    <span className="font-display text-lg font-bold leading-none">{event.date.split("/")[0]}</span>
                    <span className="font-body text-[10px] uppercase">{event.date.split("/")[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm font-bold uppercase tracking-tight truncate">{event.title}</h4>
                    <p className="font-body text-xs text-muted-foreground">{event.location}</p>
                  </div>
                  <span className="font-display text-sm font-bold text-muted-foreground shrink-0">{event.time}</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback Entry */}
        <section className="p-5 pb-8 bg-muted/30">
          <div className="relative">
            <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
            <button
              onClick={() => navigate("/feedback")}
              className="relative flex w-full items-center gap-4 border-2 border-foreground bg-secondary p-4 text-left transition-transform hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-1 active:translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center border-2 border-foreground bg-background shrink-0">
                <MessageSquare className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h4 className="font-display text-base font-bold uppercase tracking-tight">Share Your Thoughts</h4>
                <p className="font-body text-xs text-secondary-foreground/70">
                  Ideas, suggestions & feedback
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </button>
          </div>
        </section>
      </main>
    </MobileFrame>
  );
}
