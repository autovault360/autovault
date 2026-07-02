"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const COLOR_SWATCHES = [
  "#3aa0ff", "#23d18b", "#ff9f43", "#a07bff", "#ff5470",
  "#f9ca24", "#ff6b81", "#00d2d3", "#54a0ff", "#5f27cd",
  "#10ac84", "#ee5a24", "#0abde3", "#c8d6e5", "#ff9ff3",
  "#feca57", "#dfe6e9", "#b2bec3", "#74b9ff", "#fdcb6e",
  "#e17055", "#636e72", "#2d3436", "#ffffff",
];

type Props = {
  label: string;
  value: string;
  footer: string;
  accent: string;
  /** Enables color picker on value click */
  kpiKey?: string;
  /** Fallback accent when user resets */
  defaultAccent?: string;
  onColorChange?: (kpiKey: string, color: string) => void;
  onColorReset?: (kpiKey: string) => void;
};

export default function StatKpiCard({
  label,
  value,
  footer,
  accent: accentProp,
  kpiKey,
  defaultAccent,
  onColorChange,
  onColorReset,
}: Props) {
  const [currentAccent, setCurrentAccent] = useState(accentProp);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentAccent(accentProp);
  }, [accentProp]);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  const handleValueClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setAnchorRect(event.currentTarget.getBoundingClientRect());
      setPickerOpen(true);
    },
    [],
  );

  const handlePickColor = useCallback(
    (color: string) => {
      setCurrentAccent(color);
      if (kpiKey) onColorChange?.(kpiKey, color);
    },
    [kpiKey, onColorChange],
  );

  const handleReset = useCallback(() => {
    const fallback = defaultAccent ?? accentProp;
    setCurrentAccent(fallback);
    if (kpiKey) onColorReset?.(kpiKey);
    setPickerOpen(false);
  }, [kpiKey, defaultAccent, accentProp, onColorReset]);

  const normalizedCurrent = currentAccent.toLowerCase();

  let popW = 220;
  let top = 0;
  let left = 0;
  if (anchorRect) {
    top = anchorRect.bottom + 8;
    left = anchorRect.left;
    if (left + popW > (typeof window !== "undefined" ? window.innerWidth : 1200))
      left = (typeof window !== "undefined" ? window.innerWidth : 1200) - popW - 12;
    if (top + 220 > (typeof window !== "undefined" ? window.innerHeight : 800))
      top = anchorRect.top - 220 - 8;
  }

  return (
    <article className="group relative min-w-[140px] overflow-hidden rounded-xl border bg-[#10151F] text-card-foreground border-slate-700/80 px-5 py-[18px] transition hover:border-white/10 hover:bg-white/2.5">
      <div
        className="pointer-events-none absolute bottom-0 left-5 right-5 h-0.5 origin-left scale-x-0 rounded-sm transition-transform duration-200 group-hover:scale-x-100"
        style={{ backgroundColor: currentAccent }}
      />
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 whitespace-nowrap">
        {label}
      </div>

      {kpiKey ? (
        <button
          type="button"
          onClick={handleValueClick}
          className="mt-1.5 cursor-pointer text-left font-mono text-[19px] leading-tight font-extrabold transition-opacity hover:opacity-85"
          style={{ color: currentAccent }}
        >
          {value}
        </button>
      ) : (
        <div
          className="mt-1.5 font-mono text-[19px] leading-tight font-extrabold"
          style={{ color: currentAccent }}
        >
          {value}
        </div>
      )}

      <div className="mt-1 text-[10.5px] text-slate-400">{footer}</div>

      {pickerOpen && anchorRect && (
        <div
          ref={pickerRef}
          className="fixed z-[300] w-[216px] rounded-[14px] border border-white/10 bg-[#161d2b] p-3.5 pb-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
          style={{ top, left }}
          role="dialog"
          aria-label="Number color"
        >
          <div className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Number Color
          </div>

          <div className="mb-2 grid grid-cols-8 gap-1.5">
            {COLOR_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                title={hex}
                onClick={() => handlePickColor(hex)}
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
            <label className="flex-1 cursor-pointer text-[11px] font-semibold text-slate-400">
              Custom color
            </label>
            <input
              type="color"
              value={
                normalizedCurrent.startsWith("#") && normalizedCurrent.length === 7
                  ? currentAccent
                  : "#3aa0ff"
              }
              onChange={(e) => handlePickColor(e.currentTarget.value)}
              className="h-7 w-8 cursor-pointer rounded-md border-0 bg-[#1a2234] p-0.5"
            />
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="mt-2 inline-block text-[10.5px] text-slate-400 underline transition hover:text-slate-200"
          >
            Reset to default
          </button>
        </div>
      )}
    </article>
  );
}
