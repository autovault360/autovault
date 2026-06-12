"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { HeaderIconAction } from "@/components/layout/header-icon-action";

export type HeaderMoreMenuItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
};

export function HeaderMoreMenu({
  items,
  label = "More",
}: {
  items: HeaderMoreMenuItem[];
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <HeaderIconAction
        icon={MoreHorizontal}
        label={label}
        tone="neutral"
        active={open}
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-[calc(100%+6px)] z-50 w-[220px] -translate-x-1/2 overflow-hidden rounded-lg border border-slate-700/90 bg-[#0c1424] py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  if (item.onClick) {
                    item.onClick();
                    return;
                  }
                  if (item.href) router.push(item.href);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-slate-200 transition-colors hover:bg-[#152238]",
                )}
              >
                {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
