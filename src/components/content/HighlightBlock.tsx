import { ReactNode } from "react";
import { Info, AlertTriangle, Lightbulb, Bell } from "lucide-react";

interface HighlightBlockProps {
  title?: string;
  body: string;
  variant?: "info" | "warning" | "tip" | "notice";
  icon?: ReactNode;
}

const variantStyles = {
  info: {
    bg: "bg-accent",
    iconBg: "bg-primary",
    iconColor: "text-primary-foreground",
    Icon: Info,
  },
  warning: {
    bg: "bg-orange/20",
    iconBg: "bg-destructive",
    iconColor: "text-destructive-foreground",
    Icon: AlertTriangle,
  },
  tip: {
    bg: "bg-secondary/30",
    iconBg: "bg-secondary",
    iconColor: "text-secondary-foreground",
    Icon: Lightbulb,
  },
  notice: {
    bg: "bg-lavender/30",
    iconBg: "bg-lavender",
    iconColor: "text-foreground",
    Icon: Bell,
  },
};

export function HighlightBlock({ title, body, variant = "info", icon }: HighlightBlockProps) {
  const style = variantStyles[variant];
  const IconComponent = style.Icon;

  return (
    <section className={`border-b-4 border-foreground ${style.bg} p-5`}>
      <div className="flex gap-4">
        <div 
          className={`flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground ${style.iconBg}`}
          style={{ borderWidth: "3px" }}
        >
          {icon || <IconComponent className={`h-5 w-5 ${style.iconColor}`} strokeWidth={2.5} />}
        </div>
        <div className="flex-1">
          {title && (
            <h3 className="mb-1 font-display text-sm font-bold uppercase tracking-tight">
              {title}
            </h3>
          )}
          <p className="font-body text-sm leading-relaxed">
            {body}
          </p>
        </div>
      </div>
    </section>
  );
}
