import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { MapPin, Clock, Calendar, User, Users, Bell, Share2, Check } from "lucide-react";
import summerFestivalImg from "@/assets/event-summer-festival.jpg";

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
};

export default function EventDetailPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
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
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col pb-24">
        {/* Event Hero Image */}
        <div className="relative aspect-[16/10] w-full border-b-4 border-foreground overflow-hidden">
          <img 
            src={summerFestivalImg} 
            alt={mockEvent.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4">
            <div className="flex h-10 w-10 items-center justify-center border-3 border-foreground bg-accent" style={{ borderWidth: "3px" }}>
              <Star className="h-5 w-5 fill-foreground" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Event Title */}
        <div className="border-b-4 border-foreground bg-accent p-5">
          <h1 className="font-display text-2xl font-bold uppercase">{mockEvent.title}</h1>
        </div>

        {/* Event Info Grid */}
        <div className="grid grid-cols-2 border-b-4 border-foreground">
          {/* Date */}
          <div className="flex items-center gap-3 border-b-3 border-r-3 border-foreground p-4" style={{ borderWidth: "3px" }}>
            <div className="flex h-11 w-11 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground">
              <Calendar className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-sm font-bold">{mockEvent.date}</p>
              <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Date</p>
            </div>
          </div>
          
          {/* Time */}
          <div className="flex items-center gap-3 border-b-3 border-foreground p-4" style={{ borderBottomWidth: "3px" }}>
            <div className="flex h-11 w-11 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground">
              <Clock className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-sm font-bold">{mockEvent.startTime}</p>
              <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">Start</p>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-3 border-r-3 border-foreground p-4 col-span-2" style={{ borderRightWidth: "0" }}>
            <div className="flex h-11 w-11 items-center justify-center border-2 border-foreground bg-teal text-primary-foreground">
              <MapPin className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm font-bold">{mockEvent.location}</p>
              <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">{mockEvent.address}</p>
            </div>
          </div>
        </div>

        {/* Organizer & Capacity */}
        <div className="flex border-b-4 border-foreground">
          <div className="flex flex-1 items-center gap-3 border-r-3 border-foreground p-4" style={{ borderRightWidth: "3px" }}>
            <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-lavender">
              <User className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-xs font-bold uppercase">{mockEvent.organizer}</p>
              <p className="font-body text-[10px] uppercase text-muted-foreground">Organizer</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-orange">
              <Users className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display text-xs font-bold">{mockEvent.capacity}</p>
              <p className="font-body text-[10px] uppercase text-muted-foreground">Capacity</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-5">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">About</h2>
          <p className="whitespace-pre-line font-body text-sm leading-relaxed">
            {mockEvent.description}
          </p>
        </div>

        {/* Actions - Fixed bottom */}
        <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md flex gap-3 border-t-4 border-foreground bg-background p-4">
          <Button
            variant={hasReminder ? "secondary" : "outline"}
            className="flex-1 uppercase"
            size="lg"
            onClick={handleReminder}
          >
            {hasReminder ? <Check className="h-5 w-5" strokeWidth={3} /> : <Bell className="h-5 w-5" strokeWidth={2.5} />}
            {hasReminder ? "Set!" : "Remind"}
          </Button>
          <Button variant="accent" className="flex-1 uppercase" size="lg" onClick={handleShare}>
            <Share2 className="h-5 w-5" strokeWidth={2.5} />
            Share
          </Button>
        </div>
      </main>
    </MobileFrame>
  );
}
