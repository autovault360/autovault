import { createClient } from "@/lib/supabase/server";
import {
  calculateDealJacketFinancials,
  normalizeFees,
  sumVehicleExpenses,
} from "./calculate-financials";
import { logDealJacketActivity } from "./activity";
import { createCommission } from "@/lib/sales-rep/commissions/server/create-commission";
import { isVehicleAvailableForDeal } from "@/lib/vehicles/map-db-status";
import { markVehiclePendingDeal } from "@/lib/vehicles/server/sync-vehicle-deal-status";
import {
  registerDealJacketFileInRegistry,
  inferDocumentBucket,
} from "./upload-deal-jacket-documents";
import type {
  CreateDealJacketSaleData,
  DealJacketDocumentInput,
  DealJacketRow,
} from "./db-types";

export type CreateDealJacketParams = {
  dealershipId: string;
  createdBy: string;
  sale: CreateDealJacketSaleData;
  documents?: DealJacketDocumentInput[];
  /** When true (default), vehicle status becomes pending_deal until the jacket is approved. */
  markVehiclePendingDeal?: boolean;
};

export type CreateDealJacketResult =
  | { success: true; dealJacket: DealJacketRow }
  | { success: false; error: string };

async function nextJacketNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealershipId: string,
): Promise<string> {
  const { count, error } = await supabase
    .from("deal_jackets")
    .select("id", { count: "exact", head: true })
    .eq("dealership_id", dealershipId);

  if (error) {
    throw new Error(error.message);
  }

  const seq = (count ?? 0) + 1;
  return `DJ-${String(seq).padStart(6, "0")}`;
}

async function resolveSalesRepId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  customerId: string,
  explicitRepId?: string | null,
  defaultRepId?: string | null,
): Promise<string | null> {
  if (explicitRepId) return explicitRepId;

  const { data: customer } = await supabase
    .from("customers")
    .select("sales_rep_id")
    .eq("id", customerId)
    .maybeSingle();

  return customer?.sales_rep_id ?? defaultRepId ?? null;
}

async function resolveCommissionRate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  salesRepId: string | null,
): Promise<number> {
  if (!salesRepId) return 0.1;

  const { data: rep } = await supabase
    .from("sales_rep_profiles")
    .select("commission_rate")
    .eq("user_id", salesRepId)
    .maybeSingle();

  const rate = Number(rep?.commission_rate);
  return Number.isFinite(rate) && rate >= 0 ? rate : 0.1;
}

/**
 * Creates a deal jacket when a vehicle is marked sold.
 * One vehicle ... one deal jacket (enforced by unique vehicle_id).
 */
