import { cn } from "@/lib/utils";
import { AV } from "@/lib/ui/autovault-design-tokens";

const REP_COLORS: Record<string, string> = {
  "D. Cole": "bg-[rgba(58,160,255,0.15)] text-[#3aa0ff]",
  "M. Reyes": "bg-[rgba(255,159,67,0.15)] text-[#ff9f43]",
  "A. Patel": "bg-[rgba(160,123,255,0.15)] text-[#a07bff]",
};

export default function RepPill({ rep }: { rep: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-[20px] px-[9px] py-[3px] font-sans text-[10.5px] font-bold",
        REP_COLORS[rep] ?? "bg-[rgba(58,160,255,0.15)] text-[#3aa0ff]",
      )}
    >
      {rep}
    </span>
  );
}

export function ViewVehicleButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-[11px] py-[7px] text-[11.5px] font-bold transition-colors hover:bg-[rgba(58,160,255,0.18)]"
      style={{
        backgroundColor: "rgba(58,160,255,0.1)",
        borderColor: "rgba(58,160,255,0.3)",
        color: AV.blue,
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      View
    </button>
  );
}
