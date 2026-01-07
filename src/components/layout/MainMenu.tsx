import { X, Home, Calendar, Clock, MessageSquare, AlertTriangle, Settings, Info, Leaf, Fish, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, labelKey: "menu.home", path: "/home", color: "bg-accent" },
  { icon: Calendar, labelKey: "menu.events", path: "/events", color: "bg-primary" },
  { icon: Clock, labelKey: "menu.timetables", path: "/transport", color: "bg-secondary" },
  { icon: MessageSquare, labelKey: "menu.feedback", path: "/feedback", color: "bg-secondary" },
  { icon: AlertTriangle, labelKey: "menu.clickFix", path: "/click-fix", color: "bg-destructive" },
  { icon: Leaf, labelKey: "menu.flora", path: "/flora", color: "bg-primary" },
  { icon: Fish, labelKey: "menu.fauna", path: "/fauna", color: "bg-accent" },
  { icon: Info, labelKey: "menu.info", path: "/info", color: "bg-accent" },
  { icon: Settings, labelKey: "menu.settings", path: "/settings", color: "bg-muted" },
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
        className="fixed inset-0 z-40 bg-foreground/60"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <nav className="fixed left-0 top-0 z-50 h-full w-[300px] max-w-[88vw] bg-muted/30 flex flex-col border-r-4 border-foreground overflow-hidden">
        
        {/* Header - matches homepage greeting block style */}
        <div className="border-b-4 border-foreground bg-primary p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase leading-tight text-primary-foreground tracking-tight">
                Moj Vis
              </h2>
              <p className="mt-1 font-body text-xs text-primary-foreground/80">
                Izbornik
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 translate-x-1 translate-y-1 bg-foreground" />
              <button
                onClick={onClose}
                className="relative flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background transition-transform hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0.5 active:translate-y-0.5"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Menu Items - matches homepage list style */}
        <div className="flex-1 overflow-y-auto p-4 bg-background border-b-4 border-foreground">
          <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Navigacija
          </h3>
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                location.pathname.startsWith(item.path + "/") ||
                (item.path === "/home" && location.pathname === "/");
              
              return (
                <div key={item.path} className="relative">
                  <div className={`absolute inset-0 translate-x-1.5 translate-y-1.5 ${isActive ? 'bg-primary' : 'bg-foreground/20'}`} />
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`relative flex w-full items-center gap-3 border-2 border-foreground p-3 text-left transition-transform hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-1 active:translate-y-1 ${
                      isActive ? "bg-accent" : "bg-background"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center border-2 border-foreground ${item.color} shrink-0`}>
                      <item.icon className="h-5 w-5 text-foreground" strokeWidth={2} />
                    </div>
                    <span className="flex-1 font-display text-sm font-bold uppercase tracking-tight">
                      {t(item.labelKey as any)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer - simple info */}
        <div className="p-4 bg-muted/30">
          <p className="font-body text-xs text-muted-foreground text-center">
            Općina Vis • v3.0
          </p>
        </div>
      </nav>
    </>
  );
}
