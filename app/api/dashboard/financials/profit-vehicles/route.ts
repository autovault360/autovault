import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/dashboard/server/auth-context";
import { buildVehiclesByProfitReport } from "@/lib/financials/vehicles-report/build-vehicles-report";
import type { CpaViewMode } from "@/lib/cpa/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const now = new Date();
  const month = Number(searchParams.get("month") ?? String(now.getMonth() + 1));
  const year = Number(searchParams.get("year") ?? String(now.getFullYear()));
  const view = (searchParams.get("view") ?? "monthly") as CpaViewMode;

  const data = await buildVehiclesByProfitReport(auth.dealershipId, {
    view: view === "yearly" ? "yearly" : "monthly",
    month: Number.isFinite(month) ? month : now.getMonth() + 1,
    year: Number.isFinite(year) ? year : now.getFullYear(),
  });

  return NextResponse.json(data);
}
