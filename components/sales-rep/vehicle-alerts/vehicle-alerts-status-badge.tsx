import { cn } from "@/lib/utils";
import type { VehicleAlertStatus } from "@/lib/sales-rep/vehicle-alerts/types";

const STATUS_CONFIG: Record<
  VehicleAlertStatus,
  { label: string; subtext: string; className: string }
> = {
  pending_approval: {
    label: "Pending Approval",
    subtext: "Admin Review",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  pending_documents: {
    label: "Pending Documents",
    subtext: "Docs Required",
    className: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  under_review: {
    label: "Under Review",
    subtext: "Being Reviewed",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  needs_changes: {
    label: "Needs Changes",
    subtext: "Action Required",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  resolved: {
    label: "Resolved",
    subtext: "Completed",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
};

export default function VehicleAlertsStatusBadge({
  status,
}: {
  status: VehicleAlertStatus;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="min-w-[120px]">
      <span
        className={cn(
          "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
          config.className,
        )}
      >
        {config.label}
      </span>
      <div className="mt-0.5 text-[9.5px] text-slate-500">{config.subtext}</div>
    </div>
  );
}
