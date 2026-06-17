import { createClient } from "@/lib/supabase/server";
import { getDealAggregates } from "./deal-jacket.service";
import type {
  FilingStatus,
  FilingFrequency,
  TaxFilingPeriod,
  TaxFilingPeriodRaw,
  DealershipTaxSettings,
  DealershipTaxSettingsRaw,
  FilingPeriodSummary,
  FilingPeriodDetail,
  FilingPeriodDealVehicle,
  TaxReminder,
  SaveTaxSettingsInput,
} from "@/lib/tax-filing/types";

function toPeriod(raw: TaxFilingPeriodRaw): TaxFilingPeriod {
  return {
    id: raw.id,
    dealershipId: raw.dealership_id,
    name: raw.name,
    startDate: raw.start_date,
    endDate: raw.end_date,
    dueDate: raw.due_date,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function toSettings(raw: DealershipTaxSettingsRaw): DealershipTaxSettings {
  return {
    id: raw.id,
    dealershipId: raw.dealership_id,
    state: raw.state,
    filingFrequency: raw.filing_frequency,
    reminderDays: raw.reminder_days,
  };
}

/* ──────── Period Generation ──────── */

export function generatePeriods(
  frequency: FilingFrequency,
  startDate: string,
): { name: string; startDate: string; endDate: string; dueDate: string }[] {
  const start = new Date(startDate);
  const periods: { name: string; startDate: string; endDate: string; dueDate: string }[] = [];

  switch (frequency) {
    case "monthly": {
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(start.getFullYear(), start.getMonth() + i, 1);
        const monthEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 0);
        const dueDate = new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, 20);
        periods.push({
          name: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          startDate: monthStart.toISOString().slice(0, 10),
          endDate: monthEnd.toISOString().slice(0, 10),
          dueDate: dueDate.toISOString().slice(0, 10),
        });
      }
      break;
    }

    case "quarterly": {
      const qStarts = [
        { month: 0, name: "Q1" },
        { month: 3, name: "Q2" },
        { month: 6, name: "Q3" },
        { month: 9, name: "Q4" },
      ];
      const startYear = start.getFullYear();
      const startQ = qStarts.findIndex((q) => q.month >= start.getMonth());
      const startIndex = startQ >= 0 ? startQ : 0;

      for (let i = 0; i < 4; i++) {
        const qi = (startIndex + i) % 4;
        const q = qStarts[qi];
        const yearOffset = Math.floor((startIndex + i) / 4);
        const year = startYear + yearOffset;
        const qStart = new Date(year, q.month, 1);
        const qEnd = new Date(year, q.month + 3, 0);
        let dueMonth = q.month + 3;
        let dueYear = year;
        // Q ends in Mar/Jun/Sep/Dec, due month = end month + 1 (Apr/Jul/Oct/Jan)
        const due = new Date(dueYear, dueMonth, dueMonth === 0 ? 31 : undefined);
        if (dueMonth === 0) {
          due.setDate(due.getDate()); // keep constructor calc
        }
        // Simplify: due date is last day of month following quarter end
        // Q1 (Jan-Mar) due Apr 30, Q2 (Apr-Jun) due Jul 31, Q3 (Jul-Sep) due Oct 31, Q4 (Oct-Dec) due Jan 31
        const dueDateMap = [
          { m: 3, d: 30 }, // Q1 due Apr 30
          { m: 6, d: 31 }, // Q2 due Jul 31
          { m: 9, d: 31 }, // Q3 due Oct 31
          { m: 0, d: 31 }, // Q4 due Jan 31 (next year)
        ];
        const dd = dueDateMap[qi];
        const dueYearAdj = qi === 3 ? year + 1 : year;
        const dueDate = `${dueYearAdj}-${String(dd.m + 1).padStart(2, "0")}-${String(dd.d).padStart(2, "0")}`;

        periods.push({
          name: `${q.name} ${year}`,
          startDate: qStart.toISOString().slice(0, 10),
          endDate: qEnd.toISOString().slice(0, 10),
          dueDate,
        });
      }
      break;
    }

    case "annual": {
      const year = start.getFullYear();
      periods.push({
        name: `Annual ${year}`,
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        dueDate: `${year + 1}-01-31`,
      });
      break;
    }

    case "custom":
      // No auto-generation for custom — the user defines periods manually
      break;
  }

  return periods;
}

/* ──────── Settings ──────── */

export async function getTaxSettings(
  dealershipId: string,
): Promise<DealershipTaxSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dealership_tax_settings")
    .select("*")
    .eq("dealership_id", dealershipId)
    .maybeSingle();

  if (!data) return null;
  return toSettings(data as DealershipTaxSettingsRaw);
}

