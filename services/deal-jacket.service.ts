/**
 * Deal Jacket service layer — all business logic for deal jackets.
 * API routes and server actions must call through this module.
 */

export {
  createDealJacket,
  type CreateDealJacketParams,
  type CreateDealJacketResult,
} from "@/lib/deal-jackets/server/create-deal-jacket";

export {
  getDealJacketById,
  type DealJacketDetailDto,
} from "@/lib/deal-jackets/server/get-deal-jacket-by-id";

export {
  listDealJackets,
  type DealJacketListItemDto,
  type ListDealJacketsResult,
} from "@/lib/deal-jackets/server/list-deal-jackets";

export {
  calculateDealJacketFinancials,
  type FinancialResult,
} from "@/lib/deal-jackets/server/calculate-financials";

export type {
  CreateDealJacketSaleData,
  DealJacketDocumentInput,
} from "@/lib/deal-jackets/server/db-types";
