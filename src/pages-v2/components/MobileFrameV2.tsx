/**
 * Mobile Frame V2
 * 
 * Alternative layout frame with dark sidebar accent strip.
 * Uses original Mediterranean color palette.
 */

import { ReactNode } from "react";

interface MobileFrameV2Props {
  children: ReactNode;
}

export function MobileFrameV2({ children }: MobileFrameV2Props) {
  return (
    <div className="min-h-screen bg-[hsl(45,30%,96%)]">
      <div className="mx-auto max-w-md relative">
        {/* Left accent strip */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[hsl(220,20%,10%)]" />
        <div className="ml-2">
          {children}
        </div>
      </div>
    </div>
  );
}
