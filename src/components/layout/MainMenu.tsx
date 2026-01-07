import { X, Home, Calendar, Clock, MessageSquare, AlertTriangle, Settings, Info, Leaf, Fish } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, labelKey: "menu.home", path: "/home", color: "bg-accent", size: "large" },
  { icon: Calendar, labelKey: "menu.events", path: "/events", color: "bg-primary", size: "medium" },
  { icon: Clock, labelKey: "menu.timetables", path: "/transport", color: "bg-secondary", size: "medium" },
  { icon: MessageSquare, labelKey: "menu.feedback", path: "/feedback", color: "bg-lavender", size: "small" },
  { icon: AlertTriangle, labelKey: "menu.clickFix", path: "/click-fix", color: "bg-orange", size: "small" },
  { icon: Leaf, labelKey: "menu.flora", path: "/flora", color: "bg-primary", size: "small" },
  { icon: Fish, labelKey: "menu.fauna", path: "/fauna", color: "bg-accent", size: "small" },
  { icon: Info, labelKey: "menu.info", path: "/info", color: "bg-teal", size: "medium" },
  { icon: Settings, labelKey: "menu.settings", path: "/settings", color: "bg-muted", size: "small" },
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
      {/* Backdrop - dotted pattern */}
      <div 
        className="fixed inset-0 z-40 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--background)) 2px, transparent 2px)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Menu Panel - Full height with chunky header */}
      <nav 
        className="fixed left-0 top-0 z-50 h-full w-[340px] max-w-[92vw] bg-background overflow-hidden flex flex-col border-r-[6px] border-foreground"
      >
        {/* Header - Massive brutalist block */}
        <div className="relative bg-foreground p-6 pb-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-background border-3 border-foreground rotate-3 hover:rotate-12 hover:scale-110 transition-all active:scale-95"
            style={{ borderWidth: "3px" }}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
          
          <p className="font-body text-[10px] text-background/60 uppercase tracking-[0.3em] mb-1">
            Island Guide
          </p>
          <h2 className="font-display text-4xl font-black uppercase tracking-tighter text-background leading-none">
            MOJ
          </h2>
          <h2 className="font-display text-5xl font-black uppercase tracking-tighter text-accent leading-none -mt-1">
            VIS
          </h2>
        </div>
        
        {/* Menu Grid - Asymmetric brutalist cards */}
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          <div className="grid grid-cols-2 gap-3 auto-rows-min">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path || 
                location.pathname.startsWith(item.path + "/") ||
                (item.path === "/home" && location.pathname === "/");
              
              // Determine grid span based on size
              const spanClass = item.size === "large" 
                ? "col-span-2" 
                : item.size === "medium" 
                  ? "col-span-1" 
                  : "col-span-1";
              
              // Stagger rotation for visual interest
              const rotation = index % 3 === 0 ? "rotate-[-1deg]" : index % 3 === 1 ? "rotate-[0.5deg]" : "rotate-0";
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`group relative ${spanClass} ${rotation} border-3 border-foreground p-4 text-left transition-all duration-150 hover:translate-x-[-3px] hover:translate-y-[-3px] active:translate-x-[1px] active:translate-y-[1px] ${
                    isActive 
                      ? `${item.color} text-white` 
                      : "bg-background"
                  } ${item.size === "large" ? "py-6" : ""}`}
                  style={{ 
                    borderWidth: "3px",
                    boxShadow: isActive 
                      ? `4px 4px 0 0 hsl(var(--destructive))`
                      : `4px 4px 0 0 hsl(var(--foreground))`,
                  }}
                >
                  {/* Icon - positioned differently based on size */}
                  <div className={`inline-flex items-center justify-center border-2 border-foreground mb-2 ${
                    item.size === "large" ? "h-12 w-12" : "h-9 w-9"
                  } ${isActive ? "bg-white/20 border-white/50" : item.color}`}>
                    <item.icon 
                      className={`${item.size === "large" ? "h-6 w-6" : "h-4 w-4"} ${isActive ? "text-white" : "text-foreground"}`} 
                      strokeWidth={2.5} 
                    />
                  </div>
                  
                  {/* Label */}
                  <div className={`font-display font-bold uppercase tracking-wide leading-tight ${
                    item.size === "large" ? "text-base" : "text-xs"
                  }`}>
                    {t(item.labelKey as any)}
                  </div>
                  
                  {/* Decorative corner for large items */}
                  {item.size === "large" && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-3 border-b-3 border-foreground opacity-20" 
                      style={{ borderWidth: "3px" }} 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Footer - Chunky bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t-4 border-foreground bg-muted p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary border border-foreground" />
            <div className="w-3 h-3 bg-accent border border-foreground" />
            <div className="w-3 h-3 bg-secondary border border-foreground" />
          </div>
          <p className="font-body text-[10px] font-bold uppercase tracking-widest text-foreground/60">
            v3.0
          </p>
        </div>
      </nav>
    </>
  );
}
