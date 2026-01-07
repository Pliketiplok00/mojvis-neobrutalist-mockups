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
  { icon: MessageSquare, label: "Feedback", path: "/feedback", color: "bg-lavender", textColor: "text-foreground" },
  { icon: AlertTriangle, label: "Report", path: "/click-fix", color: "bg-orange", textColor: "text-foreground" },
  { icon: Leaf, label: "Flora", path: "/flora", color: "bg-secondary", textColor: "text-secondary-foreground" },
  { icon: Fish, label: "Fauna", path: "/fauna", color: "bg-primary", textColor: "text-primary-foreground" },
  { icon: Info, label: "Info", path: "/info", color: "bg-accent", textColor: "text-accent-foreground" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col">
        {/* Active Notification Banner - Harsh alert */}
        <button 
          onClick={() => navigate("/inbox/1")}
          className="flex items-center gap-3 border-b-4 border-foreground bg-accent p-4 text-left transition-colors hover:bg-accent/80"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground bg-destructive" style={{ borderWidth: "3px" }}>
            <AlertCircle className="h-5 w-5 text-destructive-foreground" strokeWidth={3} />
          </div>
          <div className="flex-1">
            <p className="font-display text-sm font-bold uppercase">Road Works Notice</p>
            <p className="font-body text-xs">Main road closed until 18:00 today</p>
          </div>
          <Badge variant="destructive" className="uppercase">New</Badge>
        </button>

        {/* Greeting Block - Giant brutalist hero */}
        <section className="border-b-4 border-foreground bg-primary p-6">
          <h2 className="font-display text-3xl font-bold uppercase leading-tight text-primary-foreground">
            Welcome<br />to Vis!
          </h2>
          <p className="mt-3 font-body text-sm text-primary-foreground/90 uppercase tracking-wide">
            Your island guide • Events • Transport • Services
          </p>
        </section>

        {/* Category Grid - Chunky blocks */}
        <section className="border-b-4 border-foreground p-4">
          <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Quick Access
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {categoryItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-2 border-3 border-foreground ${item.color} ${item.textColor} p-3 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
                style={{ borderWidth: "3px" }}
              >
                <item.icon className="h-6 w-6" strokeWidth={2.5} />
                <span className="font-display text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Upcoming Events - Stacked cards */}
        <section className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Upcoming Events
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/events")} className="uppercase text-xs">
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingEvents.map((event, index) => (
              <button
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className={`flex items-center gap-4 border-3 border-foreground p-4 text-left transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                  index === 0 ? "bg-accent" : "bg-background"
                }`}
                style={{ borderWidth: "3px" }}
              >
                {/* Date block */}
                <div className="flex h-14 w-14 flex-col items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
                  <span className="font-display text-lg font-bold leading-none">{event.date.split("/")[0]}</span>
                  <span className="font-body text-[10px] uppercase">{event.date.split("/")[1]}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold uppercase">{event.title}</h4>
                  <p className="font-body text-xs text-muted-foreground">{event.location}</p>
                </div>
                <div className="font-display text-sm font-bold">{event.time}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Feedback Entry - Bold CTA */}
        <section className="p-4 pb-8">
          <button
            onClick={() => navigate("/feedback")}
            className="flex w-full items-center gap-4 border-3 border-foreground bg-secondary p-5 text-left transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            style={{ borderWidth: "3px" }}
          >
            <div className="flex h-14 w-14 items-center justify-center border-3 border-foreground bg-background" style={{ borderWidth: "3px" }}>
              <MessageSquare className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h4 className="font-display text-lg font-bold uppercase">Share Your Thoughts</h4>
              <p className="font-body text-xs text-secondary-foreground/80 uppercase tracking-wide">
                Ideas • Suggestions • Feedback
              </p>
            </div>
            <ArrowRight className="h-6 w-6" strokeWidth={3} />
          </button>
        </section>
      </main>
    </MobileFrame>
  );
}
