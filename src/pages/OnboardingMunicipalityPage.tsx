import { MobileFrame } from "@/components/layout/MobileFrame";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const municipalities = [
  {
    id: "komiza",
    name: "KOMIŽA",
    description: "Općina Komiža",
  },
  {
    id: "vis",
    name: "VIS",
    description: "Grad Vis",
  },
];

export default function OnboardingMunicipalityPage() {
  const navigate = useNavigate();
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);

  const handleFinish = () => {
    if (!selectedMunicipality) return;
    
    // Store municipality selection
    localStorage.setItem("municipality", selectedMunicipality);
    navigate("/home");
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 neo-border-b">
          <button 
            onClick={() => navigate("/onboarding/mode")}
            className="flex items-center gap-2 font-display font-bold text-sm mb-4"
          >
            <ArrowLeft size={20} strokeWidth={3} />
            NATRAG
          </button>
          <h1 className="font-display font-bold text-3xl">ODABERI OPĆINU</h1>
          <p className="font-body text-muted-foreground mt-2">
            Odaberi općinu čije obavijesti želiš primati
          </p>
        </div>

        {/* Municipality Selection */}
        <div className="flex-1 p-6 space-y-4">
          {municipalities.map((municipality) => {
            const isSelected = selectedMunicipality === municipality.id;
            
            return (
              <Card
                key={municipality.id}
                variant="flat"
                className={`neo-border-heavy neo-shadow neo-hover p-0 overflow-hidden cursor-pointer transition-all ${
                  isSelected ? "ring-4 ring-offset-2 ring-foreground" : ""
                }`}
                onClick={() => setSelectedMunicipality(municipality.id)}
              >
                <div className={`p-6 flex items-center gap-4 ${isSelected ? "bg-primary" : "bg-card"}`}>
                  <div className={`w-16 h-16 neo-border-heavy flex items-center justify-center ${
                    isSelected ? "bg-white/20" : "bg-muted"
                  }`}>
                    <Building2 
                      size={32} 
                      strokeWidth={2.5} 
                      className={isSelected ? "text-white" : "text-foreground"} 
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className={`font-display font-bold text-2xl ${
                      isSelected ? "text-white" : "text-foreground"
                    }`}>
                      {municipality.name}
                    </h2>
                    <p className={`font-body text-sm ${
                      isSelected ? "text-white/80" : "text-muted-foreground"
                    }`}>
                      {municipality.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-10 h-10 bg-white neo-border-heavy flex items-center justify-center">
                      <Check size={24} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          
          <p className="font-body text-sm text-muted-foreground text-center mt-6">
            Možeš odabrati samo jednu općinu. Izbor možeš promijeniti kasnije u Postavkama.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 mb-4">
          <div className="flex gap-2">
            <div className="flex-1 h-2 bg-foreground neo-border" />
            <div className="flex-1 h-2 bg-foreground neo-border" />
            <div className="flex-1 h-2 bg-foreground neo-border" />
          </div>
          <p className="font-body text-xs text-muted-foreground text-center mt-2">KORAK 3 OD 3</p>
        </div>

        {/* CTA */}
        <div className="p-6 bg-card neo-border-t">
          <Button 
            size="lg" 
            className="w-full bg-foreground text-background neo-border-heavy font-display text-lg py-6"
            onClick={handleFinish}
            disabled={!selectedMunicipality}
          >
            ZAVRŠI POSTAVLJANJE
            <ArrowRight size={24} strokeWidth={3} className="ml-3" />
          </Button>
        </div>
      </div>
    </MobileFrame>
  );
}
