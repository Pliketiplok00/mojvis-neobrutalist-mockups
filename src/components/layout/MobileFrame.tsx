import { ReactNode } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">
        {children}
      </div>
    </div>
  );
}
