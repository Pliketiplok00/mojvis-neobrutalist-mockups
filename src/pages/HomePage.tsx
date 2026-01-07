import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Bus, Ship, MessageSquare, AlertTriangle, Leaf, Fish, Info, AlertCircle, ArrowRight } from "lucide-react";

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
        {/* Active Notification Banner - Harsh alert with offset shadow */}
        <div className="relative border-b-4 border-foreground">
          <div className="absolute inset-0 translate-x-1 translate-y-1 bg-destructive" />
          <button 
            onClick={() => navigate("/inbox/1")}
            className="relative flex items-center gap-3 border-b-4 border-foreground bg-accent p-4 text-left transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-foreground bg-destructive rotate-3">
              <AlertCircle className="h-6 w-6 text-destructive-foreground" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm font-bold uppercase tracking-tight">Road Works Notice</p>
              <p className="font-body text-xs">Main road closed until 18:00 today</p>
            </div>
            <Badge variant="destructive" className="uppercase border-2 border-foreground font-display">New</Badge>
          </button>
        </div>

        {/* Greeting Block - Giant brutalist hero with diagonal accent */}
        <section className="relative border-b-4 border-foreground bg-primary p-6 overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rotate-12 bg-accent border-4 border-foreground" />
          <div className="absolute -right-4 bottom-0 h-16 w-16 bg-secondary border-4 border-foreground" />
          <h2 className="relative font-display text-4xl font-bold uppercase leading-none text-primary-foreground tracking-tight">
            Welcome<br />to Vis!
          </h2>
          <p className="relative mt-4 font-body text-xs text-primary-foreground/90 uppercase tracking-widest">
            Your island guide • Events • Transport • Services
          </p>
        </section>

        {/* Category Grid - Larger 2x2 blocks with permanent shadows */}
        <section className="border-b-4 border-foreground bg-background p-5">
          <h3 className="mb-5 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground border-b-2 border-foreground pb-2">
            Quick Access
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {categoryItems.map((item, index) => (
              <div key={item.path} className="relative">
                {/* Shadow block */}
                <div className={`absolute inset-0 translate-x-2 translate-y-2 border-4 border-foreground ${index % 2 === 0 ? 'bg-foreground' : 'bg-foreground'}`} />
                <button
                  onClick={() => navigate(item.path)}
                  className={`relative flex flex-col items-center justify-center gap-3 border-4 border-foreground ${item.color} ${item.textColor} p-6 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1`}
                >
                  <div className="p-2 border-3 border-current bg-background/20" style={{ borderWidth: "3px" }}>
                    <item.icon className="h-8 w-8" strokeWidth={2.5} />
                  </div>
                  <span className="font-display text-sm font-bold uppercase tracking-wide">{item.label}</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events - Stacked cards with offset shadows */}
        <section className="p-5 bg-background border-b-4 border-foreground">
          <div className="mb-5 flex items-center justify-between border-b-2 border-foreground pb-2">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Upcoming Events
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/events")} 
              className="uppercase text-xs font-display font-bold border-2 border-foreground hover:bg-accent"
            >
              View all
              <ArrowRight className="ml-1 h-3 w-3" strokeWidth={3} />
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {upcomingEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Shadow block */}
                <div className={`absolute inset-0 translate-x-2 translate-y-2 ${index === 0 ? 'bg-primary' : 'bg-foreground'}`} />
                <button
                  onClick={() => navigate(`/events/${event.id}`)}
                  className={`relative flex items-center gap-4 border-4 border-foreground p-4 text-left transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1 ${
                    index === 0 ? "bg-accent" : "bg-background"
                  }`}
                >
                  {/* Date block with rotation */}
                  <div className={`flex h-16 w-16 flex-col items-center justify-center border-4 border-foreground bg-primary text-primary-foreground ${index === 0 ? '-rotate-3' : ''}`}>
                    <span className="font-display text-2xl font-bold leading-none">{event.date.split("/")[0]}</span>
                    <span className="font-body text-[10px] uppercase tracking-wider">{event.date.split("/")[1]}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display text-base font-bold uppercase tracking-tight">{event.title}</h4>
                    <p className="font-body text-xs text-muted-foreground mt-1">{event.location}</p>
                  </div>
                  <div className="font-display text-lg font-bold border-2 border-foreground px-2 py-1 bg-muted">{event.time}</div>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback Entry - Bold CTA with large shadow */}
        <section className="p-5 pb-8 bg-muted/30">
          <div className="relative">
            {/* Large offset shadow */}
            <div className="absolute inset-0 translate-x-3 translate-y-3 bg-foreground" />
            <button
              onClick={() => navigate("/feedback")}
              className="relative flex w-full items-center gap-4 border-4 border-foreground bg-secondary p-5 text-left transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1"
            >
              <div className="flex h-16 w-16 items-center justify-center border-4 border-foreground bg-background rotate-6">
                <MessageSquare className="h-8 w-8" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h4 className="font-display text-xl font-bold uppercase tracking-tight">Share Your Thoughts</h4>
                <p className="font-body text-xs text-secondary-foreground/80 uppercase tracking-widest mt-1">
                  Ideas • Suggestions • Feedback
                </p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center border-3 border-foreground bg-accent" style={{ borderWidth: "3px" }}>
                <ArrowRight className="h-5 w-5" strokeWidth={3} />
              </div>
            </button>
          </div>
        </section>
      </main>
    </MobileFrame>
  );
}
