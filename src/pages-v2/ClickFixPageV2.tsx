/**
 * Click Fix Page V2 - Uses original Mediterranean colors
 */

import { useState } from "react";
import { MobileFrameV2 } from "./components/MobileFrameV2";
import { AppHeaderV2 } from "./components/AppHeaderV2";
import { MainMenuV2 } from "./components/MainMenuV2";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, X, Send, Check, Home, Crosshair } from "lucide-react";

export default function ClickFixPageV2() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isValid = location && description.length >= 15;

  if (isSubmitted) {
    return (
      <MobileFrameV2>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[hsl(45,30%,96%)]">
          <div className="w-28 h-28 bg-[hsl(160,45%,38%)] border-[5px] border-[hsl(220,20%,10%)] shadow-[8px_8px_0_0_hsl(220,20%,10%)] flex items-center justify-center mb-8 -rotate-3">
            <Check className="w-14 h-14 text-white" strokeWidth={3} />
          </div>
          <h1 className="font-display text-3xl font-black uppercase text-center mb-4">PRIJAVA POSLANA!</h1>
          <p className="font-body text-[hsl(220,10%,40%)] text-center mb-8">Hvala na prijavi problema.<br/>Status možete pratiti u Inbox-u.</p>
          <button onClick={() => navigate("/v2")}
            className="bg-[hsl(210,80%,45%)] text-white border-[5px] border-[hsl(220,20%,10%)] shadow-[6px_6px_0_0_hsl(220,20%,10%)] px-8 py-4 font-display text-lg font-black uppercase flex items-center gap-3 transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0_0_hsl(220,20%,10%)]">
            <Home className="w-6 h-6" strokeWidth={2.5} />POVRATAK
          </button>
        </div>
      </MobileFrameV2>
    );
  }

  return (
    <MobileFrameV2>
      <AppHeaderV2 onMenuClick={() => setMenuOpen(true)} />
      <MainMenuV2 isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="flex flex-col min-h-screen">
        <div className="bg-[hsl(25,85%,55%)] p-5 border-b-[5px] border-[hsl(220,20%,10%)] flex items-center gap-4">
          <div className="w-16 h-16 bg-white border-[4px] border-[hsl(220,20%,10%)] shadow-[4px_4px_0_0_hsl(220,20%,10%)] flex items-center justify-center rotate-6">
            <MapPin className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black uppercase text-white">KLIKNI & POPRAVI</h1>
            <p className="font-body text-xs uppercase tracking-wider text-white/80">Prijavi problem na otoku</p>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-6 bg-[hsl(45,30%,96%)]">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[hsl(220,20%,10%)] text-white flex items-center justify-center font-display font-black">1</div>
              <h2 className="font-display font-black text-sm uppercase">Lokacija <span className="text-[hsl(12,55%,50%)]">*</span></h2>
            </div>
            {location ? (
              <div className="border-[4px] border-[hsl(220,20%,10%)] bg-white p-4 shadow-[4px_4px_0_0_hsl(210,80%,45%)]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[hsl(210,80%,45%)] border-[4px] border-[hsl(220,20%,10%)] flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-black">{location.label}</p>
                    <p className="font-body text-xs text-[hsl(220,10%,40%)]">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                  </div>
                  <button onClick={() => setLocation(null)} className="w-10 h-10 bg-[hsl(12,55%,50%)] border-[3px] border-[hsl(220,20%,10%)] flex items-center justify-center text-white">
                    <X className="w-5 h-5" strokeWidth={3} />
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setLocation({ lat: 43.0615, lng: 16.1839, label: "Vis, Hrvatska" })}
                className="w-full border-[4px] border-[hsl(220,20%,10%)] bg-white p-5 font-display font-black uppercase flex items-center justify-center gap-3 transition-all hover:bg-[hsl(45,92%,55%)] hover:shadow-[4px_4px_0_0_hsl(220,20%,10%)]">
                <Crosshair className="w-6 h-6" strokeWidth={2.5} />ODABERI LOKACIJU NA KARTI
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[hsl(220,20%,10%)] text-white flex items-center justify-center font-display font-black">2</div>
              <h2 className="font-display font-black text-sm uppercase">Fotografije (max 3)</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((_, index) => (
                <div key={index} className="relative aspect-square bg-[hsl(45,15%,90%)] border-[4px] border-[hsl(220,20%,10%)] flex items-center justify-center">
                  <Camera className="w-8 h-8 text-[hsl(220,10%,40%)]" />
                  <button onClick={() => setPhotos(photos.filter((_, i) => i !== index))} className="absolute -top-2 -right-2 w-7 h-7 bg-[hsl(12,55%,50%)] border-[3px] border-[hsl(220,20%,10%)] flex items-center justify-center">
                    <X className="w-4 h-4 text-white" strokeWidth={3} />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <button onClick={() => setPhotos([...photos, `photo_${photos.length + 1}`])}
                  className="aspect-square bg-white border-[4px] border-dashed border-[hsl(220,20%,10%)] flex flex-col items-center justify-center gap-2 transition-all hover:border-solid hover:bg-[hsl(45,92%,85%)]">
                  <Camera className="w-8 h-8 text-[hsl(220,10%,40%)]" strokeWidth={2} />
                  <span className="font-display text-[10px] font-black text-[hsl(220,10%,40%)]">DODAJ</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[hsl(220,20%,10%)] text-white flex items-center justify-center font-display font-black">3</div>
              <h2 className="font-display font-black text-sm uppercase">Opis problema <span className="text-[hsl(12,55%,50%)]">*</span></h2>
            </div>
            <textarea placeholder="Opiši problem detaljno (min. 15 znakova)..." value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border-[4px] border-[hsl(220,20%,10%)] bg-white p-4 font-body text-base min-h-[120px] resize-none focus:outline-none focus:shadow-[4px_4px_0_0_hsl(45,92%,55%)]" />
            <p className={`font-body text-xs mt-2 ${description.length >= 15 ? 'text-[hsl(160,45%,38%)] font-bold' : 'text-[hsl(220,10%,40%)]'}`}>
              {description.length}/15 znakova (minimum)
            </p>
          </div>

          <button onClick={() => isValid && setIsSubmitted(true)} disabled={!isValid}
            className={`w-full border-[5px] border-[hsl(220,20%,10%)] p-5 font-display text-xl font-black uppercase flex items-center justify-center gap-3 transition-all ${
              isValid ? 'bg-[hsl(210,80%,45%)] text-white shadow-[6px_6px_0_0_hsl(220,20%,10%)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0_0_hsl(220,20%,10%)]' 
              : 'bg-[hsl(45,15%,90%)] text-[hsl(220,10%,40%)] cursor-not-allowed'
            }`}>
            <Send className="w-6 h-6" strokeWidth={2.5} />POŠALJI PRIJAVU
          </button>
        </div>
      </main>
    </MobileFrameV2>
  );
}
