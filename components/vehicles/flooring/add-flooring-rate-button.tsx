"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddFlooringRateButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-3.5 py-2 text-[11.5px] font-semibold text-white shadow-md shadow-blue-950/40 transition hover:brightness-110 active:scale-[0.99]",
        className,
      )}
    >
      <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
      <span className="whitespace-nowrap">Add Flooring Rate To All Vehicles</span>
    </button>
  );
}
