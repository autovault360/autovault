import type { SalesRepCommissionStatus } from "./types";

const VALID_STATUSES: SalesRepCommissionStatus[] = [
  "pending_review",
  "changes_requested",
  "resubmitted",
  "approved",
  "rejected",
  "paid",
];

export function normalizeCommissionStatus(
  raw: string | null | undefined,
): SalesRepCommissionStatus {
  if (raw && VALID_STATUSES.includes(raw as SalesRepCommissionStatus)) {
    return raw as SalesRepCommissionStatus;
  }

  // Legacy deal_jackets.commission_status values
  if (raw === "paid") return "paid";
  if (raw === "pending") return "pending_review";

  return "pending_review";
}

export function isCommissionPaid(status: string): boolean {
  return status === "paid";
}

export function isCommissionPending(status: string): boolean {
  return status !== "paid" && status !== "rejected";
}
