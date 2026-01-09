/**
 * Inbox Page V2
 * 
 * Bold interpretation with tab indicators using geometric shapes
 * and stacked message cards with status ribbons.
 */

import { useState } from "react";
import { MobileFrameV2 } from "./components/MobileFrameV2";
import { AppHeaderV2 } from "./components/AppHeaderV2";
import { MainMenuV2 } from "./components/MainMenuV2";
import { useNavigate } from "react-router-dom";
import { Bell, Send, AlertCircle, MessageSquare, Calendar, AlertTriangle, ChevronRight } from "lucide-react";

type TabType = "received" | "sent";

const receivedMessages = [
  { 
    id: 1, 
    type: "notice", 
    title: "RADOVI NA CESTI", 
    preview: "Glavna cesta zatvorena do 18:00 danas zbog održavanja...",
    date: "07/01",
    time: "08:30",
    isRead: false,
    isEmergency: true
  },
  { 
    id: 2, 
    type: "reminder", 
    title: "PODSJETNIK: LJETNI FESTIVAL", 
    preview: "Ljetni festival počinje danas u 19:00...",
    date: "07/01",
    time: "00:01",
    isRead: false,
    isEmergency: false
  },
  { 
    id: 3, 
    type: "notice", 
    title: "PROMJENA VOZNOG REDA", 
    preview: "Zbog vremenskih uvjeta, popodnevni trajekt je...",
    date: "06/01",
    time: "14:20",
    isRead: true,
    isEmergency: false
  },
];

