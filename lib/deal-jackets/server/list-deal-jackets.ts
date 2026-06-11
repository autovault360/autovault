import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/vehicles/server/utils";

export type DealJacketListItemDto = {
  id: string;
  jacketNumber: string;
  vehicleId: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  salesRepId: string | null;
  salesRepName: string;
  year: number;
  make: string;
  model: string;
  stockNumber: string;
  vin: string;
  imageUrl: string | null;
  saleDate: string;
  salePrice: number;
  totalSalePrice: number;
  totalProfit: number;
  commissionAmount: number;
  commissionStatus: string;
  paymentMethod: string;
  workflowStatus: string;
};

export type ListDealJacketsResult = {
  items: DealJacketListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listDealJackets(params: {
  dealershipId: string;
  salesRepId?: string;
  page?: number;
  pageSize?: number;
}): Promise<ListDealJacketsResult> {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("deal_jackets")
    .select(
      `
      id,
      jacket_number,
      vehicle_id,
      customer_id,
      sales_rep_id,
      sold_price,
      total_sale_price,
      profit_net,
      commission_amount,
      commission_status,
      date_sold,
      workflow_status,
      vehicle:vehicles(year, make, model, stock_number, vin),
      customer:customers(name, phone),
      sales_rep:users!deal_jackets_sales_rep_id_fkey(full_name),
      commissions:sales_rep_commissions!deal_jacket_id(status)
    `,
      { count: "exact" },
    )
    .eq("dealership_id", params.dealershipId)
    .is("deleted_at", null);

  if (params.salesRepId) {
    query = query.eq("sales_rep_id", params.salesRepId);
  }

  const { data, error, count } = await query
    .order("date_sold", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const vehicleIds = (data ?? []).map((r) => r.vehicle_id);
  const imageByVehicle = new Map<string, string>();

  if (vehicleIds.length > 0) {
    const { data: images } = await supabase
      .from("vehicle_images")
      .select("vehicle_id, storage_path, is_primary")
      .in("vehicle_id", vehicleIds)
      .is("deleted_at", null)
      .order("is_primary", { ascending: false });

    for (const img of images ?? []) {
      if (!imageByVehicle.has(img.vehicle_id) || img.is_primary) {
        imageByVehicle.set(img.vehicle_id, img.storage_path);
      }
    }
  }

  const items: DealJacketListItemDto[] = await Promise.all(
    (data ?? []).map(async (row) => {
      const vehicle = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
      const customer = Array.isArray(row.customer)
        ? row.customer[0]
        : row.customer;
      const salesRep = Array.isArray(row.sales_rep)
        ? row.sales_rep[0]
        : row.sales_rep;

      const commissions = Array.isArray(row.commissions)
        ? row.commissions
        : [];
      const commissionStatus =
        commissions.length > 0 && commissions[0]?.status
          ? commissions[0].status
          : row.commission_status;

      const storagePath = imageByVehicle.get(row.vehicle_id);
      let imageUrl: string | null = null;
      if (storagePath) {
        try {
          imageUrl = await getSignedUrl("vehicle-images", storagePath, 3600);
        } catch {
          imageUrl = null;
        }
      }

      return {
        id: row.id,
        jacketNumber: row.jacket_number,
        vehicleId: row.vehicle_id,
        customerId: row.customer_id,
        customerName: customer?.name ?? "",
        customerPhone: customer?.phone ?? null,
        salesRepId: row.sales_rep_id,
        salesRepName: salesRep?.full_name ?? "...",
        year: vehicle?.year ?? 0,
        make: vehicle?.make ?? "",
        model: vehicle?.model ?? "",
        stockNumber: vehicle?.stock_number ?? "",
        vin: vehicle?.vin ?? "",
        imageUrl,
        saleDate: row.date_sold.split("T")[0],
        salePrice: Number(row.sold_price),
        totalSalePrice: Number(row.total_sale_price),
        totalProfit: Number(row.profit_net),
        commissionAmount: Number(row.commission_amount),
        commissionStatus,
        paymentMethod: "...",
        workflowStatus: row.workflow_status ?? "pending_review",
      };
    }),
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
