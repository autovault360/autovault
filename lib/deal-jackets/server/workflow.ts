"use server";

import { createClient } from "@/lib/supabase/server";
import { requireDealJacketAuth, canManageDealJackets } from "./auth";
import { logDealJacketActivity } from "./activity";
import { updateCommissionStatus } from "@/lib/sales-rep/commissions/server/update-commission-status";
import type { DealJacketStatus } from "../types";
import type { DealJacketRow } from "./db-types";
import { releaseVehicleFromPendingDeal } from "@/lib/vehicles/server/sync-vehicle-deal-status";

type WorkflowResult =
  | { success: true; dealJacket: DealJacketRow }
  | { success: false; error: string };

async function getDealJacket(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealJacketId: string,
  dealershipId: string,
): Promise<{ row: DealJacketRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("deal_jackets")
    .select("*")
    .eq("id", dealJacketId)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    return { row: null, error: "Deal jacket not found" };
  }
  return { row: data as DealJacketRow, error: null };
}

async function updateStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dealJacketId: string,
  status: DealJacketStatus,
  extraFields: Record<string, unknown> = {},
): Promise<DealJacketRow | null> {
  const { data, error } = await supabase
    .from("deal_jackets")
    .update({
      workflow_status: status,
      updated_at: new Date().toISOString(),
      ...extraFields,
    })
    .eq("id", dealJacketId)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update deal jacket status:", error.message);
    return null;
  }
  return data as DealJacketRow;
}

const FINAL_STATUSES: DealJacketStatus[] = ["approved", "rejected"];

export async function approveDealJacket(
  dealJacketId: string,
  reviewNotes?: string,
): Promise<WorkflowResult> {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageDealJackets(auth.user.role)) {
    return { success: false, error: "Only managers can approve deal jackets" };
  }

  const supabase = await createClient();
  const { row, error } = await getDealJacket(supabase, dealJacketId, auth.user.dealershipId);
  if (error || !row) return { success: false, error: error! };

  if (FINAL_STATUSES.includes(row.workflow_status as DealJacketStatus)) {
    return { success: false, error: `This deal jacket is already ${row.workflow_status}` };
  }

  const updated = await updateStatus(supabase, dealJacketId, "approved", {
    reviewed_by: auth.user.userId,
    reviewed_at: new Date().toISOString(),
    review_notes: reviewNotes ?? null,
  });

  if (!updated) return { success: false, error: "Failed to approve deal jacket" };

  const { data: vehicleRow } = await supabase
    .from("vehicles")
    .select("status")
    .eq("id", row.vehicle_id)
    .single();

  const fromStatus = vehicleRow?.status ?? "pending_deal";

  await supabase
    .from("vehicles")
    .update({ status: "sold" })
    .eq("id", row.vehicle_id)
    .eq("dealership_id", auth.user.dealershipId);

  await supabase.from("status_history").insert({
    vehicle_id: row.vehicle_id,
    dealership_id: auth.user.dealershipId,
    from_status: fromStatus,
    to_status: "sold",
    notes: `Deal jacket ${row.jacket_number} approved`,
    changed_by: auth.user.userId,
  });

  await supabase.from("audit_logs").insert({
    dealership_id: auth.user.dealershipId,
    entity_type: "deal_jackets",
    entity_id: dealJacketId,
    action: "APPROVED",
    new_values: {
      jacket_number: row.jacket_number,
      vehicle_id: row.vehicle_id,
      customer_id: row.customer_id,
    },
    changed_by: auth.user.userId,
  });

  await logDealJacketActivity({
    dealJacketId,
    action: "approved",
    actorId: auth.user.userId,
    actorName: auth.user.userId,
    oldStatus: row.workflow_status,
    newStatus: "approved",
    detail: reviewNotes ? { reviewNotes } : null,
  });

  await updateCommissionStatus(dealJacketId, "approved");

  return { success: true, dealJacket: updated };
}

