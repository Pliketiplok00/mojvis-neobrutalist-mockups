import { MobileFrame } from "@/components/layout/MobileFrame";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OnboardingSplashPage() {
  const navigate = useNavigate();

  const handleLanguageSelect = (language: "hr" | "en") => {
    // Store language selection locally
    localStorage.setItem("app_language", language);
    navigate("/onboarding/mode");
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                hsl(var(--border)),
                hsl(var(--border)) 2px,
                transparent 2px,
                transparent 20px
              )`
            }} />
          </div>

          {/* Logo Mark */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-primary neo-border-heavy neo-shadow-lg flex items-center justify-center">
              <MapPin size={64} strokeWidth={2.5} className="text-primary-foreground" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent neo-border-heavy" />
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-secondary neo-border-heavy" />
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-5xl text-center mb-4 tracking-tight">
            MOJVIS
          </h1>
          
          <p className="font-body text-center text-muted-foreground text-lg mb-2">
            GRAĐANSKI SERVIS
          </p>

          {/* Tagline */}
          <div className="bg-foreground neo-border-heavy px-6 py-3 mt-6">
            <p className="font-display font-bold text-background text-center">
              TVOJ GRAD. TVOJ GLAS.
            </p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="p-6 bg-card neo-border-t">
          <p className="font-display font-bold text-center text-sm text-muted-foreground mb-4 uppercase">
            Odaberi jezik / Select language
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground neo-border-heavy neo-shadow font-display text-lg py-6"
              onClick={() => handleLanguageSelect("hr")}
            >
              HRVATSKI
            </Button>
            <Button 
              size="lg" 
              className="bg-secondary text-secondary-foreground neo-border-heavy neo-shadow font-display text-lg py-6"
              onClick={() => handleLanguageSelect("en")}
            >
              ENGLISH
            </Button>
          </div>
          
          <p className="text-center font-body text-xs text-muted-foreground mt-4">
            Jezik možeš promijeniti kasnije u Postavkama
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
