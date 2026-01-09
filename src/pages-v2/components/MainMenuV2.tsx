/**
 * Main Menu V2
 * 
 * Alternative menu with full-bleed dark overlay and
 * stacked navigation items with geometric accents.
 * Uses original Mediterranean color palette.
 */

import { X, Home, Calendar, Clock, MessageSquare, MapPin, Settings, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MainMenuV2Props {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "POČETNA", path: "/v2", color: "hsl(210,80%,45%)" },
  { icon: Calendar, label: "DOGAĐAJI", path: "/v2/events", color: "hsl(160,45%,38%)" },
  { icon: Clock, label: "VOZNI RED", path: "/v2/transport", color: "hsl(180,45%,42%)" },
  { icon: MessageSquare, label: "FEEDBACK", path: "/v2/feedback", color: "hsl(270,35%,70%)" },
  { icon: MapPin, label: "KLIKNI & POPRAVI", path: "/v2/click-fix", color: "hsl(25,85%,55%)" },
  { icon: Settings, label: "POSTAVKE", path: "/v2/settings", color: "hsl(220,10%,40%)" },
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
        className="absolute inset-0 bg-[hsl(220,20%,10%)] opacity-90"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[hsl(45,30%,96%)] border-r-[6px] border-[hsl(45,92%,55%)] flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="bg-[hsl(220,20%,10%)] p-5 flex items-center justify-between border-b-[5px] border-[hsl(45,92%,55%)]">
          <h2 className="font-display text-2xl font-black uppercase text-[hsl(45,30%,96%)]">
            IZBORNIK
          </h2>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-[hsl(12,55%,50%)] border-[4px] border-[hsl(45,30%,96%)] flex items-center justify-center transition-transform hover:rotate-90 hover:scale-105"
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
                className="w-full flex items-center gap-4 p-4 bg-white border-[4px] border-[hsl(220,20%,10%)] transition-all hover:translate-x-2 hover:shadow-[6px_6px_0_0_hsl(220,20%,10%)] active:translate-x-0 active:shadow-none group"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div 
                  className="w-12 h-12 border-[4px] border-[hsl(220,20%,10%)] flex items-center justify-center flex-shrink-0 transition-transform group-hover:-rotate-6"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="flex-1 font-display text-lg font-bold text-left">
                  {item.label}
                </span>
                <ChevronRight className="w-6 h-6 text-[hsl(220,10%,40%)] transition-transform group-hover:translate-x-1" strokeWidth={3} />
              </button>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-4 bg-[hsl(220,20%,10%)] border-t-[4px] border-[hsl(45,92%,55%)]">
          <p className="font-body text-xs text-center text-[hsl(45,30%,96%)] opacity-60">
            MOJ VIS v3.0 • BOLD EDITION
          </p>
        </div>
      </div>
    </div>
  );
}
