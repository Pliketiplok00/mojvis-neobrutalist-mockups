import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MapPin, Navigation, Share2, Bell, Construction, ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";

const roadData: Record<string, {
  name: string;
  status: string;
  statusLabel: string;
  reason: string;
  description: string;
  detour: string | null;
  startTime: string;
  endTime: string;
  authority: string;
  contact: string;
}> = {
  liburnijska: {
    name: "Liburnijska cesta",
    status: "closed",
    statusLabel: "ZATVORENO",
    reason: "Radovi na cjevovodu",
    description: "Potpuna obustava prometa zbog hitnih radova na vodovodnoj mreži. Očekuje se završetak radova do 18:00 sati.",
    detour: "Korištenje obilaznice preko Krešimirove ulice i Titovog trga",
    startTime: "08:00",
    endTime: "18:00",
    authority: "Komunalno društvo Rijeka",
    contact: "051/555-123"
  },
  kruzna: {
    name: "Kružna ulica",
    status: "warning",
    statusLabel: "SMANJEN PROMET",
    reason: "Asfaltiranje kolnika",
    description: "Jednosmjerni promet zbog radova na obnovi asfalta. Promet se odvija naizmjenično.",
    detour: null,
    startTime: "09:00",
    endTime: "15:00",
    authority: "Ceste Rijeka d.o.o.",
    contact: "051/555-456"
  },
};

export default function TransportRoadDetailPage() {
  const { roadId } = useParams();
  const road = roadData[roadId || "liburnijska"] || roadData.liburnijska;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed": return "bg-destructive";
      case "warning": return "bg-accent";
      default: return "bg-secondary";
    }
  };

  return (
    <MobileFrame>
      <AppHeader title={road.name} showBack />
      
      <div className="p-4 space-y-6">
        {/* Status Banner */}
        <Card variant="flat" className={`${getStatusColor(road.status)} neo-border-heavy neo-shadow-lg p-6`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 neo-border-heavy flex items-center justify-center">
              <AlertTriangle size={36} strokeWidth={2.5} className={road.status === 'warning' ? 'text-foreground' : 'text-white'} />
            </div>
            <div>
              <p className={`font-display font-bold text-2xl ${road.status === 'warning' ? 'text-foreground' : 'text-white'}`}>
                {road.statusLabel}
              </p>
              <p className={`font-body ${road.status === 'warning' ? 'text-foreground/80' : 'text-white/80'}`}>
                {road.reason}
              </p>
            </div>
          </div>
        </Card>

        {/* Time Info */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="flat" className="neo-border-heavy p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted neo-border flex items-center justify-center">
                <Clock size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">POČETAK</p>
                <p className="font-display font-bold text-lg">{road.startTime}</p>
              </div>
            </div>
          </Card>
          <Card variant="flat" className="neo-border-heavy p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary neo-border flex items-center justify-center">
                <Clock size={20} strokeWidth={2.5} className="text-white" />
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">ZAVRŠETAK</p>
                <p className="font-display font-bold text-lg">{road.endTime}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Description */}
        <Card variant="flat" className="neo-border-heavy neo-shadow p-4">
          <h3 className="font-display font-bold text-sm text-muted-foreground mb-2">OPIS</h3>
          <p className="font-body">{road.description}</p>
        </Card>

        {/* Detour */}
        {road.detour && (
          <Card variant="flat" className="neo-border-heavy neo-shadow p-4 border-l-4 border-l-primary">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary neo-border flex items-center justify-center flex-shrink-0">
                <Navigation size={20} strokeWidth={2.5} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-muted-foreground mb-1">OBILAZNICA</h3>
                <p className="font-body">{road.detour}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Map Placeholder */}
        <Card variant="flat" className="neo-border-heavy overflow-hidden">
          <div className="aspect-video bg-muted relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 30px,
                  hsl(var(--border)) 30px,
                  hsl(var(--border)) 31px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 30px,
                  hsl(var(--border)) 30px,
                  hsl(var(--border)) 31px
                )`
              }} />
            </div>
            <div className="text-center">
              <MapPin size={48} strokeWidth={2} className="mx-auto text-muted-foreground mb-2" />
              <p className="font-display font-bold text-muted-foreground">KARTA LOKACIJE</p>
            </div>
            {/* Route indicator */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-foreground neo-border-heavy p-3 flex items-center justify-between">
                <span className="font-display font-bold text-sm text-background">OBILAZNICA</span>
                <ArrowRight size={20} strokeWidth={3} className="text-background" />
              </div>
            </div>
          </div>
        </Card>

        {/* Authority Info */}
        <Card variant="flat" className="neo-border-heavy p-4">
          <div className="flex items-center gap-3 mb-3">
            <Construction size={20} strokeWidth={2.5} className="text-muted-foreground" />
            <h3 className="font-display font-bold text-sm text-muted-foreground">NADLEŽNA SLUŽBA</h3>
          </div>
          <p className="font-display font-bold">{road.authority}</p>
          <p className="font-body text-muted-foreground">{road.contact}</p>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="neo-border-heavy neo-hover font-display">
            <Share2 size={18} strokeWidth={2.5} className="mr-2" />
            PODIJELI
          </Button>
          <Button className="bg-accent text-accent-foreground neo-border-heavy neo-hover font-display">
            <Bell size={18} strokeWidth={2.5} className="mr-2" />
            OBAVIJESTI ME
          </Button>
        </div>
      </div>
    </MobileFrame>
  );
}
