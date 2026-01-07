import { ReactNode } from "react";

interface ContentHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  images?: string[];
  variant?: "simple" | "media";
}

export function ContentHeader({ title, subtitle, icon, images, variant = "simple" }: ContentHeaderProps) {
  if (variant === "media" && images && images.length > 0) {
    return (
      <header className="relative border-b-4 border-foreground">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={images[0]} 
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="font-display text-2xl font-bold uppercase leading-tight text-background">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 font-body text-sm text-background/80 uppercase tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="border-b-4 border-foreground bg-primary p-5">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border-3 border-foreground bg-background" style={{ borderWidth: "3px" }}>
            {icon}
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold uppercase leading-tight text-primary-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 font-body text-sm text-primary-foreground/80 uppercase tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
