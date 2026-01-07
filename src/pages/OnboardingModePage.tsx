import { MobileFrame } from "@/components/layout/MobileFrame";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, MapPin, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const modes = [
  {
    id: "visitor",
    icon: User,
    title: "POSJETITELJ",
    description: "Primaj opće obavijesti, kulturne događaje i hitne informacije",
    features: [
      "Opće obavijesti",
      "Kulturni događaji",
      "Hitne / urgentne obavijesti",
    ],
    color: "bg-primary",
  },
  {
    id: "local",
    icon: MapPin,
    title: "LOKALNI STANOVNIK",
    description: "Sve kao posjetitelj + općinske obavijesti za tvoju općinu",
    features: [
      "Sve obavijesti za posjetitelje",
      "Općinske obavijesti",
      "Općinske poruke u inboxu",
    ],
    color: "bg-secondary",
  },
];

export default function OnboardingModePage() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedMode) return;
    
    // Store user mode
    localStorage.setItem("user_mode", selectedMode);
    
    if (selectedMode === "visitor") {
      // Visitors go directly to home
      navigate("/home");
    } else {
      // Locals need to select municipality
      navigate("/onboarding/municipality");
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 neo-border-b">
          <button 
            onClick={() => navigate("/onboarding")}
            className="flex items-center gap-2 font-display font-bold text-sm mb-4"
          >
            <ArrowLeft size={20} strokeWidth={3} />
            NATRAG
          </button>
          <h1 className="font-display font-bold text-3xl">KAKO KORISTIŠ APP?</h1>
          <p className="font-body text-muted-foreground mt-2">
            Odabir možeš promijeniti kasnije u Postavkama
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex-1 p-6 space-y-4">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            
            return (
              <Card
                key={mode.id}
                variant="flat"
                className={`neo-border-heavy neo-shadow neo-hover p-0 overflow-hidden cursor-pointer transition-all ${
                  isSelected ? "ring-4 ring-offset-2 ring-foreground" : ""
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <div className={`${mode.color} p-4 flex items-center gap-4`}>
                  <div className="w-14 h-14 bg-white/20 neo-border-heavy flex items-center justify-center">
                    <Icon size={28} strokeWidth={2.5} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display font-bold text-xl text-white">{mode.title}</h2>
                    <p className="font-body text-sm text-white/80">{mode.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-8 h-8 bg-white neo-border flex items-center justify-center">
                      <Check size={20} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="p-4 bg-card">
                  <ul className="space-y-2">
                    {mode.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${mode.color}`} />
                        <span className="font-body text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="px-6 mb-4">
          <div className="flex gap-2">
            <div className="flex-1 h-2 bg-foreground neo-border" />
            <div className="flex-1 h-2 bg-foreground neo-border" />
          </div>
          <p className="font-body text-xs text-muted-foreground text-center mt-2">KORAK 2 OD 2</p>
        </div>

        {/* CTA */}
        <div className="p-6 bg-card neo-border-t">
          <Button 
            size="lg" 
            className="w-full bg-foreground text-background neo-border-heavy font-display text-lg py-6"
            onClick={handleContinue}
            disabled={!selectedMode}
          >
            {selectedMode === "visitor" ? "ZAVRŠI" : "NASTAVI"}
            <ArrowRight size={24} strokeWidth={3} className="ml-3" />
          </Button>
        </div>
      </div>
    </MobileFrame>
  );
}
