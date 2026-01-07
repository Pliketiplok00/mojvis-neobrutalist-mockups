import { Loader2, AlertTriangle, Inbox, Calendar, Ship, Bus, FileQuestion } from "lucide-react";
import { Button } from "./button";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Učitavanje..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div className="w-16 h-16 border-4 border-foreground bg-accent flex items-center justify-center animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin" strokeWidth={2.5} />
      </div>
      <p className="mt-4 font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ 
  title = "Ups! Nešto je pošlo po zlu", 
  message = "Došlo je do greške pri učitavanju. Molimo pokušaj ponovno.",
  onRetry,
  retryLabel = "Pokušaj ponovno"
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div className="relative">
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-destructive" />
        <div className="relative w-20 h-20 border-4 border-foreground bg-background flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-destructive" strokeWidth={2.5} />
        </div>
      </div>
      <h3 className="mt-6 font-display text-lg font-bold uppercase text-center">
        {title}
      </h3>
      <p className="mt-2 font-body text-sm text-muted-foreground text-center max-w-xs">
        {message}
      </p>
      {onRetry && (
        <div className="relative mt-6">
          <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
          <Button 
            onClick={onRetry}
            className="relative border-3 border-foreground font-display uppercase"
            style={{ borderWidth: "3px" }}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

type EmptyStateVariant = "inbox" | "events" | "transport" | "generic";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const emptyStateIcons: Record<EmptyStateVariant, typeof Inbox> = {
  inbox: Inbox,
  events: Calendar,
  transport: Ship,
  generic: FileQuestion,
};

const emptyStateColors: Record<EmptyStateVariant, string> = {
  inbox: "bg-primary",
  events: "bg-accent",
  transport: "bg-secondary",
  generic: "bg-muted",
};

export function EmptyState({ 
  variant = "generic",
  title = "Nema podataka", 
  message = "Trenutno nema dostupnih podataka.",
  action
}: EmptyStateProps) {
  const Icon = emptyStateIcons[variant];
  const bgColor = emptyStateColors[variant];
  
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div className="relative">
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground/20" />
        <div className={`relative w-20 h-20 border-4 border-foreground ${bgColor} flex items-center justify-center -rotate-3`}>
          <Icon className="h-10 w-10 text-white" strokeWidth={2} />
        </div>
      </div>
      <h3 className="mt-6 font-display text-lg font-bold uppercase text-center">
        {title}
      </h3>
      <p className="mt-2 font-body text-sm text-muted-foreground text-center max-w-xs">
        {message}
      </p>
      {action && (
        <div className="relative mt-6">
          <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
          <Button 
            onClick={action.onClick}
            className="relative border-3 border-foreground font-display uppercase"
            style={{ borderWidth: "3px" }}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

// Rate limit warning component
interface RateLimitWarningProps {
  remaining: number;
  max: number;
}

export function RateLimitWarning({ remaining, max }: RateLimitWarningProps) {
  const isLow = remaining <= 1;
  const isExhausted = remaining === 0;
  
  if (isExhausted) {
    return (
      <div className="relative">
        <div className="absolute inset-0 translate-x-1 translate-y-1 bg-destructive" />
        <div className="relative border-4 border-foreground bg-destructive/10 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" strokeWidth={2.5} />
            <div>
              <p className="font-display font-bold text-sm uppercase">Dnevni limit dosegnut</p>
              <p className="font-body text-xs text-muted-foreground">
                Dosegnuo/la si dnevni limit od {max} poruke. Pokušaj ponovno sutra.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`border-t-2 border-foreground pt-4 ${isLow ? 'text-destructive' : 'text-muted-foreground'}`}>
      <p className="font-body text-xs text-center">
        Preostalo poruka danas: <span className="font-bold">{remaining}/{max}</span>
      </p>
    </div>
  );
}
