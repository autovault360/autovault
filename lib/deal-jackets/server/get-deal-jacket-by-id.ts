import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/vehicles/server/utils";
import type { DealJacketFees } from "./db-types";

export type DealJacketDetailDto = {
  id: string;
  jacketNumber: string;
  dealId: string | null;
  vehicleId: string;
  customerId: string;
  salesRepId: string | null;
  soldPrice: number;
  totalTax: number;
  fees: DealJacketFees;
  totalSalePrice: number;
  downPayment: number;
  amountFinanced: number;
  balanceDue: number;
  totalInvested: number;
  additionalExpenses: number;
  commissionAmount: number;
  commissionStatus: string;
  profitGross: number;
  profitNet: number;
  dateSold: string;
  createdAt: string;
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    stockNumber: string;
    vin: string;
    mileage: number | null;
    color: string | null;
    acquisitionCost: number | null;
    imageUrl: string | null;
  };
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  salesRep: {
    id: string;
    name: string;
    commissionRate: number | null;
  } | null;
  expenses: {
    id: string;
    name: string;
    category: string;
    amount: number;
    date: string;
  }[];
  documents: {
    id: string;
    name: string;
    fileType: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
  dealRosNumber: string | null;
  dealNotes: string | null;
};

async function signDocumentPath(path: string): Promise<string> {
  try {
    return await getSignedUrl("deal-jacket-documents", path, 3600);
  } catch {
    try {
      return await getSignedUrl("vehicle-documents", path, 3600);
    } catch {
      return path;
    }
  }
}

export async function getDealJacketById(
  id: string,
  dealershipId: string,
): Promise<DealJacketDetailDto | null> {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("deal_jackets")
    .select(
      `
      *,
      vehicle:vehicles(
        id, year, make, model, trim, stock_number, vin, mileage,
        exterior_color, acquisition_cost,
        images:vehicle_images(storage_path, is_primary)
      ),
      deal:deals(ros_number, notes),
      customer:customers(id, name, phone, email, address, city, state, zip),
      sales_rep:users!deal_jackets_sales_rep_id_fkey(
        id,
        full_name,
        sales_rep_profile:sales_rep_profiles(commission_rate)
      )
    `,
    )
    .eq("id", id)
    .eq("dealership_id", dealershipId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !row) {
    return null;
  }

  const vehicle = Array.isArray(row.vehicle) ? row.vehicle[0] : row.vehicle;
  const customer = Array.isArray(row.customer)
    ? row.customer[0]
    : row.customer;
  const salesRep = Array.isArray(row.sales_rep)
    ? row.sales_rep[0]
    : row.sales_rep;
  const deal = Array.isArray(row.deal) ? row.deal[0] : row.deal;

  const images = vehicle?.images ?? [];
  const primary =
    images.find((i: { is_primary: boolean }) => i.is_primary) ?? images[0];
  let imageUrl: string | null = null;
  if (primary?.storage_path) {
    try {
      imageUrl = await getSignedUrl("vehicle-images", primary.storage_path, 3600);
    } catch {
      imageUrl = null;
    }
  }

  const { data: expenseRelations } = await supabase
    .from("deal_jacket_expenses_relation")
    .select(
      `
      amount,
      expense:vehicle_expenses(
        id, category, description, repair_date, total_cost
      )
    `,
    )
    .eq("deal_jacket_id", id);

  const expenses = (expenseRelations ?? [])
    .map((rel) => {
      const exp = Array.isArray(rel.expense) ? rel.expense[0] : rel.expense;
      if (!exp) return null;
      return {
        id: exp.id,
        name: exp.description,
        category: exp.category,
        amount: Number(rel.amount),
        date: exp.repair_date,
      };
    })
    .filter(Boolean) as DealJacketDetailDto["expenses"];

  const { data: docRows } = await supabase
    .from("deal_jacket_documents")
    .select("id, document_name, file_type, file_url, uploaded_at")
    .eq("deal_jacket_id", id)
    .is("deleted_at", null)
    .order("uploaded_at", { ascending: false });

  const documents = await Promise.all(
    (docRows ?? []).map(async (doc) => ({
      id: doc.id,
      name: doc.document_name,
      fileType: doc.file_type,
      fileUrl: await signDocumentPath(doc.file_url),
      uploadedAt: doc.uploaded_at,
    })),
  );

  const address = customer
    ? [customer.address, customer.city, customer.state, customer.zip]
        .filter(Boolean)
        .join(", ")
    : null;

  return {
    id: row.id,
    jacketNumber: row.jacket_number,
    dealId: row.deal_id,
    vehicleId: row.vehicle_id,
    customerId: row.customer_id,
    salesRepId: row.sales_rep_id,
    soldPrice: Number(row.sold_price),
    totalTax: Number(row.total_tax),
    fees: (row.fees ?? {}) as DealJacketFees,
    totalSalePrice: Number(row.total_sale_price),
    downPayment: Number(row.down_payment),
    amountFinanced: Number(row.amount_financed),
    balanceDue: Number(row.balance_due),
    totalInvested: Number(row.total_invested),
    additionalExpenses: Number(row.additional_expenses),
    commissionAmount: Number(row.commission_amount),
    commissionStatus: row.commission_status,
    profitGross: Number(row.profit_gross),
    profitNet: Number(row.profit_net),
    dateSold: row.date_sold,
    createdAt: row.created_at,
    vehicle: {
      id: vehicle?.id ?? row.vehicle_id,
      year: vehicle?.year ?? 0,
      make: vehicle?.make ?? "",
      model: vehicle?.model ?? "",
      trim: vehicle?.trim ?? null,
      stockNumber: vehicle?.stock_number ?? "",
      vin: vehicle?.vin ?? "",
      mileage: vehicle?.mileage ?? null,
      color: vehicle?.exterior_color ?? null,
      acquisitionCost: vehicle?.acquisition_cost
        ? Number(vehicle.acquisition_cost)
        : null,
      imageUrl,
    },
    dealRosNumber: deal?.ros_number ?? null,
    dealNotes: deal?.notes ?? null,
    customer: {
      id: customer?.id ?? row.customer_id,
      name: customer?.name ?? "",
      phone: customer?.phone ?? null,
      email: customer?.email ?? null,
      address,
    },
    salesRep: salesRep
      ? {
          id: salesRep.id,
          name: salesRep.full_name ?? "...",
          commissionRate: (() => {
            const profile = Array.isArray(salesRep.sales_rep_profile)
              ? salesRep.sales_rep_profile[0]
              : salesRep.sales_rep_profile;
            return profile?.commission_rate ?? null;
          })(),
        }
      : null,
    expenses,
    documents,
  };
}