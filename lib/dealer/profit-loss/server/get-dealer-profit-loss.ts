import { DEALER_PROFIT_LOSS_MOCK } from "../mock-data";
import type { DealerProfitLossData } from "../types";

/**
 * Server entry for Dealer Profit & Loss report.
 * TODO(backend): aggregate wholesale transactions + expenses by dealership_id.
 */
export async function getDealerProfitLoss(): Promise<DealerProfitLossData> {
  return DEALER_PROFIT_LOSS_MOCK;
}
