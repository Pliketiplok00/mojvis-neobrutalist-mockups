/**
 * Mobile Frame V2
 * 
 * Alternative layout frame with dark sidebar accent strip
 * and more aggressive visual treatment.
 */

import { ReactNode } from "react";

interface MobileFrameV2Props {
  children: ReactNode;
}

export function MobileFrameV2({ children }: MobileFrameV2Props) {
  return (
    <div className="min-h-screen bg-[hsl(40,25%,92%)]">
      <div className="mx-auto max-w-md relative">
        {/* Left accent strip */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[hsl(220,30%,8%)]" />
        <div className="ml-2">
          {children}
        </div>
      </div>
    </div>
  );
}
