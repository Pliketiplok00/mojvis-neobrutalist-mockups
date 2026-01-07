import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/card";
import { Car, Bus, Ship, Train, Bike, AlertTriangle, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const transportModes = [
  { id: "road", label: "CESTOVNI", icon: Car, color: "bg-primary", alerts: 3 },
  { id: "bus", label: "AUTOBUSI", icon: Bus, color: "bg-secondary", alerts: 1 },
  { id: "ferry", label: "TRAJEKTI", icon: Ship, color: "bg-teal", alerts: 0 },
  { id: "train", label: "VLAKOVI", icon: Train, color: "bg-lavender", alerts: 2 },
  { id: "bike", label: "BICIKLI", icon: Bike, color: "bg-accent", alerts: 0 },
];

const liveAlerts = [
  { 
    type: "road", 
    title: "Zatvorena Liburnijska", 
    description: "Radovi do 18:00h",
    severity: "high",
    time: "Aktivno"
  },
  { 
    type: "bus", 
    title: "Linija 1 - kašnjenje", 
    description: "15 min kašnjenja",
    severity: "medium",
    time: "Prije 5 min"
  },
  { 
    type: "train", 
    title: "Odgođen polazak", 
    description: "Vlak za Zagreb 14:30",
    severity: "medium",
    time: "Prije 20 min"
  },
];

export default function TransportPage() {
  const navigate = useNavigate();

  return (
    <MobileFrame>
      <AppHeader title="PROMET" />
      
      <div className="p-4 space-y-6">
        {/* Transport Mode Grid */}
        <div className="grid grid-cols-3 gap-3">
          {transportModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => navigate(`/transport/${mode.id}`)}
                className={`${mode.color} neo-border-heavy neo-shadow neo-hover p-4 flex flex-col items-center gap-2 relative`}
              >
                {mode.alerts > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-destructive neo-border flex items-center justify-center">
                    <span className="font-display font-bold text-xs text-white">{mode.alerts}</span>
                  </div>
                )}
                <Icon size={36} strokeWidth={2.5} className="text-white" />
                <span className="font-display font-bold text-xs text-white">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card variant="flat" className="neo-border-heavy p-3 text-center">
            <p className="font-display font-bold text-2xl text-destructive">6</p>
            <p className="font-body text-xs text-muted-foreground">UPOZORENJA</p>
          </Card>
          <Card variant="flat" className="neo-border-heavy p-3 text-center">
            <p className="font-display font-bold text-2xl text-secondary">23</p>
            <p className="font-body text-xs text-muted-foreground">AKTIVNE LINIJE</p>
          </Card>
          <Card variant="flat" className="neo-border-heavy p-3 text-center">
            <p className="font-display font-bold text-2xl text-primary">5</p>
            <p className="font-body text-xs text-muted-foreground">RADOVI</p>
          </Card>
        </div>

        {/* Live Alerts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl uppercase">Uživo upozorenja</h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
              <span className="font-body text-sm text-muted-foreground">LIVE</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {liveAlerts.map((alert, i) => (
              <Card 
                key={i} 
                variant="flat" 
                className={`neo-border-heavy neo-shadow p-4 ${
                  alert.severity === 'high' ? 'border-l-4 border-l-destructive' : 'border-l-4 border-l-accent'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${alert.severity === 'high' ? 'bg-destructive' : 'bg-accent'} neo-border-heavy flex items-center justify-center flex-shrink-0`}>
                    <AlertTriangle size={24} strokeWidth={2.5} className={alert.severity === 'high' ? 'text-white' : 'text-foreground'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold">{alert.title}</p>
                    <p className="font-body text-sm text-muted-foreground">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={14} strokeWidth={2.5} className="text-muted-foreground" />
                      <span className="font-body text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Moje rute</h2>
          <div className="space-y-3">
            {[
              { from: "Trsat", to: "Centar", mode: "bus", line: "Linija 2" },
              { from: "Srdoči", to: "Riva", mode: "bus", line: "Linija 7" },
            ].map((route, i) => (
              <Card key={i} variant="flat" className="neo-border-heavy neo-hover p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary neo-border flex items-center justify-center">
                    <Bus size={20} strokeWidth={2.5} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} strokeWidth={2.5} className="text-muted-foreground" />
                      <span className="font-display font-bold text-sm">{route.from}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-display font-bold text-sm">{route.to}</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">{route.line}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
