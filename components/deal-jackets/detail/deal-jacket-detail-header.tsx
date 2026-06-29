"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  Pencil,
  Printer,
  RotateCcw,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import WorkflowStatusBadge from "@/components/deal-jackets/workflow-status-badge";
import { getSoldStatusStyle } from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import type { DealJacketStatus } from "@/lib/deal-jackets/types";
import {
  ApproveModal,
  RejectModal,
  RequestChangesModal,
} from "@/components/deal-jackets/review-modals";

const outlineBtnClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-card px-3.5 py-2 text-[12.5px] font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/40";

type Props = {
  detail: DealJacketDetail;
  portalBasePath: string;
  workflowStatus: DealJacketStatus;
  isReadOnly: boolean;
  onStatusChange: (status: DealJacketStatus) => void;
  onExport: () => void;
};

export default function DealJacketDetailHeader({
  detail,
  portalBasePath,
  workflowStatus,
  isReadOnly,
  onStatusChange,
  onExport,
}: Props) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);

  const isManager = !isReadOnly;
  const isFinal =
    workflowStatus === "approved" || workflowStatus === "rejected";
  const canResubmit = workflowStatus === "changes_requested";
  const showReviewActions = isManager && !isFinal;
  const vehicleSubtitle = `${detail.vehicle.year} ${detail.vehicle.make} ${detail.vehicle.model}${detail.vehicle.trim ? ` ${detail.vehicle.trim}` : ""} • Stock # ${detail.vehicle.stockNumber} • VIN: ${detail.vehicle.vin}`;

  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      const { resubmitDealJacket } = await import(
        "@/lib/deal-jackets/server/workflow"
      );
      const result = await resubmitDealJacket(detail.id);
      if (result.success) {
        onStatusChange("resubmitted");
      }
    } finally {
      setResubmitting(false);
    }
  };

  return (
    <>
      <section className="mb-3.5 space-y-2.5">
        <Link
          href={`${portalBasePath}/deal-jackets`}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-blue-400 transition hover:text-blue-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Deal Jackets
        </Link>

        <div className="flex flex-col items-start justify-between gap-3 lg:flex-row">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] font-bold tracking-tight text-white">
                Deal Jacket #{detail.jacketNumber}
              </h1>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                  getSoldStatusStyle(),
                )}
              >
                Sold
              </span>
              {workflowStatus !== "approved" ? (
                <WorkflowStatusBadge status={workflowStatus} size="sm" />
              ) : null}
            </div>
            <p className="mt-1 text-[12.5px] text-slate-500">{vehicleSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className={outlineBtnClass}
            >
              <Printer className="h-3.5 w-3.5" />
              Print Jacket
            </button>
            <button type="button" onClick={onExport} className={outlineBtnClass}>
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button type="button" className={outlineBtnClass}>
              <Pencil className="h-3.5 w-3.5" />
              Edit Notes
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </button>

            {showReviewActions ? (
              <>
                <button
                  type="button"
                  onClick={() => setChangesOpen(true)}
                  className={cn(outlineBtnClass, "text-orange-400")}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={() => setRejectOpen(true)}
                  className={cn(outlineBtnClass, "text-red-400")}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setApproveOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-emerald-500"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Mark as Complete
                </button>
              </>
            ) : canResubmit ? (
              <>
                {!isManager && (
                  <Link
                    href={`/sales-rep/deal-jackets/edit/${detail.id}`}
                    className={cn(outlineBtnClass, "text-amber-400")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Deal Jacket
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleResubmit}
                  disabled={resubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                >
                  <RotateCcw
                    className={cn(
                      "h-3.5 w-3.5",
                      resubmitting && "animate-spin",
                    )}
                  />
                  Resubmit for Review
                </button>
              </>
            ) : workflowStatus === "approved" ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/60 px-3.5 py-2 text-[12.5px] font-semibold text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark as Complete
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <ApproveModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        dealJacketId={detail.id}
        onSuccess={() => onStatusChange("approved")}
      />
      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        dealJacketId={detail.id}
        onSuccess={() => onStatusChange("rejected")}
      />
      <RequestChangesModal
        open={changesOpen}
        onOpenChange={setChangesOpen}
        dealJacketId={detail.id}
        onSuccess={() => onStatusChange("changes_requested")}
      />
    </>
  );
}
