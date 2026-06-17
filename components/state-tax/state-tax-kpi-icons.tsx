import {
  Calendar,
  ClipboardList,
  FileText,
  Car,
} from "lucide-react";
import type { ComponentType } from "react";

const iconClass = "h-[22px] w-[22px] shrink-0";

type KpiIconProps = { className?: string };

/** Money bag with dollar sign */
export function MoneyBagIcon({ className }: KpiIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? iconClass}
      aria-hidden
    >
      <path d="M12 2.75V4.25" />
      <path d="M10 4.25h4" />
      <path d="M8.25 6.75h7.5c1.35 0 2.25 1.45 2.25 3.25 0 3.85-2.85 6.75-6 6.75s-6-2.9-6-6.75c0-1.8.9-3.25 2.25-3.25z" />
      <path d="M12 10.25v4.5" />
      <path d="M10.5 12.25h3" />
      <path d="M10.75 14.5c0 .65.55 1 1.15 1 .75 0 1.1-.35 1.1-.85" />
      <path d="M13.1 11.5c0-.65-.55-1-1.15-1-.75 0-1.1.35-1.1.85" />
    </svg>
  );
}

export const stateTaxKpiIconMap: Record<string, ComponentType<KpiIconProps>> = {
  "total-tax": MoneyBagIcon,
  vehicles: Car,
  "next-filing": Calendar,
  "active-periods": FileText,
};

export const stateTaxKpiIconBg: Record<string, string> = {
  "total-tax": "bg-emerald-500 text-white",
  vehicles: "bg-blue-600 text-white",
  "next-filing": "bg-purple-600 text-white",
  "active-periods": "bg-orange-500 text-white",
};
