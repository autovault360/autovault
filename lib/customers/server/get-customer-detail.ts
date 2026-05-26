import { createClient } from "@/lib/supabase/server";
import { formatField } from "@/lib/vehicles/types";
import type {
  ActivityTimelineItem,
  CommunicationType,
  CustomerDetail,
  CustomerSource,
  CustomerStatus,
  CustomerType,
} from "../types";
import { authenticateUser } from "./utils";

async function signedUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null,
): Promise<string> {
  if (!path) return "";
  try {
    const { data, error } = await supabase.storage
      .from("vehicle-documents")
      .createSignedUrl(path, 3600);
    return error || !data ? "" : data.signedUrl;
  } catch {
    return "";
  }
}

export async function getCustomerDetail(
  customerId: string,
): Promise<CustomerDetail | null> {
  const auth = await authenticateUser();
  if (!auth.ok) return null;

  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("customers")
    .select(
      `
      id, name, phone, email, type, status, source, sales_rep_id,
      address, address2, city, state, zip,
      date_of_birth, drivers_license_number,
      created_at, updated_at,
      sales_rep:users!sales_rep_id(full_name)
    `,
    )
    .eq("id", customerId)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !row) {
    console.warn("getCustomerDetail:", error?.message);
    return null;
  }

  const r = row as Record<string, unknown>;
  const customerName = r.name as string;

  const { data: dealRows } = await supabase
    .from("deals")
    .select(
      `
      id, vehicle_id, sale_date, total_price_otd, total_collected, notes,
      buyer_id_front_path, buyer_id_back_path, drivers_license_path, other_doc_path,
      created_at,
      vehicle:vehicles(stock_number, year, make, model, total_invested)
    `,
    )
    .eq("customer_id", customerId)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .order("sale_date", { ascending: false });

  const { data: noteRows } = await supabase
    .from("customer_notes")
    .select("id, body, created_at, author:users!created_by(full_name)")
    .eq("customer_id", customerId)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { data: commRows } = await supabase
    .from("customer_communications")
    .select(
      "id, type, subject, body, occurred_at, author:users!created_by(full_name)",
    )
    .eq("customer_id", customerId)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false });

  const { data: docRows } = await supabase
    .from("customer_documents")
    .select("id, label, storage_path, created_at")
    .eq("customer_id", customerId)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { data: auditRows } = await supabase
    .from("audit_logs")
    .select("id, action, new_values, created_at")
    .eq("dealership_id", auth.user.dealershipId)
    .order("created_at", { ascending: false })
    .limit(50);

  type VehicleJoin = {
    stock_number: string | null;
    year: number;
    make: string;
    model: string;
    total_invested: number;
  };

  const deals = (dealRows ?? []).map((d) => {
    const deal = d as Record<string, unknown>;
    const vehicle = deal.vehicle as VehicleJoin | null;
    const invested = Number(vehicle?.total_invested ?? 0);
    const price = Number(deal.total_price_otd ?? 0);
    const vehicleName = vehicle
      ? `${vehicle.year} ${formatField("make", vehicle.make)} ${formatField("model", vehicle.model, vehicle.make)}`
      : "Unknown Vehicle";
    return {
      id: deal.id as string,
      vehicleId: deal.vehicle_id as string,
      stockNumber: (vehicle?.stock_number as string) ?? "—",
      vehicleName,
      saleDate: deal.sale_date as string,
      totalPriceOtd: price,
      totalCollected: Number(deal.total_collected ?? 0),
      grossProfit: price - invested,
      notes: (deal.notes as string) ?? null,
      buyerIdFront: deal.buyer_id_front_path as string | null,
      buyerIdBack: deal.buyer_id_back_path as string | null,
      driversLicense: deal.drivers_license_path as string | null,
      otherDoc: deal.other_doc_path as string | null,
      createdAt: deal.created_at as string,
    };
  });

  const purchaseHistory = deals.map((d) => ({
    id: d.id,
    stockNumber: d.stockNumber,
    vehicleName: d.vehicleName,
    saleDate: d.saleDate,
    salePrice: d.totalPriceOtd,
    grossProfit: d.grossProfit,
  }));

  const lifetimeValue = deals.reduce((sum, d) => sum + d.totalCollected, 0);

  const notes = (noteRows ?? []).map((n) => {
    const note = n as Record<string, unknown>;
    const author = note.author as { full_name: string } | null;
    return {
      id: note.id as string,
      body: note.body as string,
      authorName: author?.full_name ?? "Staff",
      createdAt: note.created_at as string,
    };
  });

  const communications = (commRows ?? []).map((c) => {
    const comm = c as Record<string, unknown>;
    const author = comm.author as { full_name: string } | null;
    return {
      id: comm.id as string,
      type: comm.type as CommunicationType,
      subject: (comm.subject as string) ?? "",
      body: (comm.body as string) ?? "",
      occurredAt: comm.occurred_at as string,
      authorName: author?.full_name ?? "Staff",
    };
  });

  const documents: CustomerDetail["documents"] = [];

  for (const d of deals) {
    const docEntries = [
      { path: d.buyerIdFront, label: "Buyer ID (Front)" },
      { path: d.buyerIdBack, label: "Buyer ID (Back)" },
      { path: d.driversLicense, label: "Driver's License" },
      { path: d.otherDoc, label: "Other Document" },
    ];
    for (const entry of docEntries) {
      if (!entry.path) continue;
      const url = await signedUrl(supabase, entry.path);
      if (url) {
        documents.push({
          id: `${d.id}-${entry.label}`,
          label: `${entry.label} — ${d.vehicleName}`,
          url,
          source: "deal",
          createdAt: d.saleDate,
        });
      }
    }
  }

  for (const doc of docRows ?? []) {
    const d = doc as Record<string, unknown>;
    const url = await signedUrl(supabase, d.storage_path as string);
    if (url) {
      documents.push({
        id: d.id as string,
        label: d.label as string,
        url,
        source: "customer",
        createdAt: d.created_at as string,
      });
    }
  }

  const activityTimeline: ActivityTimelineItem[] = [];

  for (const comm of communications) {
    activityTimeline.push({
      id: `comm-${comm.id}`,
      type: "communication",
      title: comm.subject || comm.type,
      description: comm.body,
      occurredAt: comm.occurredAt,
      icon:
        comm.type === "email"
          ? "mail"
          : comm.type === "call"
            ? "phone"
            : "calendar",
    });
  }

  for (const note of notes) {
    activityTimeline.push({
      id: `note-${note.id}`,
      type: "note",
      title: "Note added",
      description: note.body,
      occurredAt: note.createdAt,
      icon: "note",
    });
  }

  for (const deal of deals) {
    activityTimeline.push({
      id: `deal-${deal.id}`,
      type: "deal",
      title: `Purchased ${deal.vehicleName}`,
      description: `Sale price ${deal.totalPriceOtd.toLocaleString("en-US", { style: "currency", currency: "USD" })}`,
      occurredAt: deal.saleDate,
      icon: "car",
    });
  }

  for (const audit of auditRows ?? []) {
    const a = audit as Record<string, unknown>;
    const newValues = a.new_values as Record<string, unknown> | null;
    if (newValues?.customer_name !== customerName) continue;
    if (a.action !== "MARKED_SOLD") continue;
    activityTimeline.push({
      id: `audit-${a.id}`,
      type: "audit",
      title: "Vehicle purchased",
      description: `Sold at ${Number(newValues.sale_price ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}`,
      occurredAt: a.created_at as string,
      icon: "car",
    });
  }

  activityTimeline.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  const salesRep = r.sales_rep as { full_name: string } | null;
  const status = r.status as CustomerStatus;

  let lastActivityDate = r.updated_at as string;
  let lastActivityLabel = "Profile updated";
  if (activityTimeline.length > 0) {
    lastActivityDate = activityTimeline[0].occurredAt;
    lastActivityLabel = activityTimeline[0].title;
  }

  return {
    id: r.id as string,
    name: customerName,
    phone: (r.phone as string) ?? "",
    email: (r.email as string) ?? "",
    type: r.type as CustomerType,
    status,
    source: (r.source as CustomerSource) ?? null,
    salesRepId: (r.sales_rep_id as string) ?? null,
    salesRepName: salesRep?.full_name ?? "Unassigned",
    address: (r.address as string) ?? "",
    address2: (r.address2 as string) ?? "",
    city: (r.city as string) ?? "",
    state: (r.state as string) ?? "",
    zip: (r.zip as string) ?? "",
    dateOfBirth: (r.date_of_birth as string) ?? null,
    driversLicenseNumber: (r.drivers_license_number as string) ?? null,
    customerSince: (r.created_at as string).split("T")[0],
    lifetimeValue,
    vehicleCount: deals.length,
    activeDealsCount: status === "active_deal" ? 1 : 0,
    totalDealsCount: deals.length,
    lastActivityDate: lastActivityDate.split("T")[0],
    lastActivityLabel,
    purchaseHistory,
    deals: deals.map(({ buyerIdFront: _a, buyerIdBack: _b, driversLicense: _c, otherDoc: _d, createdAt: _e, ...rest }) => rest),
    notes,
    communications,
    documents,
    activityTimeline: activityTimeline.slice(0, 20),
  };
}
