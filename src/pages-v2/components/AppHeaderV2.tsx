/**
 * App Header V2
 * 
 * Alternative header with inverted colors and geometric accent.
 * More aggressive neobrutalist treatment.
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
    <header className="sticky top-0 z-50 bg-[hsl(220,30%,8%)] border-b-[5px] border-[hsl(38,95%,50%)]">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="w-12 h-12 bg-[hsl(38,95%,50%)] border-[4px] border-[hsl(40,25%,92%)] flex items-center justify-center transition-transform hover:rotate-3 hover:scale-105 active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-[hsl(220,30%,8%)]" strokeWidth={3} />
        </button>

        {/* Title */}
        <div className="flex-1 flex justify-center">
          <h1 className="font-display text-2xl font-black uppercase tracking-tighter text-[hsl(40,25%,92%)]">
            {title}
          </h1>
        </div>

        {/* Inbox Button */}
        {showInbox && !isInboxPage ? (
          <button
            onClick={() => navigate("/v2/inbox")}
            className="w-12 h-12 bg-[hsl(220,85%,35%)] border-[4px] border-[hsl(40,25%,92%)] flex items-center justify-center transition-transform hover:-rotate-3 hover:scale-105 active:scale-95 relative"
            aria-label="Open inbox"
          >
            <Mail className="w-6 h-6 text-[hsl(0,0%,100%)]" strokeWidth={2.5} />
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(8,65%,42%)] border-2 border-[hsl(220,30%,8%)]" />
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>
      
      {/* Geometric accent bar */}
      <div className="h-2 flex">
        <div className="flex-1 bg-[hsl(220,85%,35%)]" />
        <div className="flex-1 bg-[hsl(150,55%,28%)]" />
        <div className="flex-1 bg-[hsl(38,95%,50%)]" />
        <div className="flex-1 bg-[hsl(8,65%,42%)]" />
      </div>
    </header>
  );
}
