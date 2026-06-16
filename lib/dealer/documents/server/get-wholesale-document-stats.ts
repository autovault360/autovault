"use server";

import { createClient } from "@/lib/supabase/server";
import { authenticateWholesaleDealer } from "@/lib/dealer/inventory/server/utils";
import type { WholesaleDocumentStats } from "../types";
import { todayIsoDate } from "./map-wholesale-document";

export async function getWholesaleDocumentStats(): Promise<WholesaleDocumentStats> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) {
    return {
      totalDocuments: 0,
      missingDocuments: 0,
      pendingReview: 0,
      uploadedToday: 0,
    };
  }

  const supabase = await createClient();
  const dealershipId = auth.user.dealershipId;
  const today = todayIsoDate();
  const todayStart = `${today}T00:00:00.000Z`;

  const { count: totalDocuments } = await supabase
    .from("wholesale_documents")
    .select("*", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null);

  const { count: missingDocuments } = await supabase
    .from("wholesale_documents")
    .select("*", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .eq("document_type", "vehicle_document")
    .is("vehicle_id", null)
    .is("deleted_at", null);

  const { count: pendingReview } = await supabase
    .from("wholesale_documents")
    .select("*", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .eq("status", "pending_review")
    .is("deleted_at", null);

  const { count: uploadedToday } = await supabase
    .from("wholesale_documents")
    .select("*", { count: "exact", head: true })
    .eq("dealership_id", dealershipId)
    .gte("upload_date", todayStart)
    .is("deleted_at", null);

  return {
    totalDocuments: totalDocuments ?? 0,
    missingDocuments: missingDocuments ?? 0,
    pendingReview: pendingReview ?? 0,
    uploadedToday: uploadedToday ?? 0,
  };
}
