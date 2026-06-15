import { cn } from "@/lib/utils";

type LandingLogoProps = {
  variant?: "header" | "footer" | "trust";
  className?: string;
};

export default function LandingLogo({ variant = "header", className }: LandingLogoProps) {
  const isFooter = variant === "footer";
  const isTrust = variant === "trust";

  if (isTrust) {
    return (
      <div className={cn("flex shrink-0 items-center justify-center", className)}>
        <div className="text-[22px] font-semibold leading-none tracking-[-0.12em] text-[#d4a843]">
          V<span className="relative -left-[1px]">A</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full bg-[#02351d] font-semibold leading-none tracking-[-0.12em] text-white",
          isFooter ? "h-10 w-10 text-[28px]" : "h-11 w-11 text-[32px]",
        )}
      >
        <span>
          V<span className="relative -left-[1px]">A</span>
        </span>
      </div>

      <div className="min-w-0">
        <div
          className={cn(
            "font-semibold leading-none tracking-[0.08em] text-[#02351d]",
            isFooter ? "text-[15px]" : "text-[17px] sm:text-[19px]",
          )}
        >
          AUTOVAULT
        </div>
        <div
          className={cn(
            "mt-1 font-medium uppercase tracking-[0.14em] text-[#616161]",
            isFooter ? "text-[8px]" : "text-[9px] sm:text-[10px]",
          )}
        >
          Dealer Management CRM
        </div>
      </div>
    </div>
  );
}
