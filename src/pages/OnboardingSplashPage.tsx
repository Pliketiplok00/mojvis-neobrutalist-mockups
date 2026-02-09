import { MobileFrame } from "@/components/layout/MobileFrame";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import mojvisLogo from "@/assets/mojvisapp.svg";

export default function OnboardingSplashPage() {
  const navigate = useNavigate();

  const handleLanguageSelect = (language: "hr" | "en") => {
    // Store language selection locally
    localStorage.setItem("app_language", language);
    navigate("/onboarding/mode");
  };

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {/* Logo */}
          <div className="relative mb-8">
            <img src={mojvisLogo} alt="MOJ VIS" className="w-48 h-48 rounded-2xl" />
          </div>


          {/* Tagline */}
          <p className="font-display font-bold text-white text-center mt-6">
            ZAJEDNICA U POKRETU
          </p>
        </div>

        {/* Language Selection */}
        <div className="p-6 bg-accent border-t border-white/20">
          <p className="font-display font-bold text-center text-sm text-accent-foreground/70 mb-4 uppercase">
            Odaberi jezik / Select language
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              size="lg" 
              className="bg-primary text-white hover:bg-primary/90 font-display text-lg py-6 rounded-lg font-bold"
              onClick={() => handleLanguageSelect("hr")}
            >
              HRVATSKI
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-display text-lg py-6 rounded-lg font-bold"
              onClick={() => handleLanguageSelect("en")}
            >
              ENGLISH
            </Button>
          </div>
          
          <p className="text-center font-body text-xs text-accent-foreground/60 mt-4">
            Jezik možeš promijeniti kasnije u Postavkama
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
