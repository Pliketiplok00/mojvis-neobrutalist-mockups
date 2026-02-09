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
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#399FD9' }}>
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {/* Logo */}
          <div className="relative mb-8">
            <img src={mojvisLogo} alt="MOJ VIS" className="w-48 h-48 rounded-2xl" />
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-5xl text-center mb-4 tracking-tight text-white">
            MOJVIS
          </h1>
          
          <p className="font-body text-center text-white/80 text-lg mb-2">
            GRAĐANSKI SERVIS
          </p>

          {/* Tagline */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 mt-6 border border-white/30">
            <p className="font-display font-bold text-white text-center">
              ZAJEDNICA U POKRETU
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
