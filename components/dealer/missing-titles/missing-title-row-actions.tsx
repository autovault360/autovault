"use client";

import { Calendar, MoreHorizontal, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onEdit?: () => void;
  onSchedule?: () => void;
  className?: string;
};

export default function MissingTitleRowActions({
  onEdit,
  onSchedule,
  className,
}: Props) {
  return (
    <div
      className={cn("flex items-center justify-end gap-1", className)}
      onClick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <ActionButton label="Edit record" onClick={onEdit} tone="slate">
        <Pencil className="h-3.5 w-3.5" />
      </ActionButton>
      <ActionButton label="Schedule follow-up" onClick={onSchedule} tone="blue">
        <Calendar className="h-3.5 w-3.5" />
      </ActionButton>
      <ActionButton label="More options" tone="slate">
        <MoreHorizontal className="h-3.5 w-3.5" />
      </ActionButton>
    </div>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  tone: "blue" | "slate";
}) {
  const toneClass =
    tone === "blue"
      ? "border-blue-500/50 text-blue-400 hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
      : "border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800/80 hover:text-slate-200";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md border bg-[#0a1220] transition-colors",
        toneClass,
      )}
    >
      {children}
    </button>
  );
}
