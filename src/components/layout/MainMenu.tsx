import { X, Home, Calendar, Bus, Ship, MessageSquare, AlertTriangle, Settings, Info, Leaf, Fish, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Home", path: "/home", color: "bg-accent", iconColor: "text-amber-500" },
  { icon: Calendar, label: "Events", path: "/events", color: "bg-primary", iconColor: "text-primary" },
  { icon: Bus, label: "Road Transport", path: "/transport/road", color: "bg-secondary", iconColor: "text-emerald-500" },
  { icon: Ship, label: "Sea Transport", path: "/transport/sea", color: "bg-teal", iconColor: "text-destructive" },
  { icon: MessageSquare, label: "Feedback", path: "/feedback", color: "bg-lavender", iconColor: "text-violet-500" },
  { icon: AlertTriangle, label: "Click & Fix", path: "/click-fix", color: "bg-orange", iconColor: "text-amber-500" },
  { icon: Leaf, label: "Flora", path: "/flora", color: "bg-secondary", iconColor: "text-emerald-500" },
  { icon: Fish, label: "Fauna", path: "/fauna", color: "bg-primary", iconColor: "text-primary" },
  { icon: Info, label: "Information", path: "/info", color: "bg-teal", iconColor: "text-violet-500" },
  { icon: Settings, label: "Settings", path: "/settings", color: "bg-muted", iconColor: "text-foreground" },
];

export function MainMenu({ isOpen, onClose }: MainMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
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
        
        {/* Menu Items - Stacked blocks */}
        <ul className="p-3 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
              (item.path === "/home" && location.pathname === "/");
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`group flex w-full items-center gap-4 border-3 border-foreground p-4 text-left font-display font-bold uppercase tracking-wide transition-all ${
                    isActive 
                      ? `${item.color} shadow-[6px_6px_0_0_hsl(var(--foreground))]` 
                      : "bg-background hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
                  } active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`}
                  style={{ borderWidth: "3px" }}
                >
                  <div className={`flex h-10 w-10 items-center justify-center border-2 border-foreground ${isActive ? "bg-background" : item.color}`}>
                    <item.icon className={`h-5 w-5 ${isActive ? item.iconColor : ""}`} strokeWidth={2.5} />
                  </div>
                  <span className="flex-1 text-sm">{item.label}</span>
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
