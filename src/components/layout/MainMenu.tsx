import { X, Home, Calendar, Clock, MessageSquare, AlertTriangle, Settings, Info, Leaf, Fish } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, labelKey: "menu.home", path: "/home", color: "bg-accent" },
  { icon: Calendar, labelKey: "menu.events", path: "/events", color: "bg-primary" },
  { icon: Clock, labelKey: "menu.timetables", path: "/transport", color: "bg-teal" },
  { icon: MessageSquare, labelKey: "menu.feedback", path: "/feedback", color: "bg-lavender" },
  { icon: AlertTriangle, labelKey: "menu.clickFix", path: "/click-fix", color: "bg-orange" },
  { icon: Leaf, labelKey: "menu.flora", path: "/flora", color: "bg-primary" },
  { icon: Fish, labelKey: "menu.fauna", path: "/fauna", color: "bg-secondary" },
  { icon: Info, labelKey: "menu.info", path: "/info", color: "bg-teal" },
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
      {/* Backdrop - striped pattern */}
      <div 
        className="fixed inset-0 z-40 bg-foreground/70"
        onClick={onClose}
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            hsl(var(--foreground) / 0.1) 10px,
            hsl(var(--foreground) / 0.1) 20px
          )`
        }}
      />
      
      {/* Menu Panel */}
      <nav className="fixed left-0 top-0 z-50 h-full w-[300px] max-w-[88vw] bg-background flex flex-col border-r-4 border-foreground">
        
        {/* Header */}
        <div className="bg-primary border-b-4 border-foreground p-4">
          <div className="flex items-center justify-between">
            <div className="border-2 border-foreground bg-background px-4 py-2">
              <h2 className="font-display text-xl font-black uppercase tracking-tight text-foreground">
                Moj Vis
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center bg-foreground border-2 border-foreground hover:bg-destructive transition-colors active:scale-95"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-background" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-20">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              location.pathname.startsWith(item.path + "/") ||
              (item.path === "/home" && location.pathname === "/");
            
            return (
              <div key={item.path} className="relative">
                {/* Shadow layer */}
                <div className={`absolute inset-0 translate-x-1.5 translate-y-1.5 ${isActive ? "bg-foreground" : "bg-foreground"}`} />
                
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`relative flex w-full items-center gap-3 border-2 border-foreground p-3 text-left transition-transform ${
                    isActive 
                      ? "bg-foreground text-background translate-x-[-1px] translate-y-[-1px]" 
                      : "bg-background hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1"
                  }`}
                >
                  {/* Icon box */}
                  <div className={`flex h-10 w-10 items-center justify-center border-2 ${
                    isActive 
                      ? "border-background bg-background/10" 
                      : `border-foreground ${item.color}`
                  }`}>
                    <item.icon 
                      className={`h-5 w-5 ${isActive ? "text-background" : "text-foreground"}`} 
                      strokeWidth={2} 
                    />
                  </div>
                  
                  {/* Label */}
                  <span className="flex-1 font-display text-sm font-bold uppercase tracking-wide">
                    {t(item.labelKey as any)}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="h-5 w-1.5 bg-accent" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t-4 border-foreground bg-foreground px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 bg-accent" />
            <div className="h-2.5 w-2.5 bg-primary" />
            <div className="h-2.5 w-2.5 bg-teal" />
            <span className="ml-auto font-body text-[10px] text-background/60 uppercase tracking-widest">
              v3.0
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}
