import { NextRequest, NextResponse } from "next/server";
import {
  cpaAuthErrorResponse,
  requireCpaPortalAccess,
} from "@/lib/cpa/server/auth";
import { fetchCpaProfitVehiclesReport } from "@/lib/cpa/server/profit-vehicles-report/get-profit-vehicles-report";
import type { CpaViewMode } from "@/lib/cpa/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireCpaPortalAccess();
  if (!auth.ok) return cpaAuthErrorResponse(auth);

  const { searchParams } = request.nextUrl;
  const now = new Date();
  const month = Number(searchParams.get("month") ?? String(now.getMonth() + 1));
  const year = Number(searchParams.get("year") ?? String(now.getFullYear()));
  const view = (searchParams.get("view") ?? "monthly") as CpaViewMode;

  const data = await fetchCpaProfitVehiclesReport(auth.user.dealershipId, {
    view: view === "yearly" ? "yearly" : "monthly",
    month: Number.isFinite(month) ? month : now.getMonth() + 1,
    year: Number.isFinite(year) ? year : now.getFullYear(),
  });

  return NextResponse.json(data);
}
