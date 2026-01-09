/**
 * Main Menu V2
 * 
 * Alternative menu with full-bleed dark overlay and
 * stacked navigation items with geometric accents.
 */

import { X, Home, Calendar, Ship, Bus, MessageSquare, MapPin, Settings, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MainMenuV2Props {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "POČETNA", path: "/v2", color: "hsl(220,85%,35%)" },
  { icon: Calendar, label: "DOGAĐAJI", path: "/v2/events", color: "hsl(150,55%,28%)" },
  { icon: Ship, label: "TRAJEKTI", path: "/v2/transport/sea", color: "hsl(175,55%,35%)" },
  { icon: Bus, label: "AUTOBUSI", path: "/v2/transport/road", color: "hsl(28,90%,50%)" },
  { icon: MessageSquare, label: "FEEDBACK", path: "/v2/feedback", color: "hsl(280,40%,65%)" },
  { icon: MapPin, label: "KLIKNI & POPRAVI", path: "/v2/click-fix", color: "hsl(15,60%,45%)" },
  { icon: Settings, label: "POSTAVKE", path: "/v2/settings", color: "hsl(40,12%,60%)" },
];

export function MainMenuV2({ isOpen, onClose }: MainMenuV2Props) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[hsl(220,30%,8%)] opacity-90"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[hsl(40,25%,92%)] border-r-[6px] border-[hsl(38,95%,50%)] flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="bg-[hsl(220,30%,8%)] p-5 flex items-center justify-between border-b-[5px] border-[hsl(38,95%,50%)]">
          <h2 className="font-display text-2xl font-black uppercase text-[hsl(40,25%,92%)]">
            IZBORNIK
          </h2>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-[hsl(8,65%,42%)] border-[4px] border-[hsl(40,25%,92%)] flex items-center justify-center transition-transform hover:rotate-90 hover:scale-105"
          >
            <X className="w-6 h-6 text-white" strokeWidth={3} />
          </button>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="w-full flex items-center gap-4 p-4 bg-white border-[4px] border-[hsl(220,30%,8%)] transition-all hover:translate-x-2 hover:shadow-[6px_6px_0_0_hsl(220,30%,8%)] active:translate-x-0 active:shadow-none group"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div 
                  className="w-12 h-12 border-[4px] border-[hsl(220,30%,8%)] flex items-center justify-center flex-shrink-0 transition-transform group-hover:-rotate-6"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="flex-1 font-display text-lg font-bold text-left">
                  {item.label}
                </span>
                <ChevronRight className="w-6 h-6 text-[hsl(220,15%,45%)] transition-transform group-hover:translate-x-1" strokeWidth={3} />
              </button>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-4 bg-[hsl(220,30%,8%)] border-t-[4px] border-[hsl(38,95%,50%)]">
          <p className="font-body text-xs text-center text-[hsl(40,25%,92%)] opacity-60">
            MOJ VIS v3.0 • BOLD EDITION
          </p>
        </div>
      </div>
    </div>
  );
}
