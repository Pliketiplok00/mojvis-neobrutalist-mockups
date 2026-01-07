import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Bell, Send, AlertCircle, MessageSquare, Calendar, AlertTriangle } from "lucide-react";

type TabType = "received" | "sent";

const receivedMessages = [
  { 
    id: 1, 
    type: "notice", 
    title: "Road Works Notice", 
    preview: "Main road closed until 18:00 today due to maintenance...",
    date: "07/01/2026",
    time: "08:30",
    isRead: false,
    isEmergency: true
  },
  { 
    id: 2, 
    type: "reminder", 
    title: "Event Reminder: Summer Festival", 
    preview: "The Summer Festival starts today at 19:00...",
    date: "07/01/2026",
    time: "00:01",
    isRead: false,
    isEmergency: false
  },
  { 
    id: 3, 
    type: "notice", 
    title: "Ferry Schedule Update", 
    preview: "Due to weather conditions, the afternoon ferry has been...",
    date: "06/01/2026",
    time: "14:20",
    isRead: true,
    isEmergency: false
  },
  { 
    id: 4, 
    type: "reply", 
    title: "Re: Broken Street Light", 
    preview: "Thank you for reporting. Our team has been dispatched...",
    date: "05/01/2026",
    time: "10:15",
    isRead: true,
    isEmergency: false
  },
];

const sentMessages = [
  { 
    id: 101, 
    type: "feedback", 
    title: "Suggestion: More Benches", 
    preview: "I think the main square could use more seating...",
    date: "04/01/2026",
    time: "16:45",
    status: "under_review"
  },
  { 
    id: 102, 
    type: "click_fix", 
    title: "Report: Broken Street Light", 
    preview: "Street light on Via Roma is not working...",
    date: "03/01/2026",
    time: "21:30",
    status: "accepted"
  },
  { 
    id: 103, 
    type: "feedback", 
    title: "Praise: Great Event!", 
    preview: "The New Year celebration was wonderful...",
    date: "01/01/2026",
    time: "12:00",
    status: "received"
  },
];

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "accent" | "teal" }> = {
  received: { label: "Received", variant: "secondary" },
  under_review: { label: "Under Review", variant: "accent" },
  accepted: { label: "Accepted", variant: "teal" },
  rejected: { label: "Rejected", variant: "default" },
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  notice: AlertCircle,
  reminder: Calendar,
  reply: MessageSquare,
  feedback: MessageSquare,
  click_fix: AlertTriangle,
};

export default function InboxPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("received");
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <AppHeader title="Inbox" onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col">
        {/* Tabs */}
        <div className="flex border-b-2 border-foreground">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex flex-1 items-center justify-center gap-2 border-r-2 border-foreground p-4 font-display font-bold transition-colors ${
              activeTab === "received" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
            }`}
          >
            <Bell className="h-4 w-4" />
            Received
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex flex-1 items-center justify-center gap-2 p-4 font-display font-bold transition-colors ${
              activeTab === "sent" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
            }`}
          >
            <Send className="h-4 w-4" />
            Sent
          </button>
        </div>

        {/* Messages List */}
        <div className="flex flex-col">
          {activeTab === "received" ? (
            receivedMessages.map((msg) => {
              const Icon = typeIcons[msg.type] || AlertCircle;
              return (
                <button
                  key={msg.id}
                  onClick={() => navigate(`/inbox/${msg.id}`)}
                  className={`flex gap-4 border-b-2 border-foreground p-4 text-left transition-colors hover:bg-muted ${
                    !msg.isRead ? "bg-accent/30" : "bg-background"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground ${
                    msg.isEmergency ? "bg-destructive text-destructive-foreground" : "bg-background"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-display truncate ${!msg.isRead ? "font-bold" : "font-medium"}`}>
                        {msg.title}
                      </h4>
                      {!msg.isRead && <Badge variant="destructive" className="shrink-0">NEW</Badge>}
                    </div>
                    <p className="mt-1 truncate font-body text-sm text-muted-foreground">
                      {msg.preview}
                    </p>
                    <p className="mt-2 font-body text-xs text-muted-foreground">
                      {msg.date} • {msg.time}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            sentMessages.map((msg) => {
              const Icon = typeIcons[msg.type] || MessageSquare;
              const status = statusLabels[msg.status];
              return (
                <button
                  key={msg.id}
                  onClick={() => navigate(`/inbox/${msg.id}`)}
                  className="flex gap-4 border-b-2 border-foreground bg-background p-4 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-lavender">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display font-medium truncate">{msg.title}</h4>
                      <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
                    </div>
                    <p className="mt-1 truncate font-body text-sm text-muted-foreground">
                      {msg.preview}
                    </p>
                    <p className="mt-2 font-body text-xs text-muted-foreground">
                      {msg.date} • {msg.time}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </main>
    </MobileFrame>
  );
}