export async function upsertTaxSettings(
  dealershipId: string,
  input: SaveTaxSettingsInput,
): Promise<DealershipTaxSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dealership_tax_settings")
    .upsert(
      {
        dealership_id: dealershipId,
        state: input.state,
        filing_frequency: input.filingFrequency,
        reminder_days: input.reminderDays,
      },
      { onConflict: "dealership_id" },
    )
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save tax settings");
  }

  return toSettings(data as DealershipTaxSettingsRaw);
}

/* ──────── Filing Periods ──────── */

export async function createFilingPeriodsFromSettings(
  dealershipId: string,
): Promise<TaxFilingPeriod[]> {
  const settings = await getTaxSettings(dealershipId);
  if (!settings) return [];

  const periods = generatePeriods(settings.filingFrequency, new Date().toISOString().slice(0, 10));

  const supabase = await createClient();
  const rows = periods.map((p) => ({
    dealership_id: dealershipId,
    name: p.name,
    start_date: p.startDate,
    end_date: p.endDate,
    due_date: p.dueDate,
    status: "open" as FilingStatus,
  }));

  const { data, error } = await supabase
    .from("tax_filing_periods")
    .insert(rows)
    .select("*");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((r) => toPeriod(r as TaxFilingPeriodRaw));
}

export async function getFilingPeriods(
  dealershipId: string,
): Promise<FilingPeriodSummary[]> {
  const supabase = await createClient();

  const { data: periods } = await supabase
    .from("tax_filing_periods")
    .select("*")
    .eq("dealership_id", dealershipId)
    .order("start_date", { ascending: false });

  if (!periods) return [];

  const summaries: FilingPeriodSummary[] = [];

  for (const period of periods as TaxFilingPeriodRaw[]) {
    const { data: deals } = await supabase
      .from("filing_period_deals")
      .select("deal_jacket_id")
      .eq("filing_period_id", period.id);

    const dealJacketIds = (deals ?? []).map((d) => d.deal_jacket_id);
    let totalTaxEntered = 0;

    if (dealJacketIds.length > 0) {
      const { data: jackets } = await supabase
        .from("deal_jackets")
        .select("total_tax")
        .in("id", dealJacketIds);

      totalTaxEntered = (jackets ?? []).reduce(
        (sum, j) => sum + Number(j.total_tax ?? 0),
        0,
      );
    }

    summaries.push({
      ...toPeriod(period),
      vehicleCount: dealJacketIds.length,
      totalTaxEntered,
    });
  }

  return summaries;
}

export async function getUpcomingPeriod(
  dealershipId: string,
): Promise<TaxFilingPeriod | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("tax_filing_periods")
    .select("*")
    .eq("dealership_id", dealershipId)
    .gte("due_date", today)
    .order("due_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return toPeriod(data as TaxFilingPeriodRaw);
}

export async function getFilingPeriodDetail(
  periodId: string,
  dealershipId: string,
): Promise<FilingPeriodDetail | null> {
  const supabase = await createClient();

  const { data: period } = await supabase
    .from("tax_filing_periods")
    .select("*")
    .eq("id", periodId)
    .eq("dealership_id", dealershipId)
    .single();

  if (!period) return null;

  const { data: dealLinks } = await supabase
    .from("filing_period_deals")
    .select("deal_jacket_id")
    .eq("filing_period_id", periodId);

  const dealJacketIds = (dealLinks ?? []).map((d) => d.deal_jacket_id);
  const vehicles: FilingPeriodDealVehicle[] = [];
  let totalTaxEntered = 0;

  if (dealJacketIds.length > 0) {
    const { data: jackets } = await supabase
      .from("deal_jackets")
      .select(
        `
        id,
        jacket_number,
        sold_price,
        total_tax,
        date_sold,
        vehicle:vehicles(year, make, model, vin),
        customer:customers(name, zip)
      `,
      )
      .in("id", dealJacketIds);

    for (const row of jackets ?? []) {
      const r = row as {
        id: string;
        jacket_number: string | null;
        sold_price: number;
        total_tax: number;
        date_sold: string;
        vehicle: { year: number; make: string; model: string; vin: string }[] | null;
        customer: { name: string; zip: string }[] | null;
      };
      const v = Array.isArray(r.vehicle) ? r.vehicle[0] : r.vehicle;
      const c = Array.isArray(r.customer) ? r.customer[0] : r.customer;

      vehicles.push({
        dealJacketId: r.id,
        jacketNumber: r.jacket_number ?? "",
        vehicleTitle: v ? `${v.year} ${v.make} ${v.model}` : "Unknown",
        vin: v?.vin ?? "",
        customerName: c?.name ?? "Unknown",
        soldDate: r.date_sold ? new Date(r.date_sold).toLocaleDateString("en-US") : "",
        buyerZip: c?.zip ?? "",
        salePrice: Number(r.sold_price ?? 0),
        salesTaxEntered: Number(r.total_tax ?? 0),
      });

      totalTaxEntered += Number(r.total_tax ?? 0);
    }
  }

  const { data: docs } = await supabase
    .from("tax_filing_documents")
    .select("*")
    .eq("filing_period_id", periodId)
    .order("uploaded_at", { ascending: false });

  const documents = await Promise.all(
    (docs ?? []).map(async (d) => {
      let signedUrl: string | null = null;
      if (d.file_path) {
        const { data: urlData } = await supabase.storage
          .from("tax-filings")
          .createSignedUrl(d.file_path, 3600);
        signedUrl = urlData?.signedUrl ?? null;
      }
      return {
        id: d.id,
        fileName: d.file_name,
        filePath: d.file_path,
        uploadedAt: d.uploaded_at,
        signedUrl,
      };
    }),
  );

  return {
    ...toPeriod(period as TaxFilingPeriodRaw),
    vehicles,
    totalTaxEntered,
    documents,
  };
}

