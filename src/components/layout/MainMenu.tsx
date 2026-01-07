import { X, Home, Calendar, Bus, Ship, MessageSquare, AlertTriangle, Settings, Info, Leaf, Fish } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Bus, label: "Road Transport", path: "/transport/road" },
  { icon: Ship, label: "Sea Transport", path: "/transport/sea" },
  { icon: MessageSquare, label: "Feedback", path: "/feedback" },
  { icon: AlertTriangle, label: "Click & Fix", path: "/click-fix" },
  { icon: Leaf, label: "Flora", path: "/flora" },
  { icon: Fish, label: "Fauna", path: "/fauna" },
  { icon: Info, label: "Information", path: "/info" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function MainMenu({ isOpen, onClose }: MainMenuProps) {
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <nav className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] border-r-2 border-foreground bg-background shadow-neo-lg animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-foreground p-4">
          <h2 className="font-display text-xl font-bold">Menu</h2>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background shadow-neo transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Menu Items */}
        <ul className="p-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => handleNavigation(item.path)}
                className="flex w-full items-center gap-4 border-2 border-transparent p-4 text-left font-display font-medium transition-all hover:border-foreground hover:bg-accent hover:shadow-neo"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        
        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-foreground bg-muted p-4">
          <p className="text-center font-body text-sm text-muted-foreground">
            MOJ VIS v3.0
          </p>
        </div>
      </nav>
    </>
  );
}
