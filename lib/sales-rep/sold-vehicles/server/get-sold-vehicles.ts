"use server";

import { createClient } from "@/lib/supabase/server";
import type { ISalesRepSoldVehicle } from "../types";

export async function getSalesRepSoldVehicles(): Promise<{
  vehicles: ISalesRepSoldVehicle[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { vehicles: [], error: "Not authenticated" };

    const { data: profile } = await supabase
      .from("users")
      .select("id, dealership_id")
      .eq("auth_user_id", user.id)
      .single();

    if (!profile) return { vehicles: [], error: "Profile not found" };

    const { data: jackets, error: jacketsError } = await supabase
      .from("deal_jackets")
      .select(`
        id,
        jacket_number,
        sold_price,
        total_invested,
        profit_gross,
        commission_amount,
        date_sold,
        vehicle_id,
        customer_id,
        sales_rep_id,
        vehicles:vehicle_id (
          id, year, make, model, trim, stock_number, vin, acquisition_cost,
          asking_price, mileage, exterior_color, created_by
        ),
        customers:customer_id (
          id, name, phone
        )
      `)
      .eq("dealership_id", profile.dealership_id)
      .eq("sales_rep_id", profile.id)
      .eq("workflow_status", "approved")
      .is("deleted_at", null)
      .order("date_sold", { ascending: false });

    if (jacketsError) {
      return { vehicles: [], error: jacketsError.message };
    }

    const vehicles: ISalesRepSoldVehicle[] = (jackets ?? []).map((j: any) => {
      const vehicle = j.vehicles as any;
      const customer = j.customers as any;
      const invested = Number(j.total_invested ?? 0);
      const soldPrice = Number(j.sold_price ?? 0);

      return {
        id: j.vehicle_id as string,
        year: (vehicle?.year as number) ?? 0,
        make: (vehicle?.make as string) ?? "",
        model: (vehicle?.model as string) ?? "",
        trim: (vehicle?.trim as string) ?? undefined,
        stockNumber: (vehicle?.stock_number as string) ?? "",
        vehicleImageUrl: "",
        customerName: (customer?.name as string) ?? "",
        customerPhone: (customer?.phone as string) ?? "",
        soldDate: (j.date_sold as string) ?? "",
        soldPrice,
        cost: invested,
        grossProfit: Number(j.profit_gross ?? 0),
        commission: Number(j.commission_amount ?? 0),
        commissionRate:
          soldPrice > 0
            ? Math.round((Number(j.commission_amount ?? 0) / Math.max(soldPrice - invested, 1)) * 10000) / 100
            : 0,
        status: "completed" as const,
        dealJacketId: j.id as string,
      };
    });

    return { vehicles, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { vehicles: [], error: message };
  }
}
