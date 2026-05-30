import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/vehicles/server/utils";
import { formatField } from "@/lib/vehicles/types";
import { computeCustomerProfileSummary } from "../compute-profile-summary";
import type {
  ActivityTimelineItem,
  CommunicationType,
  CustomerDetail,
  CustomerSource,
  CustomerStatus,
  CustomerType,
  CustomerVehicleItem,
} from "../types";
import { computeLastActivity } from "./activity";
import { authenticateUser } from "./utils";

async function signedUrl(
  supabase: SupabaseClient,
  path: string | null,
  bucket: "vehicle-documents" | "customer-images" | "vehicle-images" = "vehicle-documents",
): Promise<string> {
  if (!path) return "";
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600);
    return error || !data ? "" : data.signedUrl;
  } catch {
    return "";
  }
}

type VehicleImageRow = {
  storage_path: string;
  is_primary: boolean;
  sort_order: number;
  deleted_at: string | null;
};

function pickPrimaryImagePath(images: VehicleImageRow[] | null): string | null {
  if (!images?.length) return null;
  const active = images.filter((i) => !i.deleted_at);
  const primary = active.find((i) => i.is_primary);
  if (primary) return primary.storage_path;
  const sorted = [...active].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0]?.storage_path ?? null;
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
      date_of_birth, drivers_license_number, image_url,
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
  const defaultSalesRep =
    (r.sales_rep as { full_name: string } | null)?.full_name ?? "Unassigned";

  const { data: dealRows } = await supabase
    .from("deals")
    .select(
      `
      id, vehicle_id, sale_date, total_price_otd, total_collected, notes,
      buyer_id_front_path, buyer_id_back_path, drivers_license_path, other_doc_path,
      created_at,
      vehicle:vehicles(
        stock_number, year, make, model, total_invested, vin,
        images:vehicle_images(storage_path, is_primary, sort_order, deleted_at)
      )
    `,
    )
    .eq("customer_id", customerId)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null)
    .order("sale_date", { ascending: false });

  const { data: jacketRows } = await supabase
    .from("deal_jackets")
    .select(
      `
      id, deal_id, jacket_number, balance_due, sold_price,
      sales_rep:users!deal_jackets_sales_rep_id_fkey(full_name)
    `,
    )
    .eq("customer_id", customerId)
    .eq("dealership_id", auth.user.dealershipId)
    .is("deleted_at", null);

  const jacketByDealId = new Map<
    string,
    {
      id: string;
      jacketNumber: string;
      balanceDue: number;
      soldPrice: number;
      salesRepName: string;
    }
  >();
  for (const j of jacketRows ?? []) {
    const jacket = j as Record<string, unknown>;
    const dealId = jacket.deal_id as string | null;
    if (!dealId) continue;
    const rep = jacket.sales_rep as { full_name: string } | null;
    jacketByDealId.set(dealId, {
      id: jacket.id as string,
      jacketNumber: jacket.jacket_number as string,
      balanceDue: Number(jacket.balance_due ?? 0),
      soldPrice: Number(jacket.sold_price ?? 0),
      salesRepName: rep?.full_name ?? defaultSalesRep,
    });
  }

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

  type VehicleJoin = {
    stock_number: string | null;
    year: number;
    make: string;
    model: string;
    total_invested: number;
    vin: string | null;
    images: VehicleImageRow[] | null;
  };

  const deals = await Promise.all(
    (dealRows ?? []).map(async (d) => {
      const deal = d as Record<string, unknown>;
      const vehicle = deal.vehicle as VehicleJoin | null;
      const invested = Number(vehicle?.total_invested ?? 0);
      const price = Number(deal.total_price_otd ?? 0);
      const collected = Number(deal.total_collected ?? 0);
      const vehicleName = vehicle
        ? `${vehicle.year} ${formatField("make", vehicle.make)} ${formatField("model", vehicle.model, vehicle.make)}`
        : "Unknown Vehicle";
      const imagePath = pickPrimaryImagePath(vehicle?.images ?? null);
      const imageUrl = imagePath
        ? await getSignedUrl("vehicle-images", imagePath)
        : null;
      const dealId = deal.id as string;
      const jacket = jacketByDealId.get(dealId);

      return {
        id: dealId,
        vehicleId: deal.vehicle_id as string,
        stockNumber: (vehicle?.stock_number as string) ?? "—",
        vehicleName,
        vin: (vehicle?.vin as string) ?? "—",
        imageUrl: imageUrl || null,
        saleDate: deal.sale_date as string,
        totalPriceOtd: price,
        totalCollected: collected,
        soldPrice: jacket?.soldPrice ?? price,
        grossProfit: price - invested,
        notes: (deal.notes as string) ?? null,
        dealJacketId: jacket?.id ?? null,
        jacketNumber: jacket?.jacketNumber ?? null,
        salesRepName: jacket?.salesRepName ?? defaultSalesRep,
        balanceDue: jacket?.balanceDue ?? Math.max(0, price - collected),
        buyerIdFront: deal.buyer_id_front_path as string | null,
        buyerIdBack: deal.buyer_id_back_path as string | null,
        driversLicense: deal.drivers_license_path as string | null,
        otherDoc: deal.other_doc_path as string | null,
        createdAt: deal.created_at as string,
      };
    }),
  );

  const purchaseHistory = deals.map((d) => ({
    id: d.id,
    stockNumber: d.stockNumber,
    vehicleName: d.vehicleName,
    saleDate: d.saleDate,
    salePrice: d.totalCollected,
    grossProfit: d.grossProfit,
  }));

  const status = r.status as CustomerStatus;
  const profileSummary = computeCustomerProfileSummary(
    deals.map((d) => ({
      saleDate: d.saleDate,
      totalPriceOtd: d.totalPriceOtd,
      totalCollected: d.totalCollected,
      balanceDue: d.balanceDue,
    })),
    status,
  );

  const vehicles: CustomerVehicleItem[] = deals.map((d) => ({
    vehicleId: d.vehicleId,
    stockNumber: d.stockNumber,
    vehicleName: d.vehicleName,
    vin: d.vin,
    imageUrl: d.imageUrl,
    saleDate: d.saleDate,
    soldPrice: d.soldPrice,
    dealId: d.id,
    dealJacketId: d.dealJacketId,
  }));

  const dealVehicleIds = deals.map((d) => d.vehicleId);
  const auditQuery = supabase
    .from("audit_logs")
    .select("id, action, new_values, created_at")
    .eq("dealership_id", auth.user.dealershipId)
    .eq("action", "MARKED_SOLD")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: auditRows } =
    dealVehicleIds.length > 0
      ? await auditQuery.in("entity_id", dealVehicleIds)
      : { data: [] };

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
          label: entry.label,
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
    activityTimeline.push({
      id: `audit-${a.id}`,
      type: "audit",
      title: "Vehicle purchased",
      description: `Sold at ${Number(newValues?.sale_price ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD" })}`,
      occurredAt: a.created_at as string,
      icon: "car",
    });
  }

  activityTimeline.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  const lastActivity = computeLastActivity({
    updated_at: r.updated_at as string,
    created_at: r.created_at as string,
    deals: (dealRows ?? []).map((d) => {
      const deal = d as Record<string, unknown>;
      return {
        sale_date: deal.sale_date as string,
        deleted_at: null,
      };
    }),
    notes: (noteRows ?? []).map((n) => {
      const note = n as Record<string, unknown>;
      return {
        created_at: note.created_at as string,
        deleted_at: null,
      };
    }),
    communications: (commRows ?? []).map((c) => {
      const comm = c as Record<string, unknown>;
      return {
        occurred_at: comm.occurred_at as string,
        type: comm.type as string,
        deleted_at: null,
      };
    }),
  });

  const imageSignedUrl = await signedUrl(
    supabase,
    r.image_url as string | null,
    "customer-images",
  );

  const addressParts = [
    [r.address, r.address2].filter(Boolean).join(", "),
    [r.city, r.state].filter(Boolean).join(", "),
    r.zip as string,
  ].filter(Boolean);
  const fullAddress = addressParts.join(", ") || "—";

  const dealsInProgressCount = deals.filter(
    (d) => d.totalPriceOtd > d.totalCollected,
  ).length;

  return {
    id: r.id as string,
    name: customerName,
    phone: (r.phone as string) ?? "",
    email: (r.email as string) ?? "",
    imageUrl: imageSignedUrl || null,
    type: r.type as CustomerType,
    status,
    source: (r.source as CustomerSource) ?? null,
    salesRepId: (r.sales_rep_id as string) ?? null,
    salesRepName: defaultSalesRep,
    address: (r.address as string) ?? "",
    address2: (r.address2 as string) ?? "",
    city: (r.city as string) ?? "",
    state: (r.state as string) ?? "",
    zip: (r.zip as string) ?? "",
    dateOfBirth: (r.date_of_birth as string) ?? null,
    driversLicenseNumber: (r.drivers_license_number as string) ?? null,
    customerSince: (r.created_at as string).split("T")[0],
    lifetimeValue: deals.reduce((sum, d) => sum + d.totalCollected, 0),
    vehicleCount: deals.length,
    activeDealsCount:
      dealsInProgressCount > 0
        ? dealsInProgressCount
        : status === "active_deal"
          ? 1
          : 0,
    totalDealsCount: deals.length,
    lastActivityDate: lastActivity.date.split("T")[0],
    lastActivityLabel: lastActivity.label,
    purchaseHistory,
    deals: deals.map(
      ({
        buyerIdFront: _a,
        buyerIdBack: _b,
        driversLicense: _c,
        otherDoc: _d,
        createdAt: _e,
        ...rest
      }) => rest,
    ),
    notes,
    communications,
    documents,
    activityTimeline: activityTimeline.slice(0, 20),
    profileSummary,
    vehicles,
    latestNotePreview: notes[0]?.body ?? null,
    fullAddress,
  };
}
