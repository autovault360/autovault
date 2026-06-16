"use server";

import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/vehicles/server/utils";
import { authenticateWholesaleDealer } from "@/lib/dealer/inventory/server/utils";
import type {
  WholesaleDocumentListParams,
  WholesaleDocumentListResult,
} from "../types";
import {
  mapWholesaleDocument,
  type WholesaleDocumentDbRow,
} from "./map-wholesale-document";

const SORT_COLUMN_MAP: Record<
  NonNullable<WholesaleDocumentListParams["sortBy"]>,
  string
> = {
  documentName: "document_name",
  uploadDate: "upload_date",
  expiryDate: "expiry_date",
  fileSize: "file_size",
  status: "status",
};

export async function listWholesaleDocuments(
  params: WholesaleDocumentListParams = {},
): Promise<WholesaleDocumentListResult> {
  const auth = await authenticateWholesaleDealer();
  if (!auth.ok) {
    return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const sortBy = params.sortBy ?? "uploadDate";
  const sortDir = params.sortDir ?? "desc";
  const sortColumn = SORT_COLUMN_MAP[sortBy];

  let query = supabase
    .from("wholesale_documents")
    .select(
      `
      *,
      vehicle:vehicles(id, year, make, model, trim, stock_number, vin),
      uploader:users!wholesale_documents_uploaded_by_fkey(full_name)
    `,
      { count: "exact" },
    )
    .eq("dealership_id", auth.user.dealershipId);

  if (params.includeDeleted) {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
  }

  if (params.search?.trim()) {
    const q = `%${params.search.trim()}%`;
    query = query.or(
      `document_name.ilike.${q},original_file_name.ilike.${q},description.ilike.${q}`,
    );
  }

  if (params.documentType && params.documentType !== "all") {
    query = query.eq("document_type", params.documentType);
  }

  if (params.category && params.category !== "all") {
    query = query.eq("category", params.category);
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.vehicleId && params.vehicleId !== "all") {
    query = query.eq("vehicle_id", params.vehicleId);
  }

  query = query.order(sortColumn, { ascending: sortDir === "asc" }).range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("listWholesaleDocuments failed:", error.message);
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const rows = (data ?? []) as WholesaleDocumentDbRow[];
  const vehicleIds = [...new Set(rows.map((r) => r.vehicle_id).filter(Boolean))] as string[];

  const imageMap = new Map<string, string>();
  if (vehicleIds.length > 0) {
    const { data: images } = await supabase
      .from("vehicle_images")
      .select("vehicle_id, storage_path")
      .in("vehicle_id", vehicleIds)
      .eq("is_primary", true)
      .is("deleted_at", null);

    for (const img of images ?? []) {
      if (img.storage_path) {
        try {
          const url = await getSignedUrl("vehicle-images", img.storage_path, 3600);
          imageMap.set(img.vehicle_id, url);
        } catch {
          /* ignore */
        }
      }
    }
  }

  const items = rows.map((row) =>
    mapWholesaleDocument(row, row.vehicle_id ? imageMap.get(row.vehicle_id) : null),
  );

  const total = count ?? 0;
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
