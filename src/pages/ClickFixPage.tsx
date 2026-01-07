import { useState } from "react";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, X, Send, Check, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClickFixPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showNoPhotoWarning, setShowNoPhotoWarning] = useState(false);

  const isValid = location && description.length >= 15;

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
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <MobileFrame>
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 bg-secondary neo-border-heavy neo-shadow-lg flex items-center justify-center mb-8">
            <Check size={48} strokeWidth={3} className="text-secondary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl text-center mb-4">PRIJAVA POSLANA</h1>
          <p className="font-body text-muted-foreground text-center mb-8">
            Tvoja prijava je zaprimljena. Status možeš pratiti u Inboxu.
          </p>
          <Button 
            size="lg"
            className="bg-primary text-primary-foreground neo-border-heavy neo-shadow font-display text-lg py-6 px-8"
            onClick={() => navigate("/home")}
          >
            <Home size={24} strokeWidth={2.5} className="mr-3" />
            POVRATAK NA POČETNU
          </Button>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <AppHeader title="KLIKNI & POPRAVI" onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="p-4 space-y-6">
        {/* Location (Required) */}
        <div>
          <h2 className="font-display font-bold text-sm text-muted-foreground mb-3 uppercase">
            1. Lokacija <span className="text-destructive">*</span>
          </h2>
          {location ? (
            <Card variant="flat" className="neo-border-heavy neo-shadow p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary flex items-center justify-center neo-border-heavy">
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
                  className="w-10 h-10 bg-muted neo-border flex items-center justify-center"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
            </Card>
          ) : (
            <Button 
              size="lg" 
              className="w-full bg-muted text-foreground neo-border-heavy font-display py-6"
              onClick={handleGetLocation}
            >
              <MapPin size={24} strokeWidth={2.5} className="mr-3" />
              ODABERI LOKACIJU NA KARTI
            </Button>
          )}
        </div>

        {/* Photos (Optional, max 3) */}
        <div>
          <h2 className="font-display font-bold text-sm text-muted-foreground mb-3 uppercase">
            2. Fotografije (opcionalno, max 3)
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div 
                key={index}
                className="aspect-square bg-muted neo-border-heavy relative flex items-center justify-center"
              >
                <Camera size={24} className="text-muted-foreground" />
                <button 
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive neo-border flex items-center justify-center"
                >
                  <X size={14} strokeWidth={3} className="text-destructive-foreground" />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <button 
                onClick={handleAddPhoto}
                className="aspect-square bg-card neo-border-heavy neo-hover flex flex-col items-center justify-center gap-2"
              >
                <Camera size={28} strokeWidth={2} className="text-muted-foreground" />
                <span className="font-display text-[10px] font-bold text-muted-foreground">DODAJ</span>
              </button>
            )}
          </div>
        </div>

        {/* Description (Required, min 15 chars) */}
        <div>
          <h2 className="font-display font-bold text-sm text-muted-foreground mb-3 uppercase">
            3. Opis problema <span className="text-destructive">*</span>
          </h2>
          <Textarea 
            placeholder="Opiši problem detaljno (min. 15 znakova)..."
            className="neo-border-heavy font-body min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className={`font-body text-xs mt-2 ${description.length >= 15 ? 'text-secondary' : 'text-muted-foreground'}`}>
            {description.length}/15 znakova (minimum)
          </p>
        </div>

        {/* No Photo Warning Dialog */}
        {showNoPhotoWarning && (
          <Card variant="flat" className="neo-border-heavy neo-shadow bg-accent p-4">
            <p className="font-display font-bold mb-2">NEMA FOTOGRAFIJA</p>
            <p className="font-body text-sm mb-4">
              Jesi li siguran/na? Prijave s fotografijama imaju veću šansu za rješavanje.
            </p>
            <div className="flex gap-3">
              <Button 
                size="sm"
                className="flex-1 neo-border-heavy font-display"
                variant="outline"
                onClick={handleAddPhoto}
              >
                DODAJ FOTO
              </Button>
              <Button 
                size="sm"
                className="flex-1 bg-foreground text-background neo-border-heavy font-display"
                onClick={() => {
                  setShowNoPhotoWarning(false);
                  setIsSubmitted(true);
                }}
              >
                POŠALJI SVEJEDNO
              </Button>
            </div>
          </Card>
        )}

        {/* Submit */}
        <Button 
          size="lg" 
          className="w-full bg-primary text-primary-foreground neo-border-heavy neo-shadow font-display text-lg py-6"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          <Send size={24} strokeWidth={2.5} className="mr-3" />
          POŠALJI PRIJAVU
        </Button>
      </div>
    </MobileFrame>
  );
}
