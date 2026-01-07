import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, AlertCircle, MapPin, Clock, MessageSquare, Calendar } from "lucide-react";

// Mock message detail
const mockMessage = {
  id: 1,
  type: "notice",
  title: "Road Works Notice",
  content: `Due to scheduled maintenance work, the main road through Vis town center will be closed today from 06:00 to 18:00.

Please use the alternative route via the coastal road.

We apologize for any inconvenience caused. The work is necessary to repair damage from recent heavy rainfall.

For urgent matters, please contact the municipal office.`,
  date: "07/01/2026",
  time: "08:30",
  isEmergency: true,
  location: "Vis Town Center",
  adminReply: null,
  status: null,
  activeFrom: "07/01/2026",
  activeTo: "15/01/2026",
};

const mockSentMessage = {
  id: 102,
  type: "click_fix",
  title: "Report: Broken Street Light",
  content: `The street light located at the corner of Via Roma and Piazza Centrale has not been working for the past 3 days.

This creates a safety hazard for pedestrians at night.

Please send someone to fix it as soon as possible.`,
  date: "03/01/2026",
  time: "21:30",
  location: "Via Roma / Piazza Centrale",
  photos: ["Photo 1", "Photo 2"],
  status: "accepted",
  adminReply: {
    content: "Thank you for reporting this issue. Our maintenance team has been dispatched and the street light will be repaired within 48 hours.",
    date: "05/01/2026",
    time: "10:15",
  },
};

export default function InboxDetailPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Use mock data based on ID
  const isSent = id && parseInt(id) > 100;
  const message = isSent ? mockSentMessage : mockMessage;

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "accent" | "teal" }> = {
    received: { label: "Received", variant: "secondary" },
    under_review: { label: "Under Review", variant: "accent" },
    accepted: { label: "Accepted", variant: "teal" },
    rejected: { label: "Rejected", variant: "default" },
  };

  return (
    <MobileFrame>
      <AppHeader title="Message" showBack onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col">
        {/* Header Section */}
        <div className={`border-b-2 border-foreground p-5 ${"isEmergency" in message && message.isEmergency ? "bg-destructive/10" : "bg-background"}`}>
          <div className="flex items-start gap-3">
            {"isEmergency" in message && message.isEmergency && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-destructive">
                <AlertCircle className="h-5 w-5 text-destructive-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="font-display text-xl font-bold">{message.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 font-body text-sm text-muted-foreground">
                <span>{message.date}</span>
                <span>•</span>
                <span>{message.time}</span>
                {isSent && message.status && (
                  <>
                    <span>•</span>
                    <Badge variant={statusLabels[message.status].variant}>
                      {statusLabels[message.status].label}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location if present */}
        {message.location && (
          <div className="flex items-center gap-3 border-b-2 border-foreground bg-muted p-4">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="font-body text-sm">{message.location}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          <p className="whitespace-pre-line font-body text-base leading-relaxed">
            {message.content}
          </p>

          {/* Notice Active Period */}
          {!isSent && "activeFrom" in message && message.activeFrom && (
            <div className="mt-5 border-4 border-foreground bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Notice Active Period
                </span>
              </div>
              <div className="flex items-center gap-3 font-body text-sm">
                <span className="font-bold">From:</span>
                <span>{message.activeFrom}</span>
                <span className="text-muted-foreground">—</span>
                <span className="font-bold">To:</span>
                <span>{message.activeTo}</span>
              </div>
            </div>
          )}
        </div>

        {/* Photos if present (for sent messages) */}
        {isSent && "photos" in message && message.photos && (
          <div className="border-t-2 border-foreground p-5">
            <h3 className="mb-3 font-display font-bold">Attached Photos</h3>
            <div className="flex gap-3">
              {message.photos.map((photo, i) => (
                <div
                  key={i}
                  className="flex h-20 w-20 items-center justify-center border-2 border-foreground bg-muted text-xs text-muted-foreground"
                >
                  {photo}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Reply if present */}
        {isSent && "adminReply" in message && message.adminReply && (
          <div className="border-t-2 border-foreground bg-secondary/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-display font-bold">Admin Reply</h3>
            </div>
            <p className="font-body text-base leading-relaxed">
              {message.adminReply.content}
            </p>
            <p className="mt-3 font-body text-xs text-muted-foreground">
              {message.adminReply.date} • {message.adminReply.time}
            </p>
          </div>
        )}
      </main>
    </MobileFrame>
  );
}
