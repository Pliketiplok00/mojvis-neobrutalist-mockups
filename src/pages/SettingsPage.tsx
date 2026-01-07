import { useState } from "react";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, User, Building2, Check, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n, Locale } from "@/lib/i18n";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { locale, setLocale, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Load saved preferences
  const [userMode, setUserMode] = useState<string>(
    localStorage.getItem("user_mode") || "visitor"
  );
  const [municipality, setMunicipality] = useState<string>(
    localStorage.getItem("municipality") || ""
  );

  const handleLanguageChange = (lang: Locale) => {
    setLocale(lang);
  };

  const handleUserModeChange = (mode: string) => {
    setUserMode(mode);
    localStorage.setItem("user_mode", mode);
    if (mode === "visitor") {
      localStorage.removeItem("municipality");
      setMunicipality("");
    }
  };

  const handleMunicipalityChange = (muni: string) => {
    setMunicipality(muni);
    localStorage.setItem("municipality", muni);
  };

  return (
    <MobileFrame>
      <AppHeader title={t("settings")} onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="p-4 space-y-6">
        {/* Language Setting */}
        <Card variant="flat" className="neo-border-heavy p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary neo-border flex items-center justify-center">
              <Globe size={20} strokeWidth={2.5} className="text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold uppercase">{t("language")}</h3>
              <p className="font-body text-xs text-muted-foreground">
                {locale === "hr" ? "Odaberi jezik aplikacije" : "Select app language"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleLanguageChange("hr")}
              className={`neo-border-heavy p-3 flex items-center justify-center gap-2 transition-all ${
                locale === "hr" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card hover:bg-muted"
              }`}
            >
              <span className="font-display font-bold text-sm">{t("croatian").toUpperCase()}</span>
              {locale === "hr" && <Check size={16} strokeWidth={3} />}
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`neo-border-heavy p-3 flex items-center justify-center gap-2 transition-all ${
                locale === "en" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card hover:bg-muted"
              }`}
            >
              <span className="font-display font-bold text-sm">{t("english").toUpperCase()}</span>
              {locale === "en" && <Check size={16} strokeWidth={3} />}
            </button>
          </div>
        </Card>

        {/* User Mode Setting */}
        <Card variant="flat" className="neo-border-heavy p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-secondary neo-border flex items-center justify-center">
              <User size={20} strokeWidth={2.5} className="text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold uppercase">Način korištenja</h3>
              <p className="font-body text-xs text-muted-foreground">Posjetitelj ili stanovnik</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => handleUserModeChange("visitor")}
              className={`w-full neo-border-heavy p-4 flex items-center gap-4 transition-all text-left ${
                userMode === "visitor" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card hover:bg-muted"
              }`}
            >
              <div className="flex-1">
                <p className="font-display font-bold">POSJETITELJ</p>
                <p className={`font-body text-xs ${userMode === "visitor" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  Opće obavijesti i događaji
                </p>
              </div>
              {userMode === "visitor" && <Check size={20} strokeWidth={3} />}
            </button>
            
            <button
              onClick={() => handleUserModeChange("local")}
              className={`w-full neo-border-heavy p-4 flex items-center gap-4 transition-all text-left ${
                userMode === "local" 
                  ? "bg-secondary text-secondary-foreground" 
                  : "bg-card hover:bg-muted"
              }`}
            >
              <div className="flex-1">
                <p className="font-display font-bold">LOKALNI STANOVNIK</p>
                <p className={`font-body text-xs ${userMode === "local" ? "text-secondary-foreground/80" : "text-muted-foreground"}`}>
                  + Općinske obavijesti
                </p>
              </div>
              {userMode === "local" && <Check size={20} strokeWidth={3} />}
            </button>
          </div>
        </Card>

        {/* Municipality Setting (only for locals) */}
        {userMode === "local" && (
          <Card variant="flat" className="neo-border-heavy p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal neo-border flex items-center justify-center">
                <Building2 size={20} strokeWidth={2.5} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold uppercase">Općina</h3>
                <p className="font-body text-xs text-muted-foreground">Odaberi svoju općinu</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleMunicipalityChange("vis")}
                className={`neo-border-heavy p-4 flex flex-col items-center gap-2 transition-all ${
                  municipality === "vis" 
                    ? "bg-teal text-primary-foreground" 
                    : "bg-card hover:bg-muted"
                }`}
              >
                <span className="font-display font-bold">VIS</span>
                {municipality === "vis" && <Check size={16} strokeWidth={3} />}
              </button>
              <button
                onClick={() => handleMunicipalityChange("komiza")}
                className={`neo-border-heavy p-4 flex flex-col items-center gap-2 transition-all ${
                  municipality === "komiza" 
                    ? "bg-teal text-primary-foreground" 
                    : "bg-card hover:bg-muted"
                }`}
              >
                <span className="font-display font-bold">KOMIŽA</span>
                {municipality === "komiza" && <Check size={16} strokeWidth={3} />}
              </button>
            </div>
          </Card>
        )}

        {/* App Info */}
        <Card variant="flat" className="neo-border p-4 bg-muted">
          <p className="font-body text-sm text-center text-muted-foreground">
            MOJ VIS v3.0
          </p>
          <p className="font-body text-xs text-center text-muted-foreground mt-1">
            Građanski servis otoka Visa
          </p>
        </Card>
      </div>
    </MobileFrame>
  );
}