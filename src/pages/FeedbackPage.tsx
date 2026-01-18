import { useState } from "react";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RateLimitWarning } from "@/components/ui/states";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useI18n } from "@/lib/i18n";
import { Lightbulb, MessageSquare, ThumbsDown, ThumbsUp, Send, Check, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const feedbackTypes = [
  { id: "idea", label: "NOVA IDEJA", icon: Lightbulb, color: "bg-accent" },
  { id: "suggestion", label: "PRIJEDLOG", icon: MessageSquare, color: "bg-primary" },
  { id: "criticism", label: "KRITIKA", icon: ThumbsDown, color: "bg-destructive" },
  { id: "praise", label: "POHVALA", icon: ThumbsUp, color: "bg-secondary" },
];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const rateLimit = useRateLimit("feedback");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isValid = selectedType && subject.trim() && message.trim() && rateLimit.canSubmit;

  const handleSubmit = () => {
    if (!isValid) return;
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
          <h1 className="font-display font-bold text-3xl text-center mb-4">{t("messageSent").toUpperCase()}</h1>
          <p className="font-body text-muted-foreground text-center mb-8">
            {t("messageSentDesc")}
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
        <section className="border-b-4 border-foreground bg-lavender p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-background border-4 border-foreground flex items-center justify-center -rotate-3">
              <MessageSquare size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold uppercase">Povratne informacije</h1>
              <p className="font-body text-xs uppercase tracking-widest">Ideje • Prijedlozi • Pohvale</p>
            </div>
          </div>
        </section>

        <div className="p-5 space-y-6">
          {/* Feedback Type (Required) */}
          <div>
            <h2 className="font-display font-bold text-xs text-muted-foreground mb-3 uppercase tracking-widest border-b-2 border-foreground pb-2">
              1. Vrsta poruke <span className="text-destructive">*</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <div key={type.id} className="relative">
                    <div className={`absolute inset-0 translate-x-2 translate-y-2 ${isSelected ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
                    <button
                      onClick={() => setSelectedType(type.id)}
                      className={`relative w-full border-4 border-foreground p-4 flex flex-col items-center gap-2 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-1 active:translate-y-1 ${
                        isSelected ? `${type.color}` : "bg-background"
                      }`}
                    >
                      <Icon 
                        size={28} 
                        strokeWidth={2.5} 
                        className={isSelected ? "text-white" : "text-foreground"}
                      />
                      <span className={`font-display font-bold text-xs ${
                        isSelected ? "text-white" : "text-foreground"
                      }`}>
                        {type.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject (Required) */}
          <div>
            <h2 className="font-display font-bold text-xs text-muted-foreground mb-3 uppercase tracking-widest border-b-2 border-foreground pb-2">
              2. Naslov <span className="text-destructive">*</span>
            </h2>
            <Input 
              placeholder="Unesi naslov poruke..."
              className="border-4 border-foreground font-body bg-background focus:ring-0 focus:border-foreground"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message (Required) */}
          <div>
            <h2 className="font-display font-bold text-xs text-muted-foreground mb-3 uppercase tracking-widest border-b-2 border-foreground pb-2">
              3. Poruka <span className="text-destructive">*</span>
            </h2>
            <Textarea 
              placeholder="Napiši svoju poruku..."
              className="border-4 border-foreground font-body min-h-[150px] bg-background focus:ring-0 focus:border-foreground"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="relative">
            <Button 
              size="lg" 
              className="relative w-full bg-primary text-primary-foreground border-4 border-foreground font-display text-lg py-6 shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              onClick={handleSubmit}
              disabled={!isValid}
            >
              <Send size={24} strokeWidth={2.5} className="mr-3" />
              POŠALJI PORUKU
            </Button>
          </div>

          {/* Rate limit indicator */}
          <RateLimitWarning remaining={rateLimit.remaining} max={rateLimit.max} />
        </div>
      </main>
    </MobileFrame>
  );
}
