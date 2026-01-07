import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CardItem {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  image?: string;
  link?: string;
  external?: boolean;
}

interface CardListBlockProps {
  title?: string;
  cards: CardItem[];
  columns?: 1 | 2;
}

export function CardListBlock({ title, cards, columns = 1 }: CardListBlockProps) {
  const navigate = useNavigate();

  const handleCardClick = (card: CardItem) => {
    if (!card.link) return;
    if (card.external) {
      window.open(card.link, "_blank", "noopener,noreferrer");
    } else {
      navigate(card.link);
    }
  };

  return (
    <section className="border-b-4 border-foreground p-5">
      {title && (
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-tight">
          {title}
        </h2>
      )}
      <div className={`grid gap-3 ${columns === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            disabled={!card.link}
            className={`flex flex-col border-3 border-foreground bg-background text-left transition-all ${
              card.link 
                ? "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" 
                : ""
            }`}
            style={{ borderWidth: "3px" }}
          >
            {card.image && (
              <div className="h-24 w-full overflow-hidden border-b-2 border-foreground">
                <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex flex-1 items-center gap-3 p-3">
              <div className="flex-1">
                <h3 className="font-display text-sm font-bold uppercase">{card.title}</h3>
                {card.description && (
                  <p className="mt-1 font-body text-xs text-muted-foreground line-clamp-2">
                    {card.description}
                  </p>
                )}
                {card.meta && (
                  <span className="mt-1 inline-block font-body text-[10px] uppercase tracking-wide text-muted-foreground">
                    {card.meta}
                  </span>
                )}
              </div>
              {card.link && <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={3} />}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
