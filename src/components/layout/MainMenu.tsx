import { X, Home, Calendar, Clock, MessageSquare, AlertTriangle, Settings, Info, Leaf, Fish, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, labelKey: "menu.home", path: "/home", accent: "bg-accent", accentBorder: "border-l-accent" },
  { icon: Calendar, labelKey: "menu.events", path: "/events", accent: "bg-primary", accentBorder: "border-l-primary" },
  { icon: Clock, labelKey: "menu.timetables", path: "/transport", accent: "bg-teal", accentBorder: "border-l-teal" },
  { icon: MessageSquare, labelKey: "menu.feedback", path: "/feedback", accent: "bg-lavender", accentBorder: "border-l-lavender" },
  { icon: AlertTriangle, labelKey: "menu.clickFix", path: "/click-fix", accent: "bg-orange", accentBorder: "border-l-orange" },
  { icon: Leaf, labelKey: "menu.flora", path: "/flora", accent: "bg-primary", accentBorder: "border-l-primary" },
  { icon: Fish, labelKey: "menu.fauna", path: "/fauna", accent: "bg-secondary", accentBorder: "border-l-secondary" },
  { icon: Info, labelKey: "menu.info", path: "/info", accent: "bg-teal", accentBorder: "border-l-teal" },
  { icon: Settings, labelKey: "menu.settings", path: "/settings", accent: "bg-muted", accentBorder: "border-l-muted" },
];

export function MainMenu({ isOpen, onClose }: MainMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-foreground/50"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <nav className="fixed left-0 top-0 z-50 h-full w-[320px] max-w-[90vw] bg-background flex flex-col border-r-4 border-foreground shadow-[8px_0_0_0_hsl(var(--foreground))]">
        
        {/* Header */}
        <div className="border-b-4 border-foreground bg-foreground p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-3xl font-black uppercase tracking-tight text-background leading-none">
                Moj Vis
              </h2>
              <p className="font-body text-xs text-background/50 uppercase tracking-widest mt-1">
                Izbornik
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center bg-background border-2 border-background hover:bg-accent hover:border-accent transition-colors active:scale-95"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-foreground" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              location.pathname.startsWith(item.path + "/") ||
              (item.path === "/home" && location.pathname === "/");
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition-all duration-150 border-l-4 ${
                  isActive 
                    ? `${item.accentBorder} bg-muted/50` 
                    : "border-l-transparent hover:bg-muted/30 hover:border-l-foreground/20"
                }`}
              >
                {/* Icon container */}
                <div className={`flex h-11 w-11 items-center justify-center border-2 border-foreground transition-colors ${
                  isActive ? item.accent : "bg-background group-hover:bg-muted"
                }`}>
                  <item.icon 
                    className={`h-5 w-5 ${isActive ? "text-white" : "text-foreground"}`} 
                    strokeWidth={2} 
                  />
                </div>
                
                {/* Label */}
                <span className={`flex-1 font-display text-sm font-bold uppercase tracking-wide ${
                  isActive ? "text-foreground" : "text-foreground/80"
                }`}>
                  {t(item.labelKey as any)}
                </span>
                
                {/* Arrow indicator */}
                <ArrowRight 
                  className={`h-4 w-4 transition-all ${
                    isActive 
                      ? "text-foreground opacity-100" 
                      : "text-foreground/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                  }`} 
                  strokeWidth={2.5} 
                />
              </button>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="border-t-4 border-foreground bg-muted/50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-body text-xs text-foreground/50 uppercase tracking-wider">
                Općina Vis
              </span>
            </div>
            <span className="font-body text-[10px] text-foreground/40 uppercase tracking-widest">
              v3.0
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}
