/**
 * Feedback Page V2 - Uses original Mediterranean colors
 */

import { useState } from "react";
import { MobileFrameV2 } from "./components/MobileFrameV2";
import { AppHeaderV2 } from "./components/AppHeaderV2";
import { MainMenuV2 } from "./components/MainMenuV2";
import { useNavigate } from "react-router-dom";
import { Lightbulb, MessageSquare, ThumbsDown, ThumbsUp, Send, Check, Home } from "lucide-react";

const feedbackTypes = [
  { id: "idea", label: "IDEJA", icon: Lightbulb, color: "hsl(45,92%,55%)" },
  { id: "suggestion", label: "PRIJEDLOG", icon: MessageSquare, color: "hsl(210,80%,45%)" },
  { id: "criticism", label: "KRITIKA", icon: ThumbsDown, color: "hsl(12,55%,50%)" },
  { id: "praise", label: "POHVALA", icon: ThumbsUp, color: "hsl(160,45%,38%)" },
];

export default function FeedbackPageV2() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isValid = selectedType && subject.trim() && message.trim();

  if (isSubmitted) {
    return (
      <MobileFrameV2>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[hsl(45,30%,96%)]">
          <div className="w-28 h-28 bg-[hsl(160,45%,38%)] border-[5px] border-[hsl(220,20%,10%)] shadow-[8px_8px_0_0_hsl(220,20%,10%)] flex items-center justify-center mb-8 rotate-3">
            <Check className="w-14 h-14 text-white" strokeWidth={3} />
          </div>
          <h1 className="font-display text-3xl font-black uppercase text-center mb-4">PORUKA POSLANA!</h1>
          <p className="font-body text-[hsl(220,10%,40%)] text-center mb-8">Hvala na povratnoj informaciji.<br/>Odgovor možete pratiti u Inbox-u.</p>
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
        <div className="bg-[hsl(270,35%,70%)] p-5 border-b-[5px] border-[hsl(220,20%,10%)] flex items-center gap-4">
          <div className="w-16 h-16 bg-white border-[4px] border-[hsl(220,20%,10%)] shadow-[4px_4px_0_0_hsl(220,20%,10%)] flex items-center justify-center -rotate-6">
            <MessageSquare className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black uppercase text-white">FEEDBACK</h1>
            <p className="font-body text-xs uppercase tracking-wider text-white/80">Ideje • Prijedlozi • Pohvale</p>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-6 bg-[hsl(45,30%,96%)]">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[hsl(220,20%,10%)] text-white flex items-center justify-center font-display font-black">1</div>
              <h2 className="font-display font-black text-sm uppercase">Vrsta poruke <span className="text-[hsl(12,55%,50%)]">*</span></h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button key={type.id} onClick={() => setSelectedType(type.id)}
                    className={`border-[4px] border-[hsl(220,20%,10%)] p-4 flex flex-col items-center gap-2 transition-all ${
                      isSelected ? 'shadow-[4px_4px_0_0_hsl(220,20%,10%)] -translate-x-1 -translate-y-1' : 'bg-white hover:bg-[hsl(45,15%,90%)]'
                    }`} style={{ backgroundColor: isSelected ? type.color : undefined }}>
                    <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : ''}`} strokeWidth={2.5} />
                    <span className={`font-display text-xs font-black ${isSelected ? 'text-white' : ''}`}>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[hsl(220,20%,10%)] text-white flex items-center justify-center font-display font-black">2</div>
              <h2 className="font-display font-black text-sm uppercase">Naslov <span className="text-[hsl(12,55%,50%)]">*</span></h2>
            </div>
            <input type="text" placeholder="Unesi naslov poruke..." value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full border-[4px] border-[hsl(220,20%,10%)] bg-white p-4 font-body text-base focus:outline-none focus:shadow-[4px_4px_0_0_hsl(45,92%,55%)]" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[hsl(220,20%,10%)] text-white flex items-center justify-center font-display font-black">3</div>
              <h2 className="font-display font-black text-sm uppercase">Poruka <span className="text-[hsl(12,55%,50%)]">*</span></h2>
            </div>
            <textarea placeholder="Napiši svoju poruku..." value={message} onChange={(e) => setMessage(e.target.value)}
              className="w-full border-[4px] border-[hsl(220,20%,10%)] bg-white p-4 font-body text-base min-h-[150px] resize-none focus:outline-none focus:shadow-[4px_4px_0_0_hsl(45,92%,55%)]" />
          </div>

          <button onClick={() => isValid && setIsSubmitted(true)} disabled={!isValid}
            className={`w-full border-[5px] border-[hsl(220,20%,10%)] p-5 font-display text-xl font-black uppercase flex items-center justify-center gap-3 transition-all ${
              isValid ? 'bg-[hsl(210,80%,45%)] text-white shadow-[6px_6px_0_0_hsl(220,20%,10%)] hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[9px_9px_0_0_hsl(220,20%,10%)]' 
              : 'bg-[hsl(45,15%,90%)] text-[hsl(220,10%,40%)] cursor-not-allowed'
            }`}>
            <Send className="w-6 h-6" strokeWidth={2.5} />POŠALJI PORUKU
          </button>
        </div>
      </main>
    </MobileFrameV2>
  );
}
