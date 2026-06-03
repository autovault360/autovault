import { NextRequest, NextResponse } from "next/server";
import { fetchCpaDashboard } from "@/lib/cpa/server/get-dashboard";
import {
  cpaAuthErrorResponse,
  requireCpaPortalAccess,
} from "@/lib/cpa/server/auth";
import type { CpaViewMode } from "@/lib/cpa/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireCpaPortalAccess();
  if (!auth.ok) return cpaAuthErrorResponse(auth);

  const { searchParams } = request.nextUrl;
  const view = (searchParams.get("view") ?? "monthly") as CpaViewMode;
  const month = Number(searchParams.get("month") ?? "5");
  const year = Number(searchParams.get("year") ?? "2025");

  const data = await fetchCpaDashboard(auth.user.dealershipId, {
    view: view === "yearly" ? "yearly" : "monthly",
    month: Number.isFinite(month) ? month : 5,
    year: Number.isFinite(year) ? year : 2025,
  });

  return NextResponse.json(data);
}
