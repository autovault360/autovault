"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneStyles = {
  blue: { icon: "text-blue-400", bg: "bg-blue-500/10" },
  red: { icon: "text-red-400", bg: "bg-red-500/10" },
  green: { icon: "text-emerald-400", bg: "bg-emerald-500/10" },
  greenDark: { icon: "text-emerald-600", bg: "bg-emerald-600/10" },
  purple: { icon: "text-purple-400", bg: "bg-purple-500/10" },
  orange: { icon: "text-orange-400", bg: "bg-orange-500/10" },
  neutral: { icon: "text-slate-400", bg: "bg-slate-800/50" },
} as const;

export type HeaderIconActionTone = keyof typeof toneStyles;

export function HeaderIconAction({
  icon: Icon,
  label,
  tone = "blue",
  onClick,
  className,
  active,
}: {
  icon: LucideIcon;
  label: string;
  tone?: HeaderIconActionTone;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}) {
  const colors = toneStyles[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[68px] max-w-[84px] flex-col items-center gap-1.5 rounded-full px-1 py-1 transition hover:bg-slate-800/30",
        active && "bg-slate-800/30",
        className,
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full",
          colors.bg,
        )}
      >
        <Icon className={cn("h-5 w-5", colors.icon)} strokeWidth={1.75} />
      </span>
      <span className="text-center text-[10px] font-medium leading-tight text-slate-400">
        {label}
      </span>
    </button>
  );
}
