"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { formatDisplayDate } from "@/lib/deal-jackets/types";
import type {
  CreateDealJacketPageData,
  DealJacketLedgerStatus,
  IAdminReviewDeal,
  IDealJacketLedgerItem,
  ILinkedVehicle,
  IRecentlyApprovedDeal,
} from "@/lib/sales-rep/deal-jacket/types";
import type { DealJacketStatus } from "../types";
import { listDealJackets } from "./list-deal-jackets";
import { mapDealJacketListDto } from "../map-list-item";

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

function mapWorkflowToLedgerStatus(
  status: DealJacketStatus,
): DealJacketLedgerStatus {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

const EMPTY_ADMIN_REVIEW: IAdminReviewDeal = {
  id: "-",
  vehicleDesc: "No deals pending review",
  buyerName: "-",
  salePrice: 0,
  grossProfit: 0,
  commissionEarned: 0,
  submittedBy: "-",
  submittedOn: "-",
};

const EMPTY_RECENTLY_APPROVED: IRecentlyApprovedDeal = {
  id: "-",
  vehicleDesc: "No recently approved deals",
  buyerName: "-",
  salePrice: 0,
  grossProfit: 0,
  approvedOn: "-",
};

export async function getCreateDealJacketPageData(): Promise<CreateDealJacketPageData | null> {
  const auth = await authenticateUser();
  if (!auth.ok) return null;

  const supabase = await createClient();
  const { dealershipId, userId } = auth.user;

  const [{ data: vehicleRows }, { data: userRow }, jacketResult] =
    await Promise.all([
      supabase
        .from("vehicles")
        .select(
          "id, stock_number, vin, year, make, model, trim, mileage, acquisition_cost, asking_price",
        )
        .eq("dealership_id", dealershipId)
        .is("deleted_at", null)
        .in("status", ["in_stock", "needs_attention", "in_recon"])
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("users")
        .select("full_name, image_url")
        .eq("id", userId)
        .maybeSingle(),
      listDealJackets({ dealershipId, page: 1, pageSize: 25 }),
    ]);

  const vehicles: ILinkedVehicle[] = (vehicleRows ?? []).map((row) => ({
    id: row.id,
    stockNo: row.stock_number ?? "",
    vin: row.vin,
    yearModel: `${row.year} ${row.make} ${row.model}${row.trim ? ` ${row.trim}` : ""}`,
    mileage: row.mileage ? Number(row.mileage).toLocaleString() : "",
    purchaseCost: Number(row.acquisition_cost ?? 0),
    askingPrice: Number(row.asking_price ?? 0),
  }));

  const jackets = jacketResult.items.map(mapDealJacketListDto);

  const ledgerItems: IDealJacketLedgerItem[] = jackets.map((jacket) => ({
    id: jacket.id,
    vehicleDesc: `${jacket.year} ${jacket.make} ${jacket.model}`,
    buyerName: jacket.customerName,
    saleDate: formatDisplayDate(jacket.saleDate),
    grossProfit: jacket.totalProfit,
    status: mapWorkflowToLedgerStatus(jacket.workflowStatus),
  }));

  const ledgerCounts = {
    all: ledgerItems.length,
    pending: ledgerItems.filter((item) => item.status === "Pending").length,
    approved: ledgerItems.filter((item) => item.status === "Approved").length,
    rejected: ledgerItems.filter((item) => item.status === "Rejected").length,
  };

  const pendingReview = jackets.find((jacket) =>
    ["pending_review", "resubmitted", "changes_requested"].includes(
      jacket.workflowStatus,
    ),
  );

  const recentlyApproved = jackets.find(
    (jacket) => jacket.workflowStatus === "approved",
  );

  const adminReviewDeal: IAdminReviewDeal = pendingReview
    ? {
        id: pendingReview.id,
        vehicleDesc: `${pendingReview.year} ${pendingReview.make} ${pendingReview.model}`,
        buyerName: pendingReview.customerName,
        salePrice: pendingReview.salePrice,
        grossProfit: pendingReview.totalProfit,
        commissionEarned: pendingReview.commissionAmount,
        submittedBy: pendingReview.salesRepName,
        submittedOn: formatDisplayDate(pendingReview.saleDate),
      }
    : EMPTY_ADMIN_REVIEW;

  const recentlyApprovedDeal: IRecentlyApprovedDeal = recentlyApproved
    ? {
        id: recentlyApproved.id,
        vehicleDesc: `${recentlyApproved.year} ${recentlyApproved.make} ${recentlyApproved.model}`,
        buyerName: recentlyApproved.customerName,
        salePrice: recentlyApproved.salePrice,
        grossProfit: recentlyApproved.totalProfit,
        approvedOn: formatDisplayDate(recentlyApproved.saleDate),
      }
    : EMPTY_RECENTLY_APPROVED;

  const profileName = userRow?.full_name ?? "User";

  return {
    profile: {
      name: profileName,
      title: "Dealership User",
      id: userId,
      initials: getInitials(profileName),
      imageUrl: userRow?.image_url ?? undefined,
    },
    vehicles,
    documents: [],
    ledgerItems,
    ledgerCounts,
    adminReviewDeal,
    recentlyApproved: recentlyApprovedDeal,
    commissionRate: 0.1,
    buyerAttachments: {
      driverLicense: { fileName: "", uploaded: false },
      insurance: { fileName: "", uploaded: false },
    },
  };
}

export async function getRecentlyApprovedDeal(): Promise<IRecentlyApprovedDeal> {
  const auth = await authenticateUser();
  if (!auth.ok) return EMPTY_RECENTLY_APPROVED;

  const { data: jackets } = await (await createClient())
    .from("deal_jackets")
    .select(
      `
      id,
      jacket_number,
      date_sold,
      sold_price,
      profit_net,
      vehicle:vehicles(year, make, model),
      customer:customers(name)
    `,
    )
    .eq("dealership_id", auth.user.dealershipId)
    .eq("sales_rep_id", auth.user.userId)
    .eq("workflow_status", "approved")
    .is("deleted_at", null)
    .order("date_sold", { ascending: false })
    .limit(1);

  const row = jackets?.[0];
  if (!row) return EMPTY_RECENTLY_APPROVED;

  const vehicle = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
  const customer = Array.isArray(row.customer) ? row.customer[0] : row.customer;

  return {
    id: row.jacket_number ?? row.id,
    vehicleDesc: `${vehicle?.year ?? ""} ${vehicle?.make ?? ""} ${vehicle?.model ?? ""}`.trim() || "Unknown Vehicle",
    buyerName: customer?.name ?? "Unknown",
    salePrice: Number(row.sold_price ?? 0),
    grossProfit: Number(row.profit_net ?? 0),
    approvedOn: formatDisplayDate(row.date_sold),
  };
}
