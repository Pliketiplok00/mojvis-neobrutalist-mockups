import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Bell, Send, AlertCircle, MessageSquare, Calendar, AlertTriangle, ArrowRight } from "lucide-react";

type TabType = "received" | "sent";

const receivedMessages = [
  { 
    id: 1, 
    type: "notice", 
    title: "Road Works Notice", 
    preview: "Main road closed until 18:00 today due to maintenance...",
    date: "07/01",
    time: "08:30",
    isRead: false,
    isEmergency: true
  },
  { 
    id: 2, 
    type: "reminder", 
    title: "Event Reminder: Summer Festival", 
    preview: "The Summer Festival starts today at 19:00...",
    date: "07/01",
    time: "00:01",
    isRead: false,
    isEmergency: false
  },
  { 
    id: 3, 
    type: "notice", 
    title: "Ferry Schedule Update", 
    preview: "Due to weather conditions, the afternoon ferry has been...",
    date: "06/01",
    time: "14:20",
    isRead: true,
    isEmergency: false
  },
  { 
    id: 4, 
    type: "reply", 
    title: "Re: Broken Street Light", 
    preview: "Thank you for reporting. Our team has been dispatched...",
    date: "05/01",
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
    date: "04/01",
    time: "16:45",
    status: "under_review"
  },
  { 
    id: 102, 
    type: "click_fix", 
    title: "Report: Broken Street Light", 
    preview: "Street light on Via Roma is not working...",
    date: "03/01",
    time: "21:30",
    status: "accepted"
  },
  { 
    id: 103, 
    type: "feedback", 
    title: "Praise: Great Event!", 
    preview: "The New Year celebration was wonderful...",
    date: "01/01",
    time: "12:00",
    status: "received"
  },
];

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "accent" | "teal" }> = {
  received: { label: "Received", variant: "secondary" },
  under_review: { label: "Review", variant: "accent" },
  accepted: { label: "Accepted", variant: "teal" },
  rejected: { label: "Rejected", variant: "default" },
};

const typeIcons: Record<string, typeof AlertCircle> = {
  notice: AlertCircle,
  reminder: Calendar,
  reply: MessageSquare,
  feedback: MessageSquare,
  click_fix: AlertTriangle,
};

const typeColors: Record<string, string> = {
  notice: "bg-accent",
  reminder: "bg-primary",
  reply: "bg-secondary",
  feedback: "bg-lavender",
  click_fix: "bg-orange",
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
        {/* Tabs - Heavy brutalist tabs */}
        <div className="flex border-b-4 border-foreground">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex flex-1 items-center justify-center gap-2 border-r-3 border-foreground p-4 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === "received" 
                ? "bg-primary text-primary-foreground" 
                : "bg-background hover:bg-muted"
            }`}
            style={{ borderRightWidth: "3px" }}
          >
            <Bell className="h-5 w-5" strokeWidth={2.5} />
            Received
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex flex-1 items-center justify-center gap-2 p-4 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === "sent" 
                ? "bg-primary text-primary-foreground" 
                : "bg-background hover:bg-muted"
            }`}
          >
            <Send className="h-5 w-5" strokeWidth={2.5} />
            Sent
          </button>
        </div>

        {/* Messages List */}
        <div className="flex flex-col">
          {activeTab === "received" ? (
            receivedMessages.map((msg, index) => {
              const Icon = typeIcons[msg.type] || AlertCircle;
              const bgColor = typeColors[msg.type] || "bg-muted";
              return (
                <button
                  key={msg.id}
                  onClick={() => navigate(`/inbox/${msg.id}`)}
                  className={`flex gap-4 border-b-3 border-foreground p-4 text-left transition-all hover:bg-muted ${
                    !msg.isRead ? "bg-accent/20" : "bg-background"
                  }`}
                  style={{ borderBottomWidth: "3px" }}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center border-3 border-foreground ${
                    msg.isEmergency ? "bg-destructive text-destructive-foreground" : bgColor
                  }`} style={{ borderWidth: "3px" }}>
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-display text-sm uppercase truncate ${!msg.isRead ? "font-bold" : "font-medium"}`}>
                        {msg.title}
                      </h4>
                      {!msg.isRead && <Badge variant="destructive" className="shrink-0 uppercase text-[10px]">New</Badge>}
                    </div>
                    <p className="mt-1 truncate font-body text-xs text-muted-foreground">
                      {msg.preview}
                    </p>
                    <p className="mt-2 font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {msg.date} • {msg.time}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                </button>
              );
            })
          ) : (
            sentMessages.map((msg) => {
              const Icon = typeIcons[msg.type] || MessageSquare;
              const bgColor = typeColors[msg.type] || "bg-muted";
              const status = statusLabels[msg.status];
              return (
                <button
                  key={msg.id}
                  onClick={() => navigate(`/inbox/${msg.id}`)}
                  className="flex gap-4 border-b-3 border-foreground bg-background p-4 text-left transition-all hover:bg-muted"
                  style={{ borderBottomWidth: "3px" }}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center border-3 border-foreground ${bgColor}`} style={{ borderWidth: "3px" }}>
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-sm font-medium uppercase truncate">{msg.title}</h4>
                      <Badge variant={status.variant} className="shrink-0 uppercase text-[10px]">{status.label}</Badge>
                    </div>
                    <p className="mt-1 truncate font-body text-xs text-muted-foreground">
                      {msg.preview}
                    </p>
                    <p className="mt-2 font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {msg.date} • {msg.time}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
                </button>
              );
            })
          )}
        </div>

        {/* Empty state would go here */}
      </main>
    </MobileFrame>
  );
}
