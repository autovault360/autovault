"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, AlertTriangle, RotateCcw, Pencil } from "lucide-react";
import type { DealJacketStatus } from "@/lib/deal-jackets/types";
import WorkflowStatusBadge from "./workflow-status-badge";
import { Button } from "@/components/ui/button";
import {
  ApproveModal,
  RejectModal,
  RequestChangesModal,
} from "./review-modals";

type Props = {
  dealJacketId: string;
  workflowStatus: DealJacketStatus;
  isManager: boolean;
  onStatusChange: (newStatus: DealJacketStatus) => void;
};

export default function ReviewActionsBar({
  dealJacketId,
  workflowStatus,
  isManager,
  onStatusChange,
}: Props) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);

  if (!isManager && workflowStatus !== "changes_requested") return null;

  const isFinal = workflowStatus === "approved" || workflowStatus === "rejected";
  const canResubmit = workflowStatus === "changes_requested";

  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      const { resubmitDealJacket } = await import(
        "@/lib/deal-jackets/server/workflow"
      );
      const result = await resubmitDealJacket(dealJacketId);
      if (result.success) {
        onStatusChange("resubmitted");
      }
    } finally {
      setResubmitting(false);
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800/90 bg-[var(--bg-secondary)] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-medium text-slate-400">Status:</span>
        <WorkflowStatusBadge status={workflowStatus} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isManager && !isFinal && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setChangesOpen(true)}
              className="h-8 gap-1.5 border-orange-500/30 bg-transparent text-[11px] font-medium text-orange-400 hover:bg-orange-500/10"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Request Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectOpen(true)}
              className="h-8 gap-1.5 border-red-500/30 bg-transparent text-[11px] font-medium text-red-400 hover:bg-red-500/10"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setApproveOpen(true)}
              className="h-8 gap-1.5 bg-emerald-600 text-[11px] font-medium text-white hover:bg-emerald-500"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Approve
            </Button>
          </>
        )}

        {canResubmit && (
          <>
            {!isManager && (
              <Button
                type="button"
                size="sm"
                asChild
                className="h-8 gap-1.5 bg-amber-600 text-[11px] font-medium text-white hover:bg-amber-500"
              >
                <Link href={`/sales-rep/deal-jackets/edit/${dealJacketId}`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Deal Jacket
                </Link>
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleResubmit}
              disabled={resubmitting}
              className="h-8 gap-1.5 bg-blue-600 text-[11px] font-medium text-white hover:bg-blue-500"
            >
              <RotateCcw className={resubmitting ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Resubmit for Review
            </Button>
          </>
        )}
      </div>

      <ApproveModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        dealJacketId={dealJacketId}
        onSuccess={() => onStatusChange("approved")}
      />
      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        dealJacketId={dealJacketId}
        onSuccess={() => onStatusChange("rejected")}
      />
      <RequestChangesModal
        open={changesOpen}
        onOpenChange={setChangesOpen}
        dealJacketId={dealJacketId}
        onSuccess={() => onStatusChange("changes_requested")}
      />
    </div>
  );
}
