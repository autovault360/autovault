import { Info } from "lucide-react";

export default function PayrollEarningsFooterNote() {
  return (
    <p className="mt-3.5 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
      Commission is paid based on deal approval and funding. Pending deals will
      be paid once approved.
    </p>
  );
}
