import { useState } from "react";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isValid = selectedType && subject.trim() && message.trim();

  const handleSubmit = () => {
    if (!isValid) return;
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <MobileFrame>
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="w-24 h-24 bg-secondary neo-border-heavy neo-shadow-lg flex items-center justify-center mb-8">
            <Check size={48} strokeWidth={3} className="text-secondary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl text-center mb-4">PORUKA POSLANA</h1>
          <p className="font-body text-muted-foreground text-center mb-8">
            Tvoja povratna informacija je zaprimljena. Status možeš pratiti u Inboxu.
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
      <AppHeader title="POVRATNE INFO" onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="p-4 space-y-6">
        {/* Feedback Type (Required) */}
        <div>
          <h2 className="font-display font-bold text-sm text-muted-foreground mb-3 uppercase">
            1. Vrsta povratne informacije <span className="text-destructive">*</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {feedbackTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`neo-border-heavy neo-shadow neo-hover p-4 flex flex-col items-center gap-2 transition-all ${
                    isSelected ? `${type.color} ring-4 ring-offset-2 ring-foreground` : "bg-card"
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
              );
            })}
          </div>
        </div>

        {/* Subject (Required) */}
        <div>
          <h2 className="font-display font-bold text-sm text-muted-foreground mb-3 uppercase">
            2. Naslov <span className="text-destructive">*</span>
          </h2>
          <Input 
            placeholder="Unesi naslov poruke..."
            className="neo-border-heavy font-body"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Message (Required) */}
        <div>
          <h2 className="font-display font-bold text-sm text-muted-foreground mb-3 uppercase">
            3. Poruka <span className="text-destructive">*</span>
          </h2>
          <Textarea 
            placeholder="Napiši svoju poruku..."
            className="neo-border-heavy font-body min-h-[150px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Submit */}
        <Button 
          size="lg" 
          className="w-full bg-primary text-primary-foreground neo-border-heavy neo-shadow font-display text-lg py-6"
          onClick={handleSubmit}
          disabled={!isValid}
        >
          <Send size={24} strokeWidth={2.5} className="mr-3" />
          POŠALJI PORUKU
        </Button>

        {/* Rate limit note */}
        <p className="font-body text-xs text-muted-foreground text-center">
          Možeš poslati najviše 3 poruke dnevno.
        </p>
      </div>
    </MobileFrame>
  );
}
