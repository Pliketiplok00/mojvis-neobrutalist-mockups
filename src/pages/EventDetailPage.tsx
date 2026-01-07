import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Clock, Calendar, User, Users, Bell, Share2, Check } from "lucide-react";

// Mock event data
const mockEvent = {
  id: 1,
  title: "Summer Festival",
  date: "15/07/2026",
  startTime: "19:00",
  endTime: "00:00",
  location: "Vis Town Square",
  address: "Trg Sv. Jurja 1, 21480 Vis",
  description: `Join us for the annual Summer Festival celebrating the rich culture and traditions of Vis island!

Experience live music from local bands, traditional folk dancing, and an incredible fireworks display at midnight.

Local restaurants will be serving traditional dishes including fresh seafood, grilled lamb, and homemade wine.

This is a family-friendly event with activities for children including face painting, games, and a treasure hunt around the old town.`,
  organizer: "Municipality of Vis",
  capacity: 500,
  image: null,
};

export default function EventDetailPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleReminder = () => {
    setHasReminder(!hasReminder);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockEvent.title,
        text: `Check out ${mockEvent.title} on ${mockEvent.date}!`,
        url: window.location.href,
      });
    }
  };

  return (
    <MobileFrame>
      <AppHeader title="Event" showBack onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col">
        {/* Event Image Placeholder */}
        <div className="relative aspect-video w-full border-b-2 border-foreground bg-gradient-to-br from-primary to-secondary">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-6xl font-bold text-primary-foreground/20">VIS</span>
          </div>
          <div className="absolute bottom-4 left-4">
            <Badge variant="accent" className="text-sm">Featured Event</Badge>
          </div>
        </div>

        {/* Event Info */}
        <div className="border-b-2 border-foreground p-5">
          <h1 className="font-display text-2xl font-bold">{mockEvent.title}</h1>
          
          <div className="mt-4 flex flex-col gap-3">
            {/* Date */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-accent">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display font-bold">{mockEvent.date}</p>
                <p className="font-body text-sm text-muted-foreground">Date</p>
              </div>
            </div>
            
            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display font-bold">{mockEvent.startTime} - {mockEvent.endTime}</p>
                <p className="font-body text-sm text-muted-foreground">Time</p>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display font-bold">{mockEvent.location}</p>
                <p className="font-body text-sm text-muted-foreground">{mockEvent.address}</p>
              </div>
            </div>
            
            {/* Organizer */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-lavender">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display font-bold">{mockEvent.organizer}</p>
                <p className="font-body text-sm text-muted-foreground">Organizer</p>
              </div>
            </div>
            
            {/* Capacity */}
            {mockEvent.capacity && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-teal text-primary-foreground">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-bold">{mockEvent.capacity} people</p>
                  <p className="font-body text-sm text-muted-foreground">Capacity</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="border-b-2 border-foreground p-5">
          <h2 className="mb-3 font-display text-lg font-bold">About</h2>
          <p className="whitespace-pre-line font-body text-base leading-relaxed text-foreground/90">
            {mockEvent.description}
          </p>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex gap-3 border-t-2 border-foreground bg-background p-4">
          <Button
            variant={hasReminder ? "secondary" : "outline"}
            className="flex-1"
            onClick={handleReminder}
          >
            {hasReminder ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {hasReminder ? "Reminder Set" : "Remind Me"}
          </Button>
          <Button variant="accent" className="flex-1" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </main>
    </MobileFrame>
  );
}
