import type { DealJacketListItem } from "@/lib/deal-jackets/types";
import type { SalesRepDealJacketKpiSummary } from "./types";

export function buildDealJacketKpiSummary(
  items: DealJacketListItem[],
): SalesRepDealJacketKpiSummary {
  let totalCommission = 0;
  let totalProfit = 0;
  let pendingReview = 0;
  let changesRequested = 0;
  let resubmitted = 0;
  let approved = 0;
  let rejected = 0;

  for (const item of items) {
    totalCommission += item.commissionAmount;
    totalProfit += item.totalProfit;
    switch (item.workflowStatus) {
      case "pending_review":
        pendingReview++;
        break;
      case "changes_requested":
        changesRequested++;
        break;
      case "resubmitted":
        resubmitted++;
        break;
      case "approved":
        approved++;
        break;
      case "rejected":
        rejected++;
        break;
    }
  }

  return {
    total: items.length,
    pendingReview,
    changesRequested,
    resubmitted,
    approved,
    rejected,
    totalCommission,
    totalProfit,
  };
}
