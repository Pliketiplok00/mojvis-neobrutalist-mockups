import { useState } from "react";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Send, Image } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ClickFixReportPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const issueType = searchParams.get("type") || "pothole";

  const typeLabels: Record<string, string> = {
    pothole: "RUPA NA CESTI",
    garbage: "SMEĆE",
    lighting: "NEISPRAVNA RASVJETA",
    parking: "PROBLEM S PARKINGOM",
    greenery: "ZELENILO",
    water: "PROBLEM S VODOM",
  };

  return (
    <MobileFrame>
      <AppHeader title="NOVA PRIJAVA" showBack onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="p-4 space-y-6">
        {/* Issue Type Banner */}
        <div className="bg-destructive neo-border-heavy p-4">
          <p className="font-display font-bold text-xl text-white text-center">
            {typeLabels[issueType]}
          </p>
        </div>

        {/* Photo Area */}
        <Card variant="flat" className="neo-border-heavy overflow-hidden">
          <div className="aspect-video bg-muted flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  hsl(var(--border)),
                  hsl(var(--border)) 2px,
                  transparent 2px,
                  transparent 12px
                )`
              }} />
            </div>
            <Image size={48} strokeWidth={2} className="text-muted-foreground mb-2" />
            <p className="font-body text-sm text-muted-foreground">Dodaj fotografiju</p>
          </div>
          <div className="flex neo-border-t">
            <button className="flex-1 p-4 flex items-center justify-center gap-2 neo-border-r hover:bg-muted transition-colors">
              <Camera size={20} strokeWidth={2.5} />
              <span className="font-display font-bold text-sm">KAMERA</span>
            </button>
            <button className="flex-1 p-4 flex items-center justify-center gap-2 hover:bg-muted transition-colors">
              <Image size={20} strokeWidth={2.5} />
              <span className="font-display font-bold text-sm">GALERIJA</span>
            </button>
          </div>
        </Card>

        {/* Location */}
        <Card variant="flat" className="neo-border-heavy neo-shadow p-4">
          <label className="font-display font-bold text-sm text-muted-foreground block mb-2">
            LOKACIJA
          </label>
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-primary flex items-center justify-center neo-border-heavy flex-shrink-0">
              <MapPin size={24} strokeWidth={3} className="text-primary-foreground" />
            </div>
            <Input 
              placeholder="Unesi adresu ili koristi GPS"
              className="flex-1 neo-border-heavy font-body"
              defaultValue="Korzo 12, Rijeka"
            />
          </div>
        </Card>

        {/* Description */}
        <Card variant="flat" className="neo-border-heavy neo-shadow p-4">
          <label className="font-display font-bold text-sm text-muted-foreground block mb-2">
            OPIS PROBLEMA
          </label>
          <Textarea 
            placeholder="Opiši problem detaljnije..."
            className="neo-border-heavy font-body min-h-[120px]"
          />
        </Card>

        {/* Contact Info */}
        <Card variant="flat" className="neo-border-heavy neo-shadow p-4">
          <label className="font-display font-bold text-sm text-muted-foreground block mb-2">
            KONTAKT (OPCIONALNO)
          </label>
          <Input 
            type="email"
            placeholder="Email za obavijesti o statusu"
            className="neo-border-heavy font-body"
          />
        </Card>

        {/* Submit Button */}
        <Button 
          size="lg" 
          className="w-full bg-secondary text-secondary-foreground neo-border-heavy neo-shadow font-display text-lg py-6"
          onClick={() => navigate("/click-fix")}
        >
          <Send size={24} strokeWidth={2.5} className="mr-3" />
          POŠALJI PRIJAVU
        </Button>

        <p className="text-center font-body text-sm text-muted-foreground">
          Prijava će biti proslijeđena nadležnoj službi
        </p>
      </div>
    </MobileFrame>
  );
}