/* ──────── Status Management ──────── */

export async function updatePeriodStatus(
  periodId: string,
  dealershipId: string,
  status: FilingStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tax_filing_periods")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", periodId)
    .eq("dealership_id", dealershipId);

  if (error) throw new Error(error.message);
}

/* ──────── Deal Jacket Assignment ──────── */

export async function assignDealJacketToPeriod(
  dealJacketId: string,
  dealershipId: string,
): Promise<void> {
  const supabase = await createClient();

  const { data: jacket } = await supabase
    .from("deal_jackets")
    .select("id, date_sold")
    .eq("id", dealJacketId)
    .eq("dealership_id", dealershipId)
    .single();

  if (!jacket) return;

  const soldDate = new Date(jacket.date_sold).toISOString().slice(0, 10);

  const { data: periods } = await supabase
    .from("tax_filing_periods")
    .select("id, start_date, end_date")
    .eq("dealership_id", dealershipId)
    .lte("start_date", soldDate)
    .gte("end_date", soldDate);

  if (!periods || periods.length === 0) return;

  // Insert link - ignore if already exists (unique constraint)
  await supabase
    .from("filing_period_deals")
    .insert({
      filing_period_id: periods[0].id,
      deal_jacket_id: dealJacketId,
    })
    .select()
    .maybeSingle();
}

/* ──────── Documents ──────── */

export async function getDocumentsForPeriod(
  periodId: string,
): Promise<{ id: string; fileName: string; filePath: string; uploadedAt: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tax_filing_documents")
    .select("*")
    .eq("filing_period_id", periodId)
    .order("uploaded_at", { ascending: false });

  return (data ?? []).map((d) => ({
    id: d.id,
    fileName: d.file_name,
    filePath: d.file_path,
    uploadedAt: d.uploaded_at,
  }));
}

export async function deleteDocument(
  documentId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tax_filing_documents")
    .delete()
    .eq("id", documentId);

  if (error) throw new Error(error.message);
}

/* ──────── Reminders ──────── */

export async function getUpcomingReminders(
  dealershipId: string,
): Promise<TaxReminder[]> {
  const supabase = await createClient();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const settings = await getTaxSettings(dealershipId);
  const reminderDays = settings?.reminderDays ?? 14;

  const { data: periods } = await supabase
    .from("tax_filing_periods")
    .select("*")
    .eq("dealership_id", dealershipId)
    .in("status", ["open", "due"])
    .order("due_date", { ascending: true });

  if (!periods) return [];

  const reminders: TaxReminder[] = [];

  for (const period of periods as TaxFilingPeriodRaw[]) {
    const dueDate = new Date(period.due_date);
    const diffMs = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= reminderDays) {
      const { count } = await supabase
        .from("filing_period_deals")
        .select("id", { count: "exact", head: true })
        .eq("filing_period_id", period.id);

      reminders.push({
        periodId: period.id,
        periodName: period.name,
        dueDate: period.due_date,
        daysUntilDue,
        vehicleCount: count ?? 0,
        status: period.status,
      });
    }
  }

  return reminders;
}
