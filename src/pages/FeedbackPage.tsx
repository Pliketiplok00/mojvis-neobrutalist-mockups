import { useState } from "react";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { AppHeader } from "@/components/layout/AppHeader";
import { MainMenu } from "@/components/layout/MainMenu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Star, Send, MessageSquare, TrendingUp, Users } from "lucide-react";

const ratingOptions = [
  { value: 1, label: "LOŠE" },
  { value: 2, label: "SLABO" },
  { value: 3, label: "OK" },
  { value: 4, label: "DOBRO" },
  { value: 5, label: "ODLIČNO" },
];

const feedbackCategories = [
  { id: "services", label: "KOMUNALNE USLUGE", icon: TrendingUp },
  { id: "transport", label: "PROMET", icon: Users },
  { id: "events", label: "DOGAĐANJA", icon: Star },
  { id: "general", label: "OPĆENITO", icon: MessageSquare },
];

export default function FeedbackPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <MobileFrame>
      <AppHeader title="POVRATNE INFO" onMenuClick={() => setMenuOpen(true)} />
      <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div className="p-4 space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="flat" className="bg-secondary neo-border-heavy neo-shadow p-4 text-center">
            <ThumbsUp size={32} strokeWidth={2.5} className="mx-auto mb-2 text-secondary-foreground" />
            <p className="font-display font-bold text-3xl text-secondary-foreground">847</p>
            <p className="font-body text-xs text-secondary-foreground/80">POZITIVNIH</p>
          </Card>
          <Card variant="flat" className="bg-destructive neo-border-heavy neo-shadow p-4 text-center">
            <ThumbsDown size={32} strokeWidth={2.5} className="mx-auto mb-2 text-destructive-foreground" />
            <p className="font-display font-bold text-3xl text-destructive-foreground">123</p>
            <p className="font-body text-xs text-destructive-foreground/80">NEGATIVNIH</p>
          </Card>
        </div>

        {/* Category Selection */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Kategorija</h2>
          <div className="grid grid-cols-2 gap-3">
            {feedbackCategories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`neo-border-heavy neo-shadow neo-hover p-4 flex flex-col items-center gap-2 transition-colors ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-card'
                  }`}
                >
                  <Icon size={28} strokeWidth={2.5} />
                  <span className="font-display font-bold text-xs">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Ocjena</h2>
          <div className="flex gap-2">
            {ratingOptions.map((option) => {
              const isSelected = selectedRating === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedRating(option.value)}
                  className={`flex-1 neo-border-heavy neo-hover py-3 flex flex-col items-center gap-1 transition-colors ${
                    isSelected ? 'bg-accent neo-shadow' : 'bg-card'
                  }`}
                >
                  <Star 
                    size={24} 
                    strokeWidth={2.5} 
                    fill={isSelected ? 'currentColor' : 'none'}
                    className={isSelected ? 'text-foreground' : 'text-muted-foreground'}
                  />
                  <span className={`font-display font-bold text-[10px] ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment */}
        <Card variant="flat" className="neo-border-heavy neo-shadow p-4">
          <label className="font-display font-bold text-sm text-muted-foreground block mb-2">
            KOMENTAR
          </label>
          <Textarea 
            placeholder="Podijeli svoje mišljenje s nama..."
            className="neo-border-heavy font-body min-h-[120px]"
          />
        </Card>

        {/* Submit */}
        <Button 
          size="lg" 
          className="w-full bg-primary text-primary-foreground neo-border-heavy neo-shadow font-display text-lg py-6"
        >
          <Send size={24} strokeWidth={2.5} className="mr-3" />
          POŠALJI POVRATNU INFO
        </Button>

        {/* Recent Feedback */}
        <div>
          <h2 className="font-display font-bold text-xl mb-4 uppercase">Nedavne povratne info</h2>
          <div className="space-y-3">
            {[
              { category: "PROMET", comment: "Odlična nova autobusna linija!", rating: 5, time: "Prije 2h" },
              { category: "KOMUNALNE", comment: "Brzo riješen problem s rasvjetom", rating: 4, time: "Prije 5h" },
            ].map((feedback, i) => (
              <Card key={i} variant="flat" className="neo-border-heavy p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="bg-muted neo-border px-2 py-1 font-display font-bold text-xs">
                    {feedback.category}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star 
                        key={j} 
                        size={14} 
                        strokeWidth={2.5}
                        fill={j < feedback.rating ? 'currentColor' : 'none'}
                        className={j < feedback.rating ? 'text-accent' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                </div>
                <p className="font-body text-sm mb-2">{feedback.comment}</p>
                <p className="font-body text-xs text-muted-foreground">{feedback.time}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
