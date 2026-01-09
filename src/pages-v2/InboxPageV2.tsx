/**
 * Inbox Page V2
 * 
 * Bold interpretation with tab indicators.
 * Uses original Mediterranean color palette.
 */

import { useState } from "react";
import { MobileFrameV2 } from "./components/MobileFrameV2";
import { AppHeaderV2 } from "./components/AppHeaderV2";
import { MainMenuV2 } from "./components/MainMenuV2";
import { useNavigate } from "react-router-dom";
import { Bell, Send, AlertCircle, MessageSquare, Calendar, AlertTriangle, ChevronRight } from "lucide-react";

type TabType = "received" | "sent";

const receivedMessages = [
  { id: 1, type: "notice", title: "RADOVI NA CESTI", preview: "Glavna cesta zatvorena do 18:00 danas...", date: "07/01", time: "08:30", isRead: false, isEmergency: true },
  { id: 2, type: "reminder", title: "PODSJETNIK: LJETNI FESTIVAL", preview: "Ljetni festival počinje danas u 19:00...", date: "07/01", time: "00:01", isRead: false, isEmergency: false },
  { id: 3, type: "notice", title: "PROMJENA VOZNOG REDA", preview: "Zbog vremenskih uvjeta, popodnevni trajekt je...", date: "06/01", time: "14:20", isRead: true, isEmergency: false },
];

const sentMessages = [
  { id: 101, type: "feedback", title: "PRIJEDLOG: VIŠE KLUPA", preview: "Mislim da bi glavni trg trebao imati više sjedećih mjesta...", date: "04/01", time: "16:45", status: "under_review" },
  { id: 102, type: "click_fix", title: "PRIJAVA: POKVARENA LAMPA", preview: "Ulična lampa na Via Roma ne radi...", date: "03/01", time: "21:30", status: "accepted" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  received: { label: "PRIMLJENO", color: "hsl(220,10%,40%)" },
  under_review: { label: "U OBRADI", color: "hsl(45,92%,55%)" },
  accepted: { label: "PRIHVAĆENO", color: "hsl(160,45%,38%)" },
  rejected: { label: "ODBIJENO", color: "hsl(12,55%,50%)" },
};

const typeIcons: Record<string, typeof AlertCircle> = { notice: AlertCircle, reminder: Calendar, reply: MessageSquare, feedback: MessageSquare, click_fix: AlertTriangle };
const typeColors: Record<string, string> = { notice: "hsl(45,92%,55%)", reminder: "hsl(210,80%,45%)", reply: "hsl(160,45%,38%)", feedback: "hsl(270,35%,70%)", click_fix: "hsl(25,85%,55%)" };

export default function InboxPageV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("received");
  const navigate = useNavigate();
  const unreadCount = receivedMessages.filter(m => !m.isRead).length;

  return (
    <MobileFrameV2>
      <AppHeaderV2 title="INBOX" onMenuClick={() => setMenuOpen(true)} showInbox={false} />
      <MainMenuV2 isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col min-h-screen bg-[hsl(45,30%,96%)]">
        {/* Tabs */}
        <div className="flex border-b-[5px] border-[hsl(220,20%,10%)]">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 flex items-center justify-center gap-3 p-4 font-display text-sm font-black uppercase transition-colors border-r-[4px] border-[hsl(220,20%,10%)] ${
              activeTab === "received" ? "bg-[hsl(210,80%,45%)] text-white" : "bg-white hover:bg-[hsl(45,15%,90%)]"
            }`}
          >
            <Bell className="w-5 h-5" strokeWidth={3} />
            PRIMLJENO
            {unreadCount > 0 && (
              <span className={`w-6 h-6 flex items-center justify-center text-xs border-[3px] ${
                activeTab === "received" ? "bg-[hsl(45,92%,55%)] border-white text-[hsl(220,20%,10%)]" : "bg-[hsl(12,55%,50%)] border-[hsl(220,20%,10%)] text-white"
              }`}>{unreadCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 flex items-center justify-center gap-3 p-4 font-display text-sm font-black uppercase transition-colors ${
              activeTab === "sent" ? "bg-[hsl(210,80%,45%)] text-white" : "bg-white hover:bg-[hsl(45,15%,90%)]"
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
              const iconColor = typeColors[msg.type] || "hsl(220,10%,40%)";
              return (
                <button key={msg.id} onClick={() => navigate(`/v2/inbox/${msg.id}`)}
                  className={`w-full flex items-stretch border-[4px] border-[hsl(220,20%,10%)] bg-white transition-all hover:translate-x-[-2px] hover:shadow-[4px_4px_0_0_hsl(220,20%,10%)] overflow-hidden ${!msg.isRead ? 'shadow-[4px_4px_0_0_hsl(45,92%,55%)]' : ''}`}>
                  <div className={`w-16 flex-shrink-0 flex items-center justify-center border-r-[4px] border-[hsl(220,20%,10%)]`}
                    style={{ backgroundColor: msg.isEmergency ? "hsl(12,55%,50%)" : iconColor }}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 p-3 text-left overflow-hidden">
                    <div className="flex items-start gap-2">
                      <h4 className={`font-display text-sm uppercase truncate ${!msg.isRead ? 'font-black' : 'font-bold'}`}>{msg.title}</h4>
                      {!msg.isRead && <span className="flex-shrink-0 w-2 h-2 bg-[hsl(12,55%,50%)] mt-1.5" />}
                    </div>
                    <p className="font-body text-xs text-[hsl(220,10%,40%)] truncate mt-1">{msg.preview}</p>
                    <p className="font-body text-[10px] font-bold text-[hsl(220,10%,40%)] mt-2 uppercase tracking-wider">{msg.date} • {msg.time}</p>
                  </div>
                  <div className="flex items-center px-3"><ChevronRight className="w-5 h-5 text-[hsl(220,10%,40%)]" strokeWidth={3} /></div>
                </button>
              );
            })
          ) : (
            sentMessages.map((msg) => {
              const Icon = typeIcons[msg.type] || MessageSquare;
              const iconColor = typeColors[msg.type] || "hsl(220,10%,40%)";
              const status = statusConfig[msg.status];
              return (
                <button key={msg.id} onClick={() => navigate(`/v2/inbox/${msg.id}`)}
                  className="w-full flex items-stretch border-[4px] border-[hsl(220,20%,10%)] bg-white transition-all hover:translate-x-[-2px] hover:shadow-[4px_4px_0_0_hsl(220,20%,10%)] overflow-hidden">
                  <div className="w-16 flex-shrink-0 flex items-center justify-center border-r-[4px] border-[hsl(220,20%,10%)]" style={{ backgroundColor: iconColor }}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 p-3 text-left overflow-hidden">
                    <h4 className="font-display text-sm font-bold uppercase truncate">{msg.title}</h4>
                    <p className="font-body text-xs text-[hsl(220,10%,40%)] truncate mt-1">{msg.preview}</p>
                    <span className="inline-block mt-2 font-display text-[10px] font-black uppercase px-2 py-0.5 border-[2px] border-[hsl(220,20%,10%)]"
                      style={{ backgroundColor: status.color, color: 'white' }}>{status.label}</span>
                  </div>
                  <div className="flex items-center px-3"><ChevronRight className="w-5 h-5 text-[hsl(220,10%,40%)]" strokeWidth={3} /></div>
                </button>
              );
            })
          )}
        </div>
      </main>
    </MobileFrameV2>
  );
}
