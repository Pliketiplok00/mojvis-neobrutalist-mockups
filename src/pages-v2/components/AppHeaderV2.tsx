/**
 * App Header V2
 * 
 * Alternative header with inverted colors and geometric accent.
 * Uses original Mediterranean color palette.
 */

import { Menu, Mail } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface AppHeaderV2Props {
  title?: string;
  onMenuClick?: () => void;
  showInbox?: boolean;
}

export function AppHeaderV2({ 
  title = "MOJ VIS", 
  onMenuClick,
  showInbox = true 
}: AppHeaderV2Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const isInboxPage = location.pathname.includes("/v2/inbox");

  return (
    <header className="sticky top-0 z-50 bg-[hsl(220,20%,10%)] border-b-[5px] border-[hsl(45,92%,55%)]">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="w-12 h-12 bg-[hsl(45,92%,55%)] border-[4px] border-[hsl(45,30%,96%)] flex items-center justify-center transition-transform hover:rotate-3 hover:scale-105 active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-[hsl(220,20%,10%)]" strokeWidth={3} />
        </button>

        {/* Title */}
        <div className="flex-1 flex justify-center">
          <h1 className="font-display text-2xl font-black uppercase tracking-tighter text-[hsl(45,30%,96%)]">
            {title}
          </h1>
        </div>

        {/* Inbox Button */}
        {showInbox && !isInboxPage ? (
          <button
            onClick={() => navigate("/v2/inbox")}
            className="w-12 h-12 bg-[hsl(210,80%,45%)] border-[4px] border-[hsl(45,30%,96%)] flex items-center justify-center transition-transform hover:-rotate-3 hover:scale-105 active:scale-95 relative"
            aria-label="Open inbox"
          >
            <Mail className="w-6 h-6 text-white" strokeWidth={2.5} />
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(12,55%,50%)] border-2 border-[hsl(220,20%,10%)]" />
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>
      
      {/* Geometric accent bar */}
      <div className="h-2 flex">
        <div className="flex-1 bg-[hsl(210,80%,45%)]" />
        <div className="flex-1 bg-[hsl(160,45%,38%)]" />
        <div className="flex-1 bg-[hsl(45,92%,55%)]" />
        <div className="flex-1 bg-[hsl(12,55%,50%)]" />
      </div>
    </header>
  );
}
