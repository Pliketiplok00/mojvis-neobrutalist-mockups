import { MobileFrame } from "@/components/layout/MobileFrame";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OnboardingSplashPage() {
  const navigate = useNavigate();

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

        {/* Feature Pills */}
        <div className="px-6 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {["OBAVIJESTI", "DOGAĐAJI", "PRIJAVE", "PROMET", "POVRATNE INFO"].map((feature) => (
              <span 
                key={feature}
                className="bg-muted neo-border px-3 py-1 font-display font-bold text-xs"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-6 bg-card neo-border-t">
          <Button 
            size="lg" 
            className="w-full bg-primary text-primary-foreground neo-border-heavy neo-shadow font-display text-lg py-6"
            onClick={() => navigate("/onboarding/mode")}
          >
            ZAPOČNI
            <ArrowRight size={24} strokeWidth={3} className="ml-3" />
          </Button>
          
          <p className="text-center font-body text-sm text-muted-foreground mt-4">
            Već imaš račun?{" "}
            <button className="font-display font-bold underline">PRIJAVI SE</button>
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
