import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/vehicles/server/utils";
import type {
  CustomerListItem,
  CustomerSource,
  CustomerStatus,
  CustomerType,
} from "../types";
import { computeLastActivity } from "./activity";
import { authenticateUser } from "./utils";

type DealRow = {
  id: string;
  total_collected: number;
  sale_date: string;
  deleted_at: string | null;
};

type NoteRow = {
  created_at: string;
  deleted_at: string | null;
};

type CommRow = {
  occurred_at: string;
  type: string;
  deleted_at: string | null;
};

type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  type: CustomerType;
  status: CustomerStatus;
  source: CustomerSource | null;
  sales_rep_id: string | null;
  created_at: string;
  updated_at: string;
  sales_rep: { full_name: string } | { full_name: string }[] | null;
  deals: DealRow[];
  notes: NoteRow[];
  communications: CommRow[];
};

function mapCustomerRow(row: CustomerRow, imageUrl: string | null): CustomerListItem {
  const activeDeals = (row.deals ?? []).filter((d) => !d.deleted_at);
  const lifetimeValue = activeDeals.reduce(
    (sum, d) => sum + Number(d.total_collected ?? 0),
    0,
  );
  const lastActivity = computeLastActivity(row);

  const salesRep = Array.isArray(row.sales_rep)
    ? row.sales_rep[0]
    : row.sales_rep;

  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    imageUrl,
    type: row.type,
    status: row.status,
    source: row.source,
    salesRepId: row.sales_rep_id,
    salesRepName: salesRep?.full_name ?? "Unassigned",
    customerSince: row.created_at.split("T")[0],
    lastActivityDate: lastActivity.date.split("T")[0],
    lastActivityLabel: lastActivity.label,
    lifetimeValue,
    vehicleCount: activeDeals.length,
    dealsCount: activeDeals.length,
  };
}

export async function getCustomers(): Promise<CustomerListItem[]> {
  const auth = await authenticateUser();
  if (!auth.ok) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      id, name, phone, email, image_url, type, status, source, sales_rep_id,
      created_at, updated_at,
      sales_rep:users!sales_rep_id(full_name),
      deals(id, total_collected, sale_date, deleted_at),
      notes:customer_notes(created_at, deleted_at),
      communications:customer_communications(occurred_at, type, deleted_at)
    `,
    )
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("getCustomers:", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as CustomerRow[];
  const customers: CustomerListItem[] = [];

  for (const row of rows) {
    let imageUrl: string | null = null;
    if (row.image_url) {
      try {
        imageUrl = await getSignedUrl("customer-images", row.image_url);
      } catch {
        imageUrl = null;
      }
    }
    customers.push(mapCustomerRow(row, imageUrl));
  }

  return customers;
}

export async function getSalesReps(): Promise<
  { id: string; fullName: string }[]
> {
  const auth = await authenticateUser();
  if (!auth.ok) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("dealership_id", auth.user.dealershipId)
    .in("role", ["owner", "manager", "sales_rep"])
    .order("full_name");

  if (error) {
    console.warn("getSalesReps:", error.message);
    return [];
  }

  return (data ?? []).map((u) => ({
    id: u.id as string,
    fullName: u.full_name as string,
  }));
}
