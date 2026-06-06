"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  "Deal Information",
  "Buyer Information",
  "Documents & Uploads",
  "Review & Submit",
] as const;

type Props = {
  activeStep?: number;
};

export default function DealJacketStepper({ activeStep = 1 }: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const isActive = step === activeStep;
        const isPast = step < activeStep;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold",
                  isActive
                    ? "bg-blue-600 text-white"
                    : isPast
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-800 text-slate-500",
                )}
              >
                {step}
              </span>
              <span
                className={cn(
                  "text-[11.5px] font-medium",
                  isActive
                    ? "text-white"
                    : isPast
                      ? "text-slate-400"
                      : "text-slate-600",
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 hidden h-px w-8 sm:block",
                  isPast ? "bg-emerald-500/40" : "bg-slate-800",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