export async function rejectDealJacket(
  dealJacketId: string,
  rejectionReason: string,
): Promise<WorkflowResult> {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageDealJackets(auth.user.role)) {
    return { success: false, error: "Only managers can reject deal jackets" };
  }

  if (!rejectionReason.trim()) {
    return { success: false, error: "Rejection reason is required" };
  }

  const supabase = await createClient();
  const { row, error } = await getDealJacket(supabase, dealJacketId, auth.user.dealershipId);
  if (error || !row) return { success: false, error: error! };

  if (FINAL_STATUSES.includes(row.workflow_status as DealJacketStatus)) {
    return { success: false, error: `This deal jacket is already ${row.workflow_status}` };
  }

  const updated = await updateStatus(supabase, dealJacketId, "rejected", {
    reviewed_by: auth.user.userId,
    reviewed_at: new Date().toISOString(),
    rejection_reason: rejectionReason,
  });

  if (!updated) return { success: false, error: "Failed to reject deal jacket" };

  await releaseVehicleFromPendingDeal(supabase, {
    vehicleId: row.vehicle_id,
    dealershipId: auth.user.dealershipId,
    changedBy: auth.user.userId,
    notes: `Deal jacket ${row.jacket_number} rejected`,
  });

  await logDealJacketActivity({
    dealJacketId,
    action: "rejected",
    actorId: auth.user.userId,
    actorName: auth.user.userId,
    oldStatus: row.workflow_status,
    newStatus: "rejected",
    detail: { rejectionReason },
  });

  await updateCommissionStatus(dealJacketId, "rejected");

  return { success: true, dealJacket: updated };
}

export async function requestChangesOnDealJacket(
  dealJacketId: string,
  reviewNotes: string,
  changeCategories: string[],
): Promise<WorkflowResult> {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageDealJackets(auth.user.role)) {
    return { success: false, error: "Only managers can request changes" };
  }

  if (!reviewNotes.trim()) {
    return { success: false, error: "Review notes explaining required changes are required" };
  }

  if (changeCategories.length === 0) {
    return { success: false, error: "At least one change category must be specified" };
  }

  const supabase = await createClient();
  const { row, error } = await getDealJacket(supabase, dealJacketId, auth.user.dealershipId);
  if (error || !row) return { success: false, error: error! };

  if (FINAL_STATUSES.includes(row.workflow_status as DealJacketStatus)) {
    return { success: false, error: `This deal jacket is already ${row.workflow_status}` };
  }

  const updated = await updateStatus(supabase, dealJacketId, "changes_requested", {
    reviewed_by: auth.user.userId,
    reviewed_at: new Date().toISOString(),
    review_notes: reviewNotes,
    change_categories: changeCategories,
  });

  if (!updated) return { success: false, error: "Failed to request changes" };

  await logDealJacketActivity({
    dealJacketId,
    action: "changes_requested",
    actorId: auth.user.userId,
    actorName: auth.user.userId,
    oldStatus: row.workflow_status,
    newStatus: "changes_requested",
    detail: { reviewNotes, changeCategories },
  });

  await updateCommissionStatus(dealJacketId, "changes_requested");

  return { success: true, dealJacket: updated };
}

export async function resubmitDealJacket(
  dealJacketId: string,
  resubmissionNotes?: string,
): Promise<WorkflowResult> {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { row, error } = await getDealJacket(supabase, dealJacketId, auth.user.dealershipId);
  if (error || !row) return { success: false, error: error! };

  if (row.workflow_status !== "changes_requested") {
    return {
      success: false,
      error: "Can only resubmit a deal jacket that has changes requested",
    };
  }

  const updated = await updateStatus(supabase, dealJacketId, "resubmitted", {
    review_notes: null,
    change_categories: null,
    rejection_reason: null,
  });

  if (!updated) return { success: false, error: "Failed to resubmit deal jacket" };

  await logDealJacketActivity({
    dealJacketId,
    action: "resubmitted",
    actorId: auth.user.userId,
    actorName: auth.user.userId,
    oldStatus: row.workflow_status,
    newStatus: "resubmitted",
    detail: resubmissionNotes ? { resubmissionNotes } : null,
  });

  await updateCommissionStatus(dealJacketId, "resubmitted");

  return { success: true, dealJacket: updated };
}

export async function getDealJacketWorkflowStatus(
  dealJacketId: string,
): Promise<{ status: DealJacketStatus | null; error: string | null }> {
  const auth = await requireDealJacketAuth();
  if (!auth.ok) return { status: null, error: auth.error };

  const supabase = await createClient();
  const { row, error } = await getDealJacket(supabase, dealJacketId, auth.user.dealershipId);
  if (error || !row) return { status: null, error: error! };

  return { status: row.workflow_status as DealJacketStatus, error: null };
}
