import { createClient } from "@/lib/supabase/server";
import type {
  CustomerListItem,
  CustomerSource,
  CustomerStatus,
  CustomerType,
} from "../types";
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

function computeLastActivity(row: CustomerRow): {
  date: string;
  label: string;
} {
  const candidates: { date: string; label: string; ts: number }[] = [];

  if (row.updated_at) {
    candidates.push({
      date: row.updated_at,
      label: "Profile updated",
      ts: new Date(row.updated_at).getTime(),
    });
  }

  for (const deal of row.deals ?? []) {
    if (deal.deleted_at) continue;
    candidates.push({
      date: deal.sale_date,
      label: "Purchased vehicle",
      ts: new Date(deal.sale_date).getTime(),
    });
  }

  for (const comm of row.communications ?? []) {
    if (comm.deleted_at) continue;
    const label =
      comm.type === "email"
        ? "Email sent"
        : comm.type === "call"
          ? "Phone call"
          : comm.type === "sms"
            ? "SMS sent"
            : comm.type === "meeting"
              ? "Meeting"
              : "Inquiry submitted";
    candidates.push({
      date: comm.occurred_at,
      label,
      ts: new Date(comm.occurred_at).getTime(),
    });
  }

  for (const note of row.notes ?? []) {
    if (note.deleted_at) continue;
    candidates.push({
      date: note.created_at,
      label: "Note added",
      ts: new Date(note.created_at).getTime(),
    });
  }

  if (candidates.length === 0) {
    return { date: row.created_at, label: "Customer created" };
  }

  candidates.sort((a, b) => b.ts - a.ts);
  return { date: candidates[0].date, label: candidates[0].label };
}

function mapCustomerRow(row: CustomerRow): CustomerListItem {
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
      id, name, phone, email, type, status, source, sales_rep_id,
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

  return ((data ?? []) as unknown as CustomerRow[]).map(mapCustomerRow);
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
