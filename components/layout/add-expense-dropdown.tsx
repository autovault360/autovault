"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, ClipboardList, Receipt, RefreshCw, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, ButtonIcon } from "@/components/ui/button";
import { HeaderIconAction } from "@/components/layout/header-icon-action";

type ExpenseMenuItem = {
  id: "general" | "vehicle" | "recurring";
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconRing: string;
};

const MENU_ITEMS: ExpenseMenuItem[] = [
  {
    id: "general",
    title: "General Expense",
    subtitle: "Add a general dealership expense",
    icon: ClipboardList,
    iconRing: "bg-slate-700/80 text-slate-300",
  },
  {
    id: "vehicle",
    title: "Vehicle Expense",
    subtitle: "Add an expense linked to a vehicle",
    icon: Car,
    iconRing: "bg-blue-500/20 text-blue-400",
  },
  {
    id: "recurring",
    title: "Recurring Expense",
    subtitle: "Add a recurring expense",
    icon: RefreshCw,
    iconRing: "bg-emerald-500/20 text-emerald-400",
  },
];

const ROUTES: Record<ExpenseMenuItem["id"], string> = {
  general: "/dashboard/expenses?add=true&type=general",
  vehicle: "/dashboard/expenses?add=true&type=vehicle",
  recurring: "/dashboard/expenses?add=true&type=recurring",
};

export default function AddExpenseDropdown({
  onSelect,
  variant = "default",
}: {
  onSelect?: (type: ExpenseMenuItem["id"]) => void;
  variant?: "default" | "icon";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<ExpenseMenuItem["id"] | null>(null);
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

  useEffect(() => {
    if (!open) setHoveredId(null);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {variant === "icon" ? (
        <HeaderIconAction
          icon={Receipt}
          label="Add Expense"
          tone="red"
          active={open}
          onClick={() => setOpen((prev) => !prev)}
        />
      ) : (
        <Button
          type="button"
          size="action"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={cn(open && "border-red-500/40 text-white")}
        >
          <ButtonIcon tone="danger">
            <Receipt />
          </ButtonIcon>
          Add Expense
        </Button>
      )}

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 w-[292px] overflow-hidden rounded-lg border border-slate-700/90 bg-[#0c1424] py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
            variant === "icon"
              ? "left-1/2 top-[calc(100%+6px)] -translate-x-1/2"
              : "left-0 top-[calc(100%+6px)]",
          )}
        >
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  onSelect?.(item.id);
                  setOpen(false);
                  router.push(ROUTES[item.id]);
                }}
                className={cn(
                  "flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors",
                  isHovered
                    ? "border-l-blue-500 bg-[#152238]"
                    : "border-l-transparent bg-transparent hover:border-l-blue-500 hover:bg-[#152238]",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                    item.iconRing,
                  )}
                >
                  <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1 pr-1">
                  <span
                    className={cn(
                      "block text-[13px] font-semibold leading-tight",
                      isHovered && item.id === "vehicle"
                        ? "text-blue-400"
                        : "text-slate-100",
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                    {item.subtitle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
