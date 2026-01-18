import { useState } from "react";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RateLimitWarning } from "@/components/ui/states";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useI18n } from "@/lib/i18n";
import { Camera, MapPin, X, Send, Check, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClickFixPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const rateLimit = useRateLimit("click_fix");
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showNoPhotoWarning, setShowNoPhotoWarning] = useState(false);

  const isValid = location && description.length >= 15 && rateLimit.canSubmit;

  const handleGetLocation = () => {
    // Mock location - in real app would use GPS
    setLocation({
      lat: 43.0615,
      lng: 16.1839,
      label: "Vis, Hrvatska"
    });
  };

  const handleAddPhoto = () => {
    if (photos.length < 3) {
      // Mock photo add - in real app would use camera/gallery
      setPhotos([...photos, `photo_${photos.length + 1}`]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!isValid) return;
    
    if (photos.length === 0 && !showNoPhotoWarning) {
      setShowNoPhotoWarning(true);
      return;
    }
    
    // Submit report
    rateLimit.recordSubmission();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <MobileFrame>
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 bg-secondary neo-border-heavy neo-shadow-lg flex items-center justify-center mb-8">
            <Check size={48} strokeWidth={3} className="text-secondary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl text-center mb-4">{t("reportSent").toUpperCase()}</h1>
          <p className="font-body text-muted-foreground text-center mb-8">
            {t("reportSentDesc")}
          </p>
          <Button 
            size="lg"
            className="bg-primary text-primary-foreground neo-border-heavy neo-shadow font-display text-lg py-6 px-8"
            onClick={() => navigate("/home")}
          >
            <Home size={24} strokeWidth={2.5} className="mr-3" />
            {t("returnHome").toUpperCase()}
          </Button>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <AppHeader onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col bg-muted/30">
        {/* Header */}
        <section className="border-b-4 border-foreground bg-orange p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-background border-4 border-foreground flex items-center justify-center -rotate-3">
              <MapPin size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase text-foreground">Klikni & Popravi</h1>
              <p className="font-body text-xs uppercase tracking-widest text-foreground/80">Prijavi problem na otoku</p>
            </div>
          </div>
        </section>

        <div className="p-5 space-y-6">
          {/* Location (Required) */}
          <div>
            <h2 className="font-display font-bold text-xs text-muted-foreground mb-3 uppercase tracking-widest border-b-2 border-foreground pb-2">
              1. Lokacija <span className="text-destructive">*</span>
            </h2>
            {location ? (
              <div className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-primary" />
                <div className="relative bg-background border-4 border-foreground p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary flex items-center justify-center border-4 border-foreground rotate-3">
                      <MapPin size={28} strokeWidth={3} className="text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-bold">{location.label}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </p>
                    </div>
                    <button 
                      onClick={() => setLocation(null)}
                      className="w-10 h-10 bg-muted border-3 border-foreground flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                      style={{ borderWidth: "3px" }}
                    >
                      <X size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
                <Button 
                  size="lg" 
                  className="relative w-full bg-muted text-foreground border-4 border-foreground font-display py-6 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                  onClick={handleGetLocation}
                >
                  <MapPin size={24} strokeWidth={2.5} className="mr-3" />
                  ODABERI LOKACIJU NA KARTI
                </Button>
              </div>
            )}
          </div>

          {/* Photos (Optional, max 3) */}
          <div>
            <h2 className="font-display font-bold text-xs text-muted-foreground mb-3 uppercase tracking-widest border-b-2 border-foreground pb-2">
              2. Fotografije (opcionalno, max 3)
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div 
                  key={index}
                  className="relative aspect-square bg-muted border-4 border-foreground flex items-center justify-center"
                >
                  <Camera size={24} className="text-muted-foreground" />
                  <button 
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-destructive border-3 border-foreground flex items-center justify-center"
                    style={{ borderWidth: "3px" }}
                  >
                    <X size={14} strokeWidth={3} className="text-destructive-foreground" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <button 
                  onClick={handleAddPhoto}
                  className="aspect-square bg-background border-4 border-foreground flex flex-col items-center justify-center gap-2 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:translate-x-1 active:translate-y-1"
                >
                  <Camera size={28} strokeWidth={2} className="text-muted-foreground" />
                  <span className="font-display text-[10px] font-bold text-muted-foreground">DODAJ</span>
                </button>
              )}
            </div>
          </div>

          {/* Description (Required, min 15 chars) */}
          <div>
            <h2 className="font-display font-bold text-xs text-muted-foreground mb-3 uppercase tracking-widest border-b-2 border-foreground pb-2">
              3. Opis problema <span className="text-destructive">*</span>
            </h2>
            <Textarea 
              placeholder="Opiši problem detaljno (min. 15 znakova)..."
              className="border-4 border-foreground font-body min-h-[120px] bg-background focus:ring-0 focus:border-foreground"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className={`font-body text-xs mt-2 ${description.length >= 15 ? 'text-secondary font-bold' : 'text-muted-foreground'}`}>
              {description.length}/15 znakova (minimum)
            </p>
          </div>

          {/* No Photo Warning Dialog */}
          {showNoPhotoWarning && (
            <div className="relative">
              <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
              <div className="relative bg-accent border-4 border-foreground p-4">
                <p className="font-display font-bold mb-2 uppercase">Nema fotografija</p>
                <p className="font-body text-sm mb-4">
                  Jesi li siguran/na? Prijave s fotografijama imaju veću šansu za rješavanje.
                </p>
                <div className="flex gap-3">
                  <Button 
                    size="sm"
                    className="flex-1 border-3 border-foreground font-display bg-background text-foreground hover:bg-muted"
                    style={{ borderWidth: "3px" }}
                    onClick={handleAddPhoto}
                  >
                    DODAJ FOTO
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1 bg-foreground text-background border-3 border-foreground font-display"
                    style={{ borderWidth: "3px" }}
                    onClick={() => {
                      setShowNoPhotoWarning(false);
                      setIsSubmitted(true);
                    }}
                  >
                    POŠALJI SVEJEDNO
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="relative">
            <Button 
              size="lg" 
              className="relative w-full bg-primary text-primary-foreground border-4 border-foreground font-display text-lg py-6 shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_hsl(var(--foreground))]"
              onClick={handleSubmit}
              disabled={!isValid}
            >
              <Send size={24} strokeWidth={2.5} className="mr-3" />
              {t("sendReport").toUpperCase()}
            </Button>
          </div>

          {/* Rate limit indicator */}
          <RateLimitWarning remaining={rateLimit.remaining} max={rateLimit.max} />
        </div>
      </main>
    </MobileFrame>
  );
}
