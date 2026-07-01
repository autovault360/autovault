"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const KPI_COLOR_SWATCHES = [
  "#3aa0ff",
  "#23d18b",
  "#ff9f43",
  "#a07bff",
  "#ff5470",
  "#f9ca24",
  "#ff6b81",
  "#00d2d3",
  "#54a0ff",
  "#5f27cd",
  "#10ac84",
  "#ee5a24",
  "#0abde3",
  "#c8d6e5",
  "#ff9ff3",
  "#feca57",
  "#dfe6e9",
  "#b2bec3",
  "#74b9ff",
  "#fdcb6e",
  "#e17055",
  "#636e72",
  "#2d3436",
  "#ffffff",
] as const;

type KpiColorPickerPopupProps = {
  open: boolean;
  anchorRect: DOMRect | null;
  currentColor: string;
  onPickColor: (color: string) => void;
  onReset: () => void;
  onClose: () => void;
};

export default function KpiColorPickerPopup({
  open,
  anchorRect,
  currentColor,
  onPickColor,
  onReset,
  onClose,
}: KpiColorPickerPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open || !anchorRect) return null;

  const popW = 220;
  const popH = 220;
  let top = anchorRect.bottom + 8;
  let left = anchorRect.left;
  if (left + popW > window.innerWidth) left = window.innerWidth - popW - 12;
  if (top + popH > window.innerHeight) top = anchorRect.top - popH - 8;

  const normalizedCurrent = currentColor.toLowerCase();

  return (
    <div
      ref={popupRef}
      className="fixed z-300 w-[216px] rounded-[14px] border border-white/10 bg-[#161d2b] p-3.5 pb-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
      style={{ top, left }}
      role="dialog"
      aria-label="Number color"
    >
      <div className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Number Color
      </div>

      <div className="mb-2 grid grid-cols-8 gap-1.5">
        {KPI_COLOR_SWATCHES.map((hex) => (
          <button
            key={hex}
            type="button"
            title={hex}
            onClick={() => onPickColor(hex)}
            className={cn(
              "aspect-square w-full cursor-pointer rounded-[5px] border-2 border-transparent transition-transform hover:scale-110",
              normalizedCurrent === hex.toLowerCase() && "border-white",
            )}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      <div className="my-2 h-px bg-white/[0.07]" />

      <div className="flex items-center gap-2">
        <label
          htmlFor="kpi-custom-color"
          className="flex-1 cursor-pointer text-[11px] font-semibold text-slate-400"
        >
          Custom color
        </label>
        <input
          id="kpi-custom-color"
          type="color"
          value={
            normalizedCurrent.startsWith("#") && normalizedCurrent.length === 7
              ? currentColor
              : "#3aa0ff"
          }
          onChange={(event) => onPickColor(event.currentTarget.value)}
          className="h-7 w-8 cursor-pointer rounded-md border-0 bg-[#1a2234] p-0.5"
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-2 inline-block text-[10.5px] text-slate-400 underline transition hover:text-slate-200"
      >
        Reset to default
      </button>
    </div>
  );
}
