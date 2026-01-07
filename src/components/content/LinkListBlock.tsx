import { ChevronRight, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LinkItem {
  id: string;
  title: string;
  link: string;
  external?: boolean;
}

interface LinkListBlockProps {
  title?: string;
  links: LinkItem[];
}

export function LinkListBlock({ title, links }: LinkListBlockProps) {
  const navigate = useNavigate();

  const handleClick = (item: LinkItem) => {
    if (item.external) {
      window.open(item.link, "_blank", "noopener,noreferrer");
    } else {
      navigate(item.link);
    }
  };

  return (
    <section className="border-b-4 border-foreground p-5">
      {title && (
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-tight">
          {title}
        </h2>
      )}
      <div className="space-y-2">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => handleClick(link)}
            className="flex w-full items-center justify-between border-3 border-foreground bg-background p-3 text-left transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{ borderWidth: "3px" }}
          >
            <span className="font-display text-sm font-bold uppercase">{link.title}</span>
            {link.external ? (
              <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={3} />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
