import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, AlertTriangle, Construction, Camera, Clock, MapPin, ChevronRight, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const roadSections = [
  { 
    id: "liburnijska",
    name: "Liburnijska cesta", 
    status: "closed",
    statusLabel: "ZATVORENO",
    reason: "Radovi na cjevovodu",
    detour: "Preko Krešimirove",
    until: "Do 18:00"
  },
  { 
    id: "kruzna",
    name: "Kružna ulica", 
    status: "warning",
    statusLabel: "SMANJEN PROMET",
    reason: "Asfaltiranje",
    detour: null,
    until: "Do 15:00"
  },
  { 
    id: "tihovac",
    name: "Tihovac", 
    status: "ok",
    statusLabel: "PROHODNO",
    reason: null,
    detour: null,
    until: null
  },
  { 
    id: "fiumara",
    name: "Ul. Fiumara", 
    status: "warning",
    statusLabel: "GUŽVA",
    reason: "Povećan promet",
    detour: null,
    until: null
  },
];

const trafficCameras = [
  { id: 1, name: "Riva - centar", status: "live" },
  { id: 2, name: "Krešimirova", status: "live" },
  { id: 3, name: "Autobusni kolodvor", status: "live" },
];

export default function TransportRoadPage() {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed": return "bg-destructive";
      case "warning": return "bg-accent";
      case "ok": return "bg-secondary";
      default: return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "closed": return AlertTriangle;
      case "warning": return Construction;
      default: return Car;
    }
  };

  return (
    <MobileFrame>
      <AppHeader title="CESTOVNI PROMET" showBack />
      
      <div className="p-4 space-y-6">
        {/* Overview Banner */}
        <Card variant="flat" className="bg-primary neo-border-heavy neo-shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-bold text-xl text-primary-foreground">STANJE PROMETA</p>
              <p className="font-body text-sm text-primary-foreground/80">Rijeka i okolica</p>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-3xl text-primary-foreground">3</p>
              <p className="font-body text-xs text-primary-foreground/80">AKTIVNA UPOZORENJA</p>
            </div>
          </div>
        </Card>

        {/* Legend */}
        <div className="flex gap-2 flex-wrap">
          <span className="bg-destructive text-white neo-border px-3 py-1 font-display font-bold text-xs">ZATVORENO</span>
          <span className="bg-accent text-foreground neo-border px-3 py-1 font-display font-bold text-xs">UPOZORENJE</span>
          <span className="bg-secondary text-white neo-border px-3 py-1 font-display font-bold text-xs">PROHODNO</span>
        </div>

        {/* Road Sections */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Stanje cesta</h2>
          <div className="space-y-3">
            {roadSections.map((section) => {
              const StatusIcon = getStatusIcon(section.status);
              return (
                <Card 
                  key={section.id}
                  variant="flat" 
                  className="neo-border-heavy neo-shadow neo-hover overflow-hidden"
                  onClick={() => navigate(`/transport/road/${section.id}`)}
                >
                  <div className="flex">
                    <div className={`${getStatusColor(section.status)} w-16 flex items-center justify-center`}>
                      <StatusIcon size={28} strokeWidth={2.5} className={section.status === 'warning' ? 'text-foreground' : 'text-white'} />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-display font-bold">{section.name}</p>
                          <span className={`inline-block mt-1 ${getStatusColor(section.status)} ${section.status === 'warning' ? 'text-foreground' : 'text-white'} neo-border px-2 py-0.5 font-display font-bold text-xs`}>
                            {section.statusLabel}
                          </span>
                        </div>
                        <ChevronRight size={24} strokeWidth={2.5} className="text-muted-foreground" />
                      </div>
                      {section.reason && (
                        <p className="font-body text-sm text-muted-foreground mt-2">{section.reason}</p>
                      )}
                      {section.until && (
                        <div className="flex items-center gap-1 mt-2">
                          <Clock size={14} strokeWidth={2.5} className="text-muted-foreground" />
                          <span className="font-body text-xs text-muted-foreground">{section.until}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Traffic Cameras */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Prometne kamere</h2>
          <div className="grid grid-cols-3 gap-3">
            {trafficCameras.map((camera) => (
              <Card key={camera.id} variant="flat" className="neo-border-heavy neo-hover overflow-hidden">
                <div className="aspect-video bg-muted relative flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full" style={{
                      backgroundImage: `repeating-linear-gradient(
                        0deg,
                        hsl(var(--border)),
                        hsl(var(--border)) 1px,
                        transparent 1px,
                        transparent 4px
                      )`
                    }} />
                  </div>
                  <Camera size={24} strokeWidth={2} className="text-muted-foreground" />
                  <div className="absolute top-1 right-1 flex items-center gap-1 bg-destructive px-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="font-display font-bold text-[8px] text-white">LIVE</span>
                  </div>
                </div>
                <div className="p-2">
                  <p className="font-display font-bold text-xs truncate">{camera.name}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Map CTA */}
        <Button 
          size="lg" 
          className="w-full bg-foreground text-background neo-border-heavy font-display text-lg py-6"
        >
          <MapPin size={24} strokeWidth={2.5} className="mr-3" />
          OTVORI KARTU
        </Button>
      </div>
    </MobileFrame>
  );
}