const sentMessages = [
  { 
    id: 101, 
    type: "feedback", 
    title: "PRIJEDLOG: VIŠE KLUPA", 
    preview: "Mislim da bi glavni trg trebao imati više sjedećih mjesta...",
    date: "04/01",
    time: "16:45",
    status: "under_review"
  },
  { 
    id: 102, 
    type: "click_fix", 
    title: "PRIJAVA: POKVARENA LAMPA", 
    preview: "Ulična lampa na Via Roma ne radi...",
    date: "03/01",
    time: "21:30",
    status: "accepted"
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  received: { label: "PRIMLJENO", color: "hsl(220,15%,45%)" },
  under_review: { label: "U OBRADI", color: "hsl(38,95%,50%)" },
  accepted: { label: "PRIHVAĆENO", color: "hsl(150,55%,28%)" },
  rejected: { label: "ODBIJENO", color: "hsl(8,65%,42%)" },
};

const typeIcons: Record<string, typeof AlertCircle> = {
  notice: AlertCircle,
  reminder: Calendar,
  reply: MessageSquare,
  feedback: MessageSquare,
  click_fix: AlertTriangle,
};

const typeColors: Record<string, string> = {
  notice: "hsl(38,95%,50%)",
  reminder: "hsl(220,85%,35%)",
  reply: "hsl(150,55%,28%)",
  feedback: "hsl(280,40%,65%)",
  click_fix: "hsl(28,90%,50%)",
};

export default function InboxPageV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("received");
  const navigate = useNavigate();

  const unreadCount = receivedMessages.filter(m => !m.isRead).length;

  return (
    <MobileFrameV2>
      <AppHeaderV2 title="INBOX" onMenuClick={() => setMenuOpen(true)} showInbox={false} />
      <MainMenuV2 isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col min-h-screen bg-[hsl(40,25%,92%)]">
        {/* Tabs */}
        <div className="flex border-b-[5px] border-[hsl(220,30%,8%)]">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 flex items-center justify-center gap-3 p-4 font-display text-sm font-black uppercase transition-colors border-r-[4px] border-[hsl(220,30%,8%)] ${
              activeTab === "received" 
                ? "bg-[hsl(220,85%,35%)] text-white" 
                : "bg-white hover:bg-[hsl(40,12%,85%)]"
            }`}
          >
            <Bell className="w-5 h-5" strokeWidth={3} />
            PRIMLJENO
            {unreadCount > 0 && (
              <span className={`w-6 h-6 flex items-center justify-center text-xs border-[3px] ${
                activeTab === "received" 
                  ? "bg-[hsl(38,95%,50%)] border-white text-[hsl(220,30%,8%)]" 
                  : "bg-[hsl(8,65%,42%)] border-[hsl(220,30%,8%)] text-white"
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 flex items-center justify-center gap-3 p-4 font-display text-sm font-black uppercase transition-colors ${
              activeTab === "sent" 
                ? "bg-[hsl(220,85%,35%)] text-white" 
                : "bg-white hover:bg-[hsl(40,12%,85%)]"
            }`}
          >
            <Send className="w-5 h-5" strokeWidth={3} />
            POSLANO
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4">
          {activeTab === "received" ? (
            receivedMessages.map((msg) => {
              const Icon = typeIcons[msg.type] || AlertCircle;
              const iconColor = typeColors[msg.type] || "hsl(220,15%,45%)";
              return (
                <button
                  key={msg.id}
                  onClick={() => navigate(`/v2/inbox/${msg.id}`)}
                  className={`w-full flex items-stretch border-[4px] border-[hsl(220,30%,8%)] bg-white transition-all hover:translate-x-[-2px] hover:shadow-[4px_4px_0_0_hsl(220,30%,8%)] active:translate-x-0 active:shadow-none overflow-hidden ${!msg.isRead ? 'shadow-[4px_4px_0_0_hsl(38,95%,50%)]' : ''}`}
                >
                  {/* Icon */}
                  <div 
                    className={`w-16 flex-shrink-0 flex items-center justify-center border-r-[4px] border-[hsl(220,30%,8%)] ${msg.isEmergency ? 'bg-[hsl(8,65%,42%)]' : ''}`}
                    style={{ backgroundColor: msg.isEmergency ? undefined : iconColor }}
                  >
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-3 text-left overflow-hidden">
                    <div className="flex items-start gap-2">
                      <h4 className={`font-display text-sm uppercase truncate ${!msg.isRead ? 'font-black' : 'font-bold'}`}>
                        {msg.title}
                      </h4>
                      {!msg.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 bg-[hsl(8,65%,42%)] mt-1.5" />
                      )}
                    </div>
                    <p className="font-body text-xs text-[hsl(220,15%,45%)] truncate mt-1">{msg.preview}</p>
                    <p className="font-body text-[10px] font-bold text-[hsl(220,15%,45%)] mt-2 uppercase tracking-wider">
                      {msg.date} • {msg.time}
                    </p>
                  </div>
                  
                  <div className="flex items-center px-3">
                    <ChevronRight className="w-5 h-5 text-[hsl(220,15%,45%)]" strokeWidth={3} />
                  </div>
                </button>
              );
            })
          ) : (
            sentMessages.map((msg) => {
              const Icon = typeIcons[msg.type] || MessageSquare;
              const iconColor = typeColors[msg.type] || "hsl(220,15%,45%)";
              const status = statusConfig[msg.status];
              return (
                <button
                  key={msg.id}
                  onClick={() => navigate(`/v2/inbox/${msg.id}`)}
                  className="w-full flex items-stretch border-[4px] border-[hsl(220,30%,8%)] bg-white transition-all hover:translate-x-[-2px] hover:shadow-[4px_4px_0_0_hsl(220,30%,8%)] active:translate-x-0 active:shadow-none overflow-hidden"
                >
                  {/* Icon */}
                  <div 
                    className="w-16 flex-shrink-0 flex items-center justify-center border-r-[4px] border-[hsl(220,30%,8%)]"
                    style={{ backgroundColor: iconColor }}
                  >
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-3 text-left overflow-hidden">
                    <h4 className="font-display text-sm font-bold uppercase truncate">{msg.title}</h4>
                    <p className="font-body text-xs text-[hsl(220,15%,45%)] truncate mt-1">{msg.preview}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span 
                        className="font-display text-[10px] font-black uppercase px-2 py-0.5 border-[2px] border-[hsl(220,30%,8%)]"
                        style={{ backgroundColor: status.color, color: 'white' }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center px-3">
                    <ChevronRight className="w-5 h-5 text-[hsl(220,15%,45%)]" strokeWidth={3} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </main>
    </MobileFrameV2>
  );
}
