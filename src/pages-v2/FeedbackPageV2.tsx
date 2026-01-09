/**
 * Feedback Page V2
 * 
 * Bold form with numbered steps and geometric type selector.
 */

import { useState } from "react";
import { MobileFrameV2 } from "./components/MobileFrameV2";
import { AppHeaderV2 } from "./components/AppHeaderV2";
import { MainMenuV2 } from "./components/MainMenuV2";
import { useNavigate } from "react-router-dom";
import { Lightbulb, MessageSquare, ThumbsDown, ThumbsUp, Send, Check, Home } from "lucide-react";

const feedbackTypes = [
  { id: "idea", label: "IDEJA", icon: Lightbulb, color: "hsl(38,95%,50%)" },
  { id: "suggestion", label: "PRIJEDLOG", icon: MessageSquare, color: "hsl(220,85%,35%)" },
  { id: "criticism", label: "KRITIKA", icon: ThumbsDown, color: "hsl(8,65%,42%)" },
  { id: "praise", label: "POHVALA", icon: ThumbsUp, color: "hsl(150,55%,28%)" },
];

export default function FeedbackPageV2() {
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
      <MobileFrameV2>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[hsl(40,25%,92%)]">
          <div className="w-28 h-28 bg-[hsl(150,55%,28%)] border-[5px] border-[hsl(220,30%,8%)] shadow-[8px_8px_0_0_hsl(220,30%,8%)] flex items-center justify-center mb-8 rotate-3">
            <Check className="w-14 h-14 text-white" strokeWidth={3} />
          </div>
          <h1 className="font-display text-3xl font-black uppercase text-center mb-4">PORUKA POSLANA!</h1>
          <p className="font-body text-[hsl(220,15%,45%)] text-center mb-8">
            Hvala na povratnoj informaciji.<br/>Odgovor možete pratiti u Inbox-u.
          </p>
          <button 
            onClick={() => navigate("/v2")}
            className="bg-[hsl(220,85%,35%)] text-white border-[5px] border-[hsl(220,30%,8%)] shadow-[6px_6px_0_0_hsl(220,30%,8%)] px-8 py-4 font-display text-lg font-black uppercase flex items-center gap-3 transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0_0_hsl(220,30%,8%)]"
          >
            <Home className="w-6 h-6" strokeWidth={2.5} />
            POVRATAK
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
        {/* Header */}
        <div className="bg-[hsl(280,40%,65%)] p-5 border-b-[5px] border-[hsl(220,30%,8%)] flex items-center gap-4">
          <div className="w-16 h-16 bg-white border-[4px] border-[hsl(220,30%,8%)] shadow-[4px_4px_0_0_hsl(220,30%,8%)] flex items-center justify-center -rotate-6">
            <MessageSquare className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black uppercase text-white">FEEDBACK</h1>
            <p className="font-body text-xs uppercase tracking-wider text-white/80">Ideje • Prijedlozi • Pohvale</p>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-6 bg-[hsl(40,25%,92%)]">
          {/* Step 1: Type */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[hsl(220,30%,8%)] text-white flex items-center justify-center font-display font-black">1</div>
              <h2 className="font-display font-black text-sm uppercase">Vrsta poruke <span className="text-[hsl(8,65%,42%)]">*</span></h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`border-[4px] border-[hsl(220,30%,8%)] p-4 flex flex-col items-center gap-2 transition-all ${
                      isSelected 
                        ? 'shadow-[4px_4px_0_0_hsl(220,30%,8%)] -translate-x-1 -translate-y-1' 
                        : 'bg-white hover:bg-[hsl(40,12%,85%)]'
                    }`}
                    style={{ backgroundColor: isSelected ? type.color : undefined }}
                  >
                    <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : ''}`} strokeWidth={2.5} />
                    <span className={`font-display text-xs font-black ${isSelected ? 'text-white' : ''}`}>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Subject */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[hsl(220,30%,8%)] text-white flex items-center justify-center font-display font-black">2</div>
              <h2 className="font-display font-black text-sm uppercase">Naslov <span className="text-[hsl(8,65%,42%)]">*</span></h2>
            </div>
            <input 
              type="text"
              placeholder="Unesi naslov poruke..."
              className="w-full border-[4px] border-[hsl(220,30%,8%)] bg-white p-4 font-body text-base focus:outline-none focus:shadow-[4px_4px_0_0_hsl(38,95%,50%)]"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Step 3: Message */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[hsl(220,30%,8%)] text-white flex items-center justify-center font-display font-black">3</div>
              <h2 className="font-display font-black text-sm uppercase">Poruka <span className="text-[hsl(8,65%,42%)]">*</span></h2>
            </div>
            <textarea 
              placeholder="Napiši svoju poruku..."
              className="w-full border-[4px] border-[hsl(220,30%,8%)] bg-white p-4 font-body text-base min-h-[150px] resize-none focus:outline-none focus:shadow-[4px_4px_0_0_hsl(38,95%,50%)]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button 
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full border-[5px] border-[hsl(220,30%,8%)] p-5 font-display text-xl font-black uppercase flex items-center justify-center gap-3 transition-all ${
              isValid 
                ? 'bg-[hsl(220,85%,35%)] text-white shadow-[6px_6px_0_0_hsl(220,30%,8%)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0_0_hsl(220,30%,8%)]' 
                : 'bg-[hsl(40,12%,85%)] text-[hsl(220,15%,45%)] cursor-not-allowed'
            }`}
          >
            <Send className="w-6 h-6" strokeWidth={2.5} />
            POŠALJI PORUKU
          </button>
        </div>
      </main>
    </MobileFrameV2>
  );
}