export async function createDealJacket(
  params: CreateDealJacketParams,
): Promise<CreateDealJacketResult> {
  const supabase = await createClient();
  const {
    dealershipId,
    createdBy,
    sale,
    documents = [],
    markVehiclePendingDeal: shouldMarkPendingDeal = true,
  } = params;

  const { data: existing } = await supabase
    .from("deal_jackets")
    .select("id")
    .eq("vehicle_id", sale.vehicleId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "A deal jacket already exists for this vehicle",
    };
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select(
      "id, dealership_id, status, acquisition_cost, total_invested, created_by, year, make, model, stock_number, vin",
    )
    .eq("id", sale.vehicleId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .single();

  if (vehicleError || !vehicle) {
    return { success: false, error: "Vehicle not found" };
  }

  const vehicleStatus = vehicle.status as string;
  if (vehicleStatus === "pending_deal") {
    return {
      success: false,
      error: "This vehicle already has a deal in progress",
    };
  }
  if (vehicleStatus === "sold" || vehicleStatus === "loss") {
    return { success: false, error: "Vehicle is already marked as sold" };
  }
  if (shouldMarkPendingDeal && !isVehicleAvailableForDeal(vehicleStatus)) {
    return {
      success: false,
      error: "Vehicle is not available for a new deal jacket",
    };
  }

  const { data: expenseRows, error: expensesError } = await supabase
    .from("vehicle_expenses")
    .select("id, total_cost")
    .eq("vehicle_id", sale.vehicleId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null);

  if (expensesError) {
    return { success: false, error: expensesError.message };
  }

  const expensesTotal = sumVehicleExpenses(expenseRows ?? []);

  const salesRepId = await resolveSalesRepId(
    supabase,
    sale.customerId,
    sale.salesRepId,
    createdBy,
  );

  const commissionRate = await resolveCommissionRate(supabase, salesRepId);
  const fees = normalizeFees(sale.fees);
  const additionalExpenses = sale.additionalExpenses ?? 0;
  const notes = sale.notes ?? null;

  const financials = calculateDealJacketFinancials({
    soldPrice: sale.soldPrice,
    vehicleInvested: Number(vehicle.acquisition_cost ?? 0),
    vehicleExpensesTotal: expensesTotal,
    additionalExpenses,
    commissionRate,
  });

  const jacketNumber = await nextJacketNumber(supabase, dealershipId);
  const dateSold = sale.saleDate.includes("T")
    ? sale.saleDate
    : `${sale.saleDate}T12:00:00Z`;

  const { data: inserted, error: insertError } = await supabase
    .from("deal_jackets")
    .insert({
      dealership_id: dealershipId,
      deal_id: sale.dealId ?? null,
      vehicle_id: sale.vehicleId,
      customer_id: sale.customerId,
      sales_rep_id: salesRepId,
      jacket_number: jacketNumber,
      sold_price: sale.soldPrice,
      total_tax: sale.totalTax,
      fees,
      total_sale_price: sale.totalSalePrice,
      down_payment: sale.downPayment ?? 0,
      amount_financed: sale.amountFinanced ?? 0,
      balance_due: sale.balanceDue ?? 0,
      total_invested: financials.totalInvested,
      additional_expenses: additionalExpenses,
      commission_amount: financials.commissionAmount,
      profit_gross: financials.profitGross,
      profit_net: financials.profitNet,
      date_sold: dateSold,
      workflow_status: "pending_review",
      notes,
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    return {
      success: false,
      error: insertError?.message ?? "Failed to create deal jacket",
    };
  }

  if ((expenseRows ?? []).length > 0) {
    const relations = (expenseRows ?? []).map((exp) => ({
      dealership_id: dealershipId,
      deal_jacket_id: inserted.id,
      expense_id: exp.id,
      amount: Number(exp.total_cost),
    }));

    const { error: relError } = await supabase
      .from("deal_jacket_expenses_relation")
      .insert(relations);

    if (relError) {
      await supabase.from("deal_jackets").delete().eq("id", inserted.id);
      return { success: false, error: relError.message };
    }
  }

  if (documents.length > 0) {
    const docRows = documents.map((doc) => ({
      dealership_id: dealershipId,
      deal_jacket_id: inserted.id,
      file_url: doc.storagePath,
      file_type: doc.fileType,
      document_name: doc.documentName,
      created_by: createdBy,
    }));

    const { error: docError } = await supabase
      .from("deal_jacket_documents")
      .insert(docRows);

    if (docError) {
      console.error("deal_jacket_documents insert failed:", docError.message);
    } else {
      for (const doc of documents) {
        await registerDealJacketFileInRegistry(supabase, {
          dealershipId,
          dealJacketId: inserted.id,
          uploadedBy: createdBy,
          storagePath: doc.storagePath,
          bucket: inferDocumentBucket(doc.storagePath),
          originalName: doc.documentName,
          mimeType: doc.fileType,
        });
      }
    }
  }

  await logDealJacketActivity({
    dealJacketId: inserted.id,
    action: "created",
    actorId: createdBy,
    actorName: createdBy,
    newStatus: "pending_review",
    detail: {
      jacketNumber,
      vehicleId: sale.vehicleId,
      soldPrice: sale.soldPrice,
    },
  });

  await supabase.from("audit_logs").insert({
    dealership_id: dealershipId,
    entity_type: "deal_jackets",
    entity_id: inserted.id,
    action: "CREATED",
    new_values: {
      jacket_number: jacketNumber,
      vehicle_id: sale.vehicleId,
      profit_gross: financials.profitGross,
      profit_net: financials.profitNet,
    },
    changed_by: createdBy,
  });

  await createCommission({
    dealershipId,
    salesRepId: salesRepId ?? createdBy,
    dealJacketId: inserted.id,
    commissionAmount: financials.commissionAmount,
    commissionRate,
    grossProfit: financials.profitGross,
    soldPrice: sale.soldPrice,
  });

  if (shouldMarkPendingDeal) {
    const pendingResult = await markVehiclePendingDeal(supabase, {
      vehicleId: sale.vehicleId,
      dealershipId,
      changedBy: createdBy,
      notes: `Deal jacket ${jacketNumber} submitted for review`,
    });
    if (!pendingResult.ok) {
      console.error("Failed to mark vehicle pending deal:", pendingResult.error);
    }
  }

  return { success: true, dealJacket: inserted as DealJacketRow };
}
