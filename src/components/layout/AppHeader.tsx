import { Menu, Inbox, ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onMenuClick?: () => void;
}

export function AppHeader({ title = "MOJ VIS", showBack = false, onMenuClick }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHome = location.pathname === "/" || location.pathname === "/home";
  
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Menu or Back */}
        <button
          onClick={showBack ? () => navigate(-1) : onMenuClick}
          className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background shadow-neo transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          aria-label={showBack ? "Go back" : "Open menu"}
        >
          {showBack ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        
        {/* Center: Title */}
        <h1 className="font-display text-lg font-bold tracking-tight">{title}</h1>
        
        {/* Right: Inbox */}
        <button
          onClick={() => navigate("/inbox")}
          className="relative flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background shadow-neo transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          aria-label="Open inbox"
        >
          <Inbox className="h-5 w-5" />
          {/* Notification dot */}
          <span className="absolute -right-1 -top-1 h-3 w-3 border border-foreground bg-destructive" />
        </button>
      </div>
    </header>
  );
}
