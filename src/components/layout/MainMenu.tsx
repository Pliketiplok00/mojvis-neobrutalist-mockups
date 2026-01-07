import { X, Home, Calendar, Clock, MessageSquare, AlertTriangle, Settings, Info, Leaf, Fish, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, labelKey: "menu.home", path: "/home", color: "bg-accent", shadowColor: "hsl(var(--accent))" },
  { icon: Calendar, labelKey: "menu.events", path: "/events", color: "bg-primary", shadowColor: "hsl(var(--primary))" },
  { icon: Clock, labelKey: "menu.timetables", path: "/transport", color: "bg-secondary", shadowColor: "hsl(var(--secondary))" },
  { icon: MessageSquare, labelKey: "menu.feedback", path: "/feedback", color: "bg-lavender", shadowColor: "hsl(var(--lavender))" },
  { icon: AlertTriangle, labelKey: "menu.clickFix", path: "/click-fix", color: "bg-orange", shadowColor: "hsl(var(--orange))" },
  { icon: Leaf, labelKey: "menu.flora", path: "/flora", color: "bg-primary", shadowColor: "hsl(var(--primary))" },
  { icon: Fish, labelKey: "menu.fauna", path: "/fauna", color: "bg-accent", shadowColor: "hsl(var(--accent))" },
  { icon: Info, labelKey: "menu.info", path: "/info", color: "bg-teal", shadowColor: "hsl(var(--teal))" },
  { icon: Settings, labelKey: "menu.settings", path: "/settings", color: "bg-muted", shadowColor: "hsl(var(--muted))" },
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
      {/* Backdrop - harsh grid pattern */}
      <div 
        className="fixed inset-0 z-40 bg-foreground/40"
        onClick={onClose}
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 20px,
            hsl(var(--foreground) / 0.05) 20px,
            hsl(var(--foreground) / 0.05) 21px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 20px,
            hsl(var(--foreground) / 0.05) 20px,
            hsl(var(--foreground) / 0.05) 21px
          )`
        }}
      />
      
      {/* Menu Panel - Heavy brutalist style */}
      <nav 
        className="fixed left-0 top-0 z-50 h-full w-[320px] max-w-[90vw] border-r-4 border-foreground bg-background overflow-y-auto"
        style={{
          boxShadow: "8px 0 0 0 hsl(var(--foreground))"
        }}
      >
        {/* Header - Bold block */}
        <div className="flex items-center justify-between border-b-4 border-foreground bg-primary p-4">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-primary-foreground">
              Menu
            </h2>
            <p className="font-body text-xs text-primary-foreground/80 uppercase tracking-widest">
              MOJ VIS
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center border-3 border-foreground bg-background transition-transform hover:rotate-90 hover:scale-110 active:scale-95"
            style={{ borderWidth: "3px" }}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" strokeWidth={3} />
          </button>
        </div>
        
        {/* Menu Items - Stacked blocks with colorful shadows */}
        <ul className="p-3 space-y-3 pb-20">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              location.pathname.startsWith(item.path + "/") ||
              (item.path === "/home" && location.pathname === "/");
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`group flex w-full items-center gap-4 border-3 border-foreground p-4 text-left font-display font-bold uppercase tracking-wide transition-all duration-200 ${
                    isActive 
                      ? `${item.color} text-white` 
                      : "bg-background hover:translate-x-[-4px] hover:translate-y-[-4px]"
                  } active:translate-x-[2px] active:translate-y-[2px]`}
                  style={{ 
                    borderWidth: "3px",
                    boxShadow: isActive 
                      ? `6px 6px 0 0 hsl(var(--foreground))`
                      : `6px 6px 0 0 ${item.shadowColor}`,
                  }}
                >
                  <div className={`flex h-10 w-10 items-center justify-center border-2 border-foreground transition-colors ${isActive ? "bg-white/20" : item.color}`}>
                    <item.icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} strokeWidth={2.5} />
                  </div>
                  <span className="flex-1 text-sm">{t(item.labelKey as any)}</span>
                  <ChevronRight className={`h-5 w-5 transition-transform ${isActive ? "" : "group-hover:translate-x-1"}`} strokeWidth={3} />
                </button>
              </li>
            );
          })}
        </ul>
        
        {/* Footer - Raw block */}
        <div className="absolute bottom-0 left-0 right-0 border-t-4 border-foreground bg-foreground p-4">
          <p className="text-center font-body text-xs font-bold uppercase tracking-widest text-background">
            Version 3.0 • Island Guide
          </p>
        </div>
      </nav>
    </>
  );
}
