"use client";

import { useState } from "react";
import { FileTextIcon, Loader2 } from "lucide-react";
import { CardShell } from "@/components/dashboard/card-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  onDeskDeal: () => Promise<void>;
};

export default function QuickActionCard({ onDeskDeal }: Props) {
  const [isDesking, setIsDesking] = useState(false);

  const handleClick = async () => {
    setIsDesking(true);
    try {
      await onDeskDeal();
    } finally {
      setIsDesking(false);
    }
  };

  return (
    <CardShell className="p-4 bg-[#0b1329]/40 border border-slate-800/60 rounded-xl">
      {/* Small Section Header */}
      <div className="mb-2 text-[13px] font-bold tracking-[0.15em] text-slate-500">
        QUICK ACTION
      </div>

      {/* Main Structural Wrapper - Row Split Layout */}
      <div className="flex flex-row items-center justify-between gap-4">
        
        {/* Left Side: Copywrite Information Blocks */}
        <div className="flex flex-col gap-1.5 flex-1 w-full max-w-[350px]">
          <h3 className="text-[30px] font-bold tracking-tight text-white leading-tight">
            Mark as Sold &amp; Create a Deal Jacket
          </h3>
          <p className="text-[12px] text-slate-400 font-normal leading-normal">
            Select a vehicle that has been sold to create a new deal jacket.
          </p>
        </div>

        {/* Right Side: The Interactive Graphic & Action Button Node */}
        <div className="flex flex-col items-center gap-2 shrink-0 max-w-[200px] w-full justify-center">
          
          {/* Blueprint Illustration Icon Node */}
          <div className="relative group overflow-hidden flex items-center justify-center h-20 w-20 rounded-xl bg-blue-600/10 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)] mb-1">
            {/* Subtle Gradient Glow Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-100" />
            
            {/* Minimal SVG Blueprint Representation as seen in image_0d22cc.jpg */}
            {/* <svg 
              className="h-7 w-7 text-blue-400/90 relative z-10" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg> */}
            <FileTextIcon
              className="h-15 w-15 text-blue-400/90 relative z-10"
            />

            {/* Micro Dollar Badge Indicator */}
            <div className="absolute bottom-1.5 right-1.5 h-4 w-4 bg-blue-500 rounded-full border border-[#0d1527] flex items-center justify-center shadow-md z-20">
              <span className="text-[9px] font-black text-white">$</span>
            </div>
          </div>

          {/* Trigger Action Node Button */}
          <Button
            type="button"
            onClick={handleClick}
            disabled={isDesking}
            className={cn(
              "h-9 px-4 rounded-md bg-blue-600 text-[12px] font-bold text-white shadow-md shadow-blue-900/40 border border-blue-500/30",
              "hover:bg-blue-500 hover:shadow-blue-500/20 transition-all duration-150 active:scale-[0.98]",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            {isDesking ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Desking...</span>
              </span>
            ) : (
              "Desk a Deal"
            )}
          </Button>
          
        </div>
      </div>
    </CardShell>
  );
}