"use client";

import { cn } from "@/lib/utils";
import type { PayrollCycle } from "@/lib/payroll/types";

const CYCLES: { id: PayrollCycle; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Bi-Weekly" },
  { id: "semimonthly", label: "Semi-Monthly" },
  { id: "monthly", label: "Monthly" },
];

export default function PayrollCycleToggle({
  value,
  onChange,
}: {
  value: PayrollCycle;
  onChange: (cycle: PayrollCycle) => void;
}) {
  return (
    <div className="mb-3.5 inline-flex rounded-md border border-slate-800 bg-[#0e1626] p-0.5">
      {CYCLES.map((cycle) => (
        <button
          key={cycle.id}
          type="button"
          onClick={() => onChange(cycle.id)}
          className={cn(
            "rounded px-3 py-1.5 text-[13px] font-medium transition",
            value === cycle.id
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:text-slate-200",
          )}
        >
          {cycle.label}
        </button>
      ))}
    </div>
  );
}
