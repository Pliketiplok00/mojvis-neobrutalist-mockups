import { Menu, Inbox, ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onMenuClick?: () => void;
  rightAction?: ReactNode;
}

export function AppHeader({ title = "MOJ VIS", showBack = false, onMenuClick, rightAction }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-foreground bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left: Menu or Back */}
        <button
          onClick={showBack ? () => navigate(-1) : onMenuClick}
          className="flex h-12 w-12 items-center justify-center border-3 border-foreground bg-accent transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          style={{ borderWidth: "3px" }}
          aria-label={showBack ? "Go back" : "Open menu"}
        >
          {showBack ? (
            <ChevronLeft className="h-6 w-6" strokeWidth={3} />
          ) : (
            <Menu className="h-6 w-6" strokeWidth={3} />
          )}
        </button>
        
        {/* Center: Title - Bold uppercase */}
        <h1 className="font-display text-xl font-bold uppercase tracking-tight">{title}</h1>
        
        {/* Right: Custom action or Inbox */}
        {rightAction || (
          <button
            onClick={() => navigate("/inbox")}
            className="relative flex h-12 w-12 items-center justify-center border-3 border-foreground bg-primary text-primary-foreground transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{ borderWidth: "3px" }}
            aria-label="Open inbox"
          >
            <Inbox className="h-6 w-6" strokeWidth={2.5} />
            <span 
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center border-2 border-foreground bg-destructive font-display text-[10px] font-bold text-destructive-foreground"
            >
              3
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
