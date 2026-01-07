import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Bus, Ship, MessageSquare, AlertTriangle, Leaf, Fish, Info, AlertCircle } from "lucide-react";

// Mock data
const upcomingEvents = [
  { id: 1, title: "Summer Festival", date: "15/07/2026", time: "19:00", location: "Vis Town Square" },
  { id: 2, title: "Traditional Fishing Night", date: "18/07/2026", time: "20:00", location: "Komiža Harbor" },
  { id: 3, title: "Wine Tasting Event", date: "20/07/2026", time: "18:00", location: "Local Winery" },
];

const categoryItems = [
  { icon: Calendar, label: "Events", path: "/events", color: "bg-primary" },
  { icon: Bus, label: "Bus", path: "/transport/road", color: "bg-secondary" },
  { icon: Ship, label: "Ferry", path: "/transport/sea", color: "bg-teal" },
  { icon: MessageSquare, label: "Feedback", path: "/feedback", color: "bg-lavender" },
  { icon: AlertTriangle, label: "Click & Fix", path: "/click-fix", color: "bg-orange" },
  { icon: Leaf, label: "Flora", path: "/flora", color: "bg-secondary" },
  { icon: Fish, label: "Fauna", path: "/fauna", color: "bg-primary" },
  { icon: Info, label: "Info", path: "/info", color: "bg-accent" },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col gap-6 p-4">
        {/* Active Notification Banner */}
        <Card variant="accent" interactive onClick={() => navigate("/inbox/1")}>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <div className="flex-1">
              <p className="font-display font-bold text-sm">Road Works Notice</p>
              <p className="font-body text-xs">Main road closed until 18:00 today</p>
            </div>
            <Badge variant="destructive">NEW</Badge>
          </CardContent>
        </Card>

        {/* Greeting Block */}
        <section className="border-2 border-foreground bg-primary p-6 shadow-neo">
          <h2 className="font-display text-2xl font-bold text-primary-foreground">
            Welcome to Vis!
          </h2>
          <p className="mt-2 font-body text-primary-foreground/90">
            Your guide to the island. Explore events, transport, and local services.
          </p>
        </section>

        {/* Category Grid */}
        <section>
          <h3 className="mb-4 font-display text-lg font-bold">Quick Access</h3>
          <div className="grid grid-cols-4 gap-3">
            {categoryItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-2 border-2 border-foreground ${item.color} p-3 shadow-neo transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
              >
                <item.icon className="h-6 w-6" />
                <span className="font-display text-xs font-bold">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Upcoming Events</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>
              View all
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingEvents.map((event) => (
              <Card key={event.id} interactive onClick={() => navigate(`/events/${event.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-bold">{event.title}</h4>
                      <p className="font-body text-sm text-muted-foreground">{event.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-sm font-bold">{event.date}</p>
                      <p className="font-body text-sm text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Feedback Entry */}
        <section>
          <Card variant="secondary" interactive onClick={() => navigate("/feedback")}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center border-2 border-foreground bg-background">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold">Share Your Thoughts</h4>
                  <p className="font-body text-sm text-secondary-foreground/80">
                    Send us your ideas, suggestions, or feedback
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </MobileFrame>
  );
}
