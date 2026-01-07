import { useState } from "react";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, AlertTriangle, Trash2, Lightbulb, Car, TreeDeciduous, Droplets, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const issueCategories = [
  { id: "pothole", label: "RUPA", icon: AlertTriangle, color: "bg-destructive" },
  { id: "garbage", label: "SMEĆE", icon: Trash2, color: "bg-secondary" },
  { id: "lighting", label: "RASVJETA", icon: Lightbulb, color: "bg-accent" },
  { id: "parking", label: "PARKING", icon: Car, color: "bg-primary" },
  { id: "greenery", label: "ZELENILO", icon: TreeDeciduous, color: "bg-secondary" },
  { id: "water", label: "VODA", icon: Droplets, color: "bg-teal" },
];

export default function ClickFixPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MobileFrame>
      <AppHeader title="KLIKNI & POPRAVI" onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="p-4 space-y-6">
        {/* Camera Capture Area */}
        <Card variant="flat" className="neo-border-heavy neo-shadow-lg overflow-hidden">
          <div className="aspect-[4/3] bg-muted flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 20px,
                  hsl(var(--border)) 20px,
                  hsl(var(--border)) 21px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 20px,
                  hsl(var(--border)) 20px,
                  hsl(var(--border)) 21px
                )`
              }} />
            </div>
            <Camera size={64} strokeWidth={2} className="text-muted-foreground mb-4" />
            <p className="font-display text-lg font-bold text-muted-foreground">FOTOGRAFIRAJ PROBLEM</p>
          </div>
          <div className="p-4 bg-foreground">
            <Button 
              size="lg" 
              className="w-full bg-accent text-accent-foreground neo-border-heavy font-display text-lg py-6"
            >
              <Camera size={24} strokeWidth={3} className="mr-3" />
              OTVORI KAMERU
            </Button>
          </div>
        </Card>

        {/* Location */}
        <Card variant="flat" className="neo-border-heavy neo-shadow p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary flex items-center justify-center neo-border-heavy">
              <MapPin size={28} strokeWidth={3} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-sm text-muted-foreground">LOKACIJA</p>
              <p className="font-display font-bold text-lg">Korzo 12, Rijeka</p>
            </div>
          </div>
        </Card>

        {/* Issue Categories */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Vrsta problema</h2>
          <div className="grid grid-cols-3 gap-3">
            {issueCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => navigate(`/click-fix/report?type=${category.id}`)}
                  className={`${category.color} neo-border-heavy neo-shadow neo-hover p-4 flex flex-col items-center gap-2`}
                >
                  <Icon size={32} strokeWidth={2.5} className="text-white" />
                  <span className="font-display font-bold text-xs text-white">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Moje prijave</h2>
          <div className="space-y-3">
            {[
              { type: "pothole", location: "Ul. Fiumara 5", status: "U OBRADI", color: "bg-accent" },
              { type: "lighting", location: "Trg 128. brigade", status: "RIJEŠENO", color: "bg-secondary" },
            ].map((report, i) => (
              <Card key={i} variant="flat" className="neo-border-heavy neo-shadow p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${i === 0 ? 'bg-destructive' : 'bg-accent'} neo-border-heavy flex items-center justify-center`}>
                    {i === 0 ? <AlertTriangle size={24} strokeWidth={2.5} className="text-white" /> : <Lightbulb size={24} strokeWidth={2.5} className="text-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold">{report.location}</p>
                    <p className="font-body text-sm text-muted-foreground">Prije 2 dana</p>
                  </div>
                  <span className={`${report.color} neo-border px-3 py-1 font-display font-bold text-xs`}>
                    {report.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAB */}
        <button className="fixed bottom-24 right-6 w-16 h-16 bg-primary neo-border-heavy neo-shadow-lg neo-hover flex items-center justify-center">
          <Plus size={32} strokeWidth={3} className="text-primary-foreground" />
        </button>
      </div>
    </MobileFrame>
  );
}
